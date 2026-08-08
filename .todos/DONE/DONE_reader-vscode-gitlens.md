# Reader review : vscode-gitlens

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/vscode-gitlens/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture d'écran de l'annotation de blame n'a pas pu être produite (nécessite VSCode graphique) — `TODO(author)` laissé à l'emplacement exact.

## Problème

Time to value : **100 %** — aucune preuve dans les 51 lignes du corps.
Drapeaux : **installation-avant-preuve** — « Installing It » (l. 27-29) est littéralement la
première section après `<!-- truncate -->`, avant toute démonstration. **Abstraction-avant-preuve**
— le `<Snippet>` `.vscode/settings.json` (l. 43) précède aussi la preuve, qui n'arrive jamais.
Redondance : aucune, sous le seuil.

Test des 30 secondes : « On m'annonce blame inline et historique, mais la toute première chose
après l'accroche est "va dans le Marketplace et installe-le" — je n'ai encore rien vu qui prouve
que ça vaut l'installation. »

## Risque

La fonctionnalité phare de l'article — l'annotation de blame en fin de ligne (l. 31-37) — est
intrinsèquement visuelle et n'a jamais été capturée en image. C'est le candidat évident pour la
preuve manquante : une seule capture d'écran de cette annotation avec son survol (auteur, date,
message de commit) suffit à ancrer l'article.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook | l. 15-23 |
| 2 | **Nouveau** : preuve — capture d'écran de l'annotation de blame en fin de ligne (à créer) | dérivé de l. 31-37 |
| 3 | Installing It | l. 27-29 |
| 4 | The One Feature Worth Turning Off | l. 39-47 |
| 5 | File History and Line History | l. 49-55 |
| 6 | Comparing Branches and Commits | l. 57-59 |
| 7 | Key Takeaways / Conclusion | l. 61-76 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
