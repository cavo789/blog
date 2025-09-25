---
slug: docusaurus-old-notice
title: A Docusaurus component that alerts readers the article is over a year old
authors: [christophe]
image: /img/v2/old_blog_notice.jpg
series: Creating Docusaurus components
description: Displays a warning banner when the page content is over a year old
mainTag: component
tags: [component, docusaurus]
blueskyRecordKey:
date: 2025-09-30
---

<!-- cspell:ignore  -->

![A Docusaurus component that alerts readers the article is over a year old](/img/v2/old_blog_notice.jpg)

In this article let's see how we can display a small frame "Warning: This article is at least a year old, which in tech years is basically prehistoric.".

We'll create a React component for Docusaurus and we'll inject it in our blog post page so, once in place, everything will works automagically.

<!-- truncate -->

## Create the component

Please create these two files on your server:

<Snippet filename="src/components/Blog/OldPostNotice/index.js" source="src/components/Blog/OldPostNotice/index.js" />

<Snippet filename="src/components/Blog/OldPostNotice/styles.module.css" source="src/components/Blog/OldPostNotice/styles.module.css" />

## Override BlogPostPage template

In term of Docusaurus, we'll need to **swizzle** the page that is responsible to render a post. That page is called `BlogPostPage`.

To do this, please start a console and run `yarn swizzle @docusaurus/theme-classic BlogPostItem/Content`.

From now, you'll a new file on your disk: `src/theme/BlogPostItem/Content/index.js`

Below, the original content of the file (Docusaurus v3.8.1):

<Snippet filename="src/theme/BlogPostItem/Content/index.js">

```js
import React from 'react';
import clsx from 'clsx';
import {blogPostContainerID} from '@docusaurus/utils-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
export default function BlogPostItemContent({children, className}) {
  const {isBlogPostPage} = useBlogPost();
  return (
    <div
      // This ID is used for the feed generation to locate the main content
      id={isBlogPostPage ? blogPostContainerID : undefined}
      className={clsx('markdown', className)}>
      <MDXContent>{children}</MDXContent>
    </div>
  );
}
```

</Snippet>

To inject our new `OldPostNotice` component, please edit the file like this (see highlighted lines):

<Snippet filename="src/theme/BlogPostItem/Content/index.js">

```js
import React from 'react';
import clsx from 'clsx';
import {blogPostContainerID} from '@docusaurus/utils-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import MDXContent from '@theme/MDXContent';
// highlight-next-line
import OldPostNotice from "@site/src/components/Blog/OldPostNotice/index.js";

export default function BlogPostItemContent({children, className}) {
  const {isBlogPostPage} = useBlogPost();
  return (
    // highlight-next-line
    <>
      // highlight-next-line
      <OldPostNotice />
      <div
        // This ID is used for the feed generation to locate the main content
        id={isBlogPostPage ? blogPostContainerID : undefined}
        className={clsx('markdown', className)}>
        <MDXContent>{children}</MDXContent>
      </div>
    // highlight-next-line
    </>
  );
}

```

</Snippet>

Save the file and refresh your blog. You should get something like this:

![Old post notice in action](./images/old_notice.png)

:::info
The component is using the `date` field that you've to mention in your YAML front matter.

So, in each of your `.md` post, you should have a YAML block like this:

```yaml
---
title: Your blog post article
authors: [you]
date: 2025-09-30
```

:::

## Position of the warning

The notice will be placed before the post content. On my blog, I've manipulated the code below to extract the very first image (i.e. the banner) so I can display it first, then the notice information then the rest of the article. But that probably too complex right now. We'll see this in a future article.

```jsx
<div
  // This ID is used for the feed generation to locate the main content
  id={isBlogPostPage ? blogPostContainerID : undefined}
  className={clsx('markdown', className)}>
  <MDXContent>{children}</MDXContent>
</div>
```
