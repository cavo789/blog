# Reader review : docusaurus-ai-gemini

**Détecté :** 2026-08-08
**Clôturé :** 2026-08-08
**Article :** blog/2026/03/09/docusaurus-ai-gemini/index.md
**Verdict :** DONE (restructuré selon le plan ci-dessous)

## Résumé de l'implémentation

Réordonnancement appliqué selon la table. La capture manquante a été produite réellement : `yarn build` + `yarn serve` de ce dépôt, puis un screenshot Playwright du header d'un vrai post publié (`lovable-dev-ai`, `ai_assisted: true`) montrant la pastille « AI Assisted » et le co-auteur « Google Gemini » effectivement rendus — enregistrée dans `images/ai_assisted_badge.png`.

## Problème

Time to value : **100 %** — aucune preuve visuelle nulle part dans le corps (aucune image hors bannière,
aucune sortie de terminal capturée ; seulement des commandes à taper).
Drapeaux : **abstraction-avant-preuve** — le "Goal" (l. 36-43) décrit le résultat en mots, puis
l'article enchaîne directement sur du code d'implémentation (front matter, composant React, swizzling
de 3 fichiers de thème) sans jamais montrer la pastille "AI Assisted" ni l'auteur Gemini réellement
rendus sur un post.

Test des 30 secondes : le lecteur ne voit jamais à quoi ressemble le résultat final — ironique pour un
article qui explique comment afficher visuellement une information.

## Risque

Un article entièrement "comment le construire" sans jamais "voici à quoi ça ressemble" est le pire cas
du guide de structure : le lecteur ne peut juger si le résultat vaut l'effort de swizzler 3 composants
de thème.

## Solution

Ordre proposé, section par section :

| Nouvel ordre | Contenu | Vient de |
| --- | --- | --- |
| 1 | Hook + promesse (inchangé) | l. 17-33 |
| 2 | **Nouveau** : capture d'écran du résultat (pastille "AI Assisted" + auteur Gemini sur un post réel) — à produire | — |
| 3 | Pourquoi le faire (transparence envers les lecteurs) | l. 23, 217 (reformulé) |
| 4 | Step 1-4 : front matter, composant AIIcon, swizzling, auteur Gemini (inchangé) | l. 45-213 |
| 5 | Conclusion (inchangée) | l. 215-219 |

Cible : time to value < 15 %. Structure de référence :
`.claude/skills/blog-post-structure/SKILL.md`.

**Note :** ce RESTRUCTURE nécessite une capture d'écran qui n'existe pas encore — à produire avant
d'implémenter, sinon l'article reste à 100 % de TTV même réordonné.
