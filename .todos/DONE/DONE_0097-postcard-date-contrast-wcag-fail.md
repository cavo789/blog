# 0097 — La date des cartes d'articles échoue au contraste WCAG AA (mode clair)

- **Priority**: Medium
- **Batch**: blog-a11y
- **Depends**: —
- **Files**: `src/components/Blog/PostCard/styles.module.css`

## Problème

Audit visuel du 2026-08-20 : Lighthouse (accessibilité, build de production) signale
`color-contrast` en échec sur `.date span` de `PostCard`. Mesure exacte : texte `#d4d5d8` sur fond
`#ffffff`, ratio **1.46:1** — le minimum WCAG AA pour du texte normal est 4.5:1. Capture d'écran à
l'appui : la date ("August 17, 2026 · 26 min read") est quasi invisible sur les grilles de cartes
en mode clair — accueil ("Explore the site" n'est pas concerné, mais la grille `/blog`, `/tags`,
`/series` le sont toutes puisqu'elles réutilisent `PostCard`).

Cause : `src/components/Blog/PostCard/styles.module.css:22` — `.date { color:
var(--ifm-color-secondary-dark); }`. Ce token résout en `#d4d5d8` dans le thème clair, bien trop
clair pour du texte sur fond blanc.

Vérifié : le **mode sombre n'est pas affecté** — `[data-theme="dark"] .date` utilise
`--ifm-color-secondary-light`, qui résout en `rgb(238, 240, 242)` sur fond de carte
`rgb(27, 27, 29)`, un contraste très large. Le correctif ne concerne que la règle du mode clair.

## Solution

Remplacer `--ifm-color-secondary-dark` par un token (ou une valeur) qui atteint au moins 4.5:1 sur
fond blanc/carte claire — `--ifm-color-emphasis-700` ou équivalent Infima est probablement le bon
niveau, à vérifier au contrastomètre plutôt qu'à l'œil. Garder le style italique existant, ne
toucher que la couleur.

## Acceptance

- [ ] Contraste du texte `.date` en mode clair ≥ 4.5:1 (vérifié, pas juste "plus foncé")
- [ ] Mode sombre inchangé (déjà conforme)
- [ ] Lighthouse accessibilité : `color-contrast` ne remonte plus cette occurrence
- [ ] `yarn lint && yarn format:check && yarn build` passent
