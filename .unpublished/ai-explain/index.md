---
slug: ollama-ai-explain
title: "ai-explain: ELI5 for Scripts and Errors, Right in Your Terminal"
authors: [christophe, claude]
image: /img/v2/playing_with_ollama.webp
mainTag: ai
tags: [ai, ollama, zsh, linux, bash, docker, git]
date: 2026-12-31
description: "The last function in the Ollama daily-use series: pipe any script, error message, or stack trace to ai-explain and get a plain-English explanation of what it does or what went wrong — entirely local, no cloud required."
language: en
ai_assisted: true
draft: true
series: "Ollama daily use"
---

![ai-explain: ELI5 for Scripts and Errors, Right in Your Terminal](/img/v2/playing_with_ollama.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-explain qwen ollama zshrc ERESOLVE -->

<TLDR>
`ai-explain` is the last function in the Ollama daily-use series. Pipe any script, log output, or stack trace to it — or give it a file path, or paste an error message as an argument — and get a plain-English explanation: what the script does, what the error means, and what to fix. One function, three input modes, zero cloud.
</TLDR>

You cloned a repository and found a Bash script that runs as part of the CI pipeline. Three hundred lines, no comments. You need to understand what it does before you modify it. You could read it carefully, look up the flags, trace the logic. Or you could pipe it through `ai-explain`.

Same story for stack traces. A React error in production with six frames of minified output. A PHP `Fatal error` at line 847 of a file you've never opened. A Docker build failure on a RUN step you didn't write.

`ai-explain` is the terminal counterpart to the <Link to="/blog/docusaurus-eli5-snippet-tooltips">ELI5 tooltip component</Link> on this blog — the same "explain like I'm five" idea, but for your shell instead of the browser.

<!-- truncate -->

## Explain a Script You Didn't Write

<Snippet filename="deploy.sh" source="./files/deploy.sh" defaultOpen={false} />

<Terminal source="./files/terminal_explain_script.txt" typewriter />

That's the entire interaction: a file path in, a plain-English breakdown out — prerequisites, the commit-hash image tag, the `--no-deps` restart, the 60-second health check and what happens when it times out.

## Why It Works

`ai-explain` handles three input modes, checked in this order: piped input (so `cat file | ai-explain` always wins even if a filename is also passed), an existing file, or inline text for a quick one-liner — one function covers "explain this file" and "explain this error" without separate commands to remember. The prompt asks for at most fifteen lines of plain text, never a copy of the input, and passes `uname -s` along so suggested commands match the platform you're actually on.

## Installing It

Everything runs on your machine: zsh, `curl` and `jq` (which builds the request sent to Ollama), and an Ollama server you can reach — see <Link to="/blog/ollama-installation">installing Ollama</Link> if you don't have one yet.

**1. Create the files.** Every function of this series lives in its own file in `~/.zsh/fns/`. The one-liner below creates that folder and the two files in one go — or download the ZIP, or create each file by hand and paste its content. `_ollama.zsh` is the foundation the whole series shares, introduced in <Link to="/blog/ollama-test-generator">ai-test</Link>: if an earlier article already gave it to you, the copy here is the same file.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-explain.zsh" source="./files/ai-explain.zsh" />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed an earlier article of this series. Otherwise, add these lines at the end of `~/.zshrc` — they source every `.zsh` file in the folder, so the next function you add needs no change here:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh` in the current one), and check that the shell knows the new function:

```zsh
type ai-explain
```

`ai-explain is a shell function from …/ai-explain.zsh` means you're ready. `ai-explain not found` means step 2 is missing.

## More Demos

### Explain a stack trace

<Snippet filename="example-error.txt" source="./files/example-error.txt" defaultOpen={false} />

<Terminal source="./files/terminal_explain_error.txt" typewriter />

### Pipe any command output

The most useful pattern: run a command that fails and pipe its output directly:

<Terminal>
docker build . 2>&1 | ai-explain
</Terminal>

<Terminal>
npm install 2>&1 | ai-explain
</Terminal>

<Terminal>
./run-tests.sh 2>&1 | tail -50 | ai-explain
</Terminal>

The `2>&1` redirects stderr to stdout so both streams reach the pipe. Without it, error messages from most CLI tools never make it to `ai-explain`.

For commands that produce a lot of output, pipe through `tail` first to keep only the relevant end of the output (where errors usually land).

### Use from the `ai` dispatcher

Like every function in this series, `ai-explain` registers itself with the `AI_COMMANDS` registry. The `ai` dispatcher (from `_ollama.zsh`) lists every registered function — here with the published ones from this series installed:

<Terminal source="./files/terminal_explain_menu.txt" />

Select `ai-explain` and the dispatcher opens its fzf file picker first: `AI_PARAMS[explain]="file"` tells it to ask for a file rather than a line of text.

## Under the Hood (skip this if you just want to use it)

### When ai-explain is most useful

- **Inherited scripts**: understanding what a CI/CD script does before modifying it
- **Unfamiliar errors**: a stack trace from a language or framework you don't know well
- **Cryptic log output**: Docker daemon warnings, systemd journal entries, kernel messages
- **One-liner archaeology**: that `awk '{ split($0,a,":"); ... }'` command you found in a Makefile
- **Quick sanity check**: does this script do what the filename suggests?

It's also useful as a learning tool: pipe a script you wrote yourself and see if the explanation matches your intent. If it doesn't, either the explanation is wrong (it happens) or the script has a subtle bug.

## Conclusion

`ai-explain` is the final function in the "Ollama daily use" series.

The series started with <Link to="/blog/ollama-test-generator">`ai-test`</Link> (the foundation: `_ollama.zsh`, the dispatcher, the `AI_COMMANDS` registry) and added functions one by one — each solving a specific terminal workflow problem with a local LLM:

- **Developer workflow**: <Link to="/blog/ollama-git-precommit">`ai-review`, `ai-secrets`, `ai-commit`</Link>, `ai-standup`
- **Operations**: `ai-ci`, `ai-fix`
- **Shell assistance**: `ai-ask`, `ai-data`, <Link to="/blog/ollama-ai-diagram">`ai-diagram`</Link>
- **Document work**: <Link to="/blog/ollama-ai-docs">`ai-translate`, `ai-summarize`</Link>, `ai-diff`
- **Your own documentation**: <Link to="/blog/anythingllm-chat-with-your-docs">`ai-blog-search`</Link>
- **Explanation**: `ai-explain`

All of them share the same `_ollama_query` foundation. Together they cover the moments in a development day where you'd normally reach for a browser search or a cloud AI — but where a local model is faster to reach and keeps everything on your machine.

If you've installed them all, run `ai` and see what your terminal knows how to do now.
