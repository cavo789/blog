---
slug: claude-code-delegate-to-ollama
title: "Claude Code + Ollama: Delegate the Proofreading, Never the Code"
authors: [christophe, claude]
image: /img/v2/claude-code-tokens.webp
mainTag: ollama
tags: [ai, ollama]
date: 2026-11-07
description: "Handing work from Claude Code to a free local Ollama model sounds like free tokens. It pays off for proofreading and translation, and it costs you for code. One rule tells them apart, plus a 50-line script and a skill that apply it."
ai_assisted: true
draft: true
---

![Claude Code + Ollama: Delegate the Proofreading, Never the Code](/img/v2/claude-code-tokens.webp)

<TLDR>
Letting Claude Code hand tasks to a local Ollama model saves tokens only when **Claude can check the answer without rereading it**. Proofreading and translation pass that test: a 27B local model finds the typos in a 3,000-word article in 6 seconds, for 25 tokens of output. Code fails it: fixing types, writing tests or summarizing logs gives answers Claude has to reread in full, and they're sometimes wrong while looking right. You don't need an MCP server. A 50-line `curl` script and a skill that tells Claude when to use it are enough.
</TLDR>

Every Claude Code session ends the same way: a usage bar that fills up faster than expected. Meanwhile, a 24 GB graphics card sits next to it with Ollama installed, doing nothing. MCP servers promise to connect the two, so Claude can hand the boring work to the free model.

I had Claude Code measure that idea on a real Python project (strict typing, around 4,400 UI strings in English and French) and on this blog. The answer is a clear yes for some tasks and a clear no for others. By the end of this article, you'll know which ones, and you'll have the script and the skill to make Claude delegate only those.

<!-- truncate -->

## What Delegating Looks Like When It Works

Below, Claude proofreads a 3,000-word article from this blog, the one about <Link to="/blog/wsl-docker-vhdx-cleanup">the Docker build cache that ate 180 GB</Link>, with four typos planted in it. It doesn't read the article. It hands it to `code-quality` (Qwen 27B, Q4) and reads only the answer:

<Terminal source="./files/terminal_proofread.txt" />

The model found all four typos. Claude read 25 tokens instead of 5,300, and each line can be checked on its own: is `lagre` actually in the file? It is, so Claude applies the fix. Proofreading the article itself would have cost it roughly **20 times more**.

## The Verdict, Task by Task

| | Task | What happened | Verdict |
| --- | --- | --- | --- |
| ✍️ | **Proofreading** (spelling, grammar) | Every planted typo found, zero false alarms, ~10 s | ✅ **Delegate** |
| 🌍 | **Translating** UI strings, first draft of a doc page | Format and placeholders 25/25; some terms off the glossary | ✅ **Delegate, then review** |
| 🏷️ | Summaries, tags, SEO descriptions | Short answer, easy to judge | 🟡 Probably |
| 🔧 | Fixing mypy / ruff errors | Correct, but the model rewrites the whole file | ❌ Costs more than one `Edit` |
| 🧪 | Writing unit tests | Duplicates the existing tests; with full context: 100 tests, 60 failing for invented reasons | ❌ **Don't** |
| 🔍 | Finding edge cases | 0 of 24 ideas useful: it recites the examples it was given | ❌ **Don't** |
| 📜 | Summarizing a test log | Wrong count, two failures merged into one, stated with confidence | ❌ **Never** — `grep` is free and exact |
| 🗑️ | Production code, reviews, anything that deletes files | — | ❌ **Never** |

<AlertBox variant="important" title="The rule">
**Only delegate what you can check without rereading it.**
</AlertBox>

## Why Delegating Isn't Free

Every time Claude hands off a task, it still pays three times:

- **The instruction it writes.** These are output tokens, the most expensive kind.
- **The answer it reads.** A tool result enters Claude's context like anything else. If the answer is a full rewritten file, Claude has paid for that file.
- **The judgment.** If Claude can't trust the answer, it rereads everything, and then it has done the work twice.

Proofreading wins because the answer is tiny and each line checks itself. Code loses because local *coder* models are trained to **complete** code, while the tasks above ask them to **judge** it: is this test useful, is this case realistic, is this code wrong? That judgment is exactly what Claude is better at, and a machine can't check it.

Two traps sit on top of that. A wrong answer that looks right, like the log summary, is worse than no answer. And on a long input a local model can loop forever on the same line, so a hard cap on the answer length is not optional.

## Setting It Up

You need Ollama running with a model of about 27B parameters for proofreading (see <Link to="/blog/ollama-installation">installing Ollama</Link>), plus `curl` and `jq`.

### A Script, Not an MCP Server

Claude Code already has a Bash tool, so it already has `curl`. An MCP server would add nothing except its tool definitions, which are loaded again on every turn. A script is enough:

<Snippet filename=".claude/scripts/ollama_ask.sh" source="./files/ollama_ask.sh" defaultOpen={false} />

It takes four arguments: model, instruction, input file, output file. **The answer goes to a file, not to the terminal**, so Claude sees one line of statistics and decides how much to read. It also sets `temperature: 0`, a timeout, and an answer length cap.

<AlertBox variant="caution" title="From a devcontainer, 127.0.0.1 is the container">
Ollama runs on the host, so the script defaults to `http://host.docker.internal:11434`. Override it with `OLLAMA_URL`. To reach Ollama from another machine, see <Link to="/blog/accessing-ollama-across-your-local-network">accessing Ollama across your local network</Link>.
</AlertBox>

### A Skill That Says When, and a Rule That Says It Always

A script that Claude doesn't know about is never used. Explaining it once in a chat doesn't stick either. The decision belongs in the repository, in two pieces.

**The skill** holds the method: when it's worth it, which model, how to check the answer. Claude loads it only when it proofreads or translates:

<Snippet filename=".claude/skills/delegate-to-ollama/SKILL.md" source="./files/SKILL.md" defaultOpen={false} />

**One rule** in an always-loaded file points to the skill, so subagents see it too:

<Snippet filename=".claude/rules/workflow.md" source="./files/workflow_rule.md" />

Why not an agent? A Claude Code agent is just another Claude: it spends Claude tokens and delegates nothing. What was missing was an *instruction*, not a worker. (The <Link to="/blog/claude-code-workflow">layered workflow article</Link> explains how skills, rules and agents fit together.)

## The Instruction Is Half the Result

Asked to *"list the spelling and grammar mistakes"*, the same model on the same file found only 2 of the 4 typos above: `Docker don't` and `filess`. Asked to report *"every misspelled word and every grammar mistake (typos included)"*, it found all four. At `temperature: 0`, the wording is the only setting left, so it's worth spelling out.

For translation, include a **glossary** in the instruction (*place = lieu, review = tri*…). Without one, the model picks its own synonyms, and the interface ends up with three words for one concept. Then check by script what a script can check: same number of lines, same `{placeholders}`, nothing left in English. Read only the French.

## What It Will Never Catch

The 180 GB article was also tested with one number changed to 18 GB, which contradicts every other paragraph. Neither model noticed. A local model fixes the **form** of a text. Its **substance** (the numbers, the consistency, whether a command actually works) stays a job for Claude, or for you.

## Conclusion

The free model next to Claude is useful, but not where you'd expect. It doesn't write your code. It reads your prose for typos and drafts your translations, in seconds, for a few dozen tokens of Claude's attention. Everything else costs more to check than to do.

Keep the rule from the table in mind: **only delegate what you can check without rereading it.** Put it in a skill so Claude applies it without being told. To save tokens on the code itself, read <Link to="/blog/claude-ia-spare-tokens">optimizing Claude Code token usage</Link>.
