# Reader review : reduce-image-size

**Détecté :** 2026-08-08
**Article :** blog/2025/10/20/reduce-image-size/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **41 %** (preuve l. 48 sur un corps de 39 lignes, l. 32-71).
Drapeaux : install-avant-preuve — la toute première section après le `<!-- truncate -->` est
`## Installation` (l. 34-42, `brew install caesiumclt`).
Redondance : correcte.

Test des 30 secondes : "j'abandonne" — le lecteur arrive sur une commande `brew` avant de
savoir si l'outil compresse vraiment bien ses images.

## Risque

Le résultat (`## Run the optimization tool`, l. 44-50 : conversion de sept PNG en WEBP,
gain de taille visible dans le `<Terminal>`) est l'argument qui justifie l'installation, mais
il arrive après elle. L'ordre inverse l'un des principes de base de ce blog : montrer avant
de demander un effort.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 26-30 |
| 2 | `## Run the optimization tool` (résultat, le `<Terminal>` de conversion) | l. 44-56 |
| 3 | `## Installation` (déplacée après la preuve) | l. 34-42 |
| 4 | `## How to determine the biggest folders on your disk` (inchangé) | l. 58-71 |

Le renvoi "run this command" en section 2 suppose l'outil déjà installé ; ajouter une phrase
de transition ("une fois `caesiumclt` installé — voir plus bas — voici ce que ça donne")
suffit à recoller les deux sections sans dupliquer de contenu.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
