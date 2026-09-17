# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What this repo is

A personal technical blog powered by **Docusaurus 3.x**, written by Christophe Avonture (cavo789).
Topics: Docker, WSL, Bash, PHP, development tools, AI/Ollama, VS Code, and more.
Blog content is authored in American English; conversation with Claude can be in French.

**The site is bi-locale since 2026-09-16**: `en` is the default, `fr` is served under `/fr/`.
French articles are AI translations living in `i18n/fr/`, never hand-authored there. Anything
that touches a URL, a route or a path is affected — read `.claude/rules/i18n-locale-safety.md`
before editing a plugin, a theme component or `docusaurus.config.js`.

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
yarn translate <path>   # translate ONE article (low-level; prefer the `translate` function below)
yarn translate:check    # translation freshness: fresh / minor / stale, per article
yarn translate:plan <p> # what a `translate <p>` run would do and cost — offline, spends nothing
yarn eli5               # generate ELI5 summaries (requires Ollama)
```

### Translating articles — use `translate`, not `yarn translate`

`translate` is a shell function in `.devcontainer/scripts/helpers/translation.sh`, loaded by
`interactive.sh` (category `Translation` in the startup cheatsheet). It is what the author uses;
`yarn translate` is the single-article script underneath it.

```bash
translate blog/2026/09/17/docling      # one article — folder or index.md, both work
translate blog/2026/09                 # every article in a month
translate blog/2026                    # every article in a year
translate <path> --force               # redo a translation that is already up to date
translate <path> --repair              # fix a BAD translation (see below)
```

It resolves a path to every `index.md`/`index.mdx` underneath it, then asks
`scripts/translate-plan.mjs` what that run would **actually** do — and **prompts with that count
and its cost before spending anything** whenever more than one article needs an API call. Articles
already up to date never reach the prompt: `translate blog/2024` on a fully translated year prints
`✅ Nothing to do — 108 article(s) already up to date` and exits 0, instead of quoting 17.28 $ for
work that would not happen. When exactly one article needs work — the everyday case, right after
publishing — it runs straight through.

The plan is pure filesystem work (hashes, drift, and under `--repair` the validator): it never
constructs the Anthropic client, so `yarn translate:plan blog` is free and is the honest answer to
"what is left to translate?". `yarn translate:check` answers the neighbouring question — how stale
each existing translation is.

Three cost behaviours worth knowing, because they decide what a command actually bills, and which
the plan mirrors state by state (`NEW`, `PATCH`, `FULL`, `UP_TO_DATE`, `REPAIR`/`CLEAN`):

- **Unchanged article → no API call at all.** The sidecar's hash is compared first; the Anthropic
  client is never even constructed.
- **Changed article → incremental patch, not a retranslation.** Under 15% drift, the script sends
  a locally computed diff plus the current French and asks for a list of edits. Measured: 0.055 $
  against 0.263 $ for a full retranslation. Every edit is anchor-verified and revalidated, and any
  failure falls back to a full translation — a patch can only ever save money.
- **`--repair` covers what the hash cannot see**: the English never changed but the translation is
  wrong (headings left in English, say). It runs the validator on the stored file and turns its
  findings into a work order. Costs about half a `--force`, and exits free when nothing is wrong.

Only `title` and `description` count as translatable front matter. Changing `tags`, `date`,
`image`, `mainTag` or `review_date` does **not** trigger anything.

**Quality gate before every commit:** `yarn lint && yarn format:check && yarn build`.
There is no automated test suite for components — testing components means building and reviewing them visually.

### Dev server — never manage it directly

`docker-entrypoint.sh` already starts Docusaurus in the background on container boot
(`HTTPS=true SSL_CRT_FILE=... SSL_KEY_FILE=... yarn start --host 0.0.0.0 --port 3000 &`), and
`postStartCommand` in `devcontainer.json` blocks until `https://localhost:3000/` answers. That
process is what the user's browser is already pointed at.

**Never run `yarn start`, `yarn docusaurus start`, or kill whatever is on port 3000 via the Bash
tool.** Doing so kills the entrypoint's correctly-configured HTTPS server; a bare re-launch comes
back as plain HTTP bound to `localhost` only, so the browser's TLS handshake then fails silently
("site not responding") even though something is listening on the port.

If the dev server genuinely needs a restart (stale cache, crash, port conflict), use the `start`
function from `.devcontainer/scripts/interactive.sh` — it kills whatever holds port 3000, clears
the cache, and restores the exact `HTTPS`/`SSL_CRT_FILE`/`SSL_KEY_FILE`/`--host 0.0.0.0`
invocation: `bash -c 'source .devcontainer/scripts/interactive.sh; start'`.

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
`require.context` call in `src/components/Blog/utils/posts.ts` — read their comments before
touching either.

Tags must exist in `blog/tags.yml`; authors must exist in `blog/authors.yml`.

### Internationalization (`i18n/`)

```text
i18n/fr/
  code.json                              # 194 UI strings, extracted by `yarn write-translations`
  docusaurus-theme-classic/              # footer.json + navbar.json — these OVERRIDE the config
  docusaurus-plugin-content-blog/        # mirrors blog/ — the translated articles
    YYYY/MM/DD/<slug>/index.md
    YYYY/MM/DD/<slug>/index.md.translation.json   # source hash + the English text at that time
  docusaurus-plugin-content-pages/       # mirrors src/pages/
```

The five pieces that carry it, and the invariant each protects:

- **`plugins/translations-manifest-plugin/`** — the single source of truth for "is this article
  translated?". Docusaurus's i18n **falls back to the English source** when a translation is
  missing, so a `/fr/` route existing proves nothing. Never infer the answer another way.
- **`plugins/i18n-seo-guard/`** — `noindex` + `canonical` + `data-pagefind-ignore` on untranslated
  `/fr/` pages, and strips the `hreflang=fr` alternate from their English counterparts. Without it
  the locale publishes 256 English pages under French URLs.
- **`plugins/remark-i18n-assets/`** — **must stay first** in `beforeDefaultRemarkPlugins`, for both
  `blog` and `pages`. `files/` and `images/` (84 MB) are never duplicated under `i18n/`.
- **`src/components/Blog/utils/translations.ts`** — `isTranslated()` ("readable here", always true
  on `en`) and `hasTranslationIn()` ("a translation exists") are **different questions**.
  Conflating them put a French flag on all 257 English articles.
- **`src/components/Blog/utils/posts.ts`** — `useBlogMetadata()`, not `getBlogMetadata()`, in any
  rendering component. It filters the corpus **and** overlays the translated title/description.

Assets stay with the English source; only `title`, `description` and `language` differ in a
translation's front matter — `slug`, `series`, `tags` and `date` are copied byte for byte, because
translating a `slug` breaks the URL and translating a `series` orphans the article.

Translation tooling: `scripts/translate-post.mjs` + `lib/translate-{contract,validate,hash,anchors}.mjs`.
The validator (10 checks) is what makes it trustworthy — prompt discipline alone lands around 90%.

**Build one locale at a time**: use `.claude/scripts/safe_build.sh <logfile>`. Two concurrent
builds wipe each other's output and the failure looks exactly like a code bug.

### Components

- **`src/components/Blog/`** — blog-domain components (`AlertBox`, `PostCard`, `RelatedPosts`,
  `SeriesCards`, `SeriesPosts`, `Tags`, `Updated`, `OldPostNotice`, `AuthorCard`, `LatestPosts`, …).
  Used by the swizzled `BlogPostItem` theme and by MDX authors.
- **`src/components/`** — generic UI primitives (`Card`, `Terminal`, `Snippet`, `StepsCard`,
  `Trees`/`Folder`/`File`, `TLDR`, `Highlight`, `Details`, `Columns`, `BrowserWindow`,
  `Prerequisite`, `InteractiveCode`, `TriedIt`, `Reaction`, `Bluesky`, `DownloadButton`, …).
  Reusable in any MDX file.

All components: functional, no class components. TypeScript is preferred starting today — new
components are `.tsx`, not `.js`/`.jsx`. Existing JS components are migrated gradually, one at a
time (tracked in `.todos/`); there's no rush and no big-bang rewrite.
Styling: CSS Modules (`styles.module.css`) + Infima variables — no hardcoded hex except where
a token's source of truth requires it (documented via `/* stylelint-disable color-no-hex */`).
Global registration in `src/theme/MDXComponents.js` — usable in MDX without import.
Governance rules in `AGENTS.md` — treat as binding.

### Scripts

`scripts/` holds Node.js utilities:

- `internal-link-opportunities.mjs` — powers `yarn links:audit` / `yarn links:check`.
- `generate-eli5.mjs` / `bulk-eli5.mjs` / `check-eli5-freshness.mjs` — ELI5 summaries via Ollama.
- `generate-icon-bundle.mjs` — icon bundle.
- `lib/cheatsheet-hint.mjs` — every "fix it with…" line a script prints goes through its `cmd()`,
  so the hint names the cheatsheet function (`questions --force <file>`) rather than the yarn
  script underneath it. It falls back to `yarn <script>` when no **exactly equivalent** function
  exists, and reads availability from the helpers' own `# @cmd` annotations — renaming a function
  restores the yarn wording instead of advertising a command that is gone. Under `CI` it always
  prints the yarn form: `helpers/` is in the checkout there too, but no runner sources it.

### Devcontainer shell commands (`interactive.sh`)

The 19 shell commands of the startup cheatsheet (`start`, `translate`, `run_ci`, …) are **not** in
`interactive.sh` itself — that file is only a launcher. One module per cheatsheet category:

```text
.devcontainer/scripts/
  interactive.sh          # launcher: resolves helpers/ relative to itself, sources it, exports, calls welcome
  helpers/
    _cheatsheet.sh        # welcome() + the double awk that parses the @cat/@cmd/@desc annotations
    server.sh             # start, start_fr, static
    maintenance.sh        # build, upgrade, check, format
    metadata.sh           # tags, yaml, links
    ollama.sh             # eli5, faq, questions
    anythingllm.sh        # ai-index, ai-search, ai-index-fr, ai-search-fr
    ci.sh                 # run_ci, _run_ci_links
    translation.sh        # translate
```

A function that duplicates a yarn script should also be declared in `scripts/lib/cheatsheet-hint.mjs`,
so the scripts' own hints point at it.

Adding a command means adding it to the matching module with its three `# @cat` / `# @cmd` /
`# @desc` annotation lines — `welcome` scans every module, so it appears in the cheatsheet on its
own — plus one `export -f` line in the launcher, which is the deliberate single list of the public
surface.

Two things break silently if forgotten, because **the file is loaded from two different paths**
(`/usr/local/bin/interactive.sh`, copied into the image, sourced by `docker-entrypoint.sh`; and the
bind-mounted `.devcontainer/scripts/interactive.sh`, sourced from `.bashrc` by `postCreateCommand`):

- the `COPY` in `Dockerfile` takes the **folder** `.devcontainer/scripts/`, never the single file;
- `.dockerignore` excludes `.devcontainer/`, so `helpers/` needs its own `!` re-inclusion line.

Get either wrong and the image ships a launcher with no modules — every shell in it starts on an
empty cheatsheet. `welcome` listing 19 commands in 7 categories is the fastest check.

### TODO backlog

`.todos/` flat backlog, `NNNN-slug.md` naming (4 digits).
Status subfolders: `DONE/`, `PARTIAL/`, `BLOCKED/`, `WONT_DO/`.
Language: **French** (private, never published).
Format and numbering: **`todo-authoring`** skill — load it before writing any TODO.

`0000-slug.md` files are the exception: standing aggregates, never processed by `/todo` or ranked by
`/todo-plan`. `0000-suggestions-articles-a-publier.md` is the article-idea backlog — maintained by
`/suggestions-add` (append) and `/suggestions-write` (pick + draft + mark done in place), distinct
from `0000-freshness-journal.md`/`0000-reader-review-journal.md` which are pure logs.

### Auto-memory

`.claude/memory/` — Claude's persistent session memory (blog map, conventions, writing style, …).
These files are loaded at conversation start; run `/refresh` to update them after publishing posts.

## Agents, commands, skills, rules — how they connect

- **Agents** (`./claude/agents/`) are read-only reviewers run as isolated subagents. Each is only
  reachable through a matching slash command — there is no other discovery path.
- **Commands** (`./claude/commands/`) are the only self-discoverable layer (`/` autocompletes them).
  Review commands wrap the matching agent; workflow commands (`/todo`, `/todo-add`, `/todo-plan`,
  `/suggestions-add`, `/suggestions-write`, `/freshness`, `/links`, `/refresh`, `/reader_review`,
  `/review_blog`, `/deep_review`, `/tags-review`) drive direct implementation or batch processing.
- **Skills** (`./claude/skills/`) are methodologies Claude loads by contextual trigger or because a
  command/agent explicitly binds one. Never typed directly.
- **Rules** (`./claude/rules/`) load deterministically off a `paths:` glob — every time a matching
  file is touched. Each is a short DO/DON'T extract of its sibling skill, kept in context while
  code is being written.

### Command → agent → skill map

| Command                         | Agent                                | Skill(s)                                                              |
| ------------------------------- | ------------------------------------ | --------------------------------------------------------------------- |
| `/bash-review`                  | `bash-best-practices-reviewer`       | `bash-best-practices`                                                 |
| `/python-review`                | `python-best-practices-reviewer`     | `python-best-practices`                                               |
| `/docker-review`                | `dockerfile-best-practices-reviewer` | `dockerfile-best-practices`, `devcontainer-dockerfile-best-practices` |
| `/docker-dive-optimization`     | _(none)_                             | `docker-image-slimming`                                               |
| `/deep_review`                  | _(none)_                             | _(inline, see command)_                                               |
| `/review_blog`                  | _(none)_                             | _(inline, see command)_                                               |
| `/reader_review`                | _(none)_                             | `reader-first-docs`, `blog-post-structure`                            |
| `/freshness`                    | _(none)_                             | _(inline, see command)_                                               |
| `/links`                        | _(none)_                             | _(inline, see command)_                                               |
| `/refresh`                      | _(none)_                             | _(inline, see command)_                                               |
| `/todo`                         | _(none)_                             | `todo-authoring` (via lock scripts)                                   |
| `/todo-add`                     | _(none)_                             | `todo-authoring`                                                      |
| `/todo-plan`                    | _(none)_                             | _(inline, via `todo_parse_backlog.sh`)_                               |
| `/suggestions-add`              | _(none)_                             | _(inline, see command)_                                               |
| `/suggestions-write`            | _(none)_                             | `blog-post-structure`                                                 |
| _(no command — loaded by rule)_ | _(none)_                             | `safe-install-commands`                                               |
| `/tags-review`                  | _(none)_                             | _(inline, see command)_                                               |

### Rule → skill map

| Rule                                  | Paths                                                                          | Skill                     |
| ------------------------------------- | ------------------------------------------------------------------------------ | ------------------------- |
| `.claude/rules/markdown.md`           | `**/*.md`, `**/*.mdx`                                                          | `markdown-style`          |
| `.claude/rules/bash.md`               | `**/*.sh`, `**/*.bash`, `**/.bash_aliases`                                     | `bash-best-practices`     |
| `.claude/rules/python.md`             | `**/*.py`                                                                      | `python-best-practices`   |
| `.claude/rules/install-commands.md`   | `**/*.md`, `**/*.mdx`                                                          | `safe-install-commands`   |
| `.claude/rules/blog-prose.md`         | `blog/**`, `.unpublished/**`                                                   | `blog-post-structure`     |
| `.claude/rules/i18n-locale-safety.md` | `plugins/**`, `src/theme/**`, `src/components/Blog/**`, `docusaurus.config.js` | _(none — self-contained)_ |
| `.claude/rules/build-verification.md` | `plugins/**`, `scripts/**`, `docusaurus.config.js`                             | _(none — self-contained)_ |

### Known gap

`agents/reader-first-docs-reviewer.md` audits long-form docs (README, CONTRIBUTING) and uses the
`reader-first-docs` skill, but has no corresponding command — it cannot be triggered via `/`.
Note: `/reader_review` already handles _blog articles_ via the same skill; this agent would
cover _project docs_, a different scope. To activate it, add a `reader-first-docs-review.md`
command.

## OCI image labels (for `/docker-review`)

| Label                               | Value               |
| ----------------------------------- | ------------------- |
| `org.opencontainers.image.vendor`   | `cavo789`           |
| `org.opencontainers.image.licenses` | `MIT`               |
| `org.opencontainers.image.authors`  | `cavo789@gmail.com` |
