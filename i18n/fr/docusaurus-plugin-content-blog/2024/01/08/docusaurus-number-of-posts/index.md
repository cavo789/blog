---
slug: docusaurus-number-of-posts
title: Obtenir le nombre d'articles publiés
date: 2024-01-08
description: Découvrez la méthode simple et rapide pour afficher le nombre total d'articles publiés sur votre site Docusaurus à l'aide de composants personnalisés et de l'API du thème.
authors: [christophe]
image: /img/v2/docusaurus_tips.webp
series: Discovering Docusaurus
mainTag: docusaurus
tags:
  - docusaurus
  - markdown
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore autoriser,collage -->
![Obtenir le nombre d'articles publiés](/img/v2/docusaurus_tips.webp)

<TLDR>
Cet article montre une astuce rapide pour compter les articles publiés sur un blog Docusaurus : ouvrez la page `/blog/archive/` générée automatiquement, ouvrez la console de développement du navigateur et lancez une instruction `document.querySelectorAll` sur la liste des articles pour obtenir le total.
</TLDR>

Docusaurus ne proposait pas de moyen simple de récupérer le nombre d'articles du blog, mais il existe une astuce.

*Si vous avez besoin de ce compteur **dans** votre site plutôt qu'une seule fois dans une console, le helper construit dans <Link to="/blog/docusaurus-relatedposts">Displaying related posts below our Docusaurus article</Link> analyse déjà le front matter de chaque article et peut être réutilisé pour ça.*

Il existe une page automatique appelée `archive`, comme <Link to="/blog/archive/">/blog/archive/</Link>.

Sur cette page, tous les articles du blog sont affichés par année et par mois. Avec une instruction `document.querySelectorAll` dans la console, il est possible de faire le compte, comme suggéré sur [https://github.com/facebook/docusaurus/discussions/9712](https://github.com/facebook/docusaurus/discussions/9712)

<!-- truncate -->

![La page archive](./images/archive.webp)

Une fois la page archive affichée, appuyez sur <kbd>F12</kbd> pour lancer la **console de développement**.

Cliquez sur l'onglet `Console` puis, dans la partie inférieure droite, copiez/collez l'instruction ci-dessous.

```js
document.querySelectorAll("#__docusaurus_skipToContent_fallback > main > section > div > div > div > ul > li")
```

La première fois, la console vous préviendra que vous devez autoriser le collage (en français *autoriser le collage*). Tapez `allow paste` pour confirmer.

Puis copiez/collez à nouveau.

L'instruction `document.querySelectorAll` va récupérer chaque puce, c'est-à-dire la liste des articles. Vous verrez immédiatement le nombre, dans mon cas, comme illustré ci-dessous, `51` :

![Console](./images/console.webp)
