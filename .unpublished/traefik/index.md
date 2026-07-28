---
slug: traefik
title: "Traefik, Finally Understood: One Name Per Docker Service Instead of One Port"
authors: [christophe, claude]
image: /img/v2/workflows.webp
mainTag: docker
tags: [docker, self-hosted, security]
date: 2026-12-31
description: "Traefik is a reverse proxy that watches the Docker socket and routes by hostname instead of port, reacting to container labels with no config file to reload. This article breaks it down to the four concepts that actually matter — entrypoints, providers, routers, services — then wires it up in front of Portainer and Open WebUI on a real home network."
language: en
ai_assisted: true
draft: true
---

![Traefik, Finally Understood: One Name Per Docker Service Instead of One Port](/img/v2/workflows.webp)

<!-- cspell:ignoreCase traefik htpasswd mkcert websecure entrypoints middlewares serversTransport loadbalancer arpa openwebui -->

<TLDR>
Traefik is a reverse proxy that watches the Docker socket the same way lazydocker and Portainer do, but instead of showing you containers, it routes HTTP requests to them — by hostname, not by port — reacting live to labels on each container with nothing to reload. This article skips straight past "here's a YAML file, copy it" and builds the four-concept mental model that actually explains *why* those labels work, then applies it to two real services already running on my LAN: <Link to="/blog/portainer">Portainer</Link> and Open WebUI from <Link to="/blog/ollama-installation">my Ollama article</Link>.
</TLDR>

I've set Traefik up three separate times over the years. Each time, I copied a working example, changed a few values, watched it work, and moved on — without ever quite understanding *why* the labels did what they did. Each time, a month later, I'd forgotten everything and started from a fresh copy-paste. If that sounds familiar, this article is the one I wish I'd written the first time: not another recipe to copy, but the small set of ideas that makes every recipe make sense afterward.

<!-- truncate -->

## The Problem It Actually Solves

Right now, on my LAN, every Docker service I run lives at its own IP:port combination: Ollama's API on `11434`, Open WebUI on `4000`, <Link to="/blog/portainer">Portainer</Link> on `9443`, this Docusaurus dev server on `3000`. Each one is a fact I have to remember, or look up, or bookmark. Add a new service, and it's one more port competing for a number I haven't used yet.

Traefik's job is to sit in front of all of them, be the *only* thing listening on the standard web ports (`80`/`443`), and decide where each incoming request actually goes based on the hostname the browser asked for — `portainer.home.arpa` goes one place, `ollama.home.arpa` goes another, all through the exact same door.

## Four Concepts, Not a Config File

Every Traefik tutorial throws a chunk of labels at you before explaining what they mean. Here's the meaning first.

<StepsCard
  variant="steps"
  title="The four ideas behind every Traefik label"
  steps={[
    { content: "**Entrypoints** — the ports Traefik itself listens on. Two, almost always: `web` (`:80`) and `websecure` (`:443`)." },
    { content: "**Providers** — where Traefik gets its routing rules from. The Docker provider watches the Docker socket and reacts to container labels directly — no file to edit, no reload to trigger." },
    { content: "**Routers** — a rule (`Host(...)`, `PathPrefix(...)`) deciding *which* incoming requests this entry matches." },
    { content: "**Services** — the actual backend: which container, which port, forwarded to once a router matches." }
  ]}
/>

<AlertBox variant="coreConcept" title="The actual 'aha'">
A label on a container isn't configuration *for* Traefik — it *is* a router-plus-service definition. You're not editing Traefik when you add a label; you're telling the Docker provider "here's one more thing to notice." That's the entire trick behind "no restart needed."
</AlertBox>

## Setting Traefik Up

As always, a dedicated folder: `mkdir -p ~/tools/traefik/dynamic ~/tools/traefik/certs && cd ~/tools/traefik`.

First, a shared Docker network — this is what lets Traefik reach containers defined in *other* compose projects (Portainer's, Open WebUI's) without them all living in one giant file:

<Terminal title="user@docker-host: ~/tools/traefik">
$ docker network create proxy
</Terminal>

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />

<AlertBox variant="highlyImportant" title="Same socket-sharing principle, read-only this time">
`/var/run/docker.sock` is mounted for the same Docker-out-of-Docker reason as in <Link to="/blog/docker-out-of-docker-dood">my DooD article</Link> and every other tool in this mini-series — but here it's mounted `:ro`. Traefik only needs to *read* container labels, never to start, stop or remove anything, so read-only is the correct level of access, not just an extra-cautious one.
</AlertBox>

<AlertBox variant="note" title="exposedbydefault=false matters">
Without this flag, Traefik would auto-create a router for *every* container on the `proxy` network the moment it joins, whether you labeled it or not. Setting it to `false` flips that around: nothing is routed unless it explicitly opts in with `traefik.enable=true`. Small flag, big difference in what "the aha" from earlier actually protects you from.
</AlertBox>

### The Dashboard, Behind Real Auth

The command args above enable `--api.dashboard=true`, but notice there's no `--api.insecure=true` anywhere — that flag exposes the dashboard with zero authentication, which is fine for a five-minute test and a bad idea for anything left running. Instead, the dashboard gets its own router (`dashboard@internal`) with a basic-auth middleware attached, same as any other proxied service.

Generate the password hash (needs `htpasswd`, from the `apache2-utils` package):

<Terminal title="user@docker-host: ~/tools/traefik" wrap={true}>
$ htpasswd -nB admin
New password:
Re-type new password:
admin:$2y$05$K3nJk9x...
</Terminal>

<AlertBox variant="caution" title="Escape every dollar sign">
Compose files treat `$` as the start of a variable substitution. Paste the hash straight from `htpasswd` into `compose.yaml` and every `$` needs to become `$$`, or Compose silently mangles the hash into something that will never match your password. The placeholder in the snippet above already shows the doubled form — replace it with your own hash, doubled the same way.
</AlertBox>

### A Locally-Trusted Certificate

Browsers don't trust self-signed certificates, and Traefik generates one for itself by default — fine for testing, an ignorable-but-annoying warning for daily use. [mkcert](https://github.com/FiloSottile/mkcert) fixes that cheaply: it creates a local Certificate Authority, adds it to your system's trust store once, and issues certificates your browser accepts without complaint.

<Terminal title="user@docker-host: ~/tools/traefik" wrap={true}>
$ mkcert -install
$ mkcert -cert-file certs/home-arpa.pem -key-file certs/home-arpa-key.pem "*.home.arpa"
</Terminal>

This is exactly what the `providers.file` block in the command args is for — a *second* provider, running alongside the Docker one, for the one piece of config (the certificate) that isn't tied to any single container's labels:

<Snippet filename="dynamic/tls.yaml" source="./files/dynamic/tls.yaml" />

Bring Traefik up: `docker compose up --detach`.

## Routing a Real Service: Open WebUI

Back in `~/tools/ollama` — the folder from <Link to="/blog/ollama-installation">my Ollama article</Link> — the `open-webui` service needs two additions: join the `proxy` network, and carry the labels that describe its router and service.

<Snippet filename="compose_webui.yaml (excerpt)" source="./files/labels-openwebui.yaml" />

`docker compose up --detach` again in that folder, add `ollama.home.arpa` to your hosts file pointing at the Docker host's LAN IP (the same `192.168.0.218` from <Link to="/blog/accessing-ollama-across-your-local-network">that network article</Link>), and `https://ollama.home.arpa` now reaches Open WebUI — no port number, no security warning, over TLS.

## Routing a Trickier One: Portainer

Open WebUI was the easy case: Traefik terminates TLS, and talks to the backend over plain HTTP on port `8080` internally. <Link to="/blog/portainer">Portainer</Link> is one wrinkle harder — its backend only speaks HTTPS, with its own self-signed certificate, on `9443`.

<Snippet filename="compose.yaml (excerpt)" source="./files/labels-portainer.yaml" />

<AlertBox variant="important" title="Why loadbalancer.server.scheme and serversTransport show up here">
This is the **Services** concept from earlier, just with one more knob: telling Traefik the backend itself is HTTPS (`scheme=https`), and that its certificate won't validate against any public authority, so skip that check for *this one backend* (`serversTransport` + `insecureskipverify`). It's not a new idea — it's the same "which container, which port" service definition, extended to say "and by the way, speak HTTPS to it, and don't worry about its cert."
</AlertBox>

Same pattern: bring the stack back up, add `portainer.home.arpa` to your hosts file, and `https://portainer.home.arpa` replaces the raw `https://<host>:9443` you'd been typing (or bookmarking) since the previous article.

## Making the Hostnames Resolve

None of this works until something resolves `ollama.home.arpa` and `portainer.home.arpa` to your Docker host's LAN IP. The direct fix is one line in `/etc/hosts` (or, from WSL, the Windows hosts file) covering every hostname you've routed:

```text title="/etc/hosts"
192.168.0.218  traefik.home.arpa ollama.home.arpa portainer.home.arpa
```

That's the whole trick — one IP, several names, and Traefik itself sorts out which container each name actually belongs to based on the `Host()` rule in its labels. A router-per-device solution like Pi-hole's local DNS would do this automatically for every device on the network instead of one `/etc/hosts` file at a time, but that's a separate rabbit hole for a separate article.

## The Dashboard, as the Debugging Tool

Browse to `https://traefik.home.arpa` (basic-auth prompt, then the dashboard) to see exactly what Traefik discovered: every router, which rule it matched, which service it points to, and whether that service is currently reporting healthy. When a label typo means a route silently doesn't work, this page — not guessing, not re-reading YAML — is where the answer actually is.

## Three Tools, One Socket

<AlertBox variant="info" title="lazydocker, Portainer, Traefik — same socket, three jobs">
All three tools in this mini-series read from the same Docker socket, and none of them replace another. <Link to="/blog/lazydocker">lazydocker</Link> answers "what's happening right now, from my terminal." <Link to="/blog/portainer">Portainer</Link> answers the same question from a browser, for anyone. Traefik doesn't answer that question at all — it answers "how does a request even find the right container," so the other two (and everything else) get one clean hostname instead of one more port to remember.
</AlertBox>

## Key Takeaways

<StepsCard
  variant="remember"
  title="Traefik quick reference"
  steps={[
    { content: "**A label is a router+service definition**, not configuration for a separate config file — that's what makes label-based routing reload-free" },
    { content: "**`exposedbydefault=false`** — nothing gets routed unless a container explicitly opts in with `traefik.enable=true`" },
    { content: "**Two entrypoints cover almost everything** — `web` (:80) and `websecure` (:443); everything else is a router rule choosing between backends" },
    { content: "**Two providers can run together** — Docker for container-driven routes, file for the one static piece (the TLS certificate) that isn't tied to any container" },
    { content: "**A self-signed backend needs `serversTransport`** — one extra line on the service definition, not a new concept" }
  ]}
/>

## Conclusion

The part that finally made Traefik click wasn't a longer YAML file — it was realizing there are only four ideas underneath all of it, and that a label is just a compact way of writing two of them (a router and a service) directly onto the container they describe. Everything past that — the dashboard auth, the certificate, the self-signed backend wrinkle — is an extension of the same four ideas, not a fifth one. Now, every new container I stand up gets one `Host()` label instead of one more port I'd otherwise have to remember, or explain to someone else over chat.
