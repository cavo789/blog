# Reader review : makefile_tips

**Détecté :** 2026-08-09
**Article :** blog/2024/07/16/makefile_tips/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **11 %** en apparence (première sortie réelle ligne 74 sur un corps de 412
lignes), mais le calcul est trompeur.
Drapeaux : **installation-avant-preuve** — la toute première section après le `<!-- truncate -->`
est `## Install the make executable` (l. 32) suivie immédiatement de la commande
`sudo apt-get update && sudo apt-get -y install make` (l. 36-38).

Test des 30 secondes : le lecteur, qui a peut-être déjà `make` installé, doit d'abord lire une
instruction d'installation avant d'atteindre le premier "tip" utile.

## Risque

C'est un article-référence (TLDR : "large personal reference... accumulated over time"),
comparable à d'autres listicles de ce blog jugés OK malgré un TTV élevé — sauf que ceux-là
n'ouvraient jamais sur une section `## Install …` + commande shell. Un lecteur qui a déjà `make`
installé (le cas le plus probable pour ce sujet) doit scroller au-delà d'une installation
superflue avant le premier tip réellement actionnable ("How to check if a file exists or not",
l. 40).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 24-28 |
| 2 | Premier tip immédiat : "How to check if a file exists or not" | l. 40-58 |
| 3 | Installation de `make` (repositionnée, dans un `<Details>` ou un `<Prerequisite>` compact) | l. 32-38 |
| 4 | Reste des tips, ordre inchangé | l. 60-437 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
