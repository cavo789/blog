# Reader review : vscode-code-server

**Détecté :** 2026-08-08
**Article :** blog/2025/07/06/vscode-code-server/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **94 %** (preuve — la capture `VScode in the browser` — en ligne 68 sur un
corps de 33 lignes seulement après `<!-- truncate -->`).
Drapeaux : aucun drapeau binaire strict (pas de `<Prerequisite>` ni de `## Prerequisites`),
mais le seul `<Terminal>` avant la preuve (l.41) ne contient que la commande `docker run` de
lancement — pas de sortie — donc ne compte pas comme preuve.
Redondance : "password" cité 3 fois — 🟢, sans excès.

Test des 30 secondes : "on m'explique chaque flag du `docker run` avant de me montrer à quoi
ressemble VS Code dans le navigateur" — sur un article de 33 lignes de corps, l'unique image
du résultat final est l'avant-dernière ligne du fichier.

## Risque

C'est le cas le plus net du lot : l'article est court, la preuve existe déjà
(`./images/code_server.webp`, l.68) mais elle clôt l'article au lieu de l'ouvrir. Tout le
détail des flags Docker (l.45-58) est légitime — c'est juste positionné avant, pas après, la
preuve.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Capture `VScode in the browser` (preuve) déplacée juste après `<!-- truncate -->`, avec la commande `docker run` en une ligne (sans le détail des flags) | l.68 (image), l.41 (commande) |
| 2 | `## Why it works` — 2-3 puces sans code : pas d'install locale de VS Code, config persistée sur l'hôte, permissions mappées à l'utilisateur | nouveau, condensé depuis l.39, l.45-52 |
| 3 | `## Installation` — la commande complète `docker run` avec le détail de chaque flag (`<AlertBox>`) | l.39-52 |
| 4 | `## Getting the password` — capture de l'écran de connexion, `cat .../config.yaml` | l.56-64 |
| 5 | `## Conclusion` — à ajouter, avec le lien vers la doc officielle déjà présent (l.70) | l.70 (à transformer en landing) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
