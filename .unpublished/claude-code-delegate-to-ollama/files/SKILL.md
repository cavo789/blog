---
name: delegate-to-ollama
description: When and how to hand text work (proofreading, English→French translation) to the maintainer's local Ollama to save Claude tokens, and how to check its answer. Load before proofreading a page or article, or translating a batch of strings or a documentation page; never for code, type fixes, tests or log summaries.
---

# Delegate to a local Ollama model

A local model is free but it does not see the repository and it does not judge well. Delegating
saves tokens only when **the input is large, the answer is small or checked by a machine, and
the task is mechanical**. If you have to reread everything it wrote, you paid twice.

Measured on 2026-11-07 (Ollama 0.34.3, 24 GB GPU, one try per task; details in the
maintainer's report):

| Task | Delegate? | Result |
|---|---|---|
| Spelling/grammar proofreading of a page | **Yes** | `code-quality`: 8/8 planted mistakes, 0 false alarm, 10 s, 64 tokens out |
| English → French UI strings or page draft | **Yes, then review** | 25/25 format and placeholders; terms off the glossary, a few mistranslations (`port` → « porte ») |
| mypy/ruff fixes | No | right, but rewrites the whole file: dearer than one `Edit` |
| Unit tests, even with full context | No | duplicates the existing tests, 60 % invented failures |
| Edge-case ideas | No | 0/24: recites the examples it was given |
| Log summaries | No | confidently wrong; `grep`/`tail -25` are free and exact |

Never delegate production code, reviews, or anything that deletes or moves user files.

## Tools

- `.claude/scripts/ollama_ask.sh <model> "<instruction>" <input|-> <output>`: one question
  about one file; the answer goes to `<output>`, stdout is one statistics line. Read the answer
  only as far as you need.
- `.claude/scripts/ollama_translate_po.py [--model NAME] [po-file]` (helper `i18n_translate`
  in this repository): drafts the empty `msgstr` of a catalog by batches of 25, checks JSON and
  placeholders by machine, writes the drafts as text **flagged `fuzzy`**, never re-wraps the
  file. A batch failing a check is skipped and named.

Server: `OLLAMA_URL` (default `http://host.docker.internal:11434`: from a devcontainer,
`127.0.0.1` is the container). Limits: `OLLAMA_TIMEOUT` (180 s), `OLLAMA_MAX_TOKENS` (4096) —
keep the cap: `code-fast` looped on one line forever on a 5 000-token input (measured).

## Models

List them first: `curl -s "$OLLAMA_URL/api/tags" | jq -r '.models[].name'`.

- Proofreading and translation: `code-quality:latest` (qwen3.8 27B). `code-fast` is faster on
  translation but missed 5 of 7 mistakes in proofreading and looped.
- **One model per session**: on 24 GB only one 17–20 GB model fits; switching reloads it.

## Method

1. **Worth it?** A handful of strings or a short paragraph: do it yourself, the call costs more.
2. **Reachable?** `curl -s -m 5 "$OLLAMA_URL/api/version"`. No answer: do the work yourself and
   say so in one line; never wait for it.
3. **Ask for a short, checkable answer.** Proofreading: `"<exact wrong words> => <fix>"`, one
   per line, "only real mistakes". Translation: one JSON string per line, same order, a
   glossary in the instruction.
4. **Check by machine first**, then read only what a machine cannot judge:
   - proofreading: each wrong text must exist in the file; apply the fixes you agree with;
   - translation: placeholders, line count, nothing left in English; then read every French
     text against the glossary and remove the `fuzzy` flag yourself, entry by entry.
5. **Keep the content review for yourself**: numbers, consistency, meaning. The local model
   missed a figure off by ten that contradicted the whole article.
6. **Say what was delegated** in the summary (model, time, what you corrected).
