# Reader review : bruno

**Détecté :** 2026-08-08
**Article :** blog/2025/08/07/bruno/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **33 %** (preuve — la capture `Getting a random joke` — en ligne 82 sur un
corps de 155 lignes après `<!-- truncate -->`).
Drapeaux : **install-avant-preuve** — toute une section (`## Let's install our own APIs
first`, l.33-52) fait construire une API FastAPI de test, avec `Dockerfile` et `main.py`,
avant que Bruno lui-même ne fasse quoi que ce soit.
Redondance : "assertion" cité 4 fois — 🟠, sans excès.

Test des 30 secondes : "je suis venu voir Bruno, mais on me fait d'abord bâtir et lancer une
API Python juste pour avoir quelque chose à tester" — l'outil promis par le titre n'apparaît
qu'à la ligne 54.

## Risque

Les captures d'écran de l'utilisation réelle de Bruno (créer une collection, un environnement,
une requête, obtenir une blague) sont déjà là (l.66-86) et sont l'argument le plus parlant de
l'article — un client API léger, GUI et CLI, fichiers versionnables. Elles sont juste
précédées par la construction d'une API de démonstration qui n'a rien à voir avec Bruno.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Run Bruno` — capture homepage, création collection/environnement/requête, `Getting a random joke` (preuve) | l.62-86 |
| 2 | `## Why it works` — 3-4 puces sans code : stockage en fichiers versionnables, GUI + CLI, structure claire dans le repo | nouveau, condensé depuis l.27-29, l.90-92 |
| 3 | `## Installation` — installer Bruno GUI (l.54-60) puis, en sous-section repliable, construire l'API FastAPI de test (l.33-52) | l.33-60 |
| 4 | `## Opening the project with VSCode` | l.88-94 |
| 5 | `## Running requests from the command line` — image Docker CLI, puis "Under the hood (skip if you just want to use it)" pour le debug ECONNREFUSED et le fix `host.docker.internal` | l.96-176 |
| 6 | `## Adding some assertions` | l.178-186 |
| 7 | `## Conclusion` — à ajouter, l'article n'en a pas actuellement | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
