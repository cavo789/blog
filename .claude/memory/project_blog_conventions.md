---
name: project-blog-conventions
description: "Blog post structure, frontmatter fields, co-location pattern, unpublished folder, series"
metadata:
  node_type: memory
  type: project
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
  modified: 2026-08-28T10:04:57.829Z
---

## Directory Structure

```
blog/
  YYYY/MM/DD/slug/
    index.md          ← blog post (uses .md even with MDX components)
    images/           ← post-specific images (referenced as ./images/name.webp)
    files/            ← code snippets (imported via Snippet component)
  authors.yml         ← christophe, docux, gemini, claude
  tags.yml            ← tag registry (onInlineTags: "throw" — undefined tags break the build)

.unpublished/         ← at repo root, NOT inside blog/
  slug-name/
    index.md          ← MUST have draft: true in frontmatter
```

**Unpublished behavior (corrected 2026-07-10)**: `.unpublished/` sits at the repo root, outside the blog plugin's content path (`blog/`, the default), so it is **never scanned by the blog plugin at all — not in dev, not in prod**. The `exclude: isProd ? ["**/.unpublished/**"] : []` glob in `docusaurus.config.js` is a no-op safety net in this repo (verified: no `blog/.unpublished` symlink or second blog plugin instance exists). To actually preview a `.unpublished/` draft locally, temporarily copy its folder into `blog/YYYY/MM/DD/slug/` (any future placeholder date works, e.g. `2026-12-31`, matching existing drafts), let the dev server hot-reload, then delete the temp copy — never leave it there.  
**`draft: true` is still required** in the frontmatter of every post in `.unpublished/` — it's the safety net for the day it *does* end up inside `blog/` (temporarily, for preview, or by accident).

## Frontmatter — All Recognized Fields

```yaml
---
slug: my-slug                    # required — URL path
title: "Post Title"              # required
description: "Short summary"     # required — meta description
authors: [christophe]            # required — see blog/authors.yml
image: /img/v2/banner.webp       # required — social card (pick from /static/img/v2/*.webp)
mainTag: docker                  # required — primary tag (displayed prominently)
tags: [docker, wsl, bash]        # required — must all exist in tags.yml
date: 2026-01-15                 # required — YYYY-MM-DD

# Optional fields:
series: "Creating Docusaurus components"  # groups posts into a series
blueskyRecordKey: abc123xyz              # optional manual override — Bluesky post is auto-detected otherwise, see [[project-components]]
ai_assisted: true                        # shows AI badge + AI co-author
tried_it: false                          # opt-OUT — TriedIt widget shows by default on every post; set false to hide it on non-tutorial content
language: en                             # language code
updates:                                 # update/revision history — see below
  - date: 2026-02-01
    note: "What changed"
---
```

**`updates:` field details** — rendered as a timeline by `Updated` component (`src/components/Blog/Updated/index.js`), auto-included in every post via `src/theme/BlogPostItem/Content/index.js` (no manual import needed). The most recent entry also drives: `dateModified` in the SEO JSON-LD (`src/components/StructuredData/index.jsx`) and the threshold for the "this article may be outdated" warning (`src/components/Blog/OldPostNotice/index.js`, >1 year since most recent update). There is no separate `lastUpdated` field — `updates` is the single source of truth for "last modified".

**`review_date:` field** — ISO date (`YYYY-MM-DD`). Added by the `/freshness` skill when an article is verified accurate but over a year old (verdict `OK`). When present, `OldPostNotice` replaces the yellow ⚠️ "may be outdated" banner with a green ✅ "reviewed on [date] — content still accurate" banner. Do NOT add this field if the article already has a recent `updates:` entry (the `OldPostNotice` won't show at all in that case). Do NOT set `review_date` for `STALE` or `CRITICAL` articles.

## Content Structure (inside index.md)

```
![Title](/img/v2/banner.webp)          ← first line, banner image

<!-- cspell:ignore word1 word2 -->     ← optional, suppress spell-check warnings

<TLDR>
Dense 2–4 sentence summary. Problem → solution → benefit. No hype.
</TLDR>

Opening paragraph — relatable hook, problem or anecdote.
[1–2 paragraphs max before truncate]

<!-- truncate -->

## Main Content Sections
...

## Conclusion
```

## Content Rules

- Language: **American English** everywhere (code comments, blog text, component text)
- Use `<!-- truncate -->` after 1–3 intro paragraphs
- Co-locate images: `./images/name.webp`
- Co-locate code: `./files/filename.ext` — then use `<Snippet source="./files/...">`
- Never paste long code blocks inline if the file can be referenced via `<Snippet>`
- Use `<ProjectSetup>` for multi-file setup instructions
- Always use `<Terminal>` for shell commands (never bare code blocks for CLI interactions)
- Use Markdown headings `##` / `###`, not HTML headings

## Series Registry — `src/data/series.js`

A post's `series:` frontmatter value is free text, but for the series to get a description/card
image on the `/series` page, it **must also** have a matching entry in `src/data/series.js`
(`{ name, description, image }`, `image` under `/static/img/series/*.webp`, ~1000-1500px wide).
Adding a new series to a post's frontmatter without adding it here leaves it undescribed on that
page — always update both together.

## Series Currently in Use (2026)

- `Creating Docusaurus components`
- `Discovering Quarto`
- `Ollama daily use` (added 2026-07-27, drafts only so far — `image: /img/series/ollama.webp`
  does not exist yet, needs to be created before publishing either draft post)

## Authors Available

| id | Name | Role |
|---|---|---|
| `christophe` | Christophe | Primary author |
| `docux` | Docux | Guest contributor |
| `gemini` | Google Gemini | AI assistant co-author |
| `claude` | Claude Code | AI assistant co-author |

## Linting

- Markdownlint, ESLint, Prettier — strict mode
- `onInlineTags: "throw"` — undefined tags crash the build
- `remark-replace-terms` auto-fixes casing (vscode → VSCode, etc.)

**Why:** Strict structure ensures consistent builds and SEO quality. [[project-overview]] [[project-images-tags]]
