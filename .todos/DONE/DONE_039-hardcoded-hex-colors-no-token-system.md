# 039 — Couleurs hex codées en dur : pas de système de tokens, corrections au coup par coup

**Priority:** Medium

## Problème

`AGENTS.md` : _"Avoid hardcoded hex colors"_ — utiliser les variables Infima. Pourtant, un grep sur
`src/components/**/*.css` remonte des dizaines de couleurs hex en dur, notamment :

- `Blog/AlertBox/styles.module.css` : ~90 valeurs hex différentes pour gérer 7 variantes ×
  light/dark (chaque variante redéfinit sa propre palette complète à la main).
- `Snippet/styles.module.css` : ~25 couleurs de bordure par langage + thèmes de coloration
  syntaxique en dur.
- `Terminal/`, `Details/`, `Reaction/`, `BrowserWindow/`, `TriedIt/`, `TypoReport/`,
  `Blog/LatestPosts/styles.module.css` : couleurs hex ponctuelles supplémentaires.

L'historique des TODOs `DONE` montre que ce choix a **déjà causé des bugs corrigés un par un** :
`DONE_017` (h4 illisible en dark), `DONE_019` (OldPostNotice fond jaune cassé en dark),
`DONE_020` (page Archive cassée en dark), `DONE_024` (Bluesky dark mode cassé). C'est un pattern
réactif — chaque nouvelle variante ou nouveau composant a une chance équivalente de réintroduire le
même bug, et rien ne l'empêche (voir [[036]]).

## Risque

Chaque nouveau variant/composant ajouté avec une couleur hex a un risque de casser le dark mode
sans que personne ne le remarque avant un rapport utilisateur. Maintenance coûteuse : changer la
teinte de la marque (vert du site) nécessite de grep-and-replace dans des dizaines de fichiers.

## Solution proposée

1. Pour `AlertBox` (le cas le plus extrême, 7 variantes × 2 thèmes) : introduire des custom
   properties locales par variante (`--alert-bg`, `--alert-border`, `--alert-fg`,
   `--alert-icon`) définies une fois en light et une fois en `[data-theme="dark"]`, puis
   consommées par une seule règle générique `.alertBox` — au lieu de dupliquer `background`,
   `border-left-color`, `color` dans chaque bloc de variante.
2. Ajouter la règle stylelint `color-no-hex` (cf. [[036]]) avec une liste d'exceptions explicite
   pour les cas légitimes (couleurs de langage dans `Snippet`, qui représentent des identités de
   marque externes — PHP violet, Docker bleu, etc. — et n'ont pas vocation à suivre le thème du
   site).
3. Documenter dans `AGENTS.md`/readme des composants concernés pourquoi ces exceptions existent,
   pour ne pas les re-signaler à chaque review future.

## Lien avec l'existant

Ne duplique pas [[DONE_019]] (déjà corrigé pour OldPostNotice) : ce TODO adresse le problème
systémique, pas un cas isolé. Dépend de [[036]] pour l'application automatique de la règle.
