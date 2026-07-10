# 065 — Dossier vs `slug` divergents sur une dizaine d'articles (piège de maintenance)

**Priority:** Low
**Category:** bug

## Problem

Fonctionnellement inoffensif (Docusaurus route sur le `slug` frontmatter, pas sur le nom de
dossier, et tous les liens internes existants ciblent déjà correctement le `slug`), mais c'est un
piège de maintenance récurrent — repéré dans presque tous les lots de cet audit, ce qui en fait un
vrai motif systémique plutôt que des cas isolés :

| Dossier | `slug` frontmatter |
|---|---|
| `blog/2023/12/04/docker-ssl-encrypt/` | `docker_ssl_encrypt` |
| `blog/2023/12/05/docker-uptime-kuma/` | `docker_uptime_kuma` |
| `blog/2023/12/27/docker-phpdoc/` | `docker-phpdocumentor` |
| `blog/2023/12/27/makefile-it-easy/` | `makefile-using-make` |
| `blog/2023/12/31/powerlevel10k/` | `powerlevel10k_sandbox` |
| `blog/2024/01/28/matomo/` | `matomo-install` |
| `blog/2024/07/10/outlook-save-to-pdf/` | `outlook-vba-pdf` |
| `blog/2024/08/17/docker-apache-ssl/` | `docker-localhost-ssl` |
| `blog/2025/06/15/gitlab-docker-in-docker/` | `gitlab-docker-out-of-docker` |
| `blog/2025/08/21/docusaurus-image/` | `docusaurus-override-img` |
| `blog/2025/08/30/pest-functional/` | `pest-functional-testing` |
| `blog/2023/11/02/wwelcome/` | `welcome` |

## Proposed solution

Décision éditoriale à prendre par l'auteur : soit renommer les dossiers pour matcher le slug (
cosmétique, aucun impact sur les URLs publiées), soit documenter que c'est un choix assumé et
laisser tel quel. Pas d'action automatique recommandée — un renommage de dossier n'a de valeur que
si l'auteur le juge utile pour sa propre navigation dans le repo.

## Affected posts

Voir tableau ci-dessus (12 articles).

## Relationship to existing TODOs

Aucun TODO existant.
