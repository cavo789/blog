---
slug: docusaurus-go-top
title: Providing a go to the top button in Docusaurus posts
authors: [christophe]
image: /img/v2/go_top_banner.webp
mainTag: component
description: A Scroll to top button for long Docusaurus posts
tags: [component, docusaurus]
blueskyRecordKey: 3lynkx4gkjk2c
date: 2025-09-12
---

<!-- cspell:ignore  -->

![Providing a go to the top button in Docusaurus posts](/img/v2/go_top_banner.webp)

More on smartphones than on computers; it's pretty nice to have a *Back to top of page* button to avoid dislocating your thumb.

[Docux](http://docuxlab.com/), a friend, recently developed this feature and I was really happy to add it, especially since it's terribly easy to use and adds a fun element; it's cool.

Just scroll down any page of this blog to see a little meerkat appear in the bottom right corner. Click on it and take the lift back to the top of the page.

<!-- truncate -->

## How it's works

Docux has created a [ScrollToTopButton Docusaurus component](https://github.com/Juniors017/docux-blog/tree/main/src/components/ScrollToTopButton) i.e. a piece of Javascript with css; nothing more.

Please create the two files below in your blog directory structure:

<Snippet filename="src/components/ScrollToTopButton/index.js" source="src/components/ScrollToTopButton/index.js" />

<Snippet filename="src/components/ScrollToTopButton/styles.module.css" source="src/components/ScrollToTopButton/styles.module.css" />

Then, you need to inject `<ScrollToTopButton />` in your pages.

:::tip
Make sure to create a `/img/up.png` in your `/static` folder with your own icon (on my site, the small meerkat).
:::

## Overriding the BlogPostItem page

Please follow the "<Link to="/blog/docusaurus-bluesky-share/#we-need-to-override-how-the-article-is-rendered-by-docusaurus">We need to override how the article is rendered by Docusaurus</Link>" chapter of a previous post.

You need to create the `src/theme/BlogPostItem/index.js` file.

If you don't want the long story; don't read that chapter and just create this file:

<Snippet filename="src/theme/BlogPostItem/index.js">

```js
import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
// apply a bottom margin in list view
function useContainerClassName() {
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}
export default function BlogPostItem({children, className}) {
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
```

</Snippet>

Once you've it, please edit it since we need to inject the `<ScrollToTopButton />` code.

Below, see the two highlighted lines you should add:

<Snippet filename="src/theme/BlogPostItem/index.js">

```js
import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';
// highlight-next-line
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";

// apply a bottom margin in list view
function useContainerClassName() {
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}
export default function BlogPostItem({children, className}) {
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
      // highlight-next-line
      <ScrollToTopButton />
    </BlogPostItemContainer>
  );
}
```

</Snippet>

:::caution We need to restart Docusaurus
Now, because we've just introduced an override, we need to restart our Docusaurus server so changes can be taken into account.
:::

:::info
If you're running Docusaurus locally, just run `npm run start` in your console.
If like me you're running Docusaurus thanks to Docker, just kill the container and run a new one.
:::

## You can do this for other pages for sure

On my site, I've an `archive` page. You want to use the `<ScrollToTopButton />` button there too? Just swizzle the page by running `yarn docusaurus swizzle @docusaurus/theme-classic BlogArchivePage` in a console then update the `index.js` file as illustrated above.

If you've any other pages in your `src/pages/` folder (like `about.mdx`, `index.mdx`, ...), no need to swizzle first but directly add the two lines in these files too.
