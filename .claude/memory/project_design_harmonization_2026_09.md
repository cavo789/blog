---
name: project-design-harmonization-2026-09
description: "Design harmonization 2026-09-19: src/css/theme.css token layer + mk-* primitives (mk-callout, mk-surface, mk-toolbar, mk-dot, mk-eyebrow, mk-pill, mk-liftable) replace six independent callout implementations; typography swapped to Bricolage Grotesque + Source Sans 3 + JetBrains Mono"
metadata: 
  node_type: memory
  type: project
  originSessionId: b335f0a6-dc8c-4aaa-a6a3-27181b80f43e
  modified: 2026-09-19T14:00:00.000Z
---

Implemented a full visual-design harmonization package (delivered as a zip with `MIGRATION.md`,
authored 2026-09-19, produced by "Claude Design"). Landed on branch `new_theme`, touching
`docusaurus.config.js`, `static/manifest.webmanifest`, `src/css/theme.css` (new),
`src/css/custom.css` (rewritten), and 15 component `styles.module.css` files + 5 `index.tsx`
markup adjustments. Followed by three correction rounds (see "Corrections" below).

**Why:** the site had six independent implementations of the same "tinted surface + rail + dot +
eyebrow" callout pattern (AlertBox, TLDR, QuickJump, OldPostNotice, StepsCard, blockquote), each
with its own colors/radii, several still leaking Infima's default blue (`alert alert--info`)
despite the terracotta rebrand from TODO 0101. `theme.css` now remaps Infima's own variables
so every **untouched** component in the site inherits warm neutrals automatically — this is what
makes the migration incremental rather than all-or-nothing.

**How to apply:**

- New primitives live in `src/css/theme.css`, global (non-module) classes usable from any
  component or MDX file without import: `.mk-callout` (+ `--info/--tip/--note/--warn/--danger/
  --key/--loud` tone variants), `.mk-surface`, `.mk-toolbar` (+ `.mk-toolbar__actions`), `.mk-dot`
  (26px filled icon slot — shared by AlertBox, StepsCard bullets, Updated timeline nodes),
  `.mk-eyebrow` (every small-caps label), `.mk-pill`, `.mk-liftable` (hover lift), `.mk-focusable`.
  A component's own module CSS should `composes: mk-X from global` rather than reimplementing.

- **NEVER combine Infima's `alert alert--*`, `card`, or `shadow--md` utility classes with a
  module class that `composes` an `mk-*` primitive.** An earlier revision of this memory claimed
  `OldPostNotice` and `Snippet` kept those classes "intentionally" because the composed class
  "wins the cascade by later source order". **That claim was wrong and caused a real,
  user-visible bug**: `Snippet` rendered with a Docusaurus-blue background in production for
  every snippet that did not go through the ELI5 renderer, and it took three debugging rounds to
  trace. Infima's `.alert` sets `background-color`, a full `border` and `color` at the same
  specificity (0-1-0); which stylesheet wins depends on injection order, which is not guaranteed
  and empirically went Infima's way. The classes are now removed from **all** of:
  `TLDR`, `QuickJump`, `StepsCard`, `Details`, `Snippet`, `OldPostNotice`, `ConnectionInfo`.
  If you see one reappear, delete it — do not preserve it.

- Typography: Bricolage Grotesque (headings) + Source Sans 3 (body) + JetBrains Mono (code),
  loaded via the single Google Fonts `<link>` in `docusaurus.config.js`. Previously "Inter".

- `theme-color` is `#9b5a31` in **both** `docusaurus.config.js`'s `<meta>` and
  `static/manifest.webmanifest` — keep them in sync, there's an explicit comment saying so.

- Snippet's 33 per-language brand colors were **not regenerated**, only rescoped: each
  `.variant_*` sets one `--lang-color` consumed by the 3px toolbar rule, the logo itself
  (`.snippet_logo` on the `<LogoIcon>`) and the focus ring. Note that only the MONOCHROME
  Iconify sets (`ph:*`, `bi:*`, `ix:*`, `file-icons:*`) actually follow `--lang-color`;
  `logos:*`, `devicon:*` and `vscode-icons:*` ship their own brand colours and ignore
  `currentColor`. Both end up correct. If a logo ever renders grey, it is a monochrome icon
  whose `.variant_` class is missing.

- Snippet renders through THREE paths (Eli5CodeBlock / native `<CodeBlock>` / raw MDX children)
  and **all three share one dark code surface** owned by `.snippet_inner`. Keeping the prose
  path light was tried and rejected. This also required `prism.theme` to become a DARK theme
  (`prismThemes.vsDark` for both `theme` and `darkTheme`): prism-react-renderer applies token
  colours as INLINE styles, so a light Prism theme on a dark surface cannot be fixed from CSS.

- **Do not tokenise `--hero-background-light: #fcfcec`.** That exact colour is baked into
  `welcome.mp4`'s own frames and the wrapper is transparent so the two blend seamlessly; the
  video cannot follow a token. The original package got this wrong and it was corrected on
  review. Same rule for any literal carrying a comment that explains why it is literal.

**Corrections applied after the initial landing (rounds 01-03):**

1. `Snippet`: removed `alert alert--info`; removed a bare `code { … !important }` rule that,
   being an ELEMENT selector in a CSS module, was NOT scoped and repainted every `<code>` in the
   site including those inside code blocks; unified the three rendering paths.
2. `OldPostNotice`: removed `alert alert--warning`/`alert alert--success`; wired the previously
   dead `.icon`/`.body` rules; `role="alert"` → `role="status"`.
3. `StepsCard` (stray leading space, `<h3>` → `<p>`, emoji bullets), `TLDR`
   (`font-variant-emoji: text`), `QuickJump` (trailing colon), `ConnectionInfo` (last Infima card
   classes + two `!important` that existed only to fight them), `Terminal/icon.svg` (still
   `#00ff00` + Fira Code), native Markdown admonitions aligned to the callout geometry.
4. **The Infima remap was extended** — it originally covered only `--ifm-color-emphasis-*`,
   leaving seven other families serving COLD greys inside a warm palette:
   `--ifm-font-color-secondary`, `--ifm-color-content-secondary`, `--ifm-color-gray-*`, the seven
   derived `--ifm-color-secondary-*` shades, `--ifm-heading-color`, `--ifm-button-border-radius`
   and the navbar/menu/TOC/dropdown surfaces. This is the highest-leverage fix in the whole
   effort: it cleans up every unmigrated component at once.

**Emoji rule:** an emoji inside `.mk-dot` keeps its own colours and ignores `--mk-on-line`. Use a
text glyph, an SVG, or `font-variant-emoji: text`.

**Stale `.eli5.json` sidecars:** `*.styles.module.css.eli5.json` files are keyed by LINE NUMBER
and were generated from the pre-refactor CSS. After any CSS rewrite they are both factually wrong
and pointing at the wrong lines, and they are shown to readers. Regenerate or delete them
alongside any stylesheet rewrite.

**Not yet migrated** (inheriting the extended Infima remap — not actively wrong, just not
tokenised): `FollowFeed`, `TypoReport`, `about.module.css`, `admin.module.css`,
`reactions-dashboard.module.css`, `typo-dashboard.module.css`, `Blog/HeroSection`, `Reaction`,
`TriedIt`, `Bluesky`, `GithubProjects`, `Trees`, `ScrollToTopButton`, `InstallPwaHint`,
`OfflineNotice`, `TranslationNotice`, `TranslationCoverage`, `AskMyBlog(Widget)`, `BlogGraph`,
`MainTags`, `ShortcutList`, `DownloadButton`, `Image`, `FaqThemePage`, `MyRepositories`,
`KonamiEasterEgg`, `ShakeEasterEgg`, and in `src/theme/`: `BlogPostItem/Content`,
`Blog/Components/Author`, `NotFound`, `SearchBar`. Mechanical recipe: swap radii/shadows/greys
for the three token sets, uppercase labels for `composes: mk-eyebrow from global`, tinted boxes
for `.mk-callout`, cards for `.mk-surface` + `.mk-liftable`, pills for `.mk-pill`.

**Still hardcoded `#2e8555`** (the old Docusaurus green): `src/data/series.js` (the "components"
series accent, visible on `/series`) and `static/blog/rss.xsl`. Both deliberately left alone by
the original package; the series one is user-visible and should become a palette value.
