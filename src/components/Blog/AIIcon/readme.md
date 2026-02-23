# AI Icon Component

This component displays an icon and text to indicate that a blog post has been written with the assistance of Artificial Intelligence.

## Usage

This component is automatically added to blog posts that have the `ai_assisted: true` property in their frontmatter.

When enabled, the icon will appear on the blog post page, positioned after the post's date and reading time. It will not be displayed on the main blog list page.

To use it, add `ai_assisted: true` to the frontmatter of your blog post:

```yaml
---
title: My AI-Assisted Blog Post
ai_assisted: true
---

Your content here...
```
