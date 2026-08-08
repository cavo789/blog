---
slug: ollama-ai-data
title: "ai-data: Let a Local LLM Write Your jq and awk One-Liners"
authors: [christophe, claude]
image: /img/v2/json.webp
mainTag: ai
tags: [ai, ollama, zsh, fzf]
date: 2026-12-31
description: "A zsh function that reads a JSON or CSV file, understands its actual fields, and suggests 5 practical jq/awk commands tailored to that exact file — picked via fzf, then loaded onto your command line (not run for you) so you see, edit and learn the exact command before pressing Enter."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-data: Let a Local LLM Write Your jq and awk One-Liners](/img/v2/json.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-data qwen ollama zshrc mlr -->

<TLDR>
This article adds `ai-data` to the "Ollama daily-use functions" series: point it at a `.json` or `.csv` file, and it asks the local model for 5 practical `jq`/`awk` commands tailored to that file's actual field names — not generic examples. Pick one with `fzf`, and instead of running it for you, `ai-data` loads it onto your zsh command line with `print -z`, ready to read, edit, and only then execute. The goal isn't just an answer — it's leaving with a command you understand.
</TLDR>

I know `jq` well enough to be dangerous, and not well enough to write a `group_by` one-liner from memory on the first try. Every time, it's the same ritual: open the [jq manual](https://jqlang.org/manual/), squint at three examples that are almost what I need, adapt, get a syntax error, adjust the brackets, try again. `awk` is worse — I remember it exists, I remember it's powerful, and I remember approximately none of the syntax between uses.

<!-- truncate -->

## Demo — JSON

<Terminal source="./files/terminal_json.txt" typewriter />

Five suggestions, all referencing the real field names (`active`, `birth_date`, `name`) it saw in the sample — not placeholder examples from a `jq` tutorial. After picking the first one through `fzf`, that exact `jq` command was sitting at my prompt; I read it, it looked right, I pressed Enter.

## Demo — CSV

<Terminal source="./files/terminal_csv.txt" typewriter />

This is the group-by-and-count case from the start of this idea: total amount and order count per region, in one `awk` line I did not have memorized and now, having read it once at my own prompt, understand better than if I'd just seen the output.

## The Idea — Suggestions, Not Answers

Most functions in this series ask the model a question and print the answer. `ai-data` is different on purpose: it asks the model for **candidate commands**, shows them through `fzf`, and when you pick one, it doesn't run it — it drops it onto your prompt, editable, via zsh's `print -z`. You read the exact `jq` filter or `awk` script before it touches your data, and because you're the one hitting Enter, you actually absorb the syntax instead of just consuming the output.

<AlertBox variant="tip" title="print -z, in one sentence">
`print -z "some command"` pushes a string onto zsh's editor buffer — the next prompt shows it pre-typed, exactly as if you'd typed it yourself, cursor ready, nothing executed yet.
</AlertBox>

## The `ai-data` Function

<Snippet filename="~/.zsh/fns/ai-data.zsh" source="./files/ai-data.zsh" defaultOpen={true} />

Step by step:

1. Detect JSON vs CSV from the extension.
2. Build a small, real sample — for JSON, the first 3 elements if it's an array (`jq -c '.[0:3]'`); for CSV, the header plus 5 rows. Never the whole file: a 50,000-row CSV doesn't need to leave more than a few lines in the prompt.
3. For CSV, check whether [`mlr`](https://miller.readthedocs.io/) (Miller) is installed — if so, the model is told it can suggest `mlr` for group-by/aggregation, which reads dramatically cleaner than the equivalent `awk`. If not, it sticks to `awk`/`sort`/`uniq`.
4. Ask for exactly 5 commands, one per line, in a `COMMAND ||| description` format — deliberately not JSON output, because parsing five lines of "text before a triple-pipe" is trivial and doesn't risk the model wrapping its answer in markdown fences or extra commentary.
5. Pipe the five lines into `fzf`, showing only the description (`--with-nth=2`) so you're choosing by *intent*, not by squinting at `jq` syntax first.
6. On selection, `print -z` the chosen command's first field.

<AlertBox variant="note" title="No fzf? Still works">
Without `fzf` installed, `ai-data` just prints the five suggestions as plain text — you copy the one you want manually. Same information, one less convenience.
</AlertBox>

## Registered in the `ai` Menu

One line — `AI_COMMANDS[data]=...` — reachable as `ai data <file>` or directly as `ai-data`, alongside every other function in the series.

<AlertBox variant="caution" title="Sampling means the model can guess wrong on edge cases">
Five rows won't reveal a rare `null` field, an inconsistent date format three rows down, or a stray extra column. The suggested commands are a strong starting point, not a guarantee — run them, check the row count looks sane, and adjust if the data has surprises the sample didn't show.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-data quick reference"
  steps={[
    { content: "**Sample, not the whole file** — 3 JSON elements or 5 CSV rows, enough to see real field names" },
    { content: "**Suggestions, not one answer** — 5 candidate commands, chosen by intent through `fzf`" },
    { content: "**`print -z`, not auto-run** — the picked command lands on your prompt, editable, nothing executes until you press Enter" },
    { content: "**`mlr` when available** — nicer group-by/aggregation syntax than `awk` if Miller is installed" },
    { content: "**Registers into `ai`** — reachable as `ai data <file>`" }
  ]}
/>

## Conclusion

`ai-data` is the function in this series I expect to teach me the most, precisely because it refuses to just hand me an answer — it hands me the command and lets me be the one who runs it. A few weeks of picking `jq` filters off an `fzf` list and reading them before pressing Enter, and I suspect I'll need this less than I do today. That would be a strange kind of success for an AI tool: the goal isn't to keep using it forever, it's to quietly make itself less necessary one `group_by` at a time.
