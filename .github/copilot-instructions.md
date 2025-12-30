# GitHub Copilot / AI agent instructions for this repo

Purpose: give a succinct orientation to any AI coding agent so it can be productive immediately — how the site is built, tested, and deployed, and which project-specific conventions to follow.

## Big picture (high level)

- This is a **Docusaurus v3 blog site** (single-site, blog-focused). The site uses the `classic` preset with only the blog enabled (see `docusaurus.config.js`).
- The codebase contains several **custom plugins** in `/plugins` that are essential to site behavior (series routing, tag routes, snippet loading, RSS feed generation, remark plugins for term replacement and snippet injection). Inspect `plugins/*` when adding routing/remark behavior.
- Static builds land in the `build/` directory. Production is typically packaged as a Docker image (see `Dockerfile` and `make` targets).

## Where to look first (useful files)

- `docusaurus.config.js` — site config, presets, plugin registration, Prism languages, `onBrokenLinks` semantics.
- `package.json` — Node/yarn scripts: `yarn start`, `yarn build`, `yarn deploy`.
- `Makefile` — canonical developer workflows (devcontainer, build flavors, helper scripts like `tags-manager` and `yaml-manager`). Prefer `make` targets for everyday tasks.
- `plugins/` — custom Docusaurus plugins (important: `docusaurus-plugin-series-route`, `remark-snippet-loader`, `blog-feed-plugin` etc.).
- `.scripts/` — project-specific utilities (tag manager, yaml-manager, extract-inline-snippets, image checks).
- `.devcontainer/` — devcontainer setup and compose files for local development.
- `.github/workflows/deploy.yml` — GitHub Actions deploy pipeline (builds with Node 20 and deploys `build/` via FTP).

## Developer workflows & concrete commands (copy-paste)

- Local dev server: `yarn start` (or `make devcontainer` then run inside the devcontainer and visit `https://localhost:3000`).
- Local production build: `yarn build` (outputs to `build/`).
- Production Docker build & run (recommended):
  - `TARGET=production make build`
  - `TARGET=production make up` (runs the production image and publishes `https://localhost`).
- Devcontainer workflow: `make build && make devcontainer` then in VS Code run **Dev Containers: Rebuild without cache and Reopen in Container**.
- Helper scripts (via `make`):
  - `make tags-manager ARGS="list"` / `ARGS="rename old,new"` / `ARGS="delete tag"`
  - `make yaml-manager ARGS="check-seo"` (see `make help` for full options)
  - `make add-date` — populate missing `date:` front matter using the blog folder tree
  - `make check-images` — run image checks in a Playwright container
  - `make snippets` and `make extract-inline-snippets` — manage `<Snippet>` content

## Project-specific conventions & patterns

- Blog content pattern: `blog/YYYY/MM/DD/slug/index.md` (many scripts assume this layout).
- Drafts/unpublished posts: files under `**/.unpublished/**` are excluded from production builds (the config sets `exclude: isProd ? ["**/.unpublished/**"] : []`).
- Snippets system:
  - Use `<Snippet filename="..." source="..." />` to reference external snippet files; inline `<Snippet>...</Snippet>` blocks can be extracted by `.scripts/extract_inline_snippets.py`.
  - The project expects a `Snippet` component at `src/components/Snippet/index.js` (used by the remark-snippet-loader plugin). See `src/components/Snippet/readme.md` for props and behavior.
- Plugins use both `.cjs` and `.mjs` modules — follow the existing style when authoring new plugins.
- The RSS feed is produced by `plugins/blog-feed-plugin` (post-build HTML scraping + cleaning). If adding UI elements to blog pages, update `stripSelectors` config in the plugin to avoid UI noise in feeds.
- Tags manager rules: merge exceptions in `.scripts/tags-manager.py` must be lowercase and sorted (see `MERGE_EXCEPTIONS`).
- `docusaurus.config.js` intentionally sets `onBrokenLinks: 'ignore'` because the site creates dynamic routes via plugins — do not switch to `throw` without confirming all dynamic routes are recognized.

## CI / Deployment notes

- GitHub Actions run on pushes to `main`. The workflow uses `setup-node` and `yarn build`, and then uploads `./build/` via `SamKirkland/FTP-Deploy-Action`. Secrets used: `ftp_server`, `ftp_login`, `ftp_password`.
- CI installs packages with `yarn install --frozen-lockfile` when cache is missed — follow that pattern locally to reproduce builds.
- The workflow has a small guard: it skips deploys if commit message starts with `wip` (see `if: startsWith(github.event.head_commit.message, 'wip') == false`).

## How to make safe changes (rules for AI agents)

- If you change or add a plugin, update `docusaurus.config.js` to register it and add a short README under `plugins/<your-plugin>/readme.md` describing intent and lifecycle hooks used.
- When editing front matter across many posts, prefer `make yaml-manager` or `make tags-manager` rather than ad-hoc global regex replacements.
- When modifying the Snippet loader or its path resolution, verify both path modes: relative to MDX file (`./...`) and project-root (`src/...`).
- Run `yarn build` locally and verify `build/` output contains expected pages; check RSS at `build/blog/rss.xml` if you touched feed-related code.
- If you add new UI wrappers or DOM changes to blog templates, update `plugins/blog-feed-plugin` `stripSelectors` to keep RSS clean.

## Quick references (files to open first)

- `docusaurus.config.js` 🔧
- `Makefile` 🔁
- `plugins/*` 🔌
- `.scripts/*` 🧰
- `src/components/Snippet/*` ✂️
- `.github/workflows/deploy.yml` 🚀
