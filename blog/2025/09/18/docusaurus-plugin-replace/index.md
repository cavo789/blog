---
slug: docusaurus-plugin-replace
title: Creating a search&replace plugin for Docusaurus
authors: [christophe]
image: /img/v2/docusaurus_component.webp
series: Creating Docusaurus components
description: Automatically replace “markdown” with “Markdown” across all your content to keep your posts consistent.
mainTag: component
tags: [component, docusaurus, react]
blueskyRecordKey: 3lz3pbmvd722f
date: 2025-09-18
---

<!-- cspell:ignore vstirbu -->

![Creating a search&replace plugin for Docusaurus](/img/v2/docusaurus_component.webp)

For fun (because that solution is perhaps not bullet proof), I've asked to an AI to generate a plugin to scan my 200 articles and to replace patterns like `docusaurus` by `Docusaurus`, `github` by `GitHub`, `vscode` by `VSCode` so to normalize them across all my content.

It can be risky because if the word `vscode` appears in:

* an URL (like `https://github.com/microsoft/vscode/`),
* a name (like `vstirbu.vscode-mermaid-preview`),
* as a file name (like `vscode.png`),
* a code snippets (inside a <code>\```...\```</code> or <code>\`.\`</code> block),
* ...

we certainly not want to make the replacement.

But well if the word is inside a simple paragraph.

So, after a few prompts with the AI, a plugin has been generated and it works so far.

<!-- truncate -->

## The plugin

Please create the `plugins/remark-replace-terms/index.cjs` file and look at the `replacements` array. Please add yours.

The syntax is `[/\b(1)\b/g, "(2)"],` where `(1)` is the word to search for (exactly written as is (case sensitive)) and `(2)` the replaced by value.

<Snippet filename="plugins/remark-replace-terms/index.cjs" source="plugins/remark-replace-terms/index.cjs" />

## Adding the plugin in your configuration

The next thing to do is to register your plugin into your Docusaurus configuration. To do this, edit your `docusaurus.config.js` file and add the highlighted lines as illustrated below.

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

This done, please restart your Docusaurus server and on the next start, if some changes have to be made, you can see them in your console:

```bash
🔎 Replacing 'vscode' with 'VSCode' in file: /opt/[...]/index.md
Sentence: One of the best features in vscode is the

🔎 Replacing 'vscode' with 'VSCode' in file: /opt/[...]/index.md
Sentence: With vscode, it's ultra-simple: multiple cursors.
```

<AlertBox variant="caution" title="">
The search&replace action won't be done on your original Markdown files but only during the HTML rendering. It's thus safe to run this plugin; your files won't be impacted at all.

</AlertBox>
