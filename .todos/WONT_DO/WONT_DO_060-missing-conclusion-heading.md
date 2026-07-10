# 060 — `## Conclusion` manquant sur une grande partie de blog/2023-2025

**Priority:** Medium
**Category:** seo

## Problem

La convention du blog ("always end with `## Conclusion`") est une règle éditoriale pure, **non
liée à un composant** (contrairement à `<TLDR>`, voir [[061]]) — elle s'applique donc dès la
publication de chaque article, peu importe sa date. L'audit `/review_blog` complet montre que
c'est le manquement le plus systémique trouvé sur l'ensemble du blog : dans plusieurs lots audités,
la majorité voire la quasi-totalité des articles n'ont aucune section Conclusion. Exemples de
volumétrie relevée (liste non-exhaustive, un TODO par article serait disproportionné) :

- `blog/2023` (lot Dec-2023) : seul `docker-wordpress` a une Conclusion sur 15 articles du lot.
- `blog/2024` (lot Jan-2024) : seul `planethoster-n0c-spam-roundcube-action` sur 19.
- `blog/2024` (lot mai-juillet) : seul `behat-introduction` sur 17.
- `blog/2024` (lot août-octobre) : 16 articles sur 17 sans Conclusion.
- `blog/2025` (lot janv-mai) : 17 articles sur 20 sans Conclusion.
- `blog/2026` (lot avril-juillet) : 7 articles sur 13 sans Conclusion (dont un avec `### Conclusion`
  au lieu de `## Conclusion` — `assets-minifcation/index.md:116`, erreur de hiérarchie de titres).

## Proposed solution

Passe de fond, article par article, pour ajouter une section `## Conclusion` courte (2-4 phrases,
dans le ton habituel de l'auteur) à la fin de chaque article qui n'en a pas. Vu le volume (plusieurs
centaines d'articles potentiellement concernés), traiter par lot chronologique (le sens inverse de
cet audit, en commençant par les plus anciens) plutôt qu'en une seule passe. Corriger aussi le
niveau de titre incorrect (`### Conclusion` → `## Conclusion`) dans `assets-minifcation`.

## Affected posts

Very broad — majorité des articles publiés avant l'adoption récente et incohérente de cette
convention. Nécessite un inventaire dédié (`grep -L "## Conclusion" blog/**/index.md`) avant de
lancer le chantier.

## Relationship to existing TODOs

Aucun TODO existant. Distinct de [[061]] (TLDR) car non gaté par une date de création de composant.
