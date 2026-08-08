# Reader review : running-docusaurus-with-docker

**Détecté :** 2026-08-08
**Article :** blog/2025/11/11/running-docusaurus-using-docker/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **38 %** (preuve l. 123 sur un corps de 218 lignes, l. 41-259).
Drapeaux : install-avant-preuve (`apt-get install make` l. 100) et abstraction-avant-preuve
(`<ProjectSetup>`/`<Snippet>` l. 82-89, six fichiers à créer avant toute preuve visuelle).
Redondance : correcte, pas de répétition notable.

Test des 30 secondes : "j'abandonne" — le premier écran (l. 41-81) enchaîne un `<StepsCard>`
de promesses, un `git clone`, un `code .`, puis une capture d'écran de VSCode ouvert (aucun
résultat). Le lecteur n'a encore rien vu tourner.

## Risque

Le vrai résultat — le screenshot "The blog is running" (l. 123, `https://localhost` qui
répond) — est le meilleur argument de l'article et il arrive après six fichiers à créer et
une commande d'installation. Un lecteur pressé abandonne avant de voir que la promesse
("un seul `make build`, un seul `make devcontainer`") est tenue.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 27-39 |
| 2 | Screenshot "The blog is running" + note "voici où on va" (déplacé tôt, en teaser) | l. 121-131 |
| 3 | `## Retrieve a Docusaurus blog` (git clone) | l. 54-62 |
| 4 | `## Create the base Docker image` (code ., screenshot VSCode) | l. 64-76 |
| 5 | Création des fichiers (`<ProjectSetup>`) | l. 78-89 |
| 6 | Build + run (make help, apt install make, make build, make up) menant au screenshot déjà teasé | l. 91-131 |
| 7 | `## Using DevContainers for Development` et suite (inchangé) | l. 133-259 |

Le teaser en position 2 est une simple duplication légère du screenshot + une phrase de
contexte ("voici le résultat final, on y arrive en quelques commandes ci-dessous") — rien
n'est supprimé, tout le détail (fichiers, `apt install`, commandes) reste à sa place actuelle
pour le lecteur qui continue.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
