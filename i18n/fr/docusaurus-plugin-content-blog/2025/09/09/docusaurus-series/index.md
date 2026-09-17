---
slug: docusaurus-series
title: Organisez votre contenu Docusaurus avec un composant Series personnalisé
date: 2025-09-09
description: Découvrez comment regrouper des articles de blog Docusaurus liés en une expérience de lecture fluide grâce à un composant Series personnalisé.
authors: [christophe]
image: /img/v2/docusaurus_component.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - markdown
  - react
language: fr
blueskyRecordKey: 3lyhtzknd6s2j
updates:
  - date: 2025-11-15
    note: Add the `/src/data/series.js` file
---
<!-- cspell:ignore reposts,packagist,3lun2qjuxc22r,repost,noopener,noreferrer,docux -->

![Organisez votre contenu Docusaurus avec un composant Series personnalisé](/img/v2/docusaurus_component.webp)

<TLDR>
Ce guide détaillé vous montre comment implémenter une fonctionnalité complète de « série d'articles » dans Docusaurus. Vous apprendrez à créer un composant `<SeriesPosts>` qui affiche une bannière de série sur chaque article, ainsi qu'une page `/series` dédiée qui liste toutes vos séries sous forme de cartes. Le tutoriel couvre la création de plusieurs composants React, des helpers utilitaires pour récupérer les données des articles, la surcharge de composants du thème Docusaurus via le swizzling, et la construction d'un plugin local personnalisé pour gérer les routes dynamiques des séries. Enfin, il montre comment ajouter des descriptions et des images personnalisées à vos séries via un fichier de données centralisé.
</TLDR>

Si vous utilisez Docusaurus depuis longtemps, vous avez peut-être remarqué qu'il n'est pas possible de relier des articles entre eux sous forme de série.

Ce serait pratique d'écrire un premier article, un deuxième, un troisième, etc., et de pouvoir dire à Docusaurus que ces articles font partie de la même série.

Cela aura aussi un impact positif sur votre SEO (en créant un meilleur maillage interne) et gardera vos lecteurs plus longtemps. *Pour des articles liés entre eux mais qui ne forment pas une série ordonnée, <Link to="/blog/docusaurus-relatedposts">Displaying related posts below our Docusaurus article</Link> joue le même rôle sur base des tags partagés.*

Ce n'est pas possible nativement, alors créons un composant pour ça.

<AlertBox variant="caution" title="Attention, spoiler">
Cliquez simplement sur le lien <Link to="/series">Séries</Link> pour voir à quel point le composant **SeriesPosts** est sympa. Vous allez apprendre à le faire ici.

</AlertBox>

<!-- truncate -->

Voici le composant en action, une fois branché — une bannière annonçant la série, directement sur l'article :

![Notre composant tourne maintenant](./images/our-component-is-running.webp)

La partie 2 va plus loin et ajoute une page `/series` complète qui liste chaque série sous forme de cartes :

![Une page avec toutes les séries](./images/series-page.webp)

Construisons les deux, en commençant par la bannière.

<AlertBox variant="info">
Vous avez déjà vu cet article ? Regardez en haut. Vous verrez une bannière qui dit : « Cet article fait partie de la série **Creating Docusaurus components** ». C'est exactement ce que nous allons apprendre à faire tout de suite.

</AlertBox>

Ce long article comporte deux sections principales : l'une sur la création du composant, l'autre sur la navigation dans le blog.

*Il combine les deux techniques utilisées partout dans cette série : le swizzling d'un composant de thème (comme dans <Link to="/blog/docusaurus-old-notice">la notice signalant un article de plus d'un an</Link>) et l'écriture d'un plugin local (comme dans <Link to="/blog/docusaurus-plugin-replace">le plugin de recherche &amp; remplacement</Link>).*

## Partie 1 - Création du composant SeriesPosts {#part-1---creation-of-the-seriesposts-component}

Dans ce premier chapitre, nous allons créer notre composant `SeriesPosts` afin qu'à l'ouverture d'un article, vous voyiez un message « Cet article fait partie de... » et la liste des autres articles de cette série.

<StepsCard
  title="Cela implique plusieurs choses :"
  variant="prerequisites"
  steps={[
    "Nous aurons besoin de quelques helpers.",
    "Nous aurons besoin d'un nouveau composant.",
    "Les articles de blog devront avoir une entrée `series` dans leur YAML front matter, et",
    "Nous devrons surcharger la façon standard d'afficher un article de blog."
  ]}
/>

### 1.1. Nous avons besoin de quelques helpers {#11-we-need-some-helpers}

Si vous ne l'avez pas encore, créez le fichier `src/components/Blog/utils/posts.ts`. Il contiendra une fonction helper que nous pourrons réutiliser pour plusieurs composants.

Ce helper va scanner chaque fichier Markdown avec une extension `.md` ou `.mdx` dans le sous-dossier `blog`.

Pour chaque fichier, le script va regarder le YAML front matter et utiliser certaines de ses propriétés. Par exemple :

-   Si l'article a `draft: true` ou `unlisted: true`, il sera ignoré.
-   Si l'article a un `slug`, il sera utilisé ; sinon, le slug sera généré par le code.
-   Si l'article a une image associée, elle sera utilisée ; sinon, une image par défaut sera utilisée.
-   Ensuite, le helper retournera la liste des articles et leurs propriétés.

Certaines propriétés sont personnalisées, comme `mainTag` (voir mon article [Displaying related posts below our Docusaurus article](/blog/docusaurus-relatedposts)) et, pour notre besoin actuel, la propriété `series`.

Donc, copiez-collez simplement le contenu du fichier ci-dessous et créez le fichier `src/components/Blog/utils/posts.ts` dans la structure de votre projet.

<Snippet filename="src/components/Blog/utils/posts.ts" source="src/components/Blog/utils/posts.ts" />

Nous aurons aussi besoin d'un second helper. Créez le fichier `src/components/Blog/utils/slug.ts` :

<Snippet filename="src/components/Blog/utils/slug.ts" source="src/components/Blog/utils/slug.ts" />

### 1.2. Notre composant SeriesPosts {#12-our-seriesposts-component}

Maintenant, nous allons créer notre composant. Créez le fichier `src/components/Blog/SeriesPosts/index.tsx` avec le code suivant :

<Snippet filename="src/components/Blog/SeriesPosts/index.tsx" source="src/components/Blog/SeriesPosts/index.tsx" />

Ce code JavaScript va récupérer la liste de tous les articles de blog. Ensuite, il va extraire une propriété appelée `series` (qui peut être présente ou non dans le YAML front matter de votre article). Si un article a la propriété `series`, le script comparera sa valeur avec celle de l'article courant.

S'il y a correspondance, nous avons d'autres articles dans la série, et le script affichera « Cet article fait partie de... » suivi du nom de la série et de la liste des articles.

Les articles sont affichés dans l'ordre chronologique pour permettre au lecteur de suivre la série dans un ordre logique.

Le reste de la logique affiche simplement une liste à puces.

Et le dernier fichier à créer est le fichier CSS :

<Snippet filename="src/components/Blog/SeriesPosts/styles.module.css" source="src/components/Blog/SeriesPosts/styles.module.css" />

### 1.3. Modifier nos articles {#13-editing-our-articles}

Maintenant, la partie facile : éditez quelques-uns de vos articles existants et ajoutez la clé `series` au YAML front matter. Par exemple :

<Snippet filename="index.md" source="./files/index.txt" defaultOpen={true} />

Faites-le pour quelques articles afin d'avoir plusieurs articles dans cette série.

<AlertBox variant="caution">
Si vous visitez votre blog maintenant et que vous naviguez vers votre article, vous ne verrez aucune différence. C'est parfaitement normal : nous venons juste de créer un composant, il faut encore dire à Docusaurus de l'utiliser.

</AlertBox>

### 1.4. Surcharger le template BlogPostItem {#14-overriding-the-blogpostitem-template}

Nous devons donc appeler notre composant fraîchement créé. Bien sûr, nous pourrions inclure la balise `<SeriesBlogPost>` dans chaque article, mais nous sommes plus malins que ça, non ?

Créons une surcharge du template `BlogPostItem` de Docusaurus.

Dans un terminal, lancez `yarn docusaurus swizzle @docusaurus/theme-classic BlogPostItem`, puis choisissez `Javascript`, `Eject`, et enfin `YES`.

Beaucoup de fichiers seront créés dans le dossier `src/theme/BlogPostItem` de votre projet Docusaurus. Nous pouvons supprimer sans risque tous les fichiers sauf `src/theme/BlogPostItem/index.js`, que nous devons éditer.

Donc, supprimez tous les fichiers ou dossiers sous `src/theme/BlogPostItem` sauf le fichier `index.js`.

Dans le code ci-dessous, les lignes surlignées sont celles que nous devons ajouter.

<Snippet filename="src/theme/BlogPostItem/index.js" source="./files/index.js" />

<AlertBox variant="caution" title="Nous devons redémarrer Docusaurus">
Maintenant, comme nous venons d'introduire une surcharge, nous devons redémarrer notre serveur Docusaurus pour que les changements prennent effet.

</AlertBox>

<AlertBox variant="info" title="Lancez npm run start">
Si vous faites tourner Docusaurus en local, lancez simplement `npm run start` dans votre console.
Si, comme moi, vous faites tourner Docusaurus avec Docker, arrêtez simplement le container et démarrez-en un nouveau.

</AlertBox>

### Voyons si ça fonctionne {#lets-see-if-its-working}

Retournez sur votre blog et rafraîchissez la page. Vous devriez voir la même bannière que celle montrée en haut de cet article (avec votre propre contenu, bien sûr).

Super ! Le composant tourne maintenant.

Nous pouvons créer nos séries. Dans cet exemple, j'ai édité trois articles sur Joomla et ajouté la clé `series` à leur YAML front matter.

Vous pouvez naviguer d'un article à l'autre.

<AlertBox variant="info">
Nous pourrions nous arrêter ici, mais ce serait n'avoir fait que la moitié du chemin. Il nous reste à implémenter une page qui affichera la liste des séries et, quand on clique sur une série, la liste des articles qu'elle contient.

</AlertBox>

## Partie 2 - Ajouter une navigation vers les séries {#part-2---adding-a-navigation-to-series}

Comme annoncé, nous allons créer une page `/series` sur notre blog pour accéder immédiatement à toutes les séries.

<StepsCard
  title="Nous allons donc devoir"
  variant="prerequisites"
  steps={[
    "Créer la page /series",
    "Créer un composant SeriesCards",
    "Créer un composant PostCard",
    "Ajouter une entrée /series à notre barre de navigation et",
    "Créer un plugin pour gérer les URL `/series/a-series-name`."
  ]}
/>

### 2.1 Ajouter une nouvelle page pour afficher toutes les séries {#21-adding-a-new-page-to-show-all-series}

Ce serait chouette d'avoir une page sur notre site Docusaurus pour afficher la liste des séries, non ? Allons-y.

D'abord, créez le fichier `src/pages/series.mdx` avec ce contenu :

<Snippet filename="src/pages/series.mdx" source="src/pages/series.mdx" />

<AlertBox variant="caution">
Comme vous pouvez le voir, cette page contient du contenu Markdown avec une particularité : elle contient du code JavaScript. C'est pourquoi il est très important que l'extension du fichier soit `.mdx`.

</AlertBox>

Comme vous le voyez, il y a du contenu Markdown (adaptez-le à vos besoins) et l'utilisation d'un nouveau composant, `SeriesCards`. Créons-le.

### 2.2 Création du composant SeriesCards {#22-creation-of-the-seriescards-component}

Créez le fichier `src/components/Blog/SeriesCards/index.tsx` avec ce contenu :

<Snippet filename="src/components/Blog/SeriesCards/index.tsx" source="src/components/Blog/SeriesCards/index.tsx" />

Nous avons besoin d'un nouveau helper, `src/components/Blog/utils/series.ts` :

<Snippet filename="src/components/Blog/utils/series.ts" source="src/components/Blog/utils/series.ts" />

En bref, le composant `SeriesCards` est assez simple. Il récupère toutes les séries de vos articles existants, puis les affiche sous forme de cartes. Rien de plus.

### 2.3 Création du composant PostCard {#23-creation-of-the-postcard-component}

Nous avons aussi besoin d'un composant pour afficher un article sous forme de carte. Créez le fichier `src/components/Blog/PostCard/index.tsx` avec ce contenu :

<Snippet filename="src/components/Blog/PostCard/index.tsx" source="src/components/Blog/PostCard/index.tsx" />

Créez également `src/components/Blog/PostCard/styles.module.css` :

<Snippet filename="src/components/Blog/PostCard/styles.module.css" source="src/components/Blog/PostCard/styles.module.css" />

Le composant `PostCard` utilise le [composant Card réutilisable de Docux](/blog/docusaurus-cards#using-the-reusable-card-component-of-docux). Si vous ne l'avez pas encore, créez au moins ces quatre fichiers :

<Snippet filename="src/components/Card/index.tsx" source="src/components/Card/index.tsx" />

<Snippet filename="src/components/Card/styles.module.css" source="src/components/Card/styles.module.css" />

<Snippet filename="src/components/Card/CardBody/index.tsx" source="src/components/Card/CardBody/index.tsx" />

<Snippet filename="src/components/Card/CardImage/index.tsx" source="src/components/Card/CardImage/index.tsx" />

### Tester notre URL /series {#testing-our-series-url}

Tout est maintenant en place pour notre page web `/series`. Nous avons créé `src/pages/series.mdx` et toutes ses dépendances.

Maintenant, accédez simplement à l'URL `/series`. Sur mon localhost, c'est `http://127.0.0.1:3000/series`. Vous devriez obtenir la même page que celle montrée en haut de cet article, sans mise en forme pour l'instant.

Chouette, non ?

### 2.4 Ajouter une entrée pour la page des séries à votre blog {#24-adding-an-entry-for-the-series-page-to-your-blog}

Éditez votre fichier `docusaurus.config.js` et, dans la section `navbar` -> `items`, ajoutez un lien vers `/series` :

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

![Mes séries](./images/my-series.webp)

### 2.5 Gérer l'URL /series/slug {#25-handling-the-seriesslug-url}

Ok, ça fonctionne, mais depuis la page `/series`, si vous cliquez sur une série, vous obtenez cette erreur :

![Page 404 en visitant une série spécifique](./images/page-404.webp)

Nous venons donc de créer la page `/series`. Mais quand votre lecteur clique sur une série pour obtenir la liste des articles, l'URL devient quelque chose comme `/series/the-name-of-the-series`. Il faut donc dire à Docusaurus comment gérer ces nouvelles URL.

Par défaut, Docusaurus ne sait pas quoi en faire.

Pour ça, nous aurons besoin d'un plugin. Créez le fichier `plugins/docusaurus-plugin-series-route/index.cjs` avec ce contenu :

<Snippet filename="plugins/docusaurus-plugin-series-route/index.cjs" source="plugins/docusaurus-plugin-series-route/index.cjs" />

Comme vous le voyez dans le code source du plugin, nous avons besoin d'un nouveau composant : `src/components/Blog/Series/SeriesArticlesPage.tsx`. Créons-le :

<Snippet filename="src/components/Blog/Series/SeriesArticlesPage.tsx" source="src/components/Blog/Series/SeriesArticlesPage.tsx" />

Et nous devons charger ce plugin, il faut donc mettre à jour à nouveau le fichier `docusaurus.config.js` :

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.part2.js" />

<AlertBox variant="danger">
La propriété `onBrokenLinks` doit être mise à `ignore` car Docusaurus ne charge pas les plugins de routage pendant le rendu de la version statique du site. Il ne comprendra donc pas les URL `/series/xxx` et les considérera comme cassées.

</AlertBox>

Pour la dernière fois, redémarrez votre serveur Docusaurus.

Maintenant, dans votre menu principal, vous devriez avoir votre entrée `Series`. En cliquant dessus, vous obtenez la liste des séries. En cliquant sur une série, vous obtenez une nouvelle page avec la liste des articles de cette série. Cliquez sur un article pour y accéder.

![Affichage d'une série spécifique](./images/a-series.webp)

## Partie 3 - Ajouter un fichier /src/data/series.js pour la personnalisation {#part-3---adding-a-srcdataseriesjs-file-for-customization}

Le composant fonctionne bien pour l'instant, mais il nous manque deux fonctionnalités importantes :

1.  La possibilité d'écrire une description pour la série.
2.  La possibilité d'utiliser une image personnalisée.

Créons un nouveau fichier appelé `/src/data/series.js` avec un contenu comme celui-ci :

<Snippet filename="/src/data/series.js" source="./files/series.js" />

Vous devez respecter une règle importante : la valeur que vous indiquez dans la clé `name` doit correspondre à la valeur de votre `series` telle qu'indiquée dans votre YAML front matter.

Par exemple, pour cet article, ma clé YAML est `series: Creating Docusaurus components`, je dois donc la retrouver dans mon `/src/data/series.js`.

Le composant pourra alors trouver la `description` et l'`image` à utiliser.

Maintenant, votre page Series ressemblera à ceci :

![La page des séries avec une description](./images/with-description.webp)

## Conclusion {#conclusion}

C'était clairement compliqué. Beaucoup de fichiers à créer, d'autres à mettre à jour, et quelques éléments de configuration à ajuster, mais le résultat ne valait-il pas le coup ?

Vous avez maintenant un blog où vous pouvez écrire des articles « piliers » avec un contenu si dense que vous pouvez facilement le découper en plusieurs parties et le proposer à vos lecteurs sous forme de série.

Vos lecteurs seront guidés pas à pas, ce qui leur permettra de mieux comprendre les différentes étapes à suivre. Côté SEO, vous gagnerez en visibilité grâce à ces articles « piliers », entre autres, mais aussi parce que vous améliorerez la structure de navigation de vos pages. Les moteurs de recherche apprécient beaucoup ça.
