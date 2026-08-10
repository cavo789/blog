# Reader review : docusaurus-lazy-loading

**Détecté :** 2026-08-08
**Article :** blog/2025/08/27/docusaurus-lazy-loading/index.md
**Verdict :** RESTRUCTURE

## Problème

Time to value : **100 %** (aucune preuve visuelle sur un corps de seulement 17 lignes).
Drapeaux : aucun install/abstraction à proprement parler (l'article ne contient qu'un seul
`<Snippet>`, l. 43) mais aucune preuve non plus : le texte affirme "You'll see that images have
now the `loading="lazy"` attribute" (l. 45) sans jamais le montrer.

Test des 30 secondes : article très court et clair sur l'intention, mais il demande de faire
confiance sur parole ("Easy no?") plutôt que de montrer l'attribut `loading="lazy"` dans les
DevTools.

## Risque

Article très court donc le risque est faible, mais c'est justement l'occasion la moins coûteuse
de corriger : une seule capture (DevTools avant/après) suffirait à fermer la boucle.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 26-30 |
| 2 | **Nouveau** : capture DevTools montrant `loading="lazy"` sur une balise `<img>` — à produire | — |
| 3 | Le correctif (`MDXComponents.js`, inchangé) | l. 34-43 |
| 4 | Vérification + lien vers l'article de contrôle automatique (inchangé) | l. 45-49 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** ce RESTRUCTURE nécessite une capture qui n'existe pas encore — à produire avant
d'implémenter, sinon l'article reste à 100 % de TTV même réordonné.
