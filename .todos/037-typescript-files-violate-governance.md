# 037 — Fichiers TypeScript en contradiction avec la règle "No TypeScript at all"

**Priority:** High

## Problème

`AGENTS.md` est explicite à deux reprises : *"No Typescript at all"* et *"Strict Typing... Add
prop-types"* (implicitement : le typage se fait via PropTypes, pas TypeScript). Or :

- `src/components/BrowserWindow/index.tsx`
- `src/components/BrowserWindow/IframeWindow.tsx`

sont les deux seuls fichiers `.tsx` de tout `src/components`. C'est la seule exception du repo à
une règle par ailleurs strictement respectée (aucun autre composant sur ~150 fichiers n'utilise
TypeScript). `@types/node` et `@docusaurus/types` sont présents en devDependency, probablement
uniquement pour supporter ce cas isolé.

## Risque

Incohérence architecturale : un futur contributeur (ou un assistant IA suivant AGENTS.md à la
lettre) ne saura pas si TypeScript est autorisé ou non. Double outillage implicite nécessaire
(tsconfig/typings) pour un seul composant. Si demain quelqu'un lance un lint TypeScript strict
(voir [[036]]), ce composant sera le seul à échouer ou le seul à nécessiter une config dédiée.

## Solution proposée

Choisir une des deux options explicitement (ne pas laisser l'exception implicite) :

- **Option A (recommandée, cohérence avec AGENTS.md) :** convertir `BrowserWindow/index.tsx` et
  `IframeWindow.tsx` en `.js` + PropTypes, comme tous les autres composants.
- **Option B :** si TypeScript est en fait toléré pour des cas complexes, mettre à jour
  `AGENTS.md` pour documenter explicitement l'exception et sous quelles conditions elle s'applique.

## Lien avec l'existant

Aucun TODO existant ne couvre ce point. Lié à [[036]] pour la mise en place du lint (le choix
retenu ici détermine si la config ESLint doit gérer un parser TS ou non).
