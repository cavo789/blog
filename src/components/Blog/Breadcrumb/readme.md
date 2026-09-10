# 🧭 Breadcrumb Component

Displays the article's position in the blog hierarchy at the top of a blog post header.

```text
Home › Docker › Modern CLI tools for your terminal › Lazydocker
```

## 📦 Location

```bash
src/components/Blog/Breadcrumb/index.tsx
```

## ✨ Features

- Four levels: `Home` › `mainTag` › `series` › article title
- The last level (the title) is text, not a link
- Skips the `mainTag` level when the post has none, and the `series` level for the
  79 articles that belong to no series
- Renders on the article page only — never in list view (`/blog`, tags, series, archives)
- Feeds the `BreadcrumbList` JSON-LD from the same data, so the visible trail and the
  structured data can never disagree

## 🚀 Usage

Not an MDX component: it is rendered by the swizzled blog post header,
`src/theme/BlogPostItem/Header/index.js`, and takes no props.

```jsx
import Breadcrumb from "@site/src/components/Blog/Breadcrumb";

<Breadcrumb />;
```

It reads everything it needs from `useBlogPost()`, so it must be rendered inside a
`BlogPostProvider`.

## 🔗 Link safety

`onBrokenLinks: "throw"` is active. Both intermediate links are safe by construction:
`plugins/lib/blog-taxonomy.cjs` enumerates one real route per `mainTag` and per `series`
found in article front matter (drafts included), which is the exact same value this
component slugifies.

## 🧩 Dependencies

- `buildBreadcrumbTrail` from `src/components/Blog/utils/breadcrumb.ts` — shared with
  `src/components/StructuredData/index.tsx`
- `createSlug` from `src/components/Blog/utils/slug.ts`
- `getTagLabel` from `src/data/tags.js` (resolves a `mainTag` key to its `blog/tags.yml` label)
