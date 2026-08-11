# 0081 — Page `/map` : graphe interactif du corpus (248 posts, 25 séries)

- **Priority**: High
- **Batch**: blog-map
- **Depends**: —
- **Files**: `plugins/blog-graph-plugin/index.cjs`, `src/pages/map.js`, `src/components/BlogGraph/index.js`, `src/components/BlogGraph/styles.module.css`, `scripts/internal-link-opportunities.mjs`

## Problème

Le blog compte 248 articles, 25 séries, 165 posts en série et un maillage interne
travaillé (règle des 2-4 `<Link>` inline par post). Cette densité est le vrai
différenciateur face à un blog de 12 billets — mais elle est **invisible**.

Un visiteur qui arrive depuis Google sur un article isolé n'a aucun moyen de percevoir
qu'il vient de tomber sur un corpus cohérent. Les séries et les tags aident, mais ils
montrent des tranches, jamais l'ensemble.

## Risque

Le piège de ce genre de page est connu : afficher 248 nœuds d'un coup produit une pelote
de laine illisible. L'effet recherché ("waouh, il y a de la matière ici") se retourne en
"je ne comprends rien, je pars". **Si le rendu n'est pas propre, la page ne doit pas être
publiée** — mieux vaut pas de map qu'une map brouillonne.

## Solution

### 1. Artefact de build — `plugins/blog-graph-plugin/index.cjs`

Génère un `blog-graph.json` statique pendant le build :

- **Nœuds** : un par article publié (drafts exclus) — `slug`, `title`, `date`, `mainTag`,
  `series`, `readingTime`, degré entrant.
- **Arêtes**, trois types distincts, pondérés différemment :
  - `link` — lien interne réel dans la prose (le plus fort) ;
  - `series` — deux posts consécutifs d'une même série ;
  - `tag` — tags partagés (le plus faible, sinon tout est connecté à tout).

`scripts/internal-link-opportunities.mjs` fait déjà le plus dur : `collectLinks()` parse
les liens internes en gérant les 4 pièges qu'un grep naïf rate, et `loadPosts()` /
`parseFrontMatter()` donnent le corpus complet. **Extraire ces fonctions dans
`scripts/lib/` plutôt que de les dupliquer** — le script CLI et le plugin doivent lire le
même corpus, sinon les deux vues divergeront silencieusement.

### 2. Rendu — `src/components/BlogGraph/index.js`

Layout force-directed sur `<canvas>` (pas de SVG : 248 nœuds + arêtes en DOM rament au
drag). Simulation maison ou `d3-force` seul (~20 Ko, pas tout `d3`).

Contraintes de lisibilité, non négociables :

- **Filtrage par défaut** : n'afficher d'emblée que le sous-graphe pertinent — top ~120
  articles par degré entrant, ou le `mainTag` sélectionné. Jamais les 248 d'un coup.
- **Couleur = `mainTag`**, en réutilisant les tokens de `scripts/generate-post-colors.mjs`
  (déjà en place) — surtout pas une palette inventée qui contredirait le reste du site.
- **Taille du nœud = degré entrant**, avec une échelle racine carrée (linéaire écrase tout).
- Les arêtes `tag` en dessous d'un seuil de poids ne sont pas tracées, seulement utilisées
  par la simulation.
- Label affiché uniquement au survol et sur les nœuds les plus connectés — pas 248 labels.
- Survol : le nœud et ses voisins directs restent opaques, le reste passe à ~15 %.
- Clic : navigation vers l'article.

### 3. Accessibilité et dégradation

- `prefers-reduced-motion` → rendu statique, simulation pré-convergée au build.
- Mobile → le graphe n'apporte rien sur 375 px : servir la liste groupée par `mainTag`.
- Sans JS → même liste. La page doit rester indexable.
- Respect des thèmes clair/sombre via les variables Infima, pas de hex en dur.

### 4. Page — `src/pages/map.js`

Titre, une phrase d'explication, le graphe, un sélecteur de `mainTag`, et un compteur
("248 articles · 25 séries · N liens internes") qui, lui, se lit en une seconde.

## Notes

- L'artefact de build recoupe ce que voudront la palette `Cmd+K` et l'index de questions
  (« Ask my blog »). Prévoir `blog-graph.json` comme **un fragment d'un `blog-index.json`
  commun** plutôt qu'un fichier isolé, pour ne pas générer trois fois le même corpus.
- Une fois la page en place, elle devient une action naturelle de la palette
  (« Show on the map »).
