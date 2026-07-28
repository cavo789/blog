---
slug: ollama-ai-secrets
title: "ai-secrets: Catch Hardcoded Credentials Before You Commit Them"
authors: [christophe, claude]
image: /img/v2/docker_secrets.webp
mainTag: security
tags: [security, ai, ollama, git]
date: 2026-12-31
description: "A zsh function that scans your staged changes for hardcoded credentials and API keys — a cheap regex pass finds candidates, a local LLM judges which ones are genuine leaks versus safe patterns like reading from an environment variable. Extends ai-review with a dedicated, security-focused pass."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-secrets: Catch Hardcoded Credentials Before You Commit Them](/img/v2/docker_secrets.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-secrets qwen ollama zshrc getenv -->

<TLDR>
This article adds `ai-secrets` to the "Ollama daily-use functions" series: a cheap regex pass over the staged diff finds lines that *look* like credentials (passwords, API keys, tokens), then a local Ollama model judges which ones are genuine hardcoded secrets versus safe patterns a plain regex can't tell apart — a variable merely named "password" with no real value, a placeholder, or a correct `getenv()` read. [`ai-review`](/blog/ollama-ai-review) already flags an obvious hardcoded credential in passing; this is the dedicated version, and this blog's security-tagged content genuinely needed the company.
</TLDR>

When I wrote [`ai-review`](/blog/ollama-ai-review), one of its demo findings was a hardcoded database password — flagged under "Overall quality," almost as an aside. That felt like the wrong place for it. A SOLID violation is a design opinion; a hardcoded password sitting in a diff is a different category of problem entirely, one that deserves its own pass instead of competing for attention with naming suggestions.

<!-- truncate -->

## Regex First, Judgment Second

A plain regex scanner for secrets has a well-known problem: it can't tell `'password' => 'Sup3rSecret!2027'` (a real leak) from `'password' => getenv('DB_PASSWORD')` (the correct pattern) — both lines contain the word "password" right next to an `=`. That's exactly the gap an LLM closes: the regex does the cheap, deterministic part (find candidate lines, no model call wasted if nothing matches), and the model does the part that actually requires understanding context.

## The `ai-secrets` Function

<Snippet filename="~/.zsh/fns/ai-secrets.zsh" source="./files/ai-secrets.zsh" defaultOpen={true} />

Step by step:

1. Grep the staged diff for suspicious substrings — `api_key`, `secret`, `password`, `token`, an AWS-style access key pattern, a PEM private key header. Case-insensitive, deliberately broad.
2. If nothing matches, return immediately — no point spending a model call confirming a diff that never mentioned anything credential-shaped.
3. Send only the matched lines (not the whole diff) to the model, with explicit instructions to distinguish genuine secrets from the specific false positives that trip up regex-only tools.
4. The model either lists genuine findings with a one-line reason each, or replies with a single "No secrets detected."

<AlertBox variant="note" title="Why trim to matched lines instead of the whole diff?">
Sending only the suspicious lines keeps the prompt small and, more importantly, keeps the model's attention on exactly the lines that matter — it's not asked to also review code quality or naming here, just credentials.
</AlertBox>

## Demo

<Snippet filename="config/database.php (staged diff)" source="./files/demo.diff" defaultOpen={false} />

<Terminal source="./files/terminal_secrets.txt" typewriter />

Two lines matched the regex, both containing the word "password" — and the model correctly separated them: one is a real leak with a concrete fix, the other is the exact `getenv()` pattern that fix should follow, correctly left alone.

## Registered in the `ai` Menu

One line — `AI_COMMANDS[secrets]=...` — reachable as `ai secrets` or directly as `ai-secrets`, alongside every other function in the series.

<AlertBox variant="caution" title="A safety net, not a guarantee">
This catches what shows up in a text diff. It won't catch a secret baked into a binary asset, split across multiple commits to dodge single-line detection, or encoded in a way the regex pass doesn't recognize. Treat it as a second pair of eyes before a commit, not a replacement for a real secrets-scanning tool in CI for anything that actually matters.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-secrets quick reference"
  steps={[
    { content: "**Regex first** — cheap candidate search, zero model calls when nothing matches" },
    { content: "**LLM judges context** — separates real leaks from safe `getenv()`/placeholder patterns a regex can't" },
    { content: "**Only suspicious lines sent** — keeps the prompt small and focused" },
    { content: "**Complements `ai-review`** — a dedicated pass instead of one incidental finding among many" },
    { content: "**Registers into `ai`** — reachable as `ai secrets`" }
  ]}
/>

## Conclusion

This blog has exactly one article tagged `security` before this one — a gap I hadn't paid much attention to until [mapping where my articles do and don't connect](/blog/ollama-ai-review) made it obvious. `ai-secrets` won't replace a real CI-integrated secrets scanner for anything that matters at scale, but for the everyday "did I just paste a real password into a config file" moment, a cheap regex and one local model call catch it before `git commit` does the one thing you can't easily undo: put it in history.
