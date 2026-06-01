// Scans blog posts for draft/unlisted articles and writes
// admin-data/drafts.json to the build output for the admin page to fetch.

const fs   = require("fs-extra");
const path = require("path");
const glob = require("glob");
const fm   = require("front-matter");

module.exports = function adminDataPlugin(context) {
  return {
    name: "admin-data-plugin",

    async postBuild({ outDir }) {
      const blogDir = path.join(context.siteDir, "blog");
      const files   = glob.sync("**/*.{md,mdx}", { cwd: blogDir });
      const drafts  = [];

      for (const file of files) {
        const raw        = fs.readFileSync(path.join(blogDir, file), "utf8");
        const { attributes: a } = fm(raw);

        if (a.draft !== true && a.unlisted !== true) continue;

        drafts.push({
          slug:        a.slug  || path.dirname(file).replace(/\\/g, "/"),
          title:       a.title || "(untitled)",
          date:        a.date  ? String(a.date).slice(0, 10) : null,
          description: a.description || null,
          tags:        Array.isArray(a.tags) ? a.tags : [],
          status:      a.draft === true ? "draft" : "unlisted",
        });
      }

      drafts.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

      const outputDir = path.join(outDir, "admin-data");
      fs.ensureDirSync(outputDir);
      fs.writeJsonSync(path.join(outputDir, "drafts.json"), drafts, { spaces: 2 });

      console.log(`[admin-data-plugin] ${drafts.length} draft/unlisted post(s) indexed.`);
    },
  };
};
