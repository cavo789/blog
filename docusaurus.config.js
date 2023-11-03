// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Christophe Avonture',
  tagline: 'Personal blog',
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
          showReadingTime: true
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],
  plugins: [
    [
      require.resolve("@cmfcmf/docusaurus-search-local"),
      {
        indexDocs: false,
        language: "en",
      }
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/social-card.jpg',
      navbar: {
        title: 'Christophe Avonture',
        logo: {
          alt: 'My Site Logo',
          src: 'img/cavo789.jpg',
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
            href: 'https://github.com/cavo789/blog',
            label: 'GitHub',
            position: 'right',
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
      },
    }),
};

export default config;
