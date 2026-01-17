---
slug: docusaurus-old-notice
title: A Docusaurus component that alerts readers the article is over a year old
date: 2025-10-03
description: Displays a warning banner when the page content is over a year old
authors: [christophe]
image: /img/v2/old_blog_notice.webp
series: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus]
language: en
blueskyRecordKey: 3m2bjrehbnc2r
updates:
  - date: 2026-01-04
    note: the component will first check the last update date/time (`last_update` field in the front matter) before the creation date (`date` field)
---
<!-- cspell:ignore  -->

![A Docusaurus component that alerts readers the article is over a year old](/img/v2/old_blog_notice.webp)

<TLDR>
This article demonstrates creating a Docusaurus component to alert readers when a blog post is over a year old. It involves building a React component and "swizzling" the `BlogPostPage` template to inject this notice. The component determines an article's age by checking its `last_update` or `date` field in the front matter.
</TLDR>


In this article let's see how we can display a small frame "Warning: This article is at least a year old, which in tech years is basically prehistoric.".

We'll create a React component for Docusaurus, and we'll inject it in our blog post page so, once in place, everything will work automagically.

<!-- truncate -->

## Create the component

You'll need to create two new files to your own Docusaurus site:

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false}>
  <Snippet filename="src/components/Blog/OldPostNotice/index.js" source="src/components/Blog/OldPostNotice/index.js" />
  <Snippet filename="src/components/Blog/OldPostNotice/styles.module.css" source="src/components/Blog/OldPostNotice/styles.module.css" />
</ProjectSetup>

## Override BlogPostPage template

In terms of Docusaurus, we'll need to **swizzle** the page that is responsible to render a post. That page is called `BlogPostPage`.

To do this, please start a console and run `yarn swizzle @docusaurus/theme-classic BlogPostItem/Content`.

From now, you'll a new file on your disk: `src/theme/BlogPostItem/Content/index.js`

Below, the original content of the file (Docusaurus v3.8.1):

<Snippet filename="src/theme/BlogPostItem/Content/index.js" source="./files/index.js" />

To inject our new `OldPostNotice` component, please edit the file like this (see highlighted lines):

<Snippet filename="src/theme/BlogPostItem/Content/index.js" source="./files/index.part2.js" />

Save the file and refresh your blog. You should get something like this picture below:

<BrowserWindow url="https://www.avonture.be/blog/joomla-show-table">
  <img
    alt="Old post notice in action"
    src={require("./images/old_notice.webp").default}
    className="screenshot"
  />
</BrowserWindow>

<AlertBox variant="info" title="">
The component is using the `date` field that you've to mention in your YAML front matter.

So, in each of your `.md` post, you should have a YAML block like this:

```yaml
---
title: Your blog post article
authors: [you]
date: 2025-09-30
```


</AlertBox>

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