# frontmatter-loader

A tiny [Webpack loader](https://webpack.js.org/concepts/loaders/) that reduces a Markdown or MDX file to its YAML front matter and nothing else.

## 🚀 What It Does

Given an article, it emits:

```js
module.exports = {
  frontMatter: { title: "…", date: new Date("2026-08-17T00:00:00.000Z"), tags: ["ai"] },
};
```

The body is discarded. YAML dates stay real `Date` objects, exactly like the front matter exported by `@docusaurus/mdx-loader`, so consumers see no difference.

## 🧩 Why It Exists

`src/components/Blog/utils/posts.ts` needs the front matter of every article to build listings, series pages, related posts and counters. It collects them with `require.context()` over `blog/`.

Left alone, that context hands every file under `blog/` to the Webpack rule installed by `@docusaurus/plugin-content-blog`. That rule's `createAssets()` hook throws:

```text
Error: Blog post not found for filePath=…
```

for any file the blog plugin did **not** turn into a post — and a `draft: true` article is precisely that during a production build. One draft under `blog/` was therefore enough to break `yarn build` entirely.

Prefixing the context request with `!!` and this loader disables the configured rules for those modules:

```js
const posts = require.context(
  "!!../../../../plugins/frontmatter-loader/index.cjs!../../../../blog",
  true,
  /\.mdx?$/,
);
```

Two consequences:

- `draft: true` becomes usable on articles living under `blog/` — visible in `yarn start`, skipped by the production build, ready to be published by deleting a single line.
- Reading front matter no longer compiles 248 articles to JSX just to throw the body away.

## ⚠️ Gotchas

- The `!!` prefix is load-bearing. Removing it silently reintroduces the crash, and only when a draft is present.
- Because the blog plugin's rule is bypassed, a Markdown file under `blog/` that happens not to be an article no longer raises an error. `posts.js` guards against that by skipping entries without a `title`.
