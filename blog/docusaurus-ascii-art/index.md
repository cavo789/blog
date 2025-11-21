---
slug: docusaurus-ascii-art
title: Inject ASCII Art in any HTML pages rendered by Docusaurus
date: 2025-10-20
description: Learn how to inject a custom ASCII art banner into every HTML page of your Docusaurus blog build.
authors: [christophe]
image: /img/v2/ascii_art_html.webp
mainTag: Linux
tags: [linux]
language: en
blueskyRecordKey:
---
![Inject ASCII Art in any HTML pages rendered by Docusaurus](/img/v2/ascii_art_html.webp)

It might be entirely useless, and only the most dedicated tech-heads will spot it, but we're going to dive into how to inject a custom ASCII art banner at the very top of every HTML page generated for our blog.

<!-- truncate -->

[Image to ASCII Art Converter](https://folge.me/tools/image-to-ascii)

<Snippet filename="plugins/ascii-injector/index.mjs" source="plugins/ascii-injector/index.mjs" />

<Snippet filename="src/data/banner.txt" source="src/data/banner.txt" />

Now, finalize the installation by editing your `docusaurus.config.js` file and, under `plugins`, please do this:

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

Now, the next time you'll build the static version of your website, Docusaurus will call the plugin once he's finished to create any files.
