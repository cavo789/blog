# Reader review : ollama-ai-diff

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-diff/index.md (actuellement `.unpublished/ollama-ai-diff/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — les deux démos déplacées en position 1-2, avant le `<Snippet>` du code source.

## Problème

Time to value : **45 %** (preuve ligne 54 sur un corps de 62 lignes, section
`## Demo — A Script Against Its Last Commit`).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="~/.zsh/fns/ai-diff.zsh">`, l. 41, avant
la démo).
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — après les deux modes de comparaison et l'AlertBox de
dépendance, le lecteur lit le code source complet de `ai-diff.zsh` (l. 41) avant de voir un seul
résumé fonctionnel produit.

## Risque

Les deux démos (script contre son dernier commit, deux versions d'un document) illustrent déjà la
promesse — un résumé fonctionnel, pas un diff ligne à ligne — mais un lecteur pressé ne les
atteint qu'après le code source complet.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo — A Script Against Its Last Commit` | l. 49-56 (existant) |
| 2 | `## Demo — Two Document Versions` | l. 58-62 (existant) |
| 3 | `## Two Ways to Compare` (pourquoi ça marche, + AlertBox dépendance) | l. 28-37 (existant) |
| 4 | `## The ai-diff Function` (`<Snippet>` + logique du prompt) | l. 39-47 (existant) |
| 5 | `## Registered in the ai Menu` | l. 64-66 (existant) |
| 6 | AlertBox "Functional isn't the same as complete" | l. 68-70 (existant) |
| 7 | `## Key Takeaways` | l. 72-84 (existant) |
| 8 | `## Conclusion` | l. 86-88 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
