---
slug: docusaurus-lazy-loading
title: Overrides the generation of img tags with Docusaurus
date: 2025-08-27
description: Learn how to customize the rendering of <img> tags in Docusaurus for enhanced control over image output.
authors: [christophe]
image: /img/v2/docusaurus_component.webp
series: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, react]
language: en
blueskyRecordKey: 3lxekkxhjwc26
---
<!-- cspell:ignore -->

![Overrides the generation of img tags with Docusaurus](/img/v2/docusaurus_component.webp)

While searching for good tips & tricks about Docusaurus when the number of articles become important, I read that we need to pay attention to lazy load images and, indeed, by default all images are loaded when a blog post is first accessed.

In this article, we'll see how to, so easily, we can intercept the creation of the `<img>` tag when the Markdown content is converted to HTML.

This conversion occurs at two places: when you're surfing on your website or when you're generating a static version of it.

<!-- truncate -->

To do this, in fact, we don't need to create a component! We just need to add some lines of code in the `src/theme/MDXComponents.js` file.

If you don't have that file yet, just create it.

<AlertBox variant="note" title="">
The `// [...]` notation is there as a placeholder to show you that perhaps you'll have already some lines of code there. Don't delete it; just append the highlighted lines as shown below.

</AlertBox>

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" />

Once added to your `MDXComponents.js` file, just return to the browser; open any post and refresh the page. You'll see that images have now the `lazy` attributes (you can verify using the dev tools panel of your browser). If like in the example given here above, you've added some CSS style; you'll see it immediately.

Easy no?
