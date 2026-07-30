---
slug: atuin-bash-history
title: "Atuin — Supercharge Your Shell History With a Searchable, Timestamped Database"
description: "Tired of losing commands in the default Ctrl+R maze? Atuin replaces your shell history with a full-featured TUI backed by SQLite — timestamps, context, multi-machine sync, and a clean comparison with FZF-based history search."
authors: [christophe, claude]
image: /img/v2/bash.webp
mainTag: bash
tags: [bash, linux, zsh]
date: 2026-07-30
draft: true
ai_assisted: true
---

![Atuin — Supercharge Your Shell History](/img/v2/bash.webp)

<!-- cspell:ignore atuin atuinsh preexec rcaloras -->

<TLDR>
The default shell history is a graveyard for commands you'll never find again — no timestamps, no context, 500 lines and gone. Atuin replaces it with a SQLite-backed TUI that records every command with its exit code, working directory, duration, and timestamp. You get an instant `Ctrl+R` upgrade with filtering by host or folder, without sacrificing your existing history. The second half of this article walks through installation on Bash and ZSH, and wraps with a head-to-head comparison against the classic FZF+history approach.
</TLDR>

Damn, it happened again. I typed `Ctrl+R`, searched for that long `docker run` command I built three weeks ago, and got nothing — or worse, the wrong version from last Tuesday. The default bash history is just... not enough. Five hundred lines, no timestamps, no context about which folder you were in or whether the command even succeeded.

<Link to="/blog/linux-history">I already wrote about the built-in history tricks</Link> — `HISTSIZE`, `HISTTIMEFORMAT`, `fc`, reverse search — and they do help. But they're workarounds, not a solution. You're still searching through a flat text file with no structured data.

Atuin changes the game entirely.

<!-- truncate -->

## What Is Atuin?

[Atuin](https://github.com/atuinsh/atuin) (the name is a nod to Terry Pratchett's world turtle) is a shell history replacement. Instead of appending commands to `~/.bash_history`, it writes every command to a local SQLite database with rich metadata:

- **Timestamp** — when did you run it?
- **Duration** — how long did it take?
- **Exit code** — did it succeed?
- **Working directory** — where were you?
- **Hostname** — which machine?

When you press `Ctrl+R`, instead of the tiny reverse-incremental-search prompt, Atuin opens a full-screen TUI where you can type, filter by host or directory, and navigate with arrow keys. It works on Bash, ZSH, Fish, and Nushell. Optional end-to-end encrypted cloud sync lets you share history across machines — but it is entirely opt-in; Atuin works perfectly offline and locally.

<AlertBox variant="note" title="No cloud required">
Atuin's sync feature is opt-in. If you never run `atuin register` or `atuin login`, your history stays 100% local in `~/.local/share/atuin/history.db`. This article focuses on the local experience only.
</AlertBox>

## Seeing It in Action with Docker

You know me very well now — I like to containerize things. Before installing anything on your machine, let's spin up a throwaway container so you can feel what Atuin looks like in practice.

<AlertBox variant="tip" title="Why Docker first?">
A Docker container lets you test Atuin without touching your real shell configuration. If you don't like it, you just remove the container. No leftover hooks in your `~/.bashrc`.
</AlertBox>

Here is the Dockerfile I prepared:

<Snippet
  filename="Dockerfile"
  source=".unpublished/atuin-bash-history/files/Dockerfile"
  defaultOpen={true}
/>

A few notes on this file:

- **`bash-preexec`** is a small hook library that gives Bash a `precmd` / `preexec` mechanism (normally only available in ZSH). Atuin uses it to intercept commands before and after they run so it can record the exit code and duration. Without it, Atuin would still work on Bash, but you'd lose those fields.
- We download `bash-preexec` as a single script via `curl` rather than cloning the full repo — no `git` needed in the image.
- `CMD ["/bin/bash", "-i"]` launches an **interactive** shell so `.bashrc` is sourced automatically.

Build and run it:

<Terminal title="user@machine: ~/atuin-demo">
$ docker build -t atuin-demo .
[+] Building 28.3s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it atuin-demo
root@4f2a1b3c9d8e:/#
</Terminal>

Now type a few commands inside the container to populate the history:

<Terminal title="root@container:/#">
$ ls -lh /usr/local/bin/atuin
-rwxr-xr-x 1 root root 12M Jul 25 atuin

$ atuin --version
atuin 18.16.1

$ echo "hello from the container"
hello from the container

$ ls /etc
addgroup.conf  ca-certificates  ...
</Terminal>

Now press `Ctrl+R` and watch the difference. You'll see a panel like this at the bottom of your terminal:

```
[atuin] > _
──────────────────────────────────────────────────────────────
  1  [exit 0] [0ms]  2026-07-30 10:14  /  ls /etc
  2  [exit 0] [0ms]  2026-07-30 10:13  /  echo "hello from the container"
  3  [exit 0] [1ms]  2026-07-30 10:12  /  atuin --version
  4  [exit 0] [1ms]  2026-07-30 10:11  /  ls -lh /usr/local/bin/atuin
──────────────────────────────────────────────────────────────
  ↑/↓ navigate  Enter select  Ctrl+D delete  Esc quit
```

Exit code, duration, timestamp, and working directory — all in one view. Start typing `ls` and the list narrows in real time.

## Installing Atuin

If you want to keep Atuin permanently on your machine (and you will, after the demo), the official one-liner handles the binary install and basic shell wiring:

<Terminal title="user@machine: ~">
$ curl --proto '=https' --tlsv1.2 -LsSf https://setup.atuin.sh | sh
</Terminal>

<AlertBox variant="caution" title="Piping scripts to sh">
As always with curl-to-shell installs, you can review the script first at `https://setup.atuin.sh` before running it. Alternatively, download the binary directly from the [GitHub releases page](https://github.com/atuinsh/atuin/releases) and place it in your `$PATH`.
</AlertBox>

After the installer runs, it will tell you to restart your shell or source your profile. Before you do, you need to wire Atuin into the correct shell.

### Bash

Add these two lines at the **end** of your `~/.bashrc`:

```bash title="~/.bashrc"
source /path/to/bash-preexec.sh   # skip if you're on Bash 4.4+
eval "$(atuin init bash)"
```

<AlertBox variant="note" title="bash-preexec on modern Bash">
On Bash 4.4+ (most recent Linux distros), `bash-preexec` is optional. Atuin falls back to a simpler hook. If you want full exit-code and duration tracking, keep `bash-preexec`. On Ubuntu 24.04 (Bash 5.2), it works fine without it too — but the Docker demo includes it for maximum compatibility.
</AlertBox>

Then reload your shell:

<Terminal title="user@machine: ~">
$ source ~/.bashrc
</Terminal>

### ZSH

If you are already using ZSH (and you should — <Link to="/blog/zsh-install">here's how to set it up</Link>), Atuin integrates even more cleanly because ZSH has native `preexec`/`precmd` hooks. No extra dependency needed.

Add to `~/.zshrc`:

```zsh title="~/.zshrc"
eval "$(atuin init zsh)"
```

Then reload:

<Terminal title="user@machine: ~">
$ source ~/.zshrc
</Terminal>

If you follow <Link to="/blog/modular-zsh-workflow">a modular ZSH workflow</Link>, place the `eval` line in its own file — e.g., `~/.zsh/plugins/atuin.zsh` — and source it from your main `~/.zshrc`. This keeps your config clean and easy to toggle.

### Import Your Existing History

Atuin imports your current `~/.bash_history` or `~/.zsh_history` on first launch. You can also trigger it manually:

<Terminal title="user@machine: ~">
$ atuin import auto
 ✓  Importing history from /home/christophe/.bash_history
   Imported 4 823 commands
</Terminal>

Your old commands are now in the database with their original timestamps (if any). You lose nothing.

## Configuring Atuin

Atuin's configuration lives in `~/.config/atuin/config.toml`. The defaults are sensible, but a few options are worth knowing:

```toml title="~/.config/atuin/config.toml"
# How many results to show in the TUI
search_mode = "fuzzy"      # or "prefix", "fulltext"

# Filter by current directory by default (toggle with Ctrl+F in the TUI)
filter_mode = "global"     # or "host", "session", "directory"

# Show the full command, not a truncated one
show_preview = true

# Inline TUI instead of full-screen overlay
style = "compact"          # or "full" (default), "auto"
```

Restart your shell after editing to apply changes.

## Atuin vs. FZF History

<Link to="/blog/linux-fzf-introduction">FZF</Link> is the gold standard for fuzzy finding in the terminal — including shell history via `Ctrl+R` when wired up with the `fzf-history-widget`. So how does Atuin compare?

| Feature | Atuin | FZF + history |
|---------|-------|---------------|
| **Backend** | SQLite database | Flat text file |
| **Timestamps** | Always recorded | Only if `HISTTIMEFORMAT` is set |
| **Exit code** | Yes | No |
| **Duration** | Yes | No |
| **Working directory** | Yes | No |
| **Multi-machine sync** | Yes (opt-in, E2E encrypted) | No |
| **Fuzzy search** | Yes (built-in) | Yes (via FZF) |
| **Filter by directory** | Yes (`Ctrl+F` in TUI) | No |
| **Filter by host** | Yes | No |
| **Shell support** | Bash, ZSH, Fish, Nu | Bash, ZSH, Fish |
| **Dependencies** | One binary | FZF binary + shell plugin |
| **Import existing history** | Yes | N/A (already reads the same file) |
| **Configuration** | TOML file | Shell variable flags |
| **TUI** | Full-screen panel | Inline (or full with `--height=100%`) |

Neither is strictly better — it depends on what you need:

- **Use FZF** if you already have it wired into your workflow for other things (file finding, git branches, kubectl contexts…) and you only need basic reverse search. The FZF `Ctrl+R` integration is lightweight and requires no daemon or database.
- **Use Atuin** if you care about **why** a command ran (exit code, duration, directory) and want history that survives machine migrations and correlates across hosts. The database model makes Atuin's search structurally richer.

They are not mutually exclusive. Some people run both: Atuin for `Ctrl+R` (structured, timestamped search) and FZF for everything else (file navigation, fuzzy completions). <Link to="/blog/fzf-ripgrep">Combining FZF with ripgrep</Link> for code search remains a different use case that Atuin never touches.

<AlertBox variant="tip" title="Disable Atuin's Ctrl+R to keep FZF's">

If you want Atuin to record history silently but keep FZF's `Ctrl+R` binding, add this to your config:

```toml title="~/.config/atuin/config.toml"
[keys]
scroll_exits = false
```

And in your shell, bind `Ctrl+R` manually to `fzf-history-widget` after sourcing Atuin. Atuin will still capture and store commands; it just won't intercept the key.
</AlertBox>

## Conclusion

The default `Ctrl+R` reverse search was designed in an era when 500 commands felt like plenty. It isn't anymore — not when you're juggling Docker builds, git workflows, SSH sessions across half a dozen hosts, and shell functions that took an hour to get right. Atuin gives that history the structure it deserves: a real database, real timestamps, real context.

The Docker demo is the best way to feel the difference without commitment. Spin it up, run a few commands, press `Ctrl+R`, and you'll immediately see why a flat file isn't enough. If you're already a <Link to="/blog/linux-fzf-introduction">FZF user</Link>, don't think of Atuin as a replacement — think of it as what happens when you apply the "structured data beats plain text" principle to the one tool you use more than any other.

Now, every single time I misremember that perfect `tar` incantation or forget which directory I was in when that script finally worked, Atuin will remember for me.
