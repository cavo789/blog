# 064 — Liens internes et références croisées cassés

**Priority:** Medium
**Category:** bug

## Problem

- `blog/2026/06/15/git-delta/index.md:215` — `<Link to="/blog/gitconfig-tips-and-tricks">` : aucun
  article avec ce slug n'existe dans tout `blog/`.
- `blog/2025/02/22/vba-excel-ribbon-load/index.md:104` — `<Link to="/blog/tags/ribbon">` : ce tag
  n'existe pas dans `blog/tags.yml` et n'est utilisé par aucun article.
- `blog/2025/04/11/docker-oracle-ords/index.md:150` — une `AlertBox` renvoie vers "the **Installing
  ORDS on your DB** chapter", mais aucun titre avec ce libellé n'existe dans l'article (le plus
  proche est `### Create the container`).

## Proposed solution

- `git-delta` : soit retrouver/rétablir l'article visé (probablement un article de configuration
  Git jamais publié ou renommé depuis), soit retirer le lien.
- `vba-excel-ribbon-load` : remplacer par le tag correct existant (probablement `vba` ou `excel`)
  ou retirer le lien vers `/blog/tags/ribbon`.
- `docker-oracle-ords` : corriger le texte de l'AlertBox pour pointer vers le vrai titre de section
  (`Create the container` ou équivalent), à confirmer avec l'auteur selon l'intention d'origine.

## Affected posts

`git-delta`, `vba-excel-ribbon-load`, `docker-oracle-ords`.

## Relationship to existing TODOs

Aucun TODO existant.
