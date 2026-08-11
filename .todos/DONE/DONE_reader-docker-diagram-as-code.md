# Reader review : docker-diagram-as-code

**Détecté :** 2026-08-11
**Article :** blog/2023/11/24/docker-diagrams/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **35 %** (preuve ligne 49 — l'image `team.webp` générée — sur un corps de
65 lignes, `<!-- truncate -->` l. 26).
Drapeaux : **abstraction-avant-preuve** — `<Snippet filename="team.py">` l. 34 : vingt lignes de
Python que le lecteur ne peut pas juger, puisqu'il ne sait pas encore à quoi ressemble le
diagramme produit.
Redondance : 🟢 (« sans rien installer » ×3 : TLDR l. 19, l. 24, l. 63 — acceptable).

Pas de landing : l'article se termine sur le dernier point d'une liste de 14 outils
(`yEd Graph Editor`). Aucun récapitulatif, aucun pas suivant.

Test des 30 secondes : **je reste, mais je scrolle** — un article qui s'appelle « Diagrams as
code » me fait passer par un `mkdir`, un fichier Python et une commande Docker avant de me montrer
un seul diagramme. Or c'est *l'image* qui vend l'outil, pas le code qui la produit.

## Risque

Le lecteur d'une minute ne voit jamais `team.webp` ni `stateful_architecture.webp` — les deux
seules choses qui prouvent que la bibliothèque `diagrams` produit quelque chose de présentable.
C'est le pire cas de figure : le matériau est déjà là, bien fait, mais placé après l'effort.

La section `## Other tools` (l. 76-91) représente environ un quart de l'article et n'est pas
signalée comme de la référence : elle se lit comme une suite du tutoriel alors que c'est une
liste de liens à consulter plus tard.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | « Quelle joie de dessiner des diagrammes en écrivant du texte » + la promesse. Inchangé. | l. 22-24 |
| 2. La preuve | Nouvelle section `## What comes out` : l'image `team.webp` d'abord, puis la commande d'une ligne qui l'a produite (`cat team.py \| docker run … gtramontina/diagrams:0.23.3`). Image → commande, pas l'inverse. | `![Team]` l. 49, `<Terminal>` l. 38-40 |
| 3. Pourquoi ça marche | Trois puces sans code : le `.py` est piped dans le conteneur, l'image contient Graphviz et les jeux d'icônes AWS/Azure/GCP, `-u 1000:1000` fait que le PNG produit vous appartient. Y placer l'AlertBox « Windows notation ». | déduit de l. 39, AlertBox l. 42-45 |
| 4. Le code | `## The source` — `<Snippet>` `team.py`, précédé du `mkdir -p /tmp/docker-diagrams`. Le lecteur sait maintenant ce que ces vingt lignes produisent. | l. 30-34 |
| 5. Démo plus solide | `## A real architecture` — `<Snippet>` `stateful.py` puis `stateful_architecture.webp`. Garder « Crazy, right? And all of this without installing anything! ». | l. 55-63 |
| 6. Référence (facultatif) | `## Icons and other tools (reference, skip this for now)` — fusionner `## Icons (called Nodes)` et `## Other tools` sous un titre qui annonce que c'est du matériau à consulter plus tard. | l. 65-91 |
| 7. Atterrissage | `## Conclusion` : ce qui a été gagné (des schémas d'architecture versionnables, sans installer Python ni Graphviz), et le pas suivant — le lien <Link to="/blog/docker-python-mermaid">Mermaid + Python</Link> déjà présent l. 22 fait un très bon renvoi de sortie. | à écrire, reprend le lien de l. 22 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
