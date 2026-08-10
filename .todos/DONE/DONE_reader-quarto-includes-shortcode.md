# Reader review : quarto-includes-shortcode

**Détecté :** 2026-08-09
**Article :** blog/2024/04/13/quarto-includes-shortcode/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **87 %** (preuve ligne 80 sur un corps de 55 lignes, l. 32-87).
Drapeaux : **abstraction-avant-preuve** — le `<Snippet filename="chapter1.md">` (l. 45) et le
`<Snippet filename="chapter2.md">` (l. 62) apparaissent bien avant l'image du résultat fusionné
(l. 80).
Redondance : aucune détectée.

Test des 30 secondes : « on me montre le contenu brut de deux fichiers factices avant de me
prouver que Quarto les fusionne réellement — je dois lire deux blocs de lorem ipsum avant de
voir le résultat. »

## Risque

Le lecteur voit le contenu des fichiers `chapter1.md`/`chapter2.md` avant de savoir à quoi sert
la fusion : l'image `includes.webp` (le rendu fusionné) est la vraie preuve du short code, mais
elle arrive après le détail d'implémentation.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Aparté "Docker image with Quarto" | l. 34-37 |
| 2 | `## Includes tag` — explication brève | l. 39-41 |
| 3 | Résultat du rendu fusionné (image `includes.webp`) | l. 78-80 |
| 4 | Contenu de `chapter1.md` (Snippet) | l. 43-58 |
| 5 | Contenu de `chapter2.md` (Snippet) | l. 60-74 |
| 6 | Aparté ".qmd vs .md" | l. 82-87 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
