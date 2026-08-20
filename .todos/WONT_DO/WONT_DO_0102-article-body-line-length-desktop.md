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

## Post-mortem (2026-08-20, WONT_DO)

Deux tentatives, deux échecs, reverties toutes les deux — retour intégral à l'état d'avant ce TODO.

**Tentative 1** (celle qui a été committée puis marquée DONE) : `max-width: 60ch` sur
`.postContent p, .postContent li` uniquement. Résultat visible en prod : les titres et les médias
restaient pleine largeur de colonne pendant que le texte s'arrêtait plus tôt — un bord "en
escalier" avec un vide mort entre le texte et la TOC, qui ne servait à rien. Pire visuellement que
le problème initial.

**Tentative 2** (jamais committée) : déplacer la contrainte sur la colonne entière
(`.main-wrapper > .container > .row > .col.col--7`, la règle qui gagne réellement la cascade —
`max-width: min(1200px, 60ch)` avec `margin: 0 auto`). Corrige bien le bord en escalier et centre
la colonne à ~1440px. Mais sur un écran large (Chrome en plein écran, testé par l'auteur du blog) :
la colonne texte reste toujours capée à 600px pendant que le reste de la mise en page (sidebars)
continue de croître en `%` avec la largeur de l'écran — l'espace en trop se transforme en marges
gauche/droite énormes et non bornées. Plus l'écran est large, plus c'est visible. Constat de
l'auteur : "c'est PIRE".

**Pourquoi on arrête là** : une vraie correction demanderait soit de plafonner la largeur totale de
la page (`.container`/`.row`, avec un risque d'impact sur les pages docs/homepage qui partagent la
même structure Infima — jamais audité), soit de faire grandir les sidebars pour absorber l'espace
libéré — dans les deux cas, une refonte de layout disproportionnée pour un confort de lecture
mineur (voir [[feedback_article_weight]] : pas de sur-ingénierie sur du polish bas de priorité). Le
layout 3 colonnes actuel (66.6/16.6/16.6 %, plafonné à 1200px) reste cohérent et lisible sur toutes
les tailles d'écran testées ; on vit avec les 87–107 caractères/ligne mesurés en 2026-08-20.

Si quelqu'un rouvre ce sujet un jour : ne pas repartir sur un `max-width` fixe (px ou ch) sur la
colonne de contenu sans d'abord plafonner la largeur totale de la mise en page — sinon même bug.
