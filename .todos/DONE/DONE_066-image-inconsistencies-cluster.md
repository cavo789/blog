# 066 — Incohérences d'images : bannière/meta différentes, format non optimisé, extension erronée

**Priority:** Low
**Category:** bug

## Problem

- `blog/2024/04/28/docker-docusaurus-prod/index.md` — le frontmatter `image:` (ligne 7) pointe vers
  `/img/v2/docusaurus_using_docker.webp`, mais la bannière affichée dans le corps de l'article
  (ligne 18) est `/img/v2/docusaurus_tips.webp` — deux images différentes. L'aperçu social
  (Open Graph) et ce que voit le lecteur ne correspondent donc pas.
- `blog/2025/12/01/zorin/index.md:37` — référence `./images/zorin_installation_menu.jpeg` (115 Ko)
  alors qu'une version optimisée `./images/zorin_installation_menu.webp` (39 Ko, créée 2 jours
  plus tard) existe déjà, inutilisée, dans le même dossier — ironique puisque ce même lot contient
  l'article `reduce-image-size` qui parle justement de conversion vers webp.
- `blog/2025/09/08/docusaurus-cards/index.mdx:93` — le texte d'une AlertBox dit d'enregistrer le
  fichier sous `docux.png`, mais le lien et le chemin GitHub référencés pointent vers `docux.webp`.

## Proposed solution

- `docker-docusaurus-prod` : demander à l'auteur laquelle des deux images est la bonne bannière et
  aligner `image:` (meta) et l'image affichée dans le corps.
- `zorin` : remplacer la référence `.jpeg` par `.webp` (image déjà présente sur disque, gain
  immédiat de poids de page).
- `docusaurus-cards` : corriger le texte `docux.png` → `docux.webp` pour matcher le lien réel.

## Affected posts

`docker-docusaurus-prod`, `zorin`, `docusaurus-cards`.

## Relationship to existing TODOs

Aucun TODO existant.
