---
name: project-article-proposals
description: Proposed but not-yet-written article topics for the WSL2/ZSH/Git/Docker/FZF workflow series
metadata:
  node_type: memory
  type: project
  originSessionId: 708860e8-3efc-4d08-a254-45060a383296
  modified: 2026-07-27T16:56:26.406Z
---

Proposals generated 2026-06-08 after full blog analysis, statuses refreshed 2026-07-27. See [[project-blog-coverage]] for what's already written.

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
- Published 2026-06-29: `/blog/git-worktree`

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
- Published 2026-06-15: `/blog/git-delta`

### [x] git bisect: binary search to find the broken commit

- Step-by-step + automated `git bisect run <script>`, Docker scenario
- Draft written: `/opt/docusaurus/.unpublished/git-bisect/index.md`

## "Ollama daily-use functions" series (proposed 2026-07-27)

Christophe runs Ollama locally (qwen3-coder:30b, 24GB VRAM, Dockerized, Open WebUI on :4000) and asked
for terminal-first "daily use case" ways to actually use it, beyond chat — plain zsh functions in
`~/.zsh/fns/`, no file writes unless requested. Distinct from the existing `python-ai-helper` draft
(Docker-wrapped, Python-only, writes files to disk) and `ollama-refactor-code` staging (a git-hook code
reviewer) — this series is lighter-weight, multi-language, on-demand.

### [x] ai-test <file>: generate missing unit tests, gap-fill mode for existing suites

- Detects Bash/PHP/Python → Bats/Pest/Pytest, finds an existing test file by naming convention, asks
  the model for a full suite or only the missing coverage
- Draft written: `/opt/docusaurus/.unpublished/ollama-test-generator/index.md`

### [x] ai-commit: draft a Conventional Commits message from the staged diff

- Reads `git diff --staged`, accept/edit/discard flow, reuses the `_ollama_query` helper from ai-test
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-commit/index.md`

### [x] ai-fix: re-run and explain the last failed command

- `fc -ln -1` to find it, re-run to capture stderr (the shell never stores it), confirmation prompt
  before re-running anything matching a risky-verb list — a fully local "thefuck" alternative
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-fix/index.md`

### [x] ai-standup [days]: summarize git activity across repos for standup

- `$AI_STANDUP_REPOS` array + `$AI_STANDUP_DAYS` (Christophe's own cadence is weekly, so 7, not 1)
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-standup/index.md`

### [x] ai-ci [ref]: summarize the last failed GitLab pipeline

- Parses `origin` remote for host/project, GitLab API for pipeline jobs + failed job trace tail
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-ci/index.md`

### [x] ai-ask <question>: plain-English question → exact shell command

- Simplest function in the series; no file or repo dependency
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-ask/index.md`

### [x] ai-translate / ai-summarize: confidential office documents, 100% locally

- Shared `_ai_extract_text` helper: Docling (see `docling` article) for pdf/docx/pptx/xlsx/html,
  direct read for md/txt
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-docs/index.md`

### [x] ai-review: SOLID/magic-constants/naming code review of staged changes

- Same skeleton as ai-commit, fixed headings (SOLID, magic constants, long functions, naming, overall
  quality), explicitly told to leave a heading empty rather than invent issues
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-review/index.md`

### [x] docling: Docker batteries-included setup, companion to the markitdown article

- Not part of the Ollama series (doesn't call Ollama) — same structure as `/blog/markitdown` but with
  Docling: GPU-accelerated (`--device cuda`), named volume for the HF model cache, pdf/docx/pptx/xlsx/
  html → md, no format-specific pip extras needed unlike Markitdown
- Draft written: `/opt/docusaurus/.unpublished/docling/index.md`

### [x] ai-data <file.json|file.csv>: tailored jq/awk suggestions via fzf, learn-by-editing

- Samples the file, asks for 5 commands referencing real field names, `fzf` picker, `print -z` loads
  the chosen one onto the prompt instead of running it — Christophe's own idea (2026-07-27), explicit
  goal was "user sees and learns to build the prompt/command, can modify it"
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-data/index.md`

### [x] ai-diff <file> [other-file]: functional (not line-by-line) change explanation

- One arg = vs last git commit; two args = any two files (office docs via Docling too). Christophe's
  own idea (2026-07-27), explicitly "fonctionnel" not a diff transcript
- Depends on `_ai_extract_text` from ollama-ai-docs — see `plan.md` for the dependency chain
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-diff/index.md`

### [ ] ai-explain <file|text>: ELI5 explanation of a script or stack trace in the terminal

- Terminal-only companion to the already-published `docusaurus-eli5-snippet-tooltips` component
- **Priority: medium** — still open as of 2026-07-27, only one not yet drafted from this round

### [ ] SSH ProxyJump and tunnels: reach internal services via bastion

- `ProxyJump` in `~/.ssh/config`, `LocalForward` for DB/port tunneling
- FZF interactive tunnel launcher (ZSH function `stun`)
- Complements existing SSH series (`ssh_with_fzf`, `zsh-plugin-ssh-config-suggestions`)
- **Priority: medium**
