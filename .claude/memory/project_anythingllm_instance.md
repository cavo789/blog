---
name: project-anythingllm-instance
description: "How to reach Christophe's local AnythingLLM instance from the devcontainer, and where its real compose file lives"
metadata:
  node_type: memory
  type: reference
  originSessionId: 90614b9a-a9c5-4fab-8215-58074b589b67
  modified: 2026-08-28T16:52:17.100Z
---

Christophe runs AnythingLLM + Ollama + Open WebUI as Docker containers on the host.

- **From inside the blog devcontainer, AnythingLLM is at `http://172.17.0.1:3200`** (moved off the
  default 3001 on 2026-08-28; 3001 no longer answers). `localhost` and `host.docker.internal` both
  fail regardless of port. Verify with `curl http://172.17.0.1:3200/api/ping`.
- The `.scripts/anythingllm-*.sh` port-probe is hardcoded to 3001 (kept in sync with the published
  article copy, which teaches the default). The non-default port is pinned via
  `ANYTHINGLLM_URL=http://172.17.0.1:3200` in the gitignored `.env`, which `.devcontainer/compose.yaml`
  injects as an env_file — so the scripts pick it up without being edited.
- Its real `compose.yaml` is at `/home/christophe/tools/ollama/compose.yaml` on the **host** —
  not visible from the devcontainer, so runtime settings must be changed through the API
  (`POST /api/system/update-env`, values must be **strings** or it 500s) rather than by editing the file.
- Ollama is reachable from the AnythingLLM container as `http://ollama:11434` (compose network alias).
- **Embedder: `mxbai-embed-large`, chunk 400, workspace `topN` 20.** `nomic-embed-text` is
  installed but produces degenerate vectors on this machine (related/unrelated cosine separation
  +0.05 vs +0.49) — do not switch back to it. Verify any embedder with
  `blog/2026/08/17/anythingllm-chat-with-your-docs/files/embedder-sanity-check.py`.
- A workspace named `blog` holds all 248 published posts, indexed by
  `blog/2026/08/17/anythingllm-chat-with-your-docs/files/anythingllm-index.sh`.
  Re-run that script after publishing; state lives in the gitignored `.anythingllm-indexed`.

The API key is not stored here — ask for it when needed.

Related: [[project_overview]], [[project_blog_map]].
