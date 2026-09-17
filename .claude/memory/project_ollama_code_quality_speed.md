---
name: project-ollama-code-quality-speed
description: questions --locale fr ≈ 150 s/article because code-quality thinks 19-24k chars; think:false is 10x faster but Ollama 0.18.2 then ignores the JSON schema
metadata:
  type: project
---

`yarn questions --locale fr` uses `code-quality:latest` (qwen3.5-moe 36B Q4_K_M, thinking-capable). Measured 2026-09-17 on `/api/chat` timings, per article:

- prompt: ~1.5k tokens read in **0.5-0.9 s** (1238 tok/s — the GPU is fine)
- answer: ~350 tokens written in **~10 s** (36 tok/s)
- **thinking: 19 000-24 000 characters ≈ 140 s** — that is the entire cost

Things tested and their result:

- `num_ctx: 8192` — GPU share 85 → 87 %, no real gain. The **weights** (23.9 GB) overflow VRAM, not the KV cache. Reverted.
- `think: "low"` / `"medium"` — **not honored** by this model (still 18 970 chars, 169 s). Effort levels only work on models like gpt-oss.
- `think: false` — **11-16 s instead of 150 s**, but on Ollama 0.18.2 `format` (JSON schema) is then **silently ignored**, even `format: "json"` and even on a trivial prompt. Output came back as valid JSON only because the prompt asked for it, and the 8-12 question ceiling — enforced by the schema alone, `toValidatedQuestions` only enforces a floor of 5 — was broken (11, 14, 16 questions), with filler questions pointing at wrapper sections (`tldr`, `in-depth`).

**Why:** avoids re-testing dead ends, and records that fast mode is a real option with a real quality cost.
**How to apply:** for a slow run, check `curl -s 172.17.0.1:11434/api/ps` and the `.questions.json` mtimes; budget ~2.5 min × article count. Before adopting a fast mode, re-check whether a newer Ollama honors `format` with `think:false`. Related: [[project-anythingllm-instance]], [[feedback-quality-over-speed]]
