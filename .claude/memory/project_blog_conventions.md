---
name: project-blog-conventions
description: "Blog post structure, frontmatter fields, co-location pattern, unpublished folder, series"
metadata: 
  node_type: memory
  type: project
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
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

**Unpublished behavior**: `.unpublished/` is excluded from production build only. Posts there ARE visible during `yarn start`.  
**`draft: true` is required** in the frontmatter of every post in `.unpublished/` — both the folder exclusion AND the flag are needed.

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
blueskyRecordKey: abc123xyz              # enables Bluesky comments widget
ai_assisted: true                        # shows AI badge + AI co-author
language: en                             # language code
updates:                                 # update history
  - date: 2026-02-01
    note: "What changed"
---
```

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

## Series Currently in Use (2026)

- `Creating Docusaurus components`
- `Discovering Quarto`

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
