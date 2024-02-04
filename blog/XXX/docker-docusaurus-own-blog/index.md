---
slug: docusaurus-docker-own-blog
title: Running your own blog with Docusaurus and Docker
authors: [christophe]
image: /img/docusaurus_tips_social_media.jpg
tags: [docker, docusaurus, node, npm, tips, yarn]
draft: true
enableComments: true
---
# Running your own blog with Docusaurus and Docker

![Running your own blog with Docusaurus and Docker](/img/docusaurus_tips_banner.jpg)

I use [Docusaurus](https://docusaurus.io/) to create this blog. It's a tool for generating static websites (the result is an HTML site); pages created after converting Markdown files into HTML.

Docusaurus requires Node.js to be installed, so I'm supposed to install it first before I can think about installing Docusaurus. But you know what? I'll not install Node.js; I'll just use a Docker image of Node and use it.

<!-- truncate -->

## Creating my Dockerfile

To use a Node.js Docker image, it's really simple. I have to create a file called `Dockerfile` and in its `FROM` clause, I'll identify the image I need. 

So, simply said, I just need to have:

```Dockerfile
FROM node:18-alpine
```

I'm here using the alpine image (the smallest one) and in version `18`. Refers to [https://hub.docker.com/_/node/tags](https://hub.docker.com/_/node/tags) to get the list of existing tags like f.i. `21.6-alpine` if you wish the latest one.

Of course I'll need a few more lines:

```Dockerfile
FROM node:18-alpine

// highlight-next-line
WORKDIR /app

// highlight-next-line
COPY package*.json .

// highlight-next-line
RUN yarn install
```

These two lines will first define the working directory in my image. I will define `/app` as the default directory.

Then, I'll copy files like `package.json` and, if present, `package-lock.json`, from my hard disk to the Docker image. That last line here above will run `yarn install` i.e. start to install any dependencies defined in my `package.json`.

In concrete terms, the `RUN yarn install` command will install Docusaurus.

I still need two lines in my file:

```Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN yarn install

// highlight-next-line
COPY . .

# This command will run Docusaurus and will watch for changes
CMD ["yarn", "start", "--host", "0.0.0.0"]
```

The line `COPY . .` will copy all files of my project and present on my hard disk to the Docker image and, finally, the last command will run `yarn start --host 0.0.0.0` which is the [command to start](https://docusaurus.io/docs/cli) Docusaurus conversion tool (convert from Markdown to HTML) and watch for changes.

## Getting my Node.js required files

Using Node.js, two files are mandatory: `package.json` and `yarn.lock`. We'll retrieve them from the Docusaurus repository on Github.

:::note Using a stable version
It's always preferable to use a stable version like `v3.1.1` and not, just `main`. For this reason, curl statements below will force a version number in the used URL.
::: 

### Creating my package.json

To be able to build my Docker image, I need the `package.json` file (otherwise the instruction `COPY package*.json .` will fail).

A simple way to get the file is to copy the latest one from Github like this:

```bash
curl -o package.json --silent https://raw.githubusercontent.com/facebook/docusaurus/v3.1.1/package.json
```

That command will get the raw content from Github and will create the `package.json` file.

### Creating my yarn.lock

Now, getting `yarn.lock` (that file will be required by the `RUN yarn install` instruction)...

```bash
curl -o yarn.lock --silent https://raw.githubusercontent.com/facebook/docusaurus/v3.1.1/yarn.lock
```

## Creating my .dockerignore

When we use the `COPY . .` instruction in a Dockerfile, by default, Docker will copy everything from the project's directory on your computer to the Docker image being created.

There are a lot of things we know we don't need it to copy in the image, like f.i. the `node_modules` since the `yarn install` instruction will already create it.

Here is my `.dockerignore` file:

```text
/.github/*
/.vscode/
/build/*
/node_modules/*

.gitignore
.markdownlint_ignore
.markdownlint.json
*.log
docker-compose.yml
Dockerfile
LICENSE
makefile
README.md

# These folders will be mounted with docker-compose.yml
# No need to put it in the Docker image
/blog/*
/pages/*
/static/*
```

## Creating my docker-compose.yml

By having a `Dockerfile` and a `.dockerignore` file, I'm able to create my Docker image but not use it as you want.

To use Docusaurus, I need a few files like having my articles, of course. In my case, I'm writing a blog so I need a `blog` folder.

The file below will allow me to use my `Dockerfile` (see the line `build: .`), expose Docusaurus on port `3000` (so I'll work locally on `http://localhost:3000`) and, then, I need a few files and folders.

In the `volumes` section, I'll *mount* the `package.json` and `yarn.lock` Node files so they should be synchronized between the running Docker container and my hard disk (=I need to keep them with my project's source code). I'll mount folders too like `/blog` which will contain my articles in the Markdown format and other Docusaurus specific folders like `/pages`, `/src` and `static`. 

So my file is this one:

```yaml
version: "3.9"

services:
  blog:
    build: .
    ports:
      - 3000:3000
    user: 1000:1000
    volumes:
      - ./package.json:/app/package.json
      - ./yarn.lock:/app/yarn.lock

      - ./blog:/app/blog
      - ./pages:/app/pages
      - ./src:/app/src
      - ./static:/app/static
```

:::info You can use another port if your port `3000` is already used
Replace f.i. the line `3000:3000` to `3001:3000` if the port `3000` is already used on your computer (which is my case since my own blog his running right now).
:::

The line `user: 1000:1000` is important and inform Docker to reuse your local credentials (the one used on your computer). `1000:1000` means the current root user and this is most probably you on Linux.

## Final files, let's try

Let's put it all together and try to build your own blog.

### Create your blog folder

Please, create a temporary directory like `mkdir /tmp/blog && cd $_`.

This done, start your preferred editor; I'll run Visual Studio Code by running `code .` in my Linux console.

### Dockerfile

Please create the `Dockerfile` with this content:

```Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN yarn install

COPY . .

CMD ["yarn", "start", "--host", "0.0.0.0"]
```

### .dockerignore

Please create the `.dockerignore` with this content:

```text
/.github/*
/.vscode/
/build/*
/node_modules/*

.gitignore
.markdownlint_ignore
.markdownlint.json
*.log
docker-compose.yml
Dockerfile
LICENSE
makefile
README.md

/blog/*
/pages/*
/static/*
```

### docker-compose.yml

Please create the `docker-compose.yml` with this content:

```yaml
version: "3.9"

services:
  blog:
    build: .
    ports:
      - 3000:3000
    user: 1000:1000
    volumes:
      - ./package.json:/app/package.json
      - ./yarn.lock:/app/yarn.lock

      - ./blog:/app/blog
    #   - ./pages:/app/pages
    #   - ./src:/app/src
    #   - ./static:/app/static
```

### Create a simple blog item

Before running Docusaurus, first, create a blog post. For ease of use, let's follow this tutorial: [https://docusaurus.io/docs/blog#adding-posts](https://docusaurus.io/docs/blog#adding-posts)

So, create a new `blog` folder to your project, create the a file called `2024-02-04-hello-docusaurus.md` and copy/paste the example from the tutorial.

Right now, you'll have these files / folders in your project:

```bash
❯ tree -a -L 2

.
├── .dockerignore
├── Dockerfile
├── blog
│   └── 2024-02-04-hello-docusaurus.md
└── docker-compose.yml
└── package.json
└── yarn.lock
```

:::info `tree` is not part of core Linux installation
Just in case you're interested by the `tree` utility and don't have yet, simply run `sudo apt-get update && sudo apt-get install tree` to install it. This step is optional.
:::

### Run Docusaurus

At this stage of the tutorial, you've all required files and you've one blog post in the `blog` folder.

Let's start everything:

```bash
docker compose up --detach
```

After a few minutes (only the first time), you'll get something like this:

```text
[+] Building 12.0s (10/10) FINISHED  docker:default
 => [blog internal] load build definition from Dockerfile                                                                                                                              0.2s
 => => transferring dockerfile: 167B            0.0s
 => [blog internal] load metadata for docker.io/library/node:18-alpine                                                                                                                 1.1s
 => [blog internal] load .dockerignore          0.2s
 => => transferring context: 230B               0.0s
 => [blog 1/5] FROM docker.io/library/node:18-alpine@sha256:0085670310d2879621f96a4216c893f92e2ded827e9e6ef8437672e1bd72f437  0.0s
 => [blog internal] load build context          0.2s
 => => transferring context: 165B               0.0s
 => [blog 2/5] WORKDIR /app                     0.0s
 => [blog 3/5] COPY package*.json .             1.6s
 => [blog 4/5] RUN yarn install               225.7s
 => [blog 5/5] COPY . .                         1.8s
 => [blog] exporting to image                   2.1s
 => => exporting layers                         1.9s
 => => writing image sha256:ec34b50098c81453a8530c6757108265b76149312ec6cc04976e411cc1d887c8                                                                                           0.1s
 => => naming to docker.io/library/blog-blog    0.2s
[+] Running 1/1
 ✔ Container blog-blog-1  Started
```

### Run your own blog

Now, just open `http://localhost:3000`