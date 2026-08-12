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
 * for tag labels. `createSlug` is imported straight from `src/components/Blog/utils/slug.js`
 * so a series' palette permalink is byte-for-byte the same slug `/series/:slug` resolves —
 * both a pure string function, safe to run in Node.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { loadPosts } from "../../scripts/lib/blog-corpus.mjs";
import { createSlug } from "../../src/components/Blog/utils/slug.js";
import SERIES_DATA from "../../src/data/series.js";

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

function buildArticles(posts) {
  return posts.map((post) => ({
    title: post.title,
    description: post.description,
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

function buildTags(posts) {
  const tagsYamlPath = path.join(__dirname, "../../blog/tags.yml");
  const tagLabels = yaml.load(readFileSync(tagsYamlPath, "utf8")) ?? {};
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
      label: tagLabels[key]?.label ?? key,
      permalink: `/blog/tags/${key}`,
      count,
    }));
}

function buildNavIndex() {
  const posts = loadPosts();

  return {
    generatedAt: new Date().toISOString(),
    articles: buildArticles(posts),
    series: buildSeries(posts),
    tags: buildTags(posts),
    pages: STATIC_PAGES,
    meta: {
      articleCount: posts.length,
    },
  };
}

export default function commandPalettePlugin() {
  return {
    name: "command-palette-plugin",

    async loadContent() {
      return buildNavIndex();
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
      ];
    },
  };
}
