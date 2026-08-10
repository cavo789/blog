---
name: project-blog-coverage
description: Compact coverage map of /blog articles by technology — read this before suggesting new topics to avoid duplicates
metadata:
  node_type: memory
  type: project
  originSessionId: 708860e8-3efc-4d08-a254-45060a383296
  modified: 2026-08-08T09:54:12.778Z
---

Coverage map built from full `/blog` analysis (2026-06-08, refreshed 2026-08-10). Before suggesting article topics, read this to avoid duplicates. Linked to [[project-article-proposals]] and [[project-blog-map]].

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

## VSCode

18 dedicated articles already published — checked 2026-07-27 before suggesting new VSCode topics
(previous session nearly re-suggested `code-server` as a new Docker-image idea; it's already
published, 2025-07-06 — always grep `/opt/docusaurus/blog` for "vscode"/the tool name before proposing).

Covered: Error Lens, Todo Tree, multiple cursors, sticky scroll, regions, autosave, JetBrains Mono
font+ligatures, Tabnine (AI autocomplete/chat), export installed extensions, github.dev shortcut,
Markdown code folding fix, PHP getter/setter generation, PHP refactoring tool, devcontainer (PHP +
quality tools), code-server (browser-based VSCode via Docker), Markmap mindmaps, Remote-SSH.

**Now drafted (2026-07-27)**, all in `.unpublished/`: `vscode-gitlens`, `vscode-snippets-for-docusaurus`
(walks the real `.vscode/markdown.code-snippets` file via a live `Snippet source=` reference, flags two
stale entries — `CoreConcept`/`HighlyImportant` — that predate the `AlertBox`-variant consolidation),
`vscode-profiles` (documents Christophe's real dark-daily/light-DevContainer split, Claude Code
installed only in the DevContainer profile), `vscode-multi-root-git-worktree` (follow-up to the
published `git-worktree` article), `vscode-extension-bisect` (hard-links to the still-unpublished
`git-bisect` draft — see `plan.md`). Settings Sync and Tasks (`tasks.json`) were proposed and
explicitly declined by Christophe (2026-07-27) — don't re-suggest.

**`ollama-installation` (published, `/blog/ollama-installation`, 2026-03-30) — Continue section was
stale, corrected 2026-07-27:** Continue.dev was acqui-hired by Cursor/Anysphere on 2026-06-18 and wound
down as a standalone product; final release v2.0.0 shipped 2026-06-19, GitHub repo now **read-only**.
Fixed: config snippets migrated from deprecated `.continue/config.json` to `~/.continue/config.yaml`
(schema `v1`, `models:` list with `roles: [chat, edit]` / `roles: [autocomplete]`); old `.json` files
and their generated `.eli5.json` companions deleted from `files/continue/`; model recommendation
swapped from `gemma2:27b` to Christophe's actual current model `qwen3-coder:30b` (MoE, ~19GB, fits
24GB VRAM); `updates:` frontmatter entry added; an AlertBox notes the acquisition/frozen-repo status.
The existing `gemma2:27b` screenshot was left in place with a note that it predates the update, since
no new screenshot could be captured. **Not independently re-verified**, left as-is with a caveat added
to the prose: the article's claim that Continue's config must live in the **Windows** home folder
rather than the WSL side when using VSCode Remote-WSL — current docs don't mention this either way;
Christophe hasn't retested it yet.

## Notable gaps (updated 2026-08-07)

- `direnv` (auto-load `.env` per project on `cd`) — **draft written**: `.unpublished/direnv/`
- ZSH startup profiling & optimization (`zprof`, lazy-load) — still not covered
- SSH `ProxyJump` / bastion hosts / port forwarding tunnels — **draft written**: `.unpublished/ssh-proxyjump/`
- `tmux` (session persistence, different from Windows Terminal split panes) — still not covered
- `asdf` / `mise` for version management — still not covered
- Git interactive rebase workflows — **draft written**: `.unpublished/git-interactive-rebase/`

## Drafts in progress (`.unpublished/`)

- `git-bisect` — binary search through history to find broken commit
- `docusaurus-ollama-tags` — blog post analyzer using a local LLM (Ollama)
- ~~`ollama-test-generator`~~ — **PUBLISHED 2026-08-03**: `/blog/ollama-test-generator`. First post of the
  "Ollama daily use" series. Introduces `_ollama.zsh` foundation, `AI_COMMANDS` registry,
  `ai` dispatcher. Generates Bats/Pest/Pytest suites, gap-fill mode when tests already exist.
- ~~`ollama-git-precommit`~~ — **PUBLISHED 2026-08-10**: `/blog/ollama-git-precommit`. Replaced the 3
  separate drafts `ollama-ai-commit`, `ollama-ai-review`, `ollama-ai-secrets` (merged 2026-08-07).
  Title: "ai-review, ai-secrets, ai-commit: Three zsh Checks Before Every git Commit". Same series.
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
- Design pattern established for the whole "Ollama daily use" series: every new `ai-*`
  function only needs (1) its own file in `~/.zsh/fns/` and (2) one `AI_COMMANDS[name]="..."`
  registration line to become discoverable through `ai` — no menu to hand-edit. `ai-explain` (ELI5 for
  a script/error in the terminal) is the one remaining open proposal from the original round — see
  [[project-article-proposals]]. Full proposed publish order (dependency chain + editorial pacing) is
  maintained in `.unpublished/plan.md` (French, internal-only) — see [[feedback-unpublished-plan]]
- **Cross-cluster "bridge" articles** (Christophe asked 2026-07-27: "identifier des nouveaux articles
  qui feraient le pont entre deux ou plusieurs thématiques", to create inter-linking between otherwise
  disconnected clusters):
  - `ollama-ai-diagram` — `ai-diagram <description>|<file>` zsh function, series member: plain-English
    description or a config file (e.g. `compose.yaml`) → Mermaid diagram via Ollama. Bridges ai ×
    doc-as-code — verified `/blog/docker-python-mermaid` uses zero AI (pure Python/rule-based) before
    proposing this, so it's a genuine gap, not a duplicate
  - `ollama-ai-secrets` — `ai-secrets` zsh function, series member: regex pre-filter over the staged
    diff for credential-shaped lines (cheap, no model call if nothing matches), then the model judges
    genuine leak vs. false positive (safe `getenv()` pattern, placeholder value). Hard-links to
    `/blog/ollama-ai-review` (must publish after it) — bridges security × ai/pre-commit, doubles the
    blog's `security` mainTag count (was 1 post total: `aesecure-quickscan`)
  - `duckdb-json-csv` — **not** in the Ollama series (no Ollama/LLM at all). DuckDB CLI in Docker,
    queries CSV/JSON files directly with SQL (`SELECT * FROM 'file.csv'`, `read_json_auto()`) — no
    import step. Bridges docker × python × data. Hard-links to `/blog/docling` AND
    `/blog/ollama-ai-data` (twice) — must publish after both. CLI download URL/version (`v1.5.5`)
    verified for real via the GitHub releases API at write time, not guessed
  - `xdebug-docker-vscode` — **not** in the Ollama series. Adds Xdebug 3.x to the existing
    `/blog/php-devcontainer` setup + VSCode `launch.json`/`pathMappings`, `host.docker.internal` +
    `extra_hosts: host-gateway` for Linux/WSL2. Bridges docker × php × vscode — verified via grep that
    despite the blog's large Docker+PHP+VSCode cluster, no article covered step-debugging before this
  - `python-security-bandit-audit` — **not** in the Ollama series. Bandit (static security analysis)
    + pip-audit (dependency vulnerability scan) bundled in one Docker image, `:ro` project mount.
    Bridges security × python, Python-side sibling of `/blog/php-jakzal-phpqa`. Hard-links to
    `/blog/docling`. The `pip-audit` demo advisory IDs are explicitly flagged in-article as
    illustrative formatting, not verified against the exact package versions shown
- `python-ai-helper` — auto-documenting and testing Python scripts
- `removing-algolia-for-pagefind` — why/how the blog dropped Algolia DocSearch for Pagefind
- `tried_it` (slug `docusaurus-tried-it-widget`) — "did the tutorial steps still work?" widget,
  companion to the already-published Reactions widget
- `typo-report-docusaurus` (slug `docusaurus-typo-report-component`) — reader feedback/typo-flagging
  widget, PHP + HMAC nonce + rate limiting
- `winscp-putty` — start PuTTY without typing a password (NOT AI-assisted)
- `ai-agent-in-devcontainer` — Symfony Docker dropped then reinstated Claude Code; how to configure
  OpenCode with Ollama in a DevContainer. mainTag: ai. Date: 2026-07-30.
- `ai-explain` — `ai-explain` zsh function: ELI5 for any script/error in the terminal, series
  finale of "Ollama daily use". Slug: `ollama-ai-explain`. Date: 2026-10-06.
- `caddy` — Caddy reverse proxy with auto-TLS, as a Docker container. mainTag: docker. Date: 2026-09-15.
- `direnv` — auto-load `.env` per project on `cd`. mainTag: linux. Date: 2026-08-11.
- `git-interactive-rebase` — `git rebase -i` to clean commit history before push. mainTag: git. Date: 2026-09-01.
- `hyperfine` — command-line benchmarking tool. mainTag: linux. Date: 2026-08-25.
- `linux-yq` — yq (jq for YAML), Docker-based. mainTag: linux. Date: 2026-08-04.
- `mcp-python-server` — build a Python MCP server giving Claude Code Docker superpowers. mainTag: ai. Date: 2026-09-29.
- `navi` — interactive cheatsheet tool + fzf. mainTag: linux. Date: 2026-08-18.
- `open-webui-advanced` — Open WebUI beyond chat: RAG, model presets, Python Functions. mainTag: ai. Date: 2026-09-22.
- `ssh-proxyjump` — SSH ProxyJump bastion + LocalForward + ZSH/fzf function. mainTag: ssh. Date: 2026-09-08.
- `xdebug-docker-vscode` — Xdebug 3.x step-debugging in Docker from VSCode. mainTag: php. Date: 2026-12-31.
- `ollama-refactor-code` — **staged only**, a full Python project (source files under `files/`) for a
  future post on a local-LLM code refactoring/analysis tool; no `index.md` written yet
- `lazydocker` / `portainer` / `traefik` — new 3-part mini-series (created 2026-07-27), proposed after
  Christophe asked for daily-workflow Docker image ideas. Hard `<Link>` dependency chain in this exact
  order: lazydocker → portainer → traefik (each later one links to the earlier ones). `lazydocker`
  containerizes the TUI itself (own Dockerfile + global wrapper script mounting `$PWD`), `portainer`
  uses the official `portainer-ce` image, `traefik` is the reverse-proxy-by-labels piece routing to
  Portainer and Open WebUI (from `ollama-installation`). `portainer` also hard-links to
  `anythingllm-chat-with-your-docs` (still unpublished) — publish order noted in `plan.md`. None of the
  three has been build-tested yet; see `plan.md` for the pre-publish checklist (version pin check,
  missing screenshots).
