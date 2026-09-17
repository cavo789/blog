---
slug: docusaurus-go-top
title: Ajouter un bouton « retour en haut » dans les articles Docusaurus
date: 2025-09-12
description: Découvrez comment ajouter facilement un bouton « retour en haut », souvent accompagné d'une icône animée amusante, à vos articles de blog Docusaurus grâce à un composant React personnalisé et une surcharge de thème.
authors: [christophe]
image: /img/v2/go_top_banner.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lynkx4gkjk2c
---
<!-- cspell:ignore  -->

![Ajouter un bouton « retour en haut » dans les articles Docusaurus](/img/v2/go_top_banner.webp)

<TLDR>
Cet article est un tutoriel rapide pour ajouter un bouton « retour en haut » à votre blog Docusaurus. Il vous guide dans l'implémentation d'un composant React personnalisé `<ScrollToTopButton>`, avec son CSS pour la mise en forme. Vous apprendrez à surcharger le composant de thème `BlogPostItem` par défaut afin d'injecter automatiquement le bouton au bas de chaque article. Le guide donne aussi des astuces pour ajouter le bouton à d'autres parties de votre site, comme l'archive du blog ou vos pages personnalisées.
</TLDR>

Sur smartphone plus encore que sur ordinateur, c'est bien pratique d'avoir un bouton *Retour en haut de page* pour éviter de se luxer le pouce.

<img alt="Docux" src="/img/docux.webp" style={{border: "none", borderRadius: 0, height: "1.2em", verticalAlign: "middle", margin: "0 0.2em"}} /> <Link to="https://github.com/Juniors017">Docux</Link>, un ami, a récemment développé cette fonctionnalité et j'ai été ravi de l'ajouter, d'autant qu'elle est terriblement simple à utiliser et apporte un côté fun ; c'est sympa.

Faites simplement défiler n'importe quelle page de ce blog pour voir un petit suricate apparaître en bas à droite. Cliquez dessus et prenez l'ascenseur jusqu'en haut de la page.

<!-- truncate -->

## À quoi ça ressemble {#what-it-looks-like}

Voici cette page même, après défilement. Le suricate se tient en bas à droite, flottant au-dessus de votre contenu :

<BrowserWindow url="https://www.avonture.be/blog/docusaurus-go-top">
![Le bouton retour en haut avec le suricate, en bas à droite, sur un article défilé](./images/go_top_button.webp)
</BrowserWindow>

De plus près, c'est un bouton rond qui contient l'icône que vous lui donnez :

![Gros plan du bouton rond de retour en haut affichant l'icône du suricate](./images/go_top_button_zoom.webp)

Le bouton reste masqué tant que vous n'avez pas défilé de plus de 300 pixels ; une page courte ne l'affiche donc jamais. Deux fichiers et une surcharge, c'est ci-dessous.

## Comment ça fonctionne {#how-it-works}

Docux a créé un [composant Docusaurus ScrollToTopButton](https://github.com/Juniors017/docux-blog/tree/main/src/components/ScrollToTopButton), c'est-à-dire un bout de Javascript avec du css ; rien de plus.

Créez les deux fichiers ci-dessous dans l'arborescence de votre blog :

<Snippet filename="src/components/ScrollToTopButton/index.tsx" source="src/components/ScrollToTopButton/index.tsx" />

<Snippet filename="src/components/ScrollToTopButton/styles.module.css" source="src/components/ScrollToTopButton/styles.module.css" />

Ensuite, vous devez injecter `<ScrollToTopButton />` dans vos pages. *Cette injection se fait en swizzlant `BlogPostItem`, exactement comme dans <Link to="/blog/docusaurus-relatedposts">Displaying related posts below our Docusaurus article</Link> et <Link to="/blog/docusaurus-reactions">Adding Reader Reactions to Your Docusaurus Blog</Link> ; si vous avez déjà fait l'un des deux, vous avez déjà le fichier.*

<AlertBox variant="info">
Le composant importe son icône dès les premières lignes : `import buttontop from "@site/static/img/meerkat/suricate_no_background.webp"`. Faites pointer cet import vers votre propre image carrée dans `/static` et c'est réglé.

</AlertBox>

## Surcharger la page BlogPostItem {#overriding-the-blogpostitem-page}

Suivez le chapitre « <Link to="/blog/docusaurus-bluesky-share/#we-need-to-override-how-the-article-is-rendered-by-docusaurus">Nous devons surcharger la façon dont Docusaurus rend l'article</Link> » d'un article précédent.

Vous devez créer le fichier `src/theme/BlogPostItem/index.js`.

Si vous ne voulez pas les détails, ne lisez pas ce chapitre et créez simplement ce fichier :

<Snippet filename="src/theme/BlogPostItem/index.js" source="./files/index.js" />

Une fois que vous l'avez, éditez-le car nous devons y injecter le code `<ScrollToTopButton />`.

Ci-dessous, voyez les deux lignes surlignées à ajouter :

<Snippet filename="src/theme/BlogPostItem/index.js" source="./files/index.part2.js" />

<AlertBox variant="caution" title="Nous devons redémarrer Docusaurus">
Comme nous venons d'introduire une surcharge, nous devons redémarrer notre serveur Docusaurus pour que les changements soient pris en compte.

</AlertBox>

<AlertBox variant="info" title="Lancez npm run start">
Si vous lancez Docusaurus en local, exécutez simplement `npm run start` dans votre console.
Si, comme moi, vous lancez Docusaurus via Docker, tuez le container et démarrez-en un nouveau.

</AlertBox>

## Vous pouvez bien sûr le faire pour d'autres pages {#you-can-do-this-for-other-pages-for-sure}

Sur mon site, j'ai une page `archive`. Vous voulez y utiliser le bouton `<ScrollToTopButton />` aussi ? Swizzlez simplement la page en exécutant `yarn docusaurus swizzle @docusaurus/theme-classic BlogArchivePage` dans une console, puis mettez à jour le fichier `index.js` comme illustré ci-dessus.

Si vous avez d'autres pages dans votre dossier `src/pages/` (comme `about.mdx`, `index.mdx`, ...), pas besoin de swizzler d'abord : ajoutez directement les deux lignes dans ces fichiers aussi.

## Conclusion {#conclusion}

Fini les pouces luxés : un petit composant, un `BlogPostItem` swizzlé, et chaque article long de votre site obtient un chemin de retour vers le haut. Le plus amusant, c'est que l'icône est la vôtre ; la mienne fait signe aux lecteurs qui descendent trop loin.

Si vous constituez votre collection de composants Docusaurus, le prochain à ajouter est <Link to="/blog/docusaurus-relatedposts">les articles liés sous chaque article</Link>, qui réutilise exactement le même fichier de surcharge.
