---
slug: quarto-extensions
title: Mes extensions Quarto préférées
date: 2025-05-03
description: Mes extensions Quarto préférées - Découvrez les filtres Quarto essentiels pour le templating de contenu partiel, les icônes Font Awesome, l'inclusion de fichiers de code externes et de simples macros de recherche-remplacement pour améliorer votre workflow de documentation.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - doc-as-code
  - markdown
  - quarto
language: fr
tried_it: false
blueskyRecordKey: 3lun2yevo622r
updates:
  - date: 2026-01-26
    note: "Note about extension include-code-files"
---
<!-- cspell:ignore frontmatter,fontawesome,gadenbuie,shafayetShafee -->

![Mes extensions Quarto préférées](/img/v2/quarto.webp)

<TLDR>
Cet article partage une liste choisie des extensions Quarto préférées de l'auteur pour améliorer votre workflow de documentation. Découvrez des filtres utiles pour le templating de contenu avec `quarto-partials`, l'intégration d'icônes avec `fontawesome`, l'inclusion de snippets de code externes, la création de simples macros de remplacement de texte avec `search-replace` et l'amélioration de la lisibilité des blocs de code dans les présentations reveal.js avec `code-fullscreen`.
</TLDR>

J'utilise Quarto depuis 18 mois pour générer ma documentation : j'écris des fichiers Markdown (`.md`) et je les convertis en document Word, en PDF, en site HTML statique ou en <Link to="/blog/quarto-revealjs-tips">diaporama revealjs</Link>. *Si Quarto est nouveau pour vous, <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link> vous donne une installation fonctionnelle en quelques minutes.*

Quarto prend en charge des extensions externes (aussi appelées `plugins` ailleurs).

Voici une liste de quelques-unes que j'utilise.

<!-- truncate -->

## gadenbuie/quarto-partials : du contenu partiel réutilisable {#gadenbuiequarto-partials}

Voir [https://github.com/gadenbuie/quarto-partials/tree/main](https://github.com/gadenbuie/quarto-partials/tree/main)

Quand j'en suis arrivé à cette extension, mon besoin était le suivant : j'avais codé plus de 60 fonctionnalités et je devais les documenter. Chacune aura le même look&feel, avec un chapitre *Description*, un *Comment l'exécuter ?*, *Comment la configurer ?*, *Remarques* et ainsi de suite.

Parfois le texte sera exactement le même (comme un texte générique) et, dans certains cas, presque le même : le chapitre *Comment la configurer ?* aura les mêmes phrases, sauf que je dois remplacer quelques placeholders (comme le nom de la fonctionnalité, le nom du fichier de configuration, ...)

Autrement dit : je dois pouvoir écrire une sorte de *template de page* et y *injecter* du contenu spécifique. Je veux que mes 60 pages de fonctionnalités se ressemblent et, si je dois changer un texte global, le faire à un seul endroit central.

[Partial content](https://github.com/gadenbuie/quarto-partials/tree/main) est parfait ici. D'après leur documentation, c'est similaire à [Mustache](https://mustache.github.io/).

### Exemple {#example}

Créons un fichier appelé `_hello.md` avec ce contenu :

<Snippet filename="_hello.md">

```markdown
Hello, {{ name }}!
```

</Snippet>

Ensuite, dans n'importe quel fichier, nous pouvons faire :

<Snippet filename="test.md">

```markdown
{{< partial _hello.md name="John" >}}
```

</Snippet>

Pensez à ajouter les lignes ci-dessous dans votre front matter YAML :

<Snippet filename="test.md">

```yaml
filters:
   - quarto-partials
```

</Snippet>

Nous pouvons passer des variables comme ci-dessus mais, bien plus puissant, nous pouvons déclarer une clé `partial-data` dans notre frontmatter YAML.

Si vous voulez aller beaucoup plus loin avec cette extension (blocs conditionnels, contenu brut, un cas d'usage réel de documentation), j'ai écrit un article dédié : <Link to="/blog/quarto-mustache">Using Mustache templating with Quarto</Link>.

## quarto-ext/fontawesome : des icônes Font Awesome {#quarto-extfontawesome}

Voir [https://github.com/quarto-ext/fontawesome](https://github.com/quarto-ext/fontawesome)

Utilisez les icônes Font Awesome dans vos documents HTML et PDF.

Par exemple, si vous voulez une icône GitHub, il suffit de mettre le code `{{< fa brands github size=5x >}}` dans votre fichier. Plutôt facile.

Pensez à ajouter les lignes ci-dessous dans votre front matter YAML :

<Snippet filename="test.md">

```yaml
filters:
   - fontawesome
```

</Snippet>

## quarto-ext/include-code-files : inclure des fichiers externes {#quarto-extinclude-code-files}

<AlertBox variant="tip" title="Est-ce encore nécessaire ?">
Je ne suis pas sûr que cet addon soit encore nécessaire : dans une de mes documentations, je l'ai utilisé comme ceci :

````markdown
```{.yaml include="files/.gitlab-ci.yml"}
```
````

Ça fonctionnait comme prévu mais, lors de la génération d'un fichier `.docx` (MS Word), le fichier inclus était absent.

J'ai alors utilisé le shortcode natif comme ci-dessous et, maintenant, ça marche pour `.html` comme pour `.docx`.

````markdown
```yaml
{{< include files/.gitlab-ci.yml >}}
```
````

</AlertBox>

Voir [https://github.com/quarto-ext/include-code-files](https://github.com/quarto-ext/include-code-files)

L'objectif est de pouvoir inclure un fichier externe en utilisant la syntaxe ci-dessous :

````markdown
```{.bash include="documentation/chapter_1/install.sh"}
```
````

Pensez à ajouter les lignes ci-dessous dans votre front matter YAML :

<Snippet filename="test.md">

```yaml
filters:
   - include-code-files
```

</Snippet>

## quarto-ext/search-replace : des macros de remplacement {#quarto-extsearch-replace}

Voir [https://github.com/ute/search-replace](https://github.com/ute/search-replace)

Une extension de filtre Quarto pour de simples macros de recherche-remplacement.

Cette extension vous permet de rechercher et remplacer lors du rendu des documents. Par exemple, en mettant le code `+quarto` dans le frontmatter de l'article ou, mieux, dans le fichier global `_quarto.yaml`, nous pouvons simplement écrire `+quarto` (une constante) dans notre document et laisser le remplacement se faire pendant le rendu de la documentation.

<Snippet filename="_quarto.yaml" source="./files/_quarto.yaml" />

Pensez à ajouter les lignes ci-dessous dans votre front matter YAML :

```yaml
filters:
   - search-replace
```

### Exemple {#example-1}

Voici comment l'utiliser. C'est simple ; écrivez juste le nom de votre constante et, pendant le rendu de votre document, la constante sera remplacée par la valeur prédéfinie. Facile !

```markdown
I'm using +quarto and I love it
```

## shafayetShafee/code-fullscreen : du code en plein écran {#shafayetshafeecode-fullscreen}

Voir [https://github.com/shafayetShafee/code-fullscreen](https://github.com/shafayetShafee/code-fullscreen)

Cette extension concerne les diaporamas revealjs.

Si vous avez un très long bloc de code, revealjs n'affichera pas toutes les lignes et le code sera donc tronqué (seules les 25 premières lignes seront affichées, par exemple).

En ajoutant le filtre ci-dessous à votre frontmatter YAML, un petit bouton *Full screen* sera affiché en haut à droite du bloc de code.

<Snippet filename="test.md">

```yaml
filters:
   - code-fullscreen
```

</Snippet>
