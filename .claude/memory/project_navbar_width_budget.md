---
name: project-navbar-width-budget
description: La navbar est saturée entre 997 et 1260px ; corrigé par le repli de la recherche, pas par un dropdown — l'auteur ne prévoit plus d'ajouter d'entrée
metadata:
  type: project
---

Le 2026-09-17, les libellés du menu se superposaient entre 997px (breakpoint hamburger de
Docusaurus) et ~1220px : 8 entrées + titre + dropdown de locale + GitHub + une boîte de recherche
de 272px ne tiennent pas, et `white-space: nowrap` sur `.navbar__item` fait déborder le texte hors
de sa boîte au lieu de le couper. Mesuré : 215px de débordement à 1000px. Le français casse avant
l'anglais (libellés plus longs).

**Correctif retenu** : la boîte de recherche se replie en pastille ronde dans cette bande
(`src/theme/SearchBar/styles.module.css`), ce qui libère 230px. Le mécanisme complet est commenté
dans ce fichier — ne pas le redocumenter ici.

**Décision de l'auteur** : l'option « regrouper FAQ / Dépôts / Archives / À propos sous un
dropdown Plus » a été écartée, le menu étant jugé déjà assez riche et aucune nouvelle entrée
n'étant prévue.

**Why:** le correctif CSS tient uniquement parce que la recherche libère ces 230px ; il ne reste
aucune marge dans la bande.

**How to apply:** ne pas reproposer le dropdown « Plus » ni de nouvelle entrée de navbar. Si une
entrée devient malgré tout nécessaire, remesurer avant (Playwright est installé, cf.
[[feedback-verification-discipline]]) — la bande recassera. Voir aussi
[[feedback-flex-column-basis]] pour les autres pièges flex de ce thème.
