# syntax=docker/dockerfile:1

# An accessibility checker in a box: real Chromium + axe-core.
# Usage: docker run --rm [-e SCHEME=dark] a11y-check <url> [<url>...]
FROM mcr.microsoft.com/playwright:v1.65.0-noble

WORKDIR /check
RUN npm init -y >/dev/null && npm install --omit=dev playwright@1.65.0 @axe-core/playwright@4.14.0

COPY <<'JS' check.mjs
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const urls = process.argv.slice(2);
const browser = await chromium.launch();
let total = 0;

for (const url of urls) {
  const context = await browser.newContext({
    ignoreHTTPSErrors: true,
    colorScheme: process.env.SCHEME ?? "light",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "networkidle" });
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  console.log(`\n${url}\n${violations.length} kinds of problems`);
  for (const v of violations) {
    console.log(`\n[${v.impact}] ${v.id} (${v.nodes.length}x): ${v.help}`);
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`    ${node.target.join(" ")}`);
    }
  }
  total += violations.length;
  await context.close();
}

await browser.close();
process.exit(total > 0 ? 1 : 0);
JS

ENTRYPOINT ["node", "/check/check.mjs"]
