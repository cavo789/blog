---
name: project-n8n-series
description: "n8n article (blog/2026/11/23/n8n-latest-ci-check) rewritten 2026-11-21 as #1 of series \"Automate your tasks with n8n\" — state and what's left before publishing"
metadata:
  node_type: memory
  type: project
  originSessionId: 3d4b9516-8024-49ef-97e9-13be35f17c5e
  modified: 2026-11-21T19:03:04.224Z
---

Article `blog/2026/11/23/n8n-latest-ci-check/` rewritten on 2026-11-21: "What n8n Does" (finished-workflow screenshot + capabilities table; the /tmp demo and CI-replay were dropped as meaningless to readers) → install (~/tools/n8n, compose.yaml + start.sh via ProjectSetup) → "Build Your First Workflow in the Editor" (Manual trigger → HTTP Request → Edit Fields → If, verified on n8n 2.46.6) → Executions / Pin and edit / On a schedule → "Where to Go Next" (series teasers).

All 7 screenshots provided by the author and integrated; no AUTHOR-CHECK left. Still `draft: true` — which breaks the prod build because `blog/2023/12/05/docker_uptime_kuma` links to it.

Left to do (author's session, "later today"): remove `draft: true`, `translate` the article, `eli5` for compose.yaml / start.sh / latest-ci.json, quality gate, commit. Series registered in src/data/series.js + series.fr.js. Follow-up article ideas in `.todos/0000-suggestions-articles-a-publier.md`; the shell function `n8n` parked in `.unpublished/n8n-everyday/files/n8n.sh`.

**Why:** the author found the scripts-only version unconvincing ("bof") — an n8n intro must show the editor.
**How to apply:** UI labels verified from screenshots (n8n 2.46.6): "Build a workflow", "Add first step…", "Trigger manually", groups Core / Data transformation / Flow, button "Execute", "Copy to editor" = paid (Debug in Editor), editing output via pencil auto-pins.

CLI section added same day ("Run It from the Terminal", `files/run.sh`). Verified traps: `n8n execute` inside the running container needs `-e N8N_RUNNERS_BROKER_PORT=5690` (5679 already taken) and prints log lines before the JSON (`sed -n '/^{/,$p'`); with manual + schedule triggers it starts from the manual one. `export:workflow --pretty` writes a clean JSON array to stdout. Never test with a Compose folder named `n8n`: the author's real instance is project `n8n` (`~/tools/n8n`) — use a distinct folder/project name.
