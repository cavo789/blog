---
slug: markitdown
title: Markitdown - Convert files and MS Office documents to Markdown
authors: [christophe]
image: /img/markdown_tips_social_media.jpg
tags: [docker, docx, excel, xlsx]
enableComments: true
draft: true
---
![Markitdown - Convert files and MS Office documents to Markdown](/img/markdown_tips_banner.jpg)

Recently a good friend has notified me about a new tool from Microsoft: an utility for converting PDF and MS Office files (like `.docx` or `.xlsx`) to Markdown.

By looking at the repo on Github ([https://github.com/microsoft/markitdown/](https://github.com/microsoft/markitdown/)), it seems really interesting since, they said "it converts pdf, powerpoint, word, excel, images, audio, html, text-based formats like csv, json or xml and even zip file (iterates over contents)". It's a lovely promise!

So, because it's always good to be able to quickly convert somes docx files written by colleagues who don't speak Markdown, I was really interested to test it.

<!-- truncate -->

Like always, I'll first create a Docker image so I don't need to install Python on my machine neither to install the utility and all its dependencies.

I'll create a Docker image, play with the tool and just remove the image then when no more needed and my computer stay clean.

## Create our Docker image

Let's create a new folder and jump in it: `mkdir -p /tmp/markitdown && cd $_`

Then please create a new file called `Dockerfile`:

<details>

<summary>Dockerfile</summary>

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.13-slim AS base

RUN set -e -x \
    && pip install markitdown \
    && mkdir -p /in

WORKDIR "/in"
```

</details>

As you can see, that file is quite straight-forward: we'll start from a Python image, install the utility and just create a folder called `in` where we'll put files we wish to convert.

We'll build the image by running `docker build -t markitdown .`.  So, now, we've our own image called `markitdown`.

Now, we'll create a Docker container and jump in it just by running this command: `docker run -it --rm -v .:/in markitdown /bin/sh`. The `-v .:/in` part means: we'll share our local folder with the container. So every files we'll put in our `/tmp/markitdown` folder will be accessible inside the container; in the `/in` folder.

I've put some files in my `/tmp/markitdown` folder:

```bash
❯ pwd

/tmp/markitdown

❯ ls
Dockerfile  test.docx  test.pdf  test.xlsx
```

and, as expected, by going into the container (by running `docker run -it --rm -v .:/in markitdown /bin/sh`), I can retrieved them:

```bash
❯ docker run -it --rm -v .:/in markitdown /bin/sh

> ls
Dockerfile  test.docx  test.pdf  test.xlsx
```

## Run the conversion

First, let's check if `markitdown` is well installed: run `markitdown --help` and you should get the help screen.

Ok, everything is in place.

To convert a file, as stated in the official [documentation](https://github.com/microsoft/markitdown/tree/main?tab=readme-ov-file#markitdown), it's just `markitdown input_file > output_file.md`

So, for instance:

* `markitdown test.docx > from_docx.md` to convert a Word document,
* `markitdown test.xlsx > from_xlsx.md` to convert a Excel workbook or, even,
* `markitdown test.pdf > from_pdf.md` to convert a PDF.

### Run the conversion from your host

You don't need to jump in the container but you can do the conversion directly like this: `docker run -it --rm -v .:/in markitdown markitdown test.docx > test_docx.md`

:::note
The first `markitdown` in the command above is the name of our Docker image.
The second `markitdown` you can see is the name of the utility to run.
:::

## Python API

Take a look on the [documentation](https://github.com/microsoft/markitdown/tree/main?tab=readme-ov-file#markitdown), you can also call it like any Python library:

```python
from markitdown import MarkItDown

md = MarkItDown()
result = md.convert("test.xlsx")
print(result.text_content)
```

