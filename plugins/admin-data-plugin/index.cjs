// Scans blog posts for draft/unlisted articles and writes admin-data/drafts.json
// for the admin page to fetch.
//
// Two write paths, because `postBuild` only ever fires for `yarn build`, never for
// `yarn start` (same as every other postBuild plugin in this repo — see
// markdown-export-plugin's header). The admin page is a local-dev tool first
// (TODO 0094): without a dev-mode path, `/admin-data/drafts.json` simply doesn't
// exist under `yarn start`, and the fetch falls through to Docusaurus's dev-server
// history fallback, which returns `index.html` — the "Unexpected token '<'" error.
// `loadContent()` runs on every `yarn start` reload and once for `yarn build`, so it
// writes straight into `static/admin-data/`, which the dev server serves as-is;
// `postBuild` still writes into the real build output for a from-scratch `yarn build`
// that never went through `yarn start` (e.g. CI), overwriting whatever `static/`
// copied in first.

const fs = require("fs-extra");
const path = require("path");
const glob = require("glob");
const fm = require("front-matter");

/**
 * Normalizes a front matter date to a `YYYY-MM-DD` string.
 *
 * @param {Date|string} value Whatever the YAML parser produced.
 * @returns {string|null} The day part, or null when unparsable.
 */
function toIsoDay(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

/**
 * Scans `blog/` for draft/unlisted articles and returns the admin panel's payload.
 *
 * @param {string} siteDir Repo root, as passed to every plugin lifecycle hook.
 * @returns {Array<object>} One entry per draft/unlisted post, newest first.
 */
function scanDrafts(siteDir) {
  const blogDir = path.join(siteDir, "blog");
  const files = glob.sync("**/*.{md,mdx}", { cwd: blogDir });
  const drafts = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(blogDir, file), "utf8");
    const { attributes: a } = fm(raw);

    if (a.draft !== true && a.unlisted !== true) continue;

    drafts.push({
      slug: a.slug || path.dirname(file).replace(/\\/g, "/"),
      title: a.title || "(untitled)",
      // YAML turns `date: 2026-08-17` into a Date; String() would then give
      // "Mon Aug 17 2026 …" and slicing it yields "Mon Aug 17".
      date: a.date ? toIsoDay(a.date) : null,
      description: a.description || null,
      tags: Array.isArray(a.tags) ? a.tags : [],
      status: a.draft === true ? "draft" : "unlisted",
    });
  }

  drafts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  return drafts;
}

module.exports = function adminDataPlugin(context) {
  return {
    name: "admin-data-plugin",

    async loadContent() {
      const drafts = scanDrafts(context.siteDir);

      // Only `yarn start` needs this: `yarn build` writes the real build output
      // itself in `postBuild`, below, and must not leave a stray file in `static/`
      // for a later, unrelated build to pick up.
      if (process.env.NODE_ENV !== "production") {
        const outputDir = path.join(context.siteDir, "static", "admin-data");
        fs.ensureDirSync(outputDir);
        fs.writeJsonSync(path.join(outputDir, "drafts.json"), drafts, { spaces: 2 });
      }

      return drafts;
    },

    getPathsToWatch() {
      return [path.join(context.siteDir, "blog/**/*.{md,mdx}")];
    },

    async postBuild({ outDir }) {
      const drafts = scanDrafts(context.siteDir);

      const outputDir = path.join(outDir, "admin-data");
      fs.ensureDirSync(outputDir);
      fs.writeJsonSync(path.join(outputDir, "drafts.json"), drafts, { spaces: 2 });

      console.log(`[admin-data-plugin] ${drafts.length} draft/unlisted post(s) indexed.`);
    },
  };
};
