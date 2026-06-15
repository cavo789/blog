---
name: project-blog-coverage
description: Compact coverage map of /blog articles by technology — read this before suggesting new topics to avoid duplicates
metadata:
  node_type: memory
  type: project
  originSessionId: 708860e8-3efc-4d08-a254-45060a383296
---

Coverage map built from full `/blog` analysis (2026-06-08). Before suggesting article topics, read this to avoid duplicates. Linked to [[project-article-proposals]].

**Why:** Re-analyzing the entire /blog folder costs many tokens. This map captures what's already covered.
**How to apply:** Cross-check any new article idea against these lists; if substantially covered, propose a different angle.

## WSL2
- Move WSL to another location (`wsl --export/import`)
- Open Linux folder in Windows Explorer
- Start Windows programs from WSL (`powershell.exe`, `xdg-open`)
- Windows Terminal: profiles, split panes, SSH profiles
- WSLg / RDP connection to local Linux instance

## ZSH / Oh-My-ZSH
- Install Oh-My-ZSH
- Powerlevel10k prompt customization
- Plugins: autosuggestions, syntax-highlighting, ssh-config-suggestions
- ZSH history management
- Modular ZSH workflow (`~/.zsh/fns`, autoload)
- ZSH hooks: show last 3 git branches on `cd` into repo
- ZSH functions for Docker management (dex, dstop, dnuke)

## Git
- `.gitconfig` tips and aliases
- Connect GitHub via SSH
- pre-commit hooks (multi-language: phpcbf, black, ruff, shellcheck)
- Git in Docker containers (`.gitconfig` sharing, SSH key mounting)

## Docker
- Docker fundamentals (ELI5)
- Install Docker + PHP container
- Docker Compose + Docusaurus / RevealJS
- Devcontainers: Python (Windows + Microsoft approach), PHP, Quarto, production-ready
- Docker networking troubleshooting
- Language-specific Docker setups (Python, PHP, Java)

## FZF
- Introduction to fzf (CTRL+R, CTRL+T)
- SSH host selector with fzf (`ssh_with_fzf`)
- FZF inside ZSH Docker functions (container selection)
- FZF project navigator in modular ZSH workflow

## SSH
- Key-based auth, `ssh-copy-id`, `~/.ssh/config`
- SSH + ZSH autosuggestions
- SSH profile in Windows Terminal
- VSCode Remote-SSH
- `~/.ssh/conf.d` modularization

## Bash / Scripting
- Load `.env` variables in Bash
- Logging library (timestamps, function trace)
- Parallel tasks (`&` + PID management)
- Progress bar
- `sed` tips
- `inotifywait` file monitoring

## Makefile
- Makefile basics and when to use it
- Auto-documented `help` target
- Tips & tricks (conditionals, dependencies, error handling)

## Other tools covered
- `eza` (modern `ls` replacement)
- `bat` (mentioned as dependency in some articles)

## Notable gaps (not yet covered as of 2026-06-09)
- `direnv` (auto-load `.env` per project on `cd`)
- ZSH startup profiling & optimization (`zprof`, lazy-load)
- SSH `ProxyJump` / bastion hosts / port forwarding tunnels
- `tmux` (session persistence, different from Windows Terminal split panes)
- `asdf` / `mise` for version management
- Git interactive rebase workflows

## Drafts in progress (`.unpublished/`)
- `git-delta` — syntax-highlighted pager for git diff
- `git-bisect` — binary search through history to find broken commit
- `git-worktree` — work on two branches simultaneously, Docker angle
