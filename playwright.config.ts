// Playwright smoke/hydration harness (TODO 0107) — runs against the *static
// build*, never the dev server. Port 3002, not 3000/3001: 3000 is the
// devcontainer's always-on dev server (see CLAUDE.md — never touch it) and
// 3001 is `static`'s own preview server (.devcontainer/scripts/interactive.sh)
// — using a third port means `run_ci e2e` never fights either for the port,
// and never accidentally tests against a `static` preview that may be stale.
import { defineConfig, devices } from "playwright/test";

const PORT = 3002;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  // No `yarn build` here on purpose: `run_ci e2e` (and the CI job) build once
  // and reuse that same `build/` — a webServer-triggered rebuild would either
  // duplicate that work or silently test a different build than the one
  // `run_ci build`/`yarn build` just produced.
  webServer: {
    command: `yarn serve --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
