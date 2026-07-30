---
slug: ollama-test-generator
title: "ai-test: Generate Missing Unit Tests From Your Terminal With a Local LLM"
authors: [christophe, claude]
image: /img/v2/unit_tests.webp
mainTag: ai
tags: [ai, ollama, zsh, tests]
date: 2026-12-31
description: "Turn your local Ollama model into an on-demand unit test generator. A zsh function that reads a Bash, PHP or Python file, detects whether you already have tests for it, and prints only the missing Bats/Pest/Pytest cases needed for full coverage — straight to your terminal, nothing written to disk."
language: en
ai_assisted: true
draft: true
series: "Ollama daily-use functions"
---

![ai-test: Generate Missing Unit Tests From Your Terminal With a Local LLM](/img/v2/unit_tests.webp)

<!-- cspell:ignoreCase ai-test ai-commit qwen ollama bats zshrc dotfiles -->

<TLDR>
This article builds `ai-test`, a zsh function that sends a Bash, PHP or Python file to your local Ollama model and prints back a ready-to-use Bats, Pest or Pytest suite — nothing is written to disk unless you choose to save it. If a test file already exists for that script, `ai-test` sends both files to the model and asks for the missing cases only, instead of regenerating a suite you already have. It is the first function of a small "Ollama daily-use" series — plain zsh functions in `~/.zsh/fns/`, all reachable through a single `ai` entry point so I never have to remember their individual names, that turn a local LLM into a genuine part of the terminal workflow instead of a chat window in a browser tab.
</TLDR>

Damn, it happened again: I opened `backup.sh`, a script I wrote three months ago, because I finally had ten minutes to add tests for it. And I sat there staring at the code, trying to remember every edge case I had (or hadn't) handled. Empty source folder? Missing destination? What happens if `tar` itself fails? I know the answers are *somewhere* in that function — I just don't remember which ones I actually protected against.

I already have Ollama running locally — I covered [installing it](/blog/ollama-installation) and [exposing it across my network](/blog/accessing-ollama-across-your-local-network) in previous articles, and it currently sits idle on my machine most of the day. So why not point it at the one task I keep postponing?

<!-- truncate -->

## The Problem With Writing Tests After the Fact

Writing tests *while* you write the code is easy — the edge cases are fresh in your head. Writing tests for a script you wrote weeks ago is a different exercise entirely: you have to re-read the code as if someone else wrote it, mentally re-derive every branch, and only then start typing `@test` blocks. It's tedious enough that, like you know me, it keeps sliding to "later" — and later never comes.

What I actually want is boring and specific: point a command at a file, get a test suite back, review it, keep what makes sense. No new IDE plugin, no cloud subscription, no code leaving my machine. Just a terminal function.

<Prerequisite
  name="jq"
  install="sudo apt update && sudo apt install jq -y"
  installOutput={`\nReading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`}
  check="jq --version"
  checkOutput={`\njq-1.7`}
  typewriter
/>

<AlertBox variant="tip" title="bat is optional">
If [`bat`](https://github.com/sharkdp/bat) is installed, the generated code is syntax-highlighted before it hits your terminal. If it's not, `ai-test` simply falls back to plain `echo` — no hard dependency.
</AlertBox>

## The Shared Foundation — `_ollama.zsh`

Every "AI daily-use" function in this series talks to Ollama the same way, so I factored that part out into its own file in `~/.zsh/fns/`. It also holds two things every future function will lean on: a registry of available commands, and the `ai` entry point itself:

<Snippet filename="~/.zsh/fns/_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={true} />

A few things worth calling out:

- The leading underscore in the filename is deliberate. My `~/.zsh/fns/` loader (`for fn_file in ~/.zsh/fns/*.zsh`) sources files in alphabetical order, and `_` sorts before any letter — so `_ollama.zsh` is always loaded first, guaranteeing `AI_COMMANDS` and `ai()` exist before any `ai-*.zsh` file tries to register itself into them.
- `_ollama_query` checks `${host}/api/tags` first, with a two-second timeout, and fails loudly if Ollama isn't reachable — I'd rather get an immediate, clear error than watch `curl` hang for thirty seconds against a stopped container.
- Building the JSON payload with `jq -n` instead of a hand-rolled string means I never have to worry about escaping quotes, backslashes, or newlines in the source code I'm about to paste into the prompt — `jq` handles all of that for me.
- `ai()` is the whole point of this section: called with no argument (or `ai help`/`ai list`), it opens an `fzf` picker over everything registered in `AI_COMMANDS`; called as `ai <command> [args]`, it dispatches straight to `ai-<command>`. Every function below only has to add one line to make itself discoverable.

## The `ai-test` Function

<Snippet filename="~/.zsh/fns/ai-test.zsh" source="./files/ai-test.zsh" defaultOpen={true} />

The logic is deliberately simple:

1. Register itself with `AI_COMMANDS[test]=...` — the one line that makes `ai-test` show up in the `ai` menu.
2. Map the file extension to a language and a test framework (`.sh`/`.bash` → Bats, `.php` → Pest, `.py` → Pytest).
3. Look for an existing test file using each ecosystem's own naming convention — `<name>.bats`, `<Name>Test.php`, `test_<name>.py` / `<name>_test.py` — checked both next to the source file and in a sibling `tests/` folder.
4. Build one of two prompts: "write a full suite" or "here's the source *and* the current tests, give me only what's missing."
5. Send it through `_ollama_query`, then pretty-print the result with `bat` if it's available.

<AlertBox variant="note" title="Why print instead of write to disk?">
I want to *read* the suggestion before it becomes a file in my project. Piping the output to a file is one `>` away if I'm happy with it — but the default should never silently overwrite (or worse, silently merge into) an existing test file.
</AlertBox>

## Wiring It Into `~/.zshrc`

If you already set up the `~/.zsh/fns/` auto-loader from [my ripgrep article](/blog/ripgrep), you're done — just drop both files above into that folder and open a new shell. If not, here's the two-line addition:

```bash title="~/.zshrc"
export OLLAMA_MODEL="qwen3-coder:30b"   # optional, this is already the default
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

## Demo 1 — Generating a Full Suite From Scratch

Here's the script I mentioned at the top of this article:

<Snippet filename="backup.sh" source="./files/backup.sh" defaultOpen={false} />

No `backup.bats` exists yet anywhere near it, so `ai-test` falls back to generating the full suite:

<Terminal source="./files/terminal_full.txt" typewriter />

Five tests, covering the missing-argument guard, the "not a directory" check, the happy path, the default `dest_dir`, and the `mkdir -p` behavior for a destination that doesn't exist yet. Not perfect — I'd still want a sixth test simulating a `tar` failure — but it's a solid first draft that would have taken me fifteen minutes to write by hand.

## Demo 2 — Filling the Coverage Gaps

Now let's say I did write *some* tests already — just the two obvious ones:

<Snippet filename="backup.bats" source="./files/backup.bats" defaultOpen={false} />

Run `ai-test` again on the same source file, and this time it finds `backup.bats` sitting right next to it:

<Terminal source="./files/terminal_gap.txt" typewriter />

Instead of regenerating five tests I already partially have, the model compared both files and handed back exactly the three that were missing. That's the difference this makes in practice: I'm not re-reviewing tests I already trust, I'm reviewing three new, focused additions.

## Choosing Your Model

This isn't a one-model-fits-all situation. On a 24GB card, `qwen3-coder:30b` gives noticeably better test coverage reasoning than the smaller `1.5b`/`7b` variants I compared in my [network access article](/blog/accessing-ollama-across-your-local-network) — it's slower, but for a task you run a handful of times a day, not thousands, the extra ten seconds don't matter. If you're VRAM-constrained, drop to `qwen2.5-coder:7b` and expect a good happy-path suite with weaker edge-case coverage; you'll do more of the thinking yourself.

<AlertBox variant="caution" title="Read before you trust">
Generated tests are a draft, not a guarantee. I've seen the model assert behavior that looked plausible but was subtly wrong — e.g. assuming a function returns `0` on a partial failure. Treat every generated test the same way you'd treat a pull request from a junior contributor: read it, run it, then decide.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-test quick reference"
  steps={[
    { content: "**One shared foundation** — `_ollama_query`, `AI_COMMANDS` and the `ai` dispatcher, all in `~/.zsh/fns/_ollama.zsh`" },
    { content: "**Self-registering commands** — `ai-test` adds itself to `AI_COMMANDS[test]`; no menu to edit by hand" },
    { content: "**Language detection** — extension maps to Bash/Bats, PHP/Pest, or Python/Pytest" },
    { content: "**Gap-fill mode** — if a matching test file already exists, only the missing cases are generated" },
    { content: "**Nothing written to disk** — output goes to stdout; redirect with `>` only when you're happy with it" },
    { content: "**Model choice matters** — bigger models reason better about edge cases; on a budget, expect a good happy path and do the rest yourself" }
  ]}
/>

## Conclusion

At the top of this article I was staring at `backup.sh`, unable to remember which edge cases I'd actually covered. Now, every time that happens, `ai-test backup.sh` gives me a starting point in the time it takes to make coffee — and when I later add a new branch to the function, a second run only asks the model for what changed. It's not a replacement for understanding your own code; it's a way to stop the "I'll write tests later" cycle from quietly turning into "I never did."

There's a second problem this setup quietly solves: I know myself well enough to know that a function I don't use every single day eventually falls out of muscle memory. That's exactly what `ai` — the dispatcher living in `_ollama.zsh` — is for. I don't need to remember `ai-test` exists; I only need to remember one word, `ai`, and let the menu remind me of the rest. The next article adds `ai-commit` to that same menu, for free, just by registering one line in `AI_COMMANDS`.
