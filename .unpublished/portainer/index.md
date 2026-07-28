---
slug: portainer
title: "Portainer: A Web Dashboard for Docker, One Compose File Away"
authors: [christophe, claude]
image: /img/v2/docker_gui.webp
mainTag: docker
tags: [docker, self-hosted]
date: 2026-12-31
description: "Portainer is a browser-based dashboard for Docker: containers, images, volumes, networks and stacks, reachable from any device on the LAN. This article sets it up with the official Community Edition image and compares it to the terminal-based lazydocker from the previous article — same information, different room."
language: en
ai_assisted: true
draft: true
---

![Portainer: A Web Dashboard for Docker, One Compose File Away](/img/v2/docker_gui.webp)

<!-- cspell:ignoreCase portainer -->

<TLDR>
[Portainer](https://www.portainer.io/) Community Edition is a self-hosted web dashboard for Docker — containers, images, volumes, networks, and full stacks deployed straight from a pasted `compose.yaml`. It runs from a single official image, needs nothing built, and is reachable from any browser on the LAN instead of only from the terminal that's currently open. This article sets it up and draws the line between it and <Link to="/blog/lazydocker">lazydocker</Link>: same underlying information, but one lives in a terminal pane and the other lives at a URL.
</TLDR>

<Link to="/blog/lazydocker">lazydocker</Link> solved the "let me just look at everything" reflex — but only from a terminal that's already open, on the machine I'm sitting at. Two situations it doesn't cover: pointing a teammate at a container without SSH-ing them into my machine and explaining which pane is which, or checking whether a container's still healthy from my phone, on the couch, nowhere near a terminal. Both of those want a URL, not a keybinding.

<!-- truncate -->

## What Portainer Actually Is

Portainer CE is the same category of tool as lazydocker — a dashboard over containers, images, volumes and networks, with live logs and stats — built as a web application instead of a terminal UI. It auto-detects the "local" Docker environment through the same socket lazydocker uses, and adds one thing lazydocker doesn't attempt: **Stacks**, a page where you paste a `compose.yaml` and Portainer deploys it for you, no `docker compose up` on a keyboard required.

## Setting It Up

No custom `Dockerfile` this time — Portainer ships an official, ready-to-run image, so a `compose.yaml` is the whole job.

Create the folder: `mkdir -p ~/tools/portainer && cd $_`

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />

<AlertBox variant="highlyImportant" title="Same socket-sharing principle, no image to build">
`/var/run/docker.sock` is mounted here for the exact reason explained in <Link to="/blog/docker-out-of-docker-dood">my Docker-out-of-Docker article</Link> — Portainer needs to reach the host's Docker daemon to show or manage anything. The difference from that article's walkthrough (and from <Link to="/blog/lazydocker">lazydocker</Link>'s own `Dockerfile`) is that there's no image to build here at all; the official `portainer-ce` image already bundles everything it needs.
</AlertBox>

Bring it up: `docker compose up --detach`.

## First Run

Browse to `https://<host>:9443` — replacing `<host>` with `localhost` on the same machine, or the LAN IP from <Link to="/blog/accessing-ollama-across-your-local-network">my Ollama-over-the-network article</Link> from another device. The browser will complain about a self-signed certificate; that's expected, since Portainer generates its own on first boot. Accept the warning and continue.

<AlertBox variant="caution" title="Set the admin password quickly">
Portainer gives you a short window (a few minutes) to create the initial admin account before it locks that endpoint down for security. If you get distracted and miss it, the fix is a container restart (`docker compose restart`), not a reinstall — but it's one avoidable annoyance either way.
</AlertBox>

Once logged in, Portainer connects to the "local" environment automatically — it's the same Docker socket you just mounted, nothing to configure.

## A Tour: Containers, Stacks, and a Real Deploy

The **Containers** list mirrors lazydocker's container pane: status, image, ports, one click into live logs or a stats graph. The **Images**, **Volumes** and **Networks** pages do the same for their respective resources.

The one page lazydocker has no equivalent for is **Stacks**. Click *Add stack*, name it, and paste in the exact `compose.yaml` from <Link to="/blog/ollama-installation">my Ollama installation article</Link> — Portainer deploys it as if you'd run `docker compose up` yourself, and from then on that stack shows up as a single manageable unit instead of a loose container.

<AlertBox variant="tip" title="Good for onboarding, not for source of truth">
Deploying via pasted YAML is convenient for spinning something up fast, but the actual `compose.yaml` files still live in `~/tools/*` on disk, tracked the way I've always tracked them. Treat Portainer's Stacks editor as a launcher and inspector, not as the place those files permanently live.
</AlertBox>

## lazydocker vs Portainer

<AlertBox variant="info" title="Same data, different room">
Reach for <Link to="/blog/lazydocker">lazydocker</Link> when you're already at a terminal and want the fastest possible glance — no browser tab, no login screen. Reach for Portainer when the person who needs to see this isn't you, isn't at your machine, or isn't comfortable in a terminal at all. Both read from the exact same Docker socket; neither is more "correct" than the other.
</AlertBox>

## A Word on Exposure

Portainer's own login screen is real authentication — unlike Ollama's bare API, which <Link to="/blog/anythingllm-chat-with-your-docs">I flagged before</Link> as having none at all. Still, `9443` reachable only from your LAN is a very different exposure than `9443` reachable from the internet. If you ever want to check on containers from outside the house, put it behind the same mesh VPN (Tailscale, WireGuard) rather than forwarding the port on your router.

## Key Takeaways

<StepsCard
  variant="remember"
  title="Portainer quick reference"
  steps={[
    { content: "**Official image, no build step** — `portainer/portainer-ce:lts` plus the Docker socket is the whole setup" },
    { content: "**Create the admin account promptly** — the initial setup window is short; a missed one just needs a restart" },
    { content: "**Stacks deploy compose.yaml through the browser** — convenient for a quick launch, but the files on disk stay the source of truth" },
    { content: "**Pick per audience** — lazydocker for yourself at a terminal, Portainer for anyone else, or yourself from a phone" },
    { content: "**Keep it LAN-only or behind a VPN** — its login is real auth, but that's not a reason to expose it to the internet directly" }
  ]}
/>

## Conclusion

Between <Link to="/blog/lazydocker">lazydocker</Link> and Portainer, I now have the same Docker visibility from two different rooms — a terminal pane when it's just me, a browser tab when it isn't. What's still missing is a name for either of them: right now both sit behind a raw port on a raw IP I have to remember or look up. That's the piece the next article closes.
