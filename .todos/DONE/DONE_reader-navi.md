# Reader review : navi

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/08/18/navi/index.md (actuellement `.unpublished/navi/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — « First run — browse community cheatsheets » (démo fzf) déplacée en position 2, avant les trois méthodes d'installation.

## Problème

Time to value : **25 %** (preuve ligne 70 sur un corps de 173 lignes, `## First run — browse
community cheatsheets`, juste après la fenêtre des 40 premières lignes ciblée par
`blog-post-structure`).
Drapeaux : pas de flag mécanique strict, mais l'écran entier après `<!-- truncate -->` (l. 28-64)
enchaîne théorie ("What navi is") et trois méthodes d'installation (cargo, binaire, Homebrew)
avant toute démonstration.
Redondance : aucune.

Test des 30 secondes : "j'abandonne" — le lecteur qui vient de lire la TLDR (navi comme
"bookmark système exécutable") doit choisir entre trois méthodes d'installation avant de voir
l'interface fzf en action, qui est pourtant l'argument de vente principal de l'outil.

## Risque

La vraie preuve existe déjà et est bonne : le bloc `plaintext` l. 78-84 montrant fzf filtrer
"docker logs" et le prompt de variable interactif l. 88-90 (le container réel injecté dans la
commande). C'est exactement ce qu'un lecteur veut voir en premier — mais il arrive après le mur
d'installation.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## What navi is` (condensé, 1 paragraphe) | l. 28-32 (existant) |
| 2 | `## First run — browse community cheatsheets` (la démo fzf + variable interactive) | l. 66-92 (existant) |
| 3 | `## Install` | l. 34-64 (existant) |
| 4 | `## The .cheat file format` | l. 94-111 (existant) |
| 5 | `## Writing your own cheatsheet` | l. 113-124 (existant) |
| 6 | `## ZSH integration — CTRL+G` | l. 126-152 (existant) |
| 7 | `## Organizing cheatsheets` | l. 154-173 (existant) |
| 8 | `## navi vs aliases` | l. 175-187 (existant) |
| 9 | `## Where to go from here` | l. 189-193 (existant) |
| 10 | `## Conclusion` | l. 195-199 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
