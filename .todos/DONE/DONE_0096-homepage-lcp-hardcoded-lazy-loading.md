# 0096 — Le LCP mobile de l'accueil est plombé par un lazy-loading systématique

- **Priority**: High
- **Batch**: blog-home
- **Depends**: —
- **Files**: `src/components/HomeCards/index.js`, `src/data/home_cards.js`

## Problème

Audit visuel du 2026-08-20 : Lighthouse (mobile, build de **production** — `yarn build` +
`docusaurus serve`, pas le dev server qui fausserait la mesure) donne un LCP de **13.4 s** et un
TTI de **13.6 s** sur `/`, alors que le FCP est à 2.1 s et le Speed Index à 2.1 s. L'écart énorme
entre FCP et LCP est le signal.

L'élément LCP identifié par Lighthouse est l'image de la première carte "Explore the site"
(`/img/homepage/blog.webp`), encore dans le viewport initial sur mobile (390×844, vérifié par
capture d'écran). Sa timeline se décompose en TTFB 3 %, **Load Delay 73 % (9.86 s)**, Load Time
3 %, Render Delay 20 % — c'est-à-dire que 73 % du temps avant le plus grand contenu visible est du
pur délai artificiel dû au lazy-loading.

Cause : `HomeCardItem` dans `src/components/HomeCards/index.js:41` appelle
`<CardImage lazy={true} .../>` sans distinction de position — chaque carte, y compris la première
ligne visible au chargement, reçoit `loading="lazy"`. Le composant `CardImage`
(`src/components/Card/CardImage/index.js`) documente pourtant lui-même que `lazy={false}` est
prévu pour "above-the-fold content" — l'option existe, elle n'est simplement pas utilisée ici.

## Solution

Ne pas lazy-loader les cartes qui apparaissent dans (ou juste sous) le premier écran mobile.
Options, du plus simple au plus robuste :

- Passer `lazy={false}` (ou l'inverse, un flag `eager`) pour la première carte de
  `HOME_CARDS` dans `src/data/home_cards.js`, et laisser `HomeCardItem` le lire par carte plutôt
  que de forcer `true` pour toutes.
- Alternative : `fetchpriority="high"` sur la première image plutôt que de désactiver le
  lazy-loading complètement — vérifier ce que `CardImage` supporte déjà.

Revérifier avec Lighthouse (build de prod, mobile) après coup : LCP attendu proche du FCP actuel
(~2 s), pas 13 s.

## Risque

- Ne pas dé-lazy-loader trop de cartes : le bénéfice du lazy-loading existe pour les cartes
  réellement hors-écran (2e/3e ligne) — se limiter à la première ligne visible.

## Acceptance

- [ ] La première carte "Explore the site" charge sans `loading="lazy"` (ou équivalent prioritaire)
- [ ] Lighthouse mobile sur le build de prod : LCP proche du FCP (< 3 s), plus d'écart de 10 s+
- [ ] Les cartes suivantes (hors écran initial) restent lazy-loadées
- [ ] `yarn lint && yarn format:check && yarn build` passent
