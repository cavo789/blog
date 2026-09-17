// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

// NODE_ENV is defined when running Docusaurus
// Is initialized to "production" only when "yarn build" is fired
// So on local host, isProd will be set to false ("yarn start" will initialize NODE_ENV to "development").
const isProd = process.env.NODE_ENV === "production";

import { themes as prismThemes } from "prism-react-renderer";

import pluginSeriesRoute from "./plugins/docusaurus-plugin-series-route/index.cjs";
import pluginTagRoute from "./plugins/docusaurus-plugin-tag-route/index.cjs";
import pluginYamlWebpack from "./plugins/yaml-webpack-plugin/index.cjs";
import remarkReplaceWords from "./plugins/remark-replace-terms/index.cjs";
import remarkTreeToComponent from "./plugins/remark-tree-to-component/index.cjs";
import remarkSnippetLoader from "./plugins/remark-snippet-loader/index.cjs";
import remarkI18nAssets from "./plugins/remark-i18n-assets/index.cjs";
import remarkI18nLinkTitles from "./plugins/remark-i18n-link-titles/index.cjs";
import translationsManifest from "./plugins/translations-manifest-plugin/index.cjs";

const { collectTranslations, collectAllArticleSlugs } = translationsManifest;

/**
 * The site's source-of-truth locale. Declared once so that adding `nl` or `es` never means
 * hunting for `"en"` literals scattered through this file.
 */
const DEFAULT_LOCALE = "en";

/** The site's origin. Declared once: the head tags below build absolute URLs by hand. */
const SITE_URL = "https://www.avonture.be";

/**
 * The default locale's own name for itself. Single source of truth: it feeds both
 * `i18n.localeConfigs` below and the "(English — the whole blog)" suffix on the source-language
 * discovery links, which the React components word the same way from `localeConfigs`.
 */
const DEFAULT_LOCALE_LABEL = "English";

/**
 * The locale segment for this build's absolute URLs — `""` on the default locale, `"/fr"`
 * otherwise.
 *
 * `DOCUSAURUS_CURRENT_LOCALE` is `undefined` on the FIRST config load (Docusaurus reads the
 * config once to discover the locale list, then once per locale). Falling back to the default
 * locale is not defensive padding — it is what that first pass actually describes.
 */
const CURRENT_LOCALE = process.env.DOCUSAURUS_CURRENT_LOCALE || DEFAULT_LOCALE;
const IS_DEFAULT_LOCALE = CURRENT_LOCALE === DEFAULT_LOCALE;
const LOCALE_SEGMENT = IS_DEFAULT_LOCALE ? "" : `/${CURRENT_LOCALE}`;

/**
 * A discovery `<link>` for a resource that exists once per locale.
 *
 * On a translated locale two are emitted: this locale's, then the source locale's carrying
 * `hreflang` and a title that says so. Helmet de-duplicates `<link>` on `href`
 * (`linkTags: x(LINK, ["rel","href"], …)` in react-helmet-async), so both survive — and a
 * reader's extension or an agent landing on a French page can still find the full English feed.
 *
 * @param {{ path: string, type: string, title: string }} options
 * @returns {import('@docusaurus/types').HtmlTagObject[]}
 */
function localizedAlternates({ path, type, title }) {
  // Annotated: without it the array's type is inferred from its first element, and the
  // source-locale entry below — the only one carrying `hreflang` — fails to type-check.
  /** @type {import('@docusaurus/types').HtmlTagObject[]} */
  const tags = [
    {
      tagName: "link",
      attributes: {
        rel: "alternate",
        type,
        href: `${SITE_URL}${LOCALE_SEGMENT}${path}`,
        title,
      },
    },
  ];

  if (!IS_DEFAULT_LOCALE) {
    tags.push({
      tagName: "link",
      attributes: {
        rel: "alternate",
        type,
        href: `${SITE_URL}${path}`,
        hreflang: DEFAULT_LOCALE,
        title: `${title} (${DEFAULT_LOCALE_LABEL} — the whole blog)`,
      },
    });
  }

  return tags;
}

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Christophe Avonture",
  tagline:
    "Personal blog about Docker, WSL, Python, Quarto, PHP, Joomla, Docusaurus and even more",
  favicon: "img/favicon.png",

  // Set the production url of your site here
  url: "https://www.avonture.be",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",
  // Enforce trailing slashes on all URLs so that the static build, the sitemap,
  // and canonical links are all consistent — avoids 301 redirects that some crawlers
  // flag as soft errors (e.g. /blog → /blog/).
  trailingSlash: true,

  // `static/` (the Docusaurus default) plus questions-index-plugin's generated static asset
  // dir — see that plugin's header comment for why the full "Ask my blog" question corpus is
  // served as a plain fetchable JSON file (regenerated on every build/reload) instead of
  // being bundled as plugin data.
  // The generated-files dir is NOT always `.docusaurus`: the dev server runs under
  // `.docusaurus-dev` and the isolated verification build under `.docusaurus-verify`
  // (DOCUSAURUS_GENERATED_FILES_DIR_NAME, read by @docusaurus/utils the same way). A hardcoded
  // `.docusaurus` served nothing there, and "Ask my blog" stayed empty in `yarn start`.
  staticDirectories: [
    "static",
    `${process.env.DOCUSAURUS_GENERATED_FILES_DIR_NAME ?? ".docusaurus"}/questions-index-plugin/static`,
  ],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "cavo789", // Usually your GitHub org/user name.
  projectName: "cavo789", // Usually your repo name.

  noIndex: false, // Make sure our HTML pages will contains the <meta name="robots" content="index, follow"> tag

  // Mermaid diagrams, rendered natively from ```mermaid fenced blocks. Reach for it only
  // when a flow is genuinely non-linear (branches, loops, several actors): a real terminal
  // output or a plaintext arrow diagram is usually clearer — see
  // .claude/skills/blog-post-structure/SKILL.md
  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: "throw",
    },
  },
  themes: ["@docusaurus/theme-mermaid"],

  onBrokenAnchors: "throw",
  // This was "ignore" for a long time (TODO 0092): our tag and series pages were
  // registered as *parameterized* routes ("/blog/tags/:tag", "/series/:slug"), and
  // Docusaurus's link checker resolves links against registered routes — a parameterized
  // path matches none of them, so every tag/series link was reported as broken and the
  // check had to be turned off. Both plugins now enumerate the real slugs at build time
  // (see plugins/lib/blog-taxonomy.cjs), so the check is back on and a genuinely dead
  // internal link fails the build instead of shipping silently.
  onBrokenLinks: "throw",
  onDuplicateRoutes: "throw",

  customFields: {
    // Resolves the `{year}` token in the footer copyright (src/theme/Footer/Copyright). Captured
    // here, at build time, so the server-rendered HTML and the client agree — a year computed at
    // render time would differ from the prerendered one the first January after a build.
    buildYear: new Date().getFullYear(),
    bluesky: {
      // This is the Bluesky handle as displayed in your Bluesky profile page
      handle: "avonture.be",
    },
  },

  // https://github.com/facebook/docusaurus/issues/10556
  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
      useCssCascadeLayers: true,
    },
    faster: {
      swcJsLoader: true,
      swcJsMinimizer: true,
      swcHtmlMinimizer: true,
      lightningCssMinimizer: true,
      mdxCrossCompilerCache: true,
    },
  },

  storage: {
    type: "localStorage",
    namespace: true,
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: DEFAULT_LOCALE,
    locales: ["en", "fr"],
    // Declared rather than inferred: these labels are what the navbar's localeDropdown shows,
    // and a language is always named in its own language — an English speaker looks for
    // "English", a French one for "Français". `htmlLang` drives <html lang>, which is what a
    // screen reader switches pronunciation on and what Google reads alongside hreflang.
    localeConfigs: {
      en: { label: DEFAULT_LOCALE_LABEL, htmlLang: "en-GB", direction: "ltr" },
      fr: { label: "Français", htmlLang: "fr-BE", direction: "ltr" },
    },
  },
  scripts: [
    {
      src: "https://scripts.withcabin.com/hello.js",
      async: true,
      defer: true,
    },
    {
      src: "https://matomo.avonture.be/matomo.js",
      async: true,
    },
  ],
  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          routeBasePath: "/blog",
          editUrl: "https://github.com/cavo789/blog/edit/main/",
          showReadingTime: true,
          exclude: isProd ? ["**/.unpublished/**"] : [], // only exclude in prod
          feedOptions: {
            type: ["atom", "json"],
          },
          blogTitle: "Blog — Christophe Avonture",
          blogDescription:
            "Personal blog about Docker, Linux, Python, PHP, Quarto, Docusaurus and more",
          blogSidebarTitle: "All posts",
          blogSidebarCount: "ALL",
          postsPerPage: 12,
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
          // Useful options to enforce blogging best practices
          onInlineTags: "throw",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "ignore",
          // Replace words like "vscode" or "markdown" to "VSCode" and "Markdown"
          beforeDefaultRemarkPlugins: [
            // Must stay FIRST: it rewrites the `./`-relative asset paths of translated articles
            // so that remarkSnippetLoader below — and Docusaurus's own image handling — resolve
            // them against the English article's folder. See plugins/remark-i18n-assets.
            remarkI18nAssets,
            // After remarkI18nAssets (which must stay first) and before the rest: it only
            // rewrites link TEXT, so nothing downstream depends on its ordering — but it must
            // see the tree before any plugin that rewrites links. Relabels a translated
            // article's citations of other articles as those get translated; see the plugin's
            // header for why this is resolved at build time instead of stored.
            remarkI18nLinkTitles,
            remarkSnippetLoader,
            remarkReplaceWords,
            remarkTreeToComponent,
          ],
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          // Untranslated articles must not be advertised in a non-default locale's sitemap:
          // a sitemap entry is an explicit "please index this", and those pages serve English
          // content under a French URL (Docusaurus's i18n fallback). They already carry
          // `noindex` + `canonical` via plugins/i18n-seo-guard — this keeps the two consistent.
          //
          // Done here rather than by pruning sitemap.xml in a postBuild: the sitemap plugin's
          // own postBuild runs after any other plugin's and would overwrite the pruning.
          // `createSitemapItems` is the supported hook for exactly this.
          createSitemapItems: async ({ defaultCreateSitemapItems, ...rest }) => {
            const items = await defaultCreateSitemapItems(rest);
            const locale = process.env.DOCUSAURUS_CURRENT_LOCALE;

            // Compared against the declared default locale, never a literal: adding `nl` must not
            // require editing this line.
            if (!locale || locale === DEFAULT_LOCALE) return items;

            const translated = new Set(collectTranslations(process.cwd())[locale] ?? []);
            const articleSlugs = collectAllArticleSlugs(process.cwd());

            return items.filter((item) => {
              // Only article URLs are candidates. Matching on "last path segment" alone would
              // also swallow /blog/tags/ and /blog/page/2/, hence the known-slug check.
              const match = item.url.match(/\/blog\/([^/]+)\/?$/);
              if (!match || !articleSlugs.has(match[1])) return true;
              return translated.has(match[1]);
            });
          },
          // Author-only pages carry `noindex` but were still being submitted
          // here — a sitemap entry is an explicit "please index this". They are
          // deliberately absent from robots.txt: a `Disallow` would stop the
          // crawl before the `noindex` is ever read, so the URL could linger in
          // the index with no way out, and would publish the paths in the
          // bargain.
          //
          // These patterns are matched against the route path, which CARRIES the locale's
          // baseUrl: under `fr` the tag pages are `/fr/blog/tags/...`, so a bare
          // `/blog/tags/**` matched nothing and 140 French tag pages were being advertised
          // while zero English ones were. Every pattern is therefore emitted twice, once bare
          // and once locale-prefixed. See TODO 0119.
          ignorePatterns: (() => {
            const patterns = [
              "/blog/tags/**",
              "/admin",
              "/typo-dashboard",
              "/reactions-dashboard",
            ];
            const locale = process.env.DOCUSAURUS_CURRENT_LOCALE;

            return locale && locale !== DEFAULT_LOCALE
              ? [...patterns, ...patterns.map((pattern) => `/${locale}${pattern}`)]
              : patterns;
          })(),
          filename: "sitemap.xml",
        },
        pages: {
          // The pages plugin had no explicit config, so it ran with no remark plugins at all —
          // meaning a translated page under i18n/ could not resolve its `./images/…`, exactly
          // like blog articles before remark-i18n-assets. Same plugin, same reason.
          beforeDefaultRemarkPlugins: [remarkI18nAssets],
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],
  plugins: [
    [
      "@docusaurus/plugin-ideal-image",
      {
        quality: 80,
        max: 1200,
        min: 320,
        steps: 4,
        disableInDev: false,
        sizes:
          "(max-width: 480px) 320px, (max-width: 768px) 600px, (max-width: 1024px) 900px, 100vw",
        formats: ["webp", "auto"],
        fallbackFormat: "auto",
      },
    ],
    [pluginSeriesRoute, {}],
    [pluginTagRoute, {}],
    [pluginYamlWebpack, {}],
    ["./plugins/blog-feed-plugin/index.js", { maxItems: 20 }],
    ["./plugins/admin-data-plugin/index.cjs", {}],
    "./plugins/blog-graph-plugin/index.mjs",
    "./plugins/questions-index-plugin/index.cjs",
    "./plugins/command-palette-plugin/index.mjs",
    ["./plugins/ascii-injector/index.mjs", { bannerPath: "src/data/banner.txt" }],
    "./plugins/sitemap-easter-egg/index.mjs",
    "./plugins/markdown-export-plugin/index.cjs",
    // Single source of truth for "is this article translated?" — consumed by the SEO guard
    // below, by the banner/flag components and by every listing surface (TODO 0119).
    "./plugins/translations-manifest-plugin/index.cjs",
    // Must come after the sitemap plugin: it rewrites the sitemap that plugin produced.
    "./plugins/i18n-seo-guard/index.cjs",
    // Points build/<locale>/.htaccess — a verbatim copy of static/.htaccess — at the locale's own
    // 404 page and app shell instead of the English ones.
    "./plugins/i18n-htaccess/index.cjs",
    require.resolve("docusaurus-plugin-image-zoom"),
    ["docusaurus-plugin-pagefind", {}],
    [
      "@docusaurus/plugin-pwa",
      {
        // No-op on `yarn start` (the plugin only runs when NODE_ENV === "production") and
        // registers a service worker only in the production build (TODO 0095).
        debug: false,
        // `pwaHead` is how the plugin's own docs usually wire the manifest link, icons and
        // theme-color — deliberately omitted here (its Joi schema rejects an explicit `[]`,
        // so "not set" is the only way to mean "none"): those tags already exist in the
        // `headTags` array below (TODO 0090), and duplicating them via `pwaHead` would emit
        // a second, competing set of the same tags.
        // Explicit even though it matches the plugin's own default: offline mode — and
        // therefore the service worker's caching behavior below — only turns on for a
        // reader who installed the app or is running it standalone (or opted in via
        // ?offlineMode=true for testing). A visitor just passing through the site should
        // never pay for a runtime cache they didn't ask for (see TODO 0095's risk section
        // on conservative activation).
        offlineModeActivationStrategies: ["appInstalled", "standalone", "queryString"],
        // The plugin's default precache (globPatterns matching every .js/.json/.css/.html
        // and every image/font in the whole build/ directory) would ship this blog's 248
        // articles and 100+ MB of banner images to every installed reader on first launch —
        // exactly what TODO 0095's risk section rules out ("Se limiter à la coquille + les
        // pages visitées"). `globPatterns` itself isn't overridable here — plugin-pwa
        // spreads `injectManifestConfig` and then unconditionally re-sets `globPatterns` to
        // that broad default, so anything passed here for that key is silently discarded
        // (see its lib/index.js `postBuild`). `globIgnores` *is* honored, so that's the
        // lever: cut every page-content and asset directory, leaving only the homepage
        // document — the one file an offline relaunch of the installed app needs before
        // React Router can even boot — plus root-level files like the manifest and the
        // Ask-my-blog question corpus (small enough, and worth having offline).
        //
        // What this deliberately does NOT attempt: caching articles as the reader visits
        // them. The obvious next step — a `swCustom` module registering a runtime
        // StaleWhileRevalidate route for visited pages — was built and tested (TODO 0095)
        // and found unreliable: `swCustom` is loaded via `await import(...)` inside the
        // generated sw.js, and that import is a real network fetch which is NOT guaranteed
        // available across a service-worker respawn (workers are terminated when idle and
        // re-evaluate their whole module top level on the next event). Verified with
        // Playwright/Chromium: after the worker idled out and the page reloaded offline,
        // that import failed, which threw before the plugin's own fetch listener even got
        // registered — breaking the homepage-shell fallback that DOES work today. That is
        // strictly worse than not having per-article caching at all, since it's exactly
        // the "reopen the installed app while offline" scenario a PWA exists for. Precaching
        // every article to route around this would mean reintroducing the >100 MB payload
        // this comment starts with. See TODO 0095's Status section for the full writeup —
        // a reliable version of this would need a hand-rolled sw.js that doesn't depend on
        // plugin-pwa's dynamic `swCustom` import, which is a materially bigger undertaking
        // than "install and configure a plugin".
        injectManifestConfig: {
          globIgnores: [
            "blog/**",
            "series/**",
            "tags/**",
            "faq/**",
            "about/**",
            "repositories/**",
            "admin/**",
            "admin-data/**",
            "typo-dashboard/**",
            "reactions-dashboard/**",
            "map/**",
            "project_setup/**",
            "llms/**",
            "img/**",
            "assets/**",
            "pagefind/**",
          ],
        },
      },
    ],
  ],
  headTags: [
    {
      // Makes the blog installable (TODO 0090): Chrome only offers the "Add to Home
      // screen" prompt once it finds a manifest with name/short_name/start_url/display
      // and an icon ≥ 192px. See static/manifest.webmanifest and
      // scripts/generate-pwa-icons.mjs for where its icons come from.
      tagName: "link",
      attributes: {
        rel: "manifest",
        href: "/manifest.webmanifest",
      },
    },
    {
      // Safari never reads the manifest's icons — without this tag, "Add to Home
      // Screen" falls back to a screenshot thumbnail instead of the mascot.
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        sizes: "180x180",
        href: "/img/icons/apple-touch-icon.png",
      },
    },
    {
      // Colors the browser chrome (Android status bar, task switcher) to match the
      // installed app rather than the browser's default. Kept in sync with the
      // manifest's own theme_color and the light-mode --ifm-color-primary in
      // src/css/custom.css.
      tagName: "meta",
      attributes: {
        name: "theme-color",
        content: "#2e8555",
      },
    },
    {
      // iOS ignores display: "standalone" from the manifest and needs its own
      // opt-in to open without Safari's browser chrome when launched from the
      // home screen.
      tagName: "meta",
      attributes: {
        name: "apple-mobile-web-app-capable",
        content: "yes",
      },
    },
    {
      // Standard (non-Apple-prefixed) equivalent of the tag above, read by
      // Chrome/Android. Chrome DevTools flags apple-mobile-web-app-capable as
      // deprecated and asks for this one — but Safari ignores it, so both
      // tags are kept side by side rather than one replacing the other.
      tagName: "meta",
      attributes: {
        name: "mobile-web-app-capable",
        content: "yes",
      },
    },
    {
      tagName: "meta",
      attributes: {
        name: "apple-mobile-web-app-title",
        content: "avonture.be",
      },
    },
    // The classic preset advertises atom.xml and feed.json on blog routes, but
    // never /blog/rss.xml — that one is written by plugins/blog-feed-plugin and
    // is the richest of the three (cleaned content, <enclosure> image,
    // dc:creator, XSLT stylesheet). Declared globally so a reader's browser
    // extension finds it from any page, not only from /blog.
    //
    // The href used to be hardcoded to the English URL, so every French page advertised the
    // English feed. It now follows the locale being built — and offers the English one beside it.
    ...localizedAlternates({
      path: "/blog/rss.xml",
      type: "application/rss+xml",
      title: "Christophe Avonture — RSS feed",
    }),
    // Site-wide discovery hook for the llms.txt convention (llmstxt.org) —
    // mirrors how <link rel="alternate" type="application/rss+xml"> lets a
    // reader/tool find the RSS feed without knowing the URL in advance.
    // Present on every page since it lives in the global headTags, not a
    // per-post component. See plugins/markdown-export-plugin, which writes one
    // index per locale into that locale's outDir.
    ...localizedAlternates({
      path: "/llms.txt",
      type: "text/markdown",
      title: "llms.txt — full site index in Markdown, for LLMs and readers",
    }),
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossorigin: "anonymous",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap",
      },
    },
    {
      tagName: "script",
      attributes: { type: "text/javascript" },
      innerHTML: `
      var _paq = window._paq = window._paq || [];
      // Without a heartbeat, Matomo derives the visit duration from the gap
      // between recorded actions, so a visit to a single page is stored as
      // 0 second. Pinging while the tab stays visible measures the time readers
      // really spend on a page they never navigate away from.
      _paq.push(['enableHeartBeatTimer', 15]);
      _paq.push(['trackPageView']);
      _paq.push(['enableLinkTracking']);
      (function() {
        var u="https://matomo.avonture.be/";
        _paq.push(['setTrackerUrl', u+'matomo.php']);
        _paq.push(['setSiteId', '1']);
      })();
    `,
    },
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Christophe Avonture",
        url: "https://www.avonture.be/",
        description:
          "Personal blog about Docker, WSL, Python, Quarto, PHP, Joomla, Docusaurus and even more",
        potentialAction: {
          "@type": "SearchAction",
          target: "https://www.avonture.be/search?q={search_term_string}",
          "query-input": "required name=search_term_string",
        },
      }),
    },
    {
      tagName: "script",
      attributes: {
        type: "application/ld+json",
      },
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "Christophe Avonture",
        url: "https://www.avonture.be/",
        logo: "https://www.avonture.be/img/avatar.webp",
        sameAs: ["https://bsky.app/profile/avonture.be", "https://github.com/cavo789"],
      }),
    },
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/social-card.jpg",
      mermaid: {
        theme: { light: "neutral", dark: "dark" },
      },
      navbar: {
        // auto-hide the navbar when the user will scroll down, show again when scroll up
        hideOnScroll: true,
        // Kept short on purpose: the full "Christophe Avonture (cavo789)" used to truncate
        // mid-word against the search icon on narrow mobile viewports. The GitHub handle is
        // still one click away via the navbar's own GitHub link.
        title: "Christophe Avonture",
        logo: {
          // Decorative: the adjacent navbar `title` above already announces "Christophe
          // Avonture" to screen readers — a non-empty alt here duplicated it.
          alt: "",
          src: "img/avatar.webp",
          width: 40,
          height: 40,
        },
        items: [
          {
            href: "/blog",
            label: "Blog",
          },
          {
            href: "/series",
            label: "Series",
          },
          {
            href: "/blog/tags",
            label: "Tags",
          },
          {
            href: "/map",
            label: "Map",
          },
          {
            href: "/faq",
            label: "FAQ",
          },
          {
            href: "/repositories",
            label: "Repositories",
          },
          {
            href: "/blog/archive",
            label: "Archive",
          },
          {
            href: "/about",
            label: "About me",
          },
          {
            // Without this, the French site is unreachable: a reader has to type `/fr/` into the
            // address bar themselves. Docusaurus ships the dropdown — it lists every configured
            // locale and links to the SAME page in the other one, keeping the reader where they
            // were instead of dumping them on the home page. Placed before the GitHub icon so it
            // stays inside the navbar's right group rather than becoming the last, smallest item.
            type: "localeDropdown",
            position: "right",
          },
          {
            href: "https://github.com/cavo789/blog",
            label: "GitHub",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
        ],
      },
      footer: {
        style: "light",
        // The /follow link is the site's only permanent pointer to the RSS
        // feeds; every other entry point (article action bar, tag and series
        // pages) is contextual and only shows up on those pages.
        // English source only. The French version lives in
        // `i18n/fr/docusaurus-theme-classic/footer.json`, which OVERRIDES this value — a
        // locale-aware computation here is silently ignored (learned the hard way, TODO 0119).
        // Raw HTML in themeConfig is never locale-prefixed, so the `/follow` href has to be
        // fixed in that JSON too, not just the words.
        // `{year}` is a token, not a literal: that JSON is generated once and never recomputed,
        // so a year baked into it froze the French footer at the year of translation. The
        // swizzled Footer/Copyright wrapper substitutes `customFields.buildYear` in both locales.
        copyright: `<span class="footer-cmdk-hint">Press ⌘K to search · ? for shortcuts · <a href="/follow">follow by RSS</a></span><br />Copyright © {year} Christophe Avonture. Powered by Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        defaultLanguage: "php",
        // Every language `remark-snippet-loader`'s `extensionToLang` map (or
        // Snippet's own `mapLangToVariant` fallback) can hand to a `<Snippet>`
        // or a native fenced code block — not just the languages some article
        // happened to need when this list was first written. An unregistered
        // language isn't just "no colors": prism-react-renderer's Highlight
        // renders differently for a known-vs-unknown grammar between the SSR
        // pass and the first client render, which is a genuine React
        // hydration mismatch (error #418), not a cosmetic gap — confirmed via
        // TODO 0112 (isolated repro: an unregistered `lang` on a real
        // `<CodeBlock>` reproduces the mismatch every time; a registered one
        // never does).
        // "html"/"xml" are deliberately absent: prismjs has no standalone
        // prism-html.js/prism-xml.js component file (they're aliases of the
        // always-bundled "markup" grammar) — requesting them here breaks the
        // build with "Cannot find module './prism-html'".
        additionalLanguages: [
          "bash",
          "css",
          "docker",
          "ini",
          "javascript",
          "json",
          "jsx",
          "markdown",
          "php",
          "python",
          "sql",
          "typescript",
          "yaml",
        ],
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      // Configuration du zoom
      zoom: {
        // Sélecteur CSS pour cibler les images à zoomer (les images dans le markdown qui ne sont pas des liens)
        // selector: ".markdown :not(em) > img",
        selector: ".markdown img:not(.navbar-logo):not(.no-zoom img)",

        background: {
          light: "rgb(255, 255, 255)",
          dark: "rgb(50, 50, 50)",
        },
      },
    }),
};

export default config;
