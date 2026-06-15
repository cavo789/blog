---
slug: docusaurus-eli5-snippet-tooltips
title: "AI-Powered Code Tooltips in Docusaurus — Explain Like I'm Five"
date: 2026-12-31
authors: [christophe]
image: /img/v2/ai_snippets.webp
description: Add hover tooltips to tricky code lines in your Docusaurus blog — powered by Claude, generated at build time, zero browser latency. Covers the remark plugin, the React renderer, and the CLI script.
mainTag: docusaurus
tags:
  - docusaurus
  - component
  - react
  - ai
language: en
ai_assisted: true
draft: true
---

![AI-Powered Code Tooltips in Docusaurus — Explain Like I'm Five](/img/v2/ai_snippets.webp)

<TLDR>
Your Dockerfile is crystal-clear to you. To a junior reader, `RUN npm ci --omit=dev` is gibberish. This article adds a `?` badge to the tricky lines of your `<Snippet>` code blocks. Hovering reveals a plain-English explanation generated once by Claude and stored in a JSON file — no API key in the browser, no hover latency. The whole system has three parts: a Node.js script that calls the Claude API and writes a `.eli5.json` file, a one-line extension to your existing `remark-snippet-loader` plugin that auto-injects the annotations, and a custom React renderer inside the `Snippet` component that overlays the badges. The author workflow is: run the script, commit the JSON, done.
</TLDR>

When you write a tutorial aimed at developers who are learning, there is always a gap between what you assume they know and what they actually know. You could add inline explanations — but that bloats the article. You could add a glossary — but readers skip it. What you really want is optional, on-demand context that appears exactly where the reader is confused.

That is what this feature does. A small `?` badge floats at the right edge of annotated lines. Hover it, and a tooltip explains the line in simple English. Move away, and the code is clean again.

<!-- truncate -->

## What it looks like

```
  ┌─ Dockerfile ─────────────────────────────────────────── ▾ ─┐
  │  1  FROM node:20-alpine                                 [?]  │
  │  2                                                           │
  │  3  WORKDIR /app                                             │
  │  4  COPY package*.json ./                              [?]  │
  │  5  RUN npm ci --omit=dev                              [?]  │
  │  6                                                           │
  │  7  COPY . .                                                 │
  │  8  EXPOSE 3000                                        [?]  │
  │  9  CMD ["node", "server.js"]                          [?]  │
  └──────────────────────────────────────────────────────────────┘
             ↓ hover [?] on line 5
  ┌──────────────────────────────────────────────────────────────┐
  │  npm ci installs exactly what's in package-lock.json.       │
  │  --omit=dev skips dev tools — keeps your image smaller.     │
  └──────────────────────────────────────────────────────────────┘
```

The `?` badges appear only on lines that Claude decided are non-trivial. Blank lines, closing braces, and self-evident assignments are skipped automatically.

## Architecture

The system has three moving parts that work independently:

```
  ① scripts/generate-eli5.mjs          (run once, by the author)
        ↓  calls Claude API
        ↓  writes blog/2026-xx-xx-my-post/files/Dockerfile.eli5.json
        ↓  commit that file

  ② plugins/remark-snippet-loader       (runs at build time, automatically)
        ↓  reads Dockerfile
        ↓  finds Dockerfile.eli5.json alongside it
        ↓  injects eli5json="..." prop into <Snippet>

  ③ src/components/Snippet/index.js    (runs in the browser)
        ↓  parses eli5json prop
        ↓  renders Prism-highlighted code line by line
        ↓  overlays ? badges with tooltips
```

The key design decision is that **AI calls happen at authoring time, not at read time**. The `.eli5.json` files are committed to git and bundled with the site like any other static asset. Readers never wait for an API call, and your API key never leaves your machine.

## Step 1 — The annotation script

Create `scripts/generate-eli5.mjs`. This script reads a source file, sends it to Claude with a prompt that asks for line-by-line explanations, and writes the result as a JSON file alongside the source.

<Snippet filename="scripts/generate-eli5.mjs" source="../../scripts/generate-eli5.mjs" />

A few details worth noting:

**Language detection** mirrors the `remark-snippet-loader` mapping so the two components always agree on what language a file is.

**The prompt** tells Claude to skip trivial lines and return only a JSON object. The `system` message instructs it to output pure JSON; the temperature is kept at a low value for consistent, factual explanations.

**JSON cleaning** validates that all keys are digit strings in range and all values are non-empty strings, so a malformed response from Claude cannot crash the build.

**Incremental generation**: if the `.eli5.json` already exists, the script exits without calling the API. Use `--force` to regenerate.

### Usage

```bash
# Generate for a single file
node scripts/generate-eli5.mjs blog/2026-01-01-my-post/files/Dockerfile

# Regenerate after the source file changed
node scripts/generate-eli5.mjs blog/2026-01-01-my-post/files/compose.yaml --force

# Write to a custom path
node scripts/generate-eli5.mjs src/some-file.sh --output docs/files/some-file.sh.eli5.json
```

You can also add a convenience alias to `package.json`:

```json
"scripts": {
  "eli5": "node scripts/generate-eli5.mjs",
  "eli5:bulk": "node scripts/bulk-eli5.mjs"
}
```

Then the call becomes `yarn eli5 blog/2026-01-01-my-post/files/Dockerfile`.

### The output format

The script writes a file like this:

```json
{
  "version": 1,
  "model": "claude-haiku-4-5-20251001",
  "generated": "2026-06-13T10:00:00.000Z",
  "source": "Dockerfile",
  "lang": "docker",
  "explanations": {
    "1": "FROM picks the base image — the pre-built foundation your image starts from. node:20-alpine is Node 20 on the tiny Alpine Linux OS.",
    "4": "COPY package*.json ./ copies only the dependency manifest first so Docker can cache the npm install step separately from your application code.",
    "5": "npm ci is like npm install but strictly follows package-lock.json. --omit=dev leaves out development-only tools, shrinking the final image.",
    "8": "EXPOSE documents which port the container listens on. It is a label, not a firewall rule — docker run -p actually opens the port.",
    "9": "CMD is the default command when the container starts. Square-bracket form (exec form) runs node directly without a shell in between."
  }
}
```

Only annotated lines appear. The consumer (the remark plugin and the React component) treats missing lines as having no badge.

## Step 2 — The batch script

When you have many posts, running the generator file by file is tedious. `scripts/bulk-eli5.mjs` scans your entire `blog/` directory, finds every `<Snippet source="...">` reference, resolves the path, and generates the `.eli5.json` in one pass.

<Snippet filename="scripts/bulk-eli5.mjs" source="../../scripts/bulk-eli5.mjs" />

### Options reference

| Flag | Default | Description |
| --- | --- | --- |
| `--dir <path>` | `blog/` | Directory to scan (relative to project root) |
| `--force` | off | Regenerate even if `.eli5.json` already exists |
| `--dry-run` | off | Show what would happen, no API calls |

## How the bulk script works

Before diving into the migration workflow, it helps to understand exactly what the script does — and does not do.

### How it finds files to annotate

The script reads every `.md` and `.mdx` file under `--dir` (default: `blog/`), and searches each one for occurrences of `<Snippet source="...">` using a regular expression. For each match it resolves the source path to an absolute path, deduplicates (a file referenced in multiple posts is only processed once), then processes the list.

It does **not** annotate inline fenced code blocks — only `<Snippet>` calls that reference an external file via `source="./files/..."`.

### The skip rule — idempotent by design

For every source file, the script first checks whether `<source-file>.eli5.json` already exists:

* **File exists → `⏭ skipped`** — zero API call, zero cost, instant.
* **File missing → `✅ N annotations`** — one API call to Claude, file written.

This means:

* You can run `yarn eli5:bulk` as many times as you want. Only files that are missing their `.eli5.json` will trigger an API call.
* The **first run** is the only one that costs money (for existing articles). All subsequent runs are free.
* If you add a new article with a `<Snippet>` next month, running `yarn eli5:bulk` again will annotate only that new file.
* If the script is interrupted (network error, Ctrl+C), simply re-run it — already generated files are skipped, and only the remaining ones are processed.

Use `--force` only when you have intentionally edited a source file and want to regenerate its annotations from scratch.

## Annotating your existing articles

If you have a blog with many articles — say 240 — you do not want to run the generator file by file. Here is the recommended migration workflow.

### Phase 1 — Audit with dry-run

Before touching the API, get a clear picture of what you have. Run the bulk script with `--dry-run` on your entire blog:

```bash
node scripts/bulk-eli5.mjs --dry-run
```

This is instant — no API call is made. The output shows every source file referenced by a `<Snippet source="...">` in any post, and tells you whether its `.eli5.json` already exists or still needs to be generated:

```
🔍 Scanning blog/ for Snippet usages...
Found 47 unique source file(s) across 240 posts.

  [SKIP]     blog/2025/03/12-wsl2-tricks/files/wsl.conf
             ← blog/2025/03/12-wsl2-tricks/index.md
  [GENERATE] blog/2025/04/05-docker-compose/files/compose.yaml
             ← blog/2025/04/05-docker-compose/index.md
  [GENERATE] blog/2025/04/05-docker-compose/files/Dockerfile
             ← blog/2025/04/05-docker-compose/index.md
  [GENERATE] blog/2025/06/20-zsh-config/files/.zshrc
             ← blog/2025/06/20-zsh-config/index.md
  ...

──────────────────────────────────────
Generated: 0  Skipped: 3  Errors: 0
```

Two things to notice here:

1. **Only 47 source files for 240 posts.** Most posts do not use `<Snippet source="...">` at all — they use inline fenced code blocks. The bulk script ignores those automatically. You are not annotating 240 files; you are annotating only the posts that already use the Snippet component with an external source file.

2. **The `SKIP` / `GENERATE` labels** tell you at a glance which files already have an annotation and which still need one. This makes the dry-run useful after partial runs too.

Save the dry-run output if you want a permanent audit record:

```bash
node scripts/bulk-eli5.mjs --dry-run > eli5-audit.txt
```

### Phase 2 — Estimate the cost

`claude-haiku-4-5-20251001` is priced at a fraction of a cent per call. A typical source file (20–60 lines) costs roughly **$0.0002 – $0.001**. Multiply by the number of `[GENERATE]` entries in your dry-run output.

For 47 source files, you are looking at under **$0.05** total. Even if every one of your 240 posts had a source file, the total cost would be under **$0.25**.

### Phase 3 — Generate by scope

You can process the entire blog in one command, or scope it to a specific year or month. All paths are relative to the project root.

**Process everything at once:**

```bash
node scripts/bulk-eli5.mjs
```

The script runs sequentially (one API call at a time), so there is no risk of hitting rate limits. On a typical connection, 47 files take about two minutes.

**Process a single year:**

```bash
node scripts/bulk-eli5.mjs --dir blog/2025
node scripts/bulk-eli5.mjs --dir blog/2026
```

**Process a single month:**

```bash
node scripts/bulk-eli5.mjs --dir blog/2026/06
```

**Process a single post folder:**

```bash
node scripts/bulk-eli5.mjs --dir blog/2025/04/05-docker-compose
```

This last form is equivalent to running `generate-eli5.mjs` individually for each source file in that post — but the bulk script handles deduplication automatically (if the same source file is referenced twice in the same post, it is only generated once).

### Phase 4 — What the output looks like while running

```
🔍 Scanning blog/2025 for Snippet usages...
Found 31 unique source file(s) across 140 posts.

  📄 blog/2025/04/05-docker-compose/files/compose.yaml ... ✅ 6 annotations
  📄 blog/2025/04/05-docker-compose/files/Dockerfile ... ✅ 5 annotations
  📄 blog/2025/04/12-zsh-setup/files/.zshrc ... ✅ 9 annotations
  📄 blog/2025/05/01-devcontainer/files/devcontainer.json ... ✅ 7 annotations
  📄 blog/2025/06/20-fzf/files/fzf-preview.sh ... ⏭  skipped
  ...

──────────────────────────────────────
Generated: 30  Skipped: 1  Errors: 0
```

Each line tells you how many lines Claude decided to annotate. A file with `0 annotations` would mean Claude found nothing non-trivial — this can happen for very short or very simple files. A file with `⏭  skipped` already had a `.eli5.json` from a previous run.

**The script is safe to interrupt and re-run.** If it stops halfway (network error, API error, Ctrl+C), just run it again. Files that were already generated will show `⏭  skipped`; only the remaining ones will be processed.

### Phase 5 — Handle errors

If a file fails (Claude returns malformed JSON, network timeout), it shows:

```
  📄 blog/2025/04/05-docker-compose/files/Makefile ... ❌ Invalid JSON from Claude
```

The script continues with the next file and exits with code `1` at the end (so a CI pipeline would catch it). To retry only the failed file:

```bash
node scripts/generate-eli5.mjs blog/2025/04/05-docker-compose/files/Makefile
```

If the same file keeps failing, add `--force` to regenerate with a fresh API call.

### Phase 6 — Verify a sample

Before committing, open a post in `yarn start` and check that the `?` badges appear on the right lines. Inspect one or two `.eli5.json` files to confirm the quality of explanations.

:::tip No build required — dev mode works out of the box
The `?` badges are injected by the remark plugin at MDX compile time, not at runtime. This means `yarn start` (port 3000) and `yarn build` produce identical results for ELI5 annotations. You never need to run a full build just to preview tooltips.

If you generate a new `.eli5.json` while the dev server is already running, save the corresponding `.md` file to trigger MDX recompilation — the badges will appear on the next hot reload.
:::

If an explanation is wrong or too verbose, edit the JSON file directly — it is just plain text, no regeneration needed.

### Phase 7 — Commit

Commit the `.eli5.json` files alongside the source files they annotate. This is intentional: CI/CD does not need `ANTHROPIC_API_KEY` because the annotations are pre-generated and stored in git.

```bash
# Stage all newly generated annotation files
git add blog/**/*.eli5.json

# Or stage everything in one year
git add blog/2025/**/*.eli5.json
git add blog/2026/**/*.eli5.json

git commit -m "feat: add ELI5 annotations for existing Snippet blocks"
```

### Summary — migration in five commands

```bash
# 1. Preview scope (no API calls)
node scripts/bulk-eli5.mjs --dry-run

# 2. Generate by year (repeat for each year)
node scripts/bulk-eli5.mjs --dir blog/2025
node scripts/bulk-eli5.mjs --dir blog/2026

# 3. Verify in the browser
yarn start

# 4. Commit
git add blog/**/*.eli5.json && git commit -m "feat: ELI5 annotations"
```

## Step 3 — Extend the remark plugin

Your `remark-snippet-loader` already reads the source file and injects `code` and `lang` props into the `<Snippet>` node at build time. Add eleven lines to also inject the ELI5 annotations when a `.eli5.json` exists alongside the source file.

In `plugins/remark-snippet-loader/index.cjs`, after the block that pushes the `lang` attribute:

```js
// Auto-inject ELI5 explanations if a <source>.eli5.json file exists
const eli5Path = absolutePath + ".eli5.json";
if (fs.existsSync(eli5Path)) {
  try {
    const eli5Raw = fs.readFileSync(eli5Path, "utf-8");
    const eli5Data = JSON.parse(eli5Raw);
    if (eli5Data.explanations && typeof eli5Data.explanations === "object") {
      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "eli5json",
        value: JSON.stringify(eli5Data.explanations),
      });
    }
  } catch (e) {
    console.warn(`Snippet plugin: could not parse ELI5 file ${eli5Path}:`, e.message);
  }
}
```

The annotations are serialized as a JSON string (`eli5json` prop) so they fit into the MDX attribute model without needing to build an estree expression node. The `Snippet` component parses this string back into an object with `JSON.parse`.

This approach means **the author does not need to change a single line of MDX**. Add the `.eli5.json` file, rebuild — the tooltips appear automatically.

## Step 4 — Update the Snippet component

The Snippet component needs two changes: a new `Eli5CodeBlock` sub-component that renders code line by line with badges, and a small update to the main `Snippet` function to parse `eli5json` and route to the new renderer.

<Snippet filename="src/components/Snippet/index.js" source="../../src/components/Snippet/index.js" />

### How the renderer works

When `eli5json` is present and `code` is a string, the component calls `Prism.highlight()` directly instead of delegating to Docusaurus's `<CodeBlock>`. Prism is already bundled by Docusaurus — importing it is safe and has no bundle-size cost.

The highlighted HTML is split by newline. Each line becomes a `<div>` containing:

* A `<span>` with the syntax-highlighted code (via `dangerouslySetInnerHTML` — safe because Prism only wraps tokens in `<span>` elements)
* Either a `?` button (if the line has an explanation) or an invisible placeholder of the same width (to keep all lines aligned)

The tooltip appears on hover via a `onMouseEnter`/`onMouseLeave` pair on the badge wrapper, and toggles on click for keyboard/mobile access. Focus/blur handlers make it keyboard-accessible without extra ARIA trickery.

When `eli5json` is absent (the normal case), the component behaves exactly as before — `<CodeBlock>` is used, nothing changes.

## Step 5 — Add the CSS

Add these classes to `src/components/Snippet/styles.module.css`:

```css
.eli5_pre {
  margin: 0;
  padding: 0.75rem 0;
  overflow-x: auto;
  background: var(--prism-background-color, #282c34);
  border-radius: 0 0 4px 4px;
  font-family: var(--ifm-font-family-monospace);
  font-size: var(--ifm-code-font-size, 0.875rem);
  line-height: 1.5;
}

.eli5_line {
  display: flex;
  align-items: flex-start;
  min-height: 1.5em;
  padding: 0 1rem;
}

.eli5_line:hover {
  background: rgba(255, 255, 255, 0.04);
}

.eli5_code {
  flex: 1;
  white-space: pre;
  overflow: hidden;
}

.eli5_badge_placeholder {
  display: inline-block;
  width: 1.2rem;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.eli5_badge_wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.eli5_badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.2rem;
  height: 1.2rem;
  border-radius: 50%;
  border: 1px solid rgba(150, 150, 200, 0.35);
  background: rgba(100, 100, 180, 0.12);
  color: rgba(180, 180, 230, 0.6);
  font-size: 0.6rem;
  font-weight: 700;
  line-height: 1;
  padding: 0;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
  flex-shrink: 0;
}

.eli5_badge:hover,
.eli5_badge:focus-visible,
.eli5_badge_active {
  background: rgba(80, 130, 230, 0.35);
  color: #e8eaf6;
  border-color: rgba(120, 170, 255, 0.65);
  outline: none;
}

.eli5_tooltip {
  position: absolute;
  right: 0;
  top: calc(100% + 5px);
  z-index: 200;
  width: 270px;
  max-width: 90vw;
  padding: 0.5rem 0.75rem;
  background: var(--ifm-background-surface-color, #fff);
  border: 1px solid var(--ifm-color-emphasis-300);
  border-radius: 6px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.18);
  font-family: var(--ifm-font-family-base);
  font-size: 0.8rem;
  line-height: 1.55;
  color: var(--ifm-font-color-base);
  white-space: normal;
  pointer-events: none;
}

.eli5_tooltip::before {
  content: "";
  position: absolute;
  top: -5px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: var(--ifm-background-surface-color, #fff);
  border-left: 1px solid var(--ifm-color-emphasis-300);
  border-top: 1px solid var(--ifm-color-emphasis-300);
  transform: rotate(45deg);
}

[data-theme="dark"] .eli5_tooltip {
  background: #1e2030;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 22px rgba(0, 0, 0, 0.5);
}

[data-theme="dark"] .eli5_tooltip::before {
  background: #1e2030;
  border-color: rgba(255, 255, 255, 0.1);
}
```

The `eli5_badge_placeholder` is worth explaining: every line in the code block must have a right-side element of the same width, whether it has a badge or not. Without the placeholder, lines without a `?` would be narrower and the code would appear ragged.

## Author workflow (end to end)

For each blog post that contains `<Snippet>` blocks, the workflow after publishing once is:

```bash
# 1. Write your post. Place source files in ./files/ as usual.
#    Example: blog/2026-07-01-my-docker-post/files/Dockerfile

# 2. Generate ELI5 annotations
yarn eli5 blog/2026-07-01-my-docker-post/files/Dockerfile

# 3. Preview locally — the ? badges appear automatically
yarn start

# 4. Commit the source file and the annotation file
git add blog/2026-07-01-my-docker-post/files/Dockerfile
git add blog/2026-07-01-my-docker-post/files/Dockerfile.eli5.json

# 5. Build and deploy as usual — no ANTHROPIC_API_KEY needed in CI
yarn build
```

If the source file changes after publication, regenerate with `--force`:

```bash
yarn eli5 blog/2026-07-01-my-docker-post/files/Dockerfile --force
```

## Environment setup

### Step 1 — Create an Anthropic account and get an API key

:::info API access is separate from Claude Pro
If you already have a **Claude Pro** subscription (claude.ai), that covers the chat interface only — it does not include API access. The generation scripts use the **Anthropic API**, which is a separate, pay-as-you-go product billed by token usage. You need a distinct account on `console.anthropic.com` with a credit balance. The good news: annotating 240 articles with `claude-haiku-4-5` costs a few cents in total (Haiku is the least expensive Claude model, at $1 per million input tokens, and each source file is only a few hundred tokens).
:::

Go to **[https://console.anthropic.com](https://console.anthropic.com)** and sign up (or log in if you already have an account). Once logged in:

1. Click **Settings** in the left sidebar (or navigate directly to `https://console.anthropic.com/settings/keys`).
2. Select **API Keys** from the settings menu.
3. Click **Create Key**.
4. Give your key a name (e.g. `docusaurus-eli5`) so you can identify it later.
5. **Copy the key immediately** — it is shown only once and cannot be retrieved after you close the dialog. It looks like `sk-ant-api03-...`.

Store the key somewhere safe (a password manager works well). If you lose it, you will need to create a new one.

:::caution Never expose your API key
Do not paste your key into source code, commit it to git, or share it publicly. A leaked key can be used to make API calls billed to your account.
:::

You will also need a **billing credit balance** to make API calls. In the Anthropic console, go to **Settings → Billing** and add a small credit (a few US dollars is more than enough to annotate hundreds of blog posts with Haiku — the cost is fractions of a cent per file).

### Step 2 — Add the key to your project

Create a `.env` file at the root of your Docusaurus project (next to `package.json`):

```ini
# .env — do not commit this file
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Then make sure `.env` is in your `.gitignore`:

```bash
echo ".env" >> .gitignore
```

The key is read by the generation scripts at authoring time only. It is **never** included in the built site or needed in CI — the `.eli5.json` annotation files are committed to git alongside the source files.

### Step 3 — Install dependencies

`dotenv` and `@anthropic-ai/sdk` are already present as dependencies in this project. If you are starting a fresh Docusaurus project, install them as dev dependencies:

```bash
yarn add --dev @anthropic-ai/sdk dotenv
```

## Known limitations

**Requires the `source` prop** — the ELI5 renderer activates only when the remark plugin injects `code` as a string (i.e., when you use `source="./files/myfile"`). Snippets that use inline `children` (fenced code blocks inside the MDX) are not annotated.

**Stale annotations** — if you edit a source file significantly after generating `.eli5.json`, the annotations may no longer match the lines. Run `--force` to refresh. There is no automatic staleness detection.

**Long lines** — if a line wraps visually (overflow-x scrolls), the `?` badge stays at the end of the logical line, which may be off-screen. This is an edge case for most file types (Dockerfile, YAML, bash) where lines are short.

**Prism language coverage** — `Prism.highlight()` falls back to plain text for languages not registered in Docusaurus's Prism bundle. The most common file types (Dockerfile, YAML, Bash, JSON, JavaScript) are all in the default bundle.

## What Claude model to use

The scripts use `claude-haiku-4-5-20251001`, which is the fastest and least expensive Claude model. For a 20-line Dockerfile, one call costs a fraction of a cent and returns in under two seconds. The quality is sufficient for the ELI5 use case — short, factual explanations of well-known constructs.

If you want more nuanced explanations (for example, for complex shell pipelines or advanced YAML anchors), switch to `claude-sonnet-4-6` in the scripts. The prompt and output format remain identical.

## Extending the idea

A few directions worth exploring once the base feature is working:

**Difficulty levels** — the prompt could ask Claude to tag each explanation as `beginner` / `intermediate` / `advanced` and the badge could change color accordingly (`?` in green/yellow/red).

**Localization** — pass a `lang` prop to the script and add `Please respond in French` to the system prompt. The `.eli5.json` format already has a `lang` field for this.

**Staleness detection** — add a `sourceHash` field (SHA-256 of the source file at generation time) to `.eli5.json`. The remark plugin can compare it to the current file hash and emit a warning during build when they diverge.

**Automatic regeneration hook** — a `yarn build` pre-hook (`"prebuild": "node scripts/bulk-eli5.mjs"`) would regenerate all missing annotations before each build. Combined with `ANTHROPIC_API_KEY` in CI secrets, this makes annotation generation fully automatic.
