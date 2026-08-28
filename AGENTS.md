# Gemini Code Assist - Governance Guidelines

This document outlines the governance guidelines to be followed for maintaining code quality and consistency across the project.

## Project Overview

- **Name:** cavo789/blog
- **Stack:** Docusaurus (Latest version), React, JavaScript (ES6+).
- **Goal:** Personal technical blog focused on high-quality, clean, and modular code.
- **Production URL:** https://www.avonture.be
- **Repository:** https://github.com/cavo789/blog
- **Development URL:** http://localhost:3000

## Coding Standards & Philosophy

- **Modular Design:** Follow the Single Responsibility Principle (SRP). Keep components and functions short and focused.
- **Strict Typing:** Always use ReactJS for React components. As much as possible prefer self-describing code. Add proper type annotations. Add prop-types.
- **Language:**
  - **Code & Comments:** Strictly **American English**. No French comments or documentation allowed within the codebase.
  - **Content:** The blog posts are written in **American English**. Always suggest correction if you see typos or better way to write things.
- **Styling:** Support both Dark and Light modes using Docusaurus/Infima CSS variables. Avoid hardcoded hex colors. Use CSS files instead of inline styles.

## React & Docusaurus Best Practices

- **Functional Components:** Use React functional components with Hooks.
- **TypeScript preferred:** New components are written in TypeScript (`.tsx`). Don't create new
  `.jsx`/`.js` components. Existing JS components are migrated gradually, file by file — see
  `.todos/` for the migration backlog. PropTypes are for JS components only; TS components rely on
  their type annotations instead (checked via `tsc --noEmit`, wired into `yarn lint`).
- **Modular CSS:** Prefer CSS Modules or Docusaurus-native styling approaches.
- **Component Structure:** Store reusable components in `@site/src/components`.
- **Performance:** Optimize builds using multi-stage Docker builds (BuildKit).
- **Docusaurus version:** Always use the latest stable version of Docusaurus.

## Tooling & Quality Control

- **Linters:** Code and Markdown must be compatible with strict linting (ESLint, Prettier, Dockerlint, Markdownlint).
  - JS/JSX: `eslint.config.mjs` (functional-components + Hooks rules, PropTypes). Run via `yarn lint:js`, or `yarn lint` from the devcontainer terminal (also runs stylelint, TS type-checking and the snippet-source check); `verify` bundles that with the pre-commit hooks and a full production build.
  - TS/TSX: same `eslint.config.mjs` (typescript-eslint recommended rules) plus `tsconfig.json` for real type-checking. Run via `yarn lint:types` (`tsc --noEmit`), included in `yarn lint`.
  - CSS: `.stylelintrc.json` (`stylelint-config-standard` + a `color-no-hex` warning pointing at `.todos/039-hardcoded-hex-colors-no-token-system.md`). Run via `yarn lint:css`.
  - Formatting: `.prettierrc.json` is configured but the existing codebase hasn't been reformatted yet (`yarn format:check` currently fails on ~166 pre-existing files) — not yet wired into CI, run manually.
  - CI: `.github/workflows/quality.yml` runs `yarn lint` on every push/PR, separate from `deploy.yml` so a lint failure never blocks publishing the live site.
  - Pre-existing violations are tracked as warnings (JS: `react/prop-types` — see `.todos/040-inconsistent-proptypes-coverage.md`) rather than fixed en masse, to avoid unrelated churn in this change.
  - `color-no-hex` exceptions: a hex value is legitimate (not "hardcoded instead of a token") when it **defines** a token's source-of-truth value (e.g. the `--ifm-color-primary*` palette in `src/css/custom.css`, or a component's own `--*` custom-property palette like `AlertBox`), or when a color is deliberately theme-independent (external brand identity — `Snippet`'s per-language border colors; a UI element that intentionally always looks the same regardless of site theme — `Terminal`, the ELI5 code block). These are marked with `/* stylelint-disable color-no-hex */` / `stylelint-enable`, each with a one-line comment explaining why. Everywhere else, prefer an existing Infima variable (check `node_modules/infima/dist/css/default/default.css` for semantic tokens like `--ifm-color-{info,success,warning,danger}[-contrast-background|-contrast-foreground|-dark]` before inventing a new hardcoded value — see `.todos/039-hardcoded-hex-colors-no-token-system.md` for the reasoning and worked examples).
- **Docker:**
  - Always use `compose.yaml` (no version key; no obsolete fields/syntax).
  - Optimize layers and use host volume caching.
  - Containers must be read-only where possible with `tmpfs`.
  - Use `id_ed25519.pub` for SSH-related configurations.
- **DevContainer:** Use the provided `.devcontainer/devcontainer.json`. Ensure UID/GID are detected dynamically (don't use hardcoded UID/GID).

## AI Interaction Instructions

1. **Critical Coach:** Act as a critical coding partner. If a proposed solution is not "best-in-class," suggest a better alternative. Code quality is the key.
2. **Concise Responses:** Be direct and practical. Focus on code quality and technical accuracy.
3. **No Legacy:** Do not suggest obsolete Docker fields or old React patterns (no Class components).
4. **Validation:** Before providing code, ensure it passes theoretical strict typing and follows the modular architecture of the project.

## Docker-First Approach

A **Docker-first** methodology is mandatory. All development, testing, and deployment processes should be containerized to ensure a consistent and reproducible environment. Please refer to the existing `Dockerfile` and `compose.yaml` files as a baseline.

## Blog Content Guidelines

- **Language:** All blog posts must be written in clear, concise American English.
- **Structure:** Follow the established format for blog posts: `YYYY/MM/DD/slug/index.md'.
- **Article structure (reader-first):** A reader has one minute and decides to stay or leave before scrolling twice. So: **show the result before asking for any installation** — a real terminal output, screenshot or diagram must appear within the first screen after `<!-- truncate -->`; keep implementation code out of the first half (prerequisites and source belong in the _Installation_ section, not at the top); mark internals sections as skippable (`## Under the Hood (skip this if you just want to use it)`); always land on a recap plus a pointer to what's next. The canonical seven-movement order, the visual ladder and the anti-patterns live in `.claude/skills/blog-post-structure/SKILL.md` — read it before writing or restructuring a post. Audit an existing article or a batch with `/reader_review`.
- **Relative Resources:** Use relative paths like `./files/` or `./images/` for files to include or images (Co-location pattern).
- **Browser screenshots (mandatory):** Any screenshot showing a page rendered in a web browser must be wrapped in the globally registered `BrowserWindow` component (no import needed), with the `url` prop set to the **exact** address the reader is told to visit in the surrounding prose — the address bar is part of the demonstration, not decoration. It costs two lines and gives the capture a real visual frame: `<BrowserWindow url="http://localhost:8080">` / `  ![Alt text](./images/screenshot.webp)` / `</BrowserWindow>`. This applies to web UIs, admin panels, dashboards and raw API responses viewed in a browser. It does **not** apply to captures of desktop applications (Docker Desktop, VS Code, a terminal, Excel, a file explorer) — those stay plain images. Don't add `className="screenshot"` to an image already inside a `BrowserWindow`: `.screenshot` brings its own border, shadow and `max-width: 80%`, which double-frames and shrinks the capture inside the window body. Without it the capture fills the window edge to edge, so it reads as being **in the browser** rather than floating **in the article** — which is the whole point of the component. Crop the browser chrome (title bar, tabs, address bar) out of the screenshot itself: `BrowserWindow` already draws it, and showing it twice is redundant. The exception is a capture whose subject **is** the chrome — an annotated tab, a security badge, several overlapping windows on different ports: leave those uncropped, and consider whether they belong in a `BrowserWindow` at all.
- **Import code snippets:** Use the `Snippet` component to import code snippets from external files for better maintainability. Don't use inline code blocks but create separate files in the `files/` sub-folder. For instance, instead of writing code directly in the blog post, create a file like `files/example.js` and import it using the `Snippet` component like this: <Snippet filename="example.js" source="./files/example.js" defaultOpen={false} />.
- **ProjectSetup:** Use the `ProjectSetup` component for setup instructions.
- **Unpublished Posts:** These are posts that are not yet ready for publication and should be excluded from the main blog feed. They are stored in the `.unpublished/` directory. Ensure that these posts are properly marked (i.e. with `Draft: true` in their frontmatter) and not linked from published content.
- **Internal links (mandatory):** No article is finished until it links to other articles of this blog. Aim for **2 to 4 internal links** in a normal-length post, placed **inline in the prose**, at the first place the topic is named — never as a "See also" list at the end, the `RelatedPosts` grid already covers the bottom of the page. Use the globally registered `Link` component (no import needed): `<Link to="/blog/slug">…</Link>`. Add the **reciprocal link** in the older article when it makes sense. This applies to `.unpublished/` drafts too: a draft that links nowhere becomes an orphan the day it is published. Check an article with `yarn links:check blog/YYYY/MM/DD/slug` (exits 1 when the article links nowhere, and lists articles whose topic the prose already names without linking to them); `yarn links:audit` prints the site-wide audit. The `internal-links` job of `.github/workflows/quality.yml` runs the same check on every added or modified article, as a non-blocking annotation.
- **Reader-adjustable values (`Vars`):** When an article repeats the same value across several commands (a host port, a container name, a version) and the reader is expected to adapt it to their own machine, declare it once near the top of the article with `<Vars port="8080" name="mysite" />`, then mark every occurrence inside a `<Terminal>` or `<Snippet>` block with `%%name=default%%` (e.g. `-p %%port=8080%%:80`) instead of typing the literal value. The reader edits the value once in the bar the component renders, and every marked occurrence on the page updates live; without any interaction the page is byte-identical to a hardcoded article, because the default lives inside the marker itself. **Not** `{{name:default}}`: a `<Terminal>`/`<Snippet>` used with literal inline MDX children (no `source=`) has its content parsed as MDX, and a bare `{` there opens a JS expression rather than staying literal text. **Not** a colon either (`%%port:8080%%`): `plugins/markdown-export-plugin/degrade.cjs` parses the raw article with `remark-directive` (for `:::tip` admonitions), which false-positives on any `word:word` text as an inline directive — a colon-separated marker would log a spurious "unknown directive" warning on every occurrence. See `src/components/Vars/substitute.js` for the full reasoning. Scope is deliberately narrow — declarative, never guessed:
  - Only `<Terminal>` and `<Snippet>` resolve markers. A raw ` ``` ` fenced code block is not scanned; use `<Snippet>` instead if a value inside it should be reader-adjustable.
  - An inline single-backtick code span in prose (`` `docker run ... -p 8080:80` `` written directly in a sentence) is never auto-rewritten, even if the same value is marked elsewhere on the page. Scanning free-form prose for values that merely look like a marked one risks rewriting a sentence that was describing something else — the same "never guess" reasoning behind the marker syntax itself. If a prose sentence genuinely states the value as a fact the reader would expect to update alongside the commands (e.g. "the `kingsbridge` name won't be considered"), use `<Var name="name">kingsbridge</Var>` instead of a code span — a real component, not a scanned marker, that resolves the same store `<Terminal>`/`<Snippet>` read from. Its child is a plain default string, never a `%%...%%` marker (there is nothing to parse there). Reserve it for sentences that state the value as a fact, not every passing mention — wrapping every word turns prose into a wall of dotted underlines.
  - `<Vars>`'s own prop values must match the corresponding marker defaults exactly (`<Vars port="8080" .../>` next to `%%port=8080%%`) — they're independent sources of truth by design (see `substitute.js`), and a mismatch means the bar's default and the command's default silently disagree.

- **Homepage:** The homepage is located in `src/pages/index.mdx`. Any changes to the homepage layout or content should be made here.
- **Syntax:** Prefer Markdown to HTML for blog content. Use MDX only when necessary for embedding React components.
- **Update history:** To log a post's revision history, add an `updates:` array to the frontmatter, e.g. `updates: [{date: "2026-01-03", note: "Review and update YAML files to Joomla 6"}]`. It is rendered as a timeline by the `Updated` component (`src/components/Blog/Updated/index.js`) and also drives `dateModified` in the SEO structured data (`src/components/StructuredData/index.jsx`) and the "old post" warning threshold (`src/components/Blog/OldPostNotice/index.js`).

## Project Structure & Infrastructure

### Infrastructure

- **Docker:** The project uses a multi-stage `Dockerfile` (base, dependencies, development, build, production) and `compose.yaml` for orchestration.
- **Automation:** A `makefile` is used to simplify common commands (`make build`, `make up`, `make devcontainer`).
- **Development Environment:** VSCode DevContainers are supported for a consistent development experience.
- **Deployment:** GitHub Actions are used for CI/CD, deployment is coded in file .github/workflows/deploy.yml.

### Directory Structure

- **Blog Posts:** Located in `blog/`. Format: `YYYY/MM/DD/slug/index.md`.
- **Components:** Custom React components are located in `src/components/`.
- **Data:** Static data files (e.g., series definitions) are located in `src/data/`.
- **Plugins:** Custom local plugins are located in `plugins/`.
- **Static Assets:** Global images and static files are in `static/`. Blog-specific images are co-located in the blog post folder (e.g., `blog/YYYY/MM/DD/slug/images/`).

### Key Custom Components

- **Blog Enhancements:** `RelatedPosts`, `SeriesPosts`, `SeriesCards`, `PostCard`, `Updated`, `OldPostNotice`.
- **UI Elements:** `Card` (reusable), `Snippet` (code blocks), `LogoIcon`, `ScrollToTopButton`, `Image` (custom rendering), `Bluesky` (share/comments).

### Customization & Overrides

- **Swizzling:** The project overrides standard Docusaurus theme components, notably `BlogPostItem` and `BlogPostItem/Content`.
- **MDX Components:** Custom mappings are defined in `src/theme/MDXComponents.js` (e.g., for `Snippet`, `Image`, `Highlight`).
- **Plugins:** Several custom plugins are used for features like RSS feed customization, ASCII art injection, snippet loading, and term replacement.

## VSCode

- **Snippets:** Custom VSCode snippets are provided in `.vscode/markdown.code-snippets` for common patterns and components.
- **Settings:** Recommended settings are in `.vscode/settings.json` to ensure consistent formatting and linting.

## Instructions for Gemini/Jules

- Minimize confirmation prompts for routine code generation.
- When generating new React components for Docusaurus, apply changes directly.
- I prefer to review changes via Git diff rather than manual 'Accept' buttons.
