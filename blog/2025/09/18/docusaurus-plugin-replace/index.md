---
slug: docusaurus-plugin-replace
title: Creating a search&replace plugin for Docusaurus
date: 2025-09-18
description: Automatically replace “markdown” with “Markdown” across all your content to keep your posts consistent.
authors: [christophe]
image: /img/v2/docusaurus_component.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - react
language: en
review_date: 2026-07-30
blueskyRecordKey: 3lz3pbmvd722f
---
<!-- cspell:ignore vstirbu -->

![Creating a search&replace plugin for Docusaurus](/img/v2/docusaurus_component.webp)

<TLDR>
This article demonstrates how to create a custom Docusaurus remark plugin for automatically finding and replacing specific terms across your entire site. The goal is to ensure consistent terminology (e.g., changing 'vscode' to 'VSCode') without modifying the original Markdown files. You'll learn how to write a plugin that traverses the content's abstract syntax tree (AST) to safely apply replacements only to plain text, avoiding code blocks and URLs. The guide also shows how to configure the plugin in your `docusaurus.config.js`.
</TLDR>

For fun (because that solution is perhaps not bullet proof), I asked an AI to generate a plugin to scan my 200 articles and replace patterns like `docusaurus` by `Docusaurus`, `github` by `GitHub`, `vscode` by `VSCode`, to normalize them across all my content.

It can be risky because if the word `vscode` appears in:

- a URL (like `https://github.com/microsoft/vscode/`),
- a name (like `vstirbu.vscode-mermaid-preview`),
- as a file name (like `vscode.png`),
- a code snippet (inside a <code>\```...\```</code> or <code>\`.\`</code> block),
- ...

we certainly do not want to make the replacement.

But, if the word is inside a simple paragraph, that's a different story — we do want the replacement there.

So, after a few prompts with the AI, a plugin has been generated and it works so far.

<!-- truncate -->

## The plugin

Please create the `plugins/remark-replace-terms/index.cjs` file and look at the `replacements` array. Please add yours.

*This is a **remark** plugin: it walks the Markdown AST before the HTML is produced. I've used the same mechanism to <Link to="/blog/docusaurus-override-img">replace every `<img>` tag with my own component</Link> and to <Link to="/blog/docusaurus-eli5-snippet-tooltips">inject AI-generated tooltips into code snippets</Link>.*

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

<AlertBox variant="caution">
The search&replace action won't be done on your original Markdown files but only during the HTML rendering. It's thus safe to run this plugin; your files won't be impacted at all.

</AlertBox>
