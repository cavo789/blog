---
slug: docusaurus-command-palette
title: "One Input, Six Modes: A Ctrl+K Command Palette for Docusaurus"
authors: [christophe, claude]
image: /img/v2/docusaurus_tips.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus, react, component]
date: 2026-10-27
description: Give your Docusaurus blog the Ctrl+K palette you already use in VS Code — one input that fuzzy-jumps to any article, series or tag, runs full-text search, answers questions, jumps to a heading on the current page, and executes site actions. Build-time navigation index, swizzled search bar, and the graceful degradation that keeps every mode honest.
language: en
ai_assisted: true
draft: true
---

<!-- cspell:ignore cmdk maintag Pagefind pagefind combobox listbox aria activedescendant -->

![One Input, Six Modes: A Ctrl+K Command Palette for Docusaurus](/img/v2/docusaurus_tips.webp)

<TLDR>
Every tool I use daily has collapsed its navigation into a single `Ctrl+K` input, and my own blog had eight navbar links and a separate search modal instead. This article builds the palette: one input whose behavior changes with a typed prefix — nothing for a fuzzy jump across every article, series, tag and page, `/` for full-text search, `?` for the question index, `#` for tags, `:` for headings on the current page, `>` for actions. A build-time plugin supplies the navigation index, a swizzled `SearchBar` replaces the old modal, and every source that has nothing to offer degrades to a message instead of a dead entry.
</TLDR>

I know exactly where everything is on my own blog, and I still could not get to it quickly. Eight navbar links, a tag page two clicks away, a search modal that was its own separate universe, and — for jumping to a section inside a long article — scrolling like it is 2009.

Meanwhile every other tool I touch has quietly converged on the same answer. VS Code, GitHub, Linear, Slack, my terminal: one keystroke, one input, and the input figures out what you meant. There is no reason a blog cannot have that. The navigation data is all sitting in the build.

So `Ctrl+K` now does everything on this site, and the navbar became a fallback rather than the main road.

<!-- truncate -->

## Six Modes, One Input

Press <kbd>Ctrl</kbd>+<kbd>K</kbd> (or <kbd>⌘</kbd>+<kbd>K</kbd>) anywhere on the site and you get this:

```plaintext
┌─────────────────────────────────────────────────────────────────────────┐
│  docker compose                                                         │
├─────────────────────────────────────────────────────┬───────────────────┤
│  ARTICLES                                           │ Running Docusaurus│
│  › Running Docusaurus with Docker          docker   │ with Docker       │
│    Docker-out-of-Docker aka DooD           docker   │                   │
│    Docker Compose — the missing manual     docker   │ Run your blog in  │
│                                                     │ a container, with │
│  SERIES                                             │ hot reload and no │
│    Docker tips and tricks          12 articles      │ Node on your host.│
│                                                     │                   │
│  TAGS                                               │ 2024-02-04        │
│    Docker                          58 articles      │ docker · docusaur.│
└─────────────────────────────────────────────────────┴───────────────────┘
   17 results
```

Now type a single character first, and the same input becomes a different tool:

| Prefix | Mode | What it searches |
| --- | --- | --- |
| *(none)* | Fuzzy jump | Every article, series, tag and static page |
| `/` | Full text | The real full-text index, across the body of every page |
| `?` | Ask my blog | 2,050 <Link to="/blog/docusaurus-ask-my-blog">pre-generated questions</Link>, each mapped to a heading |
| `#` | Tags | Tag names, with article counts |
| `:` | Headings | The `h2`–`h6` headings of the page you are on |
| `>` | Actions | Copy this article as Markdown, edit on GitHub, toggle theme… |

And when you open it having typed nothing at all, it does not show an empty box — it offers the next article in the series you were last reading, then the articles you recently viewed, then a one-line reminder of the six prefixes.

## Why One Input Beats Six Buttons

- **The prefix is the mode selector.** No tabs, no dropdown, no settings — the first character routes the query, so switching from "find an article" to "find a heading here" costs one keystroke instead of a trip to a different UI.
- **Every mode returns the same kind of thing: a destination.** Whatever you typed, <kbd>Enter</kbd> takes you somewhere. That is what makes six behaviors feel like one tool rather than six crammed into a box.
- **The index is free.** Docusaurus already knows every article, tag and series at build time. A plugin turns that into a searchable list at no runtime cost — the browser never queries anything to fuzzy-match a title.
- **A mode with nothing to show says so.** No full-text index on a dev build, no questions generated yet, no headings on the current page: each of those produces a specific message, never a dead entry that swallows your <kbd>Enter</kbd>.

That last point sounds like a detail. It is the difference between a palette people trust and one they stop opening.

## Building It

### The navigation index

A tiny plugin flattens the corpus into four lists — articles, series, tags, pages — and exposes them through `setGlobalData`. No fetch, no runtime cost, available during server-side rendering:

<Snippet filename="plugins/command-palette-plugin/index.mjs" source="plugins/command-palette-plugin/index.mjs" defaultOpen={false} />

It reuses the same corpus loader as my <Link to="/blog/docusaurus-blog-map">blog map</Link>, reads series colors from `src/data/series.js`, and imports the very same `createSlug` function that generates the <Link to="/blog/docusaurus-series">`/series/:slug` routes</Link> — so a series' permalink here is byte-for-byte what the router will resolve.

### The palette itself

<ProjectSetup folderName="src/components/CommandPalette">
  <Snippet filename="src/components/CommandPalette/index.js" source="src/components/CommandPalette/index.js" defaultOpen={false} />
  <Snippet filename="src/components/CommandPalette/utils.js" source="src/components/CommandPalette/utils.js" defaultOpen={false} />
  <Snippet filename="src/components/CommandPalette/paletteBus.js" source="src/components/CommandPalette/paletteBus.js" defaultOpen={false} />
  <Snippet filename="src/components/CommandPalette/Hint.js" source="src/components/CommandPalette/Hint.js" defaultOpen={false} />
  <Snippet filename="src/components/CommandPalette/styles.module.css" source="src/components/CommandPalette/styles.module.css" defaultOpen={false} />
</ProjectSetup>

### Mounting it once, and replacing the old search box

The palette is mounted a single time, from a wrapping swizzle of `@theme/Layout`:

<Snippet filename="src/theme/Layout/index.js" source="src/theme/Layout/index.js" defaultOpen={true} />

Then the navbar's search box is swizzled to open the palette instead of its own modal. The rule I set for myself was **replace it, do not double it** — two competing `Ctrl+K` bindings on one page is the worst possible outcome:

<Snippet filename="src/theme/SearchBar/index.js" source="src/theme/SearchBar/index.js" defaultOpen={false} />

Note that it renders a real-looking search field showing the article count and the shortcut, not an icon. An icon-only button is invisible to anyone who is not already looking for it.

## The Modes That Are Not Just Navigation

Two of the six do something a search box cannot.

### `>` — actions

The action list is context-aware: the article-specific entries only exist when you are actually on an article.

```plaintext
> │ Copy this article as Markdown        │ ← on an article only
  │ View raw .md                         │ ← on an article only
  │ Report a typo                        │ ← on an article only
  │ Edit on GitHub                       │ ← on an article only
  │ Show on the map                      │
  │ Copy permalink                       │
  │ Switch to light theme                │ ← label follows the current theme
  │ Keyboard shortcuts                   │
```

Each one is a few lines in a `switch`. "Copy as Markdown" fetches the `.md` mirror of the current page and writes it to the clipboard; "Edit on GitHub" builds a URL from the article's source path, which the plugin already put in the index; "Switch to…" flips the color mode and relabels itself.

### `:` — headings on this page

This one needs no index at all. It reads the current document:

```javascript title="src/components/CommandPalette/utils.js"
export function getPageHeadings() {
  const main = document.querySelector("article") ?? document.querySelector("main");
  if (!main) return [];

  return Array.from(main.querySelectorAll("h2, h3, h4, h5, h6"))
    .filter((heading) => heading.id)
    .map((heading) => ({
      id: heading.id,
      text: heading.innerText,
      level: Number(heading.tagName[1]),
    }));
}
```

On a 3,000-word article this is the mode I use most. It is a table of contents that you summon rather than scroll to.

### And the 404 page opens it for you

The moment a visitor most needs search is when they have just landed on a page that does not exist. So the 404 page turns the failed URL's last segment into a query (`/blog/docker-cs-fixer` → `docker cs fixer`) and opens the palette pre-filled with it — no waiting for them to discover the shortcut.

## Under the Hood (skip this if you just want the palette)

### Fuzzy scoring in twenty lines

The default mode uses subsequence matching, VS Code style: every character of the query must appear in the target, in order, but not necessarily next to each other. Scoring rewards consecutive runs and word-start hits so that `cmdk` ranks "Command Palette" above a coincidental scatter match, and a small length penalty breaks ties in favor of shorter titles:

```javascript title="src/components/CommandPalette/utils.js"
const atWordStart = found === 0 || /[\s/_-]/.test(t[found - 1]);
consecutive = found === tIndex ? consecutive + 1 : 0;

score += 1 + consecutive * 2 + (atWordStart ? 3 : 0);
tIndex = found + 1;
```

### Why `Layout` and not `Root`

`Root` looks like the obvious place to mount a global component. It is wrong here, and the reason cost me an afternoon: the `>` mode's "toggle theme" action needs `useColorMode()`, and `ColorModeProvider` is mounted by `@theme/Layout/Provider` — which wraps `<Layout>`'s own *children*, not its siblings, and certainly not anything above it. Mounted from `Root`, the palette sits outside that context and the hook throws.

The fix is to inject the palette as an extra child *inside* `<Layout>`. Its DOM position is irrelevant — it portals to `document.body` anyway — only the React context matters.

### A pub-sub bus instead of a context

The navbar search box, the 404 page and the first-visit hint are three independent React trees that all need to open the one mounted palette. Threading a context through every swizzled theme component for that would have been absurd, so there is a twelve-line module holding a single listener:

```javascript title="src/components/CommandPalette/paletteBus.js"
let listener = null;

export function registerPalette(onOpen) {
  listener = onOpen;
  return () => {
    if (listener === onOpen) listener = null;
  };
}

export function openPalette(initialQuery = "") {
  listener?.(initialQuery);
}
```

### The full-text probe that exists because of a dev server

The `/` mode loads the full-text index lazily. That index is generated in `postBuild`, so it simply does not exist during `yarn start` — and the graceful path around a missing file turned out to need two guards, not one.

A missing module behind a native `import()` fails as a fetch error, which webpack's dev overlay reports as an uncaught runtime error even though the surrounding `try`/`catch` genuinely catches the rejection: the overlay listens to the failed fetch itself. So the code probes with `HEAD` first.

And a plain `response.ok` check is not enough, because webpack-dev-server's SPA history fallback answers the missing path with a **200** serving `index.html` — which `import()` then fails to parse as a module. Hence the content-type check:

```javascript title="src/components/CommandPalette/utils.js"
const probe = await fetch("/pagefind/pagefind.js", { method: "HEAD" });
const contentType = probe.headers.get("content-type") ?? "";
if (!probe.ok || !contentType.includes("javascript")) return null;
```

Returning `null` there is what turns into "Full-text search isn't available on this build" in the results area — the mode stays visible and honest instead of pretending to search.

### Accessibility

The input is a `combobox` with `aria-controls` pointing at the results `listbox` and `aria-activedescendant` tracking the highlighted row, so arrow keys move a virtual cursor while focus stays in the input. A `Tab` handler cycles focus inside the dialog, <kbd>Esc</kbd> closes, and the element that had focus before opening gets it back on close. The result count is announced through an `aria-live="polite"` status row.

### The first-visit hint

A keyboard shortcut nobody knows about is not a feature. A small dismissible pill appears after a delay — 10 seconds on an article, so it never interrupts someone who has just started reading, and 4 seconds on the homepage, where there is no reading to interrupt. It is shown **at most once, ever**, per browser: the `localStorage` flag is written the moment it is displayed, not when it is dismissed, so someone who ignores it is not shown it again on their next article.

## Conclusion

The palette replaced a search modal and quietly demoted the navbar, but the thing I did not expect was how much it changed my own use of the site. I no longer navigate my blog — I type three letters and arrive.

What made it cheap is that none of the data was new. The articles, the series, the tags, the headings, the source paths on GitHub: all of it already existed somewhere in the build or in the DOM. The palette is barely more than a good index and a switch statement over six prefixes; the hard parts were the boring ones — mounting it in the right React context, and making each mode admit when it has nothing to offer.

If you have already swizzled a theme component on your Docusaurus site, you are much closer to this than it looks. Start with the fuzzy mode over your own articles, and add prefixes as you find yourself wanting them.
