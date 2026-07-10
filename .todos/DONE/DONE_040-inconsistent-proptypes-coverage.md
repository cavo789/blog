# 040 — Couverture PropTypes incohérente (20/45 composants sans validation)

**Priority:** Medium

## Problème

`AGENTS.md` exige des `prop-types` sur les composants React. Sur 45 fichiers `index.js`/`.jsx` de
`src/components`, **20 n'ont aucun `propTypes`** :

```
Card/index.js, Card/CardBody, Card/CardHeader, Card/CardFooter (voir [[038]])
Columns/index.js, Column/index.js
DownloadButton/index.js
BrowserWindow/index.tsx (voir [[037]])
ScrollToTopButton/index.js
ReadingProgress/index.js
ProjectSetup/index.js
OpenGraphArticle/index.jsx
TLDR/index.js
Blog/SeriesStats/index.js
Blog/HeroSection/index.js
Blog/OldPostNotice/index.js
Blog/SeriesCards/index.js
Blog/AIIcon/index.js
Blog/LogoIcon/index.js
```

Sans convention imposée (ni lint, cf. [[036]]), la validation des props dépend uniquement de la
discipline de la personne qui a écrit le composant ce jour-là — d'où l'incohérence.

## Risque

Les composants sans PropTypes échouent silencieusement : une prop mal nommée ou du mauvais type ne
produit ni avertissement console ni erreur, seulement un rendu visuellement cassé qu'il faut
détecter manuellement.

## Solution proposée

1. Ajouter `propTypes` sur les 20 fichiers listés (l'effort est faible, la plupart ont 1-4 props).
2. Activer la règle ESLint `react/prop-types` (cf. [[036]]) pour empêcher toute régression future.

## Lien avec l'existant

Chaîné à [[036]] (application automatique) et [[038]] (les 4 fichiers `Card/*` de cette liste ont
un traitement dédié dans ce TODO plus large).
