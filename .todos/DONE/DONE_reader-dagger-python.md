# Reader review : dagger-python

**Détecté :** 2026-08-09
**Article :** blog/2024/12/26/dagger-python/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **28 %** (preuve l. 110 sur un corps de 261 lignes, `T` = l. 38) — 🟠 seul
mais combiné à un drapeau bloquant.
Drapeaux : abstraction-avant-preuve (`<Snippet>` `main.py` l. 64 et `Dockerfile` l. 89
précèdent la première sortie terminal réelle, `terminal-4.txt` l. 110). L'image l. 52
(« Pushing and wait ») illustre la douleur du problème, ce n'est pas une preuve de la
solution.

Test des 30 secondes : après l'accroche « c'est une bombe », le lecteur lit une explication
générale du CI (déjà connue de l'audience visée), puis on lui montre 300+ lignes potentielles
de code source Python avant qu'il ait vu Dagger exécuter quoi que ce soit — *"je lis un cours
sur le CI, où est Dagger ?"*.

## Risque

Le premier terminal réel (`terminal-4.txt`, l. 110 — `dagger init` / première fonction
exécutée) et le second (`terminal-3.txt`, l. 136 — appel de fonctions) sont la vraie preuve
que Dagger tourne en local sans YAML. Ils existent déjà mais arrivent après 70 lignes de code
Python (`main.py`) que le lecteur ne peut pas encore juger puisqu'il ignore ce qu'il fait.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Accroche inchangée (douleur du CI distant) | l. 22-38 |
| 2. Le résultat | `dagger init` + `terminal-4.txt` (fonction exécutée) + `terminal-3.txt` (appel de fonctions) | l. 93-137 |
| 3. Pourquoi ça marche | 3-5 puces : les étapes CI sont des fonctions Python, exécution identique en local et en CI, plus de push-and-pray | l. 46-52 (condensé, sans l'image « angry ») |
| 4. Installation | `Dockerfile` Dagger + `main.py` de base + `dagger init` | l. 56-93 |
| 5. Plus de démos | Fonction de lint (`main.part2.py`), formatage Black (`main.part5.py`), exécution concurrente `run-all` | l. 140-203 |
| 6. Sous le capot (optionnel) | Configs Pylint/Black/mypy complètes, `makefile`, intégration GitLab runner (socket Docker partagé) | l. 213-299 |
| 7. Landing | Nouvelle section `## Conclusion` reliant à l'accroche (fin du push-and-pray) — actuellement l'article s'arrête net sur la config `.gitlab-ci.yml` | l. 245-299 (à clore) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
