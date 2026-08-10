# Reader review : vbs-msaccess-get-fields

**Détecté :** 2026-08-09
**Article :** blog/2024/03/09/vbs-msaccess-get-fields/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **65 %** (capture du rapport Excel l. 57 sur un corps de 43 lignes).
Drapeaux : liste de 3 étapes de mise en œuvre (copier le script, éditer le `.cmd`, double-cliquer)
juste après le `truncate`, avant toute preuve — équivalent d'un install-avant-preuve.

Test des 30 secondes : le lecteur lit une procédure ("copier/coller", "sauver sous", "double-
cliquer") avant de savoir ce que le rapport final donne réellement — il doit se projeter sur la
foi d'une description texte.

## Risque

La capture `get_fields_list.webp` (l. 57) montre exactement le livrable (colonnes Filename,
TableName, FieldSize, ShortestSize, LongestSize) et vaut mille mots par rapport au texte
descriptif qui la précède. Elle est actuellement après toute la procédure de mise en œuvre.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : capture du rapport Excel généré | l. 57 |
| 2 | Lecture du rapport : explication des colonnes (Filename, TableName, ShortestSize, ...) | l. 59-67 |
| 3 | Comment le reproduire : les 3 étapes (copier les scripts, éditer le `.cmd`, lancer) | l. 31-37 |
| 4 | Préparation des fichiers (`.vbs` + `.cmd`) | l. 39-51 |
| 5 | Pistes d'optimisation à partir du rapport | l. 69-72 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
