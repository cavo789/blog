# markdown-export-plugin

## Purpose

Writes a plain-Markdown mirror of every published blog post next to its HTML
page — `/blog/<slug>` → `/blog/<slug>.md` — plus a site-wide `/llms.txt` index
and a per-series `/llms/<series-slug>.txt` bundle. A reader (human, or an
assistant they paste the URL into) can fetch the article's full content
without React, JSX, or the accordions the HTML page collapses by default
(`defaultOpen={false}` on `<Snippet>`, used 100+ times across this corpus —
the mirror always shows the full file).

See TODO 0082 for the original brief.

## How it works

- `index.cjs` — the Docusaurus plugin. In `postBuild` (so only during
  `yarn build`, never `yarn start`): reads every `blog/**/index.{md,mdx}`
  file directly off disk, cross-checks each computed permalink against
  Docusaurus's own `routesPaths` (this is what makes `draft: true` posts fall
  out for free — the routesPaths cross-check does that filtering, not a
  duplicated copy of Docusaurus's own draft logic), degrades each live post,
  writes the `.md` mirror, then builds `llms.txt` (grouped by `mainTag`) and
  one `llms/<series-slug>.txt` per series (posts concatenated in date order).
- `degrade.cjs` — the actual MDX → Markdown transform. Parses the raw source
  with `@mdx-js/mdx`'s `createProcessor`, walks the resulting mdast tree
  bottom-up, and replaces every custom component and raw HTML tag with a
  plain mdast equivalent before handing the tree to `remark-stringify`.

## The one rule that must never be broken

An unrecognised component never fails the export. Its wrapper is discarded
and its (already-degraded) children take its place in the tree. The
component's name is collected into `unknownComponents` and printed as a
single build warning — that warning, not the table itself, is what keeps the
export at full coverage as new components get added. If you add a component
to `src/components/` that carries real article content, add a matching entry
to `degrade.cjs`'s `COMPONENT_RULES` (or `degradeHtmlTag` for a raw HTML tag)
when the build warns about it.

## Why `format: "mdx"`, not `format: "md"`

This is the least obvious line in `degrade.cjs`, worth restating here.
`@mdx-js/mdx`'s own `core.js` only attaches `remark-mdx` (the JSX/expression
tokenizer) when `format !== "md"`. Under `format: "md"` — which sounds like
the natural choice for a `.md` file — `<Snippet source="…" />` parses as an
inert `html` text node instead of a component node, and nothing would ever
reach `COMPONENT_RULES`. `format: "mdx"` gives real
`mdxJsxFlowElement`/`mdxJsxTextElement` nodes regardless of the file's own
`.md`/`.mdx` extension. Confirmed empirically against this corpus (241 `.md`
files, 7 `.mdx`) while writing this plugin — a few `.md` files even have
top-level `import` statements, and `format: "mdx"` parses those fine too.

That switch alone reintroduces a crash `format: "md"` had been silently
avoiding: `## Heading {#id}` (Docusaurus's heading-id syntax) makes
`remark-mdx`'s expression tokenizer try, and fail, to parse `#id` as
JavaScript. Two raw-text preprocessing passes — both public
`@docusaurus/utils` exports, applied in the same order
`@docusaurus/mdx-loader`'s own `preprocessContent()` does — fix this:
`escapeMarkdownHeadingIds` and `admonitionTitleToDirectiveLabel` (the latter
also converts Docusaurus's `:::tip Free text title` shorthand into
`remark-directive`'s `:::tip[Free text title]` label syntax).

## Known limitations

- **Relative images** (`![](./images/x.webp)`, or `<Image src={require(...)}
/>`) are dropped to alt text rather than linked. Webpack fingerprints these
  into hashed build URLs (`/assets/images/<hash>.webp`) that can't be
  predicted from source alone. Absolute paths (`/img/…`) and full URLs
  survive as real image links, since those resolve identically on the HTML
  page and on the flat `.md` mirror.
- **`DownloadButton`/`Image` via `require("./x").default`**: same
  fingerprinting problem — the file name is named in the output, not linked.
- **`remark-directive`'s bare `:word` syntax is a known false-positive trap**
  on ordinary prose (`user_id:group_id`, `image:latest`, `github.com:user`).
  `degrade.cjs` reconstructs the exact original characters from the source
  for any `textDirective` it meets (there is no genuine inline-directive
  usage in this corpus to lose) rather than deleting the word after the
  colon — but a build warning still fires for each one, worth a quick glance
  after adding new prose containing a literal colon.
- **Docusaurus's own admonitions AST transform** is imported from an
  internal path (`@docusaurus/mdx-loader/lib/remark/admonitions` — not
  published API). Wrapped in a `try`/`catch`: if a future `@docusaurus/core`
  bump relocates it, `:::tip`/`:::note` blocks degrade through the generic
  "unknown directive" fallback instead of breaking the build.

## Companion pieces

- `static/.htaccess` — `AddType text/markdown .md` so the mirrors display
  inline instead of downloading, plus a no-cache header alongside `.html`.
- `src/components/CopyAsMarkdown` — the "Copy as Markdown" / "View raw"
  button in the article header, wired through
  `src/theme/BlogPostItem/Header` and `src/theme/BlogPostItem/index.js`
  (mirroring the existing `aiIcon` prop-passing pattern). Only rendered on
  the post page itself, never on a list-view card.

## Discoverability — none of this is found unless something points to it

Generating `llms.txt`, the per-series bundles and the `.md` mirrors is not the
same as making them *public*. Nothing crawls a domain looking for these paths
by default — the llms.txt convention (llmstxt.org) has no equivalent of
`robots.txt`'s de-facto crawler support. Four deliberate pointers make the
files reachable:

- **`docusaurus.config.js`'s `headTags`** — a site-wide
  `<link rel="alternate" type="text/markdown" href="/llms.txt">`, present on
  every page. Same pattern as RSS's
  `<link rel="alternate" type="application/rss+xml">`.
- **`src/components/MarkdownAlternate`** — the per-article equivalent, wired
  into `src/theme/BlogPostPage/index.js` next to `OpenGraphArticle`. Points at
  *this* page's own `.md` mirror, so a tool that only ever looks at one
  article's `<head>` doesn't need to know `/llms.txt` exists at all.
- **`writeLlmsTxt()`'s "Series" section** — `llms.txt` is the only place the
  per-series bundles are linked from site-wide. Without this section they're
  written to disk under `/llms/` but unreachable from anything an LLM would
  actually fetch; this is what makes `llms.txt` a real index instead of just
  the site-wide article list.
- **`SeriesArticlesPage.js`'s "View this series as plain Markdown" link** —
  the human-facing counterpart of the point above: a reader already on
  `/series/<slug>` shouldn't have to go through `/llms.txt` to find the one
  bundle they're looking at. `slug` is already `createSlug(series name)` from
  the route match, the same algorithm `writeSeriesFull()` uses to name the
  file, so the link needs no extra lookup.

`static/robots.txt` also carries a comment pointing at `/llms.txt` — not a
real directive (no such directive exists), just a cheap breadcrumb for
whatever already parses that file. None of this guarantees a crawler will
follow it; as of 2026 no major LLM crawler is known to fetch `/llms.txt`
automatically.
