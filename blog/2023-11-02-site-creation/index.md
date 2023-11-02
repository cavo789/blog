---
slug: site-creation
title: Site creation
authors: [christophe]
tags: [docusaurus, nodejs, docker]
---
# Creation of this blog

Here are the steps I followed to create this blog. 

## Using Docusaurus

Since I really like the simplicity of Docker, I will not install NodeJs on my machine but use the official Docker image

```bash
docker run --rm --name blog --user $UID:$GID -it -v ${PWD}/:/project -w /project node /bin/bash
```

The instruction here above will download NodeJs (the latest version) on my machine if not yet present and create a running instance (called a *container* of it). The flag `--user $UID:$GID` is used to start the container using the same credentials than my local one (i.e., reuse my local Unix `christophe` user so files/folders created in the container will be owned by my local user).

The `-v ${PWD}/:/project` command line argument will share my current folder on my computer with the container i.e., the `/project` folder in the container will be my current folder on my computer.

And finally, I run an interactive shell since I have mentionned `/bin/bash` as entry point.

Now that I have a prompt in the container, I will create my blog using Docusaurus (as explained in the [official documentation](https://docusaurus.io/docs/installation)).

```bash
npx create-docusaurus@latest blog classic
```

After a long time, the blog folder is created and I can take a look on his content:

```bash
❯ tree -d -L 1
.
├── blog
├── docs
├── node_modules
├── src
└── static
```

The installation step is now finished, I will exit the container and return to my computer, to do this, from the Docker console, I just type `exit`.

## Run the website

Back to my computer, I will now go inside my `blog` folder (`cd blog`) and run the Docker command again but this time with the `-p 3000:3000` extra parameter. This parameter will expose the port `3000` from the container with my machine so I can see the website by surfing to `http://localhost:3000`.

Instead of running an interactive shell session I prefer to run `/bin/bash -c "npx docusaurus start"` to run Docusaurus watcher and serve my files:

```bash
cd blog
docker run --rm -it --name blog --user $UID:$GID -v ${PWD}/:/project -w /project -p 3000:3000 node /bin/bash -c "npx docusaurus start --host 0.0.0.0"
```

After a few seconds, the container is ready to use and I surf to my site by going to `http://localhost:3000`.

![Homepage](./homepage.png)

:::important
It is really crucial to use the `--host 0.0.0.0` flag when calling `npx docusaurus start`. This will allow external access to the website. If missing, surfing to `http://localhost:3000` (or running `curl http://127.0.0.1:3000`) will display an error `Empty reply from server`.
:::

## Some settings

By default (using the standard installation), Docusaurus will create a skeleton of website having two main entries: a blog and a tutorial.

For keeping things manageable, I will only keep the blog and remove the tutorial part. For this, I have followed this official article: [https://docusaurus.io/docs/blog#blog-only-mode](https://docusaurus.io/docs/blog#blog-only-mode).

Now, I can remove the `/docs` folder from my `blog` directory:

```bash
❯ tree -d -L 1
.
├── blog
├── node_modules
├── src
└── static
```

I will also make some changes to files like `docusaurus.config.js` or `blog/authors.yml` to fit my needs.

## Make my first article

With my preferred editor ([vscode](https://code.visualstudio.com/)) I open my blog website (I just type `code .` in my Linux console to open my `blog` project).

Now, in the `/blog` directory, I create a new folder called `2023-11-02-site-creation` and there I create the `index.md` file.

:::note
When my blog post only contains text and no images or linked files, I can just create a `.md` file like `/blog/2023-11-02-this-is-a-test.md`. The creation of a folder is thus not mandatory at all.
::: 

In the previous chapter, npx was executed using the `docker run --rm -it --name blog --user $UID:$GID -v ${PWD}/:/project -w /project -p 3000:3000 node /bin/bash -c "npx docusaurus start --host 0.0.0.0"` command so, every changes done to the blog will be immediately synchronized with Docker i.e., I just need to save my article and npx will reload my site; very easy and convenient.

### Using some layouts

Docusaurus support some Markdown special tags called *admonition* (see [https://docusaurus.io/docs/markdown-features/admonitions](https://docusaurus.io/docs/markdown-features/admonitions)).

For instance, to display a paragraph as a tip, like below, just use the following syntax:

```text
:::tip
Some **content** with _Markdown_ `syntax`.
:::
```

:::tip
Some **content** with _Markdown_ `syntax`.
:::

To get the entire list of supported features, read [Markdown Features](https://docusaurus.io/docs/markdown-features).

## Push to Github

On Github.com, I have created a new repository called `blog` ([https://github.com/cavo789/blog](https://github.com/cavo789/blog)). This done, back to my console and I run a few git commands:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin git@github.com:cavo789/blog
git push -u origin master
```

This done, I have thus pushed my files to Github as foresee by Docusaurus i.e., for instance, the `/node_modules` is not part of my repo; which is fine since we will create that folder later by running some npx command on the webserver where the site will be hosted.

## Build static version of the blog

In order to build static pages, I run `docker run --rm -it --user $UID:$GID -v ${PWD}/:/project -w /project node /bin/bash -c "yarn build"`.

This will create/update the `/build` folder with a fresh version of the site.

Next step is to start my FTP client (which is [WinSCP](https://winscp.net/eng/download.php)) and copy my local `/blog/build` folder to my remote website.

### Using automation

WinSCP support automation so ...

I have created a file called `WinSCP_deploy.txt` in my blog folder with this content:

```text
option batch abort
option confirm off 

open ftp://USERNAME:PASSWORD@HOST_OR_IP/

lcd ./build/
cd /public_html

put *.*

close

exit
```

:::note
I have replaced `ftp://USERNAME:PASSWORD@HOST_OR_IP/` with my real credentials. *A sample `WinSCP_deploy.txt.dist` is available on my github blog repository.*
:::

Now, the only thing I have to do is to call my `deploy.sh` script.