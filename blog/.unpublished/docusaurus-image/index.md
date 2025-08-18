---
slug: docusaurus-image
title: A component for inserting an image in a Docusaurus blog
authors: [christophe]
image: /img/components_social_media.jpg
serie: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, markdown, react, swizzle]
enableComments: true
blueSkyRecordKey:
draft: true
---

<!-- cspell:ignore rgba -->

![A component for inserting an image in a Docusaurus blog](/img/components_banner.jpg)

I'll start a serie about writing components for Docusaurus.

As a very first example, let's start with a simple use case: I would like to insert an image in my blog posts but with some wow effect.

The image should be included in a div so I can center the image using a some background features, having rounded border, a hover effect, ... Everything will be managed by CSS so it'll be up to you to choose the best configuration for your site.

<!-- truncate -->

## Creation of our Image component

Writing a component for Docusaurus is quite easy. You should create a new folder in the existing `src/components` one.

In this article, we'll create an Image component so let's create the `src/components/Image/index.js` file with this content:

<Snippets filename="src/components/Image/index.js">

```javascript
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBaseUrl from '@docusaurus/useBaseUrl';

export default function Image({ src, alt, title }) {
  return (
    <div className={styles.container}><img src={useBaseUrl(src)} alt={alt} title={title}/></div>
  );
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  title: PropTypes.string,
};

```

</Snippets>

Our Image component will ask three parameter but just the `src` one will be mandatory. We can pass too the alternate text (`alt`) and a title (`title`).

As you can easily understand, the `Image` component will just create a `div` where an `img` tag will be present.

Nothing fancy except we'll use some CSS for the look&feel.

Please also create the `src/components/Image/styles.module.css` file:

<Snippets filename="styles.module.css">

```css
.container {
  text-align: center;
  border: 1px solid gray;
  padding: 10px;
  backdrop-filter: blur(12px) saturate(150%);
  background-color: rgba(255, 255, 255, 0.2);
  background-color: lightgray;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.container img {
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s ease, box-shadow 0.4s ease, filter 0.4s ease;
}

.container img:hover {
  transform: scale(1.05) translateY(-4px);
  box-shadow: 0 12px 25px rgba(0, 0, 0, 0.25);
  filter: brightness(1.05) saturate(1.1);
}

```

</Snippets>

## Tell Docusaurus about our component

Before being able to use the `Image` component, we should tell Docusaurus what to do when he'll see it.

Please also edit the `src/theme/MDXComponents.js` file (and if not present, please create it)

<Snippets filename="src/theme/MDXComponents.js">

```javascript
import MDXComponents from "@theme-original/MDXComponents";
import Image from "@site/src/components/Image";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  Image,
};

```

</Snippets>

Everything is now in place.

## Using the Image component

In our blog post, we can just do this:

```html
<Image src={require("./images/happy.jpg").default} />
```

The `require` part is needed because the image is located in a subfolder of the current blog post.

If the source was something like `/img/happy.jpg` then the code is easier:

```html
<Image src="/img/happy.jpg" />
```

And here is the result of our own, self-made, Image component:

<Image src={require("./images/happy.jpg").default} />

