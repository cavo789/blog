# 068 — Fonctionnalités natives Docusaurus 3.10 pertinentes pour le blog mais non activées

**Priority:** Low
**Category:** docusaurus-feature

## Problem

Le blog tourne sur `@docusaurus/core ^3.10.1` (dernière version stable 3.x, sortie 2026-04-07). La
config actuelle (`docusaurus.config.js`) est déjà assez avancée (Algolia, feeds atom+json, sitemap,
ideal-image, zoom, plugins custom séries/tags/admin-data/blog-feed/ascii-injector), mais quelques
options natives du plugin blog pertinentes pour ce site ne sont pas activées :

1. **`showLastUpdateTime` / `showLastUpdateAuthor`** — littéralement présent en commentaire dans
   `docusaurus.config.js:113` (`// showLastUpdateTime: true,`) mais désactivé. Cette option affiche
   "Last updated on [date]" par article en lisant l'historique Git au build — gratuit, natif, et
   complémentaire à la logique custom déjà en place (`updates:` en frontmatter). Pourrait aussi
   nourrir un futur signal "contenu à vérifier" (idée déjà notée dans [[005]], `outdated-content-
   flag`, mais celle-ci restait un TODO custom/JS — `showLastUpdateTime` est gratuit et déjà prêt).
2. **`blogTitle` / `blogDescription`** — non définis ; la page `/blog` hérite du `tagline` du site
   entier plutôt que d'un titre/description dédiés, ce qui est une opportunité SEO manquée pour
   cette page d'index précise.
3. **`feedOptions.xslt`** — non défini ; ajouter un fichier `.xsl` rendrait le flux RSS/Atom lisible
   visuellement si un lecteur ouvre l'URL du flux dans un navigateur au lieu d'un lecteur de flux
   (actuellement affiché comme XML brut).
   --> Non, je pense que tu fais erreur ici. Mon RSS est celui-ci : http://localhost:3000/blog/rss.xml et j'ai bien un XSL défini en ligne 2 du fichier : <?xml-stylesheet type="text/xsl" href="rss.xsl"?>

## Proposed solution

* Décommenter et activer `showLastUpdateTime: true` (et envisager `showLastUpdateAuthor: true`) —
  nécessite que l'historique Git complet soit disponible au build (vérifier la config CI/CD si le
  clone est shallow).
* Ajouter `blogTitle`/`blogDescription` explicites dans les options du plugin blog.
* Ajouter un stylesheet XSLT minimal pour `feedOptions.xslt`.

L'utilisateur gère lui-même la mise à niveau Docusaurus — ceci ne liste que des opportunités de
configuration à activer sur la version déjà installée, pas une mise à niveau.

## Affected posts

N/A — configuration globale (`docusaurus.config.js`), pas un article spécifique.

## Relationship to existing TODOs

Complète [[005]] (idée de signal "outdated content") avec une option native gratuite plutôt qu'un
composant custom à construire.

## Status — PARTIAL (2026-07-10)

### Done

* Uncommented and enabled `showLastUpdateTime: true` and `showLastUpdateAuthor: true` in
  `docusaurus.config.js` (blog preset options).
* Added `fetch-depth: 0` to the `actions/checkout@v4` step in `.github/workflows/deploy.yml`,
  since the default shallow clone (depth 1) would make `showLastUpdateTime`/`showLastUpdateAuthor`
  read the single shallow commit for every file instead of each post's real last-update date/author.
* Added explicit `blogTitle: "Blog — Christophe Avonture"` and `blogDescription: "Personal blog
  about Docker, Linux, Python, PHP, Quarto, Docusaurus and more"` to the blog preset options
  (reusing the homepage's existing tagline wording for consistency).
* Verified both option sets against the installed `@docusaurus/plugin-content-blog@3.10.1` schema
  (`node_modules/@docusaurus/plugin-content-blog/lib/options.js`) — all four keys match exactly.
  Confirmed via `yarn start` that the config loads without a Joi validation error, and via
  `yarn build` that Docusaurus actively attempts git-history lookups
  (`Cannot infer the update date for some files, as they are not tracked by git`), proving
  `showLastUpdateTime` is wired in.

### Not done

* Item 3 (`feedOptions.xslt`) was not implemented.
  **Reason:** the author flagged directly in the Problem section that this premise was wrong —
  `/blog/rss.xml` already has a working XSLT stylesheet, but it's produced by the custom
  `plugins/blog-feed-plugin/index.js` (not the native `feedOptions.xslt`), which injects the same
  `<?xml-stylesheet type="text/xsl" href="rss.xsl"?>` PI and serves `static/blog/rss.xsl`. Wiring
  native `feedOptions.xslt` too would be pure duplication of an already-solved problem, not a real
  gap.
* Could not visually confirm the rendered "Last updated on …" line or the new blog index
  title/description in a live build.
  **Reason:** `yarn build` currently fails unconditionally (unrelated to this TODO) with an MDX
  compile error — `Expected a closing tag for <TLDR>` in
  `blog/2024/02/07/docusaurus-articles-tips/index.md` (line 21). This is a pre-existing content
  bug, not caused by this change (reproduced identically after stashing these edits back to HEAD).
  It currently blocks every production build, including the `deploy.yml` workflow's `yarn build`
  step — worth a dedicated TODO since it affects deployability, distinct from the already-closed
  [[061]] (which was about *missing* TLDR blocks, not a malformed one).
