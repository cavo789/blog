---
slug: docker-docusaurus-prod
title: Creating a docusauraus blog as a Docker image
authors: [christophe]
image: ./images/anniversary_social_media.jpg
tags: [caddy, docker, docusaurus, nodejs, yarn]
enableComments: true
draft: true
---
![Creating a docusauraus blog as a Docker image](./images/anniversary_header.jpg)

WORK IN PROGRESS

Create a temporary directory by running `mkdir /tmp/docusaurus && cd $_`.

This done, start your preferred editor and open the folder. On my side, I'm using Visual Studio Code so I'll just run `code .` in my Linux console.

## Create a Dockerfile file

In your project directory (so `/tmp/docusaurus`), create a file called `Dockerfile` with this content:

```Dockerfile
# syntax=docker/dockerfile:1

# Source https://docusaurus.community/knowledge/deployment/docker/?package-managers=yarn

# Stage 1: Base image.

FROM node:lts AS base

# Disable colour output from yarn to make logs easier to read.
ENV FORCE_COLOR=0

# Enable corepack.
RUN corepack enable

# Set the working directory to `/opt/docusaurus`.
WORKDIR /opt/docusaurus

# --------------------------------------------------------------------

# Stage 2: Production build mode.

FROM base AS building_production

# Copy over the source code.
COPY . /opt/docusaurus/

# Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable

# Build the static site (generated files will be created in /opt/docusaurus/build)
RUN yarn build

# --------------------------------------------------------------------

# Stage 3: Serve with caddy

FROM caddy:2.7.6-alpine AS production

# Copy the Caddyfile (present in the repository root folder)
COPY --from=building_production /opt/docusaurus/Caddyfile /etc/caddy/Caddyfile

# Copy the Docusaurus build output.
COPY --from=building_production /opt/docusaurus/build /var/docusaurus
```

This file is what we call a **multi-stages** Docker image. The main objectives are to have an improved cache layer system and a smaller in size final image.

### Dockerfile - explanations of the different stages

As you can see, we are using three stages (a stage starts with the `FROM` clause).

Our goal is to create a final Docker image with a static version of our Docusaurus blog. We wish to have an image containing a web server and our blog. 

Before being able to do this, we need to:

1. Use a `node` image since Docusaurus is a `NodeJS` application,
2. We need to install `yarn` and all dependencies required by Docusaurus then, we need to build our website i.e. convert our blog posts (written in Markdown) as HTML pages and
3. We need a web server like `Apache` or `nginx` or the new one called `caddy`.

This is our steps.

In step 1, right now, we do almost nothing, just download `node` and initialize some variables.

In step 2, we're using our first step (which was called `base`) and start the creation of the `production` image. We do like this because, in a future exercice, we can start from `base` and construct a `development` image; not only a `production` one. 

In this second step, we're thus still using NodeJS, we'll install Docusausus and his dependencies and the most important part, we'll build static files i.e. convert our Markdown posts into the final, static, website. That part is under the responsability of Docusaurus.

What is important to note here is our working directory: `/opt/docusaurus/`. Our blog has been copied into that folder so the result of the last instruction of the second stage (`yarn build`) will thus create a sub-folder `build` in `/opt/docusaurus/`.

At this stage, we've our static web site but not yet a web server.

In step 3, we're will use [caddy](https://hub.docker.com/_/caddy) which is a web server just like `Apache` and `nginx`.

To make it working, we just need two things as we can see with these two lines:

```dockerfile 
COPY --from=building_production /opt/docusaurus/Caddyfile /etc/caddy/Caddyfile

COPY --from=building_production /opt/docusaurus/build /var/docusaurus
```

We need a file called `Caddyfile` coming from the step 2 (called `building_production`) and we need to retrieve our static website (as mentionned earlier, generated in folder `/opt/docusaurus/build`).

### Why is that multi-stage image better than a "monolithic" stage?

Take a look on the last stage, our web server. We're just using the `caddy` webserver, the `Caddyfile` and our `build` folder. `

Since we're only recovering the `Caddyfile` file and `build` folder from the previous stage, the final image will no longer contain `NodeJs`, `Yarn`, `Docusaurus` or anything else previously installed. Nor will we have any temporary files that may have been installed; we don't need the unbuilt version of our blog, i.e. our original Markdown files.

Our final image will be smaller in size and will just contains what we need to run the final application, here our blog.

## Create the Caddyfile file

As mentionned, we need such file so please create a file called `Caddyfile` with this content:

```text
{$DOCUSAURUS_DOMAIN:localhost} {
	root * /var/docusaurus
	encode gzip
	try_files {path} /index.html
	file_server
}
```

## Create a .dockerignore file

Please create a `.dockerignore` file with this content: 

```text
build/
node_modules/

.dockerignore
.gitignore
.markdownlint_ignore
.markdownlint.json
*.log
docker-compose.yml
Dockerfile
LICENSE
makefile
README.md

blog/
pages/
static/
```

## Create a package.json file

Please also create `package.json` with this content:

```json
{
  "name": "blog",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "docusaurus": "docusaurus",
    "start": "docusaurus start",
    "build": "docusaurus build",
    "swizzle": "docusaurus swizzle",
    "deploy": "docusaurus deploy",
    "clear": "docusaurus clear",
    "serve": "docusaurus serve",
    "write-translations": "docusaurus write-translations",
    "write-heading-ids": "docusaurus write-heading-ids"
  },
  "dependencies": {
    "@cmfcmf/docusaurus-search-local": "^1.1.0",
    "@docusaurus/core": "^3.1.1",
    "@docusaurus/plugin-ideal-image": "^3.1.1",
    "@docusaurus/plugin-sitemap": "^3.1.1",
    "@docusaurus/preset-classic": "^3.1.1",
    "@giscus/react": "^2.3.0",
    "@mdx-js/react": "^3.0.0",
    "clsx": "^1.2.1",
    "docusaurus-init": "^1.14.7",
    "docusaurus-plugin-image-zoom": "^1.0.1",
    "docusaurus-plugin-matomo": "^0.0.8",
    "npm": "^10.4.0",
    "prism-react-renderer": "^2.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "overrides": {
    "@cmfcmf/docusaurus-search-local": {
      "@docusaurus/core": "^3.1.0"
    }
  },
  "devDependencies": {
    "@docusaurus/module-type-aliases": "3.0.0",
    "@docusaurus/types": "3.0.0"
  },
  "browserslist": {
    "production": [
      ">0.5%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 3 chrome version",
      "last 3 firefox version",
      "last 5 safari version"
    ]
  },
  "engines": {
    "node": ">=18.0"
  }
}
```

## Create a docusaurus.config.js file

```javascript
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

  noIndex: false,
  
  onBrokenAnchors: 'throw',
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
          blogSidebarTitle: 'All posts',
          blogSidebarCount: 'ALL',
          showLastUpdateTime: false
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
            href: '/blog/archive',
            label: 'Archive',
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
```

## Create some blog content

```bash
(
  mkdir -p blog && cd $_

  echo '---' > 2024-02-04-welcome-world.md
  echo 'title: Hello World!' >> 2024-02-04-welcome-world.md
  echo '---' >> 2024-02-04-welcome-world.md
  echo 'Hello world! Proud to be here!!!' >> 2024-02-04-welcome-world.md

  echo '---' > 2024-02-05-my-first-post.md
  echo 'title: My first blog post' >> 2024-02-05-my-first-post.md
  echo '---' >> 2024-02-05-my-first-post.md
  echo 'My first blog post' >> 2024-02-05-my-first-post.md
  echo '' >> 2024-02-05-my-first-post.md
  echo '![Unsplash random](https://source.unsplash.com/random?dinosaure)' >> 2024-02-05-my-first-post.md

  echo '---' > 2024-02-06-my-second-post.md
  echo 'title: My second blog post' >> 2024-02-06-my-second-post.md
  echo '---' >> 2024-02-06-my-second-post.md
  echo 'My second blog post' >> 2024-02-06-my-second-post.md
  echo '' >> 2024-02-06-my-second-post.md
  echo '![Unsplash random](https://source.unsplash.com/random?dinosaure)' >> 2024-02-06-my-second-post.md
)
```

## Time to create our stand alone Docker image

We will create a `johndoe/blog` image using this command:

```bash
docker build --tag johndoe/blog --target production .
```

:::note Just replace `johndoe/blog` by your pseudo in this format `your/a_name`.
:::

Note: since our `Dockerfile` is a multi-stage one, we need to specify which stage we wish. This is done by using the `--target` CLI flag. And the final `.` means the current directory.

Running the command will take a few minutes.

Once finished, you'll then have a new Docker image on your computer. You can retrieve it by running `docker image list` to get the list of local images.

## Use it

Once the Docker image has been created, we need to create an instance of it, i.e. a container.

To do this, just run the following command:

```bash
docker run -d --publish 80:80 --publish 443:443 --name blog johndoe/blog
```

## And play

As you can see above, we've exposed our ports `80` (http) and `443` (https).

To access to website, just start `https://localhost` and you'll have your running blog; as a full standalone image.