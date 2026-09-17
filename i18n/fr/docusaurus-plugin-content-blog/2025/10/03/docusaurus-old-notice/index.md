---
slug: docusaurus-old-notice
title: Un composant Docusaurus qui prévient le lecteur que l'article a plus d'un an
date: 2025-10-03
description: Affiche une bannière d'avertissement quand le contenu de la page a plus d'un an
authors: [christophe]
image: /img/v2/old_blog_notice.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
language: fr
blueskyRecordKey: 3m2bjrehbnc2r
updates:
  - date: 2026-01-04
    note: the component will first check the last update date/time (`last_update` field in the front matter) before the creation date (`date` field)
  - date: 2026-07-30
    note: added `review_date` front matter support — a recent review date swaps the warning for a green "still accurate" banner; if the review date is itself over a year old, the standard warning reappears
---
<!-- cspell:ignore  -->

![Un composant Docusaurus qui prévient le lecteur que l'article a plus d'un an](/img/v2/old_blog_notice.webp)

<TLDR>
Cet article montre comment créer un composant Docusaurus qui prévient le lecteur quand un billet de blog a plus d'un an. Il s'agit de construire un composant React et de « swizzler » le template `BlogPostPage` pour y injecter cet avis. Le composant détermine l'âge d'un article en regardant son champ `last_update` ou `date` dans le front matter.
</TLDR>


Dans cet article, voyons comment afficher un petit cadre « Attention : cet article a au moins un an, ce qui, en années tech, relève quasiment de la préhistoire. »

Nous allons créer un composant React pour Docusaurus et l'injecter dans la page de nos billets de blog : une fois en place, tout fonctionnera comme par magie.

<!-- truncate -->

Le voici en action, sur un vieux billet de ce blog :

<BrowserWindow url="https://www.avonture.be/blog/joomla-show-table">
  <img
    alt="Old post notice in action"
    src={require("./images/old_notice.webp").default}
  />
</BrowserWindow>

C'est parti.

## Créer le composant {#create-the-component}

Vous devez créer deux nouveaux fichiers dans votre propre site Docusaurus :

<ProjectSetup folderName="/your_docusaurus_site" createFolder={false}>
  <Snippet filename="src/components/Blog/OldPostNotice/index.tsx" source="src/components/Blog/OldPostNotice/index.tsx" />
  <Snippet filename="src/components/Blog/OldPostNotice/styles.module.css" source="src/components/Blog/OldPostNotice/styles.module.css" />
</ProjectSetup>

## Surcharger le template BlogPostPage {#override-blogpostpage-template}

Côté Docusaurus, nous devons **swizzler** la page responsable du rendu d'un billet. Cette page s'appelle `BlogPostPage`.

Pour cela, ouvrez une console et lancez `yarn swizzle @docusaurus/theme-classic BlogPostItem/Content`.

Dès maintenant, vous avez un nouveau fichier sur votre disque : `src/theme/BlogPostItem/Content/index.js`

<AlertBox variant="note" title="Vous avez peut-être déjà ce fichier">
<Link to="/blog/docusaurus-changelog">Showing the changelog of your post</Link> swizzle exactement le même fichier. Si vous avez suivi cet article, ajoutez simplement le nouveau composant à côté de l'existant au lieu de swizzler à nouveau.
</AlertBox>

Ci-dessous, le contenu original du fichier (Docusaurus v3.8.1) :

<Snippet filename="src/theme/BlogPostItem/Content/index.js" source="./files/index.js" />

Pour injecter notre nouveau composant `OldPostNotice`, éditez le fichier comme ceci (voir les lignes surlignées) :

<Snippet filename="src/theme/BlogPostItem/Content/index.js" source="./files/index.part2.js" />

Sauvez le fichier et rafraîchissez votre blog. Vous devriez obtenir la même bannière que celle montrée en début d'article.

<AlertBox variant="info">
Le composant utilise le champ `date` que vous devez mentionner dans votre front matter YAML.

Donc, dans chacun de vos billets `.md`, vous devez avoir un bloc YAML comme celui-ci :

```yaml
---
title: Your blog post article
authors: [you]
date: 2025-09-30
---
```


</AlertBox>

## Marquer un billet relu {#marking-a-reviewed-post}

Si vous revenez sur un vieil article et confirmez que le contenu est toujours exact, vous pouvez ajouter un champ `review_date` dans le front matter :

```yaml
---
date: 2023-05-10
review_date: 2026-07-30
---
```

Quand `review_date` est présent **et date de moins d'un an**, le composant remplace l'avertissement orange par une bannière verte de confirmation :

> ✅ Cet article a plus d'un an mais a été relu le 30 juillet 2026 — le contenu est toujours exact.

Si `review_date` a lui-même plus d'un an, l'avertissement standard réapparaît — parce qu'une relecture périmée ne vaut pas mieux que pas de relecture du tout.

## Position de l'avertissement {#position-of-the-warning}

L'avis sera placé avant le contenu du billet. Sur mon blog, j'ai manipulé le code ci-dessous pour extraire la toute première image (c'est-à-dire la bannière) afin de l'afficher en premier, puis l'avis, puis le reste de l'article. Mais c'est sans doute trop complexe pour l'instant. Nous verrons ça dans un prochain article.

*L'image de bannière est traitée différemment des autres pour exactement la même raison que dans <Link to="/blog/docusaurus-override-img">Change how Docusaurus will create img tags</Link> : la première image d'un billet est spéciale et doit être laissée telle quelle.*

```jsx
<div
  // This ID is used for the feed generation to locate the main content
  id={isBlogPostPage ? blogPostContainerID : undefined}
  className={clsx('markdown', className)}>
  <MDXContent>{children}</MDXContent>
</div>
```
