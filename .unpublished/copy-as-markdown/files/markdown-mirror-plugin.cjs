// plugins/markdown-mirror-plugin/index.cjs
//
// Writes a plain-Markdown mirror of every published blog post next to its
// HTML page: /blog/<slug>  ->  /blog/<slug>.md
//
// Runs only during `yarn build` (postBuild), never during `yarn start`.
const fs = require("fs");
const path = require("path");
const frontMatter = require("front-matter");

const BLOG_DIR = "blog";

function findPosts(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findPosts(target));
    } else if (entry.name === "index.md" || entry.name === "index.mdx") {
      found.push(target);
    }
  }
  return found;
}

module.exports = function markdownMirrorPlugin() {
  return {
    name: "markdown-mirror-plugin",
    async postBuild({ siteDir, outDir, routesPaths }) {
      const blogDir = path.join(siteDir, BLOG_DIR);
      const knownRoutes = new Set(routesPaths);
      let written = 0;

      for (const file of findPosts(blogDir)) {
        const raw = fs.readFileSync(file, "utf-8");
        const { attributes, body } = frontMatter(raw);

        if (!attributes.slug) continue;

        const permalink = `/blog/${attributes.slug}`;
        // Cross-checking against Docusaurus's own routesPaths is what makes
        // draft: true posts fall out for free — no need to duplicate that
        // logic here.
        if (!knownRoutes.has(permalink)) continue;

        const markdown = body.replace("<!-- truncate -->\n", "").trim() + "\n";
        const outFile = path.join(outDir, "blog", `${attributes.slug}.md`);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, markdown);
        written += 1;
      }

      console.log(`markdown-mirror-plugin: wrote ${written} .md mirrors`);
    },
  };
};
