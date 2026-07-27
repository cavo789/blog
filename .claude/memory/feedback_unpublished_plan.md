---
name: feedback-unpublished-plan
description: "Always keep .unpublished/plan.md in sync when creating/publishing/deleting draft articles — internal-only file, written in French"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 137dd1fa-bddd-4742-a98b-57d539016a7c
  modified: 2026-07-27T16:34:42.374Z
---

Whenever a new draft article is created in `.unpublished/` (a new `index.md` there), update
`.unpublished/plan.md` to reflect it: where it fits in the publication order, whether it has hard
dependencies (links to another still-unpublished draft) or soft ones (prose name-drops a sibling
draft as "already covered"), and how it affects the interspersing suggestions for editorial variety.
Same when a draft gets published (moved to `blog/`) or deleted — remove/update its entry so the plan
stays accurate rather than stale.

**Why:** Christophe asked for this to be systematic (2026-07-27), after noticing `plan.md` existed but
wasn't guaranteed to stay current. He explicitly asked whether this should be a hook — the answer given
and confirmed: no, because deciding *where* a new draft fits (dependency order, narrative call-backs,
publishing-pace variety) requires judgment a shell hook can't perform. A hook could only fire a
mechanical reminder on file-write; the actual reasoning has to happen in-session. This memory is the
mechanism instead.

**How to apply:** Treat `.unpublished/plan.md` maintenance as part of the task whenever creating,
publishing, or removing a draft — not a separate step to be asked about. `plan.md` itself:
- Is **never published** (not inside `blog/`, no frontmatter, not a blog post).
- Is written in **French** (Christophe's explicit instruction — contrasts with actual blog content,
  which is always American English per [[project-blog-conventions]]).
- Should stay consistent with the drafts actually present in `.unpublished/` — before trusting it,
  cross-check its slug list against `find .unpublished -maxdepth 1 -mindepth 1 -type d`, the same way
  [[project-blog-map]]'s draft table needs periodic verification against the live filesystem.
