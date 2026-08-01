---
name: project-article-proposals
description: Proposed but not-yet-written article topics for the WSL2/ZSH/Git/Docker/FZF workflow series
metadata:
  node_type: memory
  type: project
  originSessionId: 708860e8-3efc-4d08-a254-45060a383296
  modified: 2026-07-27T18:04:15.921Z
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

### [x] ai-explain <file|text>: ELI5 explanation of a script or stack trace in the terminal

- Terminal-only companion to the already-published `docusaurus-eli5-snippet-tooltips` component
- **Draft written: `/opt/docusaurus/.unpublished/ai-explain/index.md`**
- Publish AFTER the rest of the Ollama series (11 articles) — it's the series finale

## Cross-cluster "bridge" articles (proposed + drafted 2026-07-27)

Christophe asked to analyze the whole blog and identify new articles that would bridge two or more
currently-disconnected topic clusters, specifically to create inter-linking opportunities. First round
verified via grep (no false gaps): AI×VBA/Access/Excel, AI×doc-as-code, AI×GitHub Actions,
security×pre-commit, Oracle×doc-as-code. Christophe picked ai-diagram + ai-secrets from that round,
then asked for a second round along different axes: Docker+Python+Data, Docker+PHP ("an amazing image
I haven't covered"), Security+Python — all three also verified via grep before proposing, all picked.

### [x] ai-diagram <description>|<file>: plain-English or config file → Mermaid diagram

- Series member (Ollama daily-use functions). Bridges ai × doc-as-code
- Verified `/blog/docker-python-mermaid` is pure Python/rule-based, zero AI, before proposing — genuine
  gap, not overlap
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-diagram/index.md`

### [x] ai-secrets: hardcoded credential/API key detection in staged changes

- Series member. Regex pre-filter + LLM contextual judgment (real leak vs. safe `getenv()` pattern).
  Bridges security × ai/pre-commit; doubles the blog's `security` mainTag (was 1 post total)
- Hard-links to `/blog/ollama-ai-review` — must publish after it
- Draft written: `/opt/docusaurus/.unpublished/ollama-ai-secrets/index.md`

### [x] DuckDB: query JSON/CSV files with SQL, no database required

- **Not** in the Ollama series — no LLM involved. Bridges docker × python × data
- Hard-links to `/blog/docling` and `/blog/ollama-ai-data` (twice) — must publish after both
- CLI binary download URL/version verified for real via the GitHub releases API, not guessed
- Draft written: `/opt/docusaurus/.unpublished/duckdb-json-csv/index.md`

### [x] Xdebug in Docker + VSCode: step-through PHP debugging

- **Not** in the Ollama series. Bridges docker × php × vscode — the surprise gap: despite a large
  existing Docker+PHP+VSCode cluster (`php-devcontainer`, `vscode-devcontainer`, `frankenphp-...`),
  verified via grep that no article covered interactive step-debugging before this
- Zero draft dependencies — freely placeable in the publish order
- Draft written: `/opt/docusaurus/.unpublished/xdebug-docker-vscode/index.md`

### [x] Bandit + pip-audit: Python security tooling in Docker

- **Not** in the Ollama series. Bridges security × python, Python-side sibling of
  `/blog/php-jakzal-phpqa`. Verified via grep that neither Bandit nor pip-audit/safety were mentioned
  anywhere on the blog before proposing
- Hard-links to `/blog/docling`
- Draft written: `/opt/docusaurus/.unpublished/python-security-bandit-audit/index.md`

## "Daily-workflow Docker images" mini-series (proposed + drafted 2026-07-27)

Christophe asked for Docker images beyond what's already covered that fit his daily Docker-heavy
workflow. Shortlisted lazydocker, Portainer and Traefik as the strongest fits (also considered and
rejected for now: dive, Trivy, Vaultwarden, SearXNG, code-server — no drafts started for those).

### [x] lazydocker: containerized TUI dashboard for Docker

- Complements the fzf-based `dex`/`dstop`/`dlogs` functions from `zsh-docker-functions` — "look at
  everything" vs. "act on one thing I already picked"
- Own Dockerfile (alpine + docker-cli + pinned-version binary download) + global wrapper script
  mounting `$PWD` so project detection works from any folder
- Draft written: `/opt/docusaurus/.unpublished/lazydocker/index.md` — first of the 3-part chain, others
  link back to it

### [x] portainer: official web dashboard, browser instead of terminal

- Same Docker-socket data as lazydocker, but reachable from any device on the LAN (or a teammate)
- Official `portainer/portainer-ce:lts` image, no custom build needed
- Draft written: `/opt/docusaurus/.unpublished/portainer/index.md` — hard-links to `lazydocker` and to
  the still-unpublished `anythingllm-chat-with-your-docs`

### [x] traefik: reverse proxy by Docker labels, demystified

- Christophe's own framing: never really grasped Traefik before this. Built around 4 core concepts
  (entrypoints, providers, routers, services) rather than a copy-paste recipe
- Routes to Portainer and Open WebUI (from `ollama-installation`) using real hostnames + mkcert-issued
  local TLS instead of raw ports
- Draft written: `/opt/docusaurus/.unpublished/traefik/index.md` — last of the 3-part chain, hard-links
  to both `lazydocker` and `portainer`

## VSCode workflow optimization (proposed 2026-07-27, refined and drafted same day)

Christophe uses VSCode 7 days a week, all day — asked what's missing given 18 already-published VSCode
articles ([[project-blog-coverage]] now has the full list). All five surviving ideas are now written as
drafts in `.unpublished/`; two ideas he explicitly rejected are recorded so they don't get re-proposed.

### [x] GitLens: inline blame, file history, branch comparison

- Confirmed biggest gap — no Git-in-editor article despite strong existing Git content (`git-worktree`,
  `git-delta`, `git-bisect` draft)
- Draft written: `/opt/docusaurus/.unpublished/vscode-gitlens/index.md`

### [x] User Snippets — documents the real file, not a hypothetical

- Walks through Christophe's actual `.vscode/markdown.code-snippets` (referenced live via
  `<Snippet source=".vscode/markdown.code-snippets">`, not copied) — flags two stale entries,
  `CoreConcept`/`HighlyImportant`, that predate the `AlertBox`-variant consolidation ([[project-components]])
- Draft written: `/opt/docusaurus/.unpublished/vscode-snippets-for-docusaurus/index.md`

### [x] VSCode Profiles — documents Christophe's real dual-profile setup

- His actual daily setup: default profile forces a **dark** theme; a second profile named
  **"DevContainer"** forces **light**, and has **Claude Code installed only in that profile**
- Draft written: `/opt/docusaurus/.unpublished/vscode-profiles/index.md`

### [x] Multi-root workspaces (`.code-workspace`) + git worktree

- Follow-up to the published `git-worktree` article's "open a new window per worktree" ending
- Draft written: `/opt/docusaurus/.unpublished/vscode-multi-root-git-worktree/index.md`

### [x] Extension Bisect

- Built-in `Help: Start Extension Bisect`; deliberate callback to the still-unpublished `git-bisect`
  draft (same binary-search idea, different target) — hard `<Link>` dependency, `git-bisect` must
  publish first, see `plan.md`
- Draft written: `/opt/docusaurus/.unpublished/vscode-extension-bisect/index.md`

### [~] Settings Sync — discarded

- Christophe: "pas besoin" (2026-07-27)

### [~] Tasks (`tasks.json`) — discarded

- Christophe: "pas besoin" (2026-07-27)

### Correction applied to a published article: `ollama-installation`'s Continue section (2026-07-27)

- Not a new proposal — the **published** `/blog/ollama-installation` covers Continue+Ollama, Christophe
  asked to verify and then fix it. Applied: config migrated from deprecated `.continue/config.json` to
  `~/.continue/config.yaml`, an `AlertBox` added noting Continue's acquisition by Cursor and frozen
  repo status, model recommendation swapped from `gemma2:27b` to his actual current `qwen3-coder:30b`,
  `updates:` frontmatter entry added. Full details in [[project-blog-coverage]].

### [ ] SSH ProxyJump and tunnels: reach internal services via bastion

- `ProxyJump` in `~/.ssh/config`, `LocalForward` for DB/port tunneling
- FZF interactive tunnel launcher (ZSH function `stun`)
- Complements existing SSH series (`ssh_with_fzf`, `zsh-plugin-ssh-config-suggestions`)
- **Confirmed by Christophe 2026-07-31 — priority: high**

## New proposals confirmed by Christophe 2026-07-31

### [x] direnv: auto-load .env per project on cd

- `eval "$(direnv hook zsh)"`, `.envrc` with `dotenv`
- Complements `bash-load-env` (manual) with an automatic approach
- Use case: different Docker Compose vars per project without `source .env`
- **Draft written: `/opt/docusaurus/.unpublished/direnv/index.md`**

### [ ] ai-explain <file|text>: ELI5 of a script or stack trace in the terminal

- Terminal companion to the already-published `docusaurus-eli5-snippet-tooltips` component
- Last unwritten function of the "Ollama daily-use functions" series
- **Confirmed: to write, fits naturally at the end of the Ollama series**

### [x] git interactive rebase: clean up history before pushing

- `git rebase -i`, squash/fixup/reword/drop, `autosquash` with `--fixup` commits
- Bridges `git-delta` (published) and the still-unpublished `git-bisect` draft
- **Draft written: `/opt/docusaurus/.unpublished/git-interactive-rebase/index.md`**

### [x] yq: YAML processor — the jq you need for Docker Compose files

- Same mental model as the existing `/blog/linux-jq` article, but for YAML
- Practical use cases: read/edit `compose.yaml`, transform CI config, merge YAML files
- Natural bridge: linux × docker
- **Draft written: `/opt/docusaurus/.unpublished/linux-yq/index.md`**

### [x] hyperfine: CLI benchmarking — is my optimization actually faster?

- Warm-up runs, export to CSV/Markdown, comparison between commands
- Docker use case: compare image build strategies
- **Draft written: `/opt/docusaurus/.unpublished/hyperfine/index.md`**

### [x] navi: interactive cheatsheet tool with fzf

- `.cheat` files, fzf picker, community repo (tldr-like but executable)
- Bridges fzf × zsh × bash — natural companion to `fzf-ripgrep` and `modular-zsh-workflow`
- **Draft written: `/opt/docusaurus/.unpublished/navi/index.md`**

### [x] Caddy: zero-config HTTPS web server as Docker container

- Auto-HTTPS via ACME, `tls internal` for dev, reverse proxy, multi-domain Caddyfile
- **Draft written: `/opt/docusaurus/.unpublished/caddy/index.md`**

### [x] MCP (Model Context Protocol): practical Python server for Claude Code

- FastMCP, `docker-inspector` server with 6 tools (list containers, logs, inspect, images, compose services, exec)
- `settings.json` integration — server code NOT tested against real Claude Code — verify paths before publish
- **Draft written: `/opt/docusaurus/.unpublished/mcp-python-server/index.md`**

### [x] Open WebUI: beyond the basics — RAG, model presets, Functions

- Model presets, Knowledge RAG, web search, Python Functions plugin system
- `tried_it: false` — UI-heavy article, verify against actual instance before publishing
- **Draft written: `/opt/docusaurus/.unpublished/open-webui-advanced/index.md`**

### [x] SSH ProxyJump + tunnels: reach internal services via bastion

- `ProxyJump` in `~/.ssh/config`, `LocalForward`, ZSH function `stun` with fzf
- **Draft written: `/opt/docusaurus/.unpublished/ssh-proxyjump/index.md`**
