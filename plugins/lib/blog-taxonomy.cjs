/**
 * @fileoverview Build-time taxonomy enumeration (TODO 0092)
 *
 * Lists the concrete tag and series slugs the corpus actually links to, so
 * `docusaurus-plugin-tag-route` and `docusaurus-plugin-series-route` can register one
 * real route per value instead of a single parameterized `/blog/tags/:tag` — a
 * parameterized route matches nothing as far as `handleBrokenLinks` is concerned, which
 * is why every tag and series link used to be reported as broken and why
 * `onBrokenLinks` had to be turned off site-wide.
 *
 * Shared by both plugins rather than duplicated in each: they enumerate from the same
 * corpus and must agree on the slug algorithm, or one of them silently re-introduces
 * the false positives this file exists to remove.
 *
 * Drafts are included on purpose — see `listSeriesSlugs()`.
 */

const fs = require("fs");
const path = require("path");
const frontMatter = require("front-matter");

const BLOG_DIR = "blog";

/** Recursively collects every article file under a directory (mirrors the same
 * pattern used by scripts/lib/blog-corpus.mjs and markdown-export-plugin). */
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
// a bundler. Keep both in sync if the slugify algorithm ever changes — a drift
// here means a route registered under a slug no links point at, which brings the
// false positives back.
function createSlug(text) {
  return String(text)
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strips diacritics
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Reads the frontmatter of every article under `blog/`, drafts included.
 *
 * @param {string} siteDir - Docusaurus site directory (absolute).
 * @returns {Array<object>} one frontmatter object per article.
 */
function loadFrontMatter(siteDir) {
  const attributes = [];

  for (const file of findPosts(path.join(siteDir, BLOG_DIR))) {
    const { attributes: data } = frontMatter(fs.readFileSync(file, "utf-8"));

    // A Markdown file under blog/ without a title isn't an article (a fragment,
    // a note) — same rule src/components/Blog/utils/posts.js applies.
    if (!data.title) continue;

    attributes.push(data);
  }

  return attributes;
}

/**
 * Every tag slug reachable from a `/blog/tags/<slug>` link.
 *
 * Covers both `tags` and `mainTag`: PostCard links the latter directly
 * (`/blog/tags/${createSlug(mainTag)}`), and a mainTag is not always repeated in
 * the post's `tags` list.
 *
 * @param {string} siteDir - Docusaurus site directory (absolute).
 * @returns {string[]} sorted, deduplicated tag slugs.
 */
function listTagSlugs(siteDir) {
  const slugs = new Set();

  for (const data of loadFrontMatter(siteDir)) {
    const tags = Array.isArray(data.tags) ? data.tags : [];

    for (const tag of [...tags, data.mainTag]) {
      if (!tag) continue;
      // A tag is normally a plain string key from blog/tags.yml; tolerate the
      // object form (`{label, permalink}`) the blog plugin also accepts.
      const value = typeof tag === "string" ? tag : tag.label;
      const slug = createSlug(value ?? "");
      if (slug) slugs.add(slug);
    }
  }

  return [...slugs].sort();
}

/**
 * Every series slug reachable from a `/series/<slug>` link.
 *
 * Drafts count: `generateSeriesList()` builds the /series cards with
 * `getBlogMetadata({ includeDrafts: true })`, so a series that only has drafts is
 * still linked from that page. Skipping drafts here would turn those links into
 * build-breaking "broken links" — and would 404 the author's own preview during
 * `yarn start`, where drafts are visible.
 *
 * @param {string} siteDir - Docusaurus site directory (absolute).
 * @returns {string[]} sorted, deduplicated series slugs.
 */
function listSeriesSlugs(siteDir) {
  const slugs = new Set();

  for (const data of loadFrontMatter(siteDir)) {
    if (!data.series) continue;
    const slug = createSlug(data.series);
    if (slug) slugs.add(slug);
  }

  return [...slugs].sort();
}

module.exports = { createSlug, listTagSlugs, listSeriesSlugs };
