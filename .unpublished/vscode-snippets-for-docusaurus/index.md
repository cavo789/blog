---
slug: vscode-snippets-for-docusaurus
title: "My VSCode Snippets File for Writing This Blog"
authors: [christophe, claude]
image: /img/v2/vscode_tips.webp
mainTag: vscode
tags: [vscode, docusaurus, markdown]
date: 2026-12-31
description: "A walkthrough of the actual .vscode/markdown.code-snippets file I use to write every post on this blog — the real snippets for AlertBox, Terminal, StepsCard and more, not a generic 'how snippets work' tutorial."
language: en
ai_assisted: true
draft: true
---

![My VSCode Snippets File for Writing This Blog](/img/v2/vscode_tips.webp)

<!-- cspell:ignoreCase codesnippets highlyimportant coreconcept -->

<TLDR>
This blog has its own component library — <Link to="/blog/docusaurus-snippets">a custom Snippet component</Link>, `AlertBox`, `StepsCard`, and more — and every one of them has a matching entry in `.vscode/markdown.code-snippets`, a real file sitting in this repo's `.vscode` folder. This article isn't a generic "how VSCode snippets work" tutorial; it's a walkthrough of that actual file, why each entry exists, and two stale entries in it I noticed while writing this that are worth pruning.
</TLDR>

Every article on this blog opens with a `<TLDR>`, uses `<AlertBox variant="tip" title="...">` a handful of times, and usually closes with a `<StepsCard variant="remember">`. Typing that JSX skeleton by hand, correctly, several times per article, several articles per month, is exactly the kind of repetition VSCode's own **User Snippets** feature exists to kill — and I already have a file doing it. This article is that file, explained.

<!-- truncate -->

## What a `.code-snippets` File Actually Is

A `*.code-snippets` file, dropped in a project's `.vscode` folder, defines reusable snippets scoped to that workspace — as opposed to VSCode's global "User Snippets," which follow you everywhere regardless of project. Each entry has a `prefix` (what you type to trigger it), a `body` (an array of lines, joined with newlines), and tab stops (`$1`, `$2`, ...) to jump between the parts you need to fill in. A `${1|choice_a,choice_b|}` placeholder even renders as a dropdown of accepted values — exactly what an `AlertBox`'s `variant` prop needs.

Here's the real file, live from this repo:

<Snippet filename=".vscode/markdown.code-snippets" source=".vscode/markdown.code-snippets" defaultOpen={true} />

## The Ones I Actually Type Every Day

**`AlertBox`** (and its near-twin, `admonition`) expands to a full `<AlertBox variant="..." title="...">` block with the variant already offered as a dropdown — type `AlertBox`, hit Tab, pick a variant from the list, tab to the title, tab to the body. No more misremembering which seven variant names are valid.

**`Terminal`** expands the `<Terminal source="./files/$1" wrap={true} typewriter>` skeleton with placeholder command/output lines — the shape every single `<Terminal>` block in this blog follows.

**`Remember`** and **`Steps`** both expand a `<StepsCard>` — one pre-set to `variant="remember"` for a closing takeaways box, the other to `variant="steps"` for a numbered walkthrough — with a three-item `steps` array ready to be renamed rather than typed from scratch.

**`Snippet`** and **`Link`** are the smallest but most-typed entries: `Snippet` expands to `<Snippet filename="$1" source="./files/$1" defaultOpen={false} />` (name it once, both attributes fill in), `Link` to `<Link to="/blog/$1">$2</Link>` — the exact syntax every cross-reference in every article uses, including several in this one.

<AlertBox variant="tip" title="ProjectSetup for multi-file setups">
The `ProjectSetup` snippet expands a full example — folder name, a `Guideline`, two `Snippet` children — as a working starting template rather than an empty shell, since that component's structure is easy to get subtly wrong from memory.
</AlertBox>

## Two Entries Worth Pruning

Writing this article meant reading the file closely enough to notice two entries that don't match how the blog actually works anymore: `CoreConcept` and `HighlyImportant` each expand a standalone `<CoreConcept>` / `<HighlyImportant>` tag — but neither is a registered component in `src/theme/MDXComponents.js` today. Both ideas now live as `AlertBox` **variants** (`coreConcept`, `highlyImportant`) instead of separate components — which the `admonition` snippet's variant dropdown already correctly offers. Using either of these two old snippets as-is would produce an undefined-component build error, not a working admonition. Worth deleting them the next time this file gets touched, rather than leaving a trap for a future me who trusts the prefix list.

## Adding a New One

When a new MDX component gets added to `MDXComponents.js`, the snippet for it is worth writing in the same sitting — before the "I'll do it later" version of that plan quietly never happens. The pattern is always the same: one entry, a `prefix` matching the component name, a `body` array with the JSX skeleton and tab stops for whatever actually varies between uses.

## Key Takeaways

<StepsCard
  variant="remember"
  title="Docusaurus snippets quick reference"
  steps={[
    { content: "**Workspace-scoped, not global** — `.vscode/*.code-snippets` only applies inside this repo, unlike VSCode's global User Snippets" },
    { content: "**`${N|a,b,c|}` renders a dropdown** — exactly what a fixed prop like `variant` needs, instead of trusting memory or a typo-prone free-text tab stop" },
    { content: "**A snippet is live documentation** — the file itself is the up-to-date list of what this blog's components expect, more reliable than a comment or a wiki page" },
    { content: "**Stale entries are a build-time trap, not just clutter** — `CoreConcept` and `HighlyImportant` should be removed now that both are `AlertBox` variants instead" }
  ]}
/>

## Conclusion

None of this is a new feature to learn — VSCode's snippet support has been there for years. What changed is finally treating this blog's own component vocabulary as something worth encoding once, in a file, instead of re-typing correctly from memory every time. The stale `CoreConcept`/`HighlyImportant` entries were a useful reminder that a snippets file needs occasional maintenance too — it drifts out of sync with the codebase exactly like anything else that isn't generated automatically.
