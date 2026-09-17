/**
 * @fileoverview
 * Docusaurus Plugin — translations-manifest-plugin
 *
 * Single source of truth for "does this article have a real French translation?".
 *
 * Every other piece of the i18n work needs that answer, and none of them may guess it:
 *
 *   - the SEO guard (noindex + canonical + sitemap exclusion) on untranslated `/fr/` pages;
 *   - the `<TranslationNotice>` banner and the `<TranslationSwitch>` flag;
 *   - the ~12 listing surfaces that must hide untranslated articles in the `fr` locale.
 *
 * Deliberately a plugin exposing `setGlobalData()` rather than a generated `.js` file (the
 * `scripts/generate-post-colors.mjs` pattern): the set of translations changes every time an
 * article is translated, and a generated file would need a manual regeneration step that
 * someone will forget. Scanning at `loadContent()` keeps it correct in `yarn start` too.
 *
 * Docusaurus's own i18n fallback is what makes this necessary: a missing translation silently
 * serves the English source under the French URL, so "the route exists" proves nothing.
 *
 * See TODO 0119.
 */

const fs = require("fs");
const path = require("path");
const frontMatter = require("front-matter");
// Docusaurus's own reading-time formula (Intl.Segmenter word count, 200 wpm), so a French card
// and the French article's own header can never disagree about the same file.
const {
  calculateReadingTime,
} = require("@docusaurus/plugin-content-blog/lib/readingTime.js");

const I18N_DIR = "i18n";
const BLOG_PLUGIN_DIR = "docusaurus-plugin-content-blog";

/** Recursively collects every article file under a directory. */
function findArticles(directory) {
  if (!fs.existsSync(directory)) return [];

  const found = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      found.push(...findArticles(target));
    } else if (entry.name === "index.md" || entry.name === "index.mdx") {
      found.push(target);
    }
  }
  return found;
}

/**
 * The article's slug plus the two front-matter fields a translation actually localizes.
 *
 * The slug is what every consumer keys on. Taken from front matter when present — the blog
 * authoring convention here always sets it — and derived from the folder name otherwise,
 * mirroring Docusaurus's own fallback.
 */
function articleMetaFor(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const { attributes } = frontMatter(raw);

  const declared =
    typeof attributes.slug === "string" && attributes.slug.trim()
      ? attributes.slug.trim().replace(/^\/+|\/+$/g, "")
      : path.basename(path.dirname(filePath));

  return {
    slug: declared,
    title: typeof attributes.title === "string" ? attributes.title : "",
    description: typeof attributes.description === "string" ? attributes.description : "",
  };
}

function slugFor(filePath) {
  return articleMetaFor(filePath).slug;
}

/**
 * @returns {Record<string, string[]>} locale -> sorted list of translated article slugs.
 *   Exported so the postBuild SEO guard can reuse it without a second implementation.
 */
function collectTranslations(siteDir) {
  const i18nRoot = path.join(siteDir, I18N_DIR);
  if (!fs.existsSync(i18nRoot)) return {};

  const byLocale = {};
  for (const entry of fs.readdirSync(i18nRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const blogDir = path.join(i18nRoot, entry.name, BLOG_PLUGIN_DIR);
    const slugs = findArticles(blogDir).map(slugFor).sort();
    if (slugs.length > 0) byLocale[entry.name] = slugs;
  }
  return byLocale;
}

/**
 * The localized front matter of every translated article, keyed by locale then slug.
 *
 * `collectTranslations()` answers "which articles are translated?"; this answers "what do they
 * say?". Both questions are needed, and answering only the first is what put English titles on
 * the French map: build-time plugins (`blog-graph-plugin`, `command-palette-plugin`) read
 * `blog/` — the English corpus — so narrowing their entries down to the translated slugs still
 * leaves every label in English.
 *
 * Only `title` and `description` are localized. A translation copies `slug`, `series`, `tags`
 * and `date` byte for byte, because translating a `slug` breaks the URL and translating a
 * `series` orphans the article (see the translation contract in TODO 0119).
 *
 * The React-side counterpart is `TRANSLATED_FRONT_MATTER` in
 * `src/components/Blog/utils/posts.ts`. It cannot be reused here: it is built from a webpack
 * `require.context`, which does not exist in a plugin's Node-side `loadContent()`.
 *
 * @returns {Record<string, Record<string, {title: string, description: string}>>}
 *   locale -> slug -> localized fields. Articles with no `title` are skipped: there is nothing
 *   to overlay, and a blank label is worse than the English one.
 */
function collectTranslatedFrontMatter(siteDir) {
  const i18nRoot = path.join(siteDir, I18N_DIR);
  if (!fs.existsSync(i18nRoot)) return {};

  const byLocale = {};
  for (const entry of fs.readdirSync(i18nRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;

    const bySlug = {};
    for (const filePath of findArticles(
      path.join(i18nRoot, entry.name, BLOG_PLUGIN_DIR),
    )) {
      const { slug, title, description } = articleMetaFor(filePath);
      if (title) bySlug[slug] = { title, description };
    }
    if (Object.keys(bySlug).length > 0) byLocale[entry.name] = bySlug;
  }
  return byLocale;
}

/**
 * slug -> reading time in minutes, for the articles translated into `locale`.
 *
 * The French blog listing is rebuilt from `useBlogMetadata()` rather than from Docusaurus's own
 * page items (those include every untranslated English fallback), and that metadata carries no
 * reading time — so every French card showed a date and nothing else, while all 369 English
 * listing cards showed "N min read". Measured on the TRANSLATED file, not the English source:
 * French runs longer, and the card must agree with the article header, which Docusaurus computes
 * from the French file too.
 *
 * @returns {Record<string, number>} empty on the default locale, where Docusaurus already
 *   supplies the value.
 */
function collectReadingTimes(siteDir, locale) {
  const bySlug = {};
  const root = path.join(siteDir, I18N_DIR, locale, BLOG_PLUGIN_DIR);
  for (const filePath of findArticles(root)) {
    const { attributes, body } = frontMatter(fs.readFileSync(filePath, "utf-8"));
    const { slug } = articleMetaFor(filePath);
    if (attributes.draft === true) continue;
    bySlug[slug] = calculateReadingTime(body, locale);
  }
  return bySlug;
}

module.exports = function translationsManifestPlugin(context) {
  return {
    name: "translations-manifest-plugin",

    // Without this, translating an article during `yarn start` would not show up until the
    // dev server is restarted — the same reasoning as docusaurus-plugin-tag-route's watcher.
    getPathsToWatch() {
      return [path.join(context.siteDir, I18N_DIR, "**", "index.{md,mdx}")];
    },

    async loadContent() {
      return collectTranslations(context.siteDir);
    },

    async contentLoaded({ content, actions }) {
      const { currentLocale, defaultLocale } = context.i18n;
      actions.setGlobalData({
        translations: content,
        currentLocale,
        defaultLocale,
        readingTimes:
          currentLocale === defaultLocale
            ? {}
            : collectReadingTimes(context.siteDir, currentLocale),
      });
    },
  };
};

/**
 * Every article slug that exists in the English corpus. Needed to tell an article URL apart
 * from a listing URL (`/blog/tags/`, `/blog/page/2/`) when filtering the sitemap: matching on
 * "last path segment" alone would silently drop the taxonomy pages.
 */
function collectAllArticleSlugs(siteDir) {
  return new Set(findArticles(path.join(siteDir, "blog")).map(slugFor));
}

/**
 * The source-side mirror of `collectTranslatedFrontMatter()`: slug -> the ENGLISH title and
 * description, read from `blog/`.
 *
 * Needed wherever something has to recognise a piece of English text AS a title rather than as
 * prose. `remark-i18n-link-titles` is the first caller: a translated article may carry a link
 * whose label is deliberately left in English because it is another article's title (see the
 * translation contract), and telling that apart from ordinary prose means having the titles to
 * compare against. Byte-equality with a real title is the only safe discriminator — guessing
 * from shape would eventually rewrite a sentence.
 *
 * @returns {Record<string, {title: string, description: string}>} slug -> English fields.
 */
function collectSourceFrontMatter(siteDir) {
  const bySlug = {};
  for (const filePath of findArticles(path.join(siteDir, "blog"))) {
    const { slug, title, description } = articleMetaFor(filePath);
    if (title) bySlug[slug] = { title, description };
  }
  return bySlug;
}

module.exports.collectTranslations = collectTranslations;
module.exports.collectTranslatedFrontMatter = collectTranslatedFrontMatter;
module.exports.collectAllArticleSlugs = collectAllArticleSlugs;
module.exports.collectSourceFrontMatter = collectSourceFrontMatter;
module.exports.collectReadingTimes = collectReadingTimes;
