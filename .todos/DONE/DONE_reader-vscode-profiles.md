# Reader review : vscode-profiles

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** .unpublished/vscode-profiles/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture côte-à-côte des deux profils n'a pas pu être produite (nécessite VSCode graphique) — `TODO(author)` laissé à l'emplacement exact.

## Problème

Time to value : **100 %** — aucune preuve dans les 51 lignes du corps. Aucun `<Terminal>`, aucun
`<Snippet>`, aucune capture d'écran (pas de dossier `images/`) : l'article entier est de la prose.
Drapeaux : aucun install/abstraction à proprement parler (rien à installer ni de code), mais
c'est justement le problème — rien n'ancre non plus la preuve.
Redondance : aucune, sous le seuil.

Test des 30 secondes : « Le split thème sombre/thème clair par contexte est une bonne idée, mais
je ne le *vois* jamais — tout est raconté, jamais montré, alors que c'est un changement
entièrement visuel. »

## Risque

L'article décrit lui-même son propre signal de preuve : « a glance at the color scheme tells me
instantly which context a given window is in » (l. 40). C'est une invitation directe à montrer,
pas raconter — une capture côte-à-côte du profil sombre et du profil clair réglerait le TTV en
une image, sur l'article le plus court du lot.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook | l. 15-23 |
| 2 | **Nouveau** : preuve — capture côte-à-côte du profil Default (sombre) et DevContainer (clair) (à créer) | dérivé de l. 35-40 |
| 3 | What a Profile Actually Isolates | l. 27-31 |
| 4 | My Actual Split: Daily vs. DevContainer | l. 33-48 |
| 5 | Switching, and Knowing Which One You're In | l. 50-54 |
| 6 | Exporting a Profile | l. 56-58 |
| 7 | Key Takeaways / Conclusion | l. 60-76 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.
