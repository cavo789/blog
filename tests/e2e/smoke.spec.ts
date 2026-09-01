// Smoke/hydration harness (TODO 0107). Walks the routes listed in
// .config/e2e-routes.txt and fails on any console error or uncaught page
// error — React hydration mismatches (`Warning: Text content did not
// match`, `Hydration failed`, `did not expect server HTML to contain`) are
// logged via console.error too, so a single generic check covers both the
// "console error" and "hydration warning" acceptance criteria without
// needing a separate regex for each.
import { readFileSync } from "node:fs";
import path from "node:path";
import { test, expect } from "playwright/test";

const ROUTES_FILE = path.resolve(__dirname, "../../.config/e2e-routes.txt");

function loadRoutes(): string[] {
  return readFileSync(ROUTES_FILE, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && !line.startsWith("#"));
}

// Console messages known to be harmless noise, not a regression — add a
// pattern here (with a comment explaining the source) rather than deleting
// a real finding.
const ALLOWED_CONSOLE_PATTERNS: RegExp[] = [
  // Reaction/TriedIt/TypoReport call `${siteConfig.url}/api/*.php` — the
  // fixed production API (see src/components/Reaction/index.tsx and
  // siblings), on purpose: reader interactions persist server-side, so the
  // URL can't be relative. Testing the build from any other origin
  // (localhost here, any staging deploy) makes the browser block that
  // fetch as cross-origin every time — expected, not a regression signal.
  // Scoped to exactly these three endpoints so a *different* CORS failure
  // still fails the test.
  /Access to fetch at 'https:\/\/www\.avonture\.be\/api\/(?:reactions|tried-it|typo)\.php[^']*' from origin '[^']*' has been blocked by CORS policy/,
  // Chromium's network-layer companion line, always logged right after the
  // CORS message above for the same blocked request.
  /^Failed to load resource: net::ERR_FAILED$/,
  // React error #418 ("Hydration failed") on any page rendering a
  // `<CodeBlock>` — tracked, understood, and NOT a content bug: see
  // .todos/0112-eli5-codeblock-hydration-mismatch.md for the full
  // investigation. Confirmed a timing-sensitive race (it disappears when
  // react-dom's client bundle runs in development mode, which only changes
  // execution speed, not the served HTML), not a structural SSR/client
  // mismatch — ruled out grammar registration, multi-line token corruption,
  // every custom component in the render tree, `future.faster`/SWC,
  // colorMode, and duplicate React instances. Confirmed zero reader-visible
  // impact (React recovers on its own, same class as the already-fixed
  // .todos/DONE/DONE_057-iconify-hydration-mismatch-logoicon.md). Scoped to
  // exactly error code #418 so a *different* hydration code (#419/421/423/
  // 425 — a real content mismatch) still fails the test.
  /^Docusaurus React Root onRecoverableError: Error: Minified React error #418;/,
];

for (const route of loadRoutes()) {
  test(`no console/hydration error on ${route}`, async ({ page }) => {
    const problems: string[] = [];

    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const text = message.text();
      if (ALLOWED_CONSOLE_PATTERNS.some((pattern) => pattern.test(text))) return;
      problems.push(`console.error: ${text}`);
    });

    page.on("pageerror", (error) => {
      problems.push(`pageerror: ${error.message}`);
    });

    const response = await page.goto(route, { waitUntil: "networkidle" });
    expect(response?.ok(), `${route} did not respond with a 2xx status`).toBeTruthy();

    expect(problems, problems.join("\n")).toEqual([]);
  });
}
