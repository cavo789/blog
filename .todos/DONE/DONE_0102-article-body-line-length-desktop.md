# 0102 — Les lignes de texte des articles sont un peu longues en lecture desktop

- **Priority**: Low
- **Batch**: blog-readability
- **Depends**: —
- **Files**: `src/css/custom.css` (probable — colonne centrale définie par les règles `col--8` /
  `--ifm-container-width` autour de la ligne 156), à confirmer en inspectant le rendu

## Problème

Audit visuel du 2026-08-20 : mesuré sur un article en desktop (1440px, build de production), la
colonne de texte fait ~834–911px de large pour du corps de texte en 16px/Inter, soit environ
**87 à 107 caractères par ligne** selon la page (mesuré via `canvas.measureText`, pas une
estimation à l'œil). La fourchette confortable de lecture longue est généralement 50–75 caractères
(jusqu'à ~90 en tolérance haute) — les articles de ce blog font typiquement 10–26 min de lecture,
donc la longueur de ligne compte sur la durée.

Pas un bug bloquant : le layout 3 colonnes (sidebar "All posts" + contenu + TOC) reste cohérent et
lisible, c'est un confort de lecture en moins plutôt qu'un défaut visible au premier coup d'œil.

## Solution

Ajouter un `max-width` (en `ch` plutôt qu'en px, pour rester proportionnel à la police) sur le
conteneur de texte du corps d'article — ne pas resserrer les éléments larges (images, tableaux,
blocs de code, Mermaid) qui bénéficient au contraire de toute la largeur disponible. Cibler
uniquement les blocs de texte courant (`<p>`, listes).

## Risque

- Resserrer trop peut casser l'alignement avec les images pleine largeur du même article — vérifier
  visuellement les deux cas (texte + image large) côte à côte après le changement.

## Acceptance

- [ ] Largeur de ligne du corps de texte ramenée dans une fourchette ~70–85 caractères en desktop
- [ ] Images, tableaux, blocs de code et Mermaid restent pleine largeur de colonne (non resserrés)
- [ ] Vérifié sur un article avec image large + un article surtout textuel
- [ ] `yarn lint && yarn format:check && yarn build` passent
