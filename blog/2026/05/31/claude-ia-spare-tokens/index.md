---
slug: claude-ia-spare-tokens
title: Claude Code - Optimizing Token Usage
authors: [christophe]
image: /img/v2/claude-code-tokens.webp
mainTag: ai
tags: [ai]
draft: true
ai_assisted: true
date: 2026-05-31
---

![Claude Code - Optimizing Token Usage](/img/v2/claude-code-tokens.webp)

<TLDR>
Tokens are the currency of AI conversations: every word you send and receive has a cost. This article walks through practical techniques to reduce token consumption in Claude Code — from slash commands like `/clear` and `/compact`, to CLAUDE.md optimizations, smarter data-fetching rules, and off-peak usage tips.
</TLDR>

If you are new to Claude Code, you may not yet be aware that every interaction has a cost measured in **tokens**. Roughly speaking, a token is a small chunk of text (about 4 characters or ¾ of a word). The more context Claude has to process — your conversation history, open files, tool outputs — the more tokens are consumed. On paid plans, this affects your quota; on free plans, it directly limits how much you can do in a session.

This article collects practical tips to help you get the most out of your token budget.

<!-- truncate -->

## Reducing Context

* When using chat, keep in mind:

  * `/clear`: the longer the conversation, the longer the input context (the conversation history), and the more tokens this will consume. If you no longer need the context because the new question is completely different from the history, it is recommended to use `/clear`.
  * `/compact`: when your token quota reaches around 40% and you want to keep the conversation history, the `/compact` command summarizes the history, thereby consuming fewer input tokens. Note: running `/compact` itself consumes tokens since it uses AI to generate a summary. Use this command when your conversation gets long and you know it will continue for a few more messages.

* Once you have completed a task, such as creating a new feature or fixing a bug, it is also recommended to run `git add` followed by `git commit` to clear the Git diff (i.e., `git status` should show that the files are in the staging area and `git diff` should return an empty list). This is because Claude Code continuously checks the change history to see if any of its recent modifications might be causing a regression. If the diff (`git diff`) is empty, it consumes less context.

* A plugin named `/caveman` ([https://github.com/JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)) allows you to force Claude Code to respond as strictly as possible, thereby reducing the size of the output tokens. The idea is to restrict the response as much as possible; however, because the quality of the response will be reduced to a minimum, this can have a negative impact on the entire conversation.

  * `/caveman-compress CLAUDE.md` is a command that removes filler words, polite phrases, repetitions, and more from the CLAUDE.md file. It replaces verbose explanations with compact abbreviations like `SOLID` or `SRP`. This command therefore makes your CLAUDE.md file much more concise without losing any information or instructions.

* The choice of model strongly impacts the number of tokens used — the more powerful the model, the more it "costs" in tokens:
  * Claude Opus is the most resource-intensive (and the most powerful today) → use for complex reasoning tasks
  * Claude Sonnet is the intermediate level → use for day-to-day execution
  * Claude Haiku is the least resource-intensive → use for speed and simple tasks

* The `/context` command lets you understand what is loaded: "who consumes what" and see, for example, the token usage of each MCP server (to manage MCPs — how to enable/disable them — use the `/.mcp` command).

* The `/usage-credits` command will open the page on [https://claude.ai/](https://claude.ai/) where you can immediately see your current usage percentage.

* `CLAUDE.md` file: this file is loaded by default when Claude starts up, which means it immediately consumes input tokens. It should therefore include only what is truly important.

* Cache management: during a single conversation, Claude uses a cache that is invalidated when you switch models, add an MCP server, etc. These actions force Claude to re-read everything, consuming input tokens. When you want to change models or add an MCP, it is best to do so at the start of a new conversation (after running `/clear`).

* Files and images: if you attach a document (Word or PDF) or an image, it will cost more in input tokens. Whenever possible, paste the relevant text directly into the prompt instead of sending a file.

* When you want to add a side note during a conversation — such as "By the way, can you explain...?" — use the `/btw` command (short for "By the way"). This tells Claude that this specific message should not be included in the full discussion, so the `/btw` message is ephemeral. Note: `/btw` blocks agents, meaning Claude will not run any tools on your codebase that could potentially modify a file.

## CLAUDE.md File

* A basic rule: this file is read when a new conversation starts and is therefore added to the context from the very beginning. The larger this file is, the more tokens you will consume right from the start.

* The file can be written in a very concise format; for example, simply writing `SOLID` and `SRP` is enough for the AI to understand what you mean — no need for full sentences.

### Data Fetching Rules

The instructions below will force the Claude agent to be frugal when it needs to understand your codebase. For example, instead of reading the entire `compose.yaml` file to find the list of volumes, it will run a `grep`, `jq`, or `yq` command to retrieve only the requested node. This instruction tells Claude not to load the entire file into its input context, but only the portion it actually needs.

   ```markdown
   ## Data Fetching Rules

   **Fetch only what each check requires — never pull full metadata upfront.**
   ```

Side effect: this approach is the most restrictive and may cause the AI to have an incomplete understanding of your project. If it only reads part of a file, it won't have the full picture, which can lead to hallucinations or incorrect assumptions.

Alternative: the instruction below tells the agent to read source files in full (since they are typically short), but to be targeted when reading configuration or infrastructure files.

   ```markdown
   ## Data Fetching Rules

   **Distinguish between code and metadata:**

   - **Source Code:** Because files are strictly max 200 lines, you may read full source files to grasp the complete import/dependency context and avoid breaking SRP.
   - **Infrastructure & Logs:** Never read full logs, `.lock` files, or raw JSON/YAML metadata. You MUST use targeted shell tools (`grep`, `jq`, `yq`) for Docker configs, `compose.yaml`, JSON files or CI/CD files.
   ```

### Output Mode

If you add the following instruction to your CLAUDE.md file, it will consume roughly 25 extra input tokens at startup, but it will require the AI to omit polite phrases and rephrasing, keeping its textual responses as brief as possible (this applies to explanations, not to the code itself). Over a long conversation, verbose responses are sent back into the context with every new iteration — keeping responses short therefore saves tokens throughout the session.

  ```markdown
  ## Output mode

  **Ultra-concise.** No filler words, no repetition, no introductions, no conclusions. Density over readability. Skip pleasantries. Go straight to findings.
  ```

Side effect: being less verbose about "why it did that" makes it harder to understand the reasoning. If you are happy to simply accept the proposed change, this is fine — but if you want to read, understand, and learn from each suggestion, this approach is probably too aggressive.

Alternative: ask the agent to explain its choices, but in a single concise sentence.

   ```markdown
   ## Output mode

   **High-Density Technical.** No filler, pleasantries, or generic introductions. When proposing code changes, you MUST provide a 1-sentence technical rationale explaining your architectural choice (e.g., how it serves SOLID, DRY, or a specific PHP 8.4/Python 3.14 feature). Be a highly critical peer reviewer; flag flaws bluntly.
   ```

### Code Generation

The instruction below will also significantly reduce the number of output tokens by preventing the AI from returning the entire modified file. Instead, it will only return the lines immediately before and after the change — a minimal diff rather than a full file rewrite.

   ```markdown
   ## Code generation

   Do not output unchanged code blocks. Only display the specific lines modified, providing minimal surrounding context. Rely strictly on tools for full file rewrites.
   ```

## Off-Peak and Peak Hours

Anthropic has confirmed that, during business hours, there is a different **message rate limit**. The number of tokens remains the same, but their weighting does not: you will use up your quota more or less quickly depending on the time of day. If you are on a tight budget, working during off-peak hours (evenings or weekends) will stretch your quota further.

## Extra

### If you don't want to install caveman

Simply create a new conversation and ask Claude to compress your CLAUDE.md for you:

```markdown
I want you to act as a token compressor for an LLM system prompt (in a "Caveman" style). Your goal is to drastically reduce the size of the following text while retaining 100% of the rules, technical constraints, and architectural guidelines. Compression rules: 1. Remove all connecting words, articles, polite language, and human grammar. 2. Use extreme telegraphic syntax, keywords, and standard abbreviations. 3. Group concepts by tags (e.g., [Rules], [Stack], [Lint]). 4. Do NOT omit ANY technical constraints (e.g., tool names, versions, strict limits). 5. Generate only the compressed result, with no introduction or conclusion. Here is the file to be compressed:

[YOUR-CLAUDE.MD-CONTENT]
```
