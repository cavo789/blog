/**
 * @fileoverview Docusaurus Plugin: markdown-export-plugin
 *
 * Purpose (TODO 0082):
 * Writes a plain-Markdown mirror of every published blog post next to its HTML
 * page (`/blog/<slug>` → `/blog/<slug>.md`), plus a site-wide `/llms.txt` index
 * and a per-series `/llms/<series-slug>.txt` bundle — so a reader (human or an
 * LLM) can fetch the article's full content without React, JSX, or the 107
 * `defaultOpen={false}` accordions this corpus collapses in the HTML.
 *
 * The actual MDX → Markdown degradation lives in ./degrade.cjs; this file only
 * orchestrates: find the posts that really shipped, degrade each one, write
 * the mirrors, then build the two kinds of index on top of what didn't fail.
 *
 * Usage:
 * - Add to docusaurus.config.js `plugins` array: `"./plugins/markdown-export-plugin/index.cjs"`
 * - Runs only in `postBuild` (i.e. only during `yarn build`, never `yarn start`),
 *   same as every other postBuild plugin in this repo.
 */

const fs = require("fs");
const path = require("path");
const frontMatter = require("front-matter");
const { mdxToMarkdown } = require("./degrade.cjs");

const BLOG_DIR = "blog";

/** Recursively collects every article file under a directory (mirrors the same
 * pattern used by scripts/internal-link-opportunities.mjs and blog-feed-plugin). */
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

// Mirrors src/components/Blog/utils/slug.js's createSlug() exactly. Duplicated
// rather than imported: that file is ESM written for Webpack/browser bundling
// (`export function`), which a plain Node `require()` here cannot load without
// a bundler. Keep both in sync if the slugify algorithm ever changes.
function createSlug(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strips diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Mirrors src/components/Blog/utils/posts.js's permalink derivation exactly —
// same "why duplicated" rationale as createSlug above.
function permalinkFor(attributes, dir) {
  if (attributes.slug) {
    return attributes.slug.startsWith("/")
      ? attributes.slug
      : `/blog/${attributes.slug.replace(/^\//, "")}`;
  }
  return `/blog/${dir}/`;
}

function loadPosts(siteDir) {
  const blogDir = path.join(siteDir, BLOG_DIR);
  const posts = [];

  for (const file of findPosts(blogDir)) {
    const raw = fs.readFileSync(file, "utf-8");
    const { attributes } = frontMatter(raw);

    // A Markdown file under blog/ without a title isn't an article (a
    // fragment, a note) — same rule posts.js applies.
    if (!attributes.title) continue;

    const dir = path.relative(blogDir, path.dirname(file)).split(path.sep).join("/");

    posts.push({
      file,
      raw,
      currentFileDir: path.dirname(file),
      permalink: permalinkFor(attributes, dir),
      title: attributes.title,
      description: attributes.description || "",
      date: attributes.date,
      mainTag: attributes.mainTag || null,
      series: attributes.series || null,
      draft: attributes.draft || false,
      unlisted: attributes.unlisted || false,
    });
  }

  return posts;
}

function buildHeader(post, siteConfig) {
  const url = `${siteConfig.url}${post.permalink}`;
  const lines = [`# ${post.title}`, ""];
  if (post.description) {
    lines.push(`> ${post.description}`, "");
  }
  lines.push(`*Originally published ${post.date || "—"} — ${url}*`, "", "---", "");
  return lines.join("\n");
}

function writeLlmsTxt(outDir, siteConfig, posts) {
  const byTag = new Map();
  for (const post of posts) {
    const tag = post.mainTag || "uncategorized";
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push(post);
  }

  const lines = [`# ${siteConfig.title}`, ""];
  if (siteConfig.tagline) lines.push(`> ${siteConfig.tagline}`, "");
  lines.push(
    `${posts.length} articles. Each has a plain-Markdown mirror at its own permalink ` +
      `plus \`.md\` (e.g. \`${siteConfig.url}/blog/<slug>.md\`).`,
    "",
  );

  for (const tag of [...byTag.keys()].sort()) {
    lines.push(`## ${tag}`, "");
    const sorted = [...byTag.get(tag)].sort((a, b) => a.title.localeCompare(b.title));
    for (const post of sorted) {
      const desc = post.description ? ` — ${post.description}` : "";
      lines.push(`- [${post.title}](${siteConfig.url}${post.permalink})${desc}`);
    }
    lines.push("");
  }

  fs.writeFileSync(path.join(outDir, "llms.txt"), lines.join("\n"), "utf-8");
}

function writeSeriesFull(outDir, posts) {
  const bySeries = new Map();
  for (const post of posts) {
    if (!post.series) continue;
    if (!bySeries.has(post.series)) bySeries.set(post.series, []);
    bySeries.get(post.series).push(post);
  }
  if (bySeries.size === 0) return;

  const seriesDir = path.join(outDir, "llms");
  fs.mkdirSync(seriesDir, { recursive: true });

  for (const [seriesName, seriesPosts] of bySeries) {
    const sorted = [...seriesPosts].sort((a, b) => new Date(a.date) - new Date(b.date));
    const chunks = [
      `# ${seriesName}`,
      "",
      `A series of ${sorted.length} article(s), in reading order.`,
      "",
    ];
    for (const post of sorted) {
      chunks.push(post.markdown, "", "---", "");
    }
    fs.writeFileSync(
      path.join(seriesDir, `${createSlug(seriesName)}.txt`),
      chunks.join("\n"),
      "utf-8",
    );
  }
}

module.exports = function markdownExportPlugin() {
  return {
    name: "markdown-export-plugin",

    async postBuild({ outDir, siteDir, siteConfig, routesPaths }) {
      const posts = loadPosts(siteDir);

      // Only mirror posts that actually got a live route — this is what makes
      // "draft" (excluded in prod by Docusaurus's own blog plugin) and
      // ".unpublished/" (outside blog/, never globbed here anyway) fall out
      // for free, without re-deriving Docusaurus's own draft rules.
      const liveRoutes = new Set(routesPaths.map((route) => route.replace(/\/$/, "")));
      const live = posts.filter((post) =>
        liveRoutes.has(post.permalink.replace(/\/$/, "")),
      );

      console.log(
        `[markdown-export] Mirroring ${live.length}/${posts.length} blog posts to Markdown…`,
      );

      const unknownAll = new Set();
      const indexable = [];
      let failed = 0;

      for (const post of live) {
        let markdown;
        try {
          const result = await mdxToMarkdown(post.raw, {
            currentFileDir: post.currentFileDir,
            projectRoot: siteDir,
          });
          markdown = buildHeader(post, siteConfig) + result.markdown;
          for (const name of result.unknownComponents) unknownAll.add(name);
        } catch (err) {
          // One broken article must never take the whole `yarn build` down —
          // the "one rule" in degrade.cjs already prevents almost every crash;
          // this is the last-resort net for whatever it doesn't catch.
          failed += 1;
          console.error(
            `[markdown-export] Failed to degrade ${post.file}: ${err.message}`,
          );
          continue;
        }

        const mirrorPath = path.join(outDir, `${post.permalink.replace(/\/$/, "")}.md`);
        fs.mkdirSync(path.dirname(mirrorPath), { recursive: true });
        fs.writeFileSync(mirrorPath, markdown, "utf-8");

        if (!post.draft && !post.unlisted) {
          indexable.push({ ...post, markdown });
        }
      }

      writeLlmsTxt(outDir, siteConfig, indexable);
      writeSeriesFull(outDir, indexable);

      if (unknownAll.size > 0) {
        console.warn(
          `[markdown-export] ${unknownAll.size} component(s) had no explicit degrade rule and fell back ` +
            `to the generic "keep children, drop wrapper" behavior — add a rule in ` +
            `plugins/markdown-export-plugin/degrade.cjs's COMPONENT_RULES if this is a real gap:\n` +
            [...unknownAll]
              .sort()
              .map((name) => `  - ${name}`)
              .join("\n"),
        );
      }

      console.log(
        `[markdown-export] Done — ${indexable.length} article(s) in /llms.txt, ` +
          `${live.length - failed}/${live.length} mirrored, ${failed} failed.`,
      );
    },
  };
};
