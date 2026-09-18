---
paths:
  - "plugins/**/*.cjs"
  - "plugins/**/*.mjs"
  - "plugins/**/*.js"
  - "src/theme/**/*.js"
  - "src/theme/**/*.tsx"
  # Every component, not just Blog/: the two defects where a bare permalink was pushed
  # programmatically were in BlogGraph/ and CommandPalette/, which a "Blog/**" glob misses by
  # one character. Any component that assembles a URL is in scope.
  - "src/components/**/*.tsx"
  - "src/components/**/*.js"
  - "docusaurus.config.js"
---

# i18n locale safety — always apply

This site is multi-locale (`en` default, `fr`). Full rationale and the 17 real defects that
produced this rule: `.todos/DONE/DONE_0119-traduction-francaise-automatique-des-articles.md`
(closed 2026-09-17; the rollout continues in `.todos/0124-deploiement-progressif-de-la-locale-fr.md`).

**The bug class**, in its sharpest form: for every path you manipulate, know **whether it came
from Docusaurus or was built by hand**. Docusaurus-provided paths (`permalink`, `routesPaths`,
`outDir`, `tag.permalink`) already carry the locale's `baseUrl`; anything your own code assembled
(`/blog/tags/${slug}`, a breadcrumb `href`, a sitemap pattern) does not. Mixing the two silently
produces either a doubled prefix (`/fr/fr/blog/…`, which emptied the RSS feed) or a missing one
(zero Markdown mirrors, English breadcrumbs in French JSON-LD).

The same file often contains both. In `src/components/StructuredData/index.tsx`,
`${siteUrl}${permalink}` must NOT be prefixed while `${siteUrl}${entry.href}` must be — so a rule
phrased as "always add baseUrl" breaks as surely as the bug it fixes. Comment what must stay
untouched, not only what you changed.

Grepping for a hardcoded `/blog` finds almost none of these: several lived in patterns, in
comparisons, or in a concatenation of two correct-looking variables.

**Two search methods, and they find different things.** Builds and artefact counts catch what
produces something WRONG — an empty feed, missing mirrors, English text under a French URL.
They catch nothing that produces an ABSENCE. Two of the defects here were a regex matching only
`/` (the ⌘K pill never appeared on `/fr/`) and a path comparison that never matched (the
"recently viewed" list stayed permanently empty in French). No error, no broken link, no failing
test — just a feature quietly missing from one locale. Those only surface by re-reading every
`location.pathname` consumer and asking, for each path: **where did this come from?**

- ✅ DO: build routes with `normalizeUrl([context.baseUrl, "blog/tags", slug])`.
  ❌ DON'T: `actions.addRoute({ path: `/blog/tags/${slug}` })` — under `fr` the route registers
  at `/blog/...` while every link points at `/fr/blog/...`. That was 2520 broken links.
- ✅ DO: strip `baseUrl` from a permalink before `path.join(outDir, …)`. `outDir` is **already**
  the locale's folder (`build/fr`) and the permalink **already** carries `/fr/` → `build/fr/fr/…`.
- ✅ DO: add `baseUrl` to a computed permalink before comparing it to `routesPaths`, which
  carries it. The same prefix is doubled in one direction and missing in the other.
- ✅ DO: prefix `siteConfig.baseUrl` when building an absolute URL. `siteConfig.url` is the bare
  origin — `url + permalink` silently drops the locale.
- ✅ DO: locale-prefix every sitemap `ignorePatterns` entry (`/fr/blog/tags/**` as well as
  `/blog/tags/**`). `process.env.DOCUSAURUS_CURRENT_LOCALE` is set before the config loads.
- ✅ DO: use a plain `<a href>` for any link that **crosses** locales. `<Link to="/blog/x/">`
  rendered under `fr` resolves to `/fr/blog/x/` — a "see the English original" link that loops
  back on itself — and the link checker flags cross-locale `<Link>` as broken.
- ✅ DO: include `baseUrl` in `matchPath` patterns (`` `${base}/blog/tags/:slug` ``). A bare
  pattern matches nothing under `fr` and renders the "not found" branch on a valid page.
- ❌ DON'T: assume a plugin's post objects have a `slug`. Several carry only `permalink`;
  `translated.has(undefined)` is always false and filters everything out, silently.
- ✅ DO: **check `i18n/<locale>/` for an existing translation file before writing any workaround.**
  `yarn write-translations` generates `code.json`, `docusaurus-theme-classic/footer.json` and
  `navbar.json`, and those files **override** whatever `docusaurus.config.js` computes. A
  locale-aware `copyright` built from `DOCUSAURUS_CURRENT_LOCALE` in the config is silently
  ignored; the actual fix was two lines of JSON. Cost: 15 lines of dead workaround and three
  builds.
- ⚠️ NOTE: `DOCUSAURUS_CURRENT_LOCALE` is `undefined` on the FIRST config load (Docusaurus reads
  the config once to discover the locale list, then once per locale). Anything derived from it at
  config level must tolerate `undefined` — and `write-translations` captures **that** first pass,
  which is why the generated JSON held the English string.
- ✅ DO: translate `navbar.json` too. It is generated alongside `footer.json` and left entirely in
  English — the main menu of every page ("Series", "Map", "Repositories", "About me").
- ❌ DON'T: let an **enrichment step overwrite a value that was already localized upstream**.
  `SeriesCards` did `description: data?.description` from the English `src/data/series.js` *after*
  `useSeriesList()` had resolved the French one — so every `/fr/series/` card published an English
  description. The English data file is the source of truth for images, colors and fallbacks; it
  must be the `??` right-hand side, never the left. Grep any `X_DATA.find(...)` overlay for fields
  the hook it decorates already localized.
- ✅ DO: keep the domain identifier English and localize only what is **displayed**. A series name
  builds `/series/<slug>` and matches front matter, so `seriesName` travels untranslated while
  `title`/`description` are swapped — see `src/components/Blog/utils/seriesI18n.ts`, the single
  localizer every series surface calls (cards, series page, `SeriesPosts`, breadcrumb, JSON-LD).
  Same shape for tags: `src/components/Blog/utils/tagsI18n.ts` reads `blog/tags.yml` **and**
  `i18n/<locale>/docusaurus-plugin-content-blog/tags.yml` — the file Docusaurus already renders
  `/fr/blog/tags/` from, never a hand-made `tags.fr.js` copy free to drift.
- ✅ DO: when a shared pure builder feeds both a visible component and its JSON-LD
  (`buildBreadcrumbTrail`), localize via an **optional label parameter** passed by each caller, not
  inside the builder. The builder has no locale, and the two outputs must never disagree.
- ✅ DO: read the translated source in a non-default locale, don't just filter the English one.
  Filtering hides untranslated articles; it still shows English titles for the translated ones.
- ⚠️ NOTE: a hand-built path to a **static asset** fails INVISIBLY under a locale. `/img/x.webp`
  requested under `fr` does not 404 — the dev server answers the SPA fallback, `200 text/html`,
  and the browser paints a broken image. Any check that reads status codes passes. This hid
  broken banners on `/fr/blog/archive/`, `/fr/series/<s>/` and both `map.mdx` files. The same
  applies to `postBuild` artefacts (`/llms/<series>.txt`): in production the unprefixed path
  serves the **English** file, so it is not even broken — just the wrong language.
- ✅ DO: `useBaseUrl(path)` for a front-matter or hand-built asset path, and `useBaseUrlUtils()`
  when the value is only known after an early return (the hook must run first, the returned
  `withBaseUrl` is a plain function). It is idempotent (`!url.startsWith(baseUrl)`) and a no-op
  at `baseUrl: "/"`, so adding it never changes the default locale.
  ❌ DON'T touch a Docusaurus-provided `permalink` — `MarkdownAlternate`'s `${permalink}.md` is
  already prefixed.
- ⚠️ NOTE: **`history.push()` is not `<Link to>`.** Docusaurus gives its `BrowserRouter` no
  `basename` (`clientEntry.js`) — every route path already contains the locale's `baseUrl`, and
  `<Link>` prefixes on its own. So a bare `/blog/x` pushed under `fr` matches no route at all and
  lands on the 404, even in production where that English URL exists: the click is SPA navigation
  inside the French bundle, not a page load. It fails ONLY in a non-default locale, so English CI
  and the `<Link>`-based fallback beside it both stay green. Hit `CommandPalette`, then
  `BlogGraph`'s canvas (`/fr/map/`: every bubble 404'd).
- ✅ DO: wrap a programmatic navigation target in `withBaseUrl` whenever **your own code
  assembled it** from a slug or a bare permalink — `history.push`, `window.location.href`,
  `router.replace`. A target read back from a real element or the current location is already
  resolved and must be left alone (`OfflineNotice` pushes `url.href` off a clicked `<a>`). Grep
  for these after touching any component that navigates from a computed path: a canvas or a
  palette has no `<a>` for a link checker to find.
- ⚠️ NOTE: a **duplicated `translate()` id breaks only the translated locales.** Two calls sharing
  `theme.NotFound.title` looked fine in English — a missing key falls back to each call's own
  `message` — and both rendered "Page introuvable" in French. The bug ships with the translation,
  not with the code, so English CI stays green.
- ✅ DO: emit both locales' feeds as `<link rel="alternate">` with `hreflang` on the source one.
  `react-helmet-async` keys `<link>` on **`href`** (`linkTags: x(LINK, ["rel","href"], …)`), not on
  `rel`+`type`, so siblings coexist. `hreflang` takes the locale CODE (`en`), never the display
  label (`English`).
- ⚠️ NOTE: `static/` is copied into **every** locale's output, so `build/fr/.htaccess` is a
  verbatim copy of the root one — and Apache applies it to every `/fr/` URL. Any absolute target
  in it (`ErrorDocument 404 /404.html`, a `RewriteRule … /index.html`) sends French readers to the
  English page. `plugins/i18n-htaccess` repoints them at build time and fails the build if the
  directive changed shape; `deploy.yml` re-checks it. Edit `static/.htaccess` with that in mind.
- ⚠️ NOTE: anything that ships per locale ships per locale on the **server** too —
  `build/fr/assets/` and `build/fr/pagefind/` are content-hashed output needing the same
  `--delete` pass as the root ones. `deploy.yml` derives the locale list from `i18n/*/`; never
  hard-code `fr` there.
