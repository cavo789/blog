/**
 * @fileoverview Docusaurus Plugin: questions-index-plugin
 *
 * Purpose (TODO 0083 — "Ask my blog"):
 * Aggregates every article's `<article>.questions.json` sidecar (see
 * scripts/generate-questions.mjs) into one corpus-wide, build-time question index — roughly
 * 8-12 "how would a developer search for this" questions per article, each pointing at
 * (article permalink, heading anchor).
 *
 * The corpus is heavy at scale (2000+ questions once the whole blog is covered) and has three
 * different consumers with three different performance needs, so it's shaped three ways
 * rather than shipped once as one blob:
 *
 * 1. `themes` (tiny — a few dozen rows) via `setGlobalData`, for the `/faq` hub's
 *    table-of-contents. Cheap enough to embed globally like any other small plugin data.
 * 2. One route per theme (`/faq/<theme>`, via `addRoute` + `createData`), each carrying only
 *    that theme's slice. Docusaurus code-splits per route automatically, so this is
 *    server-rendered, crawlable HTML without any one page paying for the whole corpus.
 * 3. The full corpus as a plain static JSON asset (`/questions-index.json`, written straight
 *    to disk and served via `staticDirectories`, see docusaurus.config.js), for
 *    `AskMyBlog`/`CommandPalette`'s cross-theme search. Deliberately NOT exposed via
 *    `setGlobalData`: that component tree is mounted on every page (`src/theme/Layout`), so a
 *    `usePluginData` reference — even an unused one — would have gotten the whole ~470 KB
 *    corpus bundled into every page's JS. A plain `fetch()` (same bridge pattern
 *    `CommandPalette/utils.ts` already uses for Pagefind) keeps that cost opt-in: only a
 *    reader who actually opens the search box pays for it, once, cached after that.
 *
 * An article with no `.questions.json` yet (not generated) simply contributes nothing — the
 * index degrades gracefully rather than erroring, so this plugin can ship before the corpus
 * is fully processed (mirrors the "activation progressive" idea in TODO 0084).
 *
 * Locales (TODO 0120): under a non-default locale the corpus is read from
 * `i18n/<locale>/docusaurus-plugin-content-blog/` — the translated articles and the question
 * sidecars generated from them (`yarn questions --locale fr`). There is deliberately NO fallback
 * to the English sidecars: a French reader types a French query, and an English index cannot
 * answer it. An untranslated article therefore contributes nothing under `/fr/`.
 */

const fs = require("fs");
const path = require("path");
const { normalizeUrl } = require("@docusaurus/utils");
const frontMatter = require("front-matter");
const yaml = require("js-yaml");

const BLOG_DIR = "blog";
const I18N_BLOG_DIR = "docusaurus-plugin-content-blog";
const GENERATED_DIR_NAME = "questions-index-plugin";
// Public path (under the site's baseUrl) the client fetches for the full corpus — kept in
// sync with the `staticDirectories` entry in docusaurus.config.js pointing at this plugin's
// generated static folder.
const SEARCH_INDEX_FILENAME = "questions-index.json";

// Mirrors plugins/markdown-export-plugin/index.cjs's findPosts()/permalinkFor() — duplicated
// rather than imported from scripts/lib/blog-corpus.mjs, which is ESM and cannot be loaded by
// a plain CJS require() here (same rationale as that file's own comment on the topic).
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

// Deliberately NOT prefixed with the locale's baseUrl: every consumer navigates through
// `<Link to>` (or `withBaseUrl` in the command palette), which adds `/fr/` itself. Prefixing
// here would produce `/fr/fr/blog/…`. A translation copies `slug` byte for byte, so the same
// function serves both locales. See .claude/rules/i18n-locale-safety.md.
function permalinkFor(attributes, dir) {
  if (attributes.slug) {
    return attributes.slug.startsWith("/")
      ? attributes.slug
      : `/blog/${attributes.slug.replace(/^\//, "")}`;
  }
  return `/blog/${dir}/`;
}

// Accents are folded before the ASCII filter: without it, "créer" became "cr er" and two
// different French questions could collapse into the same key.
function normalizeForDedupe(question) {
  return question
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

/**
 * Drops any question whose normalized text collides with another article's — see the TODO's
 * Risk section ("si 40 articles génèrent 'How do I install Docker?', l'index est cassé").
 * Every colliding instance is dropped, including the first: a question that isn't specific to
 * exactly one article failed the generation prompt's own "specific to this article" rule, so
 * keeping one copy would still ship a too-generic entry.
 */
function dedupeAcrossCorpus(entries) {
  const counts = new Map();
  for (const entry of entries) {
    const key = normalizeForDedupe(entry.question);
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  const kept = entries.filter(
    (entry) => counts.get(normalizeForDedupe(entry.question)) === 1,
  );
  return { kept, droppedCount: entries.length - kept.length };
}

/**
 * The directory the corpus is read from: `blog/` on the default locale, the translated tree
 * otherwise. The sidecars live next to the article they were generated from, so the same walk
 * finds both.
 */
function corpusDirFor(siteDir, i18n) {
  return i18n.currentLocale === i18n.defaultLocale
    ? path.join(siteDir, BLOG_DIR)
    : path.join(siteDir, "i18n", i18n.currentLocale, I18N_BLOG_DIR);
}

function collectEntries(blogDir, siteDir) {
  if (!fs.existsSync(blogDir)) return { entries: [], articlesWithQuestions: 0 };

  const entries = [];
  let articlesWithQuestions = 0;

  for (const file of findPosts(blogDir)) {
    const raw = fs.readFileSync(file, "utf-8");
    const { attributes } = frontMatter(raw);

    if (!attributes.title || attributes.draft === true || attributes.draft === "true")
      continue;

    const sidecarPath = `${file}.questions.json`;
    if (!fs.existsSync(sidecarPath)) continue;

    let sidecar;
    try {
      sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
    } catch {
      console.warn(
        `⚠  questions-index-plugin: unreadable sidecar, skipped — ${path.relative(siteDir, sidecarPath)}`,
      );
      continue;
    }

    if (!Array.isArray(sidecar.questions) || sidecar.questions.length === 0) continue;

    const dir = path.relative(blogDir, path.dirname(file)).split(path.sep).join("/");
    const permalink = permalinkFor(attributes, dir);
    articlesWithQuestions += 1;

    for (const q of sidecar.questions) {
      if (!q || typeof q.question !== "string" || !q.question.trim()) continue;
      entries.push({
        question: q.question.trim(),
        anchor: typeof q.anchor === "string" ? q.anchor : "",
        permalink,
        title: attributes.title,
        mainTag: attributes.mainTag || null,
      });
    }
  }

  const { kept, droppedCount } = dedupeAcrossCorpus(entries);
  if (droppedCount > 0) {
    console.log(
      `questions-index-plugin: dropped ${droppedCount} cross-article duplicate question(s).`,
    );
  }

  return { entries: kept, articlesWithQuestions };
}

function readTags(tagsYamlPath) {
  try {
    return yaml.load(fs.readFileSync(tagsYamlPath, "utf-8")) ?? {};
  } catch {
    return {};
  }
}

/**
 * Tag labels for the theme headings. The localized `tags.yml` is the one Docusaurus already
 * renders `/fr/blog/tags/` from (same source as `src/components/Blog/utils/tagsI18n.ts`); the
 * English file fills any key it lacks.
 */
function loadTagLabels(siteDir, blogDir) {
  const english = readTags(path.join(siteDir, BLOG_DIR, "tags.yml"));
  const localized = readTags(path.join(blogDir, "tags.yml"));
  return { ...english, ...localized };
}

/** Groups entries by mainTag, sorted alphabetically by display label — same grouping the
 * `/faq` hub and each `/faq/<theme>` page render. */
// The one theme label that does not come from `tags.yml` (articles with no `mainTag`).
const OTHER_LABEL = { en: "Other", fr: "Autres" };

function buildThemes(entries, tagLabels, locale) {
  const groups = new Map();

  for (const entry of entries) {
    const key = entry.mainTag || "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(entry);
  }

  return [...groups.entries()]
    .map(([key, items]) => ({
      key,
      label:
        key === "other"
          ? (OTHER_LABEL[locale] ?? OTHER_LABEL.en)
          : (tagLabels[key]?.label ?? key),
      items: [...items].sort((a, b) => a.question.localeCompare(b.question)),
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function buildIndex(siteDir, i18n) {
  const blogDir = corpusDirFor(siteDir, i18n);
  const { entries, articlesWithQuestions } = collectEntries(blogDir, siteDir);
  const tagLabels = loadTagLabels(siteDir, blogDir);
  const themes = buildThemes(entries, tagLabels, i18n.currentLocale);

  return {
    // No build timestamp: this index ships in the client bundle and in
    // build/questions-index.json, and a wall-clock value would change
    // main.js's hash on every build (see plugins/blog-graph-plugin).
    entries,
    themes,
    meta: {
      articleCount: articlesWithQuestions,
      questionCount: entries.length,
    },
  };
}

module.exports = function questionsIndexPlugin(context) {
  const { siteDir, generatedFilesDir } = context;

  return {
    name: "questions-index-plugin",

    async loadContent() {
      return buildIndex(siteDir, context.i18n);
    },

    async contentLoaded({ content, actions }) {
      const { entries, themes, meta } = content;

      // 3. Full corpus, as a plain static asset — see the file header for why this is
      // deliberately NOT setGlobalData(). Written directly to disk (not via createData, which
      // produces a webpack-bundled module) so it's a plain HTTP resource the client fetches
      // on demand; served via the `staticDirectories` entry in docusaurus.config.js.
      const staticDir = path.join(generatedFilesDir, GENERATED_DIR_NAME, "static");
      fs.mkdirSync(staticDir, { recursive: true });
      fs.writeFileSync(
        path.join(staticDir, SEARCH_INDEX_FILENAME),
        JSON.stringify(entries),
      );

      // 2. One route per theme, each carrying only its own slice — code-split per route by
      // Docusaurus, so no page other than that theme's own pays for the others' questions.
      for (const theme of themes) {
        const dataPath = await actions.createData(
          `${theme.key}.json`,
          JSON.stringify(theme),
        );
        await actions.addRoute({
          // Through `baseUrl` — see docusaurus-plugin-tag-route. Hardcoding the path leaves
          // the route unreachable under a non-default locale.
          path: normalizeUrl([context.baseUrl, "faq", theme.key]),
          component: "@site/src/components/FaqThemePage",
          modules: { theme: dataPath },
          exact: true,
        });
      }

      // 1. Small summary for the `/faq` hub's table of contents — cheap enough to embed
      // globally like any other small plugin data.
      actions.setGlobalData({
        meta,
        themes: themes.map((theme) => ({
          key: theme.key,
          label: theme.label,
          permalink: `/faq/${theme.key}`,
          count: theme.items.length,
        })),
      });
    },

    getPathsToWatch() {
      // Rebuild the index in `yarn start` whenever an article or its question sidecar changes.
      return [
        path.join(siteDir, "blog/**/index.{md,mdx}"),
        path.join(siteDir, "blog/**/*.questions.json"),
        path.join(siteDir, "blog/tags.yml"),
        path.join(siteDir, `i18n/*/${I18N_BLOG_DIR}/**/index.{md,mdx}`),
        path.join(siteDir, `i18n/*/${I18N_BLOG_DIR}/**/*.questions.json`),
        path.join(siteDir, `i18n/*/${I18N_BLOG_DIR}/tags.yml`),
      ];
    },
  };
};
