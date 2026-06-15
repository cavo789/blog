---
slug: markitdown
title: Markitdown - Convert files and MS Office documents to Markdown
date: 2026-05-04
description: Easily convert MS Office documents (Word, Excel) and PDFs into Markdown format with Microsoft's Markitdown tool. Includes step-by-step instructions for installation via Docker.
authors: [christophe]
image: /img/v2/markdown.webp
mainTag: markdown
tags:
  - docker
  - excel
  - markdown
language: en
blueskyRecordKey: 3mkzumi3cf22g
---
![Markitdown - Convert files and MS Office documents to Markdown](/img/v2/markdown.webp)

<!-- cspell:ignore markitdown -->

<TLDR>This post explores how to use Microsoft's Markitdown, a highly capable utility for converting files like Word documents, Excel spreadsheets, and PDFs into clean Markdown format. To keep your local system clean and avoid managing Python dependencies globally, the author provides a step-by-step guide to setting up the tool inside an isolated, lightweight Docker container. The tutorial covers creating a customized Dockerfile, using Docker Compose for orchestration, and ultimately building a global executable wrapper script (md-convert). This setup allows you to securely and effortlessly run document conversions from any directory directly via your terminal.</TLDR>

Recently, a friend told me about a tool from Microsoft called [Markitdown](https://github.com/microsoft/markitdown/): a utility for converting PDF and MS Office files (like `.docx` or `.xlsx`) into Markdown. Looking at the GitHub repository, it seems highly capable. They claim it converts PDFs, PowerPoint, Word, Excel, images, audio, HTML, and text-based formats like CSV, JSON, or XML—and even iterates through ZIP files. That is a huge promise! Since it is always useful to quickly convert `.docx` files from colleagues who do not write in Markdown, I wanted to rigorously test it.

In this article, we'll create a Docker image and a small conversion script called `md-convert` that you'll be able to call from everywhere on your disk to easily convert `docx`, `xlsx` and `pdf` files to Markdown thanks to Markitdown.

<!-- truncate -->

Like always, I'll first create a Docker image so I don't need to install Python on my machine nor manage the utility and all its dependencies.

<AlertBox variant="info" title="I love Docker also for this">
This is exactly why Docker is indispensable: complete isolation. Everything runs within the container. Once I am done experimenting, I can delete the image, leaving nothing on my disk except the Dockerfile needed to recreate it on demand.
</AlertBox>

## Create our Docker image

Let's create a new folder and jump into it: `mkdir -p /tmp/markitdown && cd $_`

Then please create a new file called `Dockerfile`:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<AlertBox variant="info" title="Supported extensions">
See the `pip install --prefix=/python "markitdown[docx,xlsx,pdf]==0.1.5"` line in our `Dockerfile`; we could replace `docx,xlsx,pdf` by `all` to be able to convert from any extensions supported by Markitdown but our final Docker image will be bigger in size.

Or, simply add any additional extensions you need. Refer to the official documentation for this.
</AlertBox>

## Create an orchestration file

This step is not mandatory, but creating a `compose.yaml` file will allow us to simplify the final command and bake in strict security options.

Please create the `compose.yaml` file with this content:

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

## Build the image

Once the two files have been created, simply run `docker compose build` to build the Docker image. The final image will be called `markitdown`.

You can then test it by running this command: `docker compose run --rm markitdown --help`.

## Start a first conversion

Now, copy any `.docx` file into the same folder containing your `Dockerfile` and `compose.yaml`. Let's say in the folder `/tmp/markitdown`.

You can then run the conversion by running this command: `docker compose run --rm markitdown sample.docx > sample.md`.

However, this approach is not very practical for daily use. It would be much easier to run the conversion from any directory.

### Using a binary

Let's create the `md-convert` file:

<Snippet filename="/usr/local/bin/md-convert" source="./files/md-convert.sh" />

And make sure to make this file executable: `sudo chmod +x /usr/local/bin/md-convert`.

From now on, simply navigate to any folder containing a document you want to convert. For example:

<Terminal typewriter source="./files/terminal-1.txt" />

## Conclusion

Thanks to Markitdown and the `md-convert` wrapper script we just built, converting office documents into clean Markdown is now effortless, secure, and native to your terminal.

Check the [official repository](https://github.com/microsoft/markitdown/) for the complete list of supported file formats:

* PDF
* PowerPoint
* Word
* Excel
* Images (EXIF metadata and OCR)
* Audio (EXIF metadata and speech transcription)
* HTML
* Text-based formats (CSV, JSON, XML)
* ZIP archives (iterates recursively over contents)
* YouTube URLs
* EPUBs
* ... and more!

In this guide, we deliberately focused on compiling only the extensions for Word, Excel, and PDF (`[docx,xlsx,pdf]`) to keep our Docker image lightweight and strictly scoped. However, you can easily expand the tool's capabilities to suit your needs. Simply adjust the `pip install` extras in the `Dockerfile` and rebuild your image.

Refer to the [Optional Dependencies](https://github.com/microsoft/markitdown/#optional-dependencies) section in the official documentation to explore the full potential of this utility.
