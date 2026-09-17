/**
 * French labels and descriptions for HOME_CARDS (src/data/home_cards.js).
 *
 * Keyed by the card's `url`, which is its stable identifier — unlike `title`, which is exactly
 * what gets translated. Same pattern as src/data/series.fr.js: these are DATA ROWS, not UI
 * chrome, so they live in a sibling file rather than in code.json.
 *
 * Adding a locale means adding a sibling file; nothing here changes. See TODO 0119.
 */
const HOME_CARDS_FR = {
  "/blog": {
    title: "Blog",
    description: "Je publie au moins un article par semaine.",
  },
  "/series": {
    title: "Séries",
    description: "Parcourir les articles regroupés par série.",
  },
  "/blog/tags": {
    title: "Tags",
    description: "Le moyen rapide de trouver un article par sujet ou par mot-clé.",
  },
  "/repositories": {
    title: "Dépôts",
    description: "Découvrir mes dépôts publics hébergés sur GitHub.com.",
  },
  "/blog/archive": {
    title: "Archives",
    description: "Une vue chronologique de tout ce que j'ai publié jusqu'ici.",
  },
  "/about": {
    title: "À propos",
    description: "Qui je suis, pourquoi j'écris, et de quoi parle ce blog.",
  },
};

export default HOME_CARDS_FR;
