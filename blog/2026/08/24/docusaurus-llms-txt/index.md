---
slug: docusaurus-llms-txt
title: "Your Blog Is Unreadable to an AI. Here Is the Fix."
authors: [christophe, claude]
image: /img/v2/llms-txt.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags: [docusaurus, ai, markdown]
date: 2026-08-24
description: A growing share of your readers arrive through an AI assistant — and what they get is your HTML, wrapped in navigation, React widgets and collapsed accordions. This article generates a plain-Markdown mirror of every article, a /llms.txt index, and per-series full-text bundles, by degrading the MDX source rather than converting the rendered HTML. Includes the fallback rule that makes the export impossible to break.
language: en
ai_assisted: true
blueskyRecordKey: 3mtslipixls2v
---

<!-- cspell:ignore llms mdxjs unified remark stringify hast maintag preprocessContent -->

![Your Blog Is Unreadable to an AI. Here Is the Fix.](/img/v2/llms-txt.webp)

<TLDR>
`llms.txt` is a proposed convention for making a site legible to AI assistants — and an unproven one: no major assistant (ChatGPT, Claude, Perplexity) publicly confirms reading it. I explored it anyway, mostly because this blog is already written with Claude Code doing most of the file work, so maintaining a `llms.txt` mirror costs almost nothing. What I found while building it: the published HTML, wrapped in navigation, React widgets, and 107 collapsed `<Snippet>` accordions, is genuinely *less complete* than the source I wrote. The fix is a build-time plugin that emits a plain-Markdown mirror of every article, a `/llms.txt` index and one full-text bundle per series. The key decision: degrade the **MDX source**, never the rendered HTML — and never let an unknown component fail the export.
</TLDR>

I wanted to explore the `llms.txt` track, mostly out of curiosity, not because I had any evidence readers were arriving through an assistant. The idea — proposed by [Answer.AI's Jeremy Howard](https://www.answer.ai/posts/2024-09-03-llmstxt.html) in September 2024 — is to publish a plain-Markdown index of a site at `/llms.txt`, so an assistant does not have to fight a React app to find the actual content. It is far from an established practice: none of ChatGPT, Claude, or Perplexity publicly confirm that their retrieval pipeline reads the file, and it may never catch on the way `robots.txt` or `sitemap.xml` did. What tipped it for me is that this blog is already written with Claude Code doing most of the file work, so keeping a `llms.txt` mirror in sync would not be a chore I carry by hand — it would just be another build step. When trying something costs that little, you just try it.

<!-- truncate -->

## What Gets Generated

One `yarn build`, three artifacts, all static:

<Terminal source="./files/build_output.txt" />

The first is `/llms.txt` (see mine [online](https://www.avonture.be/llms.txt))— the site index, in the format [llmstxt.org](https://llmstxt.org) proposes: a title, a one-line summary, and then every article as a link plus its description, grouped by topic:

<Terminal title="curl https://www.avonture.be/llms.txt" source="./files/llms_txt.txt" />

The second is a plain-Markdown mirror of every single article, at its own URL plus `.md`. Take the <Link to="/blog/docusaurus-go-top">scroll-to-top button article</Link>, fetch [`/blog/docusaurus-go-top.md`](https://www.avonture.be/blog/docusaurus-go-top.md), and you get this — no JSX, no accordions, every code file inlined in full:

<Snippet filename="/blog/docusaurus-go-top.md" source="./files/mirror_sample.txt" defaultOpen={true} />

The third is the one I would not have thought of on my own: **one full-text bundle per <Link to="/blog/docusaurus-series">series</Link>**, at `/llms/<series-slug>.txt`, concatenating every article of that series in reading order. The [Docusaurus components](https://www.avonture.be/llms/creating-docusaurus-components.txt) bundle is 710 KB of pure Markdown — 23 articles that an assistant can pull in a single request instead of 23.

## Why the Source, and Never the HTML

Every tool in this space converts rendered HTML back to Markdown. That is the wrong direction, and the reason is not aesthetic:

- **The HTML has already lost information.** This blog folds 107 code snippets into collapsed `<Snippet>` accordions, some components render nothing until hydration, and images sit behind lazy loading — an HTML-to-Markdown pass can only recover what the HTML contains, and the HTML contains less than the source.
- **The source is already Markdown.** An MDX file is Markdown with some JSX sprinkled in it. Going source → Markdown means handling a few dozen component names; going HTML → Markdown means reverse-engineering an entire rendering pipeline.
- **The generated file is genuinely better than the page.** `<Snippet source="./files/compose.yaml">` becomes a fenced code block containing the whole file. A reader of the mirror gets the code the reader of the page has to click to reveal.
- **Nothing is invented.** Every component on this blog either wraps content the author typed, or points at a file on disk. There is no component that fabricates content at runtime — so a source-level degradation can be complete by construction.

The result is not a lossy export of my site. It is a *more complete* version of it.

## Building It

### The degradation table

My articles are not plain Markdown: they are MDX, Markdown with a few dozen custom React components mixed in — `<Snippet>` for a collapsible code block, `<AlertBox>` for a callout, `<Link>` for a cross-reference, and so on. Each one exists to add a bit of interactivity to the page, and each one is exactly what a Markdown mirror cannot render as-is. So the plugin has to know, one component at a time, what plain Markdown it should turn into. The whole thing is a remark pipeline: parse the MDX source into an AST, walk it, replace each JSX node with plain-Markdown nodes, then stringify. Each component gets one rule:

| Component | Uses | Degradation |
| --- | ---: | --- |
| `Snippet` | 917 | fenced block; `source=` (841×) resolved and inlined in full |
| `Link` | 779 | `[text](href)` |
| `AlertBox` | 546 | `> **{title}:** …` (variant becomes the keyword) |
| `Terminal` | 455 | ```` ```bash ```` block; `source=` (146×) resolved |
| `TLDR` | 253 | `> **TL;DR** …` |
| `BrowserWindow` | 98 | children, plus a `> Screenshot — {url}` caption |
| `StepsCard` | 55 | ordered list |
| `ProjectSetup` | 28 | `### Project: {folderName}` then each `Snippet` as a titled block |
| `Details` | 18 | left as `<details>` — valid Markdown already |
| `Prerequisite` | 10 | bullet list |
| `Columns` / `Column` | 9 | sequential sections |
| `Reaction`, `ScrollToTopButton`, `Bluesky`, `RelatedPosts`, … | ~15 | **removed** — interface, not content |
| `Trees` / `Folder` / `File` | 0 | **nothing to do** (see below) |

That last row is my favorite line in the whole plugin. Those components exist because a remark plugin turns an ASCII directory tree in the source into React components. Not applying that plugin gives the original ASCII tree back for free. The correct rule was to write no rule at all.

<Snippet filename="plugins/markdown-export-plugin/degrade.cjs" source="plugins/markdown-export-plugin/degrade.cjs" defaultOpen={false} />

### The orchestrator

The plugin runs in `postBuild`, degrades each live article, writes the mirrors, then builds the two indexes on top of whatever succeeded:

<Snippet filename="plugins/markdown-export-plugin/index.cjs" source="plugins/markdown-export-plugin/index.cjs" defaultOpen={false} />

Register it like any other plugin:

```javascript title="docusaurus.config.js"
plugins: [
  "./plugins/markdown-export-plugin/index.cjs",
  // ...
],
```

<AlertBox variant="warning" title="Self-hosted? Watch the MIME type">
`/blog/my-slug` (like `/blog/docusaurus-llms-txt` for this article) is a *directory* containing `index.html`, so its sibling `/blog/my-slug.md` creates no route conflict — that one is free. But Apache has no built-in MIME mapping for `.md`, so without `AddType text/markdown .md` in `.htaccess`, the browser offers a download instead of displaying the file.
</AlertBox>

## The One Rule That Makes This Safe

**An unknown component never fails the export. Its wrapper is dropped and its children take its place.** No exceptions, no errors, ever.

That single rule is what allows a 900-line degradation table to sit in a build pipeline without becoming a liability. Add a component in six months, forget to write a rule, and the worst case is that its wrapper vanishes while its content survives.

But a silent fallback is a slow leak, so the plugin records every component it did not recognize and warns once per build. **That warning, not the table, is what keeps coverage at 100% over time** — the table is frozen the day you write it; the warning notices the day you break it.

And it caught something I never would have looked for. Look again at the build output at the top of this article: ten "unknown components", all beginning with a colon.

```text
- :latest (inline directive — verify this wasn't a false positive on "word:word" prose)
- :host-gateway (inline directive — verify this wasn't a false positive on "word:word" prose)
- :USERPROFILE (inline directive — verify this wasn't a false positive on "word:word" prose)
```

Those are not components. `remark-directive` — needed to handle Docusaurus admonitions — parses `:name` as an inline directive, so `nginx:latest` in prose, `host:host-gateway` in a compose snippet and `%USERPROFILE%` in a Windows path all get tokenized as directives. They degrade harmlessly through the generic fallback, but I only know they exist because the warning prints them. Ten small facts about my own corpus that no test would have told me.

## Making It Discoverable

Generating a file is not publishing it: without a link pointing at it, nothing — crawler or human — ever finds `/llms.txt` or a per-series bundle on its own. Four hooks close that gap, each targeting a different consumer:

**1. `llms.txt` links its own bundles.** The index opens with a "Series (full-text bundles)" section. It is the only place they are ever referenced.

**2. A site-wide `<link rel="alternate">`,** in `headTags`, so it is server-rendered on every page — exactly how RSS has always been discovered:

```javascript title="docusaurus.config.js"
{
  tagName: "link",
  attributes: {
    rel: "alternate",
    type: "text/markdown",
    href: "https://www.avonture.be/llms.txt",
    title: "llms.txt — full site index in Markdown, for LLMs and readers",
  },
},
```

**3. A per-article equivalent,** pointing at that article's own mirror, injected by a tiny component wired into the blog post page:

<Snippet filename="src/components/MarkdownAlternate/index.tsx" source="src/components/MarkdownAlternate/index.tsx" defaultOpen={true} />

**4. A breadcrumb in `robots.txt`.** There is no standard directive for this — it is a comment, read by anything already parsing that file and looking for one. It cost two lines.

<AlertBox variant="note" title="One honest limitation">
The human-facing "View this series as plain Markdown" link on `/series/<slug>` is invisible to a crawler that does not run JavaScript: that page is a client-side React Router route, so its link never appears in server-rendered HTML. The two `<link rel="alternate">` tags above do not have that problem — which is exactly why the discovery hooks that matter live in `headTags` and in a component, not in a page body.
</AlertBox>

And then there is the part no code can do for you: **submitting to the directories**. The correct ones are the ones the official spec page links to. I got `llmstxt.site` and `directory.llmstxt.cloud` registered; `llmstxthub.com` had a broken submission form the day I tried. Worth ten minutes.

## Conclusion

What I like about the result has less to do with AI adoption than I expected going in:

- **Anyone can `curl` an article and get it whole.** Not just a bot — a script, a colleague, me on a slow connection — gets the full text with no HTML, no JavaScript, no navigation to strip out by hand first.
- **The blog is bot-friendly regardless of whether `llms.txt` itself ever catches on.** A plain-Markdown version of every article now exists as a side effect, independent of that convention's fate.
- **A Markdown file drops straight into a text editor or an LLM's context window.** No more select-all-and-delete-the-navbar before an article is actually usable somewhere else.
- **`/llms.txt` doubles as an inventory of the blog** — every article, one line each, grouped by topic. A table of contents I did not have before, generated for free.
- **The per-series bundles turn 23 requests into one.** Handy for an assistant pulling context, just as handy for a reader who wants an entire series in a single file to read or archive.
- **None of it needs to be remembered.** It is a build step, not a habit — which is exactly why an unproven convention was worth one hour to try in the first place.

If the 107 collapsed <Link to="/blog/docusaurus-snippets">`<Snippet>`</Link> accordions that started this whole thing are new to you, that component is worth its own read.
