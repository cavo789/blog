---
slug: docusaurus-plugin-replace
title: Creating a search&replace plugin for Docusaurus
authors: [christophe]
image: /img/components_social_media.jpg
serie: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, react]
enableComments: true
blueSkyRecordKey:
draft: true
---

<!-- cspell:ignore vstirbu -->

![Creating a search&replace plugin for Docusaurus](/img/components_banner.jpg)

For fun (because that solution is perhaps not bullet proof), I've asked to an IA to generate a plugin to scan my 250 articles and to replace patterns like `docusaurus` by `Docusaurus`, `github` by `GitHub`, `vscode` by `VSCode` to normalize them across all my content.

It can be risky because if the word `vscode` appears in:

* an URL (like `https://github.com/microsoft/vscode/`),
* a name (like `vstirbu.vscode-mermaid-preview`),
* as a file name (like `vscode.png`),
* a code snippets (inside a <code>\```...\```</code> or <code>\`.\`</code> block),
* ...

we certainly not want to make the replacement.

But well if the word is inside a simple paragraph.

So, after a few back and return with the IA, a plugin has been generated and it works so far.

<!-- truncate -->

## The plugin

Please create the `plugins/remark-replace-terms/remarkReplaceTerms` file and look at the `replacements` array. Please add yours.

The syntax is `[/\b(1)\b/g, "(2)"],` where `(1)` is the word to search for (exactly written as is (case sensitive)) and `(2)` the replaced by value.

<Snippets filename="plugins/remark-replace-terms/remarkReplaceTerms">

```javascript
/**
 * @fileoverview
 * Docusaurus Remark Plugin – remark-replace-words
 *
 * This plugin is designed for use with Docusaurus to automatically correct the casing
 * of common technology terms in Markdown content. It scans Markdown AST text nodes and
 * replaces lowercase variants like "github" or "markdown" with their properly capitalized
 * forms ("GitHub", "Markdown", etc.).
 *
 * ⚠️ Replacements are skipped inside links, images, and code blocks to avoid unintended changes.
 * 🧠 Compound words (e.g., "vscode-docker") are also preserved.
 *
 * Intended for use in the Docusaurus Markdown pipeline via `remarkPlugins`.
 *
 * @module remarkReplaceWords
 * @returns {Function} A remark transformer function
 */

const { visit } = require("unist-util-visit");

// Define replacements as [searchRegex, replacement]
const replacements = [
  [/\bdocusaurus\b/g, "Docusaurus"],
  [/\bgithub\b/g, "GitHub"],
  [/\bmarkdown\b/g, "Markdown"],
  [/\bvscode\b/g, "VSCode"],
];

function remarkReplaceWords() {
  return (tree, file) => {
    visit(tree, "text", (node, index, parent) => {
      if (typeof node.value !== "string") return;

      // Skip inside certain node types (URLs, code, etc.)
      const forbiddenParents = ["link", "image", "inlineCode", "code"];
      if (parent && forbiddenParents.includes(parent.type)) {
        return;
      }

      let original = node.value;

      for (const [regex, replacement] of replacements) {
        node.value = node.value.replace(regex, (match, offset, fullString) => {
          const before = fullString[offset - 1] || "";
          const after = fullString[offset + match.length] || "";

          // Skip compound words like "vscode-docker", "foo.markdown"
          if (
            ["-", ".", "/"].includes(before) ||
            ["-", ".", "/"].includes(after)
          ) {
            return match;
          }

          // console.log(
          //   `🔎 Replacing '${match}' with '${replacement}' in file: ${file.path}\nSentence: ${fullString}`
          // );
          return replacement;
        });
      }
    });
  };
}

module.exports = remarkReplaceWords;

```

</Snippets>

## Adding the plugin in your configuration

The next thing to do is to register your plugin into your Docusaurus configuration. To do this, edit your `docusaurus.config.js` file and add the highlighted lines as illustrated below.

<Snippets filename="docusaurus.config.js">

```javascript
const config = {
  // [ ... ]
  presets: [
    [
      'classic',
      ({
        blog: {
          // highlight-next-line
          remarkPlugins: [require('./plugins/remark-replace-terms/remarkReplaceTerms')],
        },
        // [ ... ]
      }),
    ],
  ],
};

export default config;

```

</Snippets>

This done, please restart your Docusaurus server and on the next start, if some changes have to be made, you can see them in your console:

```text
🔎 Replacing 'vscode' with 'VSCode' in file: /opt/docusaurus/blog/2024/04/19/vscode-multiple-cursors/index.md
Sentence: One of the best features in vscode is the

🔎 Replacing 'vscode' with 'VSCode' in file: /opt/docusaurus/blog/2024/04/19/vscode-multiple-cursors/index.md
Sentence: With vscode, it's ultra-simple: multiple cursors.
```

:::caution
The search&replace action won't be done on your original Markdown files but only during the HTML rendering. It's thus safe to run this plugin; your files won't be impacted at all.
:::
