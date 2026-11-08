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
updates:
  - date: 2026-07-30
    note: "markitdown updated from v0.1.5 to v0.1.7; Dockerfile and AlertBox version reference updated."
  - date: 2026-11-08
    note: "md-convert is now a shell function for zsh and bash (~/.zsh/fns or ~/.bash/fns), the Dockerfile lives in ~/tools/markitdown; compose.yaml is gone."
blueskyRecordKey: 3mkzumi3cf22g
---
![Markitdown - Convert files and MS Office documents to Markdown](/img/v2/markdown.webp)

<!-- cspell:ignore markitdown -->

<TLDR>This post explores how to use Microsoft's Markitdown, a highly capable utility for converting files like Word documents, Excel spreadsheets, and PDFs into clean Markdown format. To keep your local system clean and avoid managing Python dependencies globally, the author provides a step-by-step guide to setting up the tool inside an isolated, lightweight Docker container. The tutorial covers creating a customized Dockerfile and an `md-convert` shell function, for zsh or bash. This setup allows you to securely and effortlessly run document conversions from any directory directly via your terminal.</TLDR>

Recently, a friend told me about a tool from Microsoft called [Markitdown](https://github.com/microsoft/markitdown/): a utility for converting PDF and MS Office files (like `.docx` or `.xlsx`) into Markdown. Looking at the GitHub repository, it seems highly capable. They claim it converts PDFs, PowerPoint, Word, Excel, images, audio, HTML, and text-based formats like CSV, JSON, or XML—and even iterates through ZIP files. That is a huge promise! Since it is always useful to quickly convert `.docx` files from colleagues who do not write in Markdown, I wanted to rigorously test it.

In this article, we'll create a Docker image and a small conversion function called `md-convert` that you'll be able to call from everywhere on your disk to easily convert `docx`, `xlsx` and `pdf` files to Markdown thanks to Markitdown.

<AlertBox variant="note" title="Just need an Excel range or a CSV file as a Markdown table?">
Markitdown is a general-purpose, heavier tool. If your need is narrower — just turning a copied Excel range or a CSV file into a Markdown table — my <Link to="/blog/markdown-xls2md">XLS2MD</Link> and <Link to="/blog/markdown-csv2md">CSV2MD</Link> online tools are quicker, no Docker required.
</AlertBox>

<!-- truncate -->

## First Conversion

Once the image and the `md-convert` function are installed (covered under Installation below), converting a document is one command from any folder:

<Terminal typewriter source="./files/terminal-1.txt" />

## Why This Approach

As always, I'll first create a Docker image so I don't need to install Python on my machine nor manage the utility and all its dependencies.

<AlertBox variant="info" title="I love Docker also for this">
This is exactly why Docker is indispensable: complete isolation. Everything runs within the container. Once I am done experimenting, I can delete the image, leaving nothing on my disk except the Dockerfile needed to recreate it on demand. *If that reasoning is new to you, <Link to="/blog/docker-definition-like-im-five">Docker - Explain me like I'm five - What's Docker for?</Link> makes the case with a cooking analogy.*
</AlertBox>

## Installation

### Create our Docker image

The Dockerfile gets a permanent home, `~/tools/markitdown`, so the image can be rebuilt any time (new machine, `docker image prune`, a new Markitdown version):

<ProjectSetup folderName="~/tools/markitdown" createFolder={true}>
  <Guideline>
    Now, run 'docker build -t markitdown ~/tools/markitdown' to create the Docker image.
  </Guideline>
<Snippet filename="Dockerfile" source="./files/Dockerfile" />
</ProjectSetup>

<AlertBox variant="info" title="Supported extensions">
See the `pip install --prefix=/python "markitdown[docx,xlsx,pdf]==0.1.7"` line in our `Dockerfile`; we could replace `docx,xlsx,pdf` by `all` to be able to convert from any extensions supported by Markitdown but our final Docker image will be bigger in size.

Or, simply add any additional extensions you need. Refer to the official documentation for this.
</AlertBox>

Build it:

```bash
docker build -t markitdown ~/tools/markitdown
```

### Make `md-convert` available everywhere

What turns that image into a command is one function, in its own file in a folder your shell loads at startup (the organisation explained in <Link to="/blog/modular-zsh-workflow">my modular ZSH workflow</Link>). It mounts the **current folder** into the container, read-only everywhere else, unprivileged, and thrown away after each conversion:

<Snippet filename="md-convert.sh" source="./files/md-convert.sh" defaultOpen={true} />

The code is the same for zsh and bash; only the folder and the loader differ.

<Tabs groupId="shell">
<TabItem value="zsh" label="zsh" default>

**1. Create the file** in `~/.zsh/fns/`:

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="md-convert.zsh" source="./files/md-convert.sh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed one of my <Link to="/series/ollama-daily-use">"Ollama daily use"</Link> articles. Otherwise, add at the end of `~/.zshrc`:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh`).

</TabItem>
<TabItem value="bash" label="bash">

**1. Create the file** in `~/.bash/fns/`:

<ProjectSetup folderName="~/.bash/fns">
  <Snippet filename="md-convert.sh" source="./files/md-convert.sh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.bashrc`.** Add at the end of `~/.bashrc` (the `-r` test keeps an empty folder from printing an error):

```bash title="~/.bashrc"
for fn_file in ~/.bash/fns/*.sh; do
  [[ -r "$fn_file" ]] && source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec bash`).

</TabItem>
</Tabs>

Check that the shell knows the function: `type md-convert` must answer `md-convert is a shell function`.

If the image is missing, `md-convert` doesn't fail with a cryptic Docker error: it prints the exact `docker build` command to run, or, when `~/tools/markitdown/Dockerfile` is gone too, points back to this article.

<AlertBox variant="note" title="Coming from the previous version of this article?">
It installed `md-convert` as a script in `/usr/local/bin/`. Remove it (`sudo rm /usr/local/bin/md-convert`): the function takes over, and the old script would otherwise linger on your disk.
</AlertBox>

## Conclusion

Thanks to Markitdown and the `md-convert` function we just built, converting office documents into clean Markdown is now effortless, secure, and native to your terminal.

Check the [official repository](https://github.com/microsoft/markitdown/) for the complete list of supported file formats:

- PDF
- PowerPoint
- Word
- Excel
- Images (EXIF metadata and OCR)
- Audio (EXIF metadata and speech transcription)
- HTML
- Text-based formats (CSV, JSON, XML)
- ZIP archives (iterates recursively over contents)
- YouTube URLs
- EPUBs
- ... and more!

In this guide, we deliberately focused on compiling only the extensions for Word, Excel, and PDF (`[docx,xlsx,pdf]`) to keep our Docker image lightweight and strictly scoped. However, you can easily expand the tool's capabilities to suit your needs. Simply adjust the `pip install` extras in `~/tools/markitdown/Dockerfile` and rebuild your image.

Refer to the [Optional Dependencies](https://github.com/microsoft/markitdown/#optional-dependencies) section in the official documentation to explore the full potential of this utility.

<AlertBox variant="tip" title="Complex PDFs, dense tables, scanned pages?">
Markitdown parses each format with a dedicated library, which is fast and light but sometimes flattens a complex layout. When the document really matters, I now reach for a second, heavier image built the exact same way: see <Link to="/blog/docling">Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated</Link>, which runs real layout and table-structure models (on the GPU, if you have one).
</AlertBox>
