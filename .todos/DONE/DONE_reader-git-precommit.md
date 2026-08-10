# Reader review : git-precommit

**Détecté :** 2026-08-09
**Article :** blog/2025/01/10/git-precommit/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **53 %** (preuve l. 113 sur un corps de 146 lignes, `T` = l. 35).
Drapeaux : abstraction-avant-preuve (les `<Snippet>` `Dockerfile`, `compose.yaml`, `main.py`
l. 67-71 et `.pre-commit-config.yaml` l. 97 arrivent avant la première preuve réelle) ;
absence totale de landing (pas de `## Conclusion`, l'article se termine sur le tip
`--no-verify`).

Test des 30 secondes : le lecteur voit l'accroche (emails CI en échec), puis une liste
d'outils concurrents (husky, pre-commit, grumphp, CaptainHook), puis on lui demande de créer
trois fichiers (Dockerfile, compose.yaml, main.py) avant d'avoir vu le hook faire quoi que ce
soit — *"je dois construire un environnement complet avant de savoir si ça vaut le coup"* →
abandon.

## Risque

Le vrai argument de vente de l'article — le terminal `terminal-1.txt` (l. 113) qui montre
`black` reformater `main.py` tout seul, plus la capture `black.webp` (l. 129) — existe déjà
mais arrive après 78 lignes de mise en place. Le lecteur presse ne voit jamais la preuve.
L'article n'a par ailleurs aucune conclusion : rien ne referme la boucle ouverte par
l'accroche (« emails CI en échec »).

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1. Hook | Accroche inchangée | l. 19-33 |
| 2. Le résultat | Terminal `pre-commit run --all-files` + `terminal-1.txt` (reformatage détecté) + `black.webp` | l. 105-129 |
| 3. Pourquoi ça marche | 3-5 puces : hooks git, exécution avant le commit, aucun outil externe requis côté CI | l. 43-52 (comparatif d'outils condensé) |
| 4. Installation | Créer les 3 fichiers de démo (Dockerfile/compose/main.py), lancer le conteneur, écrire `.pre-commit-config.yaml` | l. 54-97 |
| 5. Plus de démos | Installation automatique (`pre-commit install`), hooks locaux additionnels, exemple de config Python 3.13 | l. 132-171 |
| 6. Sous le capot (optionnel) | Recherche de hooks externes, syntaxe avancée `.pre-commit-config.yaml` (parts 2-4) | l. 143-165 |
| 7. Landing | Nouvelle section `## Conclusion` reliant à l'accroche + le tip `--no-verify` en rappel pratique | l. 173-181 (à réécrire en clôture) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
