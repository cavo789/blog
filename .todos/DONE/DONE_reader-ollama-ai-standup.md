# Reader review : ollama-ai-standup

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-standup/index.md (actuellement `.unpublished/ollama-ai-standup/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — Demo déplacée en position 1 (pire score du lot, 63%), avant la configuration et le code source.

## Problème

Time to value : **63 %** (preuve ligne 73 sur un corps de 75 lignes, section `## Demo` — le pire
score du lot, la preuve arrive à la toute fin).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="~/.zsh/fns/ai-standup.zsh">`, l. 60,
avant la démo). Une section `## Configuration` entière (l. 32-56, trois blocs `~/.zshrc`) précède
aussi la démo — pas un `<Prerequisite>` au sens strict, mais un bloc d'installation/config qui
retarde encore la preuve.
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — l'article enchaîne l'idée, une section de configuration
complète, puis le code source de la fonction, et ne montre la démo qu'à 63 % du corps, presque à
la dernière section avant la conclusion.

## Risque

La démo existe déjà (`<Terminal source="./files/terminal_standup.txt">`) et illustre exactement
la promesse — condenser des commits en une mise à jour de standup — mais un lecteur pressé
abandonne bien avant, en plein milieu de la configuration `~/.zshrc`.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo` (+ AlertBox "Override the window for one run") | l. 71-79 (existant) |
| 2 | `## The Idea` (pourquoi ça marche) | l. 28-30 (existant) |
| 3 | `## Configuration` (`$AI_STANDUP_REPOS`, `$AI_STANDUP_DAYS`) | l. 32-56 (existant) |
| 4 | `## The ai-standup Function` (`<Snippet>` + étapes) | l. 58-69 (existant) |
| 5 | `## Registered in the ai Menu` | l. 81-83 (existant) |
| 6 | `## Key Takeaways` | l. 85-97 (existant) |
| 7 | `## Conclusion` | l. 99-101 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
