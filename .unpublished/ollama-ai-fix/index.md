---
slug: ollama-ai-fix
title: "ai-fix: A Local thefuck — Explain and Fix Your Last Failed Command"
authors: [christophe, claude]
image: /img/v2/zsh.webp
mainTag: ai
tags: [zsh, ai, ollama, linux]
date: 2026-12-31
description: "A zsh function that re-runs your last failed command to capture its actual error, then asks a local Ollama model to explain what went wrong and suggest the fix — with a confirmation prompt before re-running anything that looks like it could have side effects."
language: en
ai_assisted: true
draft: true
series: "Ollama daily use"
---

![ai-fix: A Local thefuck — Explain and Fix Your Last Failed Command](/img/v2/zsh.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-fix qwen ollama zshrc psuh thefuck -->

<TLDR>
This article adds `ai-fix` to the "Ollama daily use" series: a zsh function that re-runs your last failed command to capture its actual error output, then asks a local Ollama model to explain what broke and propose the corrected command. It's the same trick tools like [`thefuck`](https://github.com/nvbn/thefuck) use — with one addition: before re-running anything that looks destructive (`rm`, `git push`, `docker rm`, `kubectl delete`...), it asks for confirmation first.
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

No need to copy anything yet: the `.zsh` files shown in this article are here to be read, and [Installing It](#installing-it) at the end creates every one of them in `~/.zsh/fns/` for you.

<Snippet filename="~/.zsh/fns/ai-fix.zsh" source="./files/ai-fix.zsh" defaultOpen={true} />

Step by step:

1. `fc -ln -1` pulls the previous command from <Link to="/blog/linux-history">zsh's history</Link> — the command that ran *before* `ai-fix` itself, since zsh only appends a line to history once it finishes executing.
2. A guard refuses to re-run `ai-fix` itself, in case history timing ever surprises you.
3. The command is checked against a short list of risky substrings (`rm `, `git push`, `docker rm`, `kubectl delete`, `DROP `, and a few others). If it matches, you get a `[y/N]` prompt before anything re-runs.
4. `eval "$last_cmd"` runs it, capturing combined output. If it now succeeds (flaky network, a file that appeared in the meantime), `ai-fix` says so and stops — no point asking the model to explain a non-error.
5. On a real failure, the command, its exit code, and its output all go to `_ollama_query` with a prompt asking for one sentence of explanation and a `Fix:` line with the corrected command.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[fix]=...` — and it's reachable as `ai fix` alongside every other function in the series, or directly as `ai-fix`.

`_ollama_query` and the `AI_COMMANDS` registry live in the shared `_ollama.zsh` foundation introduced in <Link to="/blog/ollama-test-generator">ai-test</Link>. If you already followed an earlier article in this series, it's already sitting in `~/.zsh/fns/` and sourced by your autoloader — nothing more to do. Starting here instead? It is one of the files created in [Installing It](#installing-it) below.

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

## Installing It

Everything runs on your machine: zsh, `curl` and `jq` (which builds the request sent to Ollama), and an Ollama server you can reach — see <Link to="/blog/ollama-installation">installing Ollama</Link> if you don't have one yet.

**1. Create the files.** Every function of this series lives in its own file in `~/.zsh/fns/`. The one-liner below creates that folder and the two files in one go — or download the ZIP, or create each file by hand and paste its content. `_ollama.zsh` is the foundation the whole series shares: if an earlier article already gave it to you, the copy here is the same file.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-fix.zsh" source="./files/ai-fix.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed an earlier article of this series. Otherwise, add these lines at the end of `~/.zshrc` — they source every `.zsh` file in the folder, so the next function you add needs no change here:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh` in the current one), and check that the shell knows the new function:

```zsh
type ai-fix
```

`ai-fix is a shell function from …/ai-fix.zsh` means you're ready. `ai-fix not found` means step 2 is missing.

## Conclusion

`ai-fix` doesn't do anything the terminal couldn't already tell me — it just reads the error one more time than I have the patience to, and hands back the one line I actually need. Between this, `ai-standup`, `ai-test` and `ai-commit`, the local model I already had running for other reasons keeps finding new five-second tasks worth delegating — which, at this point, is exactly the point of the series.
