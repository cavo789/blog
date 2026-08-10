# Reader review : vscode-multiple-cursors

**Détecté :** 2026-08-09
**Article :** blog/2024/04/19/vscode-multiple-cursors/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **79 %** (preuve ligne 55 sur un corps de 29 lignes, l. 32-61).
Drapeaux : aucun (ni installation ni abstraction avant la preuve).
Redondance : aucune détectée, article court.

Test des 30 secondes : « je survole un exemple de lignes lorem ipsum à transformer et une
liste d'étapes au clavier, mais je n'ai jamais vu le résultat avant d'avoir presque terminé
l'article » — le GIF qui prouve que la fonctionnalité marche vraiment arrive à la toute
dernière ligne utile.

## Risque

Le lecteur doit lire l'intégralité de la procédure (exemple + 5 étapes clavier) avant de
savoir si ça vaut le coup de la suivre. Le GIF `make_bullet_list.gif` existe déjà et prouve
la fonctionnalité en une image — il est juste au mauvais endroit.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Intro + exemple de lignes à transformer (paragraphe + bloc markdown) | l. 34-45 |
| 2 | Résultat animé (GIF `make_bullet_list.gif`) | l. 55 |
| 3 | Étapes précises au clavier (liste à puces) | l. 47-53 |
| 4 | Clôture + liens (sticky scroll, autosave) | l. 57-61 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
