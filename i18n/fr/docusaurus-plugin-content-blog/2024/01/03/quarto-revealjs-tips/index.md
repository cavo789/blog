---
slug: quarto-revealjs-tips
title: Quelques astuces pour Quarto lors du rendu en diaporama reveal.js
date: 2024-01-03
description: "Améliorez vos présentations Quarto ! Découvrez les astuces essentielles pour produire de superbes diaporamas reveal.js : slides de titre personnalisées, positionnement du logo, personnalisation CSS/JS et mises en page avancées."
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
![Quelques astuces pour Quarto lors du rendu en diaporama reveal.js](/img/v2/quarto.webp)

<TLDR>
Cet article est un pot-pourri d'astuces Quarto pour reveal.js : slides de titre, positionnement personnalisé du logo avec CSS/JS, images de fond et leur comportement `background-size`, contrôle du `slide-level`, emoji, classes `r-fit-text` et `r-stretch`, apparitions basées sur les fragments, mises en page en colonnes et en quadrants, short codes personnalisés, CSS inline et externe, masquage des légendes d'images, style des callouts, navigation verticale/en grille, slugs de slides personnalisés, numéros de slides et notes du présentateur.
</TLDR>

La [documentation reveal.js de Quarto](https://quarto.org/docs/reference/formats/presentations/revealjs.html) est le meilleur endroit pour trouver les instructions permettant de créer des présentations reveal.js impeccables.

Dans cet article, nous allons passer rapidement en revue quelques astuces pour rendre vos présentations reveal.js encore meilleures.

*Pour le workflow complet — écrire, prévisualiser et exporter un diaporama reveal.js en HTML et en PDF depuis un devcontainer — voir <Link to="/blog/running-revealjs-with-docker">Level Up Your Presentations with Quarto, reveal.js, Decktape, Docker and DevContainers</Link>.*

<!-- truncate -->

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

## Travailler avec les slides {#working-with-slides}

### Créer une slide de titre {#create-a-title-slide}

La [slide de titre](https://quarto.org/docs/presentations/revealjs/advanced.html#title-slide) est la première de votre présentation. Vous pouvez ajouter une telle slide avec quelques lignes de yaml :

<Snippet filename="slides.md" source="./files/slides_1.txt" />

Le diaporama comportera quatre slides, la première sera la title-slide.

![Slide de titre](./images/title-slide.webp)

### Afficher un logo en haut à gauche sur la première slide, puis en bas à droite {#display-a-logo-top-left-on-the-first-slide-then-bottom-right}

L'exemple ci-dessous illustre le besoin : sur votre première slide, vous voulez rendre votre logo bien plus visible que sur les autres slides.

Pour y arriver, sur la première slide affichée, votre logo sera affiché en haut à gauche avec une certaine taille, alors qu'au changement de slide, le logo sera positionné en bas à droite et sera bien plus petit.

Voici un exemple visuel :

![Logo en haut à gauche](./images/logo-top-left.webp)

![Logo en bas à droite](./images/logo-bottom-right.webp)

Pour cela, nous allons devoir ajouter un JavaScript personnalisé et un CSS personnalisé.

Créez un nouveau dossier appelé `assets` et, dans ce dossier, un fichier appelé `style.css` et un second appelé `custom.js`.

<ProjectSetup folderName="assets">
  <Snippet filename="style.css" source="./files/style.css" />
  <Snippet filename="custom.js" source="./files/custom.js" />
</ProjectSetup>

Maintenant, utilisez-les dans votre `slides.md` comme ceci :

<Snippet filename="slides.md" source="./files/slides_2.txt" />

Comme vous le voyez ci-dessus, le code JavaScript est injecté dans votre présentation via la directive `header-includes`. Pour la feuille de style, c'est la directive `css` qui est utilisée (*il n'y a malheureusement pas de directive `js:`*).

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

### Ajouter une image de fond à une slide {#adding-a-background-image-to-a-slide}

Un fond, un titre et un peu de style :

<Snippet filename="slides.md" source="./files/slides_3.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

![Ajouter une image de fond à une slide](./images/background-title-style.webp)

#### Background-size contain ou cover {#background-size-contain-or-cover}

Parfois, l'affichage de l'image n'est pas celui que vous souhaitez ; c'est le cas quand l'image est trop grande et/ou la slide trop étroite.

L'illustration ci-dessous le montre : la photo du paresseux est beaucoup trop grande et vous ne pouvez pas la voir en entier.

Cela peut être corrigé en utilisant l'attribut `background-size`. Quand il n'est pas mentionné (comme pour la première slide ci-dessous), la valeur par défaut est `cover` (voir [https://developer.mozilla.org/en-US/docs/Web/CSS/background-size](https://developer.mozilla.org/en-US/docs/Web/CSS/background-size) pour plus d'informations).

Vous pouvez demander au navigateur de redimensionner l'image pour qu'elle soit affichée en entier. C'est le comportement quand `background-size` vaut `contain`.

<Snippet filename="slides.md" source="./files/slides_4.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

La slide ci-dessous utilise `cover` et, non, ce n'est pas vraiment attrayant.

![Background-size réglé sur cover](./images/background-cover.webp)

La seconde slide utilise `contain` et, au moins, on voit ce que le paresseux essayait de nous dire.

![Background-size réglé sur contain](./images/background-contain.webp)

### Slide-level {#slide-level}

Le niveau de slide est un élément de configuration important ([documentation officielle](https://pandoc.org/MANUAL.html#structuring-the-slide-show)).

Si nous regardons le markdown ci-dessous, combien de slides aurons-nous ? Deux ou trois ? La première pour le titre, la seconde pour `Technologies and tools`, mais `Apache` sera-t-il une slide séparée ou non ?

<Snippet filename="slides.md" source="./files/slides_5.txt" />

En fait, cela dépend du réglage `slide-level`. Par défaut, `slide-level` vaut `2` et le résultat sera alors :

![Slide level 2](./images/slide-level-2.webp)

Nous avons deux slides. Sur la seconde, on voit notre titre de niveau 3 `Apache` comme du texte dans `Technologies and tools`.

Si vous voulez qu'une slide soit créée pour chaque titre de niveau 2 et de niveau 3 (ou plus), vous devez le définir avec slide-level.

<Snippet filename="slides.md" source="./files/slides_6.txt" />

Et le résultat donnera :

![Slide level 3](./images/slide-level-3.webp)

### Utiliser des emoji {#using-emoji}

C'est simple, ajoutez juste l'entrée suivante dans votre front matter YAML.

```yaml
---
from: markdown+emoji
---
```

Vous pouvez ensuite ajouter des emoji en tapant simplement le code comme `:wave:` ou `:raised_hands:`.

Vous trouverez une liste complète sur [https://gist.github.com/rxaviers/7360908](https://gist.github.com/rxaviers/7360908).

### Texte en grand {#big-text}

La classe `r-fit-text` ([doc officielle](https://quarto.org/docs/presentations/revealjs/advanced.html#fit-text)) donnera la taille maximale à votre contenu, c'est-à-dire :

<Snippet filename="slides.md" source="./files/slides_7.txt" />

![Texte en grand](./images/big-text.webp)

### Stretch {#stretch}

La classe `r-stretch` ([doc officielle](https://quarto.org/docs/presentations/revealjs/advanced.html#stretch)) est ma préférée.

Prenez l'exemple ci-dessous :

<Snippet filename="slides.md" source="./files/slides_8.txt" />

Cela génèrera cette slide :

![Stretch 1](./images/stretch-1.webp)

Ajouter beaucoup plus de texte / de paragraphes donnera cette nouvelle slide :

![Stretch 2](./images/stretch-2.webp)

La hauteur de l'image sera redimensionnée automatiquement pour que le texte et les images tiennent sur la même slide. Si vous avez moins de texte, la hauteur de l'image sera plus grande, plus petite sinon. Sans devoir redimensionner l'image manuellement sur le disque. Très utile.

### Afficher une image à la pression d'une touche {#show-an-image-on-key-press}

En utilisant `::: {.fragment .fade-up}` pour définir une zone de contenu, vous demandez à reveal.js de n'afficher son contenu qu'à la séquence de touches suivante.

<Snippet filename="slides.md" source="./files/slides_9.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

![C'est un chien en bonbon](./images/candy-dog.gif)

### Créer des colonnes {#creating-columns}

Vous pouvez utiliser `columns` pour diviser votre slide :

<Snippet filename="slides.md">

```markdown
##

::: columns
::: {.column width="70%"}
![Left column: slide example image](./images/image_1.webp)
:::

::: {.column width="30%"}
![Right column: top image](./images/image_2.webp)

![Right column: bottom image](./images/image_3.webp)
:::
:::
```

</Snippet>

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

![Colonnes](./images/columns.webp)

#### Quatre quadrants {#four-quadrants}

L'exemple ci-dessous vient de [https://mine.quarto.pub/hello-quarto/#/quarto-highlights](https://mine.quarto.pub/hello-quarto/#/quarto-highlights), un diaporama reveal.js réalisé avec Quarto.

L'idée est de découper les slides en quatre parties et d'afficher le contenu dans le sens horaire, en commençant par le cadran en haut à gauche.

<Snippet filename="slides.md">

```markdown
::: columns
::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![Top-left quadrant example](./images/top-left.webp){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![Top-right quadrant example](./images/top-right.webp){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::
:::

::: columns
::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![Bottom-left quadrant example](./images/bottom-left.webp){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::

::: {.column width="40%"}
::: bulletbox
::: {.fragment .fade-in-then-semi-out}
![Bottom-right quadrant example](./images/bottom-right.webp){width="450px"}
:::
:::
:::

::: {.column width="5%"}
:::
:::
```

</Snippet>

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

![Quatre quadrants](./images/four-quadrants.gif)

### Créer notre propre short code, facilement {#creating-our-own-short-code-easily}

J'aime pouvoir écrire `==Important text==` et, pour une présentation revealjs, transformer automatiquement ce texte en `<mark>Important text</mark>` afin de pouvoir facilement lui appliquer un CSS personnalisé.

D'abord, créez un `assets/custom.js` s'il n'existe pas encore et copiez/collez le code suivant :

<Snippet filename="assets/custom.js" source="./files/custom.part2.js" />

Dans votre front matter YAML, ajoutez ceci :

<Snippet filename="slides.md" source="./files/slides_12.txt" />

Et maintenant, quand le diaporama sera joué, un code JavaScript personnalisé remplacera à la volée chaque fragment `==xxxx==` par `<mark>xxx</mark>`.

## CSS {#css}

### Utiliser du css inline {#using-inline-css}

Vous pouvez appliquer des styles à du texte inline en créant des spans : `[]` pour entourer le texte à styler et `{}` pour définir le style à appliquer.

<Snippet filename="slides.md" source="./files/slides_13.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

Le rendu est correct en HTML :

![html](./images/html.webp)

### Utiliser un css personnalisé {#use-a-custom-css}

Utilisez le bloc d'en-tête YAML pour cela.

<Snippet filename="slides.md" source="./files/slides_14.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

Maintenant, créez le fichier `custom.css` dans le même dossier que votre fichier markdown et, par exemple, mettez le fond de la slide en jaune :

<Snippet filename="custom.css" source="./files/custom.css" />

![Css personnalisé](./images/custom-css.webp)

### Masquer la légende de l'image {#hide-image-caption}

Par défaut, revealjs affiche la légende de l'image en dessous de celle-ci. Vous pouvez la masquer avec cette feuille de style :

<Snippet filename="custom.css" source="./files/custom.part2.css" />

### Les callouts peuvent être stylés {#callout-can-be-stylized}

Un callout est une div spéciale comme ci-dessous :

<Snippet filename="slides.md" source="./files/slides_15.txt" />

Dans revealjs, personnellement, je trouve que le rendu prend trop de place par rapport au contenu de ma slide. J'utilise donc du css pour masquer le titre :

![Titre du callout](./images/callout-title.webp)

<Snippet filename="custom.css" source="./files/custom.part3.css" />

## Navigation {#navigation}

### Slides verticales {#vertical-slides}

Il existe trois types de navigation : `linear` (celle par défaut), `vertical` ou `grid` ([doc officielle](https://quarto.org/docs/presentations/revealjs/advanced.html#vertical-slides)).

Si vous utilisez la navigation vertical ou grid, vous devriez structurer vos slides avec des titres de niveau 1 pour l'axe horizontal et des titres de niveau 2 pour l'axe vertical.

Dans une navigation `linear` normale, revealjs affichera chaque slide, quelle que soit la touche pressée par l'utilisateur. Dans une navigation `linear`, en tant qu'auteur, vous êtes sûr que votre visiteur verra chacune d'elles.

Dans une navigation `vertical` ou `grid`, c'est comme si vous montriez le titre du chapitre : si l'utilisateur presse la touche <kbd>down</kbd> ou <kbd>space</kbd>, il entrera dans le chapitre (et ce *verticalement*). Mais s'il presse la touche <kbd>right</kbd>, il le sautera et passera au chapitre suivant.

Le `navigation-mode` dans l'en-tête yaml vous permet d'activer le mode `vertical`, voici un exemple :

<Snippet filename="slides.md" source="./files/slides_16.txt" />

![Navigation verticale](./images/vertical.webp)

<AlertBox variant="info" title="Pressez la touche <kbd>esc</kbd>">
La touche <kbd>esc</kbd> vous permet de voir la structure de votre diaporama revealjs.

</AlertBox>

### Définir un nom pour votre slide {#define-a-name-for-your-slide}

Par défaut, reveal.js génèrera un slug depuis le titre pour que vous puissiez référencer la slide dans une URL.

Prenez l'exemple suivant :

<Snippet filename="slides.md" source="./files/slides_17.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

L'URL générée pour la première slide sera `http://[...]index.html#/elit-ad-fugiat-proident-culpa-sint` et, pour la seconde slide, `http://[...]index.html#/cillum-do-et-commodo-minim-ullamco-elit-culpa`.

Pour définir le nom vous-même, ajoutez juste `{#}` suivi du slug que vous souhaitez.

<Snippet filename="slides.md" source="./files/slides_18.txt" />

![Définir un nom pour votre slide](./images/set-slide-slug.webp)

Mais attention au menu des slides (en bas à gauche) : il est peut-être bon d'y définir aussi un nom adapté.

![Définir aussi le nom dans le menu](./images/set-name-in-menu.webp)

Pour cela, définissez l'attribut `data-menu-title` ; p.ex. :

<Snippet filename="slides.md" source="./files/slides_19.txt" />

### Afficher le numéro de slide {#show-slide-number}

Pour n'afficher que le numéro de la slide courante, vous pouvez utiliser `slide-number: true` mais, si vous voulez aussi le nombre total de slides, vous devriez utiliser `slide-number: c/t` :

<Snippet filename="slides.md" source="./files/slides_20.txt" />

![Slide / Total des slides](./images/slides_c_t.webp)

Vous trouverez plus d'informations dans la [documentation Quarto sur les numéros de slides](https://quarto.org/docs/presentations/revealjs/presenting.html#slide-numbers).

## Divers {#misc}

### Utiliser les notes du présentateur {#using-speaker-notes}

Vous pouvez écrire dans votre présentation des messages qui ne seront pas affichés lors de la lecture du diaporama, mais seulement sur un second écran quand le présentateur le souhaite.

L'exemple ci-dessous l'illustre. La façon d'insérer de telles notes de présentateur est d'utiliser le bloc `::: notes`.

<Snippet filename="slides.md" source="./files/slides_21.txt" />

*Pour exécuter cet exemple, lancez `quarto render slides.md --to revealjs`.*

Donc, dans l'exemple ci-dessus, nous aurons deux slides. En pressant la touche <kbd>s</kbd> du clavier (<span style={{color: 'blue'}}>s pour speakers</span>), une nouvelle fenêtre s'affichera.

Quand vous avez deux écrans, sur le premier vous affichez votre présentation sans les notes (écran de gauche ci-dessous) et sur le second vous affichez les notes (écran de droite ci-dessous).

Si vous partagez votre écran via un outil comme Teams ou Zoom, même chose : vous partagez l'écran où la présentation est affichée (le premier) et gardez les notes pour vous seul.

![Notes du présentateur](./images/speaker-notes.webp)

Comme vous le voyez sur l'image ci-dessus, les notes du présentateur affichent des informations utiles comme le temps écoulé depuis le début de la présentation, l'heure actuelle et la slide suivante pour faciliter votre transition.
