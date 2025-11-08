---
slug: reduce-image-size
title: CaesiumCLT – Effortlessly compress your images right on your device
date: 2025-10-20
description: Fast and efficient lossy/lossless image compression tool
authors: [christophe]
image: /img/v2/image_optimization.webp
mainTag: optimization
tags: [images, optimization, tips]
language: en
blueskyRecordKey: 3m3m74j2e6c2e
---
<!-- cspell:ignore Korben,Squoosh,brew,caesiumclt,behat -->

![CaesiumCLT – Effortlessly compress your images right on your device](/img/v2/image_optimization.webp)

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

<Terminal>
$ caesiumclt -q 85 --format webp --same-folder-as-input *.png

[00:00:00] [#########################################]
Compressed 7 files (7 success, 0 skipped, 0 errors)
3.5 MiB -> 250.7 KiB [-3.3 MiB | -93.00%]
</Terminal>

As we can see here above, I've converted seven PNG to WEBP, the new files are stored in the same folder.

Now, I just need to manually edit my blog post (using these images)

## How to determine the biggest folders on your disk

On my blog, I'm writing blog posts in folders like `blog/2025/10/02/` i.e. I create a folder based on the publication date. Then I'm putting images for that article in a `images` subfolder.

This said, to retrieve the biggest folder on my disk, I'm running the command below. It will retrieve all `.png` files them sum their size by directories and list the directories by size.

<Terminal>
$ find . -type f -name "*.png" -printf '%h %s\n' | awk '\{sizes[$1]+=$2\} END \{for (d in sizes) printf "%s %.2f MB\n", d, sizes[d]/1024/1024\}' | sort -k2 -nr

218M    total
./2025/02/01/heimdall-dashboard/images 15.05 MB
./2024/01/03/quarto-revealjs-tips/images 4.30 MB
./2025/08/30/pest-functional/images 3.62 MB
./2025/03/30/cypress/images 3.05 MB
./2024/10/30/docker-python/images 3.04 MB
./2024/03/30/linux-fzf-introduction/images 2.24 MB
[...]
</Terminal>

So, I can jump in `2025/02/01/heimdall-dashboard/images` and run `caesiumclt -q 85 --format webp --same-folder-as-input *.png` to optimize these images:

<Terminal>
$ caesiumclt -q 85 --format webp --same-folder-as-input *.png

[00:00:00] [#########################################]
Compressed 9 files (9 success, 0 skipped, 0 errors)
10.5 MiB -> 616.9 KiB [-9.9 MiB | -94.28%]
</Terminal>
