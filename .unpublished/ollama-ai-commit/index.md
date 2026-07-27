---
slug: ollama-ai-commit
title: "ai-commit: Let a Local LLM Draft Your Commit Messages"
authors: [christophe, claude]
image: /img/v2/workflows.webp
mainTag: git
tags: [git, ollama, zsh, ai]
date: 2026-12-31
description: "A zsh function that reads your staged git diff, asks a local Ollama model for a Conventional Commits message, and lets you accept, edit, or throw it away before anything is actually committed. No cloud API, no subscription, the same _ollama_query helper introduced for ai-test."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-commit: Let a Local LLM Draft Your Commit Messages](/img/v2/workflows.webp)

<!-- cspell:ignoreCase ai-test ai-commit qwen ollama zshrc -->

<TLDR>
This article builds `ai-commit`, a zsh function that sends your staged `git diff` to a local Ollama model and gets back a Conventional Commits message — `type(scope): subject` plus an optional body — that you can accept, edit in your normal `$EDITOR`, or discard. It's the second function in the "Ollama daily-use" series, and it reuses the exact same `_ollama_query` helper introduced in [ai-test](/blog/ollama-test-generator) — the point of that shared file is precisely to make each new function this cheap to add. It also registers itself with the `ai` entry point from that same article, so from here on `ai commit` and `ai test` both live behind one command you actually remember.
</TLDR>

You know me well enough by now: I have a whole article on [pre-commit hooks](/blog/git-precommit) enforcing formatting and static analysis before anything gets committed. But no hook in the world stops me from typing `git commit -m "fix"` at 6 PM on a Friday, staring blankly at a diff I wrote twenty minutes ago and no longer have the energy to summarize properly.

The diff already contains everything needed to describe itself — what changed, and roughly why, is right there in the `+`/`-` lines. So instead of typing "fix" for the fourth time this week, why not hand that diff to the local model that's already sitting idle on my machine?

<!-- truncate -->

## Reusing the Shared Foundation

If you already read [ai-test](/blog/ollama-test-generator), you already have `_ollama_query`, the `AI_COMMANDS` registry, and the `ai` dispatcher in `~/.zsh/fns/_ollama.zsh` — skip straight to the next section. If not, here it is again, unchanged:

<Snippet filename="~/.zsh/fns/_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />

This is exactly the value of factoring it out on day one: every new "ai-\*" function I add from here on is just a prompt-building function and one registration line away — not a new HTTP client to write, and not a menu to edit by hand.

## The `ai-commit` Function

<Snippet filename="~/.zsh/fns/ai-commit.zsh" source="./files/ai-commit.zsh" defaultOpen={true} />

What it does, step by step:

1. Register itself with `AI_COMMANDS[commit]=...` — that's the entire cost of making `ai-commit` show up in the `ai` menu.
2. Bail out early if you're not inside a git repository, or if `git diff --staged` is empty — no point calling the model with nothing to summarize.
3. Warn (but don't block) if the staged diff is unusually large — past a certain size, the model starts losing the plot, and you're better off committing in smaller, more focused chunks anyway.
4. Send the diff to `_ollama_query` with a prompt that pins the output format to Conventional Commits and asks for raw text — no markdown fences to strip afterward.
5. Print the suggestion, then ask: accept it as-is (`y`), open it in `git commit -e` to tweak it (`e`), or bail out entirely (anything else, including just pressing Enter).

<AlertBox variant="important" title="Nothing commits itself">
The default answer (pressing Enter) is "no." `ai-commit` only ever calls `git commit` after you explicitly type `y` or `e` — it never commits on your behalf.
</AlertBox>

## Demo

Say I just fixed a small bug in this blog's own reactions widget — an empty `slug` parameter was silently accepted instead of being rejected:

<Snippet filename="api/reactions.php (staged diff)" source="./files/demo.diff" defaultOpen={false} />

With that staged, here's the actual session:

<Terminal source="./files/terminal_commit.txt" typewriter />

That's a properly scoped `fix(api):` message with a short explanatory body — the kind of message I'd write if I weren't in a hurry, generated in the two or three seconds it takes the model to read a four-line diff.

## One Entry Point for Everything — `ai`

This is the part I actually care about long-term. `ai-test` and `ai-commit` are still callable directly — muscle memory is muscle memory — but with two functions now registered, running `ai` on its own actually pays off:

<Terminal source="./files/terminal_ai_menu.txt" typewriter />

That's the plain-text fallback, used here because it's the version I can put on a page. On an actual terminal with [`fzf`](/blog/linux-fzf-introduction) installed — which mine has, since I use it for [half my other functions](/blog/ripgrep) too — `ai` alone opens the same list as a fuzzy-searchable picker: type a few letters, arrow up/down, hit Enter, and it runs the matching `ai-*` function for you. `ai commit` (no dash, a space) works exactly like `ai-commit`; it's just the dispatcher shortcut.

<AlertBox variant="tip" title="This is the whole point of the series">
I don't need to remember `ai-test` or `ai-commit` exist. I need to remember one word: `ai`. Every function this series adds from now on only has to add one line to `AI_COMMANDS` to be found the same way — the menu never goes stale, and neither does my memory of what's available.
</AlertBox>

## Where This Breaks Down

<AlertBox variant="caution" title="Garbage in, garbage out">
A model can only describe *what changed*, not *why you made that choice*. For anything non-obvious — a workaround for a specific bug, a deliberate trade-off — I still edit the suggestion (`e`) to add the context only I have. Treat the generated message as a first draft of the "what," never the final word on the "why."
</AlertBox>

Large diffs are the other honest limitation: a 40-file refactor produces a diff the model either truncates its reasoning over or summarizes so broadly it's useless ("update multiple files"). The size warning in the function is there for exactly that case — it's a nudge toward the commit hygiene I already preach in [my pre-commit hooks article](/blog/git-precommit), not a workaround for skipping it.

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-commit quick reference"
  steps={[
    { content: "**Reuses `_ollama_query`** — no new HTTP plumbing, same helper as `ai-test`" },
    { content: "**Registers itself** — `AI_COMMANDS[commit]=...` is the only line needed to appear in the `ai` menu" },
    { content: "**Reads `git diff --staged`** — nothing to type, nothing to select manually" },
    { content: "**Conventional Commits format** — `type(scope): subject` plus an optional short body" },
    { content: "**Never auto-commits** — explicit `y` (accept) or `e` (edit) required; anything else aborts" },
    { content: "**Large diffs get a warning** — a nudge to commit smaller, focused chunks, not a hard block" },
    { content: "**Reachable as `ai commit` or bare `ai`** — the dispatcher and fzf menu from `_ollama.zsh` cover it automatically" }
  ]}
/>

## Conclusion

At the start of this article I described that very specific Friday-evening feeling: a diff sitting there, perfectly summarizable, and me with zero patience left to summarize it. `ai-commit` doesn't replace thinking about *why* I made a change — it just removes the friction of typing out the *what*, which was never the interesting part anyway. Combined with `ai-test` from the previous article, both sharing the same `_ollama_query` helper and both reachable through the same `ai` menu, the local model I already had running for other reasons is quietly becoming a small, boring, genuinely useful part of my terminal — exactly the kind of "daily use case" this series is about. And the next function I add only costs one registration line to join them.
