# Reader review : behat-introduction

**Détecté :** 2026-08-09
**Article :** blog/2024/06/24/behat-introduction/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **46 %** (première sortie propre à Behat — le scénario reconnu avec 3 steps en
attente — ligne 179 sur un corps de 304 lignes, l. 39-343).
Drapeaux : **abstraction-avant-preuve** — les `<Snippet>` `Dockerfile` (l. 68) et `compose.yaml`
(l. 72) sont affichés avant la première image, elle-même une simple vérification d'installation
(versions Chrome, l. 78) sans rapport avec le BDD.

Test des 30 secondes : l'article promet d'apprendre le BDD et Gherkin, mais le premier écran ne
montre que la construction d'un environnement Docker (Dockerfile complet, compose.yaml,
`composer init` interactif) — aucune trace de scénario Gherkin ni de Behat avant la deuxième moitié
du premier écran.

## Risque

Le vrai argument de vente de Behat — écrire des scénarios en langage naturel puis les voir
reconnus et exécutés (`## Time to learn more about features` l. 122, capture "First run" l. 179,
capture "Success" l. 273) — est enterré sous ~140 lignes de mise en place Docker/Composer. Un
lecteur qui connaît déjà Docker n'a aucune raison de lire ce setup avant d'avoir vu ce que Behat
apporte concrètement.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + "## Introduction to BDD" (conceptuel, sans code, inchangé) | l. 41-53 |
| 2 | Le résultat : un scénario Gherkin (`Blog.feature`) + capture "First run" montrant Behat qui reconnaît les 3 steps | l. 122-146, 177-181 |
| 3 | Mise en place : créer le projet Docker/PHP/Composer, installer Behat | l. 55-121 |
| 4 | Écrire les steps en PHP, utiliser Mink, faire tourner Chrome | l. 151-281 |
| 5 | Conclusion (inchangée) | l. 283-302 |
| 6 | Appendice — liste des fichiers (inchangé) | l. 303-343 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
