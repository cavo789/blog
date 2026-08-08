# Reader review : ollama-ai-docs

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/12/31/ollama-ai-docs/index.md (actuellement `.unpublished/ollama-ai-docs/index.md`)
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table — les deux démos (ai-translate, ai-summarize) déplacées en position 1-2, avant les deux `<Snippet>` d'implémentation.

## Problème

Time to value : **38 %** (preuve ligne 50 sur un corps de 64 lignes, démo `ai-translate`).
Drapeaux : abstraction-avant-preuve, et deux fois plutôt qu'une —
`<Snippet filename="~/.zsh/fns/_ai-docs.zsh">` (l. 32) puis
`<Snippet filename="~/.zsh/fns/ai-translate.zsh">` (l. 44), toutes deux avant la première démo.
Redondance : le message "rien ne quitte la machine" est répété dans la TLDR, l'accroche,
l'AlertBox de conformité (l. 70-72) et la conclusion — 🟠 modérée, cohérente avec le sujet
(confidentialité) mais à surveiller lors de la réécriture.

Test des 30 secondes : "j'abandonne" — deux blocs de code complets (le helper d'extraction, puis
la fonction `ai-translate`) précèdent la première preuve, alors que l'article promet deux
fonctions concrètes dès la TLDR.

## Risque

Les deux démos (traduction d'un accord de service, résumé d'un contrat) illustrent déjà la
promesse — traiter des documents confidentiels 100 % en local — mais un lecteur pressé abandonne
avant de les voir, en plein milieu de deux implémentations.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Démo `ai-translate` (le `<Terminal>` + phrase d'intro) | l. 48-52 (existant) |
| 2 | Démo `ai-summarize` (le `<Terminal>` + phrase d'intro) | l. 60-64 (existant) |
| 3 | `## Reusing Docling for Extraction` (pourquoi ça marche, plomberie partagée) | l. 28-40 (existant) |
| 4 | `## ai-translate` (le `<Snippet>` + logique du prompt) | l. 42-46 (existant) |
| 5 | `## ai-summarize` (le `<Snippet>` + logique du prompt) | l. 54-58 (existant) |
| 6 | `## Registered in the ai Menu` | l. 66-68 (existant) |
| 7 | AlertBox "Local doesn't mean automatically compliant" | l. 70-72 (existant) |
| 8 | `## Key Takeaways` | l. 74-86 (existant) |
| 9 | `## Conclusion` | l. 88-90 (existant) |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
