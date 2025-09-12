---
date: 2024-12-26
slug: markitdown
title: Markitdown - Convert files and MS Office documents to Markdown
authors: [christophe]
image: /img/markdown_tips_social_media.jpg
mainTag: markdown
tags: [docker, docx, excel]
---
![Markitdown - Convert files and MS Office documents to Markdown](/img/markdown_tips_banner.jpg)

<!-- cspell:ignore markitdown -->

Recently a good friend has notified me about a new tool from Microsoft: an utility for converting PDF and MS Office files (like `.docx` or `.xlsx`) to Markdown.

By looking at the repo on Github ([https://github.com/microsoft/markitdown/](https://github.com/microsoft/markitdown/)), it seems really interesting since, they said, "it converts pdf, PowerPoint, word, excel, images, audio, html, text-based formats like csv, json or xml and even zip file (iterates over contents)". It's a lovely promise!

So, because it's always good to be able to quickly convert some docx files written by colleagues who don't speak Markdown, I was really interested to test it.

<!-- truncate -->

Like always, I'll first create a Docker image so I don't need to install Python on my machine neither to install the utility and all its dependencies.

:::tip I love Docker also for this
This is something I really, really love with Docker: the concept of isolation: everything I'll do inside Docker will stay inside Docker. Once I've finished to play, hop, I can delete the image and nothing stay on my disk except the `Dockerfile` script I've written so I can recreate the image easily.
:::

## Create our Docker image

Let's create a new folder and jump in it: `mkdir -p /tmp/markitdown && cd $_`

Then please create a new file called `Dockerfile`:

<Snippet filename="Dockerfile">

```docker
FROM python:3.13-slim AS base

RUN set -e -x \
    && pip install markitdown \
    && mkdir -p /in

WORKDIR "/in"

ENTRYPOINT [ "/bin/sh" ]
```

</Snippet>

As you can see that file is quite straightforward: we'll start from a Python image, install the utility and just create a folder called `in` where we'll put files we wish to convert.

We'll build the image by running `docker build -t markitdown .`.  So, now, we've our own image called `markitdown`.

And, because we've created a Docker image, we can use it from everywhere; not only from the current folder.

## Prepare our conversion

Jump in any directory on your disk where you've a supported file like `.docx` or `.xlsx` (see [https://github.com/microsoft/markitdown/](https://github.com/microsoft/markitdown/) to know which file format are supported).

For the demo, I'll create some dummy files: `test.docx`, `test.pdf` and `test.xlsx` in my current folder.

<Terminal>
$ ls -alh
Permissions Size User       Group      Date Modified    Name
drwxr-xr-x     - christophe christophe 2024-12-26 10:26 .
drwxrwxrwt     - root       root       2024-12-26 10:17 ..
.rw-r--r--   143 christophe christophe 2024-12-26 10:17 Dockerfile
.rw-r--r--   19k christophe christophe 2024-12-26 10:26 test.docx
.rw-r--r--  100k christophe christophe 2024-12-26 10:26 test.pdf
.rw-r--r--   10k christophe christophe 2024-12-26 10:26 test.xlsx
...
</Terminal>

As you know, to run an interactive shell session, we just need to call `docker run -it --rm` with some parameters.

In our case, we need to share our current folder with Docker; to do this, we'll use this flag: `-v .:/in`.  Our current folder will be accessible as the `/in` folder in the container.

:::note
Remember our Dockerfile: we've made the `/in` folder the default one and we've instructed Docker to run `/bin/sh` (i.e. a shell) as the entrypoint.
:::

So, we just need to run: `docker run -it --rm -v .:/in markitdown` to enter in the container.

## Run the conversion

First, let's check if `markitdown` is well installed: run `markitdown --help` and you should get the help screen.

Ok, everything is in place.

To convert a file, as stated in the official [documentation](https://github.com/microsoft/markitdown/tree/main?tab=readme-ov-file#markitdown), it's just `markitdown input_file > output_file.md`

So, for instance:

<Terminal>
$ markitdown test.docx > from_docx.md

$ markitdown test.xlsx > from_xlsx.md

$ markitdown test.pdf > from_pdf.md

</Terminal>

:::note
Since we have not taken time to create an unprivileged user inside our container, we're running the container as root. By running the conversion as illustrated here above, the created files will be owned by the root user.
:::

### Run the conversion from your host

Hey! you don't need to jump in the container but you can do the conversion directly like this: `docker run -it --rm -v .:/in markitdown markitdown test.docx > test_docx.md`

:::tip
And now, if you pay attention to who own the file, it's you and no more root. It's then easier to do the conversion like this.
:::

:::note
The first `markitdown` in the command above is the name of our Docker image.
The second `markitdown` you can see is the name of the utility to run.
:::

## Python API

Take a look on the [documentation](https://github.com/microsoft/markitdown/tree/main?tab=readme-ov-file#markitdown), you can also call it like any Python library:

<Snippet filename="test.py">

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("test.xlsx")
print(result.text_content)
```

</Snippet>

It then can be easy to grab any files in a directory f.i. and convert them in Markdown. Using Python will allow you to do things like downloading files, calling APIs, ... and convert files to `.md`.
