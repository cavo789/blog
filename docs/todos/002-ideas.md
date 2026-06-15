# Ideas — "Wow Effect" Features

Overview list. Each item is a candidate for a deeper `00x-*.md` plan later.
Already planned: [001-typos.md](001-typos.md) (typo report via text selection).

---

## Reader engagement

| # | Feature | Wow factor |
|---|---------|------------|
| ~~A1~~ | ~~**Reading progress bar**~~ | ✅ Already implemented — `src/components/ReadingProgress/` |
| A2 | **Highlight + share** — select text → share to Bluesky/LinkedIn/copy link (similar UX to typo report tooltip) | Turns readers into promoters |
| A3 | **Reaction animation** — when voting helpful/not-helpful, trigger a particle burst or emoji float | Makes the interaction memorable |
| A4 | **"I fixed it" follow-up** — after a typo report, allow the reporter to mark it as resolved | Closes the loop, builds trust |

### A2 — Highlight + share

```
  …the Docker daemon must be running before…
          ╔══════════════════════╗
          ║  📋 Copy link        ║   ← tooltip on text selection
          ║  🦋 Share on Bluesky ║     (same trigger as TypoReport)
          ╚══════════════════════╝
```

### A3 — Reaction animation

```
  [👍 Helpful]  →  click  →  🎉💥✨ particles burst  →  [✅ Thanks!]
```

Current state: button turns into a static "Thanks" message.
Delta: `canvas-confetti` or CSS keyframe burst centered on the button.

### A4 — "I fixed it" follow-up

```
  Typo report email →  [Mark as fixed ✓]  →  reporter sees "Resolved" badge
```

---

## Content discovery

| # | Feature | Wow factor |
|---|---------|------------|
| B1 | **Series navigator** — when a post belongs to a series, show a visual stepper (Step 2/5) with prev/next links | Keeps readers in the series, reduces bounce |
| B2 | **Interactive tag cloud** — animated tag bubble chart on `/tags`, size = post count | Visual entry point to the content graph |
| B3 | **Reading history** — "You've read 12 posts" sidebar widget, powered by localStorage | Personalization without a login |
| B4 | **"Start here" guide** — curated learning path page (e.g. "New to WSL2? Start here") with a visual roadmap | Onboards new readers effectively |
| B5 | **Full-text search shortcut** — `Ctrl+K` or `/` opens a floating command-palette style search | Power-user feel, very "developer blog" |

### B1 — Series navigator stepper

```
  ◀ Prev                                         Next ▶
  ━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [1]     [2]     [3]     [4 ← you]     [5]     [6]
  Intro   Setup   Config  Plugins       Tips    Publish
```

Current state: `SeriesPosts` shows a flat list inside a `<Details>` block.
Delta: replace (or augment) with a horizontal stepper showing position + titles.

### B2 — Interactive tag cloud

```
                      Docker
                 Git        WSL2
            ZSH                  Bash
                 FZF        SSH
                      Linux
```

(font-size proportional to post count, hover highlights related posts)
Current state: `/tags` page shows featured cards + alphabetical list.
Delta: add a `d3-cloud` or pure-CSS bubble chart above the existing list.

### B3 — Reading history

```
  ┌─ Your reading history ──────────────────┐
  │  ✓ FZF + ripgrep               today   │
  │  ✓ Docker Compose tips          2d ago  │
  │  ✓ WSL2 GPU setup              last wk  │
  │  📚 12 posts read total                 │
  └──────────────────────────────────────────┘
```

### B5 — Command-palette search

```
  ╔════════════════════════════════════════╗
  ║  🔍  Search posts…            [Esc]   ║
  ║────────────────────────────────────────║
  ║  > docker compose                      ║
  ║  ─ Docker Compose tips & tricks        ║
  ║  ─ Multi-service Docker setup          ║
  ║  Recent: FZF, WSL2 setup guide         ║
  ╚════════════════════════════════════════╝
```

Docusaurus already has a search box; this wraps it in a `Ctrl+K` hotkey.

---

## Code block enhancements

| # | Feature | Wow factor |
|---|---------|------------|
| C2 | **Diff viewer component** — side-by-side before/after for config changes, rendered from a single MDX tag | Saves readers from mentally diffing two blocks |
| C3 | **"Run in browser" badge** — for simple JS/Python snippets, embed a minimal REPL (e.g. Sandpack or a `<iframe>` to a playground) | Zero friction to try the code |
| C4 | **Filename + copy toast — native code blocks** — show the filename above each ` ``` ` code block and animate the copy button (checkmark flash) | Small but polished touch |

### C2 — Diff viewer

```
  ┌─ Before ───────────────┬─ After ────────────────┐
  │ version: "2"           │ version: "3.9"         │
  │ services:              │ services:              │
  │   web:                 │   web:                 │
  │ -   ports: "80:80"     │ +   ports: "8080:80"   │
  │     image: nginx       │     image: nginx:alpine│
  └────────────────────────┴────────────────────────┘
```

Usage: `<Diff before={oldConfig} after={newConfig} lang="yaml" />`

### C3 — Run in browser

```
  ```javascript                            [▶ Run]
  const arr = [1, 2, 3];
  console.log(arr.map(x => x * 2));
  ```

  ──────────────────────────────────────────
  Output:  [2, 4, 6]                ← live

```

### C4 — Filename + copy toast (native blocks)

```

  ┌─ docker-compose.yml ──────────────── [⎘ Copy] ─┐
  │ version: "3.9"                                   │
  │ services:                                        │
  │   web:                                           │
  └──────────────────────────────────────────────────┘
       ↓ after click
       [✓ Copied!]  (fades out after 1.5s)

```
Current state: `Snippet` component has this; native ` ``` ` blocks do not.
Delta: swizzle `CodeBlock` theme component to inject filename + animated copy.

---

## Visual / atmosphere

| # | Feature | Wow factor |
|---|---------|------------|
| D1 | **Per-tag color accent** — article header gradient tinted by the `mainTag` (Docker=blue, ZSH=green, etc.) | Makes each post feel distinct |
| D2 | **Dark mode transition animation** — smooth cross-fade instead of instant switch | Polished feel on theme toggle |
| D3 | **"Hot" badge** — label posts with > N helpful votes in the last 30 days as trending | Social proof in the article list |
| ~~D4~~ | ~~**Scroll-triggered section highlight**~~ | ✅ Already implemented — TOC with scroll highlight |

### D1 — Per-tag color accent

```

  Docker article:   ████████████████  blue gradient in header
  ZSH article:      ████████████████  green gradient
  Git article:      ████████████████  orange gradient
  WSL2 article:     ████████████████  purple gradient

```
Implemented via a CSS custom property `--post-accent` set from `mainTag`.

### D3 — "Hot" badge

```

  ┌────────────────────────────────────────┐
  │  🔥 Trending   FZF + ripgrep…         │
  │  ★ Popular    Docker Compose tips…    │
  │               WSL2 GPU setup…         │
  └────────────────────────────────────────┘

```
Powered by the reactions API: posts where `helpful / (helpful+not_helpful) > 0.9`
and total votes > 5 in the last 30 days.

---

## Social / community

| # | Feature | Wow factor |
|---|---------|------------|
| ~~E1~~ | ~~**Bluesky reaction count in article list**~~ | ❌ Dropped — too few Bluesky interactions to be meaningful |
| E2 | **"Share snippet" — copy selection as a formatted quote + URL** | Makes it trivial to quote the blog in a post |
| E3 | **Newsletter opt-in widget** — inline subscribe form (Brevo/Buttondown) after the first article read | Converts engaged readers to subscribers |

### E2 — Share snippet

```

  [user selects: "the Docker daemon must be running"]
        ↓ share tooltip appears (same as TypoReport)
  "the Docker daemon must be running"
  — cavo789.com/blog/docker-tips  🦋
  [copied to clipboard]

```
Shares a Bluesky-ready quote: `"…text…"\n— URL`.
Very similar UX to A2; both could ship as one feature.

---

## Admin / analytics

| # | Feature | Wow factor |
|---|---------|------------|
| F1 | **Unified admin dashboard** — merge reactions + typo reports + live visitor estimate in one `/admin` page | Single pane of glass |
| F2 | **"Most read" widget** — server-side hit counter per post, displayed in sidebar or homepage | Real popularity signal (not just reactions) |
| F3 | **RSS-to-Bluesky auto-post** — PHP cron that detects new posts and cross-posts to Bluesky | Zero-friction content syndication |

### F1 — Unified admin dashboard

```

  ┌─ /admin ──────────────────────────────────────────┐
  │  📊 Reactions   🐛 Typo reports   👁 Live visitors │
  │  ─────────────────────────────────────────────────  │
  │  Helpful: 342    Open: 5          Now: 3           │
  │  Not:      28    Fixed: 47        Today: 89        │
  └────────────────────────────────────────────────────┘

```
Current state: `/admin` only links to reactions dashboard.
Delta: embed typo report counts + a Fathom/Plausible iframe.

### F2 — Most read widget

```

  ┌─ Popular this month ──────────────┐
  │  1.  FZF + ripgrep         342 ↗  │
  │  2.  WSL2 GPU support      218 ↗  │
  │  3.  Docker Compose tips   189 ↗  │
  └────────────────────────────────────┘

```

---

## Developer UX — CLI & code quality

New section for ideas specific to a CLI / DevOps-oriented blog.

| # | Feature | Wow factor |
|---|---------|------------|
| G1 | **"Copy all commands"** — aggregate every bash block in a tutorial into one clipboard action | Zero friction for readers who just want to run the guide |
| G2 | **Prerequisites component** — a standardized block listing required tools + versions before the article body | Sets expectations, reduces support questions |
| G3 | **"Tested with" badge row** — compact version matrix (OS / tool / version) in the article header | Instant credibility signal for CLI articles |
| G4 | **Difficulty badge** — Beginner / Intermediate / Advanced label derived from frontmatter | Helps readers self-select the right articles |
| G5 | **Inline command tooltip** — hover over a CLI flag like `--no-cache` to see a one-line explanation | Teaches while the reader follows along |

### G1 — Copy all commands

```

  ┌─────────────────────────────────────────────────┐
  │  [⎘ Copy all commands in this article]          │
  └─────────────────────────────────────────────────┘
  → clipboard contains:
      docker compose pull
      docker compose up -d
      docker compose logs -f web

```
Implemented as a floating button that collects all `<pre><code>` bash blocks.

### G2 — Prerequisites component

```

  ┌─ Before you start ──────────────────────────────┐
  │  ✔ Docker ≥ 26.0      ✔ WSL2 (Ubuntu 22.04)    │
  │  ✔ 4 GB RAM free      ✗ Windows ARM not tested  │
  └──────────────────────────────────────────────────┘

```
Usage: `<Prerequisites items={[{tool: "Docker", version: "≥26", ok: true}]} />`

### G3 — "Tested with" badge row

```

  Tested with:  [Ubuntu 22.04]  [Docker 26.1]  [WSL2 kernel 5.15]

```
Values come from `frontMatter.tested_with` array.

### G4 — Difficulty badge

```

  🟢 Beginner   🟡 Intermediate   🔴 Advanced

```
Derived from `frontMatter.difficulty: beginner | intermediate | advanced`.

### G5 — Inline command tooltip

```

  docker build --no-cache .
                ──────────
                   ↓ hover
  ┌──────────────────────────────────────┐
  │ --no-cache: forces a full rebuild,  │
  │ ignoring any cached layer.          │
  └──────────────────────────────────────┘

```

---

## Content quality signals

| # | Feature | Wow factor |
|---|---------|------------|
| H1 | **"What changed" revision block** — collapsible changelog at the bottom of updated articles ("2026-01-15: added Docker Compose v3 section") | Shows the article is actively maintained |
| H2 | **Automatic internal linking** — remark plugin that auto-links first occurrence of known terms (e.g. "Docker Compose") to the canonical article | Surfaces related content without manual effort |
| H3 | **FAQ structured data** — when an article has a Q&A structure, inject `FAQPage` JSON-LD for Google rich snippets | Rich result = more clicks from search |

### H1 — "What changed" revision block

```

  ▼ Revision history
  ──────────────────────────────────────────
  2026-01-15  Added Docker Compose v3 section
  2025-11-02  Fixed typo in Step 4 (thanks @reader)
  2025-08-10  First published

```
Stored in `frontMatter.changelog` array; collapsed by default.

### H2 — Automatic internal linking

```

  Before: "…use Docker Compose to define services…"
  After:  "…use [Docker Compose](/blog/docker-compose-tips) to define services…"

```
Implemented as a remark plugin that reads the blog map and injects links.

---

## Quick wins (< 1h each)

- **Keyboard shortcut legend** — `?` key shows a modal listing all keyboard shortcuts on the site
- **Print stylesheet** — `@media print` CSS to produce clean single-column printouts of articles
- **"Cite this post"** — one-click copy of an academic-style citation string (author, date, URL)
- **External link indicator** — small ↗ icon appended automatically to all outbound links
- ~~**Estimated read time**~~ — ✅ Already available natively in Docusaurus
- **"Time to implement"** — `frontMatter.implement_time: ~20min` displayed alongside read time — distinct from *reading* the article vs *doing* the tutorial
- **Back-to-top keyboard shortcut** — `Home` or `gg` (vim-style) scrolls to top; ScrollToTopButton already exists visually
