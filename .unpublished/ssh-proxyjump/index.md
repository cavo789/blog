---
slug: ssh-proxyjump
title: "SSH ProxyJump — Reach Servers Behind a Bastion, Tunnel Any Port"
description: "ProxyJump lets you SSH through a bastion host in a single command. LocalForward maps a remote port to localhost so your local tools connect as if the server were next to you. A ZSH function with fzf makes opening named tunnels one keypress away."
authors: [christophe, claude]
image: /img/v2/sshf.webp
mainTag: ssh
draft: true
tags: [fzf, linux, ssh, zsh]
date: 2026-09-08
ai_assisted: true
---

![SSH ProxyJump — Reach Servers Behind a Bastion, Tunnel Any Port](/img/v2/sshf.webp)

<TLDR>
`ProxyJump` in `~/.ssh/config` lets you SSH through a bastion host transparently — one command, no manual intermediate step. `LocalForward` maps a port on the remote network to a local port, so your database client, browser, or API tool connects as if the service were running on your machine. A small ZSH function with fzf (`stun`) lets you open any named tunnel interactively.
</TLDR>

Your target server isn't reachable from the internet. It's on an internal network behind a bastion host. To connect, you normally SSH to the bastion, then SSH again to the internal server — two commands, two authentications, two sessions to manage.

`ProxyJump` collapses that into one.

<!-- truncate -->

## The old way vs ProxyJump

**Before:** two hops manually.

<Terminal>
ssh christophe@bastion.example.com
# now on bastion
ssh christophe@10.0.1.50
</Terminal>

**With ProxyJump:** one command, ssh handles the relay transparently.

<Terminal>
ssh -J christophe@bastion.example.com christophe@10.0.1.50
</Terminal>

`-J` is the flag, `bastion` is the jump host, and `10.0.1.50` is the final destination. Your SSH key is used for both hops if agent forwarding is set up. The bastion never decrypts your traffic to the final destination — it just relays the TCP connection.

## Configuring ProxyJump in ~/.ssh/config

Typing the full `-J` flag every time is tedious. Define it once in `~/.ssh/config`:

<Snippet source="./files/ssh_config" language="ssh-config" />

With this config, connecting to an internal server is simply:

<Terminal>
ssh dev-server
</Terminal>

SSH reads the `ProxyJump bastion` directive, connects to `bastion` first (using the `Host bastion` block for its settings), then forwards the connection to `10.0.1.50`. You authenticate once with your key and land directly on the internal server.

<AlertBox type="tip" title="Multiple jump hops">
You can chain multiple bastion hosts: `ProxyJump bastion1,bastion2`. SSH connects through them in order. Useful for networks with layered access control.
</AlertBox>

## LocalForward — map a remote port to localhost

`ProxyJump` gives you a shell on the remote server. `LocalForward` goes further: it maps a port on the remote network to a port on your local machine, so any local tool can connect to the remote service directly.

The classic use case is a database behind a bastion. Your local `psql`, DBeaver, or TablePlus sees the remote PostgreSQL as if it were running locally.

<Terminal>
ssh -N -L 5433:db-staging.internal:5432 christophe@bastion.example.com
</Terminal>

- `-N` means "no shell" — open the tunnel only, don't start an interactive session
- `-L 5433:db-staging.internal:5432` means: forward local port `5433` to `db-staging.internal:5432` as seen from the bastion
- The tunnel stays open until you press `Ctrl+C`

With the tunnel open, connect from your machine:

<Terminal>
psql -h localhost -p 5433 -U myuser mydb
</Terminal>

Your database client connects to `localhost:5433`, which SSH forwards through the bastion to the real database. No VPN. No port opened on the database server itself.

## Tunnel shortcuts in ~/.ssh/config

The `Host tunnel-*` blocks in the config above encode each tunnel as a named SSH host:

```
Host tunnel-db-staging
    HostName bastion.example.com
    User christophe
    LocalForward 5433 db-staging.internal:5432
    ExitOnForwardFailure yes
    ServerAliveInterval 30
    ServerAliveCountMax 3
```

Open the staging database tunnel:

<Terminal>
ssh -N tunnel-db-staging
</Terminal>

`ExitOnForwardFailure yes` closes the tunnel if the port forward can't be established — you immediately know it failed instead of having a silent dead tunnel. `ServerAliveInterval` sends keepalive packets so the tunnel survives idle periods without being dropped by a firewall.

## The stun function — interactive tunnel picker with fzf

With several tunnels defined, opening the right one means remembering names. A small ZSH function with fzf solves this:

<Snippet source="./files/stun.zsh" language="zsh" />

Install it alongside your other ZSH functions (for example in `~/.zsh/fns/` if you use the <Link to="/blog/modular-zsh-workflow">modular ZSH workflow</Link>):

<Terminal>
# Add to ~/.zshrc or autoload from ~/.zsh/fns/
source ~/.zsh/fns/stun.zsh
</Terminal>

Usage:

<Terminal>
stun
</Terminal>

```
  db-production
> db-staging
  redis-staging
  webapp-dev
──────────────────────────
  ssh -N bastion -L 5433:db-staging.internal:5432
```

Select a tunnel with arrows, press `Enter`. The preview line shows the exact `ssh` command that will run. Press `Ctrl+C` to close the tunnel when done.

Or open a tunnel by name directly:

<Terminal>
stun db-staging
</Terminal>

## Running tunnels in the background

Sometimes you want a tunnel to run without holding a terminal. Use `ssh -fN` to fork into the background:

<Terminal>
ssh -fN tunnel-db-staging
</Terminal>

To find and kill it later:

<Terminal>
# Find the SSH process for this tunnel
ps aux | grep "tunnel-db-staging"

# Or find by port
lsof -i :5433

# Kill it
kill <PID>
</Terminal>

<AlertBox type="tip" title="Foreground tunnels are easier to manage">
Background tunnels are convenient but can become forgotten zombies holding open connections. For most use cases, a foreground `ssh -N` in a dedicated terminal pane (or a Windows Terminal split pane) is easier to reason about — you see it, you know it's running, Ctrl+C closes it cleanly.
</AlertBox>

## Dynamic forwarding — SOCKS proxy

For situations where you need to access many remote services without defining a `LocalForward` for each one, use `-D` (dynamic forwarding) to create a SOCKS proxy:

<Terminal>
ssh -N -D 1080 christophe@bastion.example.com
</Terminal>

Point your browser or application to `localhost:1080` as a SOCKS5 proxy. All traffic routes through the bastion, and you can reach any host visible from the bastion's network.

## How this fits with the rest of your SSH setup

This article builds on the <Link to="/blog/ssh-with-fuzzy-finder">fzf SSH host selector</Link> (`ssh_with_fzf`) — that function handles interactive SSH connections; `stun` handles tunnel management. The two complement each other: `ssh_with_fzf` to open a shell on a server, `stun` to open a port forward to a service.

For ZSH autosuggestions that complete your `~/.ssh/config` hostnames as you type, see <Link to="/blog/zsh-plugin-ssh-config-suggestions">SSH autosuggestions with ZSH</Link>. All the `Host` blocks defined above — `tunnel-db-staging`, `dev-server`, etc. — will appear as suggestions when you type `ssh t` or `stun d`.

## Conclusion

`ProxyJump` removes the two-step dance to reach internal servers. `LocalForward` brings remote services to `localhost` so your existing tools work without modification. Together they cover almost every "I need to access something I shouldn't have direct access to" scenario — without a VPN, without opening extra firewall rules, and without installing anything beyond what SSH already provides.

Define your bastion and tunnels in `~/.ssh/config` once, add the `stun` function for interactive selection, and stop typing IP addresses.
