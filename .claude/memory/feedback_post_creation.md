---
name: feedback-post-creation
description: "Lessons learned creating posts: draft flag, image selection, frontmatter ordering"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
  modified: 2026-08-20T17:34:58.492Z
---

Always add `draft: true` to any post created in `.unpublished/`. Without it, the post may surface unexpectedly in development or tools that don't respect the folder exclusion.

**Why:** The user confirmed both mechanisms are required — folder exclusion AND `draft: true`.

**How to apply:** Every new `.unpublished/` post starts with `draft: true` in frontmatter, before any other optional field.

---

When picking a banner image, prefer a slug that closely matches the post topic rather than a generic fallback. Example: for a post about a Docusaurus like/reaction widget, `docusaurus_like_button.webp` is better than `docusaurus_react.webp` — even if neither is perfect.

**Why:** The user's linter/hook auto-corrected the image from `docusaurus_react.webp` to `docusaurus_like_button.webp` on the reactions post.

**How to apply:** Before finalizing a post, check [[project-images-tags]] for the closest semantic match. If unsure, flag it to the user.

---

New banner images (`static/img/v2/*.webp`) should carry a short title (or none) baked into the
illustration, not a full narrative caption. Audit of 2026-08-20 measured the existing style
(e.g. "BUILDING A LOCAL KNOWLEDGE BASE: ANYTHINGLLM & DOCUSAURUS RAG PIPELINE") becoming illegible
at mobile card width (~350px real render). The real article `<h1>` / card title already carries
that information — the banner should read as illustration first.

**Why:** Flagged by TODO 0100 (`.todos/DONE/DONE_0100-banner-images-illegible-on-mobile.md`) — the
user confirmed this direction going forward; the ~150 existing banners are not being retrofitted,
this only applies to new ones.

**How to apply:** When generating or prompting for a new banner image, keep embedded text to a
short title (2-4 words) or drop it entirely; don't compose a full sentence/caption into the scene.

---

Frontmatter key ordering observed in posts (follow this order for consistency):

```yaml
slug:
title:
authors:
image:
mainTag:
tags:
date:
description:
language:        # optional
ai_assisted:     # optional
blueskyRecordKey: # optional, leave empty string if not yet known
draft:           # only for .unpublished/ posts
series:          # optional
```
