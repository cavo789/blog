---
slug: docusaurus-bluesky-share
title: Create our own Docusaurus component and provide a "Share on BlueSky" button
authors: [christophe]
image: /img/docusaurus_tips_social_media.jpg
tags: [bluesky, docusaurus, markdown, swizzle]
enableComments: true
draft: true
---
![Create our own Docusaurus component and provide a "Share on BlueSky" button](/img/docusaurus_tips_banner.jpg)

Since a few days, I'm on BlueSky and thus, why not adding a *Share on BlueSky* button below each article?

Because I've no idea how to start; let's asked some IA to teach me and to give me a skeleton.

Once I've received it, time to understand and learn what is proposed.

So I need to created a file called `src/theme/BlogPostItem/index.js` file and just put some content to it.

Let's try and learn the same way.

<!-- truncate -->

## Override the BlogPostItem layout

The IA told me to create `src/theme/BlogPostItem/index.js` file and to put some content in it. 

From where comes that content? The initial content comes from your Docusaurus template (in my case, it's `@docusaurus/theme-classic`) and we can **extract** the original one using the so-called **Swizzle** action.

In the Docusaurus terminology, Swizzle can be understood as `override`: we'll extract a template so we can then override it.

Back to the `src/theme/BlogPostItem/index.js` file: that script will **customize the layout and content of individual blog posts** so, by updating that file, I can override the default layout of every single post of my blog.

Start a console and make sure you're in the root folder of your blog *(in my case, because I'm running my blog with Docker and I'm using a self-made Makefile, I just have to run `make bash`)*.

In your console, run `yarn docusaurus swizzle @docusaurus/theme-classic BlogPostItem`.

When prompted, select `Javascript`, then **`Eject`** and finally `YES`.

![Swizzle the BlogPostItem layout](./images/swizzle_blogpostitem.png)

## Keep things under control

As you can see on the screen, you'll extract a lot of files. **Let's keep things under control: we just want to add a share button below our article; we don't want to do more than that.**

Look at your Docusaurus site now; go to the `src/theme/BlogPostItem` folder and see that, yes, you've now a lot of files and sub-folders. Just remove every sub-folders; we don't want to update them i.e. we want to keep the original ones. So next time you'll install a newer version of Docusaurus, you'll stay up-to-date.

Just keep the `index.js` file created by the `swizzle` command:

<details>

<summary>index.js</summary>

```javascript
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

</details>

## Updating the layout

Let's play and add a line just after our post title. Look at the example below; I've just added a new line:

<details>

<summary>index.js</summary>

```javascript
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
      // highlight-next-line
      {/* Just after the blog post title, we'll add a "Are you ready" text */}
      // highlight-next-line
      <strong style={{color:"red"}}>Are you ready to update your BlogPostItem layout?</strong>
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
```

</details>

Refresh your page and tadaaa,

![Are you ready](./images/are_you_ready.png)

:::note
If it didn't works, please stop and restart your Docusaurus server. On my case (I'm using Docker), I just need to stop and restart my container.
:::

So, as you can see, it's now quite easy. We can change the layout of our Docusaurus page just by manipulating the `ìndex.js` file.

## Time to add our share button

As said, I've used IA to generate a skeleton for me. After a lot of changes and optimizations, here is my final script.

Please create the file `src/theme/BlogPostItem/BlueSky/share.js` and copy/paste this content in it:

<details>

<summary>src/theme/BlogPostItem/BlueSky/share.js</summary>

```javascript
import clsx from "clsx";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyShare({ title, url }) {
  const { siteConfig } = useDocusaurusContext();

  if (!title || !url) {
    console.warn("<BlueSkyShare> Missing required properties", { title, url });
    return null;
  }

  const shareLink =
    `https://bsky.app/intent/compose?text=` +
    `${encodeURIComponent(title)}%20${siteConfig.url}${encodeURIComponent(url)}`;

  return (
    <a
      href={shareLink}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx("blueSkyButton", "button")}
      aria-label="Share this post on BlueSky"
    >
      <img src="/img/bluesky.svg" alt="Bluesky Icon" width="20" height="20" />
      Share on BlueSky
    </a>
  );
}

BlueSkyShare.propTypes = {
  title: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
};
```

</details>

As you can see, we've defined a function called `BlueSkyShare` and that function ask for two parameters, the `title` of your blog post and the `url` to the post itself.

We'll call the function like this `<BlueSkyShare title={metadata.title} url={metadata.permalink}/>`.

But what is `metadata`? We've to defined it before and it's done using this line: `const {metadata} = useBlogPost();`

### Stylization of the Share button

In order to not add CSS in the BlueSkyShare javascript function, I've added a class called `blueSkyButton`.

Please update (or create) the `src/css/custom.css` file and add these rules:

<details>

<summary>src/css/custom.css</summary>

```css
.blueSkyContainer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ifm-color-emphasis-200);
}

.blueSkyButton {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.9rem;
  background-color: #f5f5f5; /* Light neutral background */
  color: #333333; /* Dark grey text */
  font-weight: 400; /* Normal weight */
  font-size: 0.9rem; /* Slightly smaller */
  border-radius: 6px; /* Softer rounding */
  text-decoration: none;
  transition: background-color 0.2s ease, color 0.2s ease;
  box-shadow: none; /* Remove shadow for minimal look */
  border: 1px solid #ddd; /* Subtle border */
  margin-right: 0.4rem; /* Space between buttons */
}

/* Hover effect */
.blueSkyButton:hover {
  background-color: #0062cc;
}
```

</details>

### The BlueSky logo

Please create the `static/img/bluesky.svg` with this content:

<details>

<summary>static/img/bluesky.svg</summary>

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg width="600" height="530" version="1.1" xmlns="http://www.w3.org/2000/svg">
 <path d="m135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-0.0174-2.9357-1.1937 0.51669-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z" fill="#1185fe"/>
</svg>
```

</details>

### Let's also create a BlueSky/index.js script

In order to minimize changes to the `src/theme/BlogPostItem/index.js`, let's create a second script called `src/theme/BlogPostItem/BlueSky/index.js`

<details>

<summary>src/theme/BlogPostItem/BlueSky/share.js</summary>

```javascript
import PropTypes from "prop-types";
import BlueSkyShare from "./BlueSkyShare";

export default function BlueSky({ metadata }) {
  return (
    <div className="blueSkyContainer">
      <BlueSkyShare title={metadata.title} url={metadata.permalink} />      
    </div>
  );
}

BlueSky.propTypes = {
  metadata: PropTypes.string.isRequired,
};
```

</details>

## Finally we just to put our BlueSky component in our BlogPostItem template

Here is the final version of the `src/theme/BlogPostItem/index.js` file:

<details>

<summary>Final src/theme/BlogPostItem/index.js</summary>

```javascript
import React from 'react';
import clsx from 'clsx';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import BlogPostItemContainer from '@theme/BlogPostItem/Container';
import BlogPostItemHeader from '@theme/BlogPostItem/Header';
import BlogPostItemContent from '@theme/BlogPostItem/Content';
import BlogPostItemFooter from '@theme/BlogPostItem/Footer';

// highlight-next-line
// import our BlueSky component
// highlight-next-line
import BlueSky from "./BlueSky/index.js";

// apply a bottom margin in list view
function useContainerClassName() {  
  const {isBlogPostPage} = useBlogPost();
  return !isBlogPostPage ? 'margin-bottom--xl' : undefined;
}
export default function BlogPostItem({children, className}) {
  // highlight-next-line
  // We need to retrieve the isBlogPostPage flag
  // highlight-next-line
  const { metadata, isBlogPostPage } = useBlogPost();
  const containerClassName = useContainerClassName();
  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
      // highlight-next-line
      {/* Only display BlueSky components on the post page; not the blog view */}
      // highlight-next-line
      {isBlogPostPage && <BlueSky metadata={metadata} />}
    </BlogPostItemContainer>
  );
}
```

</details>

## Warning about the swizzle command

You need to understand that, by swizzling (overriding) the BlogPostItem layout, you're no more *aligned* with the standard layout of Docusaurus. 

**If, in a next release, new features will be added by Docusaurus; you'll not have them!** since you're no more using the default layout for your post.

Just keep that in mind and, perhaps, from time to time (after a major release f.i.), think to run the swizzle command again and restart your customization.

This is why our changes to the index.js file were kept to a minimum.

## Next post

In a next post, I'll extend this component to have two extra features:

1. Next to the share button, a button that will jump to the BlueSky post (so the visitor can like it or add comments) and
2. When the BlueSky post is commented, retrieve the list of comments and show it below the article; here, on my blog.
