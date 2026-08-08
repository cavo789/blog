# Reader review : ollama-ai-data

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-data/index.md (actuellement `.unpublished/ollama-ai-data/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — les deux démos (JSON, CSV) déplacées en position 1-2, avant le `<Snippet>` du code source.

## Problème

Time to value : **46 %** (preuve ligne 55 sur un corps de 63 lignes, section `## Demo — JSON`).
Drapeaux : abstraction-avant-preuve (`<Snippet filename="~/.zsh/fns/ai-data.zsh">`, l. 38, avant
la démo).
Redondance : le mécanisme "5 suggestions choisies via `fzf`, chargées via `print -z`" est énoncé
dans la TLDR, l'AlertBox `print -z` (l. 32-34), la section Idée (l. 30) et les Key Takeaways —
répétitif mais pas rédhibitoire pour un article de cette longueur.

Test des 30 secondes : "j'abandonne" — après la TLDR et l'accroche, le lecteur lit le code source
complet de `ai-data.zsh` (l. 38) avant de voir un seul exemple de commande `jq`/`awk` suggérée.

## Risque

Les deux démos (JSON et CSV) existent déjà et illustrent exactement la promesse de la TLDR — des
commandes `jq`/`awk` réelles, choisies par intention via `fzf` — mais un lecteur pressé ne les
atteint qu'après avoir digéré l'implémentation complète de la fonction.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo — JSON` | l. 53-57 (existant) |
| 2 | `## Demo — CSV` | l. 59-63 (existant) |
| 3 | `## The Idea — Suggestions, Not Answers` (pourquoi ça marche) | l. 28-34 (existant) |
| 4 | `## The ai-data Function` (`<Snippet>` + étapes) | l. 36-51 (existant) |
| 5 | `## Registered in the ai Menu` | l. 65-67 (existant) |
| 6 | AlertBox caution échantillonnage | l. 69-71 (existant) |
| 7 | `## Key Takeaways` | l. 73-85 (existant) |
| 8 | `## Conclusion` | l. 87-89 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
