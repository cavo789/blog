# Reader review : vscode-multi-root-git-worktree

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/vscode-multi-root-git-worktree/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture d'écran de la barre latérale n'a pas pu être produite (nécessite VSCode graphique) — `TODO(author)` laissé à l'emplacement exact.

## Problème

Time to value : **100 %** — aucune preuve dans les 47 lignes du corps. Le seul `<Terminal>`
(l. 35-37) affiche la commande `code my-blog.code-workspace` tapée, pas un résultat.
Drapeaux : **abstraction-avant-preuve** — le `<Snippet>` du fichier `.code-workspace` (l. 29)
est la toute première chose montrée après le titre de section, avant toute preuve visuelle.
Redondance : aucune, sous le seuil.

Test des 30 secondes : « L'idée (un seul fenêtre pour trois worktrees) est claire, mais on me
montre du JSON avant de me montrer à quoi ressemble la barre latérale une fois que c'est fait —
je ne vois jamais le résultat que le titre promet. »

## Risque

Le payoff de cet article est par nature visuel : « one window, three clearly labeled folders »
(conclusion, l. 70) décrit exactement ce qu'une capture d'écran de la barre latérale VSCode
montrerait en une seconde — et cette capture n'existe pas.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook | l. 15-21 |
| 2 | **Nouveau** : preuve — capture d'écran de la barre latérale avec 3 dossiers de worktree labellisés (à créer) | dérivé de l. 39-41 |
| 3 | What a Multi-Root Workspace Actually Is | l. 25-31 |
| 4 | One Window, Three Independent Contexts | l. 39-45 |
| 5 | Keeping the Workspace File in Sync with `gwt` | l. 47-53 |
| 6 | Key Takeaways / Conclusion | l. 55-70 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
