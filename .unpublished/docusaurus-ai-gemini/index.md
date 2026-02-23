---
slug: docusaurus-ai-gemini
title: How to Indicate AI-Assisted Content in a Docusaurus Blog
description: A step-by-step guide to show when a blog post has been written with the help of an AI like Google Gemini, by adding an icon and an author.
image: /img/v2/gemini-co-author.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags: [ai, docusaurus]
authors: [christophe]
ai_assisted: true
date: 2026-12-31
draft: true
---

![How to Indicate AI-Assisted Content in a Docusaurus Blog](/img/v2/gemini-co-author.webp)

<TLDR>
This blog post explains how to indicate AI-assisted content in a Docusaurus blog by adding an icon and a co-author.
</TLDR>

In the age of powerful AI assistants like Google Gemini, it's becoming increasingly common to use them for content creation, brainstorming, or even coding. As a content creator, I believe in transparency with my audience. If an AI has significantly contributed to a piece of content, the reader should know.

This blog post is a step-by-step guide on how I implemented an "AI Assisted" indicator in my Docusaurus blog. When I add `ai_assisted: true` to my YAML post's front matter, two things happen automatically:

1. A small "AI Assisted" icon appears next to the post's date and reading time.
2. "Google Gemini" is added as a co-author.

Here's how you can do the same for your own blog.

<!-- truncate -->

## The Goal

Here's a preview of what we're building:

1. **The "AI Assisted" Icon**: A clear, unintrusive indicator in the post header.
2. **The "Google Gemini" Author**: Gemini appears alongside the human author.

This ensures that the AI's contribution is acknowledged right from the start.

## Step 1: The `ai_assisted` Front Matter

The entire process is driven by a single flag in the front matter of your blog posts. This is the simplest part: just add `ai_assisted: true` to any post where you've had help from an AI.

<Snippet filename="your-post.md" source="./files/your-post.txt" defaultOpen={true} />

This flag will be the trigger for all the logic we'll build next.

## Step 2: Creating the `AIIcon` Component

First, let's create the visual component for our indicator. This is a simple React component that displays an icon and the text "AI Assisted."

<ProjectSetup folderName="src/components/Blog/AIIcon" createFolder={true} >
  <Snippet filename="src/components/Blog/AIIcon/index.js" source="src/components/Blog/AIIcon/index.js" defaultOpen={false} />
  <Snippet filename="src/components/Blog/AIIcon/index.module.css" source="src/components/Blog/AIIcon/index.module.css" defaultOpen={false} />
</ProjectSetup>

## Step 3: Displaying the Icon with Swizzling

Now we need to make this component appear in our post header. To do this, we need to modify some of Docusaurus's core theme components. This is where **swizzling** comes in. Swizzling is a Docusaurus feature that allows you to replace a theme component with your own customized version.

In this implementation, the logic is spread across three components: `BlogPostItem`, its `Header`, and the `Info` section within the header. We'll need to swizzle all three.

Run the following commands in your terminal:

<Terminal wrap={true}>
$ yarn run swizzle @docusaurus/theme-classic BlogPostItem

$ yarn run swizzle @docusaurus/theme-classic BlogPostItem/Header

$ yarn run swizzle @docusaurus/theme-classic BlogPostItem/Header/Info
</Terminal>

This will copy the original theme files into your `src/theme` directory, ready for you to edit.

### 3.1. Modify `src/theme/BlogPostItem/index.js`

Here, we'll import our new `AIIcon` and decide if it should be rendered based on the front matter.

```javascript title="src/theme/BlogPostItem/index.js" {1,9,12}
import AIIcon from "@site/src/components/Blog/AIIcon";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const { frontMatter } = metadata;
  const containerClassName = useContainerClassName();
  const aiIcon = frontMatter.ai_assisted && isBlogPostPage ? <AIIcon /> : null;

  return (
    <BlogPostItemContainer className={clsx(containerClassName, className)}>
      <BlogPostItemHeader aiIcon={aiIcon} />
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
```

### 3.2. Modify `src/theme/BlogPostItem/Header/index.js`

This component just needs to accept the `aiIcon` prop and pass it down to its child.

```javascript title="src/theme/BlogPostItem/Header/index.js" {6,10}
import React from 'react';
import BlogPostItemHeaderTitle from '@theme/BlogPostItem/Header/Title';
import BlogPostItemHeaderInfo from '@theme/BlogPostItem/Header/Info';
import BlogPostItemHeaderAuthors from '@theme/BlogPostItem/Header/Authors';

// Add aiIcon to the function signature
export default function BlogPostItemHeader({aiIcon}) {
  return (
    <header>
      <BlogPostItemHeaderTitle />
      <BlogPostItemHeaderInfo aiIcon={aiIcon} />
      <BlogPostItemHeaderAuthors />
    </header>
  );
}
```

### 3.3. Modify `src/theme/BlogPostItem/Header/Info/index.js`

Finally, this component receives the prop and renders it.

```javascript title="src/theme/BlogPostItem/Header/Info/index.js" {11,24-25}
import React from "react";
import clsx from "clsx";
import { translate } from "@docusaurus/Translate";
// ... other imports

function Spacer() {
  return <>{" · "}</>;
}

export default function BlogPostItemHeaderInfo({ className, aiIcon }) {
  const { metadata } = useBlogPost();
  const { date, readingTime } = metadata;
  // ... other code

  return (
    <div className={clsx(styles.container, "margin-vert--md", className)}>
      <DateTime date={date} formattedDate={formatDate(date)} />
      {typeof readingTime !== "undefined" && (
        <>
          <Spacer />
          <ReadingTime readingTime={readingTime} />
        </>
      )}
      {aiIcon && <Spacer />}
      {aiIcon}
    </div>
  );
}
```

With these changes, the "AI Assisted" icon will now appear on any blog post with the correct front matter.

## Step 4: Adding "Google Gemini" as an Author

Just like the icon, we can automatically add an author.

### 4.1. Define the AI Author

First, define your AI author in `blog/authors.yml`.

<Snippet filename="blog/authors.yml" source="./files/authors.txt" defaultOpen={true} />

### 4.2. Swizzle the Authors Component

We need to swizzle one more component to inject the author logic.

<Terminal wrap={true}>
$ yarn run swizzle @docusaurus/theme-classic BlogPostItem/Header/Authors
</Terminal>

### 4.3. Modify `src/theme/BlogPostItem/Header/Authors/index.js`

Now, edit the newly created file to add the logic. We read the `ai_assisted` flag from the front matter and, if it's true, we push our "Gemini" author object into the list of authors.

```javascript title="src/theme/BlogPostItem/Header/Authors/index.js" {14-24}
import React from "react";
import clsx from "clsx";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogAuthor from "@theme/Blog/Components/Author";
import styles from "./styles.module.css";

export default function BlogPostItemHeaderAuthors({ className }) {
  const {
    metadata: { authors },
    frontMatter,
    assets,
  } = useBlogPost();

  const allAuthors = [...authors];

  if (frontMatter.ai_assisted) {
    const geminiAuthor = {
      name: "Google Gemini",
      title: "AI Assistant",
      url: "https://gemini.google.com/",
      imageURL: "/img/gemini-logo.webp",
    };
    if (!allAuthors.find((a) => a.name === geminiAuthor.name)) {
      allAuthors.push(geminiAuthor);
    }
  }

  const authorsCount = allAuthors.length;
  // ... rest of the component
```

## Conclusion

That's it! With a few component customizations, you now have a robust system for transparently indicating AI assistance in your blog. This approach keeps your Markdown files clean (just one flag to add) and centralizes the logic within your Docusaurus theme, making it easy to manage and update. By being open about your process, you can build greater trust with your audience.
