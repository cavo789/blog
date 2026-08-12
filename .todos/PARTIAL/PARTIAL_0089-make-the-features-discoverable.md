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

## Status — PARTIAL (2026-08-12)

### Recadrage du constat

Le diagnostic d'origine (« un visiteur n'en voit **aucun** ») n'était déjà plus exact au moment
du traitement : la navbar contient `Map` et `FAQ`, la `SearchBar` swizzlée affiche une vraie
boîte de recherche (`🔍 Search 247 articles… ⌘K`, bordure primaire, 17rem) sur toutes les pages,
et `AskMyBlogWidget` flotte en bas à droite partout. Le défaut réel, lui, tenait toujours : la
section « Explore the site » de la home listait 6 des 8 destinations de la navbar, en omettant
silencieusement Map et Ask My Blog. C'est cette incohérence qui a été corrigée.

### Done

- `src/data/home_cards.js` : ajout des cartes **Map** (`/map`) et **Ask My Blog** (`/faq`),
  insérées de façon à respecter exactement l'ordre de la navbar
  (Blog, Series, Tags, Map, FAQ, Repositories, Archive, About). Commentaire d'en-tête ajouté
  expliquant que cette section est la reformulation visuelle de la navbar — une destination
  présente dans l'une et absente de l'autre est désormais explicitement un bug.
- `static/img/homepage/map.webp` et `static/img/homepage/faq.webp` : générés avec `sharp` au
  format carré 1024x1024 des six autres cartes, depuis `/img/map.webp` et `/img/faqs.webp`.
  Pour la map, recadrage **à droite** et non au centre : c'est la seule zone de la bannière
  1584x672 qui contient le suricate et l'étiquette « Map Page », donc la seule cohérente avec
  le style des autres cartes.
- `src/components/HomeCards/` : nouvelle classe `.cardImage`
  (`aspect-ratio: 1/1; object-fit: cover`) passée à `CardImage`. Les sources sont carrées, mais
  la grille ne dépend plus de ce fait — c'est le garde-fou contre le risque « grille cassée »
  identifié dans ce TODO. `readme.md` mis à jour.
- `src/components/CommandPalette/Hint.js` : le hint se déclenche maintenant aussi sur `/`.
  `DELAY_MS` remplacé par `ARTICLE_DELAY_MS` (10 s, inchangé) et `HOME_DELAY_MS` (**4 s**), via
  une fonction `delayFor(pathname)` qui retourne `null` sur les chemins qui n'affichent rien.
  Justification du délai plus court : les 10 s existaient pour ne pas couper une lecture en
  cours ; sur la home il n'y a pas de lecture à couper, et c'est la page où l'on rebondit le
  plus vite. 4 s reste assez long pour ne pas se lire comme un pop-up au chargement.
  Le reste du garde-fou anti-intrusion est intact : pilule discrète, dismissible, une seule
  fois par navigateur à vie.
- Vérification visuelle réelle (Playwright + Chromium, dev server sur `:3100`, captures dans le
  scratchpad de session) à 1400 / 900 / 480 px :
  - 3 colonnes → rangées de 3-3-2, toutes les cartes à 353x507
  - 2 colonnes → 4 rangées de 2, toutes à 422x576
  - 1 colonne → 8 rangées de 1, toutes à 461x615
  Aucune carte désalignée, aucune hauteur d'image divergente.
- Vérification du hint : sur `/` la pilule apparaît (~4 s) et pose bien le flag localStorage ;
  sur `/blog/tags` elle n'apparaît toujours pas. Elle s'empile sous la bulle Ask-my-blog sans
  la recouvrir.
- Non-régression `MobileQuickLinks` : aucun doublon possible, ce composant liste des *articles
  liés* à l'intérieur d'un post (`useBlogPost`, rien hors page d'article) — il ne partage aucune
  entrée avec les cartes de la home.
- `yarn lint` et `yarn build` passent.

### Not done

- **Carte « Search everything » ouvrant la palette : abandonnée** (branche « abandon documenté »
  du critère d'acceptation).
  **Raison :** entre l'écriture du TODO et son traitement, la `SearchBar` swizzlée est devenue
  une vraie boîte de recherche visible en permanence dans la navbar, y compris sur la home.
  Une carte de plus pointant vers la même palette serait un troisième rappel du même point
  d'entrée (navbar + footer + carte), pour un coût réel : apprendre à `HomeCards` une action
  non-`<Link>` (donc un `<button>` conditionnel dans un composant qui n'en a pas besoin
  autrement) **et** fabriquer une 9ᵉ illustration alors qu'aucune image de ce type n'existe —
  les huit cartes sont des illustrations de suricate, un visuel « touche ⌘K » jurerait.
  **Décision considérée comme close**, pas comme du travail restant. À rouvrir seulement si
  la boîte de recherche de la navbar disparaît ou devient une simple icône.
  Effet de bord accepté : 8 cartes au lieu de 9, donc une cellule vide en fin de grille en
  mode 3 colonnes (rangées 3-3-2). Vérifié visuellement, c'est un rendu standard et propre.
- **Rappel `⌘K` du footer : gardé tel quel**, décision prise et non un oubli.
  **Raison :** le point 3 demandait de trancher entre « l'assumer comme rappel discret » et
  « le remonter ». Le remonter ferait doublon avec la boîte de recherche de la navbar, qui
  affiche déjà `Ctrl K` en évidence sur chaque page. Aucune modification de
  `docusaurus.config.js` n'était donc justifiée.
- `yarn format:check` échoue sur 199 fichiers, **tous préexistants** (`CLAUDE.md`, l'essentiel
  de `.todos/`, des composants non touchés ici). Les 5 fichiers modifiés par ce TODO passent
  `npx prettier --check`. Le nettoyage global est un chantier à part.
- Piste esthétique laissée ouverte : `faqs.webp` porte le texte incrusté « BLOG TOPICS:
  THEMATIC ARTICLE SERIES », qui parle plutôt de *séries* que de *questions*. L'image reste
  cohérente avec la page `/faq` (c'est son propre visuel), donc elle a été conservée, mais une
  illustration dédiée à « Ask My Blog » se lirait mieux dans la grille.
