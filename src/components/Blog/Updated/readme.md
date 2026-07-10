# 📜 Updated Component

A timeline component that renders a blog post's revision history from its `updates:` frontmatter field. Reassures readers that the content is maintained and highlights the most recent change.

## 📁 Location

`src/components/Blog/Updated/index.js`. Rendered automatically for every blog post from `src/theme/BlogPostItem/Content/index.js` — no manual import needed in `.mdx` files.

## 🚀 Usage

Add an `updates` array to the post's frontmatter:

```yaml
---
updates:
  - date: 2025-08-25
    note: Using Joomla 5.3.3
  - date: 2026-01-03
    note: Review and update YAML files to Joomla 6
---
```

Entries are sorted newest first regardless of the order they're written in. The most recent entry gets a "Latest" badge. `note` supports basic Markdown (rendered via `parseMarkdown`).

## 🛠 Props

| Prop | Type | Required | Description |
| --- | --- | --- | --- |
| `updates` | `Array<{ date: string, note: string }>` | ✅ | Revision history entries, typically passed as `metadata.frontMatter.updates`. |

## 🔗 Related

The `updates` array is also read by:

* `src/components/StructuredData/index.jsx` — uses the most recent `date` as `dateModified` in the SEO JSON-LD.
* `src/components/Blog/OldPostNotice/index.js` — uses the most recent `date` instead of the publish date when deciding whether to show the "this article may be outdated" warning.
