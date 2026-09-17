---
slug: docusaurus-relatedposts
title: Afficher les articles liés sous nos articles Docusaurus
date: 2025-09-03
description: Améliorez votre blog Docusaurus en affichant les articles liés sous chaque article pour faciliter la découverte de contenu.
authors: [christophe]
image: /img/v2/docusaurus_react.webp
series: Display Docusaurus Blog Posts as Cards - A Step-by-Step Guide
mainTag: component
tags:
  - component
  - docusaurus
  - markdown
  - react
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lxvwdh3szc22
---
<!-- cspell:ignore relatedposts -->

![Afficher les articles liés sous nos articles Docusaurus](/img/v2/docusaurus_react.webp)

<TLDR>
Ce guide explique comment ajouter une section « Articles liés » sous vos articles de blog Docusaurus. Vous allez apprendre à créer un composant React `<RelatedPosts>` personnalisé qui affiche une liste d'articles partageant le même tag principal (`mainTag`). La démarche consiste à construire un composant `<Card>` réutilisable, à créer un script utilitaire pour récupérer et parser les données des articles, et enfin à surcharger le thème `BlogPostItem` de Docusaurus pour injecter votre nouveau composant en bas de chaque article.
</TLDR>

Docusaurus peut afficher une liste de tags, mais pas d'articles liés. *Ce `mainTag` n'est utile que si vos tags sont cohérents ; <Link to="/blog/docusaurus-tags">Tags management in Docusaurus</Link> présente le script de nettoyage que j'utilise pour qu'ils le restent.*

Quand vous parcourez mon blog, vous voyez une liste d'**articles liés** sous chaque article. C'est un composant que j'ai codé avec l'aide de l'IA. *Pour les articles qui suivent un ordre de lecture voulu plutôt qu'un tag commun, voyez <Link to="/blog/docusaurus-series">Organize Your Docusaurus Content with a Custom Series Component</Link>.*

L'objectif de notre composant est d'afficher quelque chose comme ceci :

![Articles de blog liés](./images/related.webp)

<!-- truncate -->

Voici le résultat final une fois le tout branché : jusqu'à six cartes, choisies parmi les articles partageant le même `mainTag`.

![Le résultat final](./images/final.webp)

## Pourquoi ça fonctionne {#why-it-works}

- La correspondance se fait sur `mainTag`, un seul champ de front matter personnalisé — pas de sélection manuelle, pas de pondération de mots-clés, juste « même sujet principal ».
- Le composant `<RelatedPosts>` réutilise le même `<Card>` que vous construiriez pour n'importe quelle liste d'articles, donc il n'y a qu'une seule mise en page de carte à maintenir sur tout le site.
- C'est une surcharge de thème, pas un fork : `BlogPostItem` affiche toujours tout ce que Docusaurus fait normalement, on injecte simplement un composant en plus tout en bas.

## Il nous faut un composant Card {#we-need-a-card-component}

Suivez les instructions du chapitre [Utiliser le composant Card réutilisable de Docux](/blog/docusaurus-cards#using-the-reusable-card-component-of-docux).

Vous devrez créer jusqu'à cinq fichiers dans un dossier `src/components/Card/` (et ses sous-dossiers).

Revenez à cet article une fois les cinq fichiers créés.

## Il nous faut un moyen d'extraire les informations des articles {#we-need-a-way-to-extract-information-from-blog-posts}

Si ce n'est pas déjà fait, créez le fichier `src/components/Blog/utils/posts.ts`. Il contiendra une fonction utilitaire réutilisable par plusieurs composants.

Cette fonction va scanner chaque fichier Markdown avec une extension `.md` ou `.mdx` dans le sous-dossier `blog`.

Pour chaque fichier, le script va regarder le front matter YAML et utiliser certaines de ses propriétés. Par exemple :

-   Si l'article a `draft: true` ou `unlisted: true`, il sera ignoré.
-   Si l'article a un `slug`, il sera utilisé. Sinon, le slug sera généré par le code.
-   Si l'article a une image associée, elle sera utilisée. Sinon, une image par défaut sera utilisée.
-   Ensuite, la fonction retournera la liste des articles et leurs propriétés.

Certaines propriétés, comme `mainTag`, sont personnalisées.

Copiez-collez donc le contenu du fichier ci-dessous et créez le fichier `src/components/Blog/utils/posts.ts` dans la structure de votre projet.

<Snippet filename="src/components/Blog/utils/posts.ts" source="src/components/Blog/utils/posts.ts" />

## Notre composant RelatedPosts {#our-relatedposts-component}

Créez maintenant le fichier `src/components/Blog/RelatedPosts/index.tsx` :

<Snippet filename="src/components/Blog/RelatedPosts/index.tsx" source="src/components/Blog/RelatedPosts/index.tsx" />

## Surcharger le template BlogPostItem {#overriding-the-blogpostitem-template}

Nous devons maintenant surcharger le template **BlogPostItem** de Docusaurus pour pouvoir injecter notre composant `<RelatedPosts>` en bas de chaque article.

Dans un terminal, lancez `yarn docusaurus swizzle @docusaurus/theme-classic BlogPostItem`, puis sélectionnez `Javascript`, ensuite `Eject`, et enfin `YES`.

Beaucoup de fichiers seront créés dans le dossier `src/theme/BlogPostItem` de votre projet Docusaurus. On peut supprimer sans risque tous les fichiers sauf `src/theme/BlogPostItem/index.js`, que nous devons éditer.

Supprimez donc tous les fichiers et dossiers sous `src/theme/BlogPostItem` à l'exception du fichier `index.js`.

Dans le code ci-dessous, les lignes surlignées sont celles que nous devons ajouter.

<Snippet filename="src/theme/BlogPostItem/index.js" source="./files/index.js" />

Maintenant, comme nous venons d'introduire une surcharge, nous devons redémarrer notre serveur Docusaurus pour que les changements prennent effet.

<AlertBox variant="info" title="Lancez npm run start">
Si vous faites tourner Docusaurus en local, lancez simplement `npm run start` dans votre console.
Si, comme moi, vous faites tourner Docusaurus avec Docker, arrêtez le container et démarrez-en un nouveau.

</AlertBox>

## Éditer nos articles de blog {#editing-our-blog-posts}

Nous avons fait toute la configuration nécessaire, mais quand vous visitez votre blog, vous ne voyez rien qui ressemble à « Articles liés ». Pourquoi ?

Par exemple, dans l'image ci-dessous, on ne voit aucune carte.

![Il n'y a aucun article lié, pourquoi ?](./images/no_related_articles.webp)

<StepsCard
  title="C'est parce qu'il nous faut deux choses :"
  variant="prerequisites"
  steps={[
    "1. Votre article doit avoir un `mainTag` et ",
    "2. Les articles de votre blog doivent avoir un tableau `tags`"
  ]}
/>

Regardez l'exemple ci-dessous :

<Snippet filename="post.md" source="./files/post.txt" defaultOpen={true} />

L'article doit avoir un élément `mainTag`, associé au tag le plus important pour cet article. Disons `docusaurus`.

Ensuite, tous les articles de votre blog doivent avoir le tableau `tags` standard, dans lequel vous pouvez lister plusieurs tags.

Le composant `RelatedPosts` va alors chercher `docusaurus` dans vos articles et afficher jusqu'à six cartes — le résultat déjà montré en haut de cet article.

## Conclusion {#conclusion}

Un champ `mainTag`, une fonction utilitaire `posts.ts`, un `<Card>` que vous avez probablement déjà, et une surcharge de thème : voilà toute la recette d'un bloc « Articles liés » qui ne demande aucune sélection manuelle. Voyez <Link to="/blog/docusaurus-series">Organize Your Docusaurus Content with a Custom Series Component</Link> pour les articles qui suivent un ordre de lecture voulu plutôt qu'un tag commun, et <Link to="/blog/docusaurus-tags">Tags management in Docusaurus</Link> pour garder vos `mainTag`/`tags` cohérents sur tout le blog.
