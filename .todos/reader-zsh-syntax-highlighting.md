# Reader review : zsh-syntax-highlighting

**Détecté :** 2026-08-09
**Article :** blog/2024/03/29/zsh-syntax-highlighting/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **85 %** (preuve ligne 58 sur un corps de 26 lignes après `<!-- truncate -->`).
Drapeaux : **install-avant-preuve** (clone git l. 42-44) et **abstraction-avant-preuve**
(`<Snippet>` du `.zshrc` l. 48), tous les deux avant la première capture d'écran.
Redondance : "vert = valide / rouge = invalide" énoncé **3 fois** (TLDR, l. 28-30, l. 56-60) —
sous le seuil, pas un problème en soi.

Test des 30 secondes : "j'installe déjà un plugin sans avoir vu à quoi ressemble le résultat" —
le lecteur voit `## Installation` juste après le `truncate`, pas la coloration promise par le
titre.

## Risque

Les deux captures (`head.webp` en vert, `docker_compose.webp` en rouge) sont déjà dans
l'article et prouvent immédiatement ce que fait le plugin — elles sont juste coincées après
toute la procédure d'installation. Un lecteur pressé referme l'onglet avant de les voir.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Résultat : les deux captures commande valide (vert) / commande invalide (rouge) | l. 58, 62 |
| 2 | Phrase de transition : rien à configurer, ça marche dès l'installation | l. 54-56 |
| 3 | Installation : clone du repo + ajout dans `plugins=(...)` du `.zshrc` | l. 38-50 |
| 4 | Conclusion (à ajouter — l'article n'en a pas) | — |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
