---
slug: docusaurus-copy-as-markdown
title: Add a "Copy as Markdown" Button to Your Docusaurus Blog
authors: [christophe]
image: /img/v2/copy-as-markdown.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus, markdown, react]
date: 2026-08-18
description: Build a "Copy as Markdown" button and a "View raw" link for your Docusaurus blog posts — a build-time plugin that writes a plain-Markdown mirror next to every article, plus the tiny React component that fetches it and copies it to the clipboard. Full source included.
language: en
ai_assisted: true
draft: true
---

![Add a "Copy as Markdown" Button to Your Docusaurus Blog](/img/v2/copy-as-markdown.webp)

<TLDR>
This guide adds a "Copy as Markdown" button and a "View raw" link to every post on a Docusaurus blog. Two small pieces make it work: a build-time plugin that writes a plain-Markdown mirror next to each article's HTML page (`/blog/my-post` → `/blog/my-post.md`), and a React component that fetches that mirror and copies it to the clipboard. No server, no database, about 90 lines of code in total — and readers, or the LLM they paste the URL into, get the article's full text without React, JSX, or any collapsed accordion the HTML page hides by default.
</TLDR>

Every time I want to paste one of my own articles into an LLM to ask it a question, I go through the same annoying ritual: open the page, select all, copy, paste, then spend a minute deleting the navigation menu, the "Was this helpful?" widget, and half a dozen stray UI labels that came along for the ride. The article's actual content — the part I wanted — is buried in there somewhere.

A blog post's source is *already* Markdown. There is no reason a reader should have to fight the rendered HTML to get it back.

So I built a small "Copy as Markdown" button that sits right in the article header: one click, and the plain-text source lands in the clipboard, ready to paste anywhere. This post walks through both pieces you need to reproduce it — a build-time mirror generator and the button itself — with the button's real, current source code included.

<!-- truncate -->

## What Gets Copied

Here's the file the button actually fetches, produced by a `postBuild` step you'll write in a moment — this is the literal text that lands in the clipboard when a reader clicks the button:

<Terminal source="./files/terminal_demo.txt" typewriter />

Even the `<TLDR>` tag survives untouched — good enough for a human to skim or an LLM to parse. Notice the HTML comment at the very top, too: it's how the mirror points back to the real, fully rendered page.

## Why It's Just Two Moving Parts

- A React button that fetches a URL derived from the current page's permalink and copies whatever text comes back — it has no idea what "Markdown" even is.
- A build step that makes that URL actually respond with something worth copying: one plain-text file per post, sitting quietly next to the HTML page it mirrors.
- Because the two only talk to each other over a plain URL, either can be swapped independently later — a smarter mirror generator, a fancier button — without touching the other file.
- A missing mirror (wrong build, dev server, typo in the URL) degrades to a clear "Could not copy" message instead of a silent failure or a crash.

## Step 1 — Generate a Plain-Markdown Mirror at Build Time

The button is only half the story: without a `.md` file for it to fetch, it always ends in the "Could not copy" state. That file needs to exist *before* the button is even useful, so build it first.

Create `plugins/markdown-mirror-plugin/index.cjs`:

<Snippet filename="plugins/markdown-mirror-plugin/index.cjs" source="./files/markdown-mirror-plugin.cjs" defaultOpen={false} />

Four things worth calling out:

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
function buildMetadataComment(url, buildDate) {
  return [
    "<!--",
    `  canonical-url: ${url}`,
    `  generated-at:  ${buildDate}`,
    "  This is a static plain-Markdown mirror generated at build time.",
    "  Visit the canonical URL above for the fully rendered page, with images and interactive components.",
    "-->",
    "",
  ].join("\n");
}
```

This is the piece that answers a question every plain-text mirror eventually raises: *where did this come from?* An HTML comment is the right container for it — hidden the moment the file is pasted into anything that actually renders Markdown (Notion, Obsidian, a GitHub comment box), yet still plain text in a raw view or in whatever an LLM is handed, so the URL survives exactly where a reader who lost track of the original page needs it. `generated-at` uses one timestamp shared by every mirror in the run (computed once in `postBuild`, not per file), so it reflects "this build," not "this millisecond."

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
async postBuild({ siteDir, outDir, siteConfig, routesPaths }) {
```

`postBuild` is a Docusaurus [lifecycle hook](https://docusaurus.io/docs/api/plugin-methods/lifecycle-apis#postBuild) — it fires once, after `yarn build` finishes writing the HTML, and never during `yarn start`. That's exactly the timing you want: the mirror only needs to exist in production. `siteConfig.url` is what turns a bare permalink into the absolute URL the comment above needs.

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
if (!knownRoutes.has(permalink)) continue;
```

`routesPaths` is the list of URLs Docusaurus itself decided to actually publish. Cross-checking against it — instead of re-implementing "is this post a draft?" logic by hand — is what makes `draft: true` posts fall out of the mirror for free.

```javascript title="plugins/markdown-mirror-plugin/index.cjs"
const content = body.replace("<!-- truncate -->\n", "").trim() + "\n";
const markdown = buildMetadataComment(url, buildDate) + content;
```

The frontmatter block is stripped by the `front-matter` package before this line even runs; the `replace` here only removes the `<!-- truncate -->` marker, which has no meaning outside Docusaurus's own summary-splitting logic. The metadata comment from earlier gets prepended last, right before the file is written.

Wire it into your config:

```javascript title="docusaurus.config.js"
const config = {
  // ...
  plugins: ["./plugins/markdown-mirror-plugin/index.cjs"],
};
```

<AlertBox variant="tip" title="front-matter is a small, dependency-free package">
  `npm install front-matter` if your project doesn't already have it — it's a single-purpose YAML-frontmatter parser, not a full Markdown toolchain.
</AlertBox>

<AlertBox variant="note" title="This version is intentionally simple">
  It copies your Markdown source through as-is, so any custom MDX component (a `<TLDR>`, a `<Card>`, your own widgets) shows up in the mirror as raw JSX text rather than a plain-Markdown equivalent. For a handful of components that's perfectly readable, as the mirror above shows. If your blog leans on dozens of custom components the way this one does, see "Under the Hood" further down for what a fuller version needs to handle.
</AlertBox>

## Step 2 — The CopyAsMarkdown Component

This is the actual, current source running on this blog — not a simplified excerpt:

<Snippet filename="src/components/CopyAsMarkdown/index.tsx" source="src/components/CopyAsMarkdown/index.tsx" defaultOpen={false} />

### 2.1 — State and the derived URL

```javascript title="src/components/CopyAsMarkdown/index.tsx"
const [status, setStatus] = useState("idle"); // idle | copying | copied | error
const mdUrl = `${metadata.permalink.replace(/\/$/, "")}.md`;
```

`status` is a small four-state machine that drives everything the button shows. `mdUrl` strips any trailing slash off the post's permalink and appends `.md` — matching exactly what the plugin from Step 1 writes to disk.

### 2.2 — The copy handler

```javascript title="src/components/CopyAsMarkdown/index.tsx"
const handleCopy = useCallback(async () => {
  setStatus("copying");
  try {
    const res = await fetch(mdUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    await navigator.clipboard.writeText(text);
    setStatus("copied");
  } catch (err) {
    console.error("CopyAsMarkdown: failed to copy", err);
    setStatus("error");
  }
}, [mdUrl]);
```

A `fetch` for the mirror, a `writeText` to the clipboard, and a single `catch` around both. That one `catch` block is doing double duty: it catches a missing mirror (404, `!res.ok`) *and* a Clipboard API rejection (denied permission, insecure context) with the same "error" outcome — the reader doesn't need to know which one happened, only that the copy didn't work.

<AlertBox variant="note" title="The Clipboard API needs a secure context">
  `navigator.clipboard` is only available over HTTPS, or on `localhost`. Test the button on a plain `http://` address on any other host and `writeText` will reject every time — that's the browser, not a bug in this component.
</AlertBox>

### 2.3 — Auto-reset

```javascript title="src/components/CopyAsMarkdown/index.tsx"
useEffect(() => {
  if (status !== "copied" && status !== "error") return;
  const timer = setTimeout(() => setStatus("idle"), 2000);
  return () => clearTimeout(timer);
}, [status]);
```

Once `status` lands on `copied` or `error`, this effect schedules a return to `idle` two seconds later, so the button doesn't stay stuck reading "✓ Copied" forever. The cleanup function cancels a pending timer if the reader clicks again before those two seconds are up.

### 2.4 — Rendering

```javascript title="src/components/CopyAsMarkdown/index.tsx"
return (
  <div className={styles.wrapper}>
    <button
      type="button"
      className={styles.copyBtn}
      onClick={handleCopy}
      disabled={status === "copying"}
    >
      {status === "copied"
        ? "✓ Copied"
        : status === "error"
          ? "Could not copy"
          : "📋 Copy as Markdown"}
    </button>
    <a href={mdUrl} className={styles.rawLink} target="_blank" rel="noopener noreferrer">
      View raw
    </a>
  </div>
);
```

The button's label is a straight ternary chain off `status`; it's disabled while a fetch is in flight so a reader can't fire off a second request mid-copy. The "View raw" link needs no JavaScript at all — it points straight at `mdUrl` and lets the browser handle it, `target="_blank"` and `rel="noopener noreferrer"` keeping the new tab from getting a handle back to this one.

## Step 3 — The CSS Module

<Snippet filename="src/components/CopyAsMarkdown/styles.module.css" source="src/components/CopyAsMarkdown/styles.module.css" defaultOpen={false} />

Every color here is an Infima custom property (`--ifm-color-emphasis-*`), so the button adapts to light mode, dark mode, or a fully custom Docusaurus theme without a single hardcoded hex value or a `[data-theme="dark"]` override to maintain.

## Step 4 — Wire It Into the Blog Post Header

Docusaurus renders your post content through a theme component called `BlogPostItem`. Getting the button to show up means swizzling it:

```bash
yarn run swizzle @docusaurus/theme-classic BlogPostItem --eject
```

Confirm the eject when prompted — a `--wrap` wouldn't give you a place to insert the button between the header and the content.

Open the resulting `src/theme/BlogPostItem/index.js` and add three things: the import, the `isBlogPostPage` guard (so the button never renders on a list-view card), and the component itself.

```javascript title="src/theme/BlogPostItem/index.js" {1,10}
import CopyAsMarkdown from "@site/src/components/CopyAsMarkdown";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";
import BlogPostItemContainer from "@theme/BlogPostItem/Container";
import BlogPostItemContent from "@theme/BlogPostItem/Content";
import BlogPostItemFooter from "@theme/BlogPostItem/Footer";
import BlogPostItemHeader from "@theme/BlogPostItem/Header";

export default function BlogPostItem({ children, className }) {
  const { metadata, isBlogPostPage } = useBlogPost();

  return (
    <BlogPostItemContainer className={className}>
      <BlogPostItemHeader />
      {isBlogPostPage && <CopyAsMarkdown metadata={metadata} />}
      <BlogPostItemContent>{children}</BlogPostItemContent>
      <BlogPostItemFooter />
    </BlogPostItemContainer>
  );
}
```

`isBlogPostPage` is `true` only when a reader is looking at a single article, never on the blog's homepage or archive grid — the same guard used to place <Link to="/blog/docusaurus-reactions">the reader-reactions widget</Link> and <Link to="/blog/docusaurus-go-top">the scroll-to-top button</Link> correctly on this very blog.

<AlertBox variant="note" title="On my own site, it's threaded through the header instead">
  My `BlogPostItem/index.js` passes `<CopyAsMarkdown>` down into `BlogPostItem/Header` as a prop rather than rendering it inline, because that header already juggles an AI-assisted badge and the author list. You only need that indirection if your own header does something similar — for most blogs, rendering it directly as shown above is simpler and just as correct.
</AlertBox>

## All Files at a Glance

<ProjectSetup folderName="Copy as Markdown">
  <Snippet filename="plugins/markdown-mirror-plugin/index.cjs" source="./files/markdown-mirror-plugin.cjs" defaultOpen={false} />
  <Snippet filename="src/components/CopyAsMarkdown/index.tsx" source="src/components/CopyAsMarkdown/index.tsx" defaultOpen={false} />
  <Snippet filename="src/components/CopyAsMarkdown/styles.module.css" source="src/components/CopyAsMarkdown/styles.module.css" defaultOpen={false} />
</ProjectSetup>

`src/theme/BlogPostItem/index.js` isn't included above — as noted in Step 4, that file already exists on your site in some form, and you're editing it, not creating it from scratch. Rendered here with <Link to="/blog/docusaurus-snippets">the same code-snippets component</Link> used throughout this article.

## Try It Yourself

1. Add the plugin to `docusaurus.config.js` and create the three files above.
2. Run `yarn build` — not `yarn start`. `postBuild` hooks never fire on the dev server, so the mirror genuinely doesn't exist until a real build runs.
3. Serve the output locally, e.g. `npx serve build`, and open any article.
4. Click **Copy as Markdown**, then paste into a text editor. You should see the plain Markdown source, `<TLDR>` tags and all.
5. Click **View raw**. The `.md` file should open as plain text in a new tab.

<AlertBox variant="warning" title="Self-hosted on Apache? Watch the MIME type">
  If step 5 triggers a download prompt instead of displaying the file, your server doesn't know `.md` is text. Add `AddType text/markdown .md` to your `.htaccess` (or the Nginx equivalent, a `types` block) so it's served inline instead.
</AlertBox>

## Under the Hood (skip this if you just want to use it)

**Why the mirror can't collide with the post's own URL.** `/blog/my-post` is a *directory* containing an `index.html` — that's how Docusaurus serves clean URLs. `/blog/my-post.md` is a sibling *file* in that same directory. Same folder, different files, zero routing conflict.

**Why `postBuild`, not a webpack loader or a dev-time route.** A loader would need to re-run the same MDX-to-text logic on every hot reload for no benefit — nobody is copying a post from a blog they're actively editing. Restricting the mirror to production keeps the dev server fast and the logic in exactly one place.

**Where the simple version stops being enough.** The plugin in Step 1 passes every custom component through as literal JSX text. That's fine for the odd `<TLDR>` block, but it stops looking like Markdown fast once a post leans on dozens of components — code snippets, alert boxes, step-by-step cards, and so on. Doing that properly means parsing the MDX into an actual syntax tree and replacing each component node with a plain-Markdown equivalent, component by component. It's a legitimately bigger project than a button and a copy loop — the kind of thing this blog's own, much larger, degradation pipeline exists for — and a good candidate for a follow-up article on its own.

**A frontmatter date isn't a string.** If you extend the metadata comment to also print the post's own `date:` field, don't string-concatenate it directly. YAML auto-types an unquoted `date: 2024-02-23` as a JS `Date` object, and `` `${date}` `` calls its verbose default `toString()` (`Mon Jul 27 2026 00:00:00 GMT+0000 (Coordinated Universal Time)`). Normalize it first: `date instanceof Date ? date.toISOString().slice(0, 10) : String(date)`.

## Conclusion

Ninety-odd lines of code, split across a build plugin and a React component, is all it takes to stop fighting rendered HTML every time you want an article's plain text. The button doesn't know what Markdown is, and the plugin doesn't know what a button is — each does one small job, and the whole thing holds together because neither has to know about the other's internals.

If you build on this, the natural next step is the one flagged in *Under the Hood*: teaching the mirror generator to actually degrade your custom components instead of passing them through as raw JSX. Until then, this version already solves the problem that started this whole thing — no more manual copy-paste surgery, for me or for anyone who wants to hand one of my articles to an LLM.
