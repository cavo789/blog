# 0099 — L'illustration de /map contient du texte incohérent généré par l'IA

- **Priority**: Medium
- **Batch**: blog-map
- **Depends**: —
- **Files**: `static/img/map.webp`, `src/pages/map.mdx`

## Problème

Audit visuel du 2026-08-20 : l'illustration en tête de `/map` (`static/img/map.webp`, référencée
depuis `src/pages/map.mdx`) contient au moins deux légendes de "livre" dont le texte généré par
l'IA est incohérent — confirmé par capture d'écran, visible en desktop (1440px) comme en mobile
(390px), donc pas un artefact de compression à une seule taille :

- "Article **Zhell Anuana aiá Toos**" (à côté d'un livre vert)
- "Article **Local Ollama Sirème**" (à côté d'un livre jaune) — probablement une tentative
  ratée de "Local Ollama API" ou d'un titre d'article existant

C'est le seul défaut de ce type repéré dans l'échantillon audité (page d'accueil, `/blog`, un
article, `/map` — desktop/tablette/mobile, clair/sombre), mais l'échantillon ne couvre qu'une
poignée des ~150 bannières `/img/v2/*.webp` du corpus : ce ticket ne couvre que `/map`, pas un
audit exhaustif des bannières d'articles.

## Solution

Régénérer (ou retoucher) `static/img/map.webp` pour que les libellés soient du texte lisible et
correct — soit en corrigeant le prompt qui a produit l'image, soit en retouchant le texte a
posteriori. Vérifier les autres légendes de la même image pendant la retouche (ex. "Docker" à
gauche, "AI" au centre) au cas où d'autres approximations seraient passées inaperçues à la
première lecture.

## Risque

- Aucun — image statique, pas de code touché en dehors du remplacement du fichier.

## Acceptance

- [x] Les deux légendes garbled repérées lors de l'audit sont corrigées (nouvelle image mise en
      place le 2026-08-20) — les autres approximations éventuelles listées en piste
      d'investigation ne sont pas traitées, décision assumée par l'auteur
- [ ] Vérifié en desktop et mobile après remplacement
- [ ] `yarn build` passe (pas de lien cassé sur le nouvel asset)
