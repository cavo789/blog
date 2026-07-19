---
slug: removing-algolia-for-pagefind
title: "Dropping Algolia Search for Pagefind on My Docusaurus Blog"
description: "Algolia DocSearch silently skips code blocks, making it useless for a technical blog. Here's why I switched to Pagefind and how simple the migration was."
authors: [christophe]
image: /img/v2/adios_algolia.webp
mainTag: docusaurus
tags: [docusaurus]
date: 2026-12-31
draft: true
tried_it: false
ai_assisted: true
blueskyRecordKey:
---

![Dropping Algolia Search for Pagefind on My Docusaurus Blog](/img/v2/adios_algolia.webp)

<!-- cspell:ignore caesiumclt pagefind algolia docsearch appid apikey -->

<TLDR>
Algolia DocSearch — the default search for Docusaurus — silently skips code blocks, making it nearly useless for a technical blog where the most valuable content lives inside `code` fences. Switching to Pagefind, a static search library that indexes the built HTML at compile time, took under five minutes, costs nothing, requires zero external account, and immediately solved the problem.
</TLDR>

I noticed the issue once again when I tried to find the tool `caesiumclt` — a CLI image compressor I had mentioned in an article — using the search bar on my own blog. Zero results. I tried a few more specific terms: tool names, CLI flags, Docker image names, command examples. Nothing useful came back. The search bar was decorating my navbar while silently ignoring half my content.

The problem turned out to be structural, not accidental.

<!-- truncate -->

## Why Algolia DocSearch Fails on Technical Blogs

Algolia DocSearch works by sending a cloud crawler to your **deployed** production site. That crawler runs on a schedule — typically once every few days — and targets specific HTML selectors: headings, paragraphs, and list items. Code blocks (`<pre>`, `<code>`) are intentionally excluded from the default configuration because Algolia's general-purpose search model treats code as noise, not signal.

But it's not only that since my article <Link to="blog/reduce-image-size">CaesiumCLT – Effortlessly compress your images right on your device</Link> use the work `caesium` in his title so ... what's happens here?

On top of that:

- **The index is always stale.** A new post won't appear in search results until the next crawler run. If you publish on Monday and the crawler runs on Friday, your content is invisible for four days.
- **External dependency.** Algolia is a SaaS. If their service has a hiccup, your search breaks. If they change their free tier limits, you're affected. If the crawler fails silently, you don't know.
- **Configuration complexity.** Getting the Algolia dashboard, API keys, index settings, and DocSearch application ID all wired up requires creating an account, going through their DocSearch application, waiting for approval, then configuring the crawler rules.

None of that is worth it when a simpler alternative exists.

## Enter Pagefind

[Pagefind](https://pagefind.app/) is a static search library that takes a completely different approach: it runs **at build time**, after `yarn build` has generated the static HTML, and indexes the entire output — including every code block. The result is a search index that is:


<StepsCard
  variant="info"
  title="Navigation keys"
  steps={[
    { content: "**Always complete.** Built from your actual HTML output, not a scheduled crawl" },
    { content: "**Always current.** Regenerated on every build alongside your content" },
    { content: "**Fully offline-capable.** No external API calls at search time" },
    { content: "**Zero maintenance.** No account, no API keys, no crawl rules, no dashboard" }
  ]}
/>

For Docusaurus, the `docusaurus-plugin-pagefind` package wraps everything nicely. It reuses the familiar DocSearch modal UI — so the search bar looks and behaves exactly the same — but replaces the Algolia backend with Pagefind's local index.

## Migration: What Changed

The migration touched four things.

### 1. `package.json`

Removed `@docusaurus/theme-search-algolia`, added `docusaurus-plugin-pagefind`:

```json title="package.json (dependencies excerpt)"
// Before
"@docusaurus/theme-search-algolia": "^3.10.2"

// After
"docusaurus-plugin-pagefind": "^0.1.1",
"pagefind": "^1.5.2"
```

`pagefind` is the core static indexer, and `docusaurus-plugin-pagefind` is the Docusaurus wrapper that wires it into the build pipeline and navbar.

### 2. `docusaurus.config.js` — plugins array

Added the plugin to the `plugins` list:

```js title="docusaurus.config.js"
plugins: [
  // ... existing plugins ...
  ["docusaurus-plugin-pagefind", {}],
],
```

### 3. `docusaurus.config.js` — themeConfig

Removed the entire `algolia:` block from `themeConfig`. That's the block that held the `appId`, `apiKey`, `indexName`, and related settings. Gone, not replaced — Pagefind doesn't need any of that.

### 4. `src/css/custom.css`

Removed the `DocSearch` CSS variable overrides. The `.DocSearch` selectors that controlled the Algolia modal's colors in light and dark mode are no longer relevant.

That's the full scope of the change. No new component, no new configuration file, no new account anywhere.

## One Caveat: Search Does Not Work in Dev Mode

This is the part worth knowing upfront: **Pagefind does not work with `yarn start`**.

Pagefind works by scanning the static HTML files produced by `yarn build`. The dev server never writes HTML to disk — it serves everything from memory — so there is nothing for Pagefind to index. If you open the search modal during development, the bar is there, you can type, and you will get "No results" every single time. That is not a bug. There is simply no index yet.

<AlertBox variant="warning" title="yarn start ≠ working search">
Running `yarn start` (or the equivalent `docusaurus start` in a devcontainer preview) gives you a search bar with zero results. This is expected. Pagefind has nothing to index until `yarn build` has run.
</AlertBox>

To test search locally, you need a full build followed by the static server:

<Terminal>
```bash
$ yarn build && yarn serve
```
</Terminal>

This produces the complete static output, runs Pagefind's indexer over it, and starts a local server at `http://localhost:3000` where search works exactly as it does in production.

In practice, I don't run `yarn build` to write articles — I only need working search when I want to verify that a specific term is actually indexed. The production site is always built before deployment, so the index is always complete there.

## Conclusion

The switch from Algolia to Pagefind was the right call for a blog like this one — heavy on CLI tools, Docker commands, configuration snippets, and all the kind of content that lives inside code blocks. Algolia's crawler looks right past all of that; Pagefind indexes every single character of it.

The migration took less time than it took me to write this article. And now, when someone searches for `caesiumclt` — or any other obscure tool name I've written about — they'll actually find it.
