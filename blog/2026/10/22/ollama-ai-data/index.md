---
slug: ollama-ai-data
title: "ai-data: Let a Local LLM Write Your jq and awk One-Liners"
authors: [christophe, claude]
image: /img/v2/json.webp
mainTag: ai
tags: [ai, ollama, zsh, fzf]
date: 2026-10-22
description: "A zsh function that reads a JSON or CSV file, understands its actual fields, and suggests 5 practical jq/awk commands tailored to that exact file — picked via fzf, then loaded onto your command line (not run for you) so you see, edit and learn the exact command before pressing Enter."
language: en
ai_assisted: true
series: "Ollama daily use"
---

![ai-data: Let a Local LLM Write Your jq and awk One-Liners](/img/v2/json.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-data qwen ollama zshrc mlr -->

<TLDR>
This article adds `ai-data` to the "Ollama daily use" series: point it at a `.json` or `.csv` file, and it asks the local model for 5 practical `jq`/`awk` commands tailored to that file's actual field names — not generic examples. Pick one with `fzf`, and instead of running it for you, `ai-data` loads it onto your zsh command line with `print -z`, ready to read, edit, and only then execute. The goal isn't just an answer — it's leaving with a command you understand.
</TLDR>

My use of <Link to="/blog/linux-jq">`jq`</Link> is still very basic; I'm nowhere near being able to write a `group_by` line of code on the first try.Every time, it’s the same routine: I have to fiddle around (and waste several minutes) just to get what I want—or even… I don’t even know that a certain feature exists. With `awk`, it's even worse: I know it exists and that it's incredibly powerful, but the syntax is just impossible.

<!-- truncate -->

## Demo — JSON

<Terminal source="./files/terminal_json.txt" typewriter />

Five suggestions, listed by what they answer — every one of them built on the real field names (`active`, `birth_date`, `name`) the model saw in the sample, not on placeholders from a `jq` tutorial. Picking the fourth one in `fzf` left that exact `group_by` filter sitting at my prompt; I read it, it looked right, I pressed Enter.

## Demo — CSV

<Terminal source="./files/terminal_csv.txt" typewriter />

The model noticed on its own that `region` is the column worth grouping by, and answered with the classic `awk | sort | uniq -c` pipeline — the kind of line I recognize when I see it but never write from memory. Having read it once at my own prompt, I understand it better than if I'd just seen the output.

## The Idea — Suggestions, Not Answers

Most functions in this series ask the model a question and print the answer — <Link to="/blog/ollama-ai-diagram">ai-diagram</Link> prints a Mermaid block, ready to paste. `ai-data` is different on purpose: it asks the model for **candidate commands**, shows them through <Link to="/blog/linux-fzf-introduction">`fzf`</Link>, and when you pick one, it doesn't run it — it drops it onto your prompt, editable, via zsh's `print -z`. You read the exact `jq` filter or `awk` script before it touches your data, and because you're the one hitting Enter, you actually absorb the syntax instead of just consuming the output.

<AlertBox variant="tip" title="print -z, in one sentence">
`print -z "some command"` pushes a string onto zsh's editor buffer — the next prompt shows it pre-typed, exactly as if you'd typed it yourself, cursor ready, nothing executed yet.
</AlertBox>

## The `ai-data` Function

No need to copy anything yet: the `.zsh` files shown in this article are here to be read, and [Installing It](#installing-it) at the end creates every one of them in `~/.zsh/fns/` for you.

<Snippet filename="~/.zsh/fns/ai-data.zsh" source="./files/ai-data.zsh" defaultOpen={true} />

Step by step:

1. Detect JSON vs CSV from the extension.
2. Build a small, real sample — for JSON, the first 3 elements if it's an array (`jq -c '.[0:3]'`); for CSV, the header plus 5 rows. Never the whole file: a 50,000-row CSV doesn't need to leave more than a few lines in the prompt.
3. For CSV, check whether [`mlr`](https://miller.readthedocs.io/) (Miller) is installed — if so, the model is told it can suggest `mlr` for group-by/aggregation, which reads dramatically cleaner than the equivalent `awk`. If not, it sticks to `awk`/`sort`/`uniq`.
4. Ask for exactly 5 commands, one per line, in a `COMMAND ||| description` format — deliberately not JSON output, because parsing five lines of "text before a triple-pipe" is trivial and doesn't risk the model wrapping its answer in markdown fences or extra commentary.
5. Pipe the five lines into `fzf`, showing only the description (`--with-nth=2`) so you're choosing by *intent*, not by squinting at `jq` syntax first.
6. On selection, `print -rz` the chosen command's first field.

<AlertBox variant="note" title="No fzf? Still works">
Without `fzf` installed, `ai-data` just prints the five suggestions as plain text — you copy the one you want manually. Same information, one less convenience.
</AlertBox>

## Registered in the `ai` Menu

One line — `AI_COMMANDS[data]=...` — reachable as `ai data <file>` or directly as `ai-data`, alongside every other function in the series.

`_ollama_query` and the `AI_COMMANDS` registry live in the shared `_ollama.zsh` foundation introduced in <Link to="/blog/ollama-test-generator">ai-test</Link>. If you already followed an earlier article in this series, it's already sitting in `~/.zsh/fns/` and sourced by your autoloader — nothing more to do. Starting here instead? It is one of the files created in [Installing It](#installing-it) below.

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

## Installing It

Everything runs on your machine: zsh, `curl` and `jq` (which builds the request sent to Ollama), and an Ollama server you can reach — see <Link to="/blog/ollama-installation">installing Ollama</Link> if you don't have one yet.

**1. Create the files.** Every function of this series lives in its own file in `~/.zsh/fns/`. The one-liner below creates that folder and the two files in one go — or download the ZIP, or create each file by hand and paste its content. `_ollama.zsh` is the foundation the whole series shares: if an earlier article already gave it to you, the copy here is the same file.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-data.zsh" source="./files/ai-data.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed an earlier article of this series. Otherwise, add these lines at the end of `~/.zshrc` — they source every `.zsh` file in the folder, so the next function you add needs no change here:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh` in the current one), and check that the shell knows the new function:

```zsh
type ai-data
```

`ai-data is a shell function from …/ai-data.zsh` means you're ready. `ai-data not found` means step 2 is missing.

## Conclusion

`ai-data` is the function in this series I expect to teach me the most, precisely because it refuses to just hand me an answer — it hands me the command and lets me be the one who runs it. A few weeks of picking `jq` filters off an `fzf` list and reading them before pressing Enter, and I suspect I'll need this less than I do today. That would be a strange kind of success for an AI tool: the goal isn't to keep using it forever, it's to quietly make itself less necessary one `group_by` at a time.
