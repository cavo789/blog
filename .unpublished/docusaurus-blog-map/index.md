---
slug: docusaurus-blog-map
title: Drawing a Map of My Own Blog
authors: [christophe, claude]
image: /img/v2/post_mindmaps.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus, react, component]
date: 2026-10-13
description: Build an interactive map of your whole Docusaurus corpus — every article as a dot, sized by how many other posts link to it, positioned by a force-directed layout that runs at build time in Node so the browser never ships d3-force. Includes the plugin, the canvas component, and the plain-list fallback that keeps the page usable with JavaScript disabled.
language: en
ai_assisted: true
draft: true
---

<!-- cspell:ignore maintag Bezier viewports -->

![Drawing a Map of My Own Blog](/img/v2/post_mindmaps.webp)

<TLDR>
After 247 articles I could no longer answer simple questions about my own blog: which posts are hubs that everything links to, and which ones sit alone in a corner. So I built a `/map` page — a force-directed graph of the whole corpus, where each article is a dot sized by its in-degree and connected by three kinds of edge (real inline links, series neighbors, shared tags). The trick that makes it cheap: the layout runs **once, in Node, at build time**, so the browser receives final `(x, y)` coordinates and never loads a physics engine.
</TLDR>

I write one article a week, and I have been doing it for a while. Somewhere around post number 150 I stopped being able to answer questions I should have known by heart: is that `fzf` article actually linked from anywhere? Which post is the one everything else points back to? Did the whole Quarto series end up isolated from the rest of the blog?

I had the data — every article's frontmatter, every inline link — but no way to *look* at it. A list of 247 rows is not a way to look at anything.

So I built a page that draws the blog as a graph. Here is what came out of it.

<!-- truncate -->

<QuickJump
  links={[
    { label: "What the Map Page Shows You", to: "#what-the-map-page-shows-you" },
    { label: "Building It", to: "#building-it" },
  ]}
/>

## What the Map Page Shows You

One page, `/map`, one picture. Every published article is a dot. The bigger the dot, the more other articles link to it. Lines connect posts that are genuinely related, and hovering one dims everything that is not its neighbor:

```plaintext title="/map"
┌─ Blog Map ──────────────────────────────────────────────────────────────────┐
│                                                                             │
│  Filter by topic  [ Top 120 most-linked articles  ▾ ]                       │
│  247 articles · 25 series · 680 internal links                              │
│                                                                             │
│                           Running Docusaurus with Docker                    │
│         ·   ·                     ●                                         │
│       ·  ╲  │ ╱  ·               ╱ ╲                                        │
│     ·──── (◉) ────·             ●   ●───────● Docker-out-of-Docker          │
│       ·  ╱  │ ╲  ·               ╲ ╱                                        │
│         ·   ·                     ●                                         │
│                                                       🦫                    │
│                                              (a sleeping meerkat: nothing   │
│                                               links to this one yet)        │
│                                                                             │
│  ▸ View as list instead                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

The counters in that header are not decoration, they are the graph's own `meta` block. Everything the page draws is computed before the browser sees it, and you can dump it straight from the plugin:

<Terminal source="./files/graph_stats.txt" />

That is the whole payload: 247 nodes, 1026 edges, 179 KB of JSON, and not a single line of layout math left to run in the browser.

## Why Computing the Layout at Build Time Changes Everything

A force-directed graph is normally a browser thing: you ship a physics library, drop the nodes in, and watch them settle over a few seconds. That approach fails three requirements I actually cared about, and moving the simulation into Node fixes all three at once.

- **The page has to work with JavaScript disabled.** If the positions are already final in the HTML payload, the only thing JavaScript adds is the drawing — so the no-JS path can fall back to a plain, server-rendered, fully indexable list of every article instead of an empty box.
- **Nothing may animate on its own.** There is no `prefers-reduced-motion` branch to write, because there is no motion to suppress: the graph is already at rest the instant it appears.
- **`d3-force` never reaches the reader.** It stays a build-time dependency. The browser gets numbers, not a solver.
- **The same build produces the same map.** Node order is sorted before the simulation starts, and `d3-force` places nodes from their array index rather than from `Math.random()`, so a rebuild with no content change reproduces the exact same picture.

The cost of all that is one extra second in `yarn build`. It is the best trade I have made on this blog.

## Building It

Two pieces: a plugin that computes the graph, and a component that draws it.

### The plugin

It reads the corpus through the same loader my <Link to="/blog/docusaurus-tags">tag tooling</Link> already uses, builds the edges, colors each node, runs 300 simulation ticks, and hands the result to `setGlobalData`:

<Snippet filename="plugins/blog-graph-plugin/index.mjs" source="plugins/blog-graph-plugin/index.mjs" defaultOpen={false} />

One decision in there is worth pulling out: **the node colors are not a new palette.** A post that belongs to a series reuses that series' own accent color from `src/data/series.js` — the same one the <Link to="/blog/docusaurus-series">series page</Link> themes its hero with. A post without a series falls back to the accent color automatically extracted from its banner image. Only a post with neither gets a neutral gray. The map therefore looks like the rest of the site for free, and a reader who already recognizes "the blue one is the Quarto series" recognizes it here too.

### The component

`BlogGraph` reads that global data, draws it on a `<canvas>`, and swaps itself out for a plain list below 768px:

<ProjectSetup folderName="src/components/BlogGraph">
  <Snippet filename="src/components/BlogGraph/index.tsx" source="src/components/BlogGraph/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/BlogGraph/utils.ts" source="src/components/BlogGraph/utils.ts" defaultOpen={false} />
  <Snippet filename="src/components/BlogGraph/GroupedList.tsx" source="src/components/BlogGraph/GroupedList.tsx" defaultOpen={false} />
  <Snippet filename="src/components/BlogGraph/styles.module.css" source="src/components/BlogGraph/styles.module.css" defaultOpen={false} />
</ProjectSetup>

Canvas, not SVG, and that is not a stylistic preference: 247 nodes plus a thousand edges as DOM elements makes every hover a layout recalculation over a thousand nodes. On a canvas, a hover is one full redraw of a few hundred shapes, which is nothing.

Register the plugin in `docusaurus.config.js` and give it a page:

```javascript title="docusaurus.config.js"
plugins: [
  "./plugins/blog-graph-plugin/index.mjs",
  // ...
],
```

```mdx title="src/pages/map.mdx"
---
title: "Blog Map"
description: "An interactive map of the whole blog."
hide_table_of_contents: true
---

import BlogGraph from "@site/src/components/BlogGraph";

<BlogGraph />
```

## The Three Kinds of Connection

An edge means "these two posts are related", but relatedness comes in strengths, and mixing them at equal weight produces a hairball. My corpus emits three types, each with its own pull on the layout:

| Type | What it means | Count | Layout pull |
| --- | --- | --- | --- |
| `link` | One post's prose genuinely links to another | 680 | Strongest — distance 55, strength 0.85 |
| `series` | Two consecutive posts (by date) in the same series | 144 | Medium — distance 70, strength 0.5 |
| `tag` | Two posts sharing several tags | 202 | Weakest — distance 110, scaled by weight |

The `tag` row is where the interesting failure lives. At this corpus size **almost every pair of posts shares at least one tag** — connecting them all would connect everything to everything and destroy both the layout and the picture. Raising the bar to two shared tags still leaves 1,355 pairs, of which 1,153 are the weakest possible kind:

```plaintext
shared tags:   2      3     4    5
pairs:       1153    159    40    3
```

So the plugin does two different things with that set. The **layout** uses every pair down to two shared tags, because that weak spatial pull is exactly what clusters "all my Docker posts" together. The **payload** ships only pairs with three or more, because nothing ever draws the rest — shipping the weight-2 majority would have tripled the JSON for invisible lines. Same data, two thresholds, one for the physics and one for the wire.

## Under the Hood (skip this if you just want the map)

Four problems that were not obvious until the page was actually on screen.

### A two-node filter got a giant, empty canvas

Pick a niche topic from the filter and you might get three articles. The canvas was still sized for 120. My first fix was to size it from the aspect ratio of the visible nodes' bounding box — which failed, because two articles sharing a `mainTag` do not have to sit near each other in the shared, whole-corpus layout. Two nodes at opposite ends produce an extreme ratio that clamps straight back to the maximum height.

The second signal, node count relative to the default view, catches that case but would squash a genuinely tall, tight cluster. So `computeCanvasHeight()` computes both and keeps **whichever is smaller**. Neither blind spot can produce an oversized canvas on its own:

```typescript title="src/components/BlogGraph/utils.ts"
const ratio = contentAspectRatio(nodes) ?? maxRatio;
const aspectHeight = clamp(Math.round(containerWidth * ratio) + padding);

const density = Math.min(nodes.length / defaultTopN, 1);
const densityHeight = clamp(
  Math.round(minHeight + (maxHeight - minHeight) * Math.sqrt(density)),
);

return Math.min(aspectHeight, densityHeight);
```

### Labels stacking on top of each other

Drawing 247 titles is unreadable, so only the eight most-connected visible nodes keep a permanent label, plus the hovered node and its direct neighbors. Even that stacks when a filtered topic is crowded. `selectNonOverlappingLabels()` walks the candidates in priority order — hovered node first, then neighbors, then hubs — measures each one with `ctx.measureText()` and drops any label whose box would intersect one already placed. Lower-priority labels lose; the hovered one always wins.

### Canvas cannot hear a theme change

The node and edge colors are read from the site's own CSS variables so nothing is hardcoded — but a canvas is a bitmap, and toggling dark mode repaints nothing. The fix is a `MutationObserver` on `<html>`'s `data-theme` attribute that bumps a counter, which is in the redraw effect's dependency array:

```typescript title="src/components/BlogGraph/index.tsx"
useEffect(() => {
  const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}, []);
```

### The meerkats

This blog has a mascot — it hides in the <Link to="/blog/docusaurus-ascii-art">page source</Link>, rides the <Link to="/blog/docusaurus-go-top">scroll-to-top button</Link>, and shows up on the 404 page. On the map, eight nodes get a meerkat illustration clipped into their circle instead of a flat dot: the three biggest hubs get a "success" pose (running, trophy, superhero), and up to five nodes with **zero visible connections** get a "nobody has noticed me yet" pose (sleeping, peeking, curled up).

It is a garnish, but an informative one. A sleeping meerkat on the map is a genuinely orphaned article, and it is the fastest way I have found to spot one.

## Conclusion

The map did exactly what I hoped: five minutes after it first rendered, I had a list of posts that nothing linked to, and I could see that one series had drifted away from everything else. That is a maintenance tool disguised as a pretty picture.

The part worth stealing, though, is not the graph — it is where the work happens. Every hard requirement on that page (no JavaScript, no motion, indexable, small payload) dissolved the moment the simulation moved from the browser to `loadContent()`. Docusaurus plugins run in Node with the whole corpus in hand and a build step nobody is waiting on; that is a lot of room to compute things properly, once, instead of asking every visitor's laptop to do it again.

Next time you are about to reach for a client-side library, check whether the answer it computes could have been a constant in your build output.
