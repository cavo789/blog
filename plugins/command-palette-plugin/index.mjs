/**
 * Docusaurus Plugin: command-palette-plugin
 *
 * Purpose (TODO 0084 — command palette):
 * Builds the static navigation index the `Ctrl+K`/`Cmd+K` command palette's default
 * (no-prefix) fuzzy mode and `#` tag-jump mode search over: every published article, every
 * series, every tag, and a handful of static site pages. Computed once at build (and on
 * every `yarn start` reload), then shipped via `usePluginData("command-palette-plugin")` —
 * same pattern as `blog-graph-plugin` and `questions-index-plugin`, no client-side fetch.
 *
 * Reuses `scripts/lib/blog-corpus.mjs` (see that file's own header on why script and plugin
 * share one corpus loader) for the article list, `src/data/series.js` for series colors, and
 * `blog/tags.yml` (via `js-yaml`, already a dependency — see `plugins/yaml-webpack-plugin`)
 * for tag labels. `createSlug` is duplicated below (see that function's own comment) rather
 * than imported, so a series' palette permalink is byte-for-byte the same slug `/series/:slug`
 * resolves.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadPosts } from "../../scripts/lib/blog-corpus.mjs";
import translationsManifest from "../translations-manifest-plugin/index.cjs";

const { collectTranslations, collectTranslatedFrontMatter } = translationsManifest;

/** The slug part of a post permalink — `/blog/my-post` -> `my-post`. */
function slugOf(post) {
  const match = String(post.permalink ?? "").match(/blog\/([^/]+)\/?$/);
  return match ? match[1] : "";
}
import SERIES_DATA from "../../src/data/series.js";

// Mirrors src/components/Blog/utils/slug.ts's createSlug() exactly. Duplicated rather than
// imported: that file is TypeScript (Blog/utils migrated to .ts in TODO 0106's level 5), and
// this plugin runs under plain Node ESM at build/dev time with no TS loader registered — same
// "can't cross into Webpack/TS-only code from plain Node" rationale as
// plugins/lib/blog-taxonomy.cjs and plugins/markdown-export-plugin/index.cjs already document
// for the same function. Keep all three in sync if the slugify algorithm ever changes.
function createSlug(text) {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Static site pages worth jumping to from the palette — mirrors the navbar's own items
// (`docusaurus.config.js`) plus `/faq`, which has no navbar entry of its own.
const STATIC_PAGES = [
  { title: "Blog — all posts", permalink: "/blog", keywords: "articles posts listing" },
  { title: "Series", permalink: "/series", keywords: "series collections" },
  { title: "Tags", permalink: "/blog/tags", keywords: "tags topics categories" },
  { title: "Map", permalink: "/map", keywords: "map graph knowledge network" },
  {
    title: "Repositories",
    permalink: "/repositories",
    keywords: "github repositories code",
  },
  { title: "Archive", permalink: "/blog/archive", keywords: "archive history all dates" },
  { title: "About me", permalink: "/about", keywords: "about author bio contact" },
  { title: "FAQ — ask my blog", permalink: "/faq", keywords: "faq questions ask search" },
];

/**
 * @param posts the corpus, already narrowed to this locale
 * @param localized slug -> localized front matter; empty on the default locale
 */
function buildArticles(posts, localized = {}) {
  return posts.map((post) => ({
    // What the reader types against and reads in the palette. `loadPosts()` reads `blog/`, the
    // English corpus, so filtering to the translated slugs is only half the job — without this
    // overlay the French palette listed four entries with English titles. Same defect, same
    // shape, as the one fixed in plugins/blog-graph-plugin.
    title: localized[slugOf(post)]?.title || post.title,
    description: localized[slugOf(post)]?.description || post.description,
    slug: post.slug,
    permalink: post.permalink,
    mainTag: post.mainTag,
    tags: post.tags,
    series: post.series,
    date: post.date,
    file: post.file,
  }));
}

function buildSeries(posts) {
  const colorByName = new Map(SERIES_DATA.map((series) => [series.name, series.color]));
  const countByName = new Map();

  for (const post of posts) {
    if (!post.series) continue;
    countByName.set(post.series, (countByName.get(post.series) ?? 0) + 1);
  }

  return [...countByName.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({
      name,
      permalink: `/series/${createSlug(name)}`,
      color: colorByName.get(name) ?? null,
      count,
    }));
}

/** Parse a tags.yml, or `{}` when the file does not exist (a locale may ship none). */
function readTagsYaml(filePath) {
  try {
    return yaml.load(readFileSync(filePath, "utf8")) ?? {};
  } catch {
    return {};
  }
}

/**
 * @param currentLocale the locale being built; its tags.yml overrides the English labels
 */
function buildTags(posts, currentLocale, defaultLocale) {
  const english = readTagsYaml(path.join(__dirname, "../../blog/tags.yml"));

  // The React side answers this same question through
  // `src/components/Blog/utils/tagsI18n.ts`, which cannot be imported here (TypeScript, and
  // this plugin runs under plain Node ESM — same reason `createSlug` is duplicated above).
  // The resolution order must stay identical: localized label, then English, then the raw key.
  const localized =
    currentLocale && currentLocale !== defaultLocale
      ? readTagsYaml(
          path.join(
            __dirname,
            `../../i18n/${currentLocale}/docusaurus-plugin-content-blog/tags.yml`,
          ),
        )
      : {};

  const countByKey = new Map();

  for (const post of posts) {
    for (const tag of post.tags) {
      countByKey.set(tag, (countByKey.get(tag) ?? 0) + 1);
    }
  }

  return [...countByKey.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, count]) => ({
      key,
      label: localized[key]?.label || english[key]?.label || key,
      permalink: `/blog/tags/${key}`,
      count,
    }));
}

function buildNavIndex({ siteDir, currentLocale, defaultLocale }) {
  let posts = loadPosts();

  /** slug -> localized front matter. Empty on the default locale, where the source IS the text. */
  let localized = {};

  // `loadPosts()` reads `blog/`, i.e. the English corpus. Docusaurus's i18n fallback gives every
  // English article a live `/fr/` route, so without this the French palette would offer 257
  // entries whose titles are English and whose pages open on English prose. See TODO 0119.
  if (currentLocale && currentLocale !== defaultLocale) {
    const translated = new Set(collectTranslations(siteDir)[currentLocale] ?? []);
    posts = posts.filter((post) => translated.has(slugOf(post)));
    localized = collectTranslatedFrontMatter(siteDir)[currentLocale] ?? {};
  }

  return {
    // No build timestamp: this index ships in the client bundle, and a
    // wall-clock value would change main.js's hash on every build (see the
    // same note in plugins/blog-graph-plugin).
    articles: buildArticles(posts, localized),
    series: buildSeries(posts),
    tags: buildTags(posts, currentLocale, defaultLocale),
    pages: STATIC_PAGES,
    meta: {
      articleCount: posts.length,
    },
  };
}

export default function commandPalettePlugin(context) {
  return {
    name: "command-palette-plugin",

    async loadContent() {
      return buildNavIndex({
        siteDir: context.siteDir,
        currentLocale: context.i18n?.currentLocale,
        defaultLocale: context.i18n?.defaultLocale,
      });
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },

    getPathsToWatch() {
      return [
        path.join(__dirname, "../../blog/**/index.{md,mdx}"),
        path.join(__dirname, "../../blog/tags.yml"),
        path.join(__dirname, "../../scripts/lib/blog-corpus.mjs"),
        path.join(__dirname, "../../src/data/series.js"),
        // The translated titles and tag labels this index now overlays.
        path.join(
          __dirname,
          "../../i18n/*/docusaurus-plugin-content-blog/**/index.{md,mdx}",
        ),
        path.join(__dirname, "../../i18n/*/docusaurus-plugin-content-blog/tags.yml"),
      ];
    },
  };
}
