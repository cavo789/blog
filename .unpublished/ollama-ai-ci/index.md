---
slug: ollama-ai-ci
title: "ai-ci: Ask a Local LLM Why Your GitLab Pipeline Failed"
authors: [christophe, claude]
image: /img/v2/gitlab.webp
mainTag: ai
tags: [gitlab, git, ai, ollama, zsh]
date: 2026-12-31
description: "A zsh function that finds the last GitLab pipeline for the current branch, pulls the log of every failed job through the GitLab API, and asks a local Ollama model what broke and how to fix it — without leaving the terminal or waiting for the GitLab UI to load."
language: en
ai_assisted: true
draft: true
series: "Ollama daily use"
---

![ai-ci: Ask a Local LLM Why Your GitLab Pipeline Failed](/img/v2/gitlab.webp)

<!-- cspell:ignoreCase ai-test ai-commit ai-ci qwen ollama zshrc phpstan gitlab -->

<TLDR>
This article adds `ai-ci` to the "Ollama daily use" series: it detects the current repository's GitLab project from the `origin` remote, finds the most recent pipeline for a given branch, pulls the log of every failed job through the GitLab API, and asks a local Ollama model to explain what broke and suggest a fix — all without opening a browser tab.
</TLDR>

I've covered <Link to="/blog/gitlab-docker-out-of-docker">GitLab Docker-out-of-Docker</Link>, <Link to="/blog/gitlab-using-private-images">private image access</Link>, and <Link to="/blog/gitlab-runner-ssh-key">SSH keys for runners</Link> in previous articles — pipelines are a daily part of my work. And a daily part of *that* is the little ritual after a red pipeline notification: open the browser, find the project, find the pipeline, find the failed job, scroll to the actual error buried under forty lines of Composer/npm noise. Ninety seconds, every time, for something that's usually a one-line explanation once you find it.

<!-- truncate -->

## Demo

<Terminal source="./files/terminal_ci.txt" typewriter />

That's a `phpstan` job on the `main` branch, its actual error (a type mismatch on line 42) surfaced directly in the terminal — no browser, no clicking through three levels of GitLab's job UI to find where the log actually stopped scrolling.

## What It Needs

<Prerequisite
  name="jq"
  install="sudo apt update && sudo apt install jq -y"
  installOutput={`\nReading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.`}
  check="jq --version"
  checkOutput={`\njq-1.7`}
  typewriter
/>

A GitLab personal access token with the `read_api` scope, exported once:

```bash title="~/.zshrc"
export GITLAB_TOKEN="glpat-xxxxxxxxxxxxxxxxxxxx"
```

<AlertBox variant="important" title="Scope it tight">
`read_api` is enough — this function never writes anything back to GitLab. Generate the token under your GitLab profile's **Access Tokens** settings, and give it an expiry date; there's no reason for a token that only reads job logs to live forever.
</AlertBox>

## The `ai-ci` Function

No need to copy anything yet: the `.zsh` files shown in this article are here to be read, and [Installing It](#installing-it) at the end creates every one of them in `~/.zsh/fns/` for you.

<Snippet filename="~/.zsh/fns/ai-ci.zsh" source="./files/ai-ci.zsh" defaultOpen={true} />

Step by step:

1. Parse `origin`'s URL — SSH (`git@gitlab.example.com:group/project.git`) or HTTPS — to recover the GitLab host and the `group/project` path. No configuration file, no hardcoded project ID: it reads the same remote `git` already knows about.
2. Ask the API for the most recent pipeline on the given ref (default: the currently checked-out branch).
3. List that pipeline's jobs, keep only the ones with `status == "failed"`.
4. For each failed job, fetch its trace and keep only the **last 6000 characters** — CI logs can run into the hundreds of kilobytes, and the actual error is almost always near the end, not the beginning.
5. Send that tail to `_ollama_query`, asking specifically for what broke and a concrete fix — not generic troubleshooting advice.

<AlertBox variant="note" title="Why truncate the trace?">
Sending an entire multi-megabyte log to the model wastes context window on Composer/npm installation noise and slows down the response for no benefit — the actual failure is reliably in the last few thousand characters, right where the job stopped.
</AlertBox>

## Registered in the `ai` Menu

One line — `AI_COMMANDS[ci]=...` — and it's reachable as `ai ci` or directly as `ai-ci`, alongside every other function in the series.

`_ollama_query` and the `AI_COMMANDS` registry live in the shared `_ollama.zsh` foundation introduced in <Link to="/blog/ollama-test-generator">ai-test</Link>. If you already followed an earlier article in this series, it's already sitting in `~/.zsh/fns/` and sourced by your autoloader — nothing more to do. Starting here instead? It is one of the files created in [Installing It](#installing-it) below.

<AlertBox variant="caution" title="Self-hosted GitLab and custom certificates">
If your GitLab instance sits behind a self-signed certificate, add `--insecure` to the `curl` calls (or better, install the corporate CA properly) — this function assumes a normally-trusted TLS setup.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="ai-ci quick reference"
  steps={[
    { content: "**No configuration file** — the GitLab host and project path are parsed straight from `git remote get-url origin`" },
    { content: "**`read_api` scope only** — the function never writes anything back to GitLab" },
    { content: "**Only failed jobs** — a green pipeline gets a one-line \"nothing failed\" and exits" },
    { content: "**Trace tail, not the full log** — the last 6000 characters, where the actual error almost always lives" },
    { content: "**Registers into `ai`** — reachable as `ai ci`" }
  ]}
/>

## Installing It

Everything runs on your machine: zsh, `curl` and `jq` (which builds the request sent to Ollama), and an Ollama server you can reach — see <Link to="/blog/ollama-installation">installing Ollama</Link> if you don't have one yet.

**1. Create the files.** Every function of this series lives in its own file in `~/.zsh/fns/`. The one-liner below creates that folder and the two files in one go — or download the ZIP, or create each file by hand and paste its content. `_ollama.zsh` is the foundation the whole series shares: if an earlier article already gave it to you, the copy here is the same file.

<ProjectSetup folderName="~/.zsh/fns">
  <Snippet filename="_ollama.zsh" source="./files/_ollama.zsh" defaultOpen={false} />
  <Snippet filename="ai-ci.zsh" source="./files/ai-ci.zsh" defaultOpen={false} />
</ProjectSetup>

**2. Load the folder from `~/.zshrc`.** Already done if you followed an earlier article of this series. Otherwise, add these lines at the end of `~/.zshrc` — they source every `.zsh` file in the folder, so the next function you add needs no change here:

```zsh title="~/.zshrc"
for fn_file in ~/.zsh/fns/*.zsh; do
  source "$fn_file"
done
```

**3. Open a new terminal** (or run `exec zsh` in the current one), and check that the shell knows the new function:

```zsh
type ai-ci
```

`ai-ci is a shell function from …/ai-ci.zsh` means you're ready. `ai-ci not found` means step 2 is missing.

## Conclusion

Ninety seconds of clicking through the GitLab UI to find one line of actual error, replaced by one command that reads the same API the UI does — just faster, and without leaving the terminal I was already in when the pipeline failed. Between `ai-ci`, `ai-fix` for local commands, and `ai-standup` for the morning recap, this series is turning into exactly what I wanted at the start: not one big AI tool, but a handful of small, boring ones that each remove one specific five-minute tax from my day.
