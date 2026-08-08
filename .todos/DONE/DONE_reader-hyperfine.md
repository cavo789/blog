# Reader review : hyperfine

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/08/25/hyperfine/index.md (actuellement `.unpublished/hyperfine/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — « A first benchmark » déplacé en position 1, « hyperfine vs time » marqué « Under the Hood (skip this if you just want to use it) », le reste inchangé.

## Problème

Time to value : **21 %** (preuve ligne 72 sur un corps de 219 lignes, section `## A first benchmark`).
Drapeaux : aucun flag mécanique strict (pas de `<Prerequisite>`, pas de "apt install", pas de
titre `## Prerequisites`) — mais l'écran entier après `<!-- truncate -->` (l. 28-63) est occupé
par trois méthodes d'installation (`cargo install`, binaire statique, alias Docker) avant la
moindre preuve que l'outil fonctionne.
Redondance : aucune.

Test des 30 secondes : "j'abandonne" — le lecteur qui vient de lire la TLDR ("est-ce que
`ripgrep` est plus rapide que `grep`, sur ma machine ?") tombe directement sur trois façons
d'installer l'outil (l. 28-63) sans avoir vu une seule fois un résultat de benchmark.

## Risque

Le premier vrai résultat (`## A first benchmark`, l. 64-86, comparaison `find` vs `fd` avec
mean/σ/min/max et le ratio final) est exactement la preuve qui devrait ouvrir l'article — elle
existe déjà, mais à 21 % du corps, après le mur d'installation.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## A first benchmark` (comparaison `find` vs `fd`, résultat complet) | l. 64-86 |
| 2 | `## Install` (les trois méthodes, alias Docker inclus) | l. 28-63 |
| 3 | `## Warmup runs` | l. 88-95 |
| 4 | `## Controlling run count` | l. 98-112 (existant) |
| 5 | `## Benchmarking with variable inputs` | l. 116-136 (existant) |
| 6 | `## Prepare and cleanup` | l. 138-147 (existant) |
| 7 | `## Exporting results` | l. 149-169 (existant) |
| 8 | `## Real-world examples` | l. 171-212 (existant) |
| 9 | `## Interpreting the output` | l. 214-224 (existant) |
| 10 | `## hyperfine vs time` (sous "under the hood") | l. 226-239 (existant) |
| 11 | `## Conclusion` | l. 241-245 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
