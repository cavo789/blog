# Reader review : docker-python-devcontainer-windows

**Détecté :** 2026-08-09
**Article :** blog/2024/12/01/docker-python-devcontainer-windows/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **59 %** (preuve l. 113 — capture "Building the Docker image" — sur un corps de
136 lignes après le truncate en l. 33).
Drapeaux : abstraction-avant-preuve — six `<Snippet>` (`devcontainer.json`, `main.py`,
`requirements.txt`, `.docker.env`, `compose.yaml`, `Dockerfile`, l. 53-75) plus le batch
`make.bat` (l. 83) précèdent toute preuve visuelle d'exécution.
Redondance : aucune.

Test des 30 secondes : le lecteur qui connaît déjà l'article Linux d'origine veut voir "ça marche
aussi sous Windows" — mais il doit d'abord recréer six fichiers avant de voir la moindre commande
tourner. Abandon probable pendant la longue section de copier-coller.

## Risque

L'article est un portage ("mêmes fichiers, juste sous Windows") ; sa seule vraie nouveauté est
que `make.bat` reproduit les commandes `make build/up/bash/devcontainer` sous MS-DOS. Cette
preuve existe déjà (l. 109-154) mais arrive après toute la section de création de fichiers,
qui n'apporte elle rien de nouveau par rapport à l'article Linux déjà publié.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Preuve : `make build`, `make up`, `make bash`, script `main.py` exécuté depuis DOS | l. 109-138 |
| 2 | Démarrage VSCode en devcontainer + addons déjà installés | l. 142-165 |
| 3 | Création de la structure de fichiers (les six `<Snippet>`) | l. 39-93 |
| 4 | FAQ (changer de version Python) | l. 167-169 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
