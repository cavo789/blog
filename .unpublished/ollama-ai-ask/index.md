---
slug: ollama-ai-ask
title: "ai-ask: Ask For a Shell Command in Plain English, Get It Back Instantly"
authors: [christophe, claude]
image: /img/v2/linux_tips.webp
mainTag: ai
tags: [ai, ollama, zsh, linux]
date: 2026-12-31
description: "A zsh function that answers a plain-English question with the exact shell command to run — no man page diving, no forum searching, just the command, printed straight to the terminal by a local Ollama model."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-ask: Ask For a Shell Command in Plain English, Get It Back Instantly](/img/v2/linux_tips.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-ask qwen ollama zshrc ripgrep -->

<TLDR>
This article adds `ai-ask` to the "Ollama daily-use functions" series: the simplest function so far. Type a question in plain English, get the exact shell command back, printed to your terminal by a local Ollama model — no man page diving, no "linux find files containing text excluding gitignore" Google search, no context switch.
</TLDR>

While writing this very series, I caught myself doing the thing I do a dozen times a day without noticing: I wanted the command to search for a pattern across a folder tree while respecting `.gitignore`, and instead of just typing it, I opened a browser tab. I *know* the answer involves `rg` — I wrote [an entire article about it](/blog/ripgrep) — but recalling the exact flag combination from memory, at speed, isn't always instant. That's a silly reason to break flow.

<!-- truncate -->

## The Simplest Function in the Series

No file to read, no git repository to inspect, no API to authenticate against — `ai-ask` is close to the smallest possible wrapper around `_ollama_query`:

<Snippet filename="~/.zsh/fns/ai-ask.zsh" source="./files/ai-ask.zsh" defaultOpen={true} />

The only two things worth explaining:

- `"$*"` (not `"$1"`) joins every argument into one string, so you don't have to remember to quote the whole question — `ai-ask how do I find large files` works exactly like `ai-ask "how do I find large files"`.
- `uname -a` goes into the prompt so the model knows it's answering for Linux/WSL2, not macOS or a bare POSIX shell — small detail, but it keeps flag suggestions (`stat`, `date`, `sed -i`) actually correct for the platform they'll run on.

## Demo

<Terminal source="./files/terminal_ask.txt" typewriter />

The first one is the exact question that prompted this function — and yes, the model reached for `rg`, not a five-flag `grep` incantation, because that's genuinely the better answer.

<AlertBox variant="tip" title="Free-form phrasing works fine">
You don't need precise terminology. "how do I find large files", "command to see what's using port 3000", "undo my last git commit but keep the changes" — the model fills in the actual tool name and flags. That's the whole point: it does the vocabulary lookup so you don't have to.
</AlertBox>

<AlertBox variant="caution" title="Read before you run">
This is the function in the series most tempting to blindly copy-paste — resist that, especially for anything involving `rm`, permissions, or network configuration. Treat the output as a strong first draft of the command, not a command you run without reading.
</AlertBox>

## Registered in the `ai` Menu

One line — `AI_COMMANDS[ask]=...` — reachable as `ai ask "your question"` or directly as `ai-ask`, alongside every other function in the series.

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-ask quick reference"
  steps={[
    { content: "**Smallest function in the series** — a question in, a command out, nothing else in between" },
    { content: "**`\"$*\"` joins all arguments** — no need to manually quote the whole question" },
    { content: "**Platform-aware** — `uname -a` in the prompt keeps flags correct for your actual OS" },
    { content: "**Free-form phrasing** — no need to know the right terminology going in" },
    { content: "**Registers into `ai`** — reachable as `ai ask \"...\"`" }
  ]}
/>

## Conclusion

`ai-ask` is the function I expect to reach for most often, precisely because it's the one with the lowest ceremony — no file, no repo, no confirmation prompt, just a question and an answer. It won't replace actually knowing your tools, but it collapses the gap between "I know roughly what I want" and "I have the exact command" from a browser tab down to one line in the terminal I was already in.
