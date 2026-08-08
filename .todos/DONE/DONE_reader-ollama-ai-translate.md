# Reader review : ollama-ai-translate

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-translate/index.md (actuellement `.unpublished/ollama-ai-translate/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — les trois démos déplacées en position 1-3, avant le `<Snippet>` du code source.

## Problème

Time to value : **28 %** 🟠 (preuve ligne 47 sur un corps de 74 lignes, section
`## Demo — Inline String`) — sous le seuil rouge, mais le drapeau ci-dessous impose quand même
RESTRUCTURE.
Drapeaux : abstraction-avant-preuve — `<Snippet filename="~/.zsh/fns/ai-translate.zsh">` (l. 32)
arrive seulement 6 lignes après `<!-- truncate -->`, avant les trois démos.
Redondance : aucune notable.

Test des 30 secondes : "j'abandonne" — juste après l'accroche, le lecteur tombe sur le code source
complet de la fonction avant toute démonstration, alors que l'article promet "trois modes, une
commande" dès la TLDR.

## Risque

Les trois démos (chaîne inline, entrée pipée, autre langue) illustrent déjà la promesse, mais un
lecteur pressé referme l'article dès le bloc de code, avant de voir le premier exemple.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo — Inline String` | l. 45-49 (existant) |
| 2 | `## Demo — Piped Output` | l. 51-55 (existant) |
| 3 | `## Demo — Other Languages` (+ AlertBox noms de langue) | l. 57-63 (existant) |
| 4 | `## Three Modes, One Function` (`<Snippet>` + `OLLAMA_TRANSLATE_LANG` + AlertBox supersession) | l. 28-43 (existant) |
| 5 | `## File Mode` | l. 65-77 (existant) |
| 6 | `## Registered in the ai Menu` | l. 79-81 (existant) |
| 7 | `## Key Takeaways` | l. 83-96 (existant) |
| 8 | `## Conclusion` | l. 98-100 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
