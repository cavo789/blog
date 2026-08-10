# Reader review : vscode-regions

**Détecté :** 2026-08-09
**Article :** blog/2024/08/05/vscode-regions/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **23 %** (preuve ligne 44 sur un corps de 60 lignes).
Drapeaux : abstraction-avant-preuve — deux `<Snippet>` PHP (l. 36, 40) précèdent le gif de
démonstration (l. 44) qui est la première preuve réelle.
Redondance : aucune.

Test des 30 secondes : "je reste, mais j'attends" — le lecteur lit deux extraits de code PHP
commentés avant de voir le gif qui montre le pliage de région en action, alors que ce gif est
la preuve la plus parlante de tout l'article et pourrait ouvrir la section.

## Risque

Le gif (l. 44) est l'élément le plus convaincant de l'article — il montre visuellement ce que
les balises `// #region` / `// #endregion` produisent dans l'éditeur. Le lisser après deux
extraits de code dilue son impact d'accroche.

Pas de section `## Conclusion` : l'article s'arrête après la capture de l'extension autofold
(l. 90), sans récapitulatif ni lien vers la suite.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Accroche + promesse (inchangé) | l. 1-29 |
| 2 | Le gif du pliage de région en action, comme preuve immédiate | l. 44 |
| 3 | Les deux lignes de commentaire qui produisent ce résultat (PHP) | l. 36, 40 |
| 4 | Étendre aux types de fichiers non supportés par défaut (avant/après avec Dockerfile) | l. 51-77 |
| 5 | Bonus : extension d'auto-pliage | l. 78-90 |
| 6 | Conclusion (nouvelle section) : récap + rappel des deux balises | nouveau |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
