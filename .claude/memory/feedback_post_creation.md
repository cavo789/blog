---
name: feedback-post-creation
description: "Lessons learned creating posts: draft flag, image selection, frontmatter ordering"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
---

Always add `draft: true` to any post created in `.unpublished/`. Without it, the post may surface unexpectedly in development or tools that don't respect the folder exclusion.

**Why:** The user confirmed both mechanisms are required — folder exclusion AND `draft: true`.

**How to apply:** Every new `.unpublished/` post starts with `draft: true` in frontmatter, before any other optional field.

---

When picking a banner image, prefer a slug that closely matches the post topic rather than a generic fallback. Example: for a post about a Docusaurus like/reaction widget, `docusaurus_like_button.webp` is better than `docusaurus_react.webp` — even if neither is perfect.

**Why:** The user's linter/hook auto-corrected the image from `docusaurus_react.webp` to `docusaurus_like_button.webp` on the reactions post.

**How to apply:** Before finalizing a post, check [[project-images-tags]] for the closest semantic match. If unsure, flag it to the user.

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
