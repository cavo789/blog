---
date: 2025-08-21
slug: docusaurus-override-img
title: Change how Docusaurus will create img tags
authors: [christophe]
image: /img/components_social_media.jpg
series: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, markdown, react, swizzle]
blueSkyRecordKey: 3lww5fbh2y22q
---

<!-- cspell:ignore rgba,toggleable -->

![Change how Docusaurus will create img tags](/img/components_banner.jpg)

I'll start a series about writing components for Docusaurus.

Since it's always nice to start with something very concrete and practical, here's what we're going to do: we'll intercept the conversion from `![Alt text](./img/example.png)` to a HTML `<img>` tag. We'll force Docusaurus to use instead a component `<Image>` from our own.

We'll customize our `<Image>` tag to first inject a `<div>` parent, we'll force our `<img>` with attributes like CSS, lazy loading, ... **but, not for all tags in the blog post since we'll skip the first one.**

Indeed, the blog post introduction image should remains unchanged; we'll start to update the other images.

<!-- truncate -->

We need to do several things so let's start with the first one: we need to create our `<Image>` component.

## 1. Creation of our Image component

Writing a component for Docusaurus is quite easy. You should create a new folder in the existing `src/components` one.

In this article, we'll create a `Image` component so let's create the `src/components/Image/index.js` file with this content:

<Snippet filename="src/components/Image/index.js">

```js
/**
 * 🖼️ Image Component
 *
 * A lightweight wrapper for rendering images in Docusaurus with base URL resolution.
 * Ensures that image paths are correctly resolved relative to the site's base URL,
 * making it ideal for static assets stored in the `static/img` directory.
 *
 * 🔍 Behavior:
 * - Uses `useBaseUrl()` to resolve the image path
 * - Applies scoped styling via CSS modules
 * - Supports optional `alt` and `title` attributes for accessibility and tooltips
 * - Enables lazy loading for performance optimization
 *
 * 📦 Props:
 * @param {object} props
 * @param {string} props.src - Path to the image (e.g. `/img/example.png` or `./images/example.png`)
 * @param {string} [props.title] - Tooltip text shown on hover
 * @param {string} [props.alt] - Alternative text for accessibility (if missing, reuse the Title property)
 */

import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBaseUrl from "@docusaurus/useBaseUrl";
export default function Image({ src, title, alt }) {
  const imgSrc = typeof src === 'string' && src.startsWith('/') ? useBaseUrl(src) : src;

  return (
    <div className={styles.container}>
      <img src={imgSrc} alt={alt || title} title={title} lazy="loading" />
    </div>
  );
}

Image.propTypes = {
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  alt: PropTypes.string,
};

```

</Snippet>

Our `Image` component will ask three parameters but just the `img` one is required. We can pass too a title (`title`) and the alternate text (`alt`).

As you can easily understand, the `<Image>` component will just create a `div` where an `img` tag will be present.

Nothing fancy except we'll use some CSS for the look&feel and the fact we'll force a lazy loading.

Please also create the `src/components/Image/styles.module.css` file:

<Snippet filename="styles.module.css">

```css
.container {
  text-align: center;
  border: 1px solid gray;
  padding: 10px;
  backdrop-filter: blur(12px) saturate(150%);
  background-color: rgba(255, 255, 255, 0.2);
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

</Snippet>

## 2. Tell Docusaurus about our component

Before being able to use the `<Image>` component, we should tell Docusaurus what to do when he'll see it.

Please also edit the `src/theme/MDXComponents.js` file (and if not present, please create it)

<Snippet filename="src/theme/MDXComponents.js">

```js
import MDXComponents from "@theme-original/MDXComponents";
import Image from "@site/src/components/Image";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  Image,
};

```

</Snippet>

Everything is now in place.

## 3. Using the Image component

From now, in a blog post, instead of writing

```html
![A happy meerkat](./images/happy.jpg)
```

we can write

```html
<Image src={require("./images/happy.jpg").default} title="A happy meerkat" />
```

The `require` part is needed because the image is located in a subfolder of the blog post.

If the source was something like `/img/happy.jpg` then the code is easier:

```html
<Image src="/img/happy.jpg" title="A happy meerkat" />
```

And here is the result of our own, self-made, Image component:

<Image src={require("./images/happy.jpg").default} title="A happy meerkat" />

As you can see, the image is centered, has a hover effect, rounded corners, ... If you look at the HTML code, you'll see the `lazy="loading"` attribute.

That's pretty cool: our component is working!

:::caution
But, uh oh, on this blog, I've more than 250 articles right now (August 2025), I'm not going to go through all my articles to replace my images, am I?

But also, maybe tomorrow I don't want this tag anymore, so I want to keep my articles in **vanilla Markdown** (standard language); how can I do that? The answer is: just write a plugin.
:::

The plugin will be able to intercept the Markdown code of the article and manipulate it. That's exactly what we want here!

We'll intercept the conversion of images from Markdown to HTML and tell Docusaurus to use our Image tag instead of img.

## 4. Writing and registering a plugin

So we need a plugin to intercept the conversion from `![Alt text](./img/example.png)` to a HTML image tag; automatically.

:::caution
But let's add a complexity: we don't want to change the first article i.e. the blog post introduction image. For that first image, let Docusaurus doing his job (he's doing this really fine). We'll intercept as from the second image of the blog post.
:::

Please create the `plugins/remark-image-transformer/index.js` file:

<!-- cspell:disable -->

<Snippet filename="plugins/remark-image-transformer/index.js">

```js
/**
 * remarkReplaceImgToImage – A Docusaurus-compatible remark plugin that transforms Markdown image nodes
 * into MDX <Image /> components with enhanced attributes and dynamic path resolution.
 *
 * This plugin skips the first image in the Markdown AST and replaces subsequent image nodes with
 * MDX JSX elements. It supports:
 * - Relative paths (e.g., ./img.png) via `require(...)`
 * - Absolute paths (e.g., /img/foo.png) via `useBaseUrl(...)`
 * - Fallback to raw URL string for external or unrecognized paths
 *
 * Each image preserves `alt` and `title` metadata.
 *
 * Intended for use in Docusaurus projects to enable advanced image handling and optimization.
 *
 * @returns {function} A remark transformer function for use in MDX pipelines
 */

const { visit } = require("unist-util-visit");
const acorn = require("acorn");

function expressionToEstree(expression) {
  return acorn.parse(expression, {
    ecmaVersion: 2020,
    sourceType: "module",
  }).body[0].expression;
}

function remarkReplaceImgToImage() {
  return (tree) => {
    let imageCount = 0;

    visit(tree, "image", (node, index, parent) => {
      imageCount++;
      if (imageCount === 1) return; // skip the first image

      const url = node.url || "";

      const attributes = [
        { type: "mdxJsxAttribute", name: "alt", value: node.alt || "" },
      ];

      if (node.title) {
        attributes.push({
          type: "mdxJsxAttribute",
          name: "title",
          value: node.title,
        });
      }

      // Handle relative paths (./ or ../)
      if (/^\.+\//.test(url)) {
        const expr = `require("${url}").default`;
        attributes.unshift({
          type: "mdxJsxAttribute",
          name: "src",
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: expr,
            data: {
              estree: {
                type: "Program",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: expressionToEstree(expr),
                  },
                ],
                sourceType: "module",
              },
            },
          },
        });

        // Handle absolute paths (/img/foo.png)
      } else if (/^\//.test(url)) {
        const expr = `useBaseUrl("${url}")`;
        attributes.unshift({
          type: "mdxJsxAttribute",
          name: "src",
          value: {
            type: "mdxJsxAttributeValueExpression",
            value: expr,
            data: {
              estree: {
                type: "Program",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: expressionToEstree(expr),
                  },
                ],
                sourceType: "module",
              },
            },
          },
        });

        // Fallback: leave as string
      } else {
        attributes.unshift({
          type: "mdxJsxAttribute",
          name: "src",
          value: url,
        });
      }

      const imageNode = {
        type: "mdxJsxFlowElement",
        name: "Image",
        attributes,
        children: [],
      };

      parent.children.splice(index, 1, imageNode);
    });
  };
}

module.exports = remarkReplaceImgToImage;

```

</Snippet>

<!-- cspell:enable -->

*This plugin is more complex because we need to make sure paths to images are correctly handled (we use use relative paths like `![](./img/example.png)` or absolute (`![](/img/example.png)`) or even external ones).*

Once the plugin has been created, we need to update the Docusaurus configuration to load it.

To do this, edit your `docusaurus.config.js` file and add the highlighted lines as illustrated below.

<Snippet filename="docusaurus.config.js">

```js
const config = {
  // [ ... ]
  presets: [
    [
      'classic',
      ({
        blog: {
          // highlight-next-line
          beforeDefaultRemarkPlugins: [require('./plugins/remark-image-transformer')],
        },
        // [ ... ]
      }),
    ],
  ],
};

export default config;

```

</Snippet>

Now restart your Docusaurus server (so the plugin can be registered).

If everything is correctly in place, open any of your previous blog post and you'll see it's working.

## Conclusion

Now, up to you to edit the `src/components/Image/styles.module.css` file and use your own CSS.
