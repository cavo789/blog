---
name: feedback-flex-column-basis
description: flex-basis devient min-height dans un conteneur colonne — piège CSS à éviter dans les panels/popups
metadata:
  node_type: memory
  type: feedback
  originSessionId: cfdc7771-8fce-4a1a-9712-18637166bad3
---

Dans un conteneur `flex-direction: column`, `flex-basis` s'applique à la **hauteur**, pas à la largeur.

Un champ avec `flex: 1 1 180px` héritera d'une hauteur minimale de 180px dans un panel en colonne — provoquant d'énormes espaces vides entre les champs.

**Why:** Bug découvert dans le composant Vars (`.fabPanel`) où les champs partagent une règle `.field { flex: 1 1 180px }` pensée pour le layout en ligne (row), mais réutilisée dans le panel en colonne.

**How to apply:** Quand un composant réutilise une classe `.field` (ou similaire) dans deux contextes flex (row + column), toujours ajouter un override dans le contexte colonne :

```css
.columnContainer > .field {
  flex: 0 0 auto;
  min-width: 0;
}
```

Et protéger les panels fixes/flottants avec `max-height: calc(100vh - ...)` + `overflow-y: auto` pour résister aux grands zooms.
