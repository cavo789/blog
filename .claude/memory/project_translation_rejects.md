---
name: project_translation_rejects
description: Un dump dans .translation-rejected/ est souvent une bonne traduction jetée par un faux positif — rejouer le validateur hors-ligne (gratuit) avant de relancer translate (facturé)
metadata:
  node_type: memory
  type: project
  originSessionId: 7e563f95-d014-4ebd-a931-12af69097c68
  modified: 2026-09-17T13:10:52.666Z
---

Quand `translate` signale des échecs, le dossier `.translation-rejected/` ne conserve **que la
sortie du modèle, jamais la raison** : le script imprime les problèmes sur stderr et les perd.

**Réflexe correct, dans cet ordre :**

1. Rejouer `validateTranslation(source, dump, { sourceTitles })` hors-ligne sur chaque dump —
   c'est une fonction pure, **zéro appel API**. Elle rend la liste exacte des problèmes.
2. Trier : faux positif du validateur / vraie erreur du modèle.
3. Un dump redevenu propre s'**installe directement** (cible + `pinEnglishAnchors` + sidecar
   `{sourceHash, model, translatedAt, source}`) — gratuit. Ne relancer `translate` que sur les
   vraies erreurs.

Ne jamais relancer `translate` à l'aveugle : le script fait déjà **deux tentatives** en
réinjectant les problèmes dans la seconde. Un dump est donc déjà une sortie « après feedback » ;
une relance nue rejoue une boucle qui a perdu deux fois. Sur un faux positif, elle ne peut que
perdre indéfiniment.

Le dossier peut mélanger plusieurs runs — vérifier la date et le chemin de chaque dump avant de
conclure sur le nombre d'échecs annoncé.

Session 2026-09-17 : 8 dumps, **2 seules vraies erreurs**. Trois bugs corrigés dans
`scripts/lib/translate-validate.mjs` (voir [[feedback_validator_false_positives]]).
Voir aussi [[project_i18n_architecture]] et [[feedback_i18n_translation_rejected]].
