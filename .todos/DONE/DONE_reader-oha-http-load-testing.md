# Reader review : oha-http-load-testing

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/07/30/oha-http-load-testing/index.md (actuellement `.unpublished/oha-http-load-testing/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — « First run: testing the blog homepage » (rapport complet) déplacé en position 1, avant théorie et installation.

## Problème

Time to value : **21 %** (preuve ligne 81 sur un corps de 243 lignes, `## First run: testing the
blog homepage`).
Drapeaux : install-avant-preuve — un composant `<Prerequisite>` explicite (l. 43-48) apparaît
avant toute preuve, suivi de deux `<Terminal>` d'installation additionnels (binaire, Docker,
l. 54-67).
Redondance : aucune.

Test des 30 secondes : "j'abandonne" — la TLDR promet un rapport de latence complet en une
commande ("progress bars, a latency histogram, and full percentile breakdowns"), mais le corps
enchaîne théorie + trois méthodes d'installation avant de montrer ce rapport.

## Risque

Le rapport complet (`## First run: testing the blog homepage`, l. 71-127 — histogramme de
latence, percentiles, taux de succès) est déjà rédigé et convaincant ; il est simplement placé
après le mur d'installation au lieu d'ouvrir l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## First run: testing the blog homepage` (commande + rapport complet) | l. 71-133 (existant) |
| 2 | `## What is oha?` (condensé) | l. 31-37 (existant) |
| 3 | `## Install` (les trois méthodes, `<Prerequisite>` inclus) | l. 39-69 (existant) |
| 4 | `## Reading the output` | l. 135-161 (existant) |
| 5 | `## Cranking up the pressure` | l. 163-206 (existant) |
| 6 | `## Testing specific routes` | l. 208-222 (existant) |
| 7 | `## Running for a fixed duration` | l. 224-232 (existant) |
| 8 | `## Docker Compose for repeatable tests` | l. 234-254 (existant) |
| 9 | `## Exporting results as JSON` | l. 256-264 (existant) |
| 10 | `## Conclusion` | l. 266-272 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
