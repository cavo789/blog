---
description: Critical deep review of the React component library (src/components). Generates TODOs.
argument-hint: "[component-name]   (empty = full src/components)"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Deep Review of the Component Library

Perform a comprehensive and critical review of `src/components/` — the React component library
powering this Docusaurus blog (functional components + Hooks, no TypeScript, used both inside MDX
blog posts and in the theme/site chrome).

Your goal is not to confirm existing design choices, but to identify weaknesses, risks,
inconsistencies, technical debt, missing features, maintainability concerns, developer-experience
issues, architectural limitations, and opportunities for improvement.

## Scope — read `$ARGUMENTS` first

`$ARGUMENTS` is an **optional** scope.

- **Empty** → review all of `src/components/` (full mode).
- **A component name or path** (e.g. `AlertBox`, `Blog/AlertBox`, `Card`) → resolve it under
  `src/components/` and restrict the review to that component and its direct collaborators
  (siblings it composes, shared utils it imports, other components duplicating its concern). State
  the scope explicitly in the report header.

If `$ARGUMENTS` does not resolve to any existing path under `src/components/`, stop and respond:

```text
Usage: /deep_review [component-name]
Examples: /deep_review              (full src/components)
          /deep_review AlertBox     (one component)
          /deep_review Blog/PostCard
```

A scoped run still considers cross-cutting impact (e.g. a shared util, a duplicate elsewhere in the
tree), but only files findings whose root cause lives in the requested scope.

## Project Context

This is a personal Docusaurus 3.x blog (`@site/src/components`, functional components + Hooks
only, no class components, no TypeScript). Components fall into two families:

- **Blog-domain components** (`src/components/Blog/*`): `AlertBox`, `PostCard`, `RelatedPosts`,
  `SeriesCards`, `SeriesPosts`, `SeriesStats`, `Tags`, `Updated`, `OldPostNotice`, `AuthorCard`,
  `LatestPosts`, `PostMeta`, `PostCount`, `HeroSection`, `LogoIcon`, `AIIcon`, etc. — content-aware,
  used by the swizzled `BlogPostItem` theme and by MDX authors.
- **Generic UI primitives** (`src/components/*`): `Card` (+ `CardHeader`/`CardBody`/`CardFooter`/
  `CardImage`), `Terminal`, `Snippet`, `StepsCard`, `ProjectSetup`, `Trees` (+ `Folder`/`File`),
  `TLDR`, `Highlight`, `Details`, `Columns`/`Column`, `BrowserWindow`, `TypoReport`,
  `Prerequisite`, `ShortcutList`, `InteractiveCode`, `TriedIt`, `Reaction`, `Bluesky`,
  `DownloadButton`, `ScrollToTopButton`, `StructuredData`, `MainTags`, `GithubProjects`,
  `MyRepositories`, `HomeCards`, `Feature`, `ReadingProgress` — reusable across any MDX file.

Most components are globally registered in `src/theme/MDXComponents.js` (usable without import in
blog posts). Component styling must use CSS Modules (`styles.module.css`) with Infima CSS variables
for dark/light mode — no hardcoded hex colors except where a value legitimately defines a token's
source of truth or is deliberately theme-independent (see `color-no-hex` exceptions already
documented via `/* stylelint-disable color-no-hex */` comments in the codebase). Governance rules
live in `AGENTS.md` — treat it as binding, not advisory.

## Review Objectives

Evaluate whether the component library:

1. Follows the Single Responsibility Principle — each component does one thing, composition over
   monoliths.
2. Is consistent across components in structure, naming, and API shape (props named/shaped the same
   way for the same concept across components).
3. Is reliable: no silent failures, no unguarded `require()`/dynamic imports, sane handling of
   missing/malformed data (e.g. a post missing a frontmatter field a component expects).
4. Is accessible (semantic HTML, ARIA where needed, keyboard navigation, color contrast in both
   themes).
5. Is performant (unnecessary re-renders, missing memoization where it matters, large components
   that should be split, unnecessary client-side JS for what could be static).
6. Is easy to discover and adopt by a future author writing a blog post (self-explanatory props,
   sensible defaults, discoverable via `readme.md` or MDXComponents registration).
7. Avoids duplicate/overlapping components solving the same problem slightly differently.
8. Correctly supports both light and dark mode via Infima/`data-theme`, with no hardcoded assumptions.

## Areas to Review

### Architecture

Composition vs. duplication, coupling between components (e.g. a `Blog/*` component reaching into
another's internals instead of composing), prop drilling, whether shared logic (date formatting, tag
resolution, image path resolution) is centralized in `src/components/Blog/utils` or duplicated
per-component, whether a component belongs in `Blog/` vs the generic tree.

### Code Quality

Complexity, readability, naming consistency (props, files, CSS class names), `PropTypes` coverage
(cross-check against the ESLint `react/prop-types` rule — `warn` in some configs, `error` in
others; see `.todos/DONE/DONE_040-inconsistent-proptypes-coverage.md` and
`.todos/DONE/DONE_056-proptypes-coverage-src-theme.md` for prior work in this area), dead code, dead
imports, duplicate logic between sibling components (e.g. `Card` primitives — see
`.todos/DONE/DONE_038-card-primitives-dead-import-duplication.md`), unhandled edge cases, default
prop values, PropTypes vs. actual usage drift.

### Styling

CSS Modules usage, Infima variable usage vs. hardcoded hex (see
`.todos/DONE/DONE_039-hardcoded-hex-colors-no-token-system.md` and the `color-no-hex` stylelint
exceptions already in place — don't re-flag those), dark/light mode parity, responsive behavior,
unused CSS, inline styles that should be CSS Modules.

### Reliability

Hidden bugs, components that assume frontmatter/data shape without guarding
(`.todos/DONE/DONE_043-seriescards-silent-require-failure.md`,
`.todos/DONE/DONE_044-silent-fetch-failures-feedback-widgets.md` for the pattern already fixed
elsewhere — look for the same class of bug in components not yet covered), unresolved paths
(`.todos/DONE/DONE_042-structureddata-unresolved-image-path.md`), stale/incorrect data
(`.todos/DONE/DONE_045-eli5-json-staleness-no-freshness-check.md`), broken links between components
and the data/config they depend on (`src/data/`, `tags.yml`, `authors.yml`).

### Consistency & Documentation

Every component folder should have `index.js`, `styles.module.css` (if it renders anything
visual), and ideally a `readme.md` documenting props and usage — flag components missing a
`readme.md` when siblings have one, and flag `readme.md` files that drifted from the actual
implementation (documented props that no longer exist, or props not documented).

### Developer Experience (DX)

Would a future-you, writing a new blog post six months from now, know this component exists and how
to use it without reading the source? Evaluate discoverability (is it in `MDXComponents.js`? does
`readme.md` exist and match reality?), sensible prop defaults, clear error messages when misused
(e.g. required prop missing), and whether the API shape matches how it's actually used across posts
(`Grep` `blog/` for real usage patterns).

### Testing

There is currently no automated test coverage for components (`0` test files as of this writing).
Assess whether that's an acceptable tradeoff for a personal blog or whether specific
high-risk/high-reuse components (e.g. `AlertBox`, `Card`, data-parsing components like
`SeriesCards`/`RelatedPosts`) would benefit from lightweight tests, without pushing for full
coverage as a goal in itself.

## Incremental / rerun mode

This review may run many times over the project's life. Treat the current code and the existing
TODO backlog as the baseline:

1. Before reporting, enumerate **all** existing TODO IDs across `.todos/` **and its subfolders**
   (`DONE/`, `PARTIAL/`, `BLOCKED/`, `WONT_DO/`, or any other status folder present). Treat every
   one — including `DONE` — as known.
2. Do not re-report problems already captured by an existing TODO. Instead verify whether the
   existing TODO is sufficient; if not, say how it should be extended, and reference it by ID.
3. Spend the report on gaps, blind spots, second-order issues, and opportunities created by the
   future implementation of existing TODOs — in particular, whether a pattern already fixed in one
   component (silent failures, hex colors, PropTypes, dead imports) recurs in others not yet
   covered.
4. Always assume additional improvements exist; do not stop because major issues are already covered.

## Output Format

Respond in French. Be direct, precise, and critical. Do not avoid criticism.

State the scope (full `src/components` or the resolved component/path) in the first line.

For every issue found: explain the problem, the impact, the risk, and propose a concrete solution.

Prioritize findings using: Critical, High, Medium, Low.

## TODO Generation

Propose a TODO file **for every issue found**, stored flat in `.todos/`.

**Numbering (mandatory):** scan `.todos/` and all its subfolders for the highest existing `NNN`
(three-digit) ID. New TODOs start at `max + 1` and increment. Never reuse or collide with an ID that
already exists anywhere, including under status subfolders.

**Naming:** `NNN-short-description.md`, the short description in **English** (e.g.
`057-alertbox-missing-readme.md`).

**Anti-duplication:** before writing a TODO, confirm no existing item (any folder) already covers it.
If a related TODO exists, reference it and explain whether it should be extended or chained rather
than creating a duplicate.

For each proposed TODO provide: suggested filename, priority, objective, expected benefit, rough
implementation strategy, and its relationship to existing TODOs (dependencies / chaining).

Focus on actionable improvements rather than theoretical observations.
