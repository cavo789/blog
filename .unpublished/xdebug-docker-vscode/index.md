---
slug: xdebug-docker-vscode
title: "Step-Through PHP Debugging in a Docker Container From VSCode"
authors: [christophe, claude]
image: /img/v2/php_tips.webp
mainTag: php
tags: [php, docker, vscode]
date: 2026-12-31
description: "Add real step-through debugging — breakpoints, variable inspection, step-over/into — to a Dockerized PHP setup, wired into VSCode. The one piece missing from my existing PHP devcontainer articles, and the reason I was still adding var_dump() and rebuilding for far too long."
language: en
ai_assisted: true
draft: true
---

![Step-Through PHP Debugging in a Docker Container From VSCode](/img/v2/php_tips.webp)

<!-- cspell:ignoreCase xdebug pecl -->

<TLDR>
This article adds [Xdebug](https://xdebug.org/) 3.x to a Dockerized PHP setup and wires it into VSCode for real step-through debugging — breakpoints, variable inspection, step-over/into — instead of `var_dump()` and a container rebuild. It builds directly on [my PHP devcontainer article](/blog/php-devcontainer): same base image, three additions (the Xdebug extension, an ini file, and a `launch.json`), plus the one Docker networking detail — `host.docker.internal` — that trips up almost everyone the first time.
</TLDR>

I have [an entire article on setting up a PHP devcontainer](/blog/php-devcontainer) and [another on VSCode with preinstalled code quality tools](/blog/vscode-devcontainer), and somehow neither one covers actually stepping through code. For longer than I'd like to admit, my debugging process inside these containers was `var_dump($variable); die();`, rebuild, refresh, repeat — in a setup that already had everything else configured properly. That gap stops today.

<!-- truncate -->

## The Three Pieces

Getting step debugging working in a container reliably comes down to three things lining up: the extension has to be installed and enabled, it has to know where to *send* the debug session, and your IDE has to be listening on the port it sends to. Get one wrong and nothing happens — no error, just silence, which is exactly what makes this fiddly the first time.

## Demo

A small script with a breakpoint on the accumulation line:

<Snippet filename="index.php" source="./files/index.php" defaultOpen={false} />

In VSCode: click the "Run and Debug" icon, select **Listen for Xdebug**, press F5 — the status bar turns orange, listening. Set a breakpoint on the `$total += ...` line, then trigger the script:

<Terminal source="./files/terminal_xdebug.txt" typewriter />

VSCode stops on the breakpoint, `$total`, `$item`, and the full call stack become inspectable in the sidebar exactly like debugging a script running locally — except it's genuinely executing inside the container. The `xdebug.log` output (temporarily uncommented from the ini file below) is the fastest way to confirm the connection actually happened when something isn't stopping as expected.

## 1. Installing Xdebug

Add this to [the Dockerfile from my devcontainer article](/blog/php-devcontainer), before the final `USER` switch:

<Snippet filename="Dockerfile (addition)" source="./files/Dockerfile" defaultOpen={true} />

<Snippet filename="xdebug.ini" source="./files/xdebug.ini" defaultOpen={true} />

A few directives worth understanding, since Xdebug 3 renamed most of them from Xdebug 2 and half the outdated advice online still uses the old names:

- `xdebug.mode = debug,develop` — Xdebug does several jobs (profiling, tracing, coverage); `debug` is specifically step debugging, `develop` adds better stack traces on errors.
- `xdebug.start_with_request = yes` — attempt a debug connection on every request. The old `xdebug.remote_autostart`/`remote_enable` pair from Xdebug 2 doesn't exist anymore.
- `xdebug.client_host` / `xdebug.client_port` — where Xdebug connects **to** (your IDE), not where it listens. Port `9003` is the Xdebug 3 default — Xdebug 2 used `9000`, which is the single most common cause of "it used to work" after an upgrade.

## 2. The Docker Networking Detail

`xdebug.client_host = host.docker.internal` tells the container to connect back to the host machine, where VSCode is listening. On Docker Desktop (Mac/Windows) that hostname resolves automatically. On native Linux, and inside WSL2, it doesn't — unless the compose file says so explicitly:

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />

<AlertBox variant="important" title="Skip this and the connection silently fails">
Without `extra_hosts`, `host.docker.internal` doesn't resolve on Linux/WSL2 at all — Xdebug tries to connect, can't resolve the hostname, and gives up with nothing visible in your browser or terminal. This one line is the difference between "just works" and twenty minutes of confusion.
</AlertBox>

## 3. VSCode Configuration

Install the [PHP Debug](https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug) extension (published by Xdebug itself), then add this to `.vscode/launch.json`:

<Snippet filename=".vscode/launch.json" source="./files/launch.json" defaultOpen={true} />

<AlertBox variant="caution" title="pathMappings is where most setups actually break">
The container sees `/var/www/html`; VSCode, running on your host, sees `${workspaceFolder}`. Without `pathMappings` telling VSCode these are the same file, breakpoints show as set but are never hit — the debugger connects fine, it just can't match the file paths. If step debugging connects but nothing ever stops, this mapping is the first thing to check.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="Xdebug + Docker + VSCode quick reference"
  steps={[
    { content: "**Xdebug 3 renamed everything** — `client_host`/`client_port`/`start_with_request`, not the Xdebug 2 names still floating around in old tutorials" },
    { content: "**Port 9003, not 9000** — the Xdebug 3 default; upgrading from 2 without updating this is the classic silent failure" },
    { content: "**`extra_hosts` on Linux/WSL2** — `host.docker.internal` needs `host-gateway` explicitly; Docker Desktop hides this requirement" },
    { content: "**`pathMappings` is mandatory** — container path vs `${workspaceFolder}`, or breakpoints are set but never hit" },
    { content: "**`xdebug.log` is the fastest diagnostic** — confirms whether the container ever reached your IDE at all" }
  ]}
/>

## Conclusion

Four small pieces — an extension, an ini file, one Docker networking line, one VSCode config block — and the debugging workflow I already have for anything running locally now works identically inside the container from [my PHP devcontainer setup](/blog/php-devcontainer). `var_dump()` still has its place for a two-second check, but for anything more involved than that, stepping through the actual execution beats guessing from print statements every time — it always did, I just hadn't wired it up.
