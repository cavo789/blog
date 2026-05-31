---
slug: claude-ia-spare-tokens
title: Claude Code - Optimizing Token Usage
authors: [christophe]
image: /img/v2/claude-code-tokens.webp
mainTag: ai
tags: [ai]
draft: true
date: 2026-12-31
---

![Claude Code - Optimizing Token Usage](/img/v2/claude-code-tokens.webp)

## Reducing Context

* When using chat, keep in mind

  * `/clear`: the longer the conversation, the longer the input context (the conversation history), and the more tokens this will consume.  If you no longer need the context because the new question is completely different from the history, it is recommended to use “/clear”
  * `/compact`: when your token quota reaches 40% (an arbitrary figure) and you want to keep the conversation history, the “/compact” option summarizes the history, thereby consuming fewer input tokens. Note: Running `/compact` consumes tokens since it uses AI to generate a summary. You should therefore use this command when your conversation gets long and you know it will continue for a few more messages.

* Once you have completed a task, such as creating a new feature or fixing a bug, it is also recommended to run `git add` followed by `git commit` to clear the Git diff (i.e., `git status` should show that the files are in the staging area and `git diff` should return an empty list).  This is because Claude Code continuously checks the change history to see if any of its recent modifications might be causing, for example, a regression. If the diff (`git diff`) is empty, it consumes less context.

* A plugin named `/caveman` ([https://github.com/JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)) allows you to force Claude Code to respond as strictly as possible (and thus reduce the size of the output tokens). The idea is to restrict the response (output token) as much as possible; however, because the quality of the response will be reduced to a minimum, this can have a negative impact on the entire conversation.

* Once you have completed a task, such as creating a new feature or fixing a bug, it is also recommended to run `git add` followed by `git commit` to clear the Git diff (i.e., `git status` should show that the files are in the staging area and `git diff` should return an empty list).  This is because Claude Code continuously checks the change history to see if any of its recent modifications might be causing, for example, a regression. If the diff (`git diff`) is empty, it consumes less context.

* A plugin named `/caveman` ([https://github.com/JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)) allows you to force Claude Code to respond as strictly as possible (and thus reduce the size of the output tokens). The idea is to restrict the response (output token) as much as possible; however, because the quality of the response will be reduced to a minimum, this can have a negative impact on the entire conversation.

  * `/caveman-compress CLAUDE.md` is a command that removes filler words, polite phrases, repetitions, and more from the CLAUDE.md file. It will replace your explanations of what these acronyms mean with `SOLID` or `SRP`. This command will therefore make your CLAUDE.md file much more concise without losing any information or instructions.

* The choice of model strongly impacts the number of tokens used (=> the more powerful the model, the more it “costs” in tokens)
  * Claude Opus is the most resource-intensive (and the most powerful) --> use for reasoning
  * Claude Sonnet is the intermediate level --> use for execution
  * Claude Haiku is the least resource-intensive --> use for speed

* The `/context` command lets you understand what is loaded; “who consumes what” and see, for example, the usage of each action (the MCPs) created (to manage MCPs—how to enable/disable them—use the `/.mcp` command)

* The `/usage-credits` command will display the web page on claude.ia where you can immediately see your current usage percentage.

* `CLAUDE.md` file: This file is loaded by default when Claude starts up --> this file will already consume input context and should therefore include only what is important.

* Cache management: During a single conversation, Claude uses a cache that is invalidated when you switch models, add an action (an MCP), etc. These actions will invalidate the cache, which Claude will then have to re-read, thereby consuming input tokens.  When you want to change models or create an action, it is therefore best to do so in a new conversation (this can be done after running `/clear`)

* The message: if you provide a document (Word or PDF) or an image, it will “cost” more in input tokens. It is better to type text into the prompt rather than sending a file.

* When you want to add a side note during a conversation—such as “By the way, can you explain...?”—the best option is to use the `/btw` command (short for “By the way”). This tells Claude that this specific message should not be included in the full discussion, so the `/btw` message is ephemeral.  Note: `/btw` blocks agents, meaning Claude will not run any tools on your codebase that could potentially modify a file.

## CLAUDE.md File

* A basic rule: this file is read when a new conversation starts and is therefore added to the context from the beginning. The larger this file is, the more tokens you will consume right from the start.

* The file can be written in a very concise format; for example, simply writing `SOLID` and `SRP` is enough for the AI to understand what you’re talking about.

### Data Fetching Rules

The instructions below will force the Claude agent to be frugal when it needs to understand your question; e.g., instead of reading the entire `compose.yaml` file to analyze the list of volumes, it can run a `grep`, a `jq`, or a `yq` (depending on the file type) to retrieve only the requested node; for a JSON file, instead of running `cat fichier.json`, it will run `jq` followed by a filter.   This instruction therefore instructs Claude not to include the entire file in its input tokens, but only the portion it needs.

   ```markdown
   ## Data Fetching Rules

   **Fetch only what each check requires — never pull full metadata upfront.**
   ```

Side effect: This approach is the most restrictive and may cause the AI to have a less complete understanding of your entire project. If it only targets part of the file, it won’t have a complete picture of your script, configuration file, etc., and this can lead to some hallucinations.

Alternative: Below, we instruct the agent that for source files (Python, PHP, Bash, etc.), it should read them completely, but for configuration files, we ask it to be more focused.

   ```markdown
   ## Data Fetching Rules

   **Distinguish between code and metadata:**
   - **Source Code:** Because files are strictly max 200 lines, you may read full source files to grasp the complete import/dependency context and avoid breaking SRP.
   - **Infrastructure & Logs:** Never read full logs, `.lock` files, or raw JSON/YAML metadata. You MUST use targeted shell tools (`grep`, `jq`, `yq`) for Docker configs, `compose.yaml`, JSON files or CI/CD files.
   ```

### Output mode

If you add the following line to your CLAUDE.md file, it will consume ~25 input tokens, but it will require the AI to omit polite phrases and rephrasing, and to keep its textual response as brief as possible (not the code, but just the response explaining what it did). Consider a long discussion: if the responses are verbose, with each new iteration, these long responses are sent back into the context. Having short responses therefore helps save resources over the entire duration of the conversation.

  ```markdown
  ## Output mode

  **Ultra-concise.** No filler words, no repetition, no introductions, no conclusions. Density over readability. Skip pleasantries. Go straight to findings.
  ```

Side effect: Being less verbose in your explanation of “why you did that” won't help you understand their line of reasoning. If you're content to simply accept the proposed change, it's not a big deal, but if you're committed to reading, understanding, validating, and learning, this approach is probably too aggressive.

Alternative: Tell the agent that you’d like them to explain their choices, but in a concise sentence.

   ```markdown
   ## Output mode

   **High-Density Technical.** No filler, pleasantries, or generic introductions. When proposing code changes, you MUST provide a 1-sentence technical rationale explaining your architectural choice (e.g., how it serves SOLID, DRY, or a specific PHP 8.4/Python 3.14 feature). Be a highly critical peer reviewer; flag flaws bluntly.
   ```

### Code generation

The instruction below will also significantly reduce the number of output tokens by preventing the AI from returning the entire modified file; instead, it will only return a diff showing the lines immediately before and after the change made by the AI:

   ```markdown
   ## Code generation

   Do not output unchanged code blocks. Only display the specific lines modified, providing minimal surrounding context. Rely strictly on tools for full file rewrites.
   ```

## There is a concept of off-peak and peak hours

Anthropic has confirmed that, during business hours, there is a different **message rate limit**. The number of tokens remains the same, but their weighting does not: you will use up your quota more or less quickly depending on the time of day.

## Extra

### If you don't want to install caveman

Simply create a new conversation and ask Claude to do it for you:

```markdown
I want you to act as a token compressor for an LLM system prompt (in a “Caveman” style). Your goal is to drastically reduce the size of the following text while retaining 100% of the rules, technical constraints, and architectural guidelines. Compression rules: 1. Remove all connecting words, articles, polite language, and human grammar. 2. Use extreme telegraphic syntax, keywords, and standard abbreviations. 3. Group concepts by tags (e.g., [Rules], [Stack], [Lint]). 4. Do NOT omit ANY technical constraints (e.g., tool names, versions, strict limits). 5. Generate only the compressed result, with no introduction or conclusion. Here is the file to be compressed:

[YOUR-CLAUDE.MD-CONTENT]
```