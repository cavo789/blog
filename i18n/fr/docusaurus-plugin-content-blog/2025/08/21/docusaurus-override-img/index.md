---
slug: docusaurus-override-img
title: Modifier la façon dont Docusaurus génère les balises img
date: 2025-08-21
description: Personnalisez la manière dont Docusaurus génère les balises <img> pour mieux contrôler le rendu et le comportement des images.
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
review_date: 2026-07-30
blueskyRecordKey: 3lww5fbh2y22q
---
<!-- cspell:ignore toggleable,unshift -->

![Modifier la façon dont Docusaurus génère les balises img](/img/v2/docusaurus_component.webp)

<TLDR>
Cet article explique comment personnaliser le rendu des images dans Docusaurus en créant un composant React `<Image>` sur mesure. Vous allez apprendre à construire le composant, à le styler en CSS, puis à utiliser un plugin Remark personnalisé pour remplacer automatiquement les images Markdown standard par votre nouveau composant. Le guide couvre aussi la configuration du plugin pour ignorer la première image d'un article et son enregistrement dans la configuration de Docusaurus, ce qui vous donne un contrôle total sur l'affichage de vos images.
</TLDR>

Je démarre une série sur l'écriture de composants pour Docusaurus.

Comme c'est toujours plus sympa de commencer par quelque chose de très concret et pratique, voici ce que nous allons faire : nous allons intercepter la conversion de `![Alt text](./img/example.webp)` vers une balise HTML `<img>`. Nous allons forcer Docusaurus à utiliser à la place notre propre composant `<Image>`.

Nous allons personnaliser notre balise `<Image>` pour d'abord injecter un `<div>` parent, puis forcer notre `<img>` avec des attributs comme le CSS, le lazy loading, ... **mais pas pour toutes les balises de l'article, puisque nous allons ignorer la première.**

En effet, l'image d'introduction de l'article doit rester inchangée ; nous commencerons à modifier les autres images.

<!-- truncate -->

Et voici le résultat de notre composant `<Image>` fait main :

<Image src={require("./images/happy.webp").default} title="Un suricate heureux" />

Comme vous le voyez, l'image est centrée, elle a un effet au survol, des coins arrondis, ... Si vous regardez le code HTML, vous verrez l'attribut `loading="lazy"`.

C'est plutôt chouette : notre composant fonctionne ! Construisons-le.

Il y a plusieurs choses à faire, alors commençons par la première : créer notre composant `<Image>`.

## 1. Création de notre composant Image {#1-creation-of-our-image-component}

Écrire un composant pour Docusaurus est assez simple. Il faut créer un nouveau dossier dans le dossier existant `src/components`.

Dans cet article, nous allons créer un composant `Image` ; créons donc le fichier `src/components/Image/index.tsx` avec ce contenu :

<Snippet filename="src/components/Image/index.tsx" source="./files/index.tsx" />

Notre composant `Image` attend trois paramètres, mais seul `img` est obligatoire. On peut aussi passer un titre (`title`) et le texte alternatif (`alt`).

Comme vous le comprenez facilement, le composant `<Image>` va simplement créer un `div` contenant une balise `img`.

Rien d'extraordinaire, sauf que nous utiliserons un peu de CSS pour le look & feel et que nous forcerons le <Link to="/blog/docusaurus-lazy-loading">lazy loading</Link>.

Créez également le fichier `src/components/Image/styles.module.css` :

<Snippet filename="src/components/Image/styles.module.css" source="./files/styles.module.css" />

## 2. Informer Docusaurus de l'existence de notre composant {#2-tell-docusaurus-about-our-component}

Avant de pouvoir utiliser le composant `<Image>`, il faut dire à Docusaurus quoi faire quand il le rencontrera.

Éditez le fichier `src/theme/MDXComponents.js` (et s'il n'existe pas, créez-le)

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" />

Tout est maintenant en place.

## 3. Utiliser le composant Image {#3-using-the-image-component}

Dès maintenant, dans un article de blog, au lieu d'écrire

```html
![A happy meerkat](./images/happy.webp)
```

nous pouvons écrire

```html
<Image src={require("./images/happy.webp").default} title="A happy meerkat" />
```

La partie `require` est nécessaire parce que l'image se trouve dans un sous-dossier de l'article. C'est exactement la balise rendue en haut de cet article.

Si la source était quelque chose comme `/img/happy.jpg`, le code est plus simple :

```html
<Image src="/img/happy.jpg" title="A happy meerkat" />
```

<AlertBox variant="caution">
Mais, oh oh, sur ce blog, j'ai plus de 250 articles à l'heure actuelle (août 2025) ; je ne vais quand même pas parcourir tous mes articles pour remplacer mes images, si ?

Et puis, peut-être que demain je ne voudrai plus de cette balise ; je veux donc garder mes articles en **Markdown vanilla** (le langage standard). Comment faire ? La réponse : écrire un plugin (j'ai utilisé exactement la même astuce pour mon <Link to="/blog/docusaurus-plugin-replace">plugin de recherche & remplacement</Link>).

</AlertBox>

Le plugin va pouvoir intercepter le code Markdown de l'article et le manipuler. C'est exactement ce que nous voulons ici !

Nous allons intercepter la conversion des images de Markdown vers HTML et dire à Docusaurus d'utiliser notre balise Image au lieu de img.

## 4. Écrire et enregistrer un plugin (optionnel — seulement si vous avez des centaines d'articles comme moi) {#4-writing-and-registering-a-plugin-optional--only-if-you-have-hundreds-of-articles-like-me}

Si vous n'avez qu'une poignée d'articles, il est plus simple de les éditer à la main et de sauter cette section. Nous avons donc besoin d'un plugin pour intercepter la conversion de `![Alt text](./img/example.webp)` vers une balise image HTML ; automatiquement.

<AlertBox variant="caution">
Ajoutons une complexité : nous ne voulons pas modifier la première image, c'est-à-dire l'image d'introduction de l'article. Pour cette première image, laissons Docusaurus faire son travail (il le fait très bien). Nous intercepterons à partir de la deuxième image de l'article.

</AlertBox>

Créez le fichier `plugins/remark-image-transformer/index.cjs` :

<Snippet filename="plugins/remark-image-transformer/index.cjs" source="./files/index.cjs" />

*Ce plugin est plus complexe parce qu'il faut s'assurer que les chemins vers les images sont correctement gérés (on utilise des chemins relatifs comme `![Example image](./img/example.webp)`, ou absolus (`![Example image](/img/example.webp)`), ou même externes).*

Une fois le plugin créé, il faut mettre à jour la configuration de Docusaurus pour le charger.

Pour cela, éditez votre fichier `docusaurus.config.js` et ajoutez les lignes mises en évidence comme illustré ci-dessous.

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

Redémarrez maintenant votre serveur Docusaurus (pour que le plugin soit enregistré).

Si tout est correctement en place, ouvrez n'importe lequel de vos anciens articles et vous verrez que ça fonctionne.

## Conclusion {#conclusion}

À vous maintenant d'éditer le fichier `src/components/Image/styles.module.css` et d'utiliser votre propre CSS.

Et une fois que chaque image passe par votre propre composant, il devient facile de les auditer : voyez <Link to="/blog/docusaurus-check-images">Running some checks on your Docusaurus images</Link>.
