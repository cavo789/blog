# 054 — Le maillage interne est quasi invisible sur mobile

**Priority:** High

## Problème

La sidebar du blog (`blogSidebarCount: "ALL"` dans `docusaurus.config.js`) affiche la liste
complète des articles. C'est de loin le plus gros réservoir de liens internes du site… mais
Docusaurus la masque sous 997px. Un lecteur sur mobile ne la voit jamais.

Ce lecteur mobile n'a donc, pour naviguer, que ce qui se trouve dans la page de l'article :

- le bloc `SeriesPosts` en haut de page — mais **seuls 51 articles sur 238 (21 %) appartiennent
  à une série**, donc 187 articles n'affichent rien du tout en haut ;
- le corps du texte — mais **102 articles sur 238 (43 %) ne contiennent aucun lien vers un autre
  article** (voir `.todos/internal-link-opportunities.md`, chantier en cours) ;
- le bloc `RelatedPosts`, remonté avant les widgets d'engagement, mais qui reste **tout en bas**,
  après l'intégralité de l'article.

Résultat : sur un article technique long, hors série et sans lien contextuel, un visiteur mobile
arrivant de Google doit scroller la totalité du contenu avant de se voir proposer quoi que ce
soit d'autre. La plupart ne le font pas — d'où un rebond structurellement élevé.

C'est probablement le levier le plus important qui reste sur le taux de rebond, et il est
d'autant plus critique que le trafic de recherche est majoritairement mobile.

## Risque

Ajouter un bloc de liens en haut de chaque article touche **les 238 articles** et se voit
immédiatement. Mal fait, ça :

- repousse le contenu vers le bas et dégrade l'expérience de lecture (l'inverse du but recherché) ;
- fait doublon avec `SeriesPosts` sur les 51 articles qui sont déjà dans une série ;
- fait doublon avec `RelatedPosts` en bas de page (mêmes articles proposés deux fois) ;
- risque de ressembler à un encart publicitaire et d'être ignoré par réflexe.

À vérifier aussi : l'impact sur le Cumulative Layout Shift, puisque le bloc s'insère au-dessus
du contenu principal.

## Solution proposée

Piste privilégiée — un composant compact, **affiché uniquement sur mobile**, et **uniquement pour
les articles hors série** (pour ne pas doublonner avec `SeriesPosts`) :

- 2 ou 3 articles maximum, en une ligne de texte chacun, sans image ni description ;
- placé **après le `<TLDR>`**, pas avant : le lecteur doit d'abord confirmer qu'il est au bon
  endroit ;
- formulé comme une aide à la navigation, pas comme une promotion — par exemple
  « Sur le même sujet : … » ;
- réutiliser la logique de sélection déjà écrite dans
  `src/components/Blog/RelatedPosts/index.js` (mainTag, puis repli sur les tags partagés) plutôt
  que de la dupliquer — l'extraire dans `src/components/Blog/utils/` si nécessaire.

Piste alternative si le bloc en haut s'avère trop intrusif : rendre la sidebar accessible sur
mobile via un bouton flottant ou une entrée dédiée, plutôt que d'ajouter du contenu à la page.

## Mesure

Ne rien juger avant que le correctif Matomo SPA (composant `MatomoRouteTracker` + heartbeat) ait
tourné au moins une semaine en production : c'est la seule façon d'avoir une base de référence
honnête. Comparer ensuite le nombre de pages par visite sur mobile, avant et après.
