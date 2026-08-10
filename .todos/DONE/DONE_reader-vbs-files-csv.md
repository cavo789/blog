# Reader review : vbs-files-csv

**Détecté :** 2026-08-09
**Article :** blog/2024/11/28/vbs-files-csv/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **47 %** (preuve l. 34 — le bloc `csv` d'exemple — sur un corps de 17 lignes
après le truncate en l. 26).
Drapeaux : abstraction-avant-preuve — le `<Snippet>` du script VBS complet (l. 30) précède
l'exemple de sortie.
Redondance : aucune (article très court).

Test des 30 secondes : le corps ne fait que 17 lignes, donc le risque d'abandon est faible ; mais
le lecteur voit d'abord un script VBS entier avant de savoir à quoi ressemble le fichier CSV
produit — l'ordre inverse serait plus convaincant en une lecture aussi courte.

## Risque

Rien de grave vu la brièveté de l'article, mais le lecteur doit lire (ou scroller) le script
avant de savoir ce qu'il produit réellement.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Exemple de fichier CSV généré | l. 32-38 |
| 2 | Script `files2csv.vbs` + comment le lancer | l. 28-30 |
| 3 | Astuce délimiteur tabulation | l. 40-43 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
