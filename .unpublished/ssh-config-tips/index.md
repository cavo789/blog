---
slug: ssh-config-tips
title: "SSH Config Tips: Global Rules, Aliases, and Automated Logins"
authors: [christophe]
image: /img/v2/ssh.webp
mainTag: ssh
tags: [ssh, linux, windows]
date: 2026-12-21
description: "How SSH reads a config file — multiple stanzas, first-value-wins, CLI-argument matching — and what that model unlocks: one wildcard stanza that eliminates repeated ProxyJump lines, domain defaults for FQDN usernames, hardening options for idle sessions, and RemoteCommand aliases that land you straight in the right user and directory."
draft: true
series: SSH - From your first key to remote development
language: en
ai_assisted: true
---

import { sshConfigTemplate } from './files/ssh_config_template.js';

![SSH Config Tips: Global Rules, Aliases, and Automated Logins](/img/v2/ssh.webp)

<TLDR>
SSH reads every matching stanza top-to-bottom, first value wins per directive — that's what makes `Host * !bastion` powerful: one stanza covers every server at once, no more repeating `ProxyJump` and `IdentityFile`. Domain stanzas layer in the right `User` for FQDN connections; short aliases must repeat it explicitly, because SSH matches on what you type, not the resolved hostname. Three directives — `ServerAliveInterval`, `ControlMaster`, `ConnectTimeout` — harden the global defaults without changing their logic. For machines mixing corporate and personal SSH, `Include` splits the two cleanly. `RemoteCommand` turns a `sudo su` + `cd` sequence into a single alias.
</TLDR>

Every server in my environment is only reachable through my own Windows VM acting as a bastion. The <Link to="/blog/vscode-remote-ssh-proxyjump-devcontainer">ProxyJump and DevContainers article</Link> shows a config with one alias. Add a second server and the config doubles. Add ten and it becomes a maintenance problem: change the bastion hostname once and you rewrite ten stanzas, each carrying the same `ProxyJump` and `IdentityFile` lines.

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
- **First value wins per setting — the opposite of what most tools do.** In CSS, `.env` files, or most config systems, the last declaration overrides earlier ones. SSH does the reverse: the first value encountered is kept, and later stanzas can only fill in settings not yet defined. Put the most specific stanza first; the wildcard fallback last.
- **Patterns match on the command-line argument, not on the resolved hostname.** `Host *.office.corp.example` matches `ssh server-prod.office.corp.example`. It does **not** match `ssh project_prod`, even though `project_prod`'s `HostName` resolves to `server-prod.office.corp.example`.

## The Four Sections

The config snippet above is split into four numbered sections — here is what each one does and why it is placed in that order.

**Section 1 — Bastion definition.** Declares the jump host with its username. No `ProxyJump` here (it would loop back to itself) and no `IdentityFile` (the VM uses whatever auth you have configured for it separately).

**Section 2 — Domain defaults.** These match when you type a full FQDN like `ssh server-prod.office.corp.example`. SSH picks up the `User` from here, since no earlier stanza set it. Multiple domain stanzas with the same username are normal — one per domain suffix. These stanzas are also useful for scripts that construct hostnames programmatically or for `ssh-copy-id` calls.

**Section 3 — Short aliases.** Each alias declares `HostName` (the real FQDN) and `User`. Adding a new server alias is exactly two lines.

**Section 4 — Global defaults.** The `!` prefix in `Host * !`<Var name="vmIp">windows-vm-ip</Var> means "all hosts *except* the bastion". Placed last, this stanza provides `ProxyJump` and `IdentityFile` as fallbacks for every preceding stanza that did not set them — which is all of them. Any stanza in sections 2 or 3 can override these defaults simply by declaring the directive first, without touching section 4.

## Hardening Section 4 (optional)

Four directives extend the global defaults without changing their logic. Add whichever ones fit your environment — none are required for the config to work.

<Snippet title={<>C:\Users\your_laptop_user\.ssh\config · ~/.ssh/config</>} source="./files/ssh_config_section2_full.txt" />

- **`ServerAliveInterval 30` / `ServerAliveCountMax 3`** — SSH sends a keepalive packet every 30 seconds. After 3 unanswered packets (90 seconds of silence), the connection is dropped cleanly rather than hanging with a frozen prompt. Without these, an idle terminal on a corporate server often locks up with no error message.
- **`ConnectTimeout 5`** — fails after 5 seconds if the server is unreachable. On a corporate network with a reliable bastion, the default 2-minute timeout is pure noise.

<AlertBox variant="important" title="ControlMaster does not work on Windows OpenSSH">

`ControlMaster auto` / `ControlPath` / `ControlPersist` enable SSH multiplexing: the first connection opens a Unix domain socket in `~/.ssh/`; subsequent connections reuse the tunnel instead of negotiating a new one through the bastion. On Linux and macOS this works well.

On **Windows OpenSSH with ProxyJump**, these three directives silently break all connections — `ssh` hangs or exits with `Read from remote host: Unknown error` — because Windows's Unix socket implementation does not interoperate with ProxyJump's pipe-based stdio forwarding. The comment `# Optional` is not enough protection: the lines are copied and break things.

Leave them out on Windows. If you connect from Linux or macOS, add them:

```text
    ControlMaster auto
    ControlPath ~/.ssh/cm_%C
    ControlPersist 10m
```

`%C` is a hash of the connection parameters — no colons, no special characters. Never use `%r@%h:%p`: the `:` is illegal in Windows filenames and silently corrupts the socket path even when ControlMaster itself is otherwise functional.

</AlertBox>

## Why Each Alias Needs Its Own `User` Line

The domain stanzas in section 2 set `User` only when SSH matches them — and as noted above, SSH matches patterns on the command-line argument, not on the resolved hostname.

Running `ssh project_prod`:

1. Does **not** match `Host *.office.corp.example` (section 2) — `project_prod` is not a FQDN.
2. Matches `Host project_prod` (section 3) → applies `HostName server-prod.office.corp.example` and `User `<Var name="userB">user-b</Var>.
3. Matches `Host * !`<Var name="vmIp">windows-vm-ip</Var> (section 4) → applies `ProxyJump` and `IdentityFile`.

Without the `User` line in the alias stanza, SSH falls back to your local Windows username for that connection — which is almost certainly wrong.

Running `ssh server-prod.office.corp.example` directly:

1. Matches `Host *.office.corp.example` (section 2) → `User `<Var name="userB">user-b</Var>.
2. Matches `Host * !`<Var name="vmIp">windows-vm-ip</Var> (section 4) → `ProxyJump`, `IdentityFile`.

Both paths land on the right user. They just need different stanzas to get there.

<AlertBox variant="tip" title="ZSH users: autocomplete your aliases">

The <Link to="/blog/zsh-plugin-ssh-config-suggestions">zsh-ssh-config-suggestions plugin</Link> reads `~/.ssh/config` and offers completions on `ssh <Tab>`. Every alias in section 3 becomes a suggestion — the longer your alias list, the more useful it is.

</AlertBox>

## One Caveat: The Wildcard Is Truly Universal

`Host * !`<Var name="vmIp">windows-vm-ip</Var> applies to **every** SSH connection from this machine — including `ssh github.com` or `ssh localhost`. Connections to external hosts will attempt a `ProxyJump` through the VM and fail if the VM is not reachable.

Three options if that matters:

- **Replace `Host *` with an explicit domain list:** `Host *.project-a.internal *.cloud.corp.example *.office.corp.example`. Connections to anything outside that list skip the bastion entirely.
- **Keep `Host *`** if this machine uses SSH exclusively for servers inside your corporate network. In a dedicated work machine, the wildcard is fine.
- **Override specific hosts above section 4.** Because the global defaults are last, any stanza placed before them wins. Add an exemption anywhere above section 4 — position within sections 1–3 does not matter:

```text
# Anywhere above section 4 — fits naturally in section 3 alongside the other aliases
Host github.com gitlab.com
    ProxyJump none
    IdentityFile ~/.ssh/id_ed25519_personal

# Section 4 — global defaults (last, unchanged)
Host * !windows-vm-ip
    ProxyJump ...
```

- **Split the config with `Include`** — the cleanest solution for a machine used for both corporate and personal SSH:

```text
# ~/.ssh/config
Include ~/.ssh/config.d/work
Include ~/.ssh/config.d/personal
```

`~/.ssh/config.d/work` holds the full corporate config (bastion, domain stanzas, aliases, global defaults last). `~/.ssh/config.d/personal` holds a clean config with no bastion routing. The `Include` directives are processed top-to-bottom before any `Host` block in the main file — OpenSSH 7.3+ required.

## Bonus: Log In Directly as Another User

Some servers require you to connect with your own account and then switch to an application user — `sudo su app_user` followed by `cd /opt/project`. The `RemoteCommand` directive automates the entire sequence from the alias.

The generator below produces **two aliases per server**: a plain alias for VSCode Remote Explorer (no `RemoteCommand`) and a `_app` variant for terminal sessions that lands you directly as the application user.

## Generate Your Complete Config

Fill in your values once and copy the result directly into `~/.ssh/config`. For a second project, copy-paste only the Section 3 aliases and change the project name — the bastion and global defaults are already in place.

<ConfigGenerator
  template={sshConfigTemplate}
  title="~/.ssh/config generator"
  storageKey="ssh-config"
  globalFields={[
    { name: "vmUser",      label: "Bastion/VM username",               default: "vm-user",        section: "Sections 1 & 4 — Bastion + global defaults" },
    { name: "vmIp",        label: "Bastion/VM hostname or IP",         default: "windows-vm-ip" },
    { name: "sshKey",      label: "SSH private key filename",          default: "id_ed25519" },
    { name: "projectName", label: "Project name",                      default: "project",         section: "Section 3 — Servers", lowercase: true },
    { name: "userB",       label: "Your username on corporate servers", default: "user-b" },
  ]}
  fields={[
    {
      type: "list",
      name: "domains",
      label: "Section 3 — Domain defaults (optional)",
      collapsible: true,
      defaultCollapsed: true,
      optional: true,
      defaultRows: [
        { domain: "*.office.corp.example", user: "user-b" },
      ],
      fields: [
        { type: "string", name: "domain", label: "Domain pattern", default: "*.example.com" },
        { type: "string", name: "user",   label: "Username",       default: "user-b" },
      ],
    },
    {
      type: "list",
      name: "servers",
      label: "Section 4 — Servers",
      collapsible: true,
      keyField: "environment",
      defaultRows: [
        {
          environment: "test",
          hostname: "server-test.office.corp.example",
          appUser: "app-user",
          appDir: "/opt/folder_devcontainer",
        },
        {
          environment: "prod",
          hostname: "server-prod.office.corp.example",
          appUser: "app-user",
          appDir: "/opt/project",
        },
      ],
      fields: [
        { type: "string", name: "environment", label: "Environment",   default: "test" },
        { type: "string", name: "hostname",    label: "Hostname",      default: "server.example.com" },
        { type: "string", name: "appUser",     label: "App user",      default: "app-user" },
        { type: "string", name: "appDir",      label: "App directory", default: "/opt/app" },
      ],
    },
  ]}
/>

<AlertBox variant="tip" title="Test your bastion connection first">

Before testing a full alias, verify the bastion itself is reachable and accepts your key:

<Terminal source="./files/terminal_test_bastion.txt" title="laptop: ~" />

`echo bastion-ok` is a non-interactive command — it exits immediately after printing, leaving no open session. If the output appears, section 1 and section 4 are wired correctly. If it hangs or fails, the problem is between your machine and the bastion, independently of any server alias.

</AlertBox>

<AlertBox variant="important" title="VSCode Remote Explorer does not work with RemoteCommand">

VSCode Remote SSH injects its own server process during login. `RemoteCommand` replaces the remote shell before that injection can happen — the connection closes before VSCode gets a foothold. Use the plain `project_test` / `project_prod` aliases for Remote Explorer; navigate to the application directory from within VSCode once connected.

</AlertBox>

The `_app` variant's `RemoteCommand` chains two things: `cd` to the application directory and `exec bash -l` to start a login shell as the application user. `RequestTTY yes` allocates a pseudo-terminal — without it, the session closes immediately after the command instead of giving you an interactive shell.

<Terminal source="./files/terminal_remotecommand_test.txt" title="laptop: ~" />

<Terminal source="./files/terminal_remotecommand.txt" title="laptop: ~" />

All four aliases get the global `ProxyJump` from section 4 automatically.

<AlertBox variant="important" title="sudo must be passwordless — or use su instead">

`sudo -u `<Var name="appUser">app-user</Var> in a `RemoteCommand` works silently only when the sudoers file grants your account `NOPASSWD` for that specific user. If it does not, the connection will block waiting for a password that SSH cannot deliver before the TTY is fully established.

If passwordless sudo is not configured, use `sudo su - `<Var name="appUser">app-user</Var> instead — with `RequestTTY yes` the TTY is allocated before the command runs, so the password prompt appears normally:

```text
RemoteCommand sudo su - app-user -c "cd /opt/project && exec bash -l"
```

You will see the sudo password prompt once, then land in the shell.

</AlertBox>

## Production Environment Warning

A `RemoteCommand` banner is visible only to whoever has that SSH alias set up. The right place for a production warning is the **server itself** — so it reaches every user, whatever client they use.

Drop a script in `/etc/profile.d/` on the server. Every interactive shell sources that directory on login:

```bash title="/etc/profile.d/env-banner.sh (on the server)"
#!/usr/bin/env bash
case "$(hostname -s)" in
  *prod*|*prd*)
    printf '\033[38;5;88;48;5;224m  ⚠  Production server — be careful!  \033[0m\n\n'
    export PS1='\[\033[38;5;88;48;5;224m\] ⚠ PROD \[\033[0m\] \u@\h:\w\$ '
    ;;
esac
```

The color pair `38;5;88` (dark maroon) on `48;5;224` (pale rose) is clearly visible without being aggressive — a reminder, not a warning sign.

<Terminal source="./files/terminal_prod_banner.txt" title="laptop: ~" />

Because `exec bash -l` in the `RemoteCommand` starts a login shell, the profile scripts run and the banner appears on every `_app` connection as well. No change to the SSH config needed.

<AlertBox variant="tip" title="hostname-based detection vs. an explicit file">

`hostname -s` matching `*prod*` is convenient but fragile — a host named `deployments-node` would match nothing. An explicit marker file is more reliable:

```bash
if [[ -f /etc/env-type ]] && grep -qx "production" /etc/env-type; then
```

Create `/etc/env-type` with the content `production` when provisioning a server. The check is unambiguous regardless of the hostname.

</AlertBox>

## Conclusion

One wildcard stanza eliminates the per-alias repetition of `ProxyJump` and `IdentityFile`. Domain stanzas layer in usernames for direct FQDN access. Short aliases repeat `User` explicitly — because SSH matches on what you type, not on what the alias resolves to.

Adding a new server means two lines: `HostName` and `User`. The routing is already handled. When a server requires a specific user and directory, `RemoteCommand` turns that sequence into a single alias. And when a production server needs a clear visual warning for everyone, `/etc/profile.d/` is the right place — not the SSH config.

If you need to <Link to="/blog/github-connect-using-ssh">generate or manage your SSH keys</Link>, that article covers `ed25519` key generation and GitHub authorization from scratch — the same key used in the `IdentityFile` line above.
