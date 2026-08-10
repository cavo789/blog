# Reader review : docusaurus-old-notice

**Détecté :** 2026-08-08
**Article :** blog/2025/10/03/docusaurus-old-notice/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **38 %** (preuve l. 67-73 sur un corps de 88 lignes, l. 34-122).
Drapeaux : abstraction-avant-preuve (`<ProjectSetup>`/`<Snippet>` du composant React l. 40-43,
puis swizzle et deux `<Snippet>` du fichier swizzlé l. 49-63, tous avant toute preuve
visuelle).
Redondance : correcte.

Test des 30 secondes : "j'abandonne" — le premier écran (l. 34-74) enchaîne deux fichiers à
créer, une commande `yarn swizzle`, puis deux versions complètes d'un fichier swizzlé, sans
avoir montré à quoi ressemble le résultat final.

## Risque

Le screenshot du bandeau "Old post notice in action" (l. 67-73) est la seule preuve que le
composant fonctionne, et il arrive après la création de deux fichiers React et deux versions
d'un fichier swizzlé. Un lecteur qui évalue "est-ce que ça vaut le coup de swizzler
`BlogPostItem/Content`" n'a rien pour se décider avant ce point.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 30-32 |
| 2 | Screenshot "Old post notice in action" (déplacé tôt, en teaser) | l. 67-73 |
| 3 | `## Create the component` (ProjectSetup, les deux fichiers) | l. 36-43 |
| 4 | `## Override BlogPostPage template` (swizzle, les deux Snippets, incluant la preuve déjà teasée) | l. 45-89 |
| 5 | `## Marking a reviewed post` et `## Position of the warning` (inchangé) | l. 91-122 |

Le teaser en position 2 réutilise le screenshot déjà présent dans l'article ; rien n'est
supprimé, la section 4 garde tout le détail (swizzle, diff du fichier) pour le lecteur qui
continue.

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
