// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';


/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Christophe Avonture',
  tagline: 'Personal blog about Docker, PHP, Joomla and much more',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://www.avonture.be',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'cavo789', // Usually your GitHub org/user name.
  projectName: 'cavo789', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  onDuplicateRoutes: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

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
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL'
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
    [require.resolve("docusaurus-plugin-image-zoom"), {}],
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexDocs: false,
        language: "en",
      },
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({

      // announcementBar: {
      //   id: 'support_us',
      //   content:
      //     'We are looking to revamp our docs, please fill <a target="_blank" rel="noopener noreferrer" href="#">this survey</a>',
      //   backgroundColor: '#fafbfc',
      //   textColor: '#091E42',
      //   isCloseable: true,
      // },

      // Default image when sharing a post on social media
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
            href: '/blog/tags',
            label: 'Tags',
          },
          {
            href: '/resources',
            label: 'Resources',
          },
          {
            href: '/tutorials',
            label: 'Tutorials',
          },
          {
            href: 'https://www.avonture.be/v1',
            label: 'v1',
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
        style: 'dark',links: [
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
                label: 'GitHub',
                href: 'https://github.com/cavo789',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Christophe Avonture. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        defaultLanguage: 'php',
        additionalLanguages: ['bash', 'php']
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
      }
    }),
};

export default config;
