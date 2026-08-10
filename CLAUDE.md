# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this repo is

A personal technical blog powered by **Docusaurus 3.x**, written by Christophe Avonture (cavo789).
Topics: Docker, WSL, Bash, PHP, development tools, AI/Ollama, VS Code, and more.
All blog content is in American English; conversation with Claude can be in French.

The repo contains three kinds of Dockerfiles:

- `Dockerfile` at the repo root — the **only image that actually runs this project** (`docker compose build docusaurus`, image tag `blog-docusaurus:development`).
- `blog/**/Dockerfile*` and `.unpublished/**/Dockerfile*` — **article example files**, never to be optimized by default.

## Commands

```bash
yarn start              # dev server on http://localhost:3000
yarn build              # full build — catches MDX compile errors and broken internal links
yarn lint               # ESLint (JS) + Stylelint (CSS)
yarn format             # Prettier auto-fix
yarn format:check       # Prettier dry-run
yarn links:audit        # corpus-wide internal-link opportunities (stats mode)
yarn links:check <path> # internal-link check for one article
yarn eli5               # generate ELI5 summaries (requires Ollama)
```

**Quality gate before every commit:** `yarn lint && yarn format:check && yarn build`.
There is no automated test suite for components — testing components means building and reviewing them visually.

## Architecture

### Blog content

```text
blog/YYYY/MM/DD/<slug>/
  index.md          # or index.mdx — the article
  images/           # co-located assets (screenshots, diagrams)
  files/            # co-located code snippets shown via <Terminal source="./files/x.txt">
.unpublished/<slug>/
  index.md          # draft (frontmatter: draft: true) — not published
```

Frontmatter key fields: `slug`, `title`, `description`, `date`, `authors`, `tags`, `mainTag`,
`image`, `draft`, `series`, `seriesOrder`, `ai_assisted`, `updates`, `review_date`.

`draft: true` works in **both** locations. Under `blog/` it means "ready, awaiting the go":
visible in `yarn start`, absent from the production build, listings, RSS and sitemap — so the
article can be committed and pushed, then published later by deleting the single line.
`.unpublished/` is for drafts not yet worth committing to the blog tree at all.
The two plumbing pieces that make this work are `plugins/frontmatter-loader/` and the
`require.context` call in `src/components/Blog/utils/posts.js` — read their comments before
touching either.

Tags must exist in `blog/tags.yml`; authors must exist in `blog/authors.yml`.

### Components

- **`src/components/Blog/`** — blog-domain components (`AlertBox`, `PostCard`, `RelatedPosts`,
  `SeriesCards`, `SeriesPosts`, `Tags`, `Updated`, `OldPostNotice`, `AuthorCard`, `LatestPosts`, …).
  Used by the swizzled `BlogPostItem` theme and by MDX authors.
- **`src/components/`** — generic UI primitives (`Card`, `Terminal`, `Snippet`, `StepsCard`,
  `Trees`/`Folder`/`File`, `TLDR`, `Highlight`, `Details`, `Columns`, `BrowserWindow`,
  `Prerequisite`, `InteractiveCode`, `TriedIt`, `Reaction`, `Bluesky`, `DownloadButton`, …).
  Reusable in any MDX file.

All components: functional, no TypeScript, no class components.
Styling: CSS Modules (`styles.module.css`) + Infima variables — no hardcoded hex except where
a token's source of truth requires it (documented via `/* stylelint-disable color-no-hex */`).
Global registration in `src/theme/MDXComponents.js` — usable in MDX without import.
Governance rules in `AGENTS.md` — treat as binding.

### Scripts

`scripts/` holds Node.js utilities:

- `internal-link-opportunities.mjs` — powers `yarn links:audit` / `yarn links:check`.
- `generate-eli5.mjs` / `bulk-eli5.mjs` / `check-eli5-freshness.mjs` — ELI5 summaries via Ollama.
- `generate-icon-bundle.mjs` — icon bundle.

### TODO backlog

`.todos/` flat backlog, `NNNN-slug.md` naming (4 digits).
Status subfolders: `DONE/`, `PARTIAL/`, `BLOCKED/`, `WONT_DO/`.
Language: **French** (private, never published).
Format and numbering: **`todo-authoring`** skill — load it before writing any TODO.

### Auto-memory

`.claude/memory/` — Claude's persistent session memory (blog map, conventions, writing style, …).
These files are loaded at conversation start; run `/refresh` to update them after publishing posts.

## Agents, commands, skills, rules — how they connect

- **Agents** (`./claude/agents/`) are read-only reviewers run as isolated subagents. Each is only
  reachable through a matching slash command — there is no other discovery path.
- **Commands** (`./claude/commands/`) are the only self-discoverable layer (`/` autocompletes them).
  Review commands wrap the matching agent; workflow commands (`/todo`, `/todo-add`, `/todo-plan`,
  `/freshness`, `/links`, `/refresh`, `/reader_review`, `/review_blog`, `/deep_review`) drive
  direct implementation or batch processing.
- **Skills** (`./claude/skills/`) are methodologies Claude loads by contextual trigger or because a
  command/agent explicitly binds one. Never typed directly.
- **Rules** (`./claude/rules/`) load deterministically off a `paths:` glob — every time a matching
  file is touched. Each is a short DO/DON'T extract of its sibling skill, kept in context while
  code is being written.

### Command → agent → skill map

| Command | Agent | Skill(s) |
| --- | --- | --- |
| `/bash-review` | `bash-best-practices-reviewer` | `bash-best-practices` |
| `/python-review` | `python-best-practices-reviewer` | `python-best-practices` |
| `/docker-review` | `dockerfile-best-practices-reviewer` | `dockerfile-best-practices`, `devcontainer-dockerfile-best-practices` |
| `/docker-dive-optimization` | *(none)* | `docker-image-slimming` |
| `/deep_review` | *(none)* | *(inline, see command)* |
| `/review_blog` | *(none)* | *(inline, see command)* |
| `/reader_review` | *(none)* | `reader-first-docs`, `blog-post-structure` |
| `/freshness` | *(none)* | *(inline, see command)* |
| `/links` | *(none)* | *(inline, see command)* |
| `/refresh` | *(none)* | *(inline, see command)* |
| `/todo` | *(none)* | `todo-authoring` (via lock scripts) |
| `/todo-add` | *(none)* | `todo-authoring` |
| `/todo-plan` | *(none)* | *(inline, via `todo_parse_backlog.sh`)* |

### Rule → skill map

| Rule | Paths | Skill |
| --- | --- | --- |
| `.claude/rules/markdown.md` | `**/*.md`, `**/*.mdx` | `markdown-style` |
| `.claude/rules/bash.md` | `**/*.sh`, `**/*.bash`, `**/.bash_aliases` | `bash-best-practices` |
| `.claude/rules/python.md` | `**/*.py` | `python-best-practices` |

### Known gap

`agents/reader-first-docs-reviewer.md` audits long-form docs (README, CONTRIBUTING) and uses the
`reader-first-docs` skill, but has no corresponding command — it cannot be triggered via `/`.
Note: `/reader_review` already handles *blog articles* via the same skill; this agent would
cover *project docs*, a different scope. To activate it, add a `reader-first-docs-review.md`
command.

## OCI image labels (for `/docker-review`)

| Label | Value |
| --- | --- |
| `org.opencontainers.image.vendor` | `cavo789` |
| `org.opencontainers.image.licenses` | `MIT` |
| `org.opencontainers.image.authors` | `cavo789@gmail.com` |
