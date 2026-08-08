# Reader review : ollama-ai-ci

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-ci/index.md (actuellement `.unpublished/ollama-ai-ci/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — Demo déplacée en position 1 (était en toute fin d'article), avant prérequis et code source.

## Problème

Time to value : **59 %** (preuve ligne 67 sur un corps de 69 lignes, section `## Demo` — la
preuve arrive à la toute fin de l'article).
Drapeaux : install-avant-preuve (`<Prerequisite name="jq" .../>`, l. 30-44) **et**
abstraction-avant-preuve (`<Snippet filename="~/.zsh/fns/ai-ci.zsh">`, l. 51, avant la démo).
Redondance : aucune (article court).

Test des 30 secondes : "j'abandonne" — l'article enchaîne prérequis (jq), avertissement de scope,
puis code source complet de la fonction, et ne montre la démo (`## Demo`, l. 65-69) qu'à 59 % du
corps, presque à la fin de l'article.

## Risque

C'est le pire score de preuve tardive du lot : la démo existe déjà (`<Terminal
source="./files/terminal_ci.txt">`) et illustre exactement la promesse de la TLDR ("Ask a Local
LLM Why Your GitLab Pipeline Failed"), mais un lecteur pressé ne l'atteint jamais.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo` (le `<Terminal>` montrant `ai-ci` diagnostiquer un pipeline cassé) | l. 65-69 (existant) |
| 2 | `## What It Needs` (`<Prerequisite>` jq + AlertBox scope) | l. 28-47 (existant) |
| 3 | `## The` `ai-ci` `Function` (le `<Snippet>` du code) | l. 49-63 (existant) |
| 4 | `## Registered in the` `ai` `Menu` | l. 71-77 (existant) |
| 5 | `## Key Takeaways` | l. 79-91 (existant) |
| 6 | `## Conclusion` | l. 93-95 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
