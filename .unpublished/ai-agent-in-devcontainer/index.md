---
slug: ai-agent-in-devcontainer
title: "Choose Your Own AI Agent — What Symfony Docker Got Right"
description: "Symfony Docker shipped Claude Code as its default AI agent, then pulled it back in favor of a guide. Here's why that reversal matters, and how to configure OpenCode with a local Ollama model in your Dev Container."
authors: [christophe, claude]
image: /img/v2/devcontainer.webp
mainTag: ai
tags: [ai, docker, devcontainer, ollama, vscode]
date: 2026-07-30
draft: true
tried_it: false
ai_assisted: true
language: en
---

![Choose Your Own AI Agent — What Symfony Docker Got Right](/img/v2/devcontainer.webp)

<!-- cspell:ignore opencode OpenCode dnsmasq ipset iptables postCreateCommand postStartCommand devcontainer FrankenPHP Dunglas allowlist -->

<TLDR>
Kévin Dunglas recently reverted Claude Code as Symfony Docker's default AI agent and shipped a guide instead — recommending OpenCode because it is open source and works equally well with local and remote models. This article walks through why that decision matters ("a default is never neutral"), how to wire OpenCode into your Dev Container from scratch, how to point it at a local Ollama instance so no data leaves your machine, and how to lock down an autonomous agent with an iptables/dnsmasq network sandbox.
</TLDR>

Something unusual caught my attention this week: a popular open-source project *removed* an AI agent that was already installed by default. At a time when every tool is racing to ship the flashiest AI integration, Kévin Dunglas — the creator of API Platform and Symfony Docker — pulled Claude Code from the default setup and replaced it with a guide. Not an alternative agent. A guide that lets *you* choose.

That subtle distinction stuck with me. And the more I thought about it, the more I realized it was the right call.

<!-- truncate -->

## The Network Sandbox, Proven

The part of this setup I find most compelling is the network sandbox: once an agent runs autonomously — editing files and executing commands without asking permission at every step — it has full network access unless something explicitly takes it away. The Symfony Docker guide locks this down with `iptables`/`ipset`: an allowlist of approved domains, everything else dropped.

Here's the same allow/deny mechanism, reduced to its core and run directly — an `iptables` `OUTPUT` policy of `DROP`, with only the resolved IPs of `api.github.com` added to the allowed set:

<Terminal source="./files/terminal-firewall-check.txt" typewriter />

`example.com` times out, `api.github.com` answers `200`. That is the entire guarantee: the agent can reach what you explicitly allowed, and nothing else.

<AlertBox variant="note" title="A minimal reproduction, not the production script">
This is a stripped-down version of the check, built to demonstrate the mechanism directly — not a copy of Symfony Docker's actual `init-firewall.sh`, which also handles DNS interception via `dnsmasq` and CDN IP rotation. The full script lives in the [Symfony Docker repository](https://github.com/dunglas/symfony-docker/blob/main/docs/agents.md).
</AlertBox>

## What Changed in Symfony Docker

A few months ago, Claude Code was added as the default AI coding agent in [Symfony Docker](https://github.com/dunglas/symfony-docker) — the Docker setup powering many Symfony and FrankenPHP projects. The integration made sense at first glance: a ready-to-use agent, already wired into the Dev Container, zero setup friction.

Then it was removed.

The new setup ships no agent at all. Instead, the project now includes a [documentation guide](https://github.com/dunglas/symfony-docker/blob/main/docs/agents.md) explaining how to add one. OpenCode is explicitly recommended — because it is open source and supports both local and remote models out of the box. Claude Code is still documented as an option, but it is no longer the default.

## A Default Is Never Neutral

When a project pre-installs an agent, it is not just saving you a `npm install`. It is making a choice *on your behalf* — which vendor gets access to your code, which country your data flows through, which pricing model your workflow ends up locked into. Thousands of developers who clone that repo and hit "Rebuild Container" never stop to ask the question, because the question was already answered for them.

Kévin Dunglas's reversal is a small but deliberate act in the opposite direction. The complexity does not disappear — you still have to configure something — but the *decision* is now yours. And as someone who has spent a lot of time running <Link to="/blog/ollama-installation">Ollama locally</Link> precisely because I want to keep my code and prompts off external servers, I appreciate that enormously.

There is also a political dimension worth naming. The current uncertainty around US data sovereignty is pushing a lot of European developers to reconsider which cloud providers they trust for what. Defaulting to an open-source agent that runs entirely on your own hardware is one answer to that question.

## Installation

### Installing OpenCode in Your Dev Container

OpenCode is a terminal-first AI coding agent, open source, built around a model-agnostic provider system. Think of it as Claude Code's younger, more flexible sibling — without the vendor lock-in.

The official guide recommends installing the CLI via `postCreateCommand` and adding the VS Code extension. Edit your `.devcontainer/devcontainer.json`:

```json title=".devcontainer/devcontainer.json"
{
  "postCreateCommand": "npm install -g intelephense && curl -fsSL https://opencode.ai/install | bash",
  "customizations": {
    "vscode": {
      "extensions": [
        "sst-dev.opencode",
        "bmewburn.vscode-intelephense-client",
        "xdebug.php-debug"
      ]
    }
  }
}
```

After a container rebuild, run `opencode` from the integrated terminal or open the OpenCode panel in VS Code.

<AlertBox variant="note" title="No Dev Container feature yet">
There is no official Dev Container feature for OpenCode yet, which is why the CLI install lands in `postCreateCommand` rather than the cleaner `features` block. This will likely change as the project matures.
</AlertBox>

### Using a Local Ollama Model

This is where it gets interesting — and very relevant to anyone already running <Link to="/blog/accessing-ollama-across-your-local-network">Ollama on their local network</Link>.

When you work inside a Dev Container, your host machine is reachable through the special hostname `host.docker.internal`. Symfony Docker already maps this in `compose.override.yaml`, so you do not need to do anything special for network access.

Point OpenCode at your local Ollama instance by setting the endpoint in your `~/.config/opencode/opencode.json`:

```json title="~/.config/opencode/opencode.json"
{
  "$schema": "https://opencode.ai/config.json",
  "model": "local/qwen3:8b",
  "provider": {
    "local": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "local",
      "options": {
        "baseURL": "http://host.docker.internal:11434/v1"
      },
      "models": {
        "qwen3:8b": {
          "name": "qwen3:8b",
          "reasoning": true,
          "tools": true
        }
      }
    }
  }
}
```

Replace `qwen3:8b` with whatever model you have pulled locally. You can stack multiple providers in the same config — your local Ollama setup alongside Anthropic or Mistral — and switch between them on demand. No data leaves your machine when using a local model, and this continues to work even when the network sandbox is enabled (private network ranges and the host gateway are explicitly allowed through).

### Using a Remote Model

For remote providers (Anthropic, OpenAI, OpenRouter…), you set the API key as documented by OpenCode and add the provider's domain to the firewall allowlist if you are running the network sandbox. The configuration is provider-specific; see the OpenCode providers documentation for the exact keys.

## More Demos

### Setting Up the Full Network Sandbox

The demo above proved the mechanism. Wiring the real Symfony Docker version into your Dev Container takes four steps:

**1. Add the required tools to the dev image.** Edit the `frankenphp_dev` stage in your `Dockerfile` to install `iptables`, `ipset`, `dnsmasq`, `iproute2`, `aggregate`, `dnsutils`, and `jq`, plus a `nonroot` user with sudo rights limited to the firewall script alone.

**2. Grant the `NET_ADMIN` capability.** In `.devcontainer/compose.devcontainer.yaml`:

```yaml title=".devcontainer/compose.devcontainer.yaml"
services:
  php:
    cap_add:
      - NET_ADMIN
```

**3. Save the firewall script** as `.devcontainer/init-firewall.sh`. The full script is [in the Symfony Docker repository](https://github.com/dunglas/symfony-docker/blob/main/docs/agents.md); it fetches GitHub IP ranges at startup and locks down everything else. The default allowlist covers GitHub, npm, Packagist, jsDelivr, and the VS Code marketplace — extend it by adding domains to the `ipset=` line in `/etc/dnsmasq.d/firewall-ipset.conf`.

**4. Wire it into `postStartCommand`:**

```json title=".devcontainer/devcontainer.json"
{
  "postStartCommand": "sudo /app/.devcontainer/init-firewall.sh"
}
```

<AlertBox variant="warning" title="Autonomous mode only makes sense with the sandbox on">
Without the network sandbox, letting an agent run autonomously is a leap of faith. With it, you have a hard boundary: the agent can reach your approved domains and nothing else, exactly as demonstrated above.
</AlertBox>

Once the sandbox is running, you can enable autonomous mode for Claude Code via `devcontainer.json` settings:

```json
{
  "claudeCode.allowDangerouslySkipPermissions": true,
  "claudeCode.initialPermissionMode": "bypassPermissions"
}
```

Or from the terminal for a single session: `claude --dangerously-skip-permissions`. The same principle applies to OpenCode's autonomous mode.

## Under the Hood (skip this if you just want to use it)

### Without VS Code

The Dev Container specification is not exclusive to VS Code. The same `devcontainer.json` works with JetBrains IDEs (via the Dev Containers plugin), GitHub Codespaces, and the `devcontainer` CLI. The `customizations.vscode.extensions` entries are simply ignored by non-VS Code tools, while the `postCreateCommand` agent install still runs. This is worth remembering if your team is split across editors — you write the config once, and everyone benefits from the same sandbox regardless of their IDE.

<AlertBox variant="tip" title="One image, two environments">
If you are already using a shared production/devcontainer image setup — the pattern covered in <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers</Link> — you only need to add the firewall tooling to the `_dev` stage of your multi-stage build, not the production image.
</AlertBox>

## Conclusion

What Kévin Dunglas did is easy to underestimate: he removed a convenience feature in order to return a decision to the developer. That is actually harder than shipping a default. Defaults reduce friction; guides require intent.

If you are already running Ollama locally, the path of least resistance is clear — point OpenCode at `host.docker.internal:11434`, pick a model that supports tool use, and you have an agent that costs nothing per token and sends no code to any third party. Add the network sandbox when you want to run it autonomously, and you have something genuinely trustworthy.

The agent is yours to choose. The boundary is yours to draw. That is exactly how it should be.
