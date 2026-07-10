# 038 — Famille `Card` : import mort halluciné, zéro PropTypes, logique dupliquée

**Priority:** High

## Problème

`src/components/Card/index.js`, `CardBody/index.js`, `CardHeader/index.js`, `CardFooter/index.js`
— les 4 briques les plus réutilisées du site (utilisées par `PostCard`, `LatestPosts`,
`HomeCards`, `GithubProjects`, `MyRepositories`, ...) — partagent trois problèmes :

1. **Import mort/halluciné** : les 4 fichiers commencent par
   `import React, { CSSProperties } from "react";` — `CSSProperties` n'existe pas dans le paquet
   `react` (c'est un type TypeScript de `@types/react`, jamais un export runtime). Dans un fichier
   `.js` sans typage, cet import ne sert à rien et n'est référencé nulle part dans le code. Il
   trahit un copy-paste depuis du code TS/IA non relu, et le commentaire associé
   ("CSSProperties allows inline styling with better type checking") est trompeur puisqu'aucun
   type-checking n'existe ici.
2. **Aucun PropTypes** sur les 4 fichiers, alors que `AGENTS.md` l'exige explicitement
   ("Add prop-types") et que ce sont les composants avec la plus grande surface d'utilisation du
   repo.
3. **Duplication** : `CardBody/index.js` et `CardFooter/index.js` contiennent exactement les 7
   mêmes lignes de construction de classes (`text--*`, `text--italic`, etc.) copiées-collées à
   l'identique.

## Risque

Confusion pour tout futur contributeur qui verra cet import et croira qu'un typage existe.
Aucune validation des props sur le composant le plus critique du design system : une erreur de
type (ex. `shadow="wrong-value"`) ne sera détectée nulle part avant le rendu visuel cassé.
Toute évolution de la logique de classes texte doit être répercutée à deux endroits.

## Solution proposée

1. Supprimer `{ CSSProperties }` des 4 imports (`import React from "react";` suffit, voire
   supprimer l'import `React` lui-même si le JSX runtime automatique de React 19 est utilisé).
2. Ajouter `propTypes` sur `Card`, `CardBody`, `CardHeader`, `CardFooter` (shape déjà visible dans
   les autres composants du repo comme modèle).
3. Extraire un helper partagé `buildTextClasses({ textAlign, variant, italic, noDecoration,
   transform, truncate, weight }, truncateClass)` dans `Card/utils.js`, utilisé par `CardBody` et
   `CardFooter`.

## Lien avec l'existant

Corollaire direct de [[036]] (rien ne l'a empêché) et [[040]] (PropTypes manquants). À traiter
avant ou avec [[040]] puisque `Card/*` fait partie de la liste des composants sans PropTypes.
