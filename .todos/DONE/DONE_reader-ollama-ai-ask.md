# Reader review : ollama-ai-ask

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-ask/index.md (actuellement `.unpublished/ollama-ai-ask/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — Demo déplacée en position 1, avant le `<Snippet>` du code source.

## Problème

Time to value : **32 %** (preuve ligne 41 sur un corps de 47 lignes, section `## Demo`).
Drapeaux : abstraction-avant-preuve — `<Snippet filename="~/.zsh/fns/ai-ask.zsh">` (l. 32, code
d'implémentation complet) apparaît avant la démo (`<Terminal source="./files/terminal_ask.txt">`,
l. 41).
Redondance : aucune (article court).

Test des 30 secondes : "j'abandonne" — la section `## The Simplest Function in the Series`
(l. 28-37) ouvre directement sur le code source de la fonction, avant que le lecteur ait vu ce
qu'elle produit.

## Risque

Article très court (47 lignes de corps) : inverser Demo et Snippet est un changement minime mais
qui déplace la preuve de 32 % à environ 8 % du corps — l'essentiel du contenu utile suit
immédiatement.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | `## Demo` (le `<Terminal>` montrant `ai-ask` en action) | l. 39-47 (existant) |
| 2 | `## The Simplest Function in the Series` (le `<Snippet>` du code) | l. 28-37 (existant) |
| 3 | `## Registered in the` `ai` `Menu` | l. 53-55 (existant) |
| 4 | `## Key Takeaways` | l. 57-69 (existant) |
| 5 | `## Conclusion` | l. 71-73 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
