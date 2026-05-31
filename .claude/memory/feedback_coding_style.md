---
name: feedback-coding-style
description: "Coding rules validated by project's AGENTS.md — React, CSS, Docker, comments"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 00c5ecbb-c9bf-4541-b607-05360c5e9363
---

Respect the rules defined in `/opt/docusaurus/AGENTS.md` (Gemini governance doc used for all AI assistants).

**Key rules:**
- React: functional components + Hooks only — **no TypeScript, no class components**
- CSS: Infima CSS variables for dark/light mode — **no hardcoded hex colors**
- Docker: `compose.yaml` without `version:` key; read-only containers; `tmpfs` for writable tmp
- Comments in code: American English only — no French
- Blog content: American English only
- Suggest corrections for typos or awkward phrasing in blog posts

**Why:** Explicit project governance defined in AGENTS.md.

**How to apply:** Before writing any React component or Docker config, verify against these constraints. Flag typos/improvements in blog post text proactively.
