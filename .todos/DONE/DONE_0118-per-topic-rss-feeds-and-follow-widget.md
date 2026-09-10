# 0118 — Mettre le RSS en avant : flux par tag et par série + composant « Suivre ce sujet »

- **Priority**: High — les trois flux existent déjà et fonctionnent ; il manque uniquement la découvrabilité et le découpage par sujet
- **Batch**: blog-feeds
- **Depends**: —
- **Files**: `plugins/blog-feed-plugin/index.js`, `plugins/lib/blog-taxonomy.cjs`, `src/components/FollowFeed/` (à créer), `src/components/Blog/ArticleActions/` (à créer), `src/components/CopyAsMarkdown/`, `src/theme/BlogPostItem/index.js`, `src/theme/BlogPostItem/Header/index.js`, `src/components/Blog/Tags/TagArticlesPage.tsx`, `src/components/Blog/Series/`, `src/pages/follow.tsx` (à créer), `src/theme/MDXComponents.js`, `static/blog/rss.xsl`, `docusaurus.config.js`

## Problème

Déclencheur : la zone « Créer une veille sur ce sujet » vue sur
[actuia.com](https://www.actuia.com/actualite/gpt-6-astra-ce-qui-a-change-chez-openai-en-quinze-jours/).
Chez eux c'est un service backend (email + agent IA). Chez nous, site statique, l'équivalent honnête
et sans base d'abonnés, c'est le RSS — sauf qu'il est aujourd'hui **invisible et monolithique**.

**Invisible.** Le blog publie trois flux :

| Flux | Produit par | URL | Taille |
| --- | --- | --- | --- |
| RSS 2.0 (contenu complet) | `plugins/blog-feed-plugin/index.js` | `/blog/rss.xml` | 903 KB |
| Atom | `feedOptions` du preset (`docusaurus.config.js:132`) | `/blog/atom.xml` | 20 KB |
| JSON Feed | idem | `/blog/feed.json` | — |

Aucun composant de `src/components/` ne les mentionne : le seul `grep` positif sur `rss|atom.xml|feed.json`
dans `src/` retombe sur `admin.js`, `postColors.generated.js` et `MarkdownAlternate` (qui parle du
pattern, pas du flux). Le seul pointeur réel est le `<link rel="alternate">` atom+json injecté
automatiquement par Docusaurus sur les routes blog — et il **n'inclut même pas `/blog/rss.xml`**, le
flux fait maison, pourtant le plus soigné des trois (contenu nettoyé, `<enclosure>` image,
`dc:creator`, feuille XSLT). Un lecteur qui voudrait s'abonner n'a aucun moyen de savoir que ça existe.

**Monolithique.** Un seul flux global, tous sujets confondus. Un lecteur venu pour Docker reçoit
aussi le VBA Outlook et Quarto. C'est précisément ce que « veille **sur ce sujet** » corrige : il
faut des flux par tag (49 dans `blog/tags.yml`) et par série (26 séries actives). Docusaurus n'en
génère pas, et nos pages tag/série sont des routes custom (`addRoute` dans
`plugins/docusaurus-plugin-tag-route/index.cjs:34` et `docusaurus-plugin-series-route/index.cjs:47`),
donc elles n'ont même pas l'autodiscovery du flux global.

Cas d'usage le plus fort, et le plus mal servi aujourd'hui : **les séries**. « Préviens-moi quand
l'épisode suivant sort » est la promesse RSS la plus naturelle qui soit, et on a 26 séries.

## Solution

Trois lots, à faire ensemble (ils partagent le composant et le plugin).

### Lot 1 — Génération des flux dérivés (`blog-feed-plugin`)

Émettre, en plus de `/blog/rss.xml` :

- `/blog/tags/<slug>/rss.xml` pour chaque tag dépassant un seuil ;
- `/blog/series/<slug>/rss.xml` pour chaque série.

Réutiliser `plugins/lib/blog-taxonomy.cjs` (`createSlug`, `listTagSlugs`, `listSeriesSlugs`), déjà
consommé par les deux plugins de route — **obligatoire**, sinon les URLs de flux divergeront des URLs
de pages : `series:` est du texte libre en frontmatter (`series: WinSCP & remote file transfer`), le
slug n'existe que parce que `createSlug` le calcule.

Points d'attention (tous vérifiés dans le code) :

- **Le poids est LE piège.** `/blog/rss.xml` fait 903 KB pour 20 items, soit ~45 KB/item, parce qu'il
  embarque le contenu complet en `content:encoded`. Appliquer la même recette à 49 + 26 = 75 flux ×
  20 items = jusqu'à ~1500 items sérialisés, soit **plusieurs dizaines de Mo ajoutés au build**, pour
  du contenu 100 % dupliqué du flux global. → Les flux dérivés doivent embarquer **`description`
  seule, sans `content:encoded`** (option `includeContent: false` par flux). Ordre de grandeur cible :
  celui d'`atom.xml`, 20 KB pour les mêmes 20 items. Prévoir aussi un `maxItems` plus bas (10).
- **Le refactor est structurel, pas cosmétique.** `postBuild` est aujourd'hui linéaire : collecte
  frontmatter → extraction HTML → **un** `new Feed(...)` → post-traitement cheerio → **une** écriture
  (`plugins/blog-feed-plugin/index.js:222-471`). Il faut extraire une fonction
  `buildFeed(items, channelMeta, outPath, opts)` appelée une fois par groupe. Attention : l'étape
  cheerio d'injection des `dc:creator` (lignes ~430-460) opère sur `rssContent` en fin de flux — si
  elle reste hors de la fonction, seul le flux global aura ses auteurs.
- **Bonne nouvelle, le coût CPU est déjà payé.** `getArticleHtml` tourne sur **tous** les posts avant
  le `slice(0, maxItems)` (lignes 299-312) : le groupement par tag/série ne relit ni ne re-parse
  aucun fichier. Seuls s'ajoutent la sérialisation et l'écriture. L'objection « ça va ralentir le
  build » ne tient pas.
- **Le XSLT relatif casse.** Ligne 468, la PI injectée est `href="rss.xsl"` — chemin **relatif**, qui
  résout vers `static/blog/rss.xsl` → `/blog/rss.xsl` uniquement parce que le flux est à la racine de
  `/blog/`. Un flux à `/blog/tags/docker/rss.xml` chercherait `/blog/tags/docker/rss.xsl` → 404 → XML
  brut à l'écran. → Passer en **absolu** `/blog/rss.xsl`. La feuille affiche déjà
  `/rss/channel/title`, donc elle annoncera correctement « Docker » sans modification ; vérifier
  quand même les liens en dur qu'elle pourrait contenir.
- **Ne pas rejouer le bug du `lastBuildDate`.** Le commentaire lignes ~318-325 documente qu'un
  `new Date()` en `updated` réécrivait le fichier de 1,3 Mo à chaque build et déclenchait un
  ré-upload au déploiement. Chaque flux dérivé doit prendre la date de **son** post le plus récent —
  sinon on multiplie le problème par 75.
- **Seuil.** Un flux à 1 ou 2 articles ne sert personne et pollue. Option `minPostsPerTagFeed`,
  proposition : **4**. Les séries échappent au seuil (une série a par définition ≥ 2 épisodes et
  l'intention d'abonnement y est plus forte).
- **Sitemap.** Ne pas ajouter les `.xml` au sitemap (ce sont des flux, pas des pages).

### Lot 2 — Composant `<FollowFeed />`

Un composant TypeScript (`src/components/FollowFeed/index.tsx` + `styles.module.css`), enregistré
dans `src/theme/MDXComponents.js`, props : `{ feedUrl, label, variant }`.

Contenu de l'encart :

- l'URL du flux **affichée en clair** dans un `<code>` + bouton copier — c'est le chemin principal,
  celui qui marche partout ; réutiliser le pattern `navigator.clipboard.writeText` déjà en place dans
  `CopyAsMarkdown/index.tsx:35` et `Terminal/index.tsx:249` ;
- boutons d'abonnement en un clic : Feedly (`https://feedly.com/i/subscription/feed/<url encodée>`),
  Inoreader (`https://www.inoreader.com/?add_feed=<url encodée>`), plus un lien `feed://…` pour les
  lecteurs natifs (NetNewsWire, Reeder, Thunderbird). **`feed://` échoue silencieusement** si aucun
  handler n'est enregistré : il reste secondaire, jamais le seul chemin ;
- deux lignes d'explication + lien vers `/follow` — beaucoup de lecteurs ne savent tout simplement
  pas ce qu'est un lecteur de flux.

### Lot 3 — Placement et découvrabilité

**Décision de l'auteur (2026-09-10) : l'emplacement principal dans l'article est la barre d'actions
de l'en-tête**, sur la même ligne horizontale que « 📋 Copy as Markdown » et « View raw », entre la
ligne date/temps de lecture et le bloc auteurs. Ça règle le problème de saturation du bas d'article
sans rien enterrer : la ligne est déjà là, elle est déjà lue, et les trois actions relèvent de la
même famille — « emporter cet article / suivre ce sujet ».

Conséquences techniques, toutes vérifiées :

- **Il faut un vrai conteneur de barre d'actions.** Aujourd'hui il n'y en a pas :
  `BlogPostItem/index.js` construit `<CopyAsMarkdown metadata={metadata} />` et le passe en prop
  `copyAsMarkdown` à `BlogPostItemHeader`, qui le rend tel quel (`{copyAsMarkdown}`). La ligne
  horizontale visible n'est pas une barre, c'est le `.wrapper` interne de `CopyAsMarkdown`
  (`display: inline-flex; gap: 10px; margin: 8px 0`). → Créer
  `src/components/Blog/ArticleActions/` qui possède la rangée flex et rend `<CopyAsMarkdown>` +
  `<FollowFeed variant="inline">` côte à côte. Ne **pas** ajouter le bouton RSS dans
  `CopyAsMarkdown` : le composant a un seul rôle et son nom le dit.
- **Renommer la prop.** `copyAsMarkdown` → `actions` dans `BlogPostItem/index.js` et
  `BlogPostItem/Header/index.js`, PropTypes des deux fichiers inclus. Petit, mais à faire d'un bloc,
  sinon le nom ment sur ce que la prop transporte.
- **Neutraliser le double espacement.** `CopyAsMarkdown/.wrapper` porte `margin: 8px 0` et son propre
  `inline-flex` ; imbriqué dans une nouvelle rangée flex, ça produit un décalage vertical. C'est la
  rangée qui doit posséder `gap` et marges — le `.wrapper` passe à `margin: 0` (ou disparaît au
  profit d'un fragment).
- **Page article uniquement.** Le garde-fou existe déjà : `BlogPostItem/index.js` ne construit
  `copyAsMarkdown` que si `isBlogPostPage`. La barre d'actions hérite du même test — pas de bouton
  RSS sur les cartes de listing.
- **La ligne doit rester une ligne.** Impossible d'y loger l'URL + le bouton copier + Feedly +
  Inoreader. → En `variant="inline"`, `FollowFeed` se réduit à un déclencheur compact
  (`🔔 Follow Docker`, libellé basé sur le `mainTag` de l'article) qui ouvre un petit popover
  contenant le contenu complet décrit au lot 2. La carte pleine (`variant="card"`) reste pour les
  pages tag/série et `/follow`.
- **Piège flex connu sur le popover** : dans un conteneur en colonne, `flex-basis` se comporte comme
  une `min-height`. Forcer `flex: 0 0 auto` sur les panneaux du popover — on s'est déjà fait avoir.
- **Attention à l'encombrement de l'en-tête.** 0115 (chapeau) et 0116 (fil d'Ariane) viennent d'y
  ajouter deux blocs ; la barre d'actions est donc le 3ᵉ ajout récent au même en-tête. Juger le
  rendu avec les trois en place, pas isolément.

Le reste du lot est inchangé :

- **Pages tag et série.** C'est là que l'intention « je veux ce sujet » est maximale :
  `TagArticlesPage.tsx` et les composants `Blog/Series/`. Encart pleine carte, permanent.
- **Autodiscovery.** Injecter `<link rel="alternate" type="application/rss+xml">` sur les pages tag et
  série via `<Head>` — le précédent exact est `src/components/MarkdownAlternate/index.tsx`. Ajouter
  aussi `/blog/rss.xml` aux `headTags` globaux, aujourd'hui absent au profit d'atom+json seuls.
- **Page `/follow`.** Une page listant les trois formats du flux global, les flux par série et par
  tag, plus un court « c'est quoi un lecteur RSS ». Donne un lien unique à mettre au footer et à citer
  depuis le popover, au lieu de répéter la pédagogie partout.
- Optionnel : événement Matomo sur le clic « copier » / « s'abonner », pour savoir si ça sert.

## Risque

- **Effort réel vs audience RSS.** Le RSS reste une niche. Le lot 1 seul est du travail de plomberie
  invisible ; c'est le lot 3 qui produit l'effet recherché. Si l'ordre doit être cassé, faire
  **2 + 3 avec le flux global d'abord**, mesurer, puis générer les flux par sujet.
- **75 fichiers de plus dans `build/`.** Sans la discipline « description seule » du lot 1, ça
  dégrade le temps de déploiement et le diff d'upload. À vérifier après la première build complète :
  `du -sh build/blog` avant/après.
- **Divergence de slugs.** Si le plugin feed réimplémente sa propre normalisation au lieu de
  `blog-taxonomy.cjs`, on obtient des flux à des URLs que personne ne peut deviner depuis la page
  correspondante. Contrainte forte, pas une préférence.
- **Flux orphelins.** Un tag qui passe sous le seuil, ou une série renommée, laisse une URL de flux
  morte chez les abonnés — sans aucun moyen de les prévenir. Traiter les slugs de série comme des
  URLs publiques stables une fois publiées.
- **Redondance avec Bluesky.** Les deux répondent à « comment je suis ce blog ». Ne pas les mettre
  côte à côte en concurrence : Bluesky = conversation, RSS = réception passive. Formuler les libellés
  pour que la différence soit évidente.
- **Surcharge de la barre d'actions.** Trois éléments sur cette ligne, c'est le maximum lisible sur
  mobile — la capture d'écran de l'auteur montre déjà « Copy as Markdown » + « View raw » qui
  occupent la moitié de la largeur. Vérifier le rendu à 360 px avant de valider : si ça passe à la
  ligne, réduire le libellé du déclencheur (`🔔 Suivre` sans le nom du tag).
