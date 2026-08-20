# 0098 — Le logo de la navbar répète le titre du site pour les lecteurs d'écran

- **Priority**: Low
- **Batch**: blog-a11y
- **Depends**: —
- **Files**: `docusaurus.config.js`

## Problème

Audit visuel du 2026-08-20 : Lighthouse (accessibilité, build de production) signale
`image-redundant-alt` sur le logo de la navbar. `docusaurus.config.js` (bloc `themeConfig.navbar`)
déclare `title: "Christophe Avonture"` **et** `logo.alt: "Christophe Avonture"` côte à côte — un
lecteur d'écran annonce le nom deux fois de suite pour un seul élément de navigation.

## Solution

Vider `logo.alt` (`alt: ""`) puisque le logo est purement décoratif à côté du titre déjà lu, ou à
défaut lui donner un texte qui n'est pas une pure répétition (ex. "Avatar" — moins bon, `""` est le
choix standard ici).

## Acceptance

- [ ] `logo.alt` ne duplique plus le texte du `title` adjacent
- [ ] Lighthouse accessibilité : `image-redundant-alt` ne remonte plus
- [ ] `yarn lint && yarn format:check && yarn build` passent
