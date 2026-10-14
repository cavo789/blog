---
slug: ollama-ai-standup
title: "ai-standup: Turn Yesterday's Commits Into a Daily Standup Update"
authors: [christophe, claude]
image: /img/v2/git_branches_status.webp
mainTag: ai
tags: [git, zsh, ai, ollama]
date: 2026-12-31
description: "A zsh function that scans yesterday's commits across every repo you work in and summarizes them into a short, ready-to-say standup update — reusing the same _ollama_query helper and ai dispatcher from the rest of this series."
language: en
ai_assisted: true
draft: true
series: "Ollama daily use"
---

![ai-standup: Turn Yesterday's Commits Into a Daily Standup Update](/img/v2/git_branches_status.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-standup qwen ollama zshrc standup -->

<TLDR>
This article adds `ai-standup` to the "Ollama daily use" series: it scans `git log` across every repository you list in `$AI_STANDUP_REPOS`, keeps only your own commits over a configurable number of days (`$AI_STANDUP_DAYS` — 1 for a daily standup, 7 for a weekly one), and asks the local model to turn them into a short, spoken-friendly update — the kind you actually say out loud, not a changelog dump.
</TLDR>

I work across several repositories on a given day — this blog, a couple of client projects, an internal tool or two — and by the time the daily standup rolls around the next morning, I've genuinely forgotten what I touched in the smaller one. Scrolling through `git log` across three or four repos to reconstruct "what did I do yesterday" is exactly the kind of five-minute tax I'd rather not pay every single morning.

<!-- truncate -->

## Demo

<Terminal source="./files/terminal_standup.txt" typewriter />

That's the four repos I actually touched, condensed from what was probably fifteen or twenty raw commit messages (including a couple of "wip" and "fix typo" ones the model correctly left out) down to four lines I can read almost verbatim in the standup call.

<AlertBox variant="tip" title="Override the window for one run">
`ai-standup 3` covers a long weekend or a day you missed standup, regardless of what `$AI_STANDUP_DAYS` is set to — the argument always wins over the default.
</AlertBox>

## The Idea

`git log` already has everything: `--since`, `--author`, and `--all` to catch commits on any branch, not just the one currently checked out. The only manual part is deciding *which* repos to look at — so that becomes a one-time setting, not something the function has to guess.

## Configuration

Add this to `~/.zshrc`, once:

```bash title="~/.zshrc"
AI_STANDUP_REPOS=(~/code/blog ~/code/api-tools ~/code/internal-dashboard)
```

<AlertBox variant="note" title="Not exported on purpose">
Unlike `OLLAMA_MODEL`, this stays a plain zsh array, not an exported environment variable — arrays don't survive being exported to subprocesses anyway, and `ai-standup` only ever runs inside your interactive shell.
</AlertBox>

My own standup isn't daily, it's weekly — so typing `ai-standup 7` every single time would get old fast. One more line in `~/.zshrc` fixes that:

```bash title="~/.zshrc"
AI_STANDUP_DAYS=7
```

Now bare `ai-standup` covers my actual cadence, and I can still type `ai-standup 1` on the odd week I want just the last day. Same function, same prompt — only the `--since` window changes:

```bash
ai-standup        # uses $AI_STANDUP_DAYS, 7 in my case
ai-standup 1      # override: just the last 24 hours
ai-standup 14     # override: coming back from vacation
```

## The `ai-standup` Function

No need to copy anything yet: the `.zsh` files shown in this article are here to be read, and [Installing It](#installing-it) at the end creates every one of them in `~/.zsh/fns/` for you.

<Snippet filename="~/.zsh/fns/ai-standup.zsh" source="./files/ai-standup.zsh" defaultOpen={true} />

For each repo in the list:

1. Resolve the day count: the first argument, or `$AI_STANDUP_DAYS`, or `1` — and reject anything that isn't a plain positive number before it ever reaches `git log`.
2. Skip a repo silently if it's not actually a git repository (handy if a path in the list is temporarily missing, e.g. an external drive).
3. Run `git log --since="${days} days ago" --author="$email" --all` — `--all` matters, since a good chunk of what I did usually lives on a feature branch I haven't merged yet.
4. Group the commit messages under a `### <repo-name>` heading.

Once every repo has been scanned, the combined list goes to `_ollama_query` with a prompt that explicitly asks for 3-6 bullet points, past tense, first person, related commits grouped together, trivial ones (typo fixes, merge commits) dropped.

## Registered in the `ai` Menu

Like every function in this series, `ai-standup` adds itself with one line — `AI_COMMANDS[standup]=...` — so it shows up next to <Link to="/blog/ollama-test-generator">`test`</Link> and <Link to="/blog/ollama-git-precommit">`commit`</Link> the moment you run bare `ai`. Reachable as `ai standup` or directly as `ai-standup`.

`_ollama_query` and the `AI_COMMANDS` registry live in the shared `_ollama.zsh` foundation introduced in <Link to="/blog/ollama-test-generator">ai-test</Link>. If you already followed an earlier article in this series, it's already sitting in `~/.zsh/fns/` and sourced by your autoloader — nothing more to do. Starting here instead? It is one of the files created in [Installing It](#installing-it) below.

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-standup quick reference"
  steps={[
    { content: "**Configure once** — `$AI_STANDUP_REPOS` in `~/.zshrc`, a plain zsh array" },
    { content: "**Cadence, not just \"yesterday\"** — `$AI_STANDUP_DAYS` sets your default window (1 for daily, 7 for weekly); a numeric argument overrides it for one run" },
    { content: "**`--all` is essential** — catches commits on unmerged feature branches, not just the checked-out branch" },
    { content: "**Filtered by `--author`** — only your own commits count toward the summary" },
    { content: "**Registers into `ai`** — reachable as `ai standup`, alongside every other function in the series" }
  ]}
/>

## Installing It

Everything runs on your machine: zsh, `curl` and `jq` (which builds the request sent to Ollama), and an Ollama server you can reach — see <Link to="/blog/ollama-installation">installing Ollama</Link> if you don't have one yet.

**1. Create the files.** Every function of this series lives in its own file in `~/.zsh/fns/`. The one-liner below creates that folder and the two files in one go — or download the ZIP, or create each file by hand and paste its content. `_ollama.zsh` is the foundation the whole series shares: if an earlier article already gave it to you, the copy here is the same file.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-standup.zsh" source="./files/ai-standup.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed an earlier article of this series. Otherwise, add these lines at the end of `~/.zshrc` — they source every `.zsh` file in the folder, so the next function you add needs no change here:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh` in the current one), and check that the shell knows the new function:

```zsh
type ai-standup
```

`ai-standup is a shell function from …/ai-standup.zsh` means you're ready. `ai-standup not found` means step 2 is missing.

## Conclusion

The five-minute tax of reconstructing "what did I actually do yesterday" across three repositories is gone — `ai-standup` reads the same commit history I already wrote, just once, and turns it into the sentence I'm about to say out loud anyway. It's the smallest function in this series so far, and maybe the one I'll end up running the most, precisely because it fires every single morning without me having to think about it.
