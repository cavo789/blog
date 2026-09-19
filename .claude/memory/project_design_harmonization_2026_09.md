---
name: project-design-harmonization-2026-09
description: "Design harmonization 2026-09-19: src/css/theme.css token layer + mk-* primitives (mk-callout, mk-surface, mk-toolbar, mk-dot, mk-eyebrow, mk-pill, mk-liftable) replace six independent callout implementations; typography swapped to Bricolage Grotesque + Source Sans 3 + JetBrains Mono"
metadata: 
  node_type: memory
  type: project
  originSessionId: b335f0a6-dc8c-4aaa-a6a3-27181b80f43e
  modified: 2026-09-19T09:37:57.622Z
---

Implemented a full visual-design harmonization package (delivered as a zip with `MIGRATION.md`,
authored 2026-09-19, produced by "Claude Design"). Landed in one uncommitted working-tree change
(not yet committed as of this writing) touching `docusaurus.config.js`,
`static/manifest.webmanifest`, `src/css/theme.css` (new), `src/css/custom.css` (rewritten), and 15
component `styles.module.css` files + 5 `index.tsx` markup adjustments (AlertBox, TLDR, QuickJump,
StepsCard, Details).

**Why:** the site had six independent implementations of the same "tinted surface + rail + dot +
eyebrow" callout pattern (AlertBox, TLDR, QuickJump, OldPostNotice, StepsCard, blockquote), each
with its own colors/radii, several still leaking Infima's default blue (`alert alert--info`)
despite the terracotta rebrand from TODO 0101. `theme.css` now remaps Infima's own variables
(`--ifm-color-emphasis-*`, `--ifm-global-radius`, `--ifm-font-family-*`, alert colors) so every
**untouched** component in the site inherits warm neutrals automatically — this is what makes the
migration incremental rather than all-or-nothing.

**How to apply:**

- New primitives live in `src/css/theme.css`, global (non-module) classes usable from any
  component or MDX file without import: `.mk-callout` (+ `--info/--tip/--note/--warn/--danger/
  --key/--loud` tone variants), `.mk-surface`, `.mk-toolbar` (+ `.mk-toolbar__actions`), `.mk-dot`
  (26px filled icon slot — shared by AlertBox, StepsCard bullets, Updated timeline nodes),
  `.mk-eyebrow` (every small-caps label), `.mk-pill`, `.mk-liftable` (hover lift), `.mk-focusable`.
  A component's own module CSS should `composes: mk-X from global` rather than reimplementing.
- `OldPostNotice` and `Snippet` **intentionally** keep the Infima `alert alert--warning`/
  `alert alert--info` classes in their JSX — do not "clean these up" on sight. Their module CSS
  composes `mk-surface`/`mk-callout` with equal specificity but later source order, so it already
  wins the cascade; only `TLDR`, `QuickJump`, `StepsCard`, `Details` needed the Infima classes
  physically removed from markup (see `MIGRATION.md`'s own §4 table — five components only).
- Typography: Bricolage Grotesque (headings) + Source Sans 3 (body) + JetBrains Mono (code),
  loaded via the single Google Fonts `<link>` in `docusaurus.config.js`. Previously "Inter".
- `theme-color` is `#9b5a31` in **both** `docusaurus.config.js`'s `<meta>` and
  `static/manifest.webmanifest` — keep them in sync, there's an explicit comment saying so.
- Snippet's 33 per-language brand colors were **not regenerated**, only rescoped: each
  `.variant_*` sets one `--lang-color` consumed by the 3px toolbar rule, the logo itself
  (`.snippet_logo` on the `<LogoIcon>`, added to `index.tsx` — was previously unstyled/uncolored
  via a dead `iconClassName` per-language map that no longer has matching CSS), and the focus ring.
- `src/components/Details/index.tsx` changed from a side-effect `import "./styles.module.css"` +
  hardcoded `alert alert--info`/`"content"` string classNames (which never actually matched the
  CSS-modules-hashed `.content` class — a pre-existing latent bug) to `import styles from` +
  `styles.details`/`styles.content`. Also fixed: bare `details`/`summary` element selectors in the
  old CSS module styled **every** `<details>` on the site including Docusaurus's own; now scoped.
- Verified via an isolated build (`DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-verify npx
  docusaurus build --locale en --locale fr --out-dir build-verify`, see
  [[project-build-devserver-clear-clash]] for why not `safe_build.sh`) and Playwright screenshots
  against the live dev server (light + dark, forcing `data-theme` since the site does not respect
  `prefers-color-scheme`) — chromium had to be installed first (`npx playwright install chromium`,
  not present in this devcontainer image by default).
- **Not yet migrated** (still just inheriting the Infima remap, not actively wrong):
  `CommandPalette`, `FollowFeed`, `TypoReport`, `BlogArchivePage`, `about.module.css`,
  `admin.module.css`, `Blog/HeroSection`, `Blog/Series`, `SearchBar`, `Reaction`, `TriedIt`,
  `Bluesky`, `GithubProjects`, `Trees`, `ScrollToTopButton`, `InstallPwaHint`, `OfflineNotice`,
  `TranslationNotice`, `TranslationCoverage`, `AskMyBlog(Widget)`, `BlogGraph`, `MainTags`,
  `ShortcutList`, `ConnectionInfo`, `DownloadButton`, `Image`, `FaqThemePage`, `MyRepositories`,
  `KonamiEasterEgg`, `ShakeEasterEgg`. Mechanical recipe for each: swap radii/shadows/grays for the
  three token sets, swap uppercase labels for `composes: mk-eyebrow from global`, swap tinted-box
  patterns for `.mk-callout`.
- Deliberately out of the package's scope (found during verification, not fixed): `#2e8555`
  (old Docusaurus green) still hardcoded in `src/data/series.js` (`components` series accent
  color) and `static/blog/rss.xsl` (RSS feed's own inline stylesheet) — neither was in
  `MIGRATION.md`'s explicit list, left alone rather than guessed at.
