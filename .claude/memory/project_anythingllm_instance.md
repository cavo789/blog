---
name: project-anythingllm-instance
description: "How to reach Christophe's local AnythingLLM instance from the devcontainer, and where its real compose file lives"
metadata:
  node_type: memory
  type: reference
  originSessionId: 90614b9a-a9c5-4fab-8215-58074b589b67
  modified: 2026-09-17T13:40:00.000Z
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
- **Two workspaces since 2026-09-17**, deliberately separate (mixing languages in one vector
  space degrades retrieval in both): `blog` (257 English posts, `ai-index`, state
  `.anythingllm-indexed`) and `blog-fr` (103 translated posts, `ai-index-fr`, state
  `.anythingllm-indexed-fr`). Both carry the same settings — `topN` 20, threshold 0.2, and the
  prompt from `.scripts/anythingllm-workspace-prompt.txt`. Re-run after publishing or translating.
  The `-fr` functions exist because four env vars must agree (`ANYTHINGLLM_WORKSPACE`, `BLOG_DIR`,
  `SITE_URL`, `STATE_FILE`); forgetting `SITE_URL` silently emits `/blog/` instead of `/fr/blog/`.
- **Embedding ceiling, hit by French first:** the Ollama embedder runs at `num_ctx: 400` and the
  `chunkHeader` (title + date + URL) is added *after* chunking, so header + chunk can overflow.
  French costs more tokens per character than English, so the French copy of a long article fails
  where the English one passes — `docling` was the first (2026-09-17, still unindexed in `blog-fr`).
  Symptom in `docker logs anythingllm`: `the input length exceeds the context length`, then
  `Failed to vectorize <title>`. The document uploads and is then silently left unattached, so the
  script reports success — **compare the state file's line count against the workspace's document
  count** to catch it. Fixing it means a global chunk-length change, which also affects `blog`.

The API key is not stored here — ask for it when needed.

Related: [[project_overview]], [[project_blog_map]].
