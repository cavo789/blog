---
slug: php-devcontainer
title: Installer un environnement PHP Docker en quelques secondes
date: 2024-02-23
description: Mettez en place rapidement un environnement PHP Docker Dev Container pour VSCode. Composer et des outils d'analyse statique préinstallés comme PHP-CS-Fixer et Rector, immédiatement disponibles.
authors: [christophe]
image: /img/v2/devcontainer.webp
series: Coding using a devcontainer
mainTag: php
tags:
  - code-quality
  - devcontainer
  - docker
  - php
  - vscode
language: fr
review_date: 2026-07-30
---
![Installer un environnement PHP Docker en quelques secondes](/img/v2/devcontainer.webp)

<TLDR>
Voici la version courte, façon démarrage rapide, de l'article complet sur le devcontainer : téléchargez le squelette `php_devcontainer` avec `curl`, ouvrez le dossier dans VSCode et cliquez sur « Reopen in Container » pour obtenir un environnement PHP prêt à l'emploi avec Composer, PHP-CS-Fixer, PHPCS/PHPCBF, SonarLint et Rector préinstallés — aussi bien pour un nouveau projet que pour une base de code existante.
</TLDR>

Cet article est la version très courte et directe de <Link to="/blog/vscode-devcontainer">PHP development in a devcontainer with preinstalled code quality tools</Link>. Si vous voulez juste suivre quelques étapes et obtenir votre environnement PHP, cet article est pour vous.

<StepsCard
  title="En suivant les étapes décrites dans cet article, vous obtiendrez"
  variant="steps"
  steps={[
    'Un environnement PHP Docker pour coder avec vscode,',
    'Le gestionnaire de packages PHP `composer` installé,',
    'Quelques outils d\'analyse statique comme `php-cs-fixer`, `phpcs`, `phpcbf`, `sonarlint` et `Rector` installés',
    'Un environnement devcontainer prêt à l\'emploi.',
  ]}
/>

Suivez le guide...

<AlertBox variant="caution" title="Le but de cet article est de créer un environnement de développement (aka devcontainer)">
Consultez mes autres articles sur <Link to="/blog/tags/docker">Docker</Link> pour voir comment dockeriser l'application et la faire tourner avec <Link to="/blog/tags/apache">Apache</Link> et un service de base de données comme <Link to="/blog/tags/postgresql">PostgreSQL</Link>.

</AlertBox>

<!-- truncate -->

## Ce que l'environnement vous apporte {#what-the-environment-gives-you}

Voici PHP-CS-Fixer en train de reformater un fichier, dans le container, quelques minutes après le téléchargement — rien d'installé sur ma machine hôte, pas de PHP, pas de Composer, aucune extension à configurer :

![PHP-CS-Fixer](./images/php-cs-fixer.webp)

C'est pareil pour [PHP_CodeSniffer](https://github.com/squizlabs/PHP_CodeSniffer) (`phpcbf.phar`), [Rector](https://github.com/rectorphp/rector) et SonarLint : ils sont déjà dans l'image, déjà configurés via le dossier `.config` livré avec le squelette. Vous trouverez les commandes exactes dans la section *Vous êtes prêt à utiliser les outils* ci-dessous.

Deux façons d'y arriver, selon que vous partez de zéro ou que vous ajoutez ceci à une base de code existante.

## Vous n'avez rien et souhaitez créer un projet entièrement nouveau {#you-have-nothing-and-wish-to-create-a-fully-new-project}

### 1. Installer le squelette php_devcontainer {#1-install-the-php_devcontainer-skeleton}

Pour cet article, je vais créer un dossier temporaire dans `/tmp/devcontainer_php`. N'hésitez pas à adapter le chemin, par exemple `~/my_project`, selon vos besoins.

<Terminal typewriter>
$ mkdir /tmp/devcontainer_php && cd $_
$ curl -LOJ --silent https://github.com/cavo789/php_devcontainer/archive/refs/heads/main.tar.gz
$ tar -xzvf php_devcontainer-main.tar.gz --strip-components 1 && rm -f php_devcontainer-main.tar.gz
</Terminal>

<AlertBox variant="note" title="Télécharger une version spécifique">
Si vous ne voulez pas télécharger la dernière version mais une version précise, indiquez le tag comme ceci : `curl -LOJ --silent https://github.com/cavo789/php_devcontainer/archive/refs/tags/1.0.0.tar.gz`.

</AlertBox>

Vous avez donc téléchargé le code de mon repo [https://github.com/cavo789/php_devcontainer](https://github.com/cavo789/php_devcontainer) dans votre dossier.

### 2. Ouvrir VSCode {#2-open-vscode}

Démarrez VSCode sur votre machine :

<Terminal typewriter>
$ cd /tmp/devcontainer_php
$ code .
</Terminal>

### 3. Passer dans le Dev Container {#3-switch-to-the-dev-container}

VSCode va automatiquement proposer d'ouvrir un Dev Container. Cliquez sur le bouton `Reopen in Container`.

![VSCode propose automatiquement d'ouvrir un Dev Container](./images/vscode_starting.webp)

Si vous n'avez pas ce popup, appuyez simplement sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> pour ouvrir la **Command Palette**, cherchez `Dev Containers: Rebuild and Reopen in Dev Container` et cliquez dessus.

VSCode va maintenant prendre un peu de temps pour construire l'image Docker puis démarrer un container Docker avant que vous puissiez travailler. Cela peut prendre quelques minutes selon la vitesse de votre machine.

### Vous êtes prêt à utiliser les outils {#you-are-ready-to-use-tools}

Appuyez sur <kbd>CTRL</kbd>+<kbd>ù</kbd> pour ouvrir le panneau **Terminal** et tapez-y `/usr/local/bin/php-cs-fixer.phar fix --config /var/www/html/.config/.php-cs-fixer.php index.php` pour lancer [PHP-CS-Fixer](https://github.com/PHP-CS-Fixer/PHP-CS-Fixer) — c'est la commande qui a produit la capture d'écran en haut de cet article.

Vous pouvez aussi lancer `/usr/local/bin/phpcbf.phar --standard=/var/www/html/.config/phpcs.xml /var/www/html/index.php` pour reformater votre code avec PHP_CodeSniffer.

Vous pouvez également lancer Rector avec `vendor/bin/rector process index.php --config .config/rector.php`.

Comme vous le voyez, en trois actions seulement, vous avez téléchargé et installé un environnement PHP fonctionnel avec Docker et VSCode.

## Vous avez déjà un projet existant {#you-already-have-an-existing-project}

Dans un cas réel, vous avez déjà un projet PHP.

Ouvrez un terminal et placez-vous dans le dossier de votre base de code.

Pour cet article, je vais télécharger une très vieille base de code Laravel d'apprentissage réalisée il y a des années :

<Terminal typewriter>
$ cd /tmp
$ git clone https://github.com/cavo789/laravel_todos.git
</Terminal>

Mon projet sera donc dans le dossier `/tmp/laravel_todos`.

Dans le dossier de mon projet, je vais maintenant lancer :

<Terminal typewriter>
$ cd /tmp/laravel_todos
$ curl -LOJ --silent https://github.com/cavo789/php_devcontainer/archive/refs/tags/1.0.0.tar.gz
$ tar -xzvf php_devcontainer-1.0.0.tar.gz --strip-components 1 && rm -f php_devcontainer-1.0.0.tar.gz
</Terminal>

Cela va télécharger les fichiers du devcontainer PHP dans mon projet.

Je lance `code .` pour ouvrir VSCode et, comme avant, VSCode va proposer d'ouvrir le dossier dans un Dev Container. Allons-y.

Et voilà, j'ai dockerisé mon environnement de développement PHP. Dans mon cas, j'ai écrit `Laravel Todos` en 2018, avec PHP 7.1.3 et Laravel 5.x ; une éternité, donc.

Et comme au chapitre précédent, je peux lancer les commandes ci-dessous pour corriger les problèmes de style et traiter tous les fichiers de mon repo :

<Terminal typewriter>
$ /usr/local/bin/php-cs-fixer.phar fix --config /var/www/html/.config/.php-cs-fixer.php .
$ /usr/local/bin/phpcbf.phar --standard=/var/www/html/.config/phpcs.xml .
</Terminal>

Et je **pourrai** lancer Rector pour refactorer toute ma base de code :

<Terminal typewriter>
$ composer require rector/rector --dev
$ vendor/bin/rector process . --config .config/rector.php
</Terminal>

mais dans mon cas, pas tout de suite : mon Laravel Todos est ancien et je dois d'abord modifier mon fichier `composer.json` (mettre à jour les versions de PHP et de Laravel).

## Conclusion {#conclusion}

Un `curl`, un `tar` et un clic sur `Reopen in Container` : c'est toute la distance entre un dossier vide et un environnement PHP où les outils de qualité sont déjà là, dans la même version pour tous ceux qui clonent le repository. Rien n'a été installé sur votre machine, et supprimer le dossier supprime l'environnement.

Même recette, autres stacks : <Link to="/blog/docker-python-devcontainer">Docker - Python devcontainer</Link>. Et quand vient le moment de livrer, <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers - The Clean Way</Link> montre comment garder tout cet outillage hors de votre image de production.
