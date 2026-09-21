---
slug: ssh-config-tips
title: "SSH Config Tips: Global Rules, Aliases, and Automated Logins"
authors: [christophe]
image: /img/v2/ssh.webp
mainTag: ssh
tags: [ssh, linux, windows]
date: 2026-12-21
description: "One wildcard rule routes every server through the bastion, domain stanzas handle usernames, short aliases save typing, and RemoteCommand lands you straight into the right user and directory — with a banner. A single ~/.ssh/config is more powerful than it looks."
draft: true
series: SSH - From your first key to remote development
language: en
ai_assisted: true
---

![SSH Config Tips: Global Rules, Aliases, and Automated Logins](/img/v2/ssh.webp)

<TLDR>
One `Host *` stanza — with the bastion excluded via `!` — covers every server at once: no more repeating `ProxyJump` and `IdentityFile` per alias. Domain stanzas set the right username for full-FQDN connections. Short aliases need their own `User` line. And `RemoteCommand` drops you straight into the right user and directory, with a colored banner, on every connection.
</TLDR>

Every server in my environment is only reachable through the same Windows VM acting as a bastion. The <Link to="/blog/vscode-remote-ssh-proxyjump-devcontainer">ProxyJump and DevContainers article</Link> shows a config with one alias. Add a second server and the config doubles. Add ten and it becomes a maintenance problem: change the bastion hostname once and you rewrite ten stanzas, each carrying the same `ProxyJump` and `IdentityFile` lines.

The config below covers any number of servers with no repetition.

<!-- truncate -->

<Vars
  vmUser="vm-user"
  vmIp="windows-vm-ip"
  sshKey="id_ed25519"
  userA="user-a"
  userB="user-b"
  labels={{
    vmUser: "Bastion/VM username",
    vmIp: "Bastion/VM hostname or IP",
    sshKey: "SSH private key filename",
    userA: "Username on Project A servers",
    userB: "Username on corporate servers",
  }}
/>

## The Config

Create the `C:\Users\your_laptop_user\.ssh\config` (Windows; included WSL) or `~/.ssh/config` (if you're under Linux/macOS) file to your laptop's:

<Snippet title={<>C:\Users\your_laptop_user\.ssh\config · ~/.ssh/config</>} source="./files/ssh_config_optimized.txt" />

Both connection paths work — a short alias and a full FQDN:

<Terminal title="laptop: ~" typewriter>
$ ssh %%alias=project_prod%% "whoami && hostname"
%%userB=user-b%%
server-prod
$ ssh server-test.cloud.project-a.internal "whoami && hostname"
%%userA=user-a%%
server-test
</Terminal>

No `ProxyJump` flag, no explicit key — the config handles both transparently.

## How SSH Reads a Config File

Three rules explain why the <abbr title="each Host block and its directives in a SSH config file is called a 'stanza'">stanzas</abbr> compose without conflict:

- **Multiple stanzas can match.** Running `ssh project_prod` causes SSH to scan the file top-to-bottom and collect settings from *every* `Host` stanza that matches `project_prod`, not just the first one.
- **First value wins per setting.** When two matching stanzas both declare the same directive, the first value is kept. Later stanzas can only fill in settings not yet defined.
- **Patterns match on the command-line argument, not on the resolved hostname.** `Host *.office.corp.example` matches `ssh server-prod.office.corp.example`. It does **not** match `ssh project_prod`, even though `project_prod`'s `HostName` resolves to `server-prod.office.corp.example`.

## The Four Sections

**Section 1 — Bastion definition.** Declares the jump host with its username. No `ProxyJump` here (it would loop back to itself) and no `IdentityFile` (the VM uses whatever auth you have configured for it separately).

**Section 2 — Global rule.** The `!` prefix in `Host * !`<Var name="vmIp">windows-vm-ip</Var> means "all hosts *except* the bastion". This single stanza adds `ProxyJump` and `IdentityFile` to every connection that matches — which is everything except the bastion itself. Adding a new server never touches this section.

**Section 3 — Domain defaults.** These match when you type a full FQDN like `ssh server-prod.office.corp.example`. SSH picks up the `User` from here, since no earlier stanza set it. Multiple domain stanzas with the same username are normal — one per domain suffix. These stanzas are also useful for scripts that construct hostnames programmatically or for `ssh-copy-id` calls.

**Section 4 — Short aliases.** Each alias declares `HostName` (the real FQDN) and `User`. Adding a new server alias is exactly two lines.

## Hardening Section 2 (optional)

Four directives round out the global rule without changing its logic. Add whichever ones fit your environment — none are required for the config to work.

<Snippet title={<>C:\Users\your_laptop_user\.ssh\config · ~/.ssh/config</>} source="./files/ssh_config_section2_full.txt" />

- **`ServerAliveInterval 30` / `ServerAliveCountMax 3`** — SSH sends a keepalive packet every 30 seconds. After 3 unanswered packets (90 seconds of silence), the connection is dropped cleanly rather than hanging with a frozen prompt. Without these, an idle terminal on a corporate server often locks up with no error message.
- **`ControlMaster auto` / `ControlPath` / `ControlPersist 10m`** — SSH multiplexing. The first connection to a server opens a socket file in `~/.ssh/`; every subsequent connection in the same session reuses it instead of negotiating a new tunnel through the bastion. A second `ssh project_prod` tab opens in under a second. The socket stays alive for 10 minutes after the last session closes, then disappears on its own.
- **`ConnectTimeout 5`** — fails after 5 seconds if the server is unreachable. On a corporate network with a reliable bastion, the default 2-minute timeout is pure noise.

## Why Each Alias Needs Its Own `User` Line

The domain stanzas in section 3 set `User` only when SSH matches them — and as noted above, SSH matches patterns on the command-line argument, not on the resolved hostname.

Running `ssh project_prod`:

1. Matches `Host project_prod` → applies `HostName server-prod.office.corp.example` and `User `<Var name="userB">user-b</Var>.
2. Matches `Host * !`<Var name="vmIp">windows-vm-ip</Var> → applies `ProxyJump` and `IdentityFile`.
3. Does **not** match `Host *.office.corp.example` — `project_prod` is not a FQDN.

Without the `User` line in the alias stanza, SSH falls back to your local Windows username for that connection — which is almost certainly wrong.

Running `ssh server-prod.office.corp.example` directly:

1. Matches `Host * !`<Var name="vmIp">windows-vm-ip</Var> → `ProxyJump`, `IdentityFile`.
2. Matches `Host *.office.corp.example` → `User `<Var name="userB">user-b</Var>.

Both paths land on the right user. They just need different stanzas to get there.

<AlertBox variant="tip" title="ZSH users: autocomplete your aliases">

The <Link to="/blog/zsh-plugin-ssh-config-suggestions">zsh-ssh-config-suggestions plugin</Link> reads `~/.ssh/config` and offers completions on `ssh <Tab>`. Every alias in section 4 becomes a suggestion — the longer your alias list, the more useful it is.

</AlertBox>

## One Caveat: The Wildcard Is Truly Universal

`Host * !`<Var name="vmIp">windows-vm-ip</Var> applies to **every** SSH connection from this machine — including `ssh github.com` or `ssh localhost`. Connections to external hosts will attempt a `ProxyJump` through the VM and fail if the VM is not reachable.

Three options if that matters:

- **Replace `Host *` with an explicit domain list:** `Host *.project-a.internal *.cloud.corp.example *.office.corp.example`. Connections to anything outside that list skip the bastion entirely.
- **Keep `Host *`** if this machine uses SSH exclusively for servers inside your corporate network. In a dedicated work machine, the wildcard is fine.
- **Split the config with `Include`** — the cleanest solution for a machine used for both corporate and personal SSH:

```text
# ~/.ssh/config
Include ~/.ssh/config.d/work
Include ~/.ssh/config.d/personal
```

`~/.ssh/config.d/work` holds the full corporate config (bastion, `Host *` rule, domain stanzas, aliases). `~/.ssh/config.d/personal` holds a clean config with no bastion routing. The `Include` directives are processed top-to-bottom before any `Host` block in the main file — OpenSSH 7.3+ required.

## Bonus: Log In Directly as Another User

Some servers require you to connect with your own account and then switch to an application user — `sudo su app_user` followed by `cd /opt/project`. The `RemoteCommand` directive automates the entire sequence from the alias — and can print a banner before dropping you into the shell.

<Vars
  appUser="app-user"
  appDir="/opt/project"
  appDir2="/opt/project_devcontainer"
  testUser="mass_upload"
  testDir="/opt/folder_devcontainer"
  labels={{
    appUser: "Production — application user",
    appDir: "Production — working directory",
    appDir2: "Production — devcontainer directory",
    testUser: "Test — application user",
    testDir: "Test — working directory",
  }}
/>

For each server, think to add two aliases — one for a regular shell (=you), one for the application context:

<Snippet title="~/.ssh/config — additional aliases" source="./files/ssh_config_remotecommand.txt" />

The `RemoteCommand` chains three things: two `printf` calls that print the banner, then `cd` and `exec bash -l` to land in the right directory as the right user. `RequestTTY yes` allocates a pseudo-terminal before any of this runs — without it, the session closes immediately after the command instead of giving you an interactive shell.

<Terminal source="./files/terminal_remotecommand_test.txt" title="laptop: ~" />

<Terminal source="./files/terminal_remotecommand.txt" title="laptop: ~" />

The warning line appears in **yellow** for the test server and **red bold** for production, the tip in **cyan** — on a terminal that supports ANSI codes. All four aliases get the global `ProxyJump` from section 2 automatically.

<AlertBox variant="important" title="sudo must be passwordless — or use su instead">

`sudo -u `<Var name="appUser">app-user</Var> in a `RemoteCommand` works silently only when the sudoers file grants your account `NOPASSWD` for that specific user. If it does not, the connection will block waiting for a password that SSH cannot deliver before the TTY is fully established.

If passwordless sudo is not configured, use `sudo su - `<Var name="appUser">app-user</Var> instead — with `RequestTTY yes` the TTY is allocated before the command runs, so the password prompt appears normally:

```text
RemoteCommand sudo su - app-user -c "cd /opt/project && exec bash -l"
```

You will see the sudo password prompt once, then land in the shell.

</AlertBox>

## Conclusion

One wildcard stanza eliminates the per-alias repetition of `ProxyJump` and `IdentityFile`. Domain stanzas layer in usernames for direct FQDN access. Short aliases repeat `User` explicitly — because SSH matches on what you type, not on what the alias resolves to.

Adding a new server means two lines: `HostName` and `User`. The routing is already handled. And when a server requires a specific user and directory, `RemoteCommand` turns that two-step manual ritual into a single alias.

If you need to <Link to="/blog/github-connect-using-ssh">generate or manage your SSH keys</Link>, that article covers `ed25519` key generation and GitHub authorization from scratch — the same key used in the `IdentityFile` line above.
