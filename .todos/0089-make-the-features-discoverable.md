# 0089 — Rendre visibles les fonctionnalités du site : la home ignore Map, FAQ et `⌘K`

- **Priority**: High
- **Batch**: blog-home
- **Depends**: —
- **Files**: `src/data/home_cards.js`, `src/components/HomeCards/index.js`, `src/components/HomeCards/styles.module.css`, `src/components/CommandPalette/Hint.js`, `src/pages/index.mdx`

## Problème

Le site a une carte interactive du corpus ([[0081]]), un index de ~2 500 questions
([[0083]]) et une palette de commandes à six modes ([[0084]]). Un visiteur qui arrive sur la
page d'accueil n'en voit **aucun**.

Constat factuel :

- `src/data/home_cards.js` contient exactement six cartes — Blog, Series, Tags,
  Repositories, Archive, About. **Ni `/map`, ni `/faq`, ni la palette.** Ce sont les six
  entrées d'un blog Docusaurus standard.
- `CommandPalette/Hint.js` ne se déclenche **que sur une page d'article**
  (`ARTICLE_PATH = /^\/blog\/(?!tags|archive|authors|page)/`), après 10 secondes, et une
  seule fois par navigateur à vie (le flag localStorage est posé à l'affichage, pas au
  clic). Un visiteur qui arrive sur la home et repart n'a aucune chance de le voir.
- Le rappel `Press ⌘K to search · ? for shortcuts` vit dans le `copyright` du footer
  (`docusaurus.config.js`), donc sous la ligne de flottaison de toutes les pages longues.

Autrement dit : les trois fonctionnalités qui distinguent réellement ce site de n'importe
quel Docusaurus sont accessibles uniquement à qui connaît déjà leur existence. C'est le
travail de plusieurs chantiers rendu invisible par une liste de six cartes.

## Solution

Trois interventions, par ordre de rapport valeur/effort.

1. **Ajouter les cartes manquantes** dans `src/data/home_cards.js` : Map, Ask my blog, et
   une carte « Search everything » qui ouvre la palette. La structure de données existe et
   `HomeCards` la rend telle quelle — pour Map et FAQ c'est une entrée de tableau chacune,
   plus une image dans `static/img/homepage/` (les visuels existent déjà : `/img/map.webp`,
   `/img/faqs.webp` et `/img/ask_my_blog.webp`, à décliner au format des cartes de la home).
   ⚠️ La carte « palette » est le seul cas qui ne se réduit pas à un `url:` — `HomeCards`
   ne sait aujourd'hui que produire un `<Link to={url}>`. Il faut soit lui apprendre une
   action (`openPalette()` via `paletteBus`), soit renoncer à cette carte et se contenter du
   point 2. Trancher avant d'écrire.
2. **Étendre le `Hint` à la page d'accueil.** Une ligne de regex. Question à trancher :
   garder le délai de 10 s (pensé pour ne pas interrompre une lecture) ou le raccourcir sur
   la home, où il n'y a pas de lecture à interrompre.
3. **Décider du sort du rappel de footer.** Il n'est pas faux, il est juste invisible. Soit
   on l'assume comme un rappel discret, soit on le remonte (barre de navigation, ou près du
   champ de recherche).

Le cadrage important : **on ne construit rien de neuf.** Tout ce qui est cité ici existe et
fonctionne ; il s'agit uniquement de le rendre atteignable depuis la porte d'entrée.

## Risque

- **Encombrer la home.** Passer de 6 à 9 cartes peut casser la grille et diluer le message.
  Vérifier le rendu à 1, 2 et 3 colonnes, et se demander honnêtement si certaines des six
  cartes actuelles (Archive ? Repositories ?) méritent encore leur place au même rang que
  Map ou Ask my blog.
- **Le hint devient intrusif.** Un pop-up au chargement de la home, c'est exactement ce que
  les visiteurs ont appris à fermer sans lire. Le délai et la discrétion actuels sont un bon
  réglage — ne pas les sacrifier pour gagner en visibilité.
- **Redondance mobile.** `MobileQuickLinks` existe déjà ; vérifier qu'on ne crée pas deux
  points d'entrée concurrents sur petit écran.

## Acceptance

- [ ] `/map` et `/faq` sont atteignables depuis la page d'accueil sans connaissance préalable
- [ ] Le sort de la carte « palette » est tranché (action supportée par `HomeCards`, ou
      abandon documenté ici)
- [ ] Le `Hint` se déclenche aussi sur `/`, sans devenir intrusif
- [ ] La grille de cartes est vérifiée visuellement à 1, 2 et 3 colonnes
- [ ] Aucun doublon d'entrée avec `MobileQuickLinks` sur mobile
- [ ] `yarn lint && yarn format:check && yarn build` passent
