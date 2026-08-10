# Reader review : quarto-inline-style

**Détecté :** 2026-08-09
**Article :** blog/2024/04/13/quarto-inline-style/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **76 %** (preuve ligne 50 sur un corps de 25 lignes, l. 31-56).
Drapeaux : aucun drapeau binaire strict, mais une AlertBox "Docker image with Quarto" et une
citation source s'intercalent avant tout exemple concret.
Redondance : aucune détectée.

Test des 30 secondes : « je lis un aparté sur l'image Docker Quarto puis une citation source
avant même de voir à quoi ressemble le style inline promis par le titre — le rendu HTML
n'apparaît qu'aux trois quarts du corps. »

## Risque

L'exemple de syntaxe (`[red]{style="color: red;"}`) et son rendu réel (`html.webp`) sont
la preuve la plus convaincante de l'article, mais ils arrivent après un aparté Docker et une
citation qui n'apportent rien à la démonstration elle-même.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Exemple de syntaxe + rendu HTML (`html.webp`) | l. 40-50 |
| 2 | Citation source | l. 38 |
| 3 | Aparté "Docker image with Quarto" | l. 33-36 |
| 4 | Limite Word/PDF (`docx.webp`, `pdf.webp`) | l. 52-56 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
