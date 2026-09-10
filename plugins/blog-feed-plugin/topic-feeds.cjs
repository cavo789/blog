/**
 * @fileoverview Slicing the blog's posts into per-topic feeds.
 *
 * Extracted from index.js because these two functions are the whole of the
 * "which posts belong in which feed" question, are pure, and are the part worth
 * reading on its own. index.js keeps the serializing and the writing.
 */

// Shared with docusaurus-plugin-tag-route / -series-route. Reusing their slug
// algorithm is what guarantees /blog/tags/<slug>/rss.xml sits next to the page
// at /blog/tags/<slug> — a private copy here would drift and strand the feeds.
const { createSlug } = require("../lib/blog-taxonomy.cjs");

// --- Grouping ----------------------------------------------------------------

/**
 * Group feed items by tag slug.
 *
 * `mainTag` is folded in alongside `tags` for the same reason
 * `blog-taxonomy.listTagSlugs()` does it: `PostCard` links `/blog/tags/<mainTag>`
 * directly, and a mainTag is not always repeated in the post's `tags` list. The
 * per-post `seen` set matters — when it *is* repeated, the post would otherwise
 * be added to its own tag's feed twice.
 *
 * @param {Array<object>} items - published feed items, newest first.
 * @returns {Map<string, {slug: string, label: string, items: Array<object>}>}
 */
function groupItemsByTag(items) {
  const groups = new Map();

  for (const item of items) {
    const { frontMatter: fm } = item;
    const declared = Array.isArray(fm.tags) ? fm.tags : fm.tags ? [fm.tags] : [];
    const seen = new Set();

    for (const tag of [...declared, fm.mainTag]) {
      if (!tag) continue;
      // A tag is normally a plain string key from blog/tags.yml; tolerate the
      // object form (`{label, permalink}`) the blog plugin also accepts.
      const value = typeof tag === "string" ? tag : tag.label;
      const slug = createSlug(value ?? "");
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);

      if (!groups.has(slug)) {
        groups.set(slug, { slug, label: String(value), items: [] });
      }
      groups.get(slug).items.push(item);
    }
  }

  return groups;
}

/**
 * Group feed items by series slug.
 *
 * `series:` is free text in the front matter (`series: WinSCP & remote file
 * transfer`); the slug only exists because `createSlug()` computes it, which is
 * exactly what `docusaurus-plugin-series-route` does to register `/series/<slug>`.
 * Reusing the shared helper is what keeps the feed URL reachable from its page.
 *
 * @param {Array<object>} items - published feed items, newest first.
 * @returns {Map<string, {slug: string, label: string, items: Array<object>}>}
 */
function groupItemsBySeries(items) {
  const groups = new Map();

  for (const item of items) {
    const { series } = item.frontMatter;
    if (!series) continue;

    const slug = createSlug(series);
    if (!slug) continue;

    if (!groups.has(slug)) {
      groups.set(slug, { slug, label: String(series), items: [] });
    }
    groups.get(slug).items.push(item);
  }

  return groups;
}

module.exports = { groupItemsByTag, groupItemsBySeries };
