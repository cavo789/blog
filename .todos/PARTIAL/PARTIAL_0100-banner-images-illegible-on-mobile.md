# 0100 — Le texte des bannières d'articles devient illisible sur mobile

- **Priority**: Low
- **Batch**: banner-images
- **Depends**: —
- **Files**: TBD — concerne le prompt/process de génération des bannières `static/img/v2/*.webp`,
  pas un composant précis

## Problème

Audit visuel du 2026-08-20 : les bannières d'articles (`/img/v2/*.webp`, ~150 images, style
illustration narrative avec légendes intégrées à l'image — ex. "BUILDING A LOCAL KNOWLEDGE BASE:
ANYTHINGLLM & DOCUSAURUS RAG PIPELINE") sont dimensionnées et composées pour un affichage large
(desktop ~950px de large en corps d'article). Sur mobile (390px, capture d'écran à l'appui sur la
grille `/blog`), le même texte est réduit à quelques millimètres et devient impossible à lire —
alors que la majorité des lecteurs d'un blog technique en 2026 arrivent d'abord sur mobile
(réseaux sociaux, recherche).

Ce n'est pas un bug de code : les images sont correctement dimensionnées en pixels (1024×572,
~130 Ko en moyenne, vérifié) et le layout responsive les redimensionne sans distorsion. Le
problème est dans la composition même des visuels — trop de texte, trop petit relativement à la
taille de la scène, pour rester lisible une fois réduit.

## Solution

Pas un correctif mécanique — une décision de direction artistique pour les **prochaines**
bannières (retoucher les ~150 existantes n'est pas raisonnable) :

- Réduire le texte intégré à l'image à un titre court (ou aucun), et laisser le titre réel de
  l'article (déjà affiché en `<h1>` / carte) porter l'information — l'image devient purement
  illustrative.
- Si le texte intégré reste souhaité, le composer nettement plus grand/gras relativement à la
  scène, en pensant à la taille de rendu mobile (~350px de large réel), pas à la taille du fichier
  source.

## Risque

- Aucun changement de code requis ; risque nul si le ticket reste "guideline pour la suite" plutôt
  qu'une reprise du corpus existant.

## Acceptance

- [ ] Décision actée : révision du prompt/process de génération des bannières, ou statu quo assumé
- [ ] Si révision : au moins un nouvel article utilise le nouveau style et est lisible sur un
      viewport 390px

## Status — PARTIAL (2026-08-20)

### Done

- Décision actée avec l'utilisateur : révision retenue — texte intégré réduit à un titre court (ou
  absent) pour les **prochaines** bannières, l'image devient purement illustrative. Guideline
  enregistrée dans la mémoire persistante de Claude
  (`feedback_post_creation.md`, section "banner images") pour être appliquée automatiquement lors
  de la génération de futures bannières.

### Not done

- "Au moins un nouvel article utilise le nouveau style et est lisible sur un viewport 390px" :
  aucun nouvel article/bannière n'a encore été créé depuis cette décision.
  **Reason:** dépend du prochain article publié avec une nouvelle bannière — pas un travail à
  planifier isolément, se vérifiera naturellement au fil des prochains articles maintenant que la
  guideline est en mémoire.
