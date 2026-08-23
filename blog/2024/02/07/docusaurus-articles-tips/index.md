---
slug: docusaurus-articles-tips
title: Some tips and tricks when written articles for Docusaurus
date: 2024-02-07
description: Boost your Docusaurus articles with essential tips and tricks. Learn how to add Admonitions, apply inline styling, and highlight code lines easily.
authors: [christophe]
image: /img/v2/docusaurus_tips.webp
series: Discovering Docusaurus
mainTag: docusaurus
tags:
  - docusaurus
  - markdown
language: en
updates:
  - date: 2025-09-13
    note: Add Highlight component
blueskyRecordKey: 3lyqe2y7uvc2a
---
![Some tips and tricks when written articles for Docusaurus](/img/v2/docusaurus_tips.webp)

<TLDR>
This article is a reminder of essential Docusaurus authoring features: the `truncate` marker for blog post previews, admonitions for callout boxes, inline styling with `<span>`, a custom `Highlight` component for colored text, and `// highlight-next-line` to draw attention to changed lines in code blocks.
</TLDR>

If you're writing for Docusaurus, there are a few tips to know.

This article is by no means exhaustive, but for me, it's a reminder of the features that are really essential and must not be forgotten. *Two more authoring habits worth adopting early: keeping your <Link to="/blog/docusaurus-tags">tags under control</Link> and <Link to="/blog/docusaurus-relatedposts">displaying related posts</Link> below each article.*

<!-- truncate -->

## Read more

[Official documentation](https://docusaurus.io/docs/blog#blog-list)

In blog mode, your article is divided into two parts: the introduction with a *Read More* link, and then the main part of the article.

To activate this feature, simply add the line `<!-- truncate -->` (preceded and followed by an empty line) where you wish to distinguish between the introduction and the main part.

If you go to my [blog](/blog) page, each article has an introduction followed by a `<!-- truncate -->` line in my Markdown source.

## Admonitions

[Official documentation](https://docusaurus.io/docs/markdown-features/admonitions)

Used to highlight a paragraph in your document, f.i. a *Pay attention to...* or *Tip: Did you know that...* box.

```markdown
<AlertBox variant="caution" title="Pay attention to...">
Never give your bank card code to a stranger.

</AlertBox>
```

Will be displayed by Docusaurus like this:

<AlertBox variant="caution" title="Pay attention to...">
Never give your bank card code to a stranger.

</AlertBox>

## Inline style

Docusaurus supports inline style by the use of a `<span> ... </span>` notation.

The notation `<span style={{color: 'blue'}}>I'm written in blue</span>` will give <span style={{color: 'blue'}}>I'm written in blue</span>.

Used very occasionally, this is a very simple way of changing the style of content on your page.

### Highlight component

If your ambition is to highlight some text, there is a better solution: the **Highlight component**.

Please create the `src/components/Highlight/index.js` file:

<Snippet filename="src/components/Highlight/index.js" source="src/components/Highlight/index.js" />

Then edit (or create) the `src/theme/MDXComponents.js` file. If the file already exists, just add the highlighted lines below. If not yet present, create the file with the content below:

<Snippet filename="src/theme/MDXComponents.js" >

```js
import React from "react";

import MDXComponents from "@theme-original/MDXComponents";

// [...]

// highlight-next-line
import Highlight from "@src/components/Highlight";

export default {
  // Reusing the default mapping
  ...MDXComponents,

  // [...]

  // highlight-next-line
  Highlight
};

```

</Snippet>

<Highlight color="#25c2a0">Docusaurus green</Highlight> and <Highlight color="#1877F2">Facebook blue</Highlight> are my favorite colors.

Source: [MDX and React](https://docusaurus.io/docs/markdown-features/react#exporting-components)

## Highlight lines

[Official documentation](https://docusaurus.io/docs/markdown-features/code-blocks#line-highlighting)

The `// highlight-next-line` is **really** useful when you wish to put in evidence changes you've done to a give code block. *When the code lives in a real file rather than inline, I use my own <Link to="/blog/docusaurus-snippets">code snippets component</Link>, which reads the file at build time so the article can never fall out of sync with it.*

Imagine you've already written something like *Dear reader, please create a file on your disk with this content...* and you provide a code block with that content.

Later in your article, you ask 'Please edit the file and make this and *please edit the file and add this and that line, here and there*.

With `// highlight-next-line`, it's really easy to highlight changes, for instance:

<Vars port="8080" labels={{ port: "Host port" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

You can immediately see where I've made some changes in the file's content.
