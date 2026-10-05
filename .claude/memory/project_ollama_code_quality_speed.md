---
name: project-ollama-code-quality-speed
description: "Ollama 0.34.3 bench (2026-09-23) of `questions` — FR code-quality+thinking ≈ 28 s and best quality; code-fast fastest but worst in FR; task-tiny collapses on long EN posts"
metadata:
  node_type: memory
  type: project
  originSessionId: cd01dbff-7a32-42b8-912f-d77b3ee4207a
  modified: 2026-09-23T17:24:54.093Z
---

Stack upgraded to Ollama **0.34.3** (was 0.18.2). `code-quality` is now qwen3.8:27b (thinking,
Modelfile num_ctx 32768), `code-fast` qwen3-coder:30b (non-thinking, num_ctx 16384),
`task-tiny` qwen2.5-coder:3b (num_ctx 4096).

Bench 2026-09-23, exact `generate-questions.mjs` prompt, 6 FR + 2 EN posts × 2 trials, blind grading /5:

| Config | FR s/article (warm) | FR grade | EN grade |
|---|---|---|---|
| code-quality, thinking (A) | 27.5 | **4.21** | — |
| code-quality, `think:false` (B) | 6.1 | 3.63 | — |
| code-fast (C) | 3.0 | 2.75 | 3.63 |
| task-tiny | — | — | 2.00 (2.4 s) |

- `think:false` + `format` JSON schema **now works** in 0.34.3 (8-12 honored on all 12 calls) — the 0.18.2 bug is gone.
- code-fast in French: near-duplicate questions, facts invented (XLS2MD "for CSV", search script "for indexing"), swapped heading indexes.
- task-tiny on a 31-heading EN post: every question mapped to index 0, generic "What is…".
- **Truncation is impossible by construction**: the script caps prose at 4000 chars → prompt max ≈ 1.8k tokens; `prompt_eval_count` identical for task-tiny (4096) and code-fast. The script sends no `num_ctx`, so no reload.
- Only thinking covers late headings of long posts (makefile_tips: 78-97 % vs 34-47 % for the others) — the prose cap means the model only sees the article's start.

Extended bench same day (6 more EN + 6 more FR posts, 100 blind outputs):
EN — A 4.47 (35.9 s), B 3.97 (5.8 s), C 3.38 (2.4 s), task-tiny 1.88 (15/16 outputs < 3).
FR — new A 4.23 vs the **old** code-quality sidecars (qwen3.5-moe 36B, 140-180 s) 4.13, on 12 posts
whose translation hash was unchanged: same quality, 5× faster. Only 1 EN sidecar was ever reviewed.
Caveat: `pastDurations()` keys on the model *tag*, so the old 150 s timings still skew the FR ETA.

**Why:** avoids re-benching; records that speed modes cost real quality in French.
**How to apply:** budget ~30 s × FR article count. Raw outputs were in a session scratchpad (gone). Related: [[project-anythingllm-instance]], [[feedback-quality-over-speed]]
