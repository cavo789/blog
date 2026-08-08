# Reader review : ollama-ai-diagram

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-diagram/index.md (actuellement `.unpublished/ollama-ai-diagram/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — les deux démos déplacées en position 1-2, avant le `<Snippet>` du code source.

## Problème

Time to value : **37 %** (preuve ligne 47 sur un corps de 57 lignes, section
`## Demo — Plain-English Description`).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="~/.zsh/fns/ai-diagram.zsh">`, l. 36,
avant la démo).
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — après l'AlertBox de positionnement, le lecteur lit le code
source complet de `ai-diagram.zsh` (l. 36) avant de voir un seul diagramme Mermaid généré.

## Risque

Les deux démos (description en langage naturel, fichier `compose.yaml` existant) illustrent déjà
la promesse — un diagramme Mermaid généré sans schéma — mais un lecteur pressé referme l'article
avant de les atteindre.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo — Plain-English Description` | l. 45-49 (existant) |
| 2 | `## Demo — An Existing Config File` | l. 51-61 (existant) |
| 3 | `## Where This Actually Sits Next to docker-python-mermaid` (pourquoi ça marche) | l. 28-32 (existant) |
| 4 | `## The ai-diagram Function` (`<Snippet>` + modes) | l. 34-43 (existant) |
| 5 | `## Registered in the ai Menu` | l. 63-65 (existant) |
| 6 | `## Key Takeaways` | l. 67-79 (existant) |
| 7 | `## Conclusion` | l. 81-83 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
