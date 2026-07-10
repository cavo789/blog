# 043 — SeriesCards : `require()` avec échec silencieux au chargement du module

**Priority:** Low

## Problème

`Blog/SeriesCards/index.js` :

```js
function getSeriesData() {
  try {
    const data = require("@site/src/data/series.js");
    return data?.default ?? data;
  } catch (error) {
    return [];
  }
}
const SERIES_DATA = getSeriesData();
```

Deux problèmes :

1. Style incohérent : c'est le seul endroit du repo qui utilise `require()` CommonJS au lieu d'un
   `import` ES module, dans un fichier par ailleurs 100% ESM.
2. Le `catch` avale silencieusement **toute** erreur — pas seulement "fichier absent", mais aussi
   une erreur de syntaxe dans `src/data/series.js` ou une erreur d'exécution. Le résultat est
   identique : toutes les séries perdent leur image/description/titre enrichis (retour au fallback
   générique) sans le moindre avertissement, ni en dev ni en build.
3. L'appel a lieu **une fois, au chargement du module** (`SERIES_DATA` en top-level) — cohérent
   avec un rendu statique, mais aggrave le silence : aucune re-tentative, aucun signal.

## Risque

Si quelqu'un modifie `src/data/series.js` et introduit une erreur de syntaxe, tout l'enrichissement
des cards de séries disparaît (titres/images/descriptions génériques) sans qu'aucun message
n'indique pourquoi — seul un diff visuel sur la page `/series` le révèle.

## Solution proposée

Remplacer par un `import` statique standard (`import seriesData from
"@site/src/data/series.js"`), et si un fallback est réellement nécessaire (le fichier peut-il
légitimement ne pas exister ?), le documenter et ajouter au moins un `console.warn` en cas
d'échec pour que l'auteur du site voie l'anomalie en dev.

## Lien avec l'existant

Aucun TODO existant ne couvre ce point.
