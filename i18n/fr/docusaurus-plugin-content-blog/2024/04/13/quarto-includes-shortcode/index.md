---
slug: quarto-includes-shortcode
title: Le short code includes de Quarto
date: 2024-04-13
description: Découvrez comment utiliser le short code includes de Quarto pour découper de longs documents en plusieurs fichiers organisés et simplifier votre écriture.
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
![Le short code includes de Quarto](/img/v2/quarto.webp)

<TLDR>
Cet article présente le short code `{{< include >}}` de Quarto, qui permet de découper un long document en plusieurs petits fichiers Markdown et de les fusionner au rendu en référençant leurs chemins relatifs depuis un fichier `.qmd` principal.
</TLDR>

Avec le short code `includes` de Quarto, l'écriture d'un long document peut facilement être découpée en plusieurs documents plus petits.

*`includes` découpe un document en morceaux fixes. Quand la partie répétée est la même *structure* remplie avec des valeurs différentes, <Link to="/blog/quarto-mustache">Using Mustache templating with Quarto</Link> et <Link to="/blog/quarto-project-variables">Using variables from external file in your Quarto project</Link> sont les bons outils.*

Imaginez le fichier `main.qmd` suivant :

<Snippet filename="main.qmd" source="./files/main.qmd" />

Quarto va alors fusionner les trois fichiers quand vous faites le rendu de `main.qmd`.

<!-- truncate -->

<AlertBox variant="info" title="Image Docker avec Quarto">
Si vous n'avez pas encore d'image Docker avec Quarto, lisez cet article <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link>.

</AlertBox>

## Le tag includes {#includes-tag}

Le tag est simple, il suffit d'indiquer le chemin relatif du fichier à inclure. Pour la syntaxe détaillée, voyez la [documentation officielle](https://quarto.org/docs/authoring/includes.html).

## Résultat {#result}

Lancer `quarto render main.qmd --to html` sur le fichier `main.qmd` montré ci-dessus fusionne les
fichiers inclus en un seul document :

![Quarto includes](./images/includes.webp)

Voici ce que contient réellement chaque fichier inclus.

Voici un contenu bidon pour `chapter1.md` :

<Snippet filename="chapter1.md">

<!-- cspell:disable -->
```markdown
## Chapter 1

Voluptatem minus labore architecto sed voluptas molestiae perferendis. Sed voluptatem ut amet at blanditiis sunt et exercitationem quidem. Vel id impedit dicta omnis repudiandae iure.

Expedita magni facere. Ullam non non sint qui provident. Ea beatae voluptatem pariatur. Et beatae error ea aut neque omnis pariatur rerum ut.

Ad aut nobis magni aut est dicta adipisci est. Quo reiciendis eum aut rem. Dolores sit magni non.
```

</Snippet>

Et pour `chapter2.md` :

<Snippet filename="chapter2.md">

```markdown
## Chapter 2

Iure repudiandae perferendis maiores dolorem consequuntur exercitationem suscipit.

Animi voluptatem est quia. Quia id optio. Architecto ut ipsa voluptas minima voluptate accusamus architecto.

Consequatur debitis et sunt eos quod qui unde aut.
```

</Snippet>

<!-- cspell:enable -->

Maintenant, en lançant par exemple `quarto render main.qmd --to html`, Quarto va fusionner ces deux fichiers (et `main.qmd`) dans la page rendue montrée ci-dessus.

<AlertBox variant="info" title="Qu'est-ce qu'un fichier `.qmd` ?">
Pour Quarto, l'extension n'a pas beaucoup d'importance : que ce soit `.qmd` ou `.md`, le traitement est le même.

Par contre, il est sans doute plus intéressant pour nous d'utiliser l'extension `.qmd` quand on emploie une syntaxe propre à Quarto, comme c'est le cas ici.

</AlertBox>
