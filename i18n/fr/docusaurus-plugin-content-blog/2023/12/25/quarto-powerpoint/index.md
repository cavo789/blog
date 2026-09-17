---
slug: quarto-powerpoint
title: Utiliser Quarto pour créer un diaporama PowerPoint
date: 2023-12-25
description: Découvrez comment convertir votre documentation Markdown en diaporama PowerPoint (.pptx) ou en présentation reveal.js en ligne avec Quarto.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - markdown
  - quarto
language: fr
review_date: 2026-07-30
---
![Utiliser Quarto pour créer un diaporama PowerPoint](/img/v2/quarto.webp)

<TLDR>
Cet article montre comment convertir un fichier Markdown en présentation PowerPoint `.pptx` avec `quarto render slides.md --to pptx` : les titres de niveau 2 deviennent des titres de slide et une ligne `---` démarre une nouvelle section. Et la même source peut aussi être rendue en diaporama reveal.js en ligne avec `--to revealjs`.
</TLDR>

Quarto peut convertir un fichier markdown en <Link to="/blog/quarto-revealjs-tips">un diaporama HTML revealjs</Link> mais peut aussi créer un fichier `pptx` que vous pouvez ouvrir et lancer dans Microsoft PowerPoint.

Dans cet article, nous allons créer un fichier `pptx` à partir de notre documentation markdown.

<!-- truncate -->

## Du Markdown vers PowerPoint en une commande {#from-markdown-to-powerpoint-in-one-command}

Prenez un simple fichier Markdown nommé `slides.md` et lancez :

<Terminal typewriter>
$ quarto render slides.md --to pptx
</Terminal>

Ouvrez le `.pptx` obtenu, et voici votre première slide :

![PowerPoint - Slide 1](./images/pptx_slide_1.webp)

La règle mérite d'être retenue parce qu'elle résume toute la syntaxe : **chaque titre `##` devient un titre de slide, et une ligne `---` démarre une nouvelle slide**. La structure de votre document *est* la structure de votre diaporama.

## Le fichier source {#the-source-file}

Voici le `slides.md` qui a produit la présentation — le contenu est du remplissage, c'est la structure qui compte :

<Snippet filename="slides.md">

```markdown
---
title: "My thesis in Latin"
---

## Chapter 1
<!-- cspell:disable -->
Voluptatem minus labore architecto sed voluptas molestiae perferendis.

Expedita magni facere. Ullam non non sint qui provident.

## Chapter 2

Iure repudiandae perferendis maiores dolorem consequuntur exercitationem suscipit.

---

### Chapter 2.1

Quis voluptate est quis in ea veniam qui incididunt ad cillum nostrud.

```

</Snippet>

Et les trois slides restantes qu'il génère :

![PowerPoint - Slide 2](./images/pptx_slide_2.webp)

![PowerPoint - Slide 3](./images/pptx_slide_3.webp)

![PowerPoint - Slide 4](./images/pptx_slide_4.webp)

Vous trouverez beaucoup d'astuces sur la [page de documentation officielle](https://quarto.org/docs/presentations/powerpoint.html).

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

## Conclusion {#conclusion}

Ce qui est agréable ici, ce n'est pas que Quarto produise des fichiers PowerPoint — c'est que votre documentation et votre diaporama deviennent le même fichier. Mettez un chapitre à jour, relancez le rendu, et la présentation est à jour. Pas de copier/coller dans un éditeur de slides, pas deux versions du même contenu qui divergent.

Et ce même `slides.md` peut devenir un diaporama en ligne : lancez `quarto render slides.md --to revealjs` à la place, mettez le résultat sur un serveur web, et tout le monde peut consulter votre travail depuis un navigateur. Voyez <Link to="/blog/quarto-revealjs-tips">Quarto - revealjs tips</Link> pour découvrir ce que vous pouvez en faire.
