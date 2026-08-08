# Reader review : git-delta

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/06/15/git-delta/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — le rendu « Before and after » déplacé en position 1, le reste réordonné sans suppression. Une vraie section `## Conclusion` a été écrite (absente avant), refermant la frustration initiale et pointant vers `git-config`.

## Problème

Time to value : **43 %** (preuve — la section `## Before and after` — en ligne 112 sur un corps
de 191 lignes après `<!-- truncate -->`).
Drapeaux : **install-avant-preuve** — le bloc `<Prerequisite install="sudo apt install
git-delta">` (l.45-50) précède toute démonstration du rendu delta.
Landing manquant : l'article se termine sur `## Going further` (l.216-219), un détail
d'implémentation, sans `## Conclusion` — pas de retour à la frustration initiale (`git diff`
illisible), pas de lien vers la suite.

Test des 30 secondes : "installation avant démo, encore" — le lecteur doit lire la théorie et
l'installation avant de voir à quoi ressemble un diff avec delta.

## Risque

Le rendu avant/après (l.112-134) est la preuve visuelle la plus convaincante de l'article et
elle existe déjà, entièrement écrite — elle est juste après l'installation et la configuration,
qui n'ont aucune valeur tant que le lecteur n'a pas vu le résultat. L'absence de conclusion
signifie aussi que l'article ne referme jamais la frustration ouverte en introduction
("trente secondes à fixer un `git diff` illisible").

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Before and after` (rendu, déplacé en premier) | l.112-134 |
| 2 | `## What is delta?` (explication, zéro installation) | l.31-42 |
| 3 | `## Install` (`<Prerequisite>` + astuce nommage paquet) | l.43-55 |
| 4 | `## Configure git to use delta` | l.56-111 |
| 5 | `## Side-by-side mode` | l.135-159 |
| 6 | `## Themes` | l.160-184 |
| 7 | `## Navigation between hunks` (StepsCard raccourcis) | l.185-201 |
| 8 | `## Delta works everywhere git does` | l.202-215 |
| 9 | `## Going further` | l.216-219 |
| 10 | **Nouveau** `## Conclusion` — referme la frustration initiale (`git diff` illisible → delta en 5 min), un lien vers la suite (ex. l'article `git-config` déjà cité en intro) | à écrire |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
