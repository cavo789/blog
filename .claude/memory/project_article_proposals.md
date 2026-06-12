---
name: project-article-proposals
description: Proposed but not-yet-written article topics for the WSL2/ZSH/Git/Docker/FZF workflow series
metadata: 
  node_type: memory
  type: project
  originSessionId: 708860e8-3efc-4d08-a254-45060a383296
---

Proposals generated 2026-06-08 after full blog analysis. See [[project-blog-coverage]] for what's already written.

**Why:** Avoid re-generating proposals on each session; track which ones have been written or discarded.
**How to apply:** When Christophe asks for article ideas or wants to start a new post in this domain, check this list first.

## Status legend: [ ] proposed | [x] written | [~] discarded

## Proposals

### [x] FZF + ripgrep: supercharged code search with live preview
- `rg` as fzf source, `bat` for preview (`--preview`), open result in VSCode at exact line
- ZSH function `fgrep` wrapping it all
- Natural follow-up to existing `linux-fzf-introduction` and `ssh_with_fzf`
- **Priority: high** (fits existing FZF series, very visual)

### [x] Git Worktrees: work on multiple branches simultaneously
- `git worktree add/list/remove`
- Avoids stash/switch for hotfix-while-feature-in-progress workflow
- FZF function `gwt` to navigate/create worktrees interactively
- Docker angle: each worktree can have its own container
- Draft written: `/opt/docusaurus/.unpublished/git-worktree/index.md`

### [ ] direnv: auto-load environment variables per project
- `eval "$(direnv hook zsh)"`, `.envrc` with `dotenv`
- Complements existing `bash-load-env` article (manual) with automatic approach
- Use case: different Docker Compose vars per project
- **Priority: high** (fills the .env automation gap naturally)

### [ ] ZSH startup optimization: profile and speed up your shell
- `zsh --startuptime`, `zprof`, identify slow plugins
- Lazy-loading strategy with `autoload`
- Complements existing `modular-zsh-workflow` article
- **Priority: medium**

### [x] delta: syntax-highlighted pager for git diff
- Drop-in `core.pager` replacement, side-by-side, word-level diff, themes
- Draft written: `/opt/docusaurus/.unpublished/git-delta/index.md`

### [x] git bisect: binary search to find the broken commit
- Step-by-step + automated `git bisect run <script>`, Docker scenario
- Draft written: `/opt/docusaurus/.unpublished/git-bisect/index.md`

### [ ] SSH ProxyJump and tunnels: reach internal services via bastion
- `ProxyJump` in `~/.ssh/config`, `LocalForward` for DB/port tunneling
- FZF interactive tunnel launcher (ZSH function `stun`)
- Complements existing SSH series (`ssh_with_fzf`, `zsh-plugin-ssh-config-suggestions`)
- **Priority: medium**
