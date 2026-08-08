# Reader review : git-branches-gst

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/04/06/git_branches_gst/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — l'exemple concret `cd` + sortie déplacé en position 2, avant le bloc de configuration `~/.zshrc`.

## Problème

Time to value : **55 %** (preuve ligne 54 sur un corps de 49 lignes).
Drapeaux : **abstraction-avant-preuve** — le `<Snippet filename="~/.zshrc">` (l. 37) précède
l'exemple concret d'usage (« A real-world example », l. 53-60).
Redondance : aucune détectée.

Test des 30 secondes : « je dois d'abord copier un bloc de code shell et lire comment il
fonctionne en interne, avant de voir à quoi ressemble le résultat quand je fais `cd`. »

## Risque

L'exemple réel — la sortie de `cd project/subproject` affichant les trois dernières branches (l.
53-60) — est la preuve la plus parlante de l'article et existe déjà, mais elle arrive après le
bloc de configuration et son explication interne.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook (inchangé) | l. 19-25 |
| 2 | Preuve : exemple concret `cd` + sortie | l. 49-62 |
| 3 | Installation : ajouter le bloc à `~/.zshrc` | l. 35-37 |
| 4 | Comment ça marche | l. 39-47 |
| 5 | Uniquement les branches locales | l. 64-70 |
| 6 | Conclusion | l. 72-76 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
