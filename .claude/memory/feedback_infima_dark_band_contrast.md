---
name: feedback-infima-dark-band-contrast
description: En dark, la palette Infima n'a aucun headroom entre les fonds — séparer les blocs par la bordure, jamais par la teinte de fond
metadata:
  type: feedback
---

En dark mode, les fonds disponibles d'Infima sur ce blog sont tous à quelques points
de luminance les uns des autres :

- `--ifm-background-color` : `#1b1b1d`
- `--ifm-color-emphasis-100` : `#1c1e21`
- `--ifm-background-surface-color` = `--ifm-card-background-color` : `#242526`

Aucune combinaison ne produit une bande full-bleed franchement distincte du fond de
page, ni une carte franchement distincte de sa bande. En light c'est l'inverse :
`#fff` / `#f5f6f7` / `--hero-background-light` se lisent très bien.

**Why:** vérifié le 2026-09-10 en mesurant les tokens calculés dans le navigateur, en
refondant la zone « Follow every new post » de la homepage. Le variant `section` de
`FollowFeed` posait une carte `card-background` sur une bande `emphasis-100` : en light
c'était lisible, en dark la carte se réduisait à un liseré et le bloc perdait toute
matérialité. Choisir un autre fond ne réglait rien — il n'y a rien à choisir.

**How to apply:** en dark, faire porter la séparation par la **bordure**, pas par le
fond — `--ifm-color-emphasis-200` (`#444950`) est bien visible sur `#242526`, alors que
le `emphasis-300` (`#606770`) utilisé en light y devient un gris clair trop marqué.
Concrètement : déclarer un token local de bordure sur le conteneur (jamais sur la carte
elle-même, sinon l'override `[data-theme="dark"] .card` prend le pas sur
`.card:hover` dans la cascade et le hover cesse silencieusement de fonctionner), puis
le retuner dans le bloc dark. Voir `src/components/FollowFeed/styles.module.css`
(`--follow-card-border`). Cousin de [[feedback-infima-secondary-dark]].
