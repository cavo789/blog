---
slug: quarto-mustache
title: Utiliser le templating Mustache avec Quarto
date: 2025-05-15
description: Maîtrisez le templating Mustache dans Quarto ! Découvrez comment utiliser l'extension quarto-partials pour créer des pages de documentation structurées et répétitives pour votre site statique.
authors: [christophe]
image: /img/v2/mustache.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - markdown
  - php
  - quarto
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lun2vljjqs2r
---
<!-- cspell:ignore buie,frontmatter,gadenbuie,htdocs -->

![Utiliser le templating Mustache avec Quarto](/img/v2/mustache.webp)

<TLDR>
Ce tutoriel explique comment utiliser un templating à la Mustache dans Quarto pour créer efficacement une documentation structurée et répétitive destinée à un site statique. Grâce à l'extension `quarto-partials`, vous pouvez définir des blocs de contenu réutilisables (les partials) et les inclure dans plusieurs pages. Le guide couvre la mise en place d'un projet, le passage de variables depuis le frontmatter YAML d'un document vers un partial, et l'utilisation de conditions pour afficher du contenu selon qu'une variable est définie ou non. Une approche idéale pour documenter un grand nombre de fonctionnalités similaires avec une structure cohérente.
</TLDR>

J'utilise Quarto pour générer de la documentation ; jusqu'ici, j'ai surtout produit des fichiers `.docx` et `.pdf`.

Récemment, j'ai eu besoin de générer un site statique (HTML) permettant à mes collègues de consulter la documentation du dernier logiciel que j'ai écrit. Je devais décrire près de 80 fonctions : autant de pages web à écrire, chacune avec la même structure (un chapitre description, un chapitre comment l'exécuter, un chapitre comment le configurer, etc.). *Ce besoin a fini par se transformer en le pipeline complet décrit dans <Link to="/blog/quarto-industrialisation">Quarto - How I Built a Self-Documenting Ecosystem for 50+ Projects</Link>.*

Et forcément, présenté comme ça, on pense à un CMS (content management system) comme Joomla par exemple : pouvoir définir une page standard (un template) qui contiendra les chapitres et, dans chaque chapitre, injecter du contenu sous forme de variables. Ce serait bête d'écrire chaque page à la main, non ?

C'est là qu'intervient l'idée de [Mustache](https://mustache.github.io/). Mustache se définit comme un framework de *Logic-less templates*.

Et comme j'utilise Quarto pour ma documentation, il me faut une extension pour utiliser Mustache : c'est [Quarto-partials](https://github.com/gadenbuie/quarto-partials/tree/main) de Garrick Aden-Buie — une des extensions que je mentionne dans <Link to="/blog/quarto-extensions">mes extensions Quarto préférées</Link>, mais elle mérite qu'on creuse bien plus loin.

<!-- truncate -->

Voici l'idée en une image : une page Markdown dont le chapitre « How to run » est injecté depuis un template partagé, avec une variable remplie depuis le frontmatter de la page elle-même.

![Rendu de la fonctionnalité Contextual Canvas](./images/render_canvas.webp)

Le titre « Contextual Canvas » et sa description sont écrits directement dans la page ; le paragraphe « How to run » en dessous provient d'un template partagé par toutes les pages de fonctionnalités, avec `{{ command }}` remplacé par la valeur déclarée dans le frontmatter de cette page. Construisons ça.

## Créer quelques fichiers {#create-some-files}

Comme toujours, créons quelques fichiers.

Créez un dossier temporaire et placez-vous dedans :

<Terminal>
$ mkdir /tmp/partials && cd $_
</Terminal>

Créez un fichier `_quarto.yml` avec ce contenu :

<Snippet filename="_quarto.yml" source="./files/_quarto.yml" />

Ce fichier dit à Quarto que nous allons créer un site web : en lançant `quarto render` plus tard, nos pages écrites en Markdown seront converties en pages HTML.

Les deux dernières lignes doivent être présentes pour charger une extension externe appelée `partials` ; installons-la.

Comme nous utilisons Docker, la commande est plutôt longue : `docker run -it --rm -v .:/public -w /public -u $(id -u):$(id -g) ghcr.io/quarto-dev/quarto:latest quarto add gadenbuie/quarto-partials`.

Cela va créer un nouveau dossier `_extensions` contenant partials.

## Découvrons les bases {#lets-discover-the-basics}

L'idée derrière Quarto-partials est de permettre d'écrire une page comme celle ci-dessous : je décris ma première fonctionnalité fictive et, dans le chapitre `How to run`, j'injecte le contenu d'une autre page :

<Snippet filename="documentation/canvas.md" source="./files/canvas.txt" />

Comme vous le voyez, j'écris la description de ma fonctionnalité (appelée ici « Contextual Canvas ») puis j'ai un chapitre « How to run ». Au lieu d'écrire le mode d'emploi ici, j'inclus un fichier externe (un *template*) appelé `../_partials/run.md`.

Celui-ci utilisera l'extension Quarto-partials : je peux donc mettre dans `../_partials/run.md` des fonctionnalités Mustache, comme l'injection d'une variable.

Voici le template :

<Snippet filename="_partials/run.md" source="./files/run.txt" />

Et voilà Mustache en action : comme vous le voyez sur la première ligne, la syntaxe `{{ command }}` affichera le contenu d'une variable appelée `command`. Bien sûr, je dois la déclarer. Revenons à ma documentation pour ajouter ce que Quarto appelle un bloc YAML *frontmatter* :

<Snippet filename="documentation/canvas.md" source="./files/canvas_2.txt" />

Il est temps de créer notre site web. Lancez `docker run -it --rm -v .:/public -w /public -u $(id -u):$(id -g) ghcr.io/quarto-dev/quarto:latest quarto render` — le rendu déjà aperçu en haut de cet article.

Cela va appeler la commande `render` de Quarto. Quarto va traiter le fichier `_quarto.yml`, voir que nous voulons produire un site web et lancer le rendu HTML. Ça ne prend qu'une ou deux secondes.

Maintenant, en lançant `docker run -d --name partials -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine`, nous créons un container Apache accessible sur le port 8080.

Enfin, rendez-vous sur `http://localhost:8080/documentation/canvas.html` et nous verrons notre site.

Et maintenant, nous sommes prêts à copier/coller le fichier `documentation/canvas.md` vers `documentation/feature_2.md` et à simplement mettre à jour la variable command. Et à répéter l'opération jusqu'à avoir documenté toutes les fonctionnalités.

<BrowserWindow url="http://localhost:8080/documentation/canvas.html">
  <img
    alt="Notre fonctionnalité Canvas"
    src={require("./images/html_canvas.webp").default}
  />
</BrowserWindow>

Prouvons que le template est réutilisable. Créons une nouvelle fonctionnalité :

<Snippet filename="documentation/builder.md" source="./files/builder.txt" />

et générons à nouveau notre site en relançant `docker run -it --rm -v .:/public -w /public -u $(id -u):$(id -g) ghcr.io/quarto-dev/quarto:latest quarto render`.

<BrowserWindow url="http://localhost:8080/documentation/feature_2.html">
  <img
    alt="Notre deuxième fonctionnalité"
    src={require("./images/html_builder.webp").default}
  />
</BrowserWindow>

### Ce que nous venons de faire {#what-have-we-just-done}

Nous avons créé un template réutilisable. Notre document comporte deux parties : une section YAML (le frontmatter) où nous fournissons des variables. La seconde partie, celle en Markdown, est notre template de base. Nous pouvons copier celui-ci pour toutes nos fonctionnalités, par exemple.

```markdown
---
partial-data:
  command: "run canvas"
---

## How to run

{{< partial ../_partials/run.md >}}
```

## Mon cas d'usage {#my-use-case}

Dans mon cas, ma documentation ressemble à ceci :

<Snippet filename="/documentation/php_lint.md" source="./files/php_lint.txt" />

## Tester si une variable est définie ou non (facultatif — à ignorer si vos templates n'ont pas besoin de conditions) {#testing-if-a-variable-is-defined-or-not-optional--skip-if-your-templates-dont-need-conditionals}

Jetons un œil au fichier `is_for.md`.

<Snippet filename="/_partials/project_type.md" source="./files/project_type.txt" />

Deux syntaxes sont utilisées ici : `{{#` et `{{^`.

La première vérifie la présence d'une variable appelée `type` et, si celle-ci est définie, le bloc est traité.

La seconde s'appelle une *Inverted section* et vérifie l'absence de la variable : si `type` n'est pas définie, ce bloc sera interprété.

Si vous regardez mon fichier `php_lint.md`, j'ai bien une variable `type` définie dans ma section `partial-data` (celle utilisée par Quarto-partials).

<Snippet filename="/documentation/php_lint.md" source="./files/php_lint_2.txt" />

Si je génère mon fichier avec la ligne de commande `quarto render`, je verrai alors `This job only for **PHP** project.` dans ma documentation.

Si ma fonctionnalité concernait tous les types de projets, il me suffit de supprimer la ligne `type: "PHP"` de mon frontmatter. Dans ce cas, je verrai `This stage is for **all** type of projects.`.

Jetons un œil au fichier inclus suivant :

<Snippet filename="../_partials/configure/file.md" source="./files/file.txt" />

Même idée. Si une clé `config_file` est définie dans le frontmatter de la documentation, nous obtiendrons `PHP Linter uses a settings file named .config/.phplint.yml ([Learn more](https://github.com/tengattack/phplint/blob/master/.phplint.yml)).`. Si nous supprimons la ligne `config_file`, nous obtiendrons `There is no configuration file.`.

## Contenu brut (facultatif — à ignorer sauf si une valeur affichée semble mal échappée) {#raw-contents-optional--skip-unless-a-rendered-value-looks-wrongly-escaped}

Lors de l'affichage d'une variable, il faut parfois désactiver le mode d'affichage normal et utiliser ce que Mustache appelle le `raw content`.

Dans l'exemple ci-dessous, j'utilise un caractère `/` qui sera échappé par Mustache.

```yaml
partial-data:
  output: ".output/coverage"
```

```markdown
{{#output}}

The report will be created into your project's directory in a folder called `{{ output }}`.

{{/output}}
```

Le rendu HTML donnera ici `.output&#x2F;coverage` et non `.output/coverage` comme attendu. Comme on le voit, Mustache a échappé notre slash. Il faut donc utiliser le mode contenu brut et la syntaxe `{{& output }}` à la place.

```markdown
{{#output}}

The report will be created into your project's directory in a folder called `{{& output }}`.

{{/output}}
```

## Conclusion {#conclusion}

Une ligne d'extension dans `_quarto.yml`, deux ou trois templates partials, et près de 80 pages de documentation quasi identiques cessent d'être 80 fichiers Markdown copiés-collés : elles deviennent un template plus un petit bloc de frontmatter par page. Voyez <Link to="/blog/quarto-industrialisation">Quarto - How I Built a Self-Documenting Ecosystem for 50+ Projects</Link> pour découvrir comment tout cela est devenu un pipeline complet, et <Link to="/blog/quarto-extensions">mes extensions Quarto préférées</Link> pour d'autres briques du même genre.
