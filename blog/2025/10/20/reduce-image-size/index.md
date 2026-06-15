---
slug: reduce-image-size
title: CaesiumCLT – Effortlessly compress your images right on your device
date: 2025-10-20
description: Fast and efficient lossy/lossless image compression tool
authors: [christophe]
image: /img/v2/image_optimization.webp
mainTag: linux
tags:
  - docker
  - linux
language: en
updates:
  - date: 2026-02-04
    note: add recursive CLI
blueskyRecordKey: 3m3m74j2e6c2e
---
<!-- cspell:ignore Korben,Squoosh,brew,caesiumclt,behat -->

![CaesiumCLT – Effortlessly compress your images right on your device](/img/v2/image_optimization.webp)

<TLDR>
This article introduces CaesiumCLT, a command-line tool for efficiently compressing images. The author explains how to install the tool using Homebrew and provides a practical command to convert and compress PNG files into the modern WEBP format, demonstrating significant file size reduction. The post also includes a helpful shell command to identify directories with the largest image files, allowing you to target your optimization efforts effectively, and mentions how to run the compression recursively through subfolders.
</TLDR>

Korben, a well-known French blogger, has recently posted this article: [https://korben.info/caesium-compression-images-ecologie-numerique.html](https://korben.info/caesium-compression-images-ecologie-numerique.html) and, damned, just a few days too late for me.

I just recreate all images on my blog and I've manually converted all images ... one by one ... using [Squoosh](https://squoosh.app/).

Let's see in this article how to do the conversion using a single command line.

<!-- truncate -->

## Installation

The installation guide is available here: [https://saerasoft.com/caesiumclt/](https://saerasoft.com/caesiumclt/).

If, like me, you don't have `brew` yet, just run this command to install it globally: `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`.

This done, just run `brew install caesiumclt`.

Make sure to read the information's displayed on the console because you'll need to finalize the installation by editing your `.bashrc` file and install `caesiumclt` in your `PATH`.

## Run the optimization tool

On my own, I just go in the folder where I've my images and run this command:

<Terminal typewriter source="./files/terminal-3.txt" />

As we can see here above, I've converted seven PNG to WEBP, the new files are stored in the same folder.

Now, I just need to manually edit my blog post (using these images)

<AlertBox variant="tip" title="Do it recursively">
Add the `--recursive` flag like in `caesiumclt -q 85 --recursive --format webp --same-folder-as-input *.png` to process all files from your current folder.
</AlertBox>

## How to determine the biggest folders on your disk

On my blog, I'm writing blog posts in folders like `blog/2025/10/02/` i.e. I create a folder based on the publication date. Then I'm putting images for that article in a `images` subfolder.

This said, to retrieve the biggest folder on my disk, I'm running the command below. It will retrieve all `.png` files them sum their size by directories and list the directories by size.

<Terminal typewriter source="./files/terminal-2.txt" />

So, I can jump in `2025/02/01/heimdall-dashboard/images` and run `caesiumclt -q 85 --format webp --same-folder-as-input *.png` to optimize these images:

<Terminal typewriter source="./files/terminal-1.txt" />
