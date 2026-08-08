# Reader review : open-webui-advanced

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/09/22/open-webui-advanced/index.md (actuellement `.unpublished/open-webui-advanced/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La preuve manquante a été produite réellement : une instance Open WebUI fraîche connectée à l'Ollama existant, un compte admin créé, et un vrai appel `/api/chat/completions` reproduisant la Function « Summarize » sur un texte réel (notes de réunion) — réponse groupée en 3 catégories (décisions, chiffres, échéances) — capturée dans `files/terminal_summarize.txt`.

## Problème

Time to value : **100 %** — aucune preuve nulle part dans le corps (123 lignes). Le seul
`<Terminal>` de l'article (l. 33-36) montre une commande à taper (`docker compose up -d`), pas un
résultat ; ce n'est pas une preuve au sens de la méthodologie.
Drapeaux : aucun `<Prerequisite>`/`apt install` à proprement parler, mais la section
`## Setup reminder` (compose.yaml + commande) ouvre le corps, avant toute démonstration d'une
fonctionnalité en action.
Redondance : aucune notable (article long mais peu répétitif).

Test des 30 secondes : "j'abandonne" — l'article est une visite guidée de fonctionnalités
("Workspace → Models → + New Model", "Workspace → Knowledge → + New Knowledge"...) qui ne montre
jamais un résultat réel : pas de capture d'écran d'une réponse RAG citant sa source, pas de sortie
de la Function Python de résumé, pas de comparaison avant/après entre deux personas de modèle.

## Risque

Le sujet (presets, RAG, recherche web, Functions) est solide et l'article couvre bien chaque
fonctionnalité, mais sans preuve visible tôt, un lecteur qui a "installé Open WebUI pour discuter
avec Ollama" (l'accroche elle-même) n'a aucune raison concrète de continuer au-delà du `Setup
reminder`.

## Solution

Contrairement aux autres articles de ce lot, un simple réordonnancement ne suffit pas : il manque
une preuve concrète à montrer en premier. Ordre proposé, avec un ajout à rédiger signalé
explicitement :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | **À rédiger** : une preuve concrète en premier — capture d'écran d'une réponse RAG citant sa source, ou sortie de la Function "Summarize" sur un texte réel | nouveau contenu |
| 2 | 3-5 puces "pourquoi ça marche" (presets, RAG, recherche web, Functions comme quatre capacités distinctes) | synthèse de l. 21, 44-46, 62-66, 94-100, 102-110 (existant, reformulé) |
| 3 | `## Setup reminder` | l. 27-42 (existant) |
| 4 | `## Model presets`, `## Knowledge`, `## Web search integration`, `## Functions` (démos + détails) | l. 44-124 (existant) |
| 5 | `## Conversation management` (sous signal "optionnel") | l. 126-136 (existant) |
| 6 | `## Accessing Open WebUI from other devices` | l. 138-142 (existant) |
| 7 | `## Conclusion` | l. 144-148 (existant) |

Cible : time to value < 15 %, avec une preuve réelle dès le premier écran. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
