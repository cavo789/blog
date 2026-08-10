# Reader review : docker-python-devcontainer

**Détecté :** 2026-08-09
**Article :** blog/2024/10/30/docker-python/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **36 %** (preuve l. 86 — capture "Makefile"/`make up` — sur un corps de 146
lignes après le truncate en l. 34).
Drapeaux : abstraction-avant-preuve (`Dockerfile`, `compose.yaml`, `.docker.env`, `makefile`,
l. 52-77, tous avant la preuve) et install-avant-preuve (`sudo apt-get install make`, l. 80,
juste avant la preuve).
Redondance : aucune notable.

Test des 30 secondes : le lecteur doit créer quatre fichiers de configuration avant de voir la
moindre commande tourner. L'article est le plus long du lot (146 lignes de corps) ; la première
preuve concrète (le container qui démarre) n'arrive qu'après plus d'un tiers de l'article.

## Risque

C'est l'article de référence de la série "Coding using a devcontainer" (les deux autres articles
du lot, Windows et assistant VSCode, y renvoient) — son ordre install-first se propage donc
comme modèle aux articles dérivés, qui reproduisent le même défaut.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Preuve : `make up`, entrer dans le container, `hello.py` qui tourne et se synchronise | l. 84-138 |
| 2 | Création des fichiers (`Dockerfile`, `compose.yaml`, `.docker.env`, `makefile`) | l. 42-83 |
| 3 | Mise en place du devcontainer VSCode | l. 148-174 |
| 4 | Conclusion (déjà en place, à conserver) | l. 176-180 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
