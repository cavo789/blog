---
slug: ollama-ai-fix
title: "ai-fix: A Local thefuck — Explain and Fix Your Last Failed Command"
authors: [christophe, claude]
image: /img/v2/zsh.webp
mainTag: zsh
tags: [zsh, ai, ollama, linux]
date: 2026-12-31
description: "A zsh function that re-runs your last failed command to capture its actual error, then asks a local Ollama model to explain what went wrong and suggest the fix — with a confirmation prompt before re-running anything that looks like it could have side effects."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-fix: A Local thefuck — Explain and Fix Your Last Failed Command](/img/v2/zsh.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-fix qwen ollama zshrc psuh thefuck -->

<TLDR>
This article adds `ai-fix` to the "Ollama daily-use functions" series: a zsh function that re-runs your last failed command to capture its actual error output, then asks a local Ollama model to explain what broke and propose the corrected command. It's the same trick tools like [`thefuck`](https://github.com/nvbn/thefuck) use — with one addition: before re-running anything that looks destructive (`rm`, `git push`, `docker rm`, `kubectl delete`...), it asks for confirmation first.
</TLDR>

You know that moment: you fire a command, the terminal spits out three lines of red, and half the time you know exactly what broke before you've even finished reading the error — a typo, a missing flag, a path that doesn't exist yet. The other half of the time, you don't, and copy-pasting the error into a browser tab breaks your flow more than the error itself did.

<!-- truncate -->

## Demo

<Terminal source="./files/terminal_fix.txt" typewriter />

A classic typo, but the same flow handles a wrong flag, a missing `--`, a path that needs quoting, or a forgotten `sudo` just as well — anything where the fix is genuinely inferable from the error text.

## Why Re-Run Instead of "Just Reading" the Error

Here's the inconvenient truth: your shell doesn't keep the previous command's `stderr` anywhere. Once it's scrolled past, it's gone — unless you piped it to a file, which you didn't, because you didn't know it was going to fail. So `ai-fix`, like `thefuck` before it, does the only thing that actually works: it re-runs the command, this time capturing both `stdout` and `stderr` into a variable instead of letting them print straight to your terminal.

<AlertBox variant="important" title="Re-running has consequences for non-idempotent commands">
Re-running `curl` or `git status` is free. Re-running `rm -rf build/` a second time is also free (nothing left to remove). But re-running `git push` after a partial failure, or `docker rm` on a container that partially got removed, is a different story. `ai-fix` keeps a small list of risky verbs and asks for confirmation before touching anything that matches — see the guard below.
</AlertBox>

## The `ai-fix` Function

<Snippet filename="~/.zsh/fns/ai-fix.zsh" source="./files/ai-fix.zsh" defaultOpen={true} />

Step by step:

1. `fc -ln -1` pulls the previous command from zsh's history — the command that ran *before* `ai-fix` itself, since zsh only appends a line to history once it finishes executing.
2. A guard refuses to re-run `ai-fix` itself, in case history timing ever surprises you.
3. The command is checked against a short list of risky substrings (`rm `, `git push`, `docker rm`, `kubectl delete`, `DROP `, and a few others). If it matches, you get a `[y/N]` prompt before anything re-runs.
4. `eval "$last_cmd"` runs it, capturing combined output. If it now succeeds (flaky network, a file that appeared in the meantime), `ai-fix` says so and stops — no point asking the model to explain a non-error.
5. On a real failure, the command, its exit code, and its output all go to `_ollama_query` with a prompt asking for one sentence of explanation and a `Fix:` line with the corrected command.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[fix]=...` — and it's reachable as `ai fix` alongside every other function in the series, or directly as `ai-fix`.

<AlertBox variant="caution" title="Not a substitute for reading the error yourself">
For anything involving credentials, production infrastructure, or a command you don't fully recognize, read the actual error before trusting a suggested fix — the model is working from a truncated log, not from the full context you have in your head.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-fix quick reference"
  steps={[
    { content: "**Re-runs, doesn't remember** — the shell never stored the original stderr; capturing it requires running the command again" },
    { content: "**Confirmation on risky verbs** — `rm`, `git push`, `docker rm`, `kubectl delete` and friends trigger a `[y/N]` prompt first" },
    { content: "**Silent no-op on success** — if the command now succeeds, `ai-fix` says so and skips the model call entirely" },
    { content: "**One-sentence explanation + a `Fix:` line** — no essays, just what broke and the corrected command" },
    { content: "**Registers into `ai`** — reachable as `ai fix`" }
  ]}
/>

## Conclusion

`ai-fix` doesn't do anything the terminal couldn't already tell me — it just reads the error one more time than I have the patience to, and hands back the one line I actually need. Between this, `ai-standup`, `ai-test` and `ai-commit`, the local model I already had running for other reasons keeps finding new five-second tasks worth delegating — which, at this point, is exactly the point of the series.
