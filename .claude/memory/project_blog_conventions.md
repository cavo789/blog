---
name: project-blog-conventions
description: "Blog post structure, frontmatter fields, co-location pattern, key components"
metadata: 
  node_type: memory
  type: project
  originSessionId: 00c5ecbb-c9bf-4541-b607-05360c5e9363
---

## Directory Structure
```
blog/
  YYYY/MM/DD/slug/
    index.md          ← blog post
    images/           ← post-specific images
    files/            ← code snippets (imported via Snippet component)
  authors.yml
  tags.yml            ← 175 tags defined
```

## Blog Post Frontmatter
```yaml
---
slug: my-slug
title: "Post Title"
description: "Short description"
authors: [christophe]          # or [docux], [gemini]
image: /img/v2/banner.webp     # social card image
mainTag: docker                # primary tag (displayed prominently)
tags: [docker, wsl, bash]      # must exist in tags.yml
date: 2026-01-15
series: "Series Name"          # optional, groups related posts
blueskyRecordKey: abc123       # optional, Bluesky post key for comments
ai_assisted: true              # optional, flag AI-assisted writing
language: en                   # optional
updates:                       # optional, changelog
  - date: 2026-02-01
    note: "What changed"
---
```

## Content Rules
- Language: **American English** (code, comments, blog posts — no French)
- Use `<!-- truncate -->` to mark the excerpt end
- Prefer Markdown over HTML; MDX only when embedding React components
- Co-locate images in `./images/`, code in `./files/`
- Use `<Snippet>` instead of inline code blocks for file content
- Use `<ProjectSetup>` for setup instructions
- `<TLDR>` block right after the banner image (brief summary)

## Unpublished Posts
- Stored in `blog/.unpublished/` (excluded from prod build via `docusaurus.config.js`)
- Must have `Draft: true` in frontmatter

## Linting
- Markdownlint, ESLint, Prettier — strict mode
- `onInlineTags: "throw"` — all tags must be declared in `tags.yml`

**Why:** Strict structure ensures consistent builds and SEO quality. [[project-overview]]
