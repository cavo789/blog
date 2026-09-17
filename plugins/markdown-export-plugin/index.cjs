/**
 * @fileoverview Docusaurus Plugin: markdown-export-plugin
 *
 * Purpose:
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

// Mirrors src/components/Blog/utils/slug.ts's createSlug() exactly. Duplicated
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

// Mirrors src/components/Blog/utils/posts.ts's permalink derivation exactly —
// same "why duplicated" rationale as createSlug above.
function permalinkFor(attributes, dir) {
  if (attributes.slug) {
    return attributes.slug.startsWith("/")
      ? attributes.slug
      : `/blog/${attributes.slug.replace(/^\//, "")}`;
  }
  return `/blog/${dir}/`;
}

/**
 * @param {string} siteDir
 * @param {string} [translationDir] when building a non-default locale, the matching
 *   `i18n/<locale>/docusaurus-plugin-content-blog` tree. Any article that has a file there is
 *   read FROM there, so the mirror and the llms.txt index carry the translated title,
 *   description and body. Without it, `/fr/blog/<slug>.md` served the English Markdown under a
 *   French URL and `/fr/llms.txt` advertised English titles — the content equivalent of the
 *   duplicate-content problem plugins/i18n-seo-guard solves for HTML. See TODO 0119.
 */
function loadPosts(siteDir, translationDir = null) {
  const blogDir = path.join(siteDir, BLOG_DIR);
  const posts = [];

  for (const file of findPosts(blogDir)) {
    let sourceFile = file;

    if (translationDir) {
      const relative = path.relative(blogDir, file);
      const translated = path.join(translationDir, relative);
      if (fs.existsSync(translated)) sourceFile = translated;
    }

    const raw = fs.readFileSync(sourceFile, "utf-8");
    const { attributes } = frontMatter(raw);

    // A Markdown file under blog/ without a title isn't an article (a
    // fragment, a note) — same rule posts.js applies.
    if (!attributes.title) continue;

    const dir = path.relative(blogDir, path.dirname(file)).split(path.sep).join("/");

    posts.push({
      file,
      raw,
      // Deliberately the ENGLISH article's folder, even when `raw` came from the translation:
      // `files/` and `images/` are co-located with the source, never duplicated under i18n/.
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

/**
 * Absolute URL for a site-relative path, honouring the locale's baseUrl.
 *
 * `siteConfig.url` is the bare origin and `siteConfig.baseUrl` carries the locale segment
 * (`/` for the default locale, `/fr/` for French). Concatenating `url + permalink` skips the
 * locale entirely, so the French llms.txt advertised English URLs for translated articles.
 * See TODO 0119.
 */
function absoluteUrl(siteConfig, sitePath) {
  const base = siteConfig.baseUrl.endsWith("/")
    ? siteConfig.baseUrl
    : `${siteConfig.baseUrl}/`;
  return `${siteConfig.url}${base}${String(sitePath).replace(/^\//, "")}`;
}

// YAML frontmatter dates (`date: 2024-02-23`) are auto-typed as JS Date
// objects by the YAML parser front-matter uses — string-concatenating one
// directly calls its verbose default toString(). Normalize to plain
// YYYY-MM-DD instead.
function formatDate(date) {
  if (!date) return "—";
  return date instanceof Date ? date.toISOString().slice(0, 10) : String(date);
}

// The comment carries the same info a human reader would otherwise lose once
// this file is copied or pasted elsewhere: where the rendered original lives
// (images, interactive components, the lot). Kept as an HTML comment — invisible
// in Markdown, so a reader pasting the file into a renderer isn't shown a stray
// metadata block, while it still reads as plain text in a raw view or in
// whatever an LLM is handed.
//
// Deliberately no build timestamp. One wall-clock value rewrote all 247 mirrors
// plus the 25 llms bundles on every single build (5.2 MB), which the deploy then
// had to re-upload even when no article had changed. The prose below already
// says the file is generated at build time, and `published` carries the date a
// reader actually needs.
function buildMetadataComment(post, siteConfig) {
  const url = absoluteUrl(siteConfig, post.permalink);
  return [
    "<!--",
    `  canonical-url: ${url}`,
    `  published:     ${formatDate(post.date)}`,
    "  This is a static plain-Markdown mirror generated at build time.",
    "  Visit the canonical URL above for the fully rendered page, with images and interactive components.",
    "-->",
    "",
  ].join("\n");
}

function buildHeader(post, siteConfig) {
  const lines = [buildMetadataComment(post, siteConfig), `# ${post.title}`, ""];
  if (post.description) {
    lines.push(`> ${post.description}`, "");
  }
  lines.push("---", "");
  return lines.join("\n");
}

function writeLlmsTxt(outDir, siteConfig, posts, seriesFiles) {
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
      `plus \`.md\` (e.g. \`${absoluteUrl(siteConfig, "/blog/<slug>.md")}\`).`,
    "",
  );

  // This is the only place the per-series bundles are ever linked from — without
  // it they exist on disk but are unreachable from anything an LLM would fetch.
  if (seriesFiles.length > 0) {
    lines.push(
      "## Series (full-text bundles)",
      "",
      "Each link is every article in that series, concatenated in reading order — " +
        "one request instead of many.",
      "",
    );
    for (const s of seriesFiles) {
      lines.push(
        `- [${s.name}](${absoluteUrl(siteConfig, `/llms/${s.slug}.txt`)}) — ${s.count} article(s)`,
      );
    }
    lines.push("");
  }

  for (const tag of [...byTag.keys()].sort()) {
    lines.push(`## ${tag}`, "");
    const sorted = [...byTag.get(tag)].sort((a, b) => a.title.localeCompare(b.title));
    for (const post of sorted) {
      const desc = post.description ? ` — ${post.description}` : "";
      lines.push(`- [${post.title}](${absoluteUrl(siteConfig, post.permalink)})${desc}`);
    }
    lines.push("");
  }

  fs.writeFileSync(path.join(outDir, "llms.txt"), lines.join("\n"), "utf-8");
}

// Returns the series that were actually written, sorted by name — this list is
// what lets writeLlmsTxt() link to them; without it they'd be orphaned on disk.
function writeSeriesFull(outDir, posts) {
  const bySeries = new Map();
  for (const post of posts) {
    if (!post.series) continue;
    if (!bySeries.has(post.series)) bySeries.set(post.series, []);
    bySeries.get(post.series).push(post);
  }
  if (bySeries.size === 0) return [];

  const seriesDir = path.join(outDir, "llms");
  fs.mkdirSync(seriesDir, { recursive: true });

  const written = [];
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
    const slug = createSlug(seriesName);
    fs.writeFileSync(path.join(seriesDir, `${slug}.txt`), chunks.join("\n"), "utf-8");
    written.push({ name: seriesName, slug, count: sorted.length });
  }
  return written.sort((a, b) => a.name.localeCompare(b.name));
}

module.exports = function markdownExportPlugin() {
  return {
    name: "markdown-export-plugin",

    async postBuild({ outDir, siteDir, siteConfig, routesPaths, i18n }) {
      const currentLocale = i18n?.currentLocale;
      const defaultLocale = i18n?.defaultLocale ?? siteConfig.i18n?.defaultLocale;
      const isTranslatedLocale = Boolean(
        currentLocale && currentLocale !== defaultLocale,
      );

      const posts = loadPosts(
        siteDir,
        isTranslatedLocale
          ? path.join(siteDir, "i18n", currentLocale, "docusaurus-plugin-content-blog")
          : null,
      );

      // In a non-default locale, mirror and index ONLY the articles really translated into it.
      // `loadPosts()` reads `blog/`, i.e. the English corpus, and Docusaurus's i18n fallback
      // gives every one of them a live `/fr/` route — so without this, `/fr/llms.txt` would
      // advertise 257 English articles as the French corpus, and `/fr/blog/<slug>.md` would
      // mirror English prose under a French URL. See TODO 0119.
      let localeFiltered = posts;

      if (isTranslatedLocale) {
        const {
          collectTranslations,
        } = require("../translations-manifest-plugin/index.cjs");
        const translated = new Set(collectTranslations(siteDir)[currentLocale] ?? []);
        // These post objects carry a `permalink`, not a `slug` — assuming the latter silently
        // filtered everything out (`translated.has(undefined)` is always false).
        localeFiltered = posts.filter((post) => {
          const match = String(post.permalink ?? "").match(/blog\/([^/]+)\/?$/);
          return match ? translated.has(match[1]) : false;
        });
        console.log(
          `[markdown-export] locale ${currentLocale}: ${localeFiltered.length} translated article(s).`,
        );
      }

      // Only mirror posts that actually got a live route — this is what makes
      // "draft" (excluded in prod by Docusaurus's own blog plugin) and
      // ".unpublished/" (outside blog/, never globbed here anyway) fall out
      // for free, without re-deriving Docusaurus's own draft rules.
      // `routesPaths` carries the locale's baseUrl (`/fr/blog/<slug>/`) while `permalinkFor()`
      // builds a bare `/blog/<slug>` — comparing them directly matched nothing under a
      // non-default locale, so every mirror silently disappeared while the build stayed green.
      // This is the mirror image of the bug in blog-feed-plugin's getArticleHtml(), where the
      // prefix was present twice instead of missing once. See TODO 0119.
      const baseUrl = siteConfig.baseUrl.endsWith("/")
        ? siteConfig.baseUrl
        : `${siteConfig.baseUrl}/`;
      const withBaseUrl = (permalink) =>
        `${baseUrl}${permalink.replace(/^\//, "")}`.replace(/\/$/, "");

      const liveRoutes = new Set(routesPaths.map((route) => route.replace(/\/$/, "")));
      const live = localeFiltered.filter((post) =>
        liveRoutes.has(withBaseUrl(post.permalink)),
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

      const seriesFiles = writeSeriesFull(outDir, indexable);
      writeLlmsTxt(outDir, siteConfig, indexable, seriesFiles);

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
