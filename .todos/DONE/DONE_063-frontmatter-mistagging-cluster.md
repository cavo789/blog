# 063 — Frontmatter (tags/mainTag/slug/description) probablement copié-collé sur plusieurs articles

**Priority:** Medium
**Category:** bug

## Problem

Plusieurs articles ont un frontmatter qui ne correspond manifestement pas à leur propre contenu,
signe probable d'un copier-coller depuis l'article précédent/voisin non corrigé ensuite :

- `blog/2023/12/19/bash-load-env/index.md` — `description` parle entièrement de "docker ps /
  docker inspect / health information" alors que l'article traite du chargement de fichiers
  `.env` en Bash — aucun rapport.
- `blog/2024/07/28/linux-compare-two-versions-of-the-same-script/index.md`,
  `blog/2024/07/28/linux-sort-functions-in-script/index.md`,
  `blog/2024/07/29/linux-generate-documentation-from-bash-scripts/index.md` — les 3 ont le tag
  `database` alors qu'aucun des 3 articles (purs outils Bash) ne parle de base de données.
- `blog/2025/06/20/pentaho-discovery/index.md` — `mainTag: database`, `tags: [database, msaccess,
  vba]`, strictement identiques aux tags de l'article suivant `vba-access-export`, alors que
  Pentaho/PostgreSQL/Excel n'ont aucun rapport avec MS Access/VBA.
- `blog/2025/08/30/pest-functional/index.md` — `mainTag: component` sur un article de tests
  Laravel/Pest ; comparer avec `bats-unit-tests` qui utilise correctement `mainTag: tests`.
- `blog/2025/12/22/docker-networking-troubleshooting/index.md` — `slug:
  github-networking-troubleshooting` sur un article 100% Docker, aucune mention de GitHub.
- `blog/2025/12/01/zorin/index.md` — tags `[linux, wsl]` sur un article d'installation de Zorin OS
  sur un PC physique en remplacement de Windows ; aucune mention de WSL.
- `blog/2025/12/07/blog-post-feed/index.md` — tags `[docusaurus, github]` sur un article de plugin
  RSS custom ; aucune mention de GitHub.
- `blog/2026/03/23/index.md` — tag `docusaurus` sur un article de reconstruction d'une app avec
  Lovable.dev/FastAPI/React, sans aucun rapport avec Docusaurus. Ce même article a aussi une
  incohérence structurelle : il vit directement dans `blog/2026/03/23/index.md` sans sous-dossier
  slug, contrairement à tous les autres articles de 2026 (frontmatter `slug: lovable-dev-ai`
  suggère qu'il devrait être dans `blog/2026/03/23/lovable-dev-ai/index.md`).

## Proposed solution

Confirmer la valeur correcte pour chaque champ avec l'auteur (ambigu par nature — un tag/mainTag/
slug erroné n'a pas de "bonne" valeur déductible automatiquement) puis corriger. Pour
`blog/2026/03/23`, envisager un déplacement de dossier (`git mv`) vers
`blog/2026/03/23/lovable-dev-ai/` pour respecter la convention de co-location.

## Affected posts

`bash-load-env`, `linux-compare-two-versions-of-the-same-script`, `linux-sort-functions-in-script`,
`linux-generate-documentation-from-bash-scripts`, `pentaho-discovery`, `pest-functional`,
`docker-networking-troubleshooting`, `zorin`, `blog-post-feed`, `blog/2026/03/23/index.md`.

## Relationship to existing TODOs

Aucun TODO existant.
