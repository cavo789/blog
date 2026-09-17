---
slug: php-jakzal-phpqa
title: Une image Docker qui fournit les outils d'analyse statique pour PHP
date: 2024-04-07
description: Utilisez l'image Docker jakzal/phpqa pour lancer instantanément des dizaines d'outils d'analyse statique et de qualité de code sur votre codebase PHP, linters et fixers inclus, sans rien installer.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - docker
  - laravel
  - php
language: fr
updates:
  - date: 2026-07-30
    note: "Updated PHP_CodeSniffer link from abandoned squizlabs/PHP_CodeSniffer to its successor PHPCSStandards/PHP_CodeSniffer."
---
![Une image Docker qui fournit les outils d'analyse statique pour PHP](/img/v2/clean_code.webp)

<TLDR>
Cet article montre comment lancer toute une suite d'outils d'analyse statique PHP sans rien installer, grâce à l'image Docker `jakzal/phpqa` : `composer normalize` pour réordonner `composer.json`, `composer-unused` pour repérer les dépendances inutilisées, `parallel-lint` pour les erreurs de syntaxe, `php-cs-fixer` et `phpcbf` pour le formatage automatique — et aussi comment fixer un tag correspondant à une version précise de PHP quand vous scannez du code legacy.
</TLDR>

Depuis des années, j'utilise [https://github.com/jakzal/phpqa](https://github.com/jakzal/phpqa) pour lancer une foule d'outils d'analyse statique sur ma codebase PHP.

La liste des outils disponibles est énorme ; voyez par vous-même : [Available tools](https://github.com/jakzal/phpqa?tab=readme-ov-file#available-tools).

Dans cet article, nous allons voir comment tirer parti de tous ces outils et augmenter la qualité de nos scripts.

<!-- truncate -->

D'abord, comme toujours quand il faut découvrir un nouveau logiciel, parlons de son installation. La réponse est simple ici : il n'y a rien à faire. Ah bon ? Vraiment ? Mais oui ! `jakzal/phpqa` est une image Docker, donc pas besoin de l'installer, juste de la lancer une fois. Au premier appel, Docker la téléchargera donc, oui, aucune installation. Merci Docker !

<AlertBox variant="info" title="Rappel sur la CLI Docker">
Pour rappel, la commande Docker run utilisée ressemblera toujours à ceci :

- `docker run` pour lancer une image Docker (*Ah bon ? Vraiment ?*),
- `-it` pour démarrer Docker en mode interactif, ce qui permet au script exécuté dans le container de vous poser des questions par exemple,
- `--rm` pour demander à Docker de tuer et supprimer le container dès que le script a été exécuté (sinon vous vous retrouverez avec une tonne de containers Docker arrêtés mais pas supprimés ; vous pouvez le vérifier en n'utilisant pas le flag `--rm` puis en lançant `docker container list` dans la console),
- `-v "${PWD}":/project` pour <Link to="/blog/docker-volume">partager votre dossier courant</Link> avec un dossier nommé `/project` dans le container Docker (utilisez `${PWD}` sous Linux, `%CD%` sous DOS),
- `-w /project` pour indiquer à Docker que le répertoire courant, dans le container, sera le dossier `/project`
- puis `jakzal/phpqa` qui est le nom de l'image Docker à utiliser (vous pouvez aussi préciser une version comme `python:3.9.18` si nécessaire ; voir [https://hub.docker.com/_/python/tags](https://hub.docker.com/_/python/tags))

</AlertBox>

## Composer unused : repérer les dépendances inutilisées {#composer-unused}

[Composer unused](https://github.com/composer-unused/composer-unused) va **essayer** de comprendre quels packages sont mentionnés dans votre fichier `composer.json` et, peut-être, ne sont plus utilisés.

En lançant `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa composer-unused` dans votre projet, vous obtiendrez quelque chose comme ceci :

![composer unused](./images/composer_unused.webp)

L'outil détecte donc que je référence `spatie/laravel-db-snapshots` dans mon fichier `composer.json` mais que, dans ma codebase, l'outil (en fait, le namespace ajouté par l'outil) n'est pas utilisé du tout : oui, je peux probablement supprimer cette dépendance.

<AlertBox variant="caution">
Ce type d'outil peut produire des faux positifs ; faites quelques vérifications avant de supprimer la dépendance. La meilleure solution ici est bien sûr d'avoir plein de <Link to="/blog/pest_tips">tests unitaires</Link> pour les lancer avant et après le changement et voir si votre code fonctionne toujours comme prévu.

</AlertBox>

## Composer normalize : réordonner composer.json {#composer-normalize}

[Composer normalize](https://github.com/ergebnis/composer-normalize) va réordonner votre fichier `composer.json` selon les bonnes pratiques.

Comme vous le savez, dans un fichier JSON, il n'y a pas d'ordre : vous pouvez définir vos propriétés dans n'importe quel ordre. Par exemple :

<Snippet filename="composer.json" source="./files/composer.json" />

ou

<Snippet filename="composer.json" source="./files/composer.part2.json" />

ou n'importe quoi d'autre. L'exemple ci-dessus ne fait que quatre lignes ; imaginez un fichier de cent lignes. C'est plus logique, non, de retrouver d'abord le `name` de l'outil, puis une petite `description`, la `license`, le `type` (est-ce un projet, une bibliothèque, ...) et ainsi de suite, plutôt que, par exemple, la liste des dépendances en premier.

Ok, donc, pour normaliser votre fichier `composer.json`, vous pouvez installer l'outil ou, et c'est l'objectif de cet article, simplement lancer `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa composer normalize` et c'est tout.

Le résultat sera un fichier `composer.json` réécrit où les propriétés sont placées dans l'ordre standard.

<AlertBox variant="info">
Ajoutez `--dry-run` si vous voulez juste voir quels seront les changements, sans modifier le moindre fichier.

</AlertBox>

## PHP-Parallel-Lint : traquer les erreurs de syntaxe {#php-parallel-lint}

Troisième exemple : [PHP-Parallel-Lint](https://github.com/php-parallel-lint/PHP-Parallel-Lint).

Cet outil va scanner tous les fichiers `.php` présents dans votre codebase et vérifier qu'il n'y a pas d'erreur de syntaxe, comme un `}` manquant.

La commande à lancer ici est `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa parallel-lint . --exclude vendor`.

Pensez à ajouter des exclusions comme `--exclude vendor` pour ne pas scanner du code qui n'est pas le vôtre.

Comme vous le voyez ci-dessous, en moins de deux secondes, l'outil a vérifié 823 fichiers de ma codebase. Plutôt rapide.

<Terminal typewriter source="./files/terminal-1.txt" />

## PHP-CS-FIXER : reformater le code automatiquement {#php-cs-fixer}

Un autre outil, [PHP-CS-FIXER](https://cs.symfony.com/). *The PHP Coding Standards Fixer (PHP CS Fixer) tool fixes your code to follow standards.*

Ici la commande sera `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa php-cs-fixer fix` pour reformater toute votre codebase selon les rulesets sélectionnés. Si aucun n'est mentionné, `PSR-12` sera celui par défaut.

## PHP_CodeSniffer : contrôler les standards de codage {#php_codesniffer}

Un autre outil, [PHP_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer). *PHP_CodeSniffer tokenizes PHP files and detects violations of a defined set of coding standards.*

Cette fois, la commande sera `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa phpcbf .`

## Une foule d'autres outils vous attendent {#a-whole-host-of-other-tools-await-you}

Comme vous le voyez, on peut utiliser énormément d'outils avec `jakzal/phpqa` sans rien installer. C'est vraiment impressionnant. Vous trouverez bien plus d'outils que ceux décrits dans cet article : rendez-vous sur [Available tools](https://github.com/jakzal/phpqa?tab=readme-ov-file#available-tools) et voyez lesquels peuvent vous aider.

Deux suites logiques une fois vos outils choisis : les lancer **avant** de committer, grâce aux <Link to="/blog/git-precommit">hooks Git pre-commit</Link>, et les relancer dans votre CI, comme décrit dans <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link>.

## Changer de version de PHP {#change-php-versions}

Imaginons que votre codebase soit du legacy (pas écrit pour PHP 8.3 mais, par exemple, pour PHP 7.4).

Une instruction comme `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa parallel-lint . --exclude vendor` (comme vue plus haut) va scanner le code avec PHP 8.3 (situation fin mars 2024) et vous pouvez récolter plein d'erreurs puisque vous utilisez un outil PHP 8.3x sur une codebase PHP 7.4x.

Comment résoudre ça ? En fait, c'est très simple. Comme vous le savez, en utilisant `docker run [...] jakzal/phpqa [...]` vous demandez à Docker d'utiliser la version `latest` de l'image, et cette version change. Chaque fois que le propriétaire de l'image publie une version plus récente, l'image `latest` est mise à jour et, peut-être, dans quelques mois, ce sera PHP 8.4 par défaut.

Donc, pour régler notre problème : il faut utiliser un tag spécifique pour PHP 7.4. *Et si les outils se plaignent de vos réglages PHP plutôt que de votre code, voyez <Link to="/blog/docker-php-ini">Update php.ini when using a Docker image</Link>.* Rendez-vous simplement sur [https://hub.docker.com/r/jakzal/phpqa/tags](https://hub.docker.com/r/jakzal/phpqa/tags) et tapez `7.4` dans la zone `Filter Tags`.

![Tags](./images/tags.webp)

Vous y trouverez quelques tags. Vous pouvez maintenant lancer `docker run -it --rm -v "${PWD}":/project -w /project jakzal/phpqa:1.80-php7.4-alpine parallel-lint . --exclude vendor` pour exécuter le linter PHP 7.4.
