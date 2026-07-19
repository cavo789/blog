# 🧠 getBlogMetadata

A utility function for extracting structured metadata from MDX blog posts in a Docusaurus project. It dynamically loads all posts in the `/blog` directory and returns a clean array of metadata objects for use in custom components, feeds, or dashboards.

## 🚀 Features

- 📂 Loads all `.mdx` and `.md` files from `/blog`
- 🧾 Parses frontmatter for key metadata fields
- 🔗 Resolves permalinks and image paths
- 🧹 Filters out invalid entries
- 🧩 Supports tags, authors, series, and visibility flags

## Location

Place this file in: `src/components/Blog/utils/posts.js`

## 🧪 Usage

```js
import { getBlogMetadata } from '@site/src/components/Blog/utils/posts';

const posts = getBlogMetadata();
console.log(posts);
/*
[
  {
    title: "My First Post",
    description: "An intro to my blog",
    image: "/blog/my-first-post/cover.png",
    permalink: "/blog/my-first-post",
    tags: ["intro", "personal"],
    authors: ["johndoe"],
    date: "2025-08-20",
    draft: false,
    unlisted: false,
    mainTag: "intro",
    series: "Getting Started"
  },
  ...
]
*/
```

## 📦 Returned Fields

| Field | Type | Description |
| `title` | string | Post title |
| `description` | string | Short summary |
| `image` | string | Resolved image path |
| `permalink` | string | URL path to the post |
| `tags` | string[] | List of tags |
| `mainTag` | string | Primary tag (optional) |
| `authors` | string[] | List of authors |
| `date` | string | Publication date |
| `draft` | boolean | Whether the post is unpublished |
| `unlisted` | boolean | Whether the post is hidden from listings |
| `series` | string | Series name (optional) |

## ⚠️ Notes

- Image paths starting with `./` are automatically resolved relative to the post directory.
- Posts without valid frontmatter are skipped.
- This function relies on Webpack’s `require.context` and is not compatible with environments that don’t support it (e.g. Node.js without bundling).

## 📄 License

MIT — free to use, modify, and contribute.

## 💬 Authors

[Valentin Chevoleau](https://github.com/Juniors017) and [Christophe Avonture](https://www.avonture.be).
