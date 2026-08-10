# Reader review : vba-access-export

**Détecté :** 2026-08-08
**Article :** blog/2025/06/27/vba-access-export/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **80 %** (preuve — le `<Terminal>` de la ligne 58 — sur un corps de seulement
30 lignes après `<!-- truncate -->`).
Drapeaux : **install-avant-preuve** — la section `## Install` (l.46-48) est lue avant toute
preuve que le script fonctionne.
Redondance : "export" cité 11 fois, mais c'est le nom de l'outil lui-même (`vbs_access_export`)
répété dans les titres et le texte — pas une redite du même fait.

Test des 30 secondes : "Description, puis Install, puis Usage — on me demande d'installer un
script VBS avant de voir ce qu'il produit" — sur un article aussi court (30 lignes de corps),
la preuve arrive à 80 % du texte au lieu d'ouvrir l'article.

## Risque

Le `<Terminal>` (l.58) montrant le résultat de `cscript vbs_access_export.vbs ...` est la seule
preuve concrète de l'article et elle est reléguée en toute fin, après Description/Install/Usage.
L'article n'a pas non plus de `## Conclusion` (il se termine sur des liens connexes) — un
manque secondaire, à corriger dans la même passe.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Sample` — la commande `cscript` et sa sortie (preuve) déplacée juste après `<!-- truncate -->` | l.54-60 |
| 2 | `## Description` — ce que fait le script, sans code | l.36-44 |
| 3 | `## Install` | l.46-48 |
| 4 | `## Usage` | l.50-52 |
| 5 | `## Conclusion` — à ajouter, reprenant l'idée de versionner le code Access via Git | nouveau, depuis l.60-62 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
