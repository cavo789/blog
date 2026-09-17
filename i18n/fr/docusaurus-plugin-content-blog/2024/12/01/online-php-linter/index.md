---
slug: online-php-linter
title: Formater du code PHP mal formaté
date: 2024-12-01
description: Besoin de nettoyer rapidement du code PHP en vrac ? Découvrez le meilleur linter PHP en ligne, Pint-express (basé sur Laravel Pint), pour formater et embellir votre code instantanément. Aucune installation nécessaire !
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - laravel
  - php
  - vscode
language: fr
updates:
  - date: 2026-07-30
    note: "Replaced dead pint-express link (benjamincrozat.com/pint-express, 404) with hexmos.com/freedevtools/tldr/common/pint; updated squizlabs→PHPCSStandards; Laravel docs 11.x→13.x."
---
![Formater du code PHP mal formaté](/img/v2/clean_code.webp)

<TLDR>
Cet article présente Pint-express (benjamincrozat.com/pint-express), un formateur PHP en ligne basé sur Laravel Pint, pour nettoyer instantanément du code PHP mal formaté : il suffit de le coller dans une zone de texte, sans rien installer. Pour des projets suivis, il recommande plutôt de brancher PHP-CS-Fixer ou PHP_CodeSniffer dans l'éditeur, le processus de build ou le pipeline CI.
</TLDR>

Vous récupérez du vieux code PHP ; vous voulez répondre à une question posée sur un forum et la personne qui a posté la question PHP n'a pas pris soin de la formater correctement ; ... les occasions sont trop nombreuses où la qualité syntaxique du code peut être pourrie.

Vous aimeriez avoir un outil en ligne pour récupérer rapidement du code avec une mise en forme beaucoup plus soignée, juste par copier-coller. Sans rien installer et sans prise de tête.

Par exemple, comment rendre le code ci-dessous plus propre en cinq secondes ?

<Snippet filename="my_collection.php" source="./files/my_collection.php" />

<!-- truncate -->

Il existe énormément de *linters* sur internet, mais celui-ci est peut-être l'un des meilleurs : [https://hexmos.com/freedevtools/tldr/common/pint](https://hexmos.com/freedevtools/tldr/common/pint). Il est basé sur l'outil [Laravel Pint](https://laravel.com/docs/13.x/pint) (mais absolument pas limité au code Laravel).

Voici donc à quoi ressemblait le code avant :

![Code PHP correctement formaté](./images/before.webp)

Rendez-vous sur [le formateur Pint de Hexmos](https://hexmos.com/freedevtools/tldr/common/pint), copiez le code dans la zone de texte **Code** du script et laissez le reformatage se faire :

![Code PHP correctement formaté](./images/after.webp)

Bien mieux.

Note : il existe d'autres outils comme par exemple [https://codebeautify.org/php-beautifier](https://codebeautify.org/php-beautifier).

Un outil en ligne est parfait pour un copier-coller ponctuel. Pour vos propres projets, intégrez plutôt le formateur dans votre workflow : <Link to="/blog/php-jakzal-phpqa">jakzal/phpqa</Link> vous donne `php-cs-fixer` et `phpcbf` sans rien installer, et <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> les exécute avant chaque commit.

## Si vous êtes développeur PHP {#if-youre-a-php-developer}

... alors utilisez des outils comme [PHP-CS-Fixer](https://github.com/PHP-CS-Fixer/PHP-CS-Fixer) ou [PHP_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer), ou bien d'autres. Voyez aussi mon <Link to="/blog/php-jakzal-phpqa">Docker image that provides static analysis tools for PHP</Link>.

Pensez à ajouter ces outils à votre éditeur (il existe de nombreuses extensions VSCode), à votre workflow (par exemple via des actions `make` locales), ou à ajouter ces étapes à un pipeline distant.
