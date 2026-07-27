---
name: project-blog-coverage
description: Compact coverage map of /blog articles by technology — read this before suggesting new topics to avoid duplicates
metadata:
  node_type: memory
  type: project
  originSessionId: 708860e8-3efc-4d08-a254-45060a383296
  modified: 2026-07-27T16:56:14.351Z
---

Coverage map built from full `/blog` analysis (2026-06-08, refreshed 2026-07-27). Before suggesting article topics, read this to avoid duplicates. Linked to [[project-article-proposals]] and [[project-blog-map]].

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
- `git delta` (syntax-highlighted diff pager) — published 2026-06-15
- `git worktree` (parallel branches, no stash) — published 2026-06-29
- `git bisect` — still a draft in `.unpublished/git-bisect/`

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
- FZF + ripgrep combo, live preview, VSCode jump-to-line (`fzf-ripgrep`, 2026-06-08)
- Standalone `ripgrep` deep-dive (installation, ZSH functions, use cases) — published 2026-07-06,
  separate from the fzf-ripgrep combo article above

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

- `git-bisect` — binary search through history to find broken commit
- `docusaurus-ollama-tags` — blog post analyzer using a local LLM (Ollama)
- `ollama-test-generator` — `ai-test` zsh function: local-LLM-generated Bats/Pest/Pytest suites,
  with coverage-gap-only mode when a test file already exists. First post of the new "Ollama
  daily-use functions" series ([[project-blog-conventions]] series list + `src/data/series.js`,
  both updated). Introduces the shared foundation `~/.zsh/fns/_ollama.zsh` (leading underscore =
  loads first alphabetically): `_ollama_query` helper, `AI_COMMANDS` registry, `ai` dispatcher/menu
  (fzf if available, plain list fallback)
- `ollama-ai-commit` — `ai-commit` zsh function: local-LLM-drafted Conventional Commits messages
  from `git diff --staged`, accept/edit/discard flow. Second post of the same series, registers
  itself into `AI_COMMANDS` and is reachable as `ai commit` or via the bare `ai` menu
- `ollama-ai-standup` — `ai-standup [days]` zsh function: summarizes `git log` across
  `$AI_STANDUP_REPOS` into a spoken-friendly recap. Day count is configurable via `$AI_STANDUP_DAYS`
  (Christophe's own cadence is weekly → 7), overridable per-call with a numeric argument
- `ollama-ai-fix` — `ai-fix` zsh function: re-runs the last failed command (`fc -ln -1`) to capture
  its error, then asks the model to explain + fix it. Confirms before re-running anything matching a
  risky-verb list (`rm`, `git push`, `docker rm`, `kubectl delete`, ...) — same trick as `thefuck`
- `ollama-ai-ci` — `ai-ci [ref]` zsh function: parses the `origin` remote to find the GitLab
  host/project, pulls the latest pipeline's failed job traces (tail only, 6000 chars) via the GitLab
  API (`$GITLAB_TOKEN`, `read_api` scope), asks the model what broke
- `ollama-ai-ask` — `ai-ask <question>` zsh function: plain-English question in, exact shell command
  out. Simplest function in the series, no file/repo dependency
- `ollama-ai-docs` — `ai-translate <file> [lang]` and `ai-summarize <file> [points]`: office documents
  (pdf/docx/pptx/xlsx/html, via Docling — see `docling` below) or plain text/markdown, translated or
  condensed entirely locally. Shared extraction helper `_ai_extract_text` in `_ai-docs.zsh`
- `ollama-ai-review` — `ai-review` zsh function: reviews staged `git diff` for SOLID violations, magic
  constants, long functions, naming, overall quality — fixed headings, omits empty ones on purpose.
  Read-only sibling of `ai-commit`; distinct from the automated git-hook reviewer staged in
  `ollama-refactor-code` (no URL exists for that project — don't invent one if asked about it)
- `ollama-ai-data` — `ai-data <file.json|file.csv>` zsh function: samples the file (3 JSON elements or
  5 CSV rows), asks the model for 5 tailored `jq`/`awk` (or `mlr` if installed) commands in a
  `COMMAND ||| description` format, picks one via `fzf` (`--with-nth=2`), then loads it onto the
  prompt with zsh's `print -z` instead of running it — deliberately teaches the syntax rather than
  just returning an answer
- `ollama-ai-diff` — `ai-diff <file> [other-file]` zsh function: one arg compares the working copy
  against `git show HEAD:<file>`; two args compare any two files directly via `_ai_extract_text`
  (reused from `ollama-ai-docs`'s `_ai-docs.zsh` — a second, deeper cross-article dependency beyond
  the `_ollama.zsh` foundation). Prompt explicitly asks for a *functional* explanation (intent/effect,
  grouped, most significant first), not a line-by-line transcript — the whole point of the function
- `docling` — **not** part of the Ollama series (no `series:` field, doesn't call Ollama at all).
  Companion to the existing `/blog/markitdown` article: same "Docker batteries-included, convert to
  Markdown" structure, but using Docling (GPU-accelerated via `--device cuda`, named volume for the
  Hugging Face model cache) instead of Markitdown's format-specific parsers. Verified via WebFetch
  (2026-07-27) against docling-project's GitHub + docs: 100% local by default, `pip install docling`,
  CLI is `docling convert <src> --to md --device {auto|cpu|cuda|mps|xpu}`, writes `<basename>.md` to a
  directory (no stdout mode, unlike Markitdown's CLI)
- `anythingllm-chat-with-your-docs` — standalone (not in the Ollama series), pre-existed in
  `.unpublished/` before being noticed/logged here 2026-07-27 — self-hosted RAG app (Docker), chat
  over Markdown/Quarto/PDF/DOCX/XLSX/PPTX via any configured LLM provider incl. Ollama. Two parts:
  single-machine setup, and a split setup (docs on work PC, GPU inference borrowed from home PC)
- Design pattern established for the whole "Ollama daily-use functions" series: every new `ai-*`
  function only needs (1) its own file in `~/.zsh/fns/` and (2) one `AI_COMMANDS[name]="..."`
  registration line to become discoverable through `ai` — no menu to hand-edit. `ai-explain` (ELI5 for
  a script/error in the terminal) is the one remaining open proposal from the original round — see
  [[project-article-proposals]]. Full proposed publish order (dependency chain + editorial pacing) is
  maintained in `.unpublished/plan.md` (French, internal-only) — see [[feedback-unpublished-plan]]
- `python-ai-helper` — auto-documenting and testing Python scripts
- `removing-algolia-for-pagefind` — why/how the blog dropped Algolia DocSearch for Pagefind
- `tried_it` (slug `docusaurus-tried-it-widget`) — "did the tutorial steps still work?" widget,
  companion to the already-published Reactions widget
- `typo-report-docusaurus` (slug `docusaurus-typo-report-component`) — reader feedback/typo-flagging
  widget, PHP + HMAC nonce + rate limiting
- `winscp-putty` — start PuTTY without typing a password
- `ollama-refactor-code` — **staged only**, a full Python project (source files under `files/`) for a
  future post on a local-LLM code refactoring/analysis tool; no `index.md` written yet
