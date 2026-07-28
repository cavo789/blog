---
name: project-todos-convention
description: ".todos/ is Christophe's private working folder — write it in French, never treat it as reader-facing content"
metadata:
  node_type: memory
  type: project
  originSessionId: 7a1e2a8d-2968-4e43-bbbf-0058d0b07379
  modified: 2026-07-27T18:02:17.225Z
---

The `.todos/` folder is private to Christophe. It is never published and no reader
ever sees it.

**Why:** he said so explicitly — "le folder .todos est pour moi seul; tout peut être
écrit en français dans ce folder; c'est privatif; pas pour les lecteurs; juste moi."

**How to apply:** write `.todos/*.md` in **French**. The American-English rule from
`AGENTS.md` ([[feedback-coding-style]]) governs code, comments and blog posts — it does
not apply here. Keep the existing file convention: `NNN-kebab-slug.md`, numbered
sequentially, opening with `# NNN — Titre`, then `**Priority:**` and the sections
`## Problème`, `## Risque`, `## Solution proposée`. Closed items move to the
`DONE/`, `PARTIAL/` or `WONT_DO/` subfolders — see [[feedback-todo-triage]] for what
he systematically rejects.
