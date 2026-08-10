---
slug: ollama-ai-explain
title: "ai-explain — ELI5 for Scripts and Errors, Right in Your Terminal"
description: "The last function in the Ollama daily-use series: pipe any script, error message, or stack trace to ai-explain and get a plain-English explanation of what it does or what went wrong — entirely local, no cloud required."
authors: [christophe, claude]
image: /img/v2/playing_with_ollama.webp
mainTag: ai
draft: true
series: "Ollama daily use"
tags: [ai, linux, ollama, zsh]
date: 2026-10-06
ai_assisted: true
---

![ai-explain — ELI5 for Scripts and Errors, Right in Your Terminal](/img/v2/playing_with_ollama.webp)

<TLDR>
`ai-explain` is the last function in the Ollama daily-use series. Pipe any script, log output, or stack trace to it — or give it a file path — and get a plain-English explanation: what the script does, what the error means, and what to fix. One function, two modes (file or pipe), zero cloud.
</TLDR>

You cloned a repository and found a Bash script that runs as part of the CI pipeline. Three hundred lines, no comments. You need to understand what it does before you modify it. You could read it carefully, look up the flags, trace the logic. Or you could pipe it through `ai-explain`.

Same story for stack traces. A React error in production with six frames of minified output. A PHP `Fatal error` at line 847 of a file you've never opened. A Docker build failure on a RUN step you didn't write.

`ai-explain` is the terminal counterpart to the <Link to="/blog/docusaurus-eli5-snippet-tooltips">ELI5 tooltip component</Link> on this blog — the same "explain like I'm five" idea, but for your shell instead of the browser.

<!-- truncate -->

## Explain a Script You Didn't Write

<Terminal>
ai-explain deploy.sh
</Terminal>

```
This script performs a zero-downtime deployment of the application:

1. **Checks prerequisites**: verifies that Docker, git, and curl are installed.
   Exits with an error message if any is missing.

2. **Pulls the latest code**: runs `git pull --rebase origin main`. If the
   pull fails (e.g., merge conflict), the script exits immediately — it does
   not proceed to deployment with stale code.

3. **Builds the Docker image**: runs `docker build -t myapp:$(git rev-parse --short HEAD) .`
   — the image tag is the short git commit hash, making rollbacks straightforward.

4. **Updates the running container**: uses `docker compose up -d --no-deps app`
   to restart only the `app` service without touching the database. The `--no-deps`
   flag prevents cascading restarts.

5. **Health check**: polls `http://localhost:8080/health` every 5 seconds for up
   to 60 seconds. If the endpoint returns 200 within that window, prints "Deploy
   successful." Otherwise prints "Health check failed" and exits with code 1.

Side effect: the old image is not removed — run `docker image prune` manually
to reclaim disk space after a few deployments.
```

That's the entire interaction: a file path in, a plain-English breakdown out.

## Why It Works

`ai-explain` handles three input modes, checked in this order: piped input (so `cat file | ai-explain` always wins even if a filename is also passed), a file argument, or inline text for a quick one-liner — one function covers "explain this file" and "explain this error" without separate commands to remember.

## Installation

This function is part of the "Ollama daily use" series. It relies on the shared `_ollama.zsh` foundation introduced in the first article of the series (`ai-test`): the `_ollama_check` reachability guard, the `_ollama_query` HTTP client, and the `AI_COMMANDS` registry.

If you've been following the series and have `~/.zsh/fns/_ollama.zsh` already in place, you can install this function immediately. If not, start with the first article to get the foundation set up.

<Snippet source="./files/ai-explain.zsh" language="zsh" />

Save it to `~/.zsh/fns/ai-explain.zsh`. It loads automatically on the next shell startup if your `~/.zshrc` sources everything in `~/.zsh/fns/`.

## More Demos

### Explain a stack trace

<Snippet source="./files/example-error.txt" language="text" />

<Terminal>
ai-explain example-error.txt
</Terminal>

```
This is a React TypeError occurring at runtime, not a build error.

**What went wrong**: `ProductList` (in src/components/ProductList.jsx, line 42) calls
`.map()` on a value that is `undefined`. In JavaScript, `.map()` is an Array method —
if the value is not an array (here it's `undefined`), you get this exact error.

**Why it's undefined**: the most common cause is that the component receives `products`
(or whatever the prop name is) as `undefined` on the first render, before the data
has loaded from the API. Line 42 tries to map over it immediately without checking first.

**How to fix it**:

Option 1 — defensive default:
  const products = useProducts() ?? [];

Option 2 — early return while loading:
  if (!products) return <Loading />;

Option 3 — conditional render:
  {products?.map(p => <ProductCard key={p.id} {...p} />)}

Option 1 is the cleanest if `undefined` and an empty list are semantically equivalent.
Option 2 is better if you want to show a loading state. The error boundary React
mentions is a separate concern — it catches errors after they happen; these options
prevent the error from occurring.
```

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

Like every function in this series, `ai-explain` registers itself with the `AI_COMMANDS` registry. The `ai` dispatcher (from `_ollama.zsh`) lists all registered functions:

<Terminal>
ai
</Terminal>

```
> explain    Explain a script or error output in plain English
  commit     Draft a Conventional Commits message from staged diff
  review     Code review: SOLID, magic constants, naming
  standup    Summarize git activity for standup
  ...
```

Select `explain` and the dispatcher prompts you for a file path (via fzf or `read`). The parameter type `AI_PARAMS[explain]="file"` tells the dispatcher to use the file picker instead of a text prompt.

## Under the Hood (skip this if you just want to use it)

### When ai-explain is most useful

- **Inherited scripts**: understanding what a CI/CD script does before modifying it
- **Unfamiliar errors**: a stack trace from a language or framework you don't know well
- **Cryptic log output**: Docker daemon warnings, systemd journal entries, kernel messages
- **One-liner archaeology**: that `awk '{ split($0,a,":"); ... }'` command you found in a Makefile
- **Quick sanity check**: does this script do what the filename suggests?

It's also useful as a learning tool: pipe a script you wrote yourself and see if the explanation matches your intent. If it doesn't, either the explanation is wrong (it happens) or the script has a subtle bug.

## Conclusion

`ai-explain` is the fourteenth and final function in the "Ollama daily use" series.

The series started with `ai-test` (the foundation: `_ollama.zsh`, the dispatcher, the `AI_COMMANDS` registry) and added functions one by one — each solving a specific terminal workflow problem with a local LLM:

- **Developer workflow**: `ai-commit`, `ai-review`, `ai-secrets`, `ai-standup`  
- **Operations**: `ai-ci`, `ai-fix`
- **Shell assistance**: `ai-ask`, `ai-data`, `ai-diagram`
- **Document work**: `ai-translate`, `ai-summarize` (`ai-docs`)
- **Diff analysis**: `ai-diff`
- **Explanation**: `ai-explain`

All fourteen share the same `_ollama_query` foundation. Together they cover the moments in a development day where you'd normally reach for a browser search or a cloud AI — but where a local model is faster, more private, and just as accurate.

If you've installed all fourteen, run `ai` and see what your terminal knows how to do now.
