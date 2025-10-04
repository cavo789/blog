---
date: 2024-01-08
slug: docusaurus-number-of-posts
title: Getting the number of published posts
authors: [christophe]
image: /img/v2/docusaurus_tips.webp
series: Discovering Docusaurus
description: Learn the quick and easy way to display the total number of published blog posts on your Docusaurus site using custom components and theme API.
mainTag: docusaurus
tags: [markdown, docusaurus, tips]
---
<!-- cspell:ignore autoriser,collage -->
![Getting the number of published posts](/img/v2/docusaurus_tips.webp)

Docusaurus didn't provide an easy way to retrieve the number of blog posts but there is well a trick.

There is an automatic page called `archive` like <Link to="/blog/archive/">/blog/archive/</Link>.

On that page, all blog posts are displayed by year and months. With a `document.querySelectorAll` console instruction it's possible to make the count as suggested on [https://github.com/facebook/docusaurus/discussions/9712](https://github.com/facebook/docusaurus/discussions/9712)

<!-- truncate -->

![The archive page](./images/archive.png)

Once the archive page has been displayed, press <kbd>F12</kbd> to start the **Developer console**.

Click on the `Console` tab then, in the right bottom part, copy/paste the instruction below.

```js
document.querySelectorAll("#__docusaurus_skipToContent_fallback > main > section > div > div > div > ul > li")
```

The first time, the console will notify you that you should allow pasting (in French *autoriser le collage*). Please type it.

Then copy/paste again.

The `document.querySelectorAll` instruction will retrieve every bullet i.e. the list of posts. You'll immediately see the number, in my case, as illustrated below, `51`:

![Console](./images/console.png)
