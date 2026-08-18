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

  // `static/` (the Docusaurus default) plus questions-index-plugin's generated static asset
  // dir — see that plugin's header comment for why the full "Ask my blog" question corpus is
  // served as a plain fetchable JSON file (regenerated on every build/reload) instead of
  // being bundled as plugin data.
  staticDirectories: ["static", ".docusaurus/questions-index-plugin/static"],

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "cavo789", // Usually your GitHub org/user name.
  projectName: "cavo789", // Usually your repo name.

  noIndex: false, // Make sure our HTML pages will contains the <meta name="robots" content="index, follow"> tag

  // Mermaid diagrams, rendered natively from ```mermaid fenced blocks. Reach for it only
  // when a flow is genuinely non-linear (branches, loops, several actors): a real terminal
  // output or a plaintext arrow diagram is usually clearer — see
  // .claude/skills/blog-post-structure/SKILL.md
  markdown: { mermaid: true },
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
    defaultLocale: "en",
    locales: ["en"],
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
            remarkSnippetLoader,
            remarkReplaceWords,
            remarkTreeToComponent,
          ],
        },
        sitemap: {
          changefreq: "weekly",
          priority: 0.5,
          // Author-only pages carry `noindex` but were still being submitted
          // here — a sitemap entry is an explicit "please index this". They are
          // deliberately absent from robots.txt: a `Disallow` would stop the
          // crawl before the `noindex` is ever read, so the URL could linger in
          // the index with no way out, and would publish the paths in the
          // bargain.
          ignorePatterns: [
            "/blog/tags/**",
            "/admin",
            "/typo-dashboard",
            "/reactions-dashboard",
          ],
          filename: "sitemap.xml",
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
    require.resolve("docusaurus-plugin-image-zoom"),
    ["docusaurus-plugin-pagefind", {}],
  ],
  headTags: [
    {
      // Site-wide discovery hook for the llms.txt convention (llmstxt.org) —
      // mirrors how <link rel="alternate" type="application/rss+xml"> lets a
      // reader/tool find the RSS feed without knowing the URL in advance.
      // Present on every page since it lives in the global headTags, not a
      // per-post component. See plugins/markdown-export-plugin.
      tagName: "link",
      attributes: {
        rel: "alternate",
        type: "text/markdown",
        href: "https://www.avonture.be/llms.txt",
        title: "llms.txt — full site index in Markdown, for LLMs and readers",
      },
    },
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
        title: "Christophe Avonture (cavo789)",
        logo: {
          alt: "Christophe Avonture",
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
        copyright: `<span class="footer-cmdk-hint">Press ⌘K to search · ? for shortcuts</span><br />Copyright © ${new Date().getFullYear()} Christophe Avonture. Powered by Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        defaultLanguage: "php",
        additionalLanguages: ["bash", "css", "javascript", "php", "python"],
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
