---
name: project-design-harmonization-2026-09
description: "Design harmonization 2026-09-19: src/css/theme.css token layer + mk-* primitives (mk-callout, mk-surface, mk-toolbar, mk-dot, mk-eyebrow, mk-pill, mk-liftable) replace six independent callout implementations; typography swapped to Bricolage Grotesque + Source Sans 3 + JetBrains Mono; ten correction rounds since, incl. Snippet default-open, navbar redesign, deepened surface contrast"
metadata:
  node_type: memory
  type: project
  originSessionId: b335f0a6-dc8c-4aaa-a6a3-27181b80f43e
  modified: 2026-09-19T16:00:00.000Z
---

Implemented a full visual-design harmonization package (delivered as a zip with `MIGRATION.md`,
authored 2026-09-19, produced by "Claude Design"). Landed on branch `new_theme`, touching
`docusaurus.config.js`, `static/manifest.webmanifest`, `src/css/theme.css` (new),
`src/css/custom.css` (rewritten), and 15 component `styles.module.css` files + 5 `index.tsx`
markup adjustments. Followed by correction rounds delivered as separate patch zips
(`correctif-02` through `correctif-08`, then `correctif-10`), all applied and verified in this
repo.

**Why:** the site had six independent implementations of the same "tinted surface + rail + dot +
eyebrow" callout pattern (AlertBox, TLDR, QuickJump, OldPostNotice, StepsCard, blockquote), each
with its own colors/radii, several still leaking Infima's default blue (`alert alert--info`)
despite the terracotta rebrand from TODO 0101. `theme.css` now remaps Infima's own variables so
every **untouched** component in the site inherits warm neutrals automatically — this is what
makes the migration incremental rather than all-or-nothing.

**How to apply:**

- New primitives live in `src/css/theme.css`, global (non-module) classes usable from any
  component or MDX file without import: `.mk-callout` (+ `--info/--tip/--note/--warn/--danger/
  --key/--loud` tone variants), `.mk-surface`, `.mk-toolbar` (+ `.mk-toolbar__actions`), `.mk-dot`
  (26px filled icon slot), `.mk-eyebrow`, `.mk-pill`, `.mk-liftable` (hover lift), `.mk-focusable`.
  A component's own **CSS-module** file should `composes: mk-X from global` rather than
  reimplementing. **`composes` only works inside a real `.module.css` read through a component.**
  Two distinct ways this bit us:
  - A **global** stylesheet (imported directly via `import "@site/src/css/x.css"` in an `.mdx`
    page, e.g. `src/css/series.css`) compiles `composes: ...` to a literal, invalid CSS
    declaration that browsers silently ignore — the build stays green, the styling just never
    applies. Inline the primitive's actual declarations by hand instead, with a comment saying why.
  - Inside a real CSS module, `composes` only accepts a selector that is a **single local class**
    — never a compound one like `.wrapper label` or `.parent p`. That shape fails the BUILD
    outright (`composition is only allowed when selector is single :local class name`). Hit three
    times across the patches (`BlogArchivePage`'s `.filterGroupSidebar label`, `GithubProjects`'s
    `.filters_panel label`, `SeriesPosts`'s `.seriesBlogPost p`) — each fixed by adding a dedicated
    class straight on the target element (`.filterLabel`, or `Details`'s new `summaryClassName`
    prop for content rendered inside a shared child component's `<summary>`). One of these
    (`SeriesPosts`) turned out to be *pre-existing* dead CSS: the rule targeted a `<p>` that had
    never existed since the component switched to `Details` — the `composes` restriction is what
    surfaced it.

- **NEVER combine Infima's `alert alert--*`, `card`, or `shadow--md` utility classes with a
  module class that `composes` an `mk-*` primitive.** An earlier revision of this memory claimed
  `OldPostNotice` and `Snippet` kept those classes "intentionally" because the composed class
  "wins the cascade by later source order" — **that claim was wrong** and caused a real,
  user-visible bug: `Snippet` rendered with a Docusaurus-blue background in production for every
  snippet that did not go through the ELI5 renderer. The classes are now removed from ALL of:
  `TLDR`, `QuickJump`, `StepsCard`, `Details`, `Snippet`, `OldPostNotice`, `ConnectionInfo`. If one
  reappears, delete it — do not preserve it.

- Typography: Bricolage Grotesque (headings) + Source Sans 3 (body) + JetBrains Mono (code), one
  Google Fonts `<link>` in `docusaurus.config.js`. Previously "Inter".

- `theme-color` is `#9b5a31` in both `docusaurus.config.js`'s `<meta>` and
  `static/manifest.webmanifest` — keep in sync.

- Snippet's 33 per-language brand colors were rescoped, not regenerated: each `.variant_*` sets
  one `--lang-color`, consumed via `color: var(--lang-color, ...)` on `.snippet_logo` /
  `[class$="_icon"]` directly (both selectors, comma-joined — the per-language `iconClassName`
  values like `.bash_icon` have **no CSS rule of their own** beyond that shared selector; they were
  already dead weight before correctif-07 dropped passing them to `<LogoIcon>` at all). Only the
  MONOCHROME Iconify sets (`ph:*`, `bi:*`, `ix:*`, `file-icons:*`) follow `--lang-color`/
  `currentColor`; `logos:*`, `devicon:*`, `vscode-icons:*` ship their own brand colours and ignore
  it. Both end up correct — a grey logo means a missing `.variant_` class.

- Snippet renders through THREE paths (Eli5CodeBlock / native `<CodeBlock>` / raw MDX children)
  and all three share ONE dark code surface owned by `.snippet_inner`. Prism theme is
  `prismThemes.vsDark` for both `theme` and `darkTheme` — prism-react-renderer applies token
  colours as inline styles, so a light Prism theme on a dark surface can't be patched from CSS.

- **Do not tokenise `--hero-background-light: #fcfcec`.** Baked into `welcome.mp4`'s own frames;
  the wrapper is transparent so the two blend seamlessly, and the video cannot follow a token.
  Same rule for any literal carrying a comment explaining why it's literal.

- **The Infima remap was extended twice (correctif-03 then correctif-04), the highest-leverage
  fixes of the whole effort.** Originally covered only `--ifm-color-emphasis-*`. Now also:
  `--ifm-font-color-secondary` / `--ifm-color-content-secondary` (was pure white in dark mode —
  FOUR independent files had hand-rolled workarounds for this before the remap existed:
  `BlogPostItem/Header`, `follow.module.css`, `Blog/TranslationCoverage`, `src/css/series.css` —
  that's the tell it was a missing token, not four bugs), `--ifm-color-content` (Reaction, TriedIt,
  Trees, OfflineNotice), `--ifm-color-gray-*`, the seven derived `--ifm-color-secondary-*` shades
  (Infima does NOT recompute these from the base color), `--ifm-heading-color`,
  `--ifm-button-border-radius` + related radii, and the navbar/menu/TOC/dropdown chrome surfaces.
  Also extended: `--ifm-color-{info,success,warning,danger}-contrast-background/-foreground` —
  these feed the actual admonition/alert BACKGROUND (the base `--ifm-color-success` etc. only
  feeds the border); without remapping them a native `:::tip` looked right in light mode by
  coincidence and wrong in dark (Infima's static `rgb(0,49,0)`-family literals). Found and fixed
  during Playwright verification, not written in any patch's own text.

- **A `border-radius` on a `overflow: auto` scroll container clips its own content at the rounded
  corner** — CSS makes BOTH axes `auto` the moment either one isn't `visible`, turning the element
  into a scroll container that crops along its border-radius. Bit `BlogArchivePage`'s `.sidebar`
  (correctif-05 §1): the harmonisation's blanket radius swap (6px → 16px, `--ifm-card-border-radius`
  now points at `--mk-radius-lg`) clipped the first pixels of "FILTER BY YEAR". Fix is to drop the
  radius entirely when the element shares the page background (nothing was ever drawn by it), not
  to shrink it. General rule left in the file: a scroll container only gets away with a radius if
  it also has generous padding keeping content off the corner (`Vars .fabPanel`,
  `CommandPalette .dialog`, `AskMyBlogWidget .panel` all qualify).

- **Percentages across a flex row must not be trusted to add up.** `custom.css`'s blog-post grid
  (post list `col--3` + article `col--7` + ToC `col--2`) was pinned at
  `16.6666% + 66.6666% + 16.6666% = 99.9998%` — 0.0002% of slack. A browser rounds each column
  independently to 1/64px, and at some zoom levels the three rounded widths exceed the row, so
  `flex-wrap: wrap` (inherited from Infima's `.row`) drops the ToC onto a second line, landing it
  bottom-left under the post list. Reproduced at 110%/150% zoom, not at 100% — nothing was
  conditional, the same arithmetic just rounds differently per zoom step. Fixed (correctif-06) by
  giving the two rails a fixed `flex: 0 0 16.6666%` and the article `flex: 1 1 0; min-width: 0` so
  it absorbs the remainder to the sub-pixel — wrapping becomes arithmetically impossible. The
  `min-width: 0` matters: a flex item defaults to `min-width: auto` and refuses to shrink below its
  content, so one long unwrapped line in a `<pre>` would re-trigger the overflow. Same commit: the
  post list is now `display: none` (not stretched to 100%) below 997px, so a narrow viewport
  doesn't open every article under a stacked 257-entry list before the reader reaches the title.

- **Snippet defaults to OPEN, not closed** (correctif-07). A reader who clicked into an article for
  its compose file shouldn't have to click again for the thing they came for. Concretely:
  - `defaultOpen` prop changed from `= false` to no default (`undefined`) — the component decides:
    open, unless longer than `COLLAPSE_OVER_LINES` (30), in which case it opens PEEKING at the
    first `PEEK_LINES` (18) under a fade with a "show the remaining N lines" control, not fully
    collapsed. Both are named constants at the top of `index.tsx`.
  - Closed content is now **conditionally rendered** (`{open && (...)}`), not kept mounted inside a
    `max-height: 0; overflow: hidden` box. The old approach was invisible to Ctrl+F (find-in-page
    skips zero-height boxes) but still read in full by a screen reader — the worst of both: a
    sighted reader got "no results" on a word that was on the page, a blind reader heard an entire
    file they hadn't opened. This also deleted the `useEffect` that measured `scrollHeight` on
    every toggle (a forced layout read per snippet, sometimes 15+ on one article).
  - `@media print` drops the peek/fade/expand-control/chevron entirely — printed articles used to
    ship empty boxes where truncated code had been.
  - **Explicitly pass `defaultOpen={false}`** on a genuine file-index listing (a bare `<Snippet>`
    list the reader scans and opens one of, not a narrative). Checked: every "All Files at a
    Glance" section in the corpus already goes through `<ProjectSetup>`, which unconditionally
    overrides `defaultOpen` on every child via `React.cloneElement(..., { defaultOpen: expandAll })`
    (`expandAll` starts `false`) — so this component was never affected by the global default flip
    and needed no retrofitting. A bare `<Snippet>` list NOT wrapped in `ProjectSetup` would need the
    prop added by hand; none currently exist in the corpus (checked across all 257 articles).
  - **A per-file line-count in the closed header (`"N lines"`) was added by the patch, then removed
    same day on author review**: in `ProjectSetup`'s dense file list it read as visual noise next
    to a filename that already says what the row is — "moche et inutile". Reverted: no
    `.snippet_lines` CSS, no `snippet.lineCount` translate id (removed from `i18n/fr/code.json`
    too — check before ever re-adding a similar per-row metric to a list-style component). The
    `lineCount` computation itself stays; it drives `isLong`/peek-mode and the "show remaining N
    lines" count, which the author did not object to.

- **Navbar redesign (correctif-08).** Background moved from `--mk-surface` (pure white) to
  `--mk-sunken` (a real sand step below the page) — the navbar used to sit at ~1% luminance
  difference from the page, reading as no object at all. An active-page indicator was added
  (`.navbar__link--active`, a 3px inset terracotta underline in the bar, a left rail + key-tone
  fill in the mobile drawer) — this **requires every navbar item to use `to:` instead of `href:`**
  in `docusaurus.config.js`; Docusaurus only applies the active class to `to`-declared items.
  `Blog`'s entry needs `activeBaseRegex: "^/(fr/)?blog/(?!tags|archive)|^/(fr/)?blog/?$"` or it
  lights up simultaneously with `Tags`/`Archive` (default matching is prefix-based); the
  `(fr/)?` is load-bearing, not decorative — omit it and the indicator never lights on `/fr/`.
  `SearchBar`'s button also retokenised (was hard-coded 2px terracotta border + heavy shadow,
  needed on a white bar; redundant — a third terracotta — on the new sand one).
  - **Site title stays "Christophe Avonture."** The patch offered shortening it to "avonture.be";
    asked, and the answer was no — don't re-suggest this without new information.
  - **CSS `@layer` beats specificity, full stop, for `!important` rules.** Docusaurus wraps ALL of
    Infima + its own theme CSS in named layers (`@layer docusaurus.infima, docusaurus.theme-common,
    ...`), established once, very early, before any site CSS loads. A layered `!important` rule
    (Infima's `.margin-vert--lg { margin-top: 2rem !important }`, applied to the `<main>` every
    `src/pages/*.mdx` page renders inside) cannot be beaten by ANY unlayered rule — not with higher
    specificity, not with `!important` of its own, not even from a brand-new `@layer` declared
    after Infima's (layer priority for `!important` is the REVERSE of normal cascade order: the
    EARLIEST-established layer wins, and Infima's is about as early as it gets). Verified this
    empirically after three failed override attempts before finding the actual cause — don't
    re-attempt a `!important`/specificity war against Infima's own layered rules; it cannot win.
    The only way out is to not fight the cascade: `HeroSection`'s own (unlayered, un-important)
    `margin-top` was set to `-2rem` instead, in `index.module.css`, to visually cancel its
    ancestor's margin from the other side — no competing rule involved at all. This is also why
    the 32px gap was invisible before correctif-08: the navbar used to be near-white, so the gap
    (showing `--mk-bg`, also near-white) didn't read as a seam. The deeper sand navbar made it
    visible. **Lesson for any future `<main>`-ancestor override attempt: check whether Docusaurus
    wraps the target rule in `@layer` before reaching for `!important` — grep the compiled
    stylesheet's `@layer` statements, don't guess.**

- **Surface contrast deepened, the widest-reaching change of the whole effort (correctif-10) —
  touches every background pixel on the site.** The original ramp had exactly one light value:
  page `#fffdf7`, cards `#ffffff`, a 1.01:1 ratio — a card could not read as a card no matter what
  its border/shadow said, because nothing had an edge to work with. Fixed by moving EIGHT values as
  a set, not by "darkening everything" (that changes nothing — a border is only visible relative to
  what it sits on, so borders had to drop FURTHER than surfaces):
  `--mk-n-0/50/100/200/300/700` all moved (bordering values dropped the most: `--mk-n-200` #e9e0cf
  → #d5c7a9, three steps, vs. the page ground's one step #fffdf7 → #f7f0e2), `--mk-key-bg` moved
  WITH the page (#faf0de → #f8ecd5 — at the old value it would have ended up LIGHTER than the new
  page ground, flipping every TL;DR/tag/active-pill from "tinted recess" to "glowing highlight"),
  and `--ifm-link-color` was pointed at `--ifm-color-primary-dark` in light mode only (the primary
  alone dropped from 5.27:1 to 4.75:1 on the deepened page — still AA, but with a margin thin
  enough that the next adjustment could break it silently; reverted to the plain primary in dark
  mode, where `-dark` is the wrong direction). **A palette is an order, not a list of independent
  colors — moving one link without the others that reference it relative to it inverts
  relationships**, per the `--mk-key-bg` trap above.
  - **Two known, accepted side effects, not bugs:** `--hero-background-light: #fcfcec` (baked into
    `welcome.mp4`, never tokenise it) is now LIGHTER than the deepened page ground instead of
    barely darker — the homepage hero changed from "a discreet recess" to "a bright rectangle up
    top." Confirmed as the expected/predicted outcome, not investigated further as a defect. Any
    image exported on a plain white background (articles' own screenshots, some banners) will
    now show a visible white rectangle where it used to blend in — watch for this specifically in
    `/blog` grid thumbnails and inline `.screenshot`-class images if reports come in.
  - Dark mode intentionally untouched (`[data-theme="dark"]` already had two distinct values,
    `#1a1510` page vs `#221c15` surface) — only the `--ifm-link-color` revert line was added there.

- **`.mk-surface`'s own border/shadow bumped, on author request (same session as correctif-10, but
  a separate ask, not part of any patch zip).** `border: 1px solid var(--mk-border)` /
  `box-shadow: var(--mk-shadow-1)` read as barely-there even after the page/card contrast fix
  above — the author flagged a `ProjectSetup`/`Snippet` closed-row screenshot losing definition
  compared to the pre-harmonisation blue-bordered version. Bumped to `--mk-border-strong` +
  `--mk-shadow-2`. This is the primitive `PostCard`, `HomeCards`, `Updated`, `Vars`, `ProjectSetup`
  and `Snippet` all `composes` from, so the fix applies once, system-wide, rather than per
  component — deliberately recommended over a per-component margin tweak, which wouldn't have
  addressed the actual complaint (missing edge definition, not missing whitespace).

**Stale `.eli5.json` sidecars:** keyed by LINE NUMBER, generated from pre-rewrite CSS/TSX. After
any rewrite of an annotated file, regenerate (`node scripts/generate-eli5.mjs <file> --force`,
costs a small Anthropic API charge — ask before bulk-regenerating) or delete the sidecar; a missing
sidecar degrades cleanly (no "Explain this snippet" block). `yarn eli5:check` finds stale ones.

**Verification discipline that paid off across all seven rounds:** a green `yarn build` proves
nothing about markup that never renders what a comment claims, or CSS that never applied. Real bugs
found ONLY by Playwright screenshots + `getComputedStyle` diffing, not by the build: the dark-mode
admonition background (contrast-background token), the `SeriesPosts` dead `<p>` selector, the
clipped "FILTER BY YEAR" corner, confirming `HomeCards`/`MainTags` hover now pixel-identical. See
`.claude/rules/build-verification.md`.

**Emoji rule:** an emoji inside `.mk-dot` keeps its own colours and ignores `--mk-on-line`. Use a
text glyph, an SVG, or `font-variant-emoji: text`.

**Not yet migrated** (inherit the extended remap — not actively wrong, just not tokenised):
`FollowFeed` (11 KB — largest, deliberately skipped as too risky to rewrite blind),
`TypoReport`, `about.module.css`, `admin.module.css`, `reactions-dashboard`, `typo-dashboard`,
`Blog/HeroSection` (⚠️ carries the `welcome.mp4` colour-lock, needs a human, never tokenise
`--hero-background-light`), `Bluesky` (brand colours need a careful read, not a mechanical pass),
`MyRepositories`, both easter eggs, `NotFound`. Mechanical recipe: swap radii/shadows/
greys for the three token sets, uppercase labels → `composes: mk-eyebrow from global` (unless it's
a dense lowercase-name list like a tag cloud or `CommandPalette .previewTag`, which keep the pill's
shape/colour/hover but opt OUT of the uppercase/letter-spacing treatment), tinted boxes →
`.mk-callout`, cards → `.mk-surface` + `.mk-liftable`, pills → `.mk-pill`.

**Two known structural duplications, flagged not fixed:** `Reaction`/`TriedIt` are byte-identical
CSS (bar `.submitError`) — should be one shared `Feedback` widget. `HomeCards`/`Blog/LatestPosts`/
`MainTags` each hand-roll `.cardsSection`/`.cardsGrid`/`.cardItem` — now visually identical via the
shared primitives, but still three copies; a `CardGrid` component would remove the duplication.

**Paired-by-comment files that must change together:** `CopyAsMarkdown`'s `.copyBtn` and
`Blog/Series`'s `.markdownLink` are deliberately identical tokens (a comment in both says so) so
the two "get this as plain Markdown" affordances read as one family.

**Still hardcoded `#2e8555`/`#3ecc5f`-family greens, deliberately left alone:** `src/data/series.js`
(the "components" series accent — **confirmed brand-correct**, not a leftover: every one of the 26
series colours is a real technology's brand colour — Docker blue, Joomla orange, VS Code blue,
etc. — and `#2e8555` is simply Docusaurus's own green, same category as Snippet's 33
`--lang-color`s. An earlier round of this memory suggested replacing it with the palette's cyan;
that suggestion was wrong and retracted — don't tokenise it. If anything, the one arguably-worthwhile
tweak is aligning it with the *other* Docusaurus green already in the repo, `#3ecc5f` in
`Snippet/styles.module.css`'s `.variant_docusaurus` — purely optional, author's call) and
`static/blog/rss.xsl` (the RSS feed's own stylesheet — invisible from the site, cosmetic only).
