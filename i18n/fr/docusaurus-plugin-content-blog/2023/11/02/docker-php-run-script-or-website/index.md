---
slug: docker-php-run-script-or-website
title: La façon la plus simple de lancer un script / site PHP
date: 2023-11-02
description: La façon la plus simple de lancer un script ou un site PHP standard instantanément avec Docker. Une seule commande docker run et votre code est en ligne pour un test rapide.
authors: [christophe]
image: /img/v2/php_tips.webp
mainTag: php
tags:
  - docker
  - php
  - wsl
language: fr
updates:
  - date: 2026-07-30
    note: "Updated PHP image from php:8.3-apache (EOL Dec 2022) to php:8.3-apache."
---
![La façon la plus simple de lancer un script / site PHP](/img/v2/php_tips.webp)

<TLDR>
Cet article montre la manière la plus rapide de lancer un script ou un site PHP standard en local : déposez le code dans un dossier et lancez `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.3-apache`, puis rendez-vous sur `http://127.0.0.1:8080` — aucune installation locale de PHP ou d'Apache nécessaire, et changer le tag de l'image suffit à changer de version de PHP instantanément.
</TLDR>

Imaginez la situation : vous voulez exécuter un bout de code PHP standard (sans aucune dépendance) comme celui ci-dessous :

<Snippet filename="index.php" source="./files/index.php" />

<!-- truncate -->

Le plus simple est de :

- Créer un répertoire temporaire avec `mkdir /tmp/snippet && cd $_`,
- Y créer un fichier `index.php` (avec votre snippet comme ci-dessus),
- Lancer cette commande dans la console : `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.3-apache` et,
- Ouvrir `http://127.0.0.1:8080`.

C'est fait.

Quelques explications sur la commande `docker run -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.3-apache` :

- Nous voulons rendre le site local accessible sur le port 8080 (donc `http://127.0.0.1:8080`),
- Nous voulons synchroniser le dossier courant (c'est-à-dire `/tmp/snippet`) avec le container Docker, ainsi toute modification d'un fichier dans `/tmp/snippet` sera immédiatement reflétée dans Docker et donc dans votre navigateur,
- Et nous voulons utiliser `php:8.3-apache`. Remplacez simplement par `php:8.4-apache` par exemple pour passer à une version plus récente.

Trois choses qui vous serviront ensuite : <Link to="/blog/docker-php-ini">Update php.ini when using a Docker image</Link> quand les réglages par défaut sont trop serrés, <Link to="/blog/docker-init">Docker init now supports PHP</Link> pour transformer cette ligne de commande en un vrai `Dockerfile` + `compose.yaml`, et <Link to="/blog/php-jakzal-phpqa">jakzal/phpqa</Link> pour lancer tous les outils de qualité PHP sur ce code — toujours sans rien installer.

*Pour un site sans PHP du tout, <Link to="/blog/docker-html-site">Running an HTML site in seconds using Docker</Link> est la version encore plus légère.*
