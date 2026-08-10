# Reader review : linux-generate-documentation-from-bash-scripts

**Détecté :** 2026-08-09
**Article :** blog/2024/07/29/linux-generate-documentation-from-bash-scripts/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **42 %** (preuve ligne 44 sur un corps de 33 lignes, l. 30-63).
Drapeaux : **abstraction-avant-preuve** — deux `<Snippet>` de code source (`string.sh` l. 34,
`generate_doc.sh` l. 40) sont affichés avant toute preuve visuelle.
Redondance : aucune (article court, 33 lignes de corps).

Test des 30 secondes : "je continue, mais avec un effort" — le lecteur doit lire/déplier deux
scripts complets (dont un "big script" explicitement annoncé comme tel) avant de voir le moindre
résultat produit par l'outil.

## Risque

Le lecteur ne sait pas à quoi ressemble la documentation générée avant d'avoir déjà investi dans
la lecture de deux fichiers sources. Or l'article contient déjà, plus bas, la preuve la plus
parlante qui soit : le contenu réel du Markdown généré (`string.md` l. 52, `readme.md` l. 56) —
c'est cette preuve qui devrait ouvrir le corps de l'article, pas fermer une chaîne de setup.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 24-28 |
| 2 | Le résultat : capture "Generate the documentation" + contenu généré `string.md` et `readme.md` | l. 44, 50-56 |
| 3 | Comment reproduire : créer `string.sh`, créer `generate_doc.sh`, exécuter | l. 32-42 |
| 4 | Landing : "Going further" (inchangé) | l. 58-63 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
