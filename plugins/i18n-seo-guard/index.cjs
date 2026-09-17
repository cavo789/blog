/**
 * @fileoverview
 * Docusaurus Plugin — i18n-seo-guard
 *
 * Keeps untranslated articles out of the search index in non-default locales.
 *
 * # Why this exists
 *
 * Docusaurus falls back to the English source when a translation is missing
 * (`@docusaurus/utils/lib/dataFileUtils.js` builds `[contentPathLocalized, contentPath]` and
 * takes the first folder containing the file). Enabling the `fr` locale therefore publishes
 * one `/fr/blog/<slug>/` URL per article — English content, `<html lang="fr">`, in the
 * sitemap. Measured on this repo: 261 French pages for 4 real translations.
 *
 * That is duplicate content aimed squarely at the only benefit the translation work is chasing.
 * This plugin is what makes the feature safe to ship before the corpus is fully translated.
 *
 * # What it does, in `postBuild` (so `yarn start` is untouched)
 *
 * For every locale other than the default, on every article page whose slug is absent from
 * translations-manifest-plugin's manifest:
 *
 *   - injects `<meta name="robots" content="noindex, follow">` — `follow` so the crawler still
 *     walks the outgoing links, it just never indexes this URL;
 *   - rewrites `<link rel="canonical">` to the English URL, consolidating any signal;
 *
 * Sitemap exclusion is NOT done here: this plugin's `postBuild` runs before the sitemap
 * plugin's, which would overwrite any pruning. It is done through the sitemap plugin's own
 * `createSitemapItems` hook in docusaurus.config.js instead.
 *   - strips the `hreflang` alternate that declares it as the French version.
 *
 * A `noindex` page cannot be duplicate content — it never enters the index. That is why this
 * is preferred here over a 301: the redirect list would shrink with every new translation, and
 * a stale rule would make a freshly translated article unreachable. This regenerates itself.
 *
 * # Second job: the surplus listing pages
 *
 * The blog's `/page/N/` routes are paginated over the ENGLISH corpus, so a partially translated
 * locale gets more listing pages than it has content for. `src/theme/BlogListPage` re-paginates
 * the translated corpus and renders an empty state past its last page; this marks those same
 * pages `noindex, follow` so an already-indexed URL has a way out. The sitemap drops them
 * through `createSitemapItems` in docusaurus.config.js, for the ordering reason above.
 *
 * Both jobs shrink to nothing as the corpus gets translated. See TODO 0119 and 0124.
 */

const fs = require("fs");
const path = require("path");
const { collectTranslations } = require("../translations-manifest-plugin/index.cjs");

const ROBOTS_TAG = '<meta name="robots" content="noindex, follow"/>';

/** Every `<locale>/blog/<slug>/index.html` produced for this build. */
function findArticlePages(blogDir) {
  if (!fs.existsSync(blogDir)) return [];

  const found = [];
  for (const entry of fs.readdirSync(blogDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const indexFile = path.join(blogDir, entry.name, "index.html");
    if (fs.existsSync(indexFile)) found.push({ slug: entry.name, file: indexFile });
  }
  return found;
}

/**
 * Applies the three head-level changes. Returns the rewritten HTML, or null when the page
 * already carries a robots tag (someone else owns it — do not fight over it).
 */
function guardHtml(html, englishUrl) {
  if (/<meta[^>]+name="robots"/i.test(html)) return null;

  let out = html;

  // Canonical: replace an existing one rather than adding a second.
  if (/<link[^>]+rel="canonical"[^>]*>/i.test(out)) {
    out = out.replace(
      /<link[^>]+rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${englishUrl}"/>`,
    );
  } else {
    out = out.replace("</head>", `<link rel="canonical" href="${englishUrl}"/></head>`);
  }

  // The hreflang alternates would otherwise keep advertising this URL as the French version.
  out = out.replace(/<link[^>]+rel="alternate"[^>]+hreflang="[^"]*"[^>]*>/gi, "");

  // Pagefind indexes the built HTML and keys the language off `<html lang>`, so these pages
  // would land in the French search index as French results while being English prose (499 of
  // 499 on the first measured build). `data-pagefind-ignore` on <body> drops the whole page.
  out = out.replace(/<body([^>]*)>/i, (match, attrs) =>
    attrs.includes("data-pagefind-ignore")
      ? match
      : `<body${attrs} data-pagefind-ignore>`,
  );

  return out.replace("</head>", `${ROBOTS_TAG}</head>`);
}

/**
 * Every `<locale>/blog/page/<N>/index.html` produced for this build, with its page number.
 * Page 1 is `<locale>/blog/index.html` and always has content, so it is not a candidate.
 */
function findListingPages(blogDir) {
  const pageDir = path.join(blogDir, "page");
  if (!fs.existsSync(pageDir)) return [];

  const found = [];
  for (const entry of fs.readdirSync(pageDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
    const indexFile = path.join(pageDir, entry.name, "index.html");
    if (fs.existsSync(indexFile))
      found.push({ page: Number(entry.name), file: indexFile });
  }
  return found;
}

/**
 * `noindex, follow` and nothing else. No canonical is written: the English `/blog/page/N/` is a
 * different list, not another rendering of this one, so pointing at it would be a lie.
 */
function guardListingHtml(html) {
  if (/<meta[^>]+name="robots"/i.test(html)) return null;
  return html.replace("</head>", `${ROBOTS_TAG}</head>`);
}

module.exports = function i18nSeoGuard(context, options = {}) {
  return {
    name: "i18n-seo-guard",

    async postBuild({ outDir, siteConfig, i18n }) {
      const { currentLocale, defaultLocale, locales } = i18n;
      const manifest = collectTranslations(context.siteDir);

      // On the DEFAULT locale there is nothing to de-index — the article is the original — but
      // Docusaurus still advertises an `hreflang` alternate for every other locale, including
      // for articles nobody translated. That points a crawler at a `noindex` page, which is a
      // contradictory signal ("here is the French version" + "do not index it"). Strip just
      // those alternates and leave the rest of the page untouched.
      if (currentLocale === defaultLocale) {
        let stripped = 0;

        for (const otherLocale of (locales ?? []).filter((l) => l !== defaultLocale)) {
          const translatedThere = new Set(manifest[otherLocale] ?? []);

          for (const { slug, file } of findArticlePages(path.join(outDir, "blog"))) {
            if (translatedThere.has(slug)) continue;

            const html = fs.readFileSync(file, "utf-8");
            const cleaned = html.replace(
              new RegExp(
                `<link[^>]+rel=["']?alternate["']?[^>]+hreflang=["']?${otherLocale}["']?[^>]*>`,
                "gi",
              ),
              "",
            );
            if (cleaned === html) continue;

            fs.writeFileSync(file, cleaned, "utf-8");
            stripped += 1;
          }
        }

        console.log(
          `i18n-seo-guard [${currentLocale}]: ${stripped} hreflang alternate(s) removed for untranslated articles.`,
        );
        return;
      }

      const translated = new Set(manifest[currentLocale] ?? []);
      const siteUrl = siteConfig.url.replace(/\/$/, "");

      const pages = findArticlePages(path.join(outDir, "blog"));
      let guarded = 0;

      for (const { slug, file } of pages) {
        if (translated.has(slug)) continue;

        const englishUrl = `${siteUrl}/blog/${slug}/`;
        const guardedHtml = guardHtml(fs.readFileSync(file, "utf-8"), englishUrl);
        if (guardedHtml === null) continue;

        fs.writeFileSync(file, guardedHtml, "utf-8");
        guarded += 1;
      }

      // `postsPerPage` comes from docusaurus.config.js, where the blog plugin reads the same
      // constant — the two must not drift. Without it there is no way to know where this
      // locale's content stops, so the listing pass is simply skipped.
      const { postsPerPage } = options;
      let listingsGuarded = 0;

      if (postsPerPage) {
        const lastPageWithContent = Math.max(
          1,
          Math.ceil(translated.size / postsPerPage),
        );

        for (const { page, file } of findListingPages(path.join(outDir, "blog"))) {
          if (page <= lastPageWithContent) continue;

          const guardedHtml = guardListingHtml(fs.readFileSync(file, "utf-8"));
          if (guardedHtml === null) continue;

          fs.writeFileSync(file, guardedHtml, "utf-8");
          listingsGuarded += 1;
        }
      }

      console.log(
        `i18n-seo-guard [${currentLocale}]: ${guarded} untranslated article(s) marked noindex; ` +
          `${translated.size} translation(s) left indexable; ` +
          `${listingsGuarded} surplus listing page(s) marked noindex.`,
      );
    },
  };
};
