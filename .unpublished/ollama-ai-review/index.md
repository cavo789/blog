---
slug: ollama-ai-review
title: "ai-review: A SOLID, Magic-Constants, Naming Code Review Before You Even Commit"
authors: [christophe, claude]
image: /img/v2/clean_code.webp
mainTag: code-quality
tags: [code-quality, ai, ollama, git]
date: 2026-12-31
description: "A zsh function that reviews your staged changes for SOLID violations, magic constants, functions doing too much, and unclear naming — using a local Ollama model, printed straight to the terminal before you even write the commit message."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-review: A SOLID, Magic-Constants, Naming Code Review Before You Even Commit](/img/v2/clean_code.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-review qwen ollama zshrc SOLID -->

<TLDR>
This article adds `ai-review` to the "Ollama daily-use functions" series: it sends your staged `git diff` to a local Ollama model and asks it to review — not summarize — the change, under five fixed headings: SOLID violations, magic constants, long functions, naming, and overall quality. It's the on-demand, read-only cousin of `ai-commit`: run it right before you'd normally run `ai-commit`, catch what a linter can't, fix it, then stage again.
</TLDR>

I already have [pre-commit hooks](/blog/git-precommit) running phpcbf, PHPStan and friends before anything gets committed — but a linter checks *rules*, not *judgment*. It won't tell you that a method silently grew four responsibilities, that `0.21` on line 20 should have a name, or that `$d` was a lazy choice for a parameter three months ago and is unreadable today. That's a human code-review conversation — except most of the time, at 5 PM, alone, there's no second human around to have it with.

<!-- truncate -->

## The `ai-review` Function

<Snippet filename="~/.zsh/fns/ai-review.zsh" source="./files/ai-review.zsh" defaultOpen={true} />

Structurally, this is `ai-commit`'s twin — same guard clauses (must be in a git repo, must have something staged, warn on oversized diffs), same `_ollama_query` call. The entire difference is the prompt: five fixed headings, one instruction per issue (file, line, problem, fix — one sentence each), and an explicit "an empty section is a good outcome, not a failure" so the model doesn't manufacture issues just to fill space under every heading.

<AlertBox variant="note" title="Read-only, on purpose">
`ai-review` never touches the diff, never blocks a commit, never writes anything. It prints a review to your terminal — what you do with it (fix and re-stage, ignore, argue with it) is entirely up to you.
</AlertBox>

## Demo

Here's a staged change with a few issues planted on purpose — see if you spot them before reading the output:

<Snippet filename="src/Invoice/InvoiceProcessor.php (staged diff)" source="./files/demo.diff" defaultOpen={false} />

<Terminal source="./files/terminal_review.txt" typewriter />

Four issues surfaced, one per heading that actually applied — and notably, **no "Long functions" section**: 26 lines didn't cross whatever the model considers "too long" on its own, and the prompt explicitly told it not to invent one. That restraint is exactly why the fixed-headings format is worth the rigidity: a model that finds a violation under every single heading, every single time, is not reviewing your code — it's performing enthusiasm.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[review]=...` — reachable as `ai review` or directly as `ai-review`, alongside every other function in the series.

## Where This Fits Next to a Git-Hook Reviewer

I'm also experimenting with a fully automated git-hook reviewer — same kind of checks, but wired into `pre-commit` to block the commit outright instead of just reporting. `ai-review` is deliberately the lighter, manual sibling of that: something you run *before* you're ready to commit, to fix things yourself on your own terms, rather than something that stops you at the door. Different moment in the workflow, different level of enforcement — more on the automated version in a future article, once it's actually finished.

<AlertBox variant="caution" title="A model's opinion on SOLID is still an opinion">
Treat every flagged "violation" as a prompt to think, not a verdict. Some four-line functions genuinely are one responsibility; some 40-line ones genuinely aren't violating anything. `ai-review` is a second pair of eyes, not a linter rule you're required to satisfy.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-review quick reference"
  steps={[
    { content: "**Same skeleton as `ai-commit`** — staged diff in, guard clauses, size warning, one `_ollama_query` call" },
    { content: "**Five fixed headings** — SOLID violations, magic constants, long functions, naming, overall quality" },
    { content: "**Empty sections are expected** — the prompt explicitly forbids manufacturing issues to fill every heading" },
    { content: "**Read-only** — never blocks a commit, never edits anything; you decide what to act on" },
    { content: "**Registers into `ai`** — reachable as `ai review`" }
  ]}
/>

## Conclusion

`ai-review` doesn't replace [the pre-commit hooks](/blog/git-precommit) that already catch formatting and static-analysis issues, and it doesn't replace a real colleague's second opinion either — it fills the specific gap between the two: judgment calls a linter can't make, available at 5 PM when nobody else is around to ask. Between this and `ai-commit`, staging a change now comes with an optional, entirely local "does this actually hold together" check, one command before the commit message I was going to write anyway.
