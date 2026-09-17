---
slug: blog-post-feed
title: Best Practice - Personnaliser le flux RSS de Docusaurus pour un contenu complet et des images
date: 2025-12-07
description: Améliorez le fichier RSS de votre blog Docusaurus. Écrivez un plugin pour désactiver le flux de base et inclure le contenu complet des articles, les images et des métadonnées enrichies pour de meilleurs lecteurs.
authors: [christophe]
image: /img/v2/docusaurus_rss_enhanced.webp
mainTag: docusaurus
series: Creating Docusaurus components
tags:
  - docusaurus
language: fr
blueskyRecordKey: 3m7f4ftmub22c
---
![Best Practice : personnaliser le flux RSS de Docusaurus pour un contenu complet et des images](/img/v2/docusaurus_rss_enhanced.webp)

<TLDR>
Le flux RSS par défaut de Docusaurus est basique : il n'inclut ni le contenu complet des articles ni les images, ce qui limite son intérêt pour les lecteurs RSS. Cet article propose une solution : créer un plugin personnalisé qui désactive la génération du flux par défaut. Le nouveau plugin produit un fichier `rss.xml` enrichi, avec le contenu HTML complet des articles, les images et des métadonnées améliorées pour une bien meilleure expérience de lecture.
</TLDR>


Si vous utilisez Docusaurus, vous pouvez lui demander de générer un fichier `rss.xml` en ajoutant le code ci-dessous dans la section `blog` de `docusaurus.config.js`.

```javascript
feedOptions: {
    type: ["rss"],
},
```

Docusaurus utilise **RSS 2.0** et exporte, par défaut, jusqu'à 20 articles. Le fichier généré est relativement basique ; par exemple, il n'inclut ni l'image de l'article ni son contenu HTML. Docusaurus crée un fichier assez simple.

Voyons comment l'améliorer.

*Voici un autre plugin Docusaurus local, comme ceux construits dans <Link to="/blog/docusaurus-plugin-replace">Creating a search&replace plugin for Docusaurus</Link> et <Link to="/blog/docusaurus-ascii-art">Inject ASCII Art in any HTML pages rendered by Docusaurus</Link> — celui-ci s'accroche aussi à l'événement `postBuild`.*

<!-- truncate -->

## Qu'est-ce que le fichier rss.xml ? {#what-is-the-rssxml-file}

Ce fichier est utilisé par les lecteurs RSS pour être informés des nouveaux articles de votre blog. Certaines personnes, dont moi, utilisent ces outils pour la veille technologique : elles passent par des services comme [Feedly](https://feedly.com/) ou [inoreader](https://www.inoreader.com/) pour s'abonner aux nouveaux contenus publiés sur les sites qu'elles suivent. Résultat : en ouvrant leur lecteur RSS, elles voient immédiatement la liste des nouveautés, le tout alimenté par le flux RSS.

Le fichier `rss.xml` standard généré par Docusaurus est trop basique pour moi. En effet, quand j'ouvre mon lecteur RSS, il me manque le contenu complet de l'article et l'image d'introduction.

Si vous maintenez un blog avec Docusaurus, votre RSS se trouve à l'emplacement `blog/rss.xml`. Pour mon site, c'est [https://www.avonture.be/blog/rss.xml](https://www.avonture.be/blog/rss.xml).

C'est un fichier XML, mais vous verrez une jolie page HTML grâce à un `XSLT` (une transformation du XML en HTML).

![Le fichier rss.xml par défaut avec Docusaurus](./images/default_rss.webp)

<AlertBox variant="tip" title="Voir la source">
Appuyez simplement sur <kbd>CTRL</kbd>+<kbd>U</kbd> pour voir le code source XML si ça vous intéresse.
</AlertBox>

## Visualiser le RSS avec Inoreader {#viewing-the-rss-using-inoreader}

Ci-dessous, ce que je voyais dans Inoreader :

![Ce que je voyais dans Inoreader](./images/before_inoreader.webp)

Dans les chapitres suivants, nous allons voir comment améliorer notre `rss.xml`. Une fois fait, vous obtiendrez ceci :

![Après notre optimisation](./images/after_inoreader.webp)

Et en ouvrant un article, nous obtiendrons ceci :

![Affichage d'un article](./images/article_inoreader.webp)

## Comment Docusaurus gère les flux {#how-docusaurus-is-managing-feeds}

La génération des flux est définie par l'élément `feedOptions` du fichier `docusaurus.config.js`.

J'ai essayé la documentation officielle ([https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog)) mais **je n'ai pas réussi à maîtriser l'élément `createFeedItems`** : on est censé pouvoir définir quelles informations (auteur, catégories, description, contenu, images, ...) on veut dans le flux mais, je dois l'avouer, toutes mes tentatives ont échoué.

C'est pourquoi, après des heures, j'ai créé mon propre plugin avec l'aide de l'IA.

## Optimisons tout ça {#lets-optimize-it}

### Préparer votre système {#prepare-your-system}

Ouvrez une console et ajoutez les quelques dépendances nécessaires au plugin que nous allons créer.

<Terminal typewriter wrap={true}>
$ yarn add cheerio feed front-matter fs-extra glob
</Terminal>

### Créer le plugin {#create-the-plugin}

Créez le fichier `plugins/blog-feed-plugin/index.js` avec le code ci-dessous

<Snippet filename="plugins/blog-feed-plugin/index.js" source="plugins/blog-feed-plugin/index.js" />

### Mettre à jour votre configuration {#update-your-configuration}

Mettez à jour votre `docusaurus.config.js` et faites deux choses.

<StepsCard
  variant="steps"
  steps={[
    "Nous devons désactiver la génération du flux RSS par Docusaurus",
    "Nous devons implémenter notre propre plugin"
  ]}
/>

Voyez ci-dessous comment procéder :

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

<AlertBox variant="note" title="atom peut rester">
Dans `feedOptions`, vous pouvez garder `type: ["atom"]` si vous l'avez, mais supprimez `rss` si vous le voyez.

Il existe deux types de flux, l'ancien (**rss**) et le plus récent (**atom**).
</AlertBox>

### Lancer le plugin {#run-the-plugin}

Une fois fait, lancez simplement `yarn run build` dans un terminal pour générer la version statique de votre site.

<Terminal typewriter wrap={true}>
$ yarn run build
</Terminal>

Pendant cette étape, Docusaurus appellera notre plugin pour générer le fichier `rss.xml` au lieu d'utiliser sa propre fonctionnalité standard.

Une fois terminé, si vous voulez voir le fichier en action sur votre machine, lancez `yarn run serve` pour démarrer votre site statique Docusaurus puis rendez-vous sur `http://localhost/blog/rss.xml` (votre URL locale) et vous verrez votre XML.


### Visualiser le nouveau rendu {#visualize-the-new-lookfeel}

Utilisons un outil en ligne comme [https://codebeautify.org/rssviewer/](https://codebeautify.org/rssviewer/).

Dans la partie gauche, copiez/collez le contenu de votre `blog/rss.xml` et regardez comment il sera affiché ; pas mal, non ?

![Le rss.xml en RSS 2.0 vu avec https://codebeautify.org/rssviewer](./images/using_codebeautify.webp)

Vous pouvez utiliser un autre outil comme [https://rss.app/rss-feed](https://rss.app/rss-feed) mais ici, vous devez d'abord envoyer votre fichier `blog/rss.xml` sur votre site de production.

![Le rss.xml en RSS 2.0 vu avec https://rss.app/rss-feed/](./images/using_rss_app.webp)

## Pourquoi c'est mieux ? {#why-is-this-better}

Comme vous pouvez le voir, le nouveau fichier `rss.xml` exposera maintenant l'image d'introduction, mais pas seulement : vous aurez aussi beaucoup plus d'informations, comme le HTML de votre article.

<AlertBox variant="tip" title="Voir la source">
Pour rappel, appuyez simplement sur <kbd>CTRL</kbd>+<kbd>U</kbd> pour voir le code source XML.
</AlertBox>

Les agrégateurs RSS, même les plus anciens, auront accès au contenu complet et pourront donc afficher l'article sans devoir aller le récupérer sur votre site.

## Options de configuration du plugin {#configuration-options-of-the-plugin}

Le plugin peut être configuré directement dans votre fichier `docusaurus.config.js`.

Voyez ci-dessous toutes les options facultatives que vous pouvez utiliser :

```javascript
const config = {
    // ...
    plugins: [
    [ "./plugins/blog-feed-plugin/index.js", {
        maxItems: 20,           // optional
        includeContent: true,   // optional
        includeImages: true,    // optional
        stripSelectors: [       // optional — add any site-specific UI selectors to remove
        ".custom-ads",
        ".share-buttons",
        ".newsletter-signup",
        ],
        ignorePatterns: ["**/_archived/**"], // optional
    }],
    ],
};

export default config;
```

- **maxItems** (nombre, défaut : `20`) : limite le nombre d'éléments dans le flux. Par défaut, Docusaurus n'en affiche que 20. Plus ce nombre est élevé, plus le fichier rss.xml sera volumineux. Vous pourriez être tenté de vouloir tous les articles (dans mon cas, près de 215 actuellement), mais ce n'est pas la vocation première d'un fichier RSS. Ce fichier est là pour lister les **derniers articles** et vous permettre de voir les publications les plus récentes de votre blog. Donc restez... raisonnable.

- **includeContent** (booléen, défaut : `true`) : inclut le corps HTML nettoyé de chaque article dans le champ `<content>`. Si vous voulez obliger les gens à visiter votre site pour lire le contenu complet, mettez cette option à `false`.

- **includeImages** (booléen, défaut : `true`) : ajoute l'image de l'article en haut de la description et inclut une balise `<enclosure>` avec le bon type MIME.

- **stripSelectors** (string[], défaut : fusionné avec les valeurs par défaut) : sélecteurs CSS supplémentaires à supprimer du HTML de l'article. Les sélecteurs critiques (`header`, `svg`) sont toujours supprimés.

- **ignorePatterns** (string[], défaut : [`"**/_archived/**"`]) : motifs glob pour exclure certains fichiers du blog.

## Quelques outils {#some-tools}

### Outils de visualisation {#visualization-tools}

Pendant que vous codez le plugin, utilisez l'un de ces outils de visualisation pour vous assurer que le contenu s'affiche correctement.

- [https://rss.app/rss-feed/](https://rss.app/rss-feed/)
- [https://codebeautify.org/rssviewer/](https://codebeautify.org/rssviewer/)
- [https://rssgizmos.com/rssviewer.html](https://rssgizmos.com/rssviewer.html)

### Outils de validation {#validation-tools}

Si vous voulez vous assurer que votre `rss.xml` est valide :

- [https://validator.w3.org/feed/](https://validator.w3.org/feed/)
- [https://www.rssboard.org/rss-validator/](https://www.rssboard.org/rss-validator/)
- [https://ralfvanveen.com/en/tools/rss-feed-checker/](https://ralfvanveen.com/en/tools/rss-feed-checker/)
