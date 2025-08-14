// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Christophe Avonture',
  tagline: 'Personal blog about Docker, PHP, Joomla and much more',
  favicon: 'img/favicon.jpg',

  // Set the production url of your site here
  url: 'https://www.avonture.be',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cavo789', // Usually your GitHub org/user name.
  projectName: 'cavo789', // Usually your repo name.

  noIndex: false, // Make sure our HTML pages will contains the <meta name="robots" content="index, follow"> tag

  onBrokenAnchors: 'throw',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: 'throw',

  customFields: {
    blueSky: {
      // This is the BlueSky handle as displayed in your BlueSky profile page
      handle: 'avonture.be',
    },
  },

  // https://github.com/facebook/docusaurus/issues/10556
  future: {
    experimental_faster: {
      rspackBundler: true, // required flag
      rspackPersistentCache: true, // new flag
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  scripts: [
    {
      src: 'https://scripts.withcabin.com/hello.js',
      async: true,
      defer: true,
    }
  ],
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          routeBasePath: '/blog',
          editUrl: 'https://github.com/cavo789/blog/edit/main/',

          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          // showLastUpdateTime: true,
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'ignore',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/blog/tags/**'],
          filename: 'sitemap.xml',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  plugins: [
    'docusaurus-plugin-matomo',
    [require.resolve("docusaurus-plugin-image-zoom"), {}],
  ],
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossorigin: "anonymous"
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&display=swap',
      },
    },
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      navbar: {
        // auto-hide the navbar when the user will scroll down, show again when scroll up
        // hideOnScroll: true,
        title: 'Christophe Avonture (cavo789)',
        logo: {
          alt: 'Christophe Avonture',
          src: 'img/cavo789.jpg',
          width: 40,
          height: 40,
        },
        items: [
          {
            href: '/blog',
            label: 'Blog',
          },
          {
            href: '/themes',
            label: 'Themes',
          },
          {
            href: '/blog/tags',
            label: 'Tags',
          },
          {
            href: '/resources',
            label: 'Resources',
          },
          {
            href: '/blog/archive',
            label: 'Archive',
          },
          {
            href: '/about',
            label: 'About me',
          },
          {
            href: 'https://github.com/cavo789/blog',
            label: 'GitHub',
            position: 'right',
            className: 'header-github-link',
            'aria-label': 'GitHub repository',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Communities',
            items: [
              {
                label: 'Joomla!France',
                href: 'https://forum.joomla.fr/member/38299-cavo789',
              },
              {
                label: 'Developpez.com',
                href: 'https://www.developpez.net/forums/u38507/cavo789/',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'BlueSky',
                href: 'https://bsky.app/profile/avonture.be',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/cavo789',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Christophe Avonture. Built with Docusaurus.`,
      },
      matomo: {
        matomoUrl: 'https://matomo.avonture.be/',
        siteId: '1',
        phpLoader: 'matomo.php',
        jsLoader: 'matomo.js'
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        defaultLanguage: 'php',
        additionalLanguages: ['bash', 'php', 'python']
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 5,
      },
      zoom: {
        selector: '.markdown :not(em) > img',
        config: {
          // options you can specify via https://github.com/francoischalifour/medium-zoom#usage
          background: {
            light: 'rgb(255, 255, 255)',
            dark: 'rgb(50, 50, 50)'
          }
        }
      },
      algolia: {
        // @see https://docusaurus.io/docs/search for documentation
        // @see https://dashboard.algolia.com/ for appId, apiKey and indexName

        // The application ID provided by Algolia
        appId: 'SIOYZRXPKJ',

        // Public API key: it is safe to commit it
        apiKey: '3e2bd9067f4916ba2d338c5b57631b92',

        indexName: 'avonture',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Algolia search parameters
        searchParameters: {},

        // Optional: path for search page that enabled by default (`false` to disable it)
        searchPagePath: 'search',

        // Optional: whether the insights feature is enabled or not on Docsearch (`false` by default)
        insights: false,
      },
    }),
};

export default config;
