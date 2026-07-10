---
description: Review /blog content for component reuse, consistency, quality, SEO and Docusaurus features. Fixes typos inline, generates TODOs for the rest.
argument-hint: "[path-or-year]   (empty = full blog/)"
allowed-tools: Read, Glob, Grep, Bash, Write, Edit
---

# Review Blog Content

Perform a critical review of the blog **content** (not the tooling/CLI — that's `/deep_review`).
The goal is to make articles more consistent, better organized, visually cleaner, and free of
repeated boilerplate — by leaning on the existing component library — while also catching
language mistakes, bugs, and missed SEO/Docusaurus opportunities.

## Scope — read `$ARGUMENTS` first

`$ARGUMENTS` is an **optional** scope.

- **Empty** → review all of `blog/` (full mode, all years).
- **A year** (e.g. `2023`) → restrict to `blog/2023/`.
- **A path** (e.g. `blog/2024/some-post`) → restrict to that post only.

If `$ARGUMENTS` does not resolve to an existing path under `blog/`, stop and respond:

```text
Usage: /review_blog [path-or-year]
Examples: /review_blog              (full blog/)
          /review_blog 2023         (one year)
          /review_blog blog/2024/my-post   (one post)
```

State the resolved scope explicitly at the top of the report.

## Project context

- Blog content is written in **American English** (never French), Markdown/MDX, one folder per
  post under `blog/YYYY/`, co-located assets.
- Globally registered MDX components (usable without import, defined in
  `src/theme/MDXComponents.js`): `AlertBox, BrowserWindow, Card, CardBody, CardFooter, CardHeader,
  CardImage, Column, Columns, Details, DownloadButton, Folder, File, Guideline, Hero, Highlight,
  Link, LogoIcon, ProjectSetup, Snippet, StepsCard, TabItem, Tabs, Terminal, TLDR, TOCInline,
  Trees`, plus everything under `src/components/Blog/*` (AlertBox, LatestPosts, Updated, PostMeta,
  SeriesStats, HeroSection, OldPostNotice, SeriesPosts, PostCard, PostCount, RelatedPosts, Tags,
  SeriesCards, AuthorCard, Series, etc.) and other custom components in `src/components/*`
  (Prerequisite, ShortcutList, InteractiveCode, TriedIt, TypoReport, Reaction, ...).
- Conventions: articles open with a personal anecdote/frustration (never "In this article we
  will…"), a `<TLDR>` right after the banner image, `AlertBox` variants in urgency order (`info` <
  `note` < `tip` < `caution` < `important` < `highlyImportant` < `coreConcept`), and always end with
  `## Conclusion`.
- Tags must exist in `blog/tags.yml`; authors must exist in `blog/authors.yml`.
- `draft:true` in frontmatter is used for unpublished posts (do not "fix" that, it's intentional).

## Review objectives

Go through every post in scope (`Read` the raw `.md`/`.mdx`, not the rendered site) and look for
the following, in order:

### 1. Component reuse — existing component, not used everywhere

For each component in `src/components/` and `src/components/Blog/`, `Grep` how many posts actually
use it (`<ComponentName` occurrences across `blog/`). Cross-reference against the component's
creation date (`git log --diff-filter=A --format=%ad -- src/components/X`) versus the publication
dates of posts that predate it but contain the hand-rolled pattern the component now replaces
(e.g. a manual bold "Note:" paragraph where `AlertBox` fits, a raw fenced code block with a
manually typed `$ prompt` where `Terminal` fits, a manual numbered list of setup steps where
`StepsCard` or `ProjectSetup` fits, an ASCII folder listing where `Trees`/`Folder`/`File` fits, a
manual "Prerequisites" paragraph where `Prerequisite` fits, a manual "Related posts" list where
`RelatedPosts` fits). Flag every case where an older article could adopt an existing, already-built
component instead of custom Markdown/HTML.

### 2. Component extension — small change unlocks reuse

Look for a component used in only one or two posts in a narrow, hardcoded way that could gain a
small prop or variant to become reusable elsewhere (e.g. a component missing a variant that a post
is faking with raw CSS/HTML, a component whose copy is hardcoded when a `title`/`label` prop would
let another post use it, two near-identical components that should merge). Prefer *extending* over
creating a brand-new component.

### 3. New component candidates

Look for a hand-written pattern repeated **3+ times across different posts** that has no matching
component today (a specific callout shape, a repeated comparison table, a repeated "before/after"
layout, a repeated changelog block, etc.). Only propose a new component when reuse (#1) or extension
(#2) genuinely can't cover it — prefer the cheaper option.

### 4. Language quality — fix immediately

Read the prose for grammar, spelling, and awkward sentence construction (English, since blog
content is American English). **Do not just report these — fix them immediately with `Edit`** as
you find them, preserving the author's voice and tone (casual, first-person, em-dashes, signature
phrases like "Like you know me…", "So cool no?", etc. — don't sanitize the personality out of it).
Keep a running list of every file touched and a one-line description of each fix, to include in the
final report.

### 5. Bugs

Broken internal links, unresolved image paths, missing `alt` text, tags not present in
`blog/tags.yml`, authors not present in `blog/authors.yml`, malformed frontmatter, MDX that would
fail to compile (unescaped `<`/`{`), silent `require()`/import failures, series metadata
inconsistencies. Report — don't silently guess a fix if the correct value is ambiguous.

### 6. SEO & layout

Missing or weak `<TLDR>`, missing/duplicate meta description, heading hierarchy issues (skipped
levels, multiple `# H1`), missing/incorrect `StructuredData`, banner image inconsistent with
`/img/v2/` conventions, thin content, missing internal links to related posts/series that obviously
apply.

### 7. Native Docusaurus features not yet used

Check the installed version (`package.json` → `@docusaurus/core`) and `docusaurus.config.js`
against what the **current stable** Docusaurus offers (check via `WebFetch`/`WebSearch` if
available; otherwise flag as "verify against changelog"). List blog-relevant native features that
exist but aren't turned on (e.g. reading time customization, last-updated author/date display,
feed customization, tag pages, pagination options, sitemap options). The user will handle the
actual Docusaurus upgrade themselves — only list opportunities, do not attempt the upgrade.

## Explicitly out of scope

Do **not** propose reader-engagement / social features (polls, live Q&A, share widgets,
bookmarking, vanity counters, code-copy counters). These have already been rejected as low-value
given current traffic — see `.todos/WONT_DO/`. If you find a genuinely new angle on one, mention it
only as a footnote, never as a standalone TODO.

## Incremental / rerun mode

This review may run repeatedly over the blog's life. Before reporting:

1. Enumerate **all** existing TODO IDs across `.todos/` **and its subfolders** (`DONE/`,
   `PARTIAL/`, `BLOCKED/`, `WONT_DO/`, or any other status folder present). Treat every one as
   known, including `DONE`.
2. Do not re-report an issue already captured by an existing TODO. If an existing TODO is
   insufficient, say how it should be extended and reference it by ID instead of duplicating it.
3. Spend the report on genuinely new findings, not restating known backlog items.

## TODO generation

Create one TODO file **per issue** (excluding the typo/grammar fixes, which are applied directly —
see §4), stored flat in `.todos/`.

**Numbering (mandatory):** scan `.todos/` and all its subfolders for the highest existing `NNN`
(three-digit) ID. New TODOs start at `max + 1` and increment. Never reuse or collide with an ID that
exists anywhere, including under status subfolders.

**Naming:** `NNN-short-description.md`, short description in **English**
(e.g. `057-adopt-alertbox-in-2023-posts.md`).

**Anti-duplication:** before writing a TODO, confirm no existing item (any folder) already covers
it.

Each TODO file must contain:

```markdown
# NNN — Title

**Priority:** Critical | High | Medium | Low
**Category:** component-reuse | component-extension | new-component | bug | seo | docusaurus-feature

## Problem

What's wrong or missing, with concrete file references (`blog/2023/.../index.md`).

## Proposed solution

Concrete implementation strategy.

## Affected posts

List of posts impacted (all of them if it's broad).

## Relationship to existing TODOs

Reference related/chained TODOs by ID, or "None".
```

## Output format

Respond in French (matches the conversation language). Be direct and concrete, not theoretical.

Structure the report as:

1. **Scope** reviewed.
2. **Corrections apportées immédiatement** — table of files fixed + one-line description per fix
   (grammar/spelling, §4).
3. **TODOs créés** — table: filename, priority, category, one-line summary.
4. **Findings notés mais non actionnés** — anything ambiguous enough to need the user's judgment
   call before a TODO/fix is written (e.g. ambiguous correct tag, unclear intended meaning of a
   sentence).
