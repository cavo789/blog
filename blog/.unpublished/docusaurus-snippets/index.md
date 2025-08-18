---
slug: docusaurus-snippets
title: A component for showing code snippets in a Docusaurus blog
authors: [christophe]
image: /img/components_social_media.jpg
serie: Creating Docusaurus components
mainTag: component
tags: [component, docusaurus, markdown, react, swizzle]
enableComments: true
blueSkyRecordKey:
draft: true
---

<!-- markdownlint-disable MD046 -->
<!-- cspell:ignore reposts,packagist,3lun2qjuxc22r,repost,noopener,noreferrer,docux -->

![A component for showing code snippets in a Docusaurus blog](/img/components_banner.jpg)

If you're a regular reader of this blog, you know I'm sharing a lot of code snippets.

The HTML native way of doing this is by using the `<summary>` element (see [official documentation](https://www.w3schools.com/tags/tag_summary.asp)).

Can we do something, perhaps not better but more esthetic?

<!-- truncate -->

## The summary element

In pure HTML, we can use the `<summary>` DOM element like this:

```html
<details>
    <summary>blog/index.md</summary>

    Hello world! Proud to be here!!!
</details>
```

And it's rendered like this in HTML:

<details>
    <summary>blog/index.md</summary>

    Hello world! Proud to be here!!!
</details>

It works but, ok, let's create ours.

In this article we'll learn how to create a `Snippets` component and get this look&feel:

<Snippets filename="blog/index.md">

Hello world! Proud to be here!!!

</Snippets>

## Creation of our Snippets component

Please create the `src/components/Snippets/index.js` file with this content:

<Snippets filename="src/components/Snippets/index.js">

```javascript
import React, { useState, useRef, useEffect, useCallback } from "react";
import styles from "./styles.module.css";

export default function Snippets({ filename, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
  if (contentRef.current) {
    setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
  }
}, [open, children]);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const contentId = useRef(
    `snippet-content-${Math.random().toString(36).substr(2, 9)}`
  ).current;

  return (
    <div className={`${styles.snippet_block} alert alert--info`}>
      <button className={styles.snippet_summary} onClick={handleToggle} aria-expanded={open} aria-controls={contentId}>
        <span className="">{filename}</span>
        <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>&#9662;</span>
      </button>
      <div ref={contentRef} id={contentId} className={styles.snippet_content} style={{ maxHeight: height }} >
        <div className={styles.snippet_inner}>{children}</div>
      </div>
    </div>
  );
}

```

</Snippets>

Also create the stylesheet:

<Snippets filename="styles.module.css">

```css
code {
  background-color: #eef9fd !important;
  padding: 0px !important
}

code:hover {
  background-color: #eef9fd !important;
  padding: 0px !important
}

.snippet_block {
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 8px;
  margin: 1rem 0;
  /* background: var(--ifm-background-surface-color); */
  overflow: hidden;
}

.snippet_summary {
  width: 100%;
  background: none;
  border: none;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  --chevron-rotation: 0deg;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.snippet_summary:hover {
  background: var(--ifm-hover-overlay);
}

.snippet_summary[aria-expanded="true"] {
  --chevron-rotation: 180deg;
}

.snippet_summary:focus-visible {
  outline: 2px solid var(--ifm-color-primary);
  outline-offset: 2px;
}

.chevron {
  transition: transform 0.3s ease;
  transform: rotate(var(--chevron-rotation));
}

.chevron.rotate {
  transform: rotate(180deg);
}

.snippet_content {
  overflow: hidden;
  transition: max-height 0.35s ease;
}

.snippet_inner {
  padding: 0.75rem 1rem;
  /* border-top: 1px solid var(--ifm-color-emphasis-300); */
}

.snippet_toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

```

</Snippets>

The last thing we should do is to teach Docusaurus about our custom component.

Please also edit the `src/theme/MDXComponents.js` file (and if not present, please create it)

<Snippets filename="src/theme/MDXComponents.js">

```javascript
import MDXComponents from "@theme-original/MDXComponents";
import Snippets from "@site/src/components/Snippets";

export default {
  // Reusing the default mapping
  ...MDXComponents,
  Snippets,
};

```

</Snippets>

## Using the Snippets component

Now, if you want to add a snippets in your blog, just do something like this:

```html
<Snippets filename="who_are_you.py">

name = input("What's your name? ")

if name:
    print(f"Hello, {name}!")
else:
    print("Hello, stranger!")

print("Nice to meet you.")

</Snippets>
```

And it'll be rendered like this:

<Snippets filename="who_are_you.py">

```python
name = input("What's your name? ")

if name:
    print(f"Hello, {name}!")
else:
    print("Hello, stranger!")

print("Nice to meet you.")
```

</Snippets>
