---
slug: docker-quarto
title: Running Quarto Markdown in Docker
authors: [christophe]
image: /img/quarto_tips_social_media.jpg
tags: [docker, markdown, pandoc, quarto, revealjs]
enableComments: true
---
# Running Quarto Markdown in Docker

![Running Quarto Markdown in Docker](/img/quarto_tips_banner.jpg)

[Quarto](https://quarto.org/) is a tool for producing PDF, Word document, HTML web pages, ePub files, slideshows and many, many more output based on a Markdown file.

Using Quarto, you can render any markdown content to a new PDF f.i.

Quarto supports a very large number of features, to which are added extensions from its community, making it a really practical tool for anyone wishing to produce documentation.

Personally, I haven't used a Word-type word processor for several years; nor have I used PowerPoint since, I don't even know when the last time was.

And yet, I produce a great deal of documentation and slideshows. I write everything in markdown and generate pdfs or slideshows from the same content.

Until recently, I'd been using [pandoc](https://pandoc.org/) but, having taken the time to look around Quarto, it's a hell of a lot more powerful.

<!-- truncate -->

Like always on this blog, you will not install Quarto the old-fashioned way. Instead, you'll create our own Docker image.

## Let's play

As usual, you will now create a temporary folder for your experiments. Please start a Linux shell and run `mkdir -p /tmp/docker-quarto && cd $_`.

### Create your own Docker image

Create a new file called `Dockerfile` (there is no extension) with this content:

```dockerfile
# Based on https://github.com/analythium/quarto-docker-examples/blob/main/Dockerfile.base

# Version number of Quarto to download and use
ARG QUARTO_VERSION="1.4.529"

ARG OS_USERNAME=quarto
ARG UID=1000
ARG GID=1000

FROM eddelbuettel/r2u:20.04

# librsvg2-bin is to allow SVG conversion when rendering a PDF file
# (will install the rsvg-view binary)
RUN set -e -x && \
    apt-get update && apt-get install -y --no-install-recommends \
    pandoc \
    pandoc-citeproc \
    curl \
    gdebi-core \
    librsvg2-bin \
    python3.8 python3-pip \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN set -e -x && \
    install.r shiny jsonlite ggplot2 htmltools remotes renv knitr rmarkdown quarto

# Download and install Quarto
ARG QUARTO_VERSION
RUN set -e -x && \
    curl -o quarto-linux-amd64.deb -L https://github.com/quarto-dev/quarto-cli/releases/download/v${QUARTO_VERSION}/quarto-${QUARTO_VERSION}-linux-amd64.deb \
    && gdebi --non-interactive quarto-linux-amd64.deb \
    && rm -f quarto-linux-amd64.deb

# Should be done for the user; won't work if done for root
# (quarto will say that "tinytex is not installed")
ARG OS_USERNAME
ARG UID
ARG GID

RUN set -e -x && \
    groupadd -g $GID -o "${OS_USERNAME}" && \
    useradd -m -u $UID -g $GID -o -s /bin/bash "${OS_USERNAME}"

USER "${OS_USERNAME}"

# Install tools like tinytex to allow conversion to PDF
RUN set -e -x && \
    quarto install tool tinytex --update-path

RUN set -e -x && \
    printf "\e[0;105m%s\e[0;0m\n" "Run tlmgr update" \
    && ~/.TinyTeX/bin/x86_64-linux/tlmgr update --self --all && \
    ~/.TinyTeX/bin/x86_64-linux/fmtutil-sys --all

# See https://github.com/rstudio/tinytex/issues/426 for explanation
RUN set -e -x && \
    printf "\e[0;105m%s\e[0;0m\n" "Run tlmgr install for a few tinyText packages (needed for PDF conversion)" \
    && ~/.TinyTeX/bin/x86_64-linux/tlmgr install fvextra footnotebackref pagecolor sourcesanspro sourcecodepro titling

USER root

RUN set -e -x && \
    mkdir -p /input

USER "${OS_USERNAME}"

WORKDIR /
```

This done, please run `docker build -t cavo789/quarto .` and after something like three minutes the first time, you'll get your own Docker image:

```bash
❯ docker build -t cavo789/quarto .

[+] Building 208.2s (13/13) FINISHED                  docker:default
 => [internal] load .dockerignore                     0.0s
 => => transferring context: 2B                       0.0s
 => [internal] load build definition from Dockerfile  0.0s
 => => transferring dockerfile: 2.08kB                0.0s
 => [internal] load metadata for docker.io/eddelbuettel/r2u:20.04  3.4s
 => CACHED [ 1/10] FROM docker.io/eddelbuettel/r2u:20.04@sha256:133b40653e0ad564d348f94ad72c753b97fb28941c072e69bb6e03c3b8d6c06e 0.0s
 => [ 2/10] RUN set -e -x && apt-get update && apt-get install -y --no-install-recommends     pandoc     pandoc-citeproc     curl     gdebi-core     librsvg2-bin     python3.8   47.6s
 => [ 3/10] RUN set -e -x && install.r shiny jsonlite ggplot2 htmltools remotes renv knitr rmarkdown quarto                                                                       27.2s
 => [ 4/10] RUN set -e -x && curl -o quarto-linux-amd64.deb -L https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.529/quarto-1.4.529-linux-amd64.deb     && gdebi -  12.1s
 => [ 5/10] RUN set -e -x && groupadd -g 1000 -o "quarto" && useradd -m -u 1000 -g 1000 -o -s /bin/bash "quarto"                                                               0.5s
 => [ 6/10] RUN set -e -x && quarto install tool tinytex --update-path                                   23.0s
 => [ 7/10] RUN set -e -x && printf "\e[0;105m%s\e[0;0m\n" "Run tlmgr update"     && ~/.TinyTeX/bin/x86_64-linux/tlmgr update --self --all && ~/.TinyTeX/bin/x86_64-linux/fm  77.9s
 => [ 8/10] RUN set -e -x && printf "\e[0;105m%s\e[0;0m\n" "Run tlmgr install for a few tinyText packages (needed for PDF conversion)"     && ~/.TinyTeX/bin/x86_64-linux/tlmgr   11.7s
 => [ 9/10] RUN set -e -x && mkdir -p /input                   0.5s
 => exporting to image               4.0s
 => => exporting layers              4.0s
 => => writing image sha256:fe1d20bd71a66eb574ba1f5b35c988ace57c2c30f93159caa4d5de2f8c490eb0                  0.0s
 => => naming to docker.io/cavo789/quarto                                                                     0.0s

What's Next?
  View summary of image vulnerabilities and recommendations → docker scout quickview
```

:::tip Choose your own name
The previous instruction `docker build -t cavo789/quarto .` has created an image called `cavo789/quarto`. You can for sure choose a different name without any impact on the image.
:::

You can quickly check the size of your image; quite huge but except you're very low in memory / disk space; this is really not a big deal.

```bash
❯ docker image list | grep quarto

cavo789/quarto  latest  fe1d20bd71a6  10 minutes ago  2.14GB
```

### Using Quarto and generate a PDF file

Create a new `test.md` file in your `/tmp/docker-quarto` folder with this content:

```markdown
# What's is Quarto? Explain like I'm five

Imagine you want to write a story or a report, but instead of using a fancy computer program, you use plain text. That's kind of like Markdown, a simple language that lets you format your text without getting too complicated.

Now, Quarto is like a super-powered writing tool that understands Markdown and can also help you write code in different languages, like R or Python. It's like having a helper in your writing process, making things easier and more fun.

So, if you want to create documents, presentations, or even books, Quarto and Markdown can be your friends. They'll help you organize your thoughts, add cool features, and even share your work with the world.
```

Now, back to your Linux console and you'll convert that file to a pdf. **Please refers to the official documentation of [Quarto](https://quarto.org/) to get in-depth information about it.**

To convert to a PDF, the instruction to fire is `quarto render test.md --to pdf`. But since you're using Quarto from a Docker image, the instruction becomes `docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to pdf`.

:::tip Docker CLI reminder
As a reminder, the used Docker run command are (almost always the same):

* `-it` to start Docker interactively, this will allow the script running in the container to ask you for some prompts f.i.,
* `--rm` to ask Docker to kill and remove the container as soon as the script has been executed (otherwise you'll have a lot of exited but not removed Docker containers; you can check this by not using the `--rm` flag then running `docker container list` on the console),
* `-v ${PWD}:/input` to share your current folder with a folder called `/input` in the Docker container,
* `-w /input` to tell Docker that the current directory, in the container, will be the `/app` folder,
* `-u $(id -u):$(id -g)` ask Docker to reuse our local credentials so when a file is updated/created in the container, the file will be owned by you,
* then `cavo789/quarto` which is the name of your Quarto Docker image, and, finally,
* `quarto render test.md --to pdf` i.e. the command line to start within the container.
:::

So, let's convert to PDF and run `docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to pdf` in your console.

```bash
❯ docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to pdf`

pandoc
  to: latex
  output-file: test.tex
  standalone: true
  pdf-engine: xelatex
  variables:
    graphics: true
    tables: true
  default-image-extension: pdf

metadata
  documentclass: scrartcl
  classoption:
    - DIV=11
    - numbers=noendperiod
  papersize: letter
  header-includes:
    - '\KOMAoption{captions}{tableheading}'
  block-headings: true

Rendering PDF
running xelatex - 1
  This is XeTeX, Version 3.141592653-2.6-0.999995 (TeX Live 2023) (preloaded format=xelatex)
   restricted \write18 enabled.
  entering extended mode

running xelatex - 2
  This is XeTeX, Version 3.141592653-2.6-0.999995 (TeX Live 2023) (preloaded format=xelatex)
   restricted \write18 enabled.
  entering extended mode

Output created: test.pdf
```

![Your PDF file](./images/pdf_version.png)

:::tip Hide non-essential information
Add the `--log-level warning` CLI argument to Quarto to ask him to show only warning (and error) messages. Non-essential output will be hidden and you'll keep a clean console. The new command to use is thus `docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to pdf --log-level warning`
:::

### Using Quarto and generate a HTML file

Simply modify the `--to` argument and replace `pdf` by `html` and run the command: `docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to html --log-level warning`

Now, you've a `test.html` file in your directory.

### Using Quarto and generate a revealjs slideshow

This time, the `--to` argument should be set to `revealjs`: `docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to revealjs --log-level warning`

Open the `test.html` file and you'll get this:

![Revealjs - one slide](./images/revealjs_version1.png)

Ok, you've just one slide now. Reopen the `test.md` file and you'll insert *slide breaks*. This can be done using the `----` syntax:

```markdown
# What's is Quarto? Explain like I'm five

Imagine you want to write a story or a report, but instead of using a fancy computer program, you use plain text. That's kind of like Markdown, a simple language that lets you format your text without getting too complicated.

----

Now, Quarto is like a super-powered writing tool that understands Markdown and can also help you write code in different languages, like R or Python. It's like having a helper in your writing process, making things easier and more fun.

----

So, if you want to create documents, presentations, or even books, Quarto and Markdown can be your friends. They'll help you organize your thoughts, add cool features, and even share your work with the world.
```

Rerun `docker run -it --rm -v ${PWD}:/input -w /input -u $(id -u):$(id -g) cavo789/quarto quarto render test.md --to revealjs --log-level warning` and now your slideshow will have three slides (press <kbd>space</kbd> or arrow keys for navigation):

![Revealjs - slide 1](./images/revealjs_slide1.png)

![Revealjs - slide 2](./images/revealjs_slide2.png)

![Revealjs - slide 3](./images/revealjs_slide3.png)

:::tip Just deploy your slideshow online
The nice thing now is that your slideshow is ready to be deployed on your remote server. Copy the html file and the associated folder (in our use case here, file `test.html` and folder `test_files`) to your FTP server f.i. and your website can be publicly accessed. Nice, isn't it?
:::
