---
slug: docker-init
title: Docker init supporte maintenant PHP
date: 2023-12-07
description: Containerisez votre application PHP rapidement ! Ce guide vous montre comment utiliser la nouvelle fonctionnalité docker init avec PHP et Apache, avec une explication des fichiers Dockerfile et compose.yaml générés.
authors: [christophe]
image: /img/v2/docker_init.webp
mainTag: php
tags:
  - docker
  - php
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore dbmdl -->
![Docker init supporte maintenant PHP](/img/v2/docker_init.webp)

<TLDR>
Cet article teste le nouveau template PHP+Apache de `docker init` livré avec Docker Desktop 4.26, qui génère un `Dockerfile`, un `compose.yaml` et un `.dockerignore` via un assistant interactif. On y voit un bug de cette première version (l'instruction `COPY` n'avait pas son chemin source) et pourquoi `.dockerignore` empêche la plupart des fichiers locaux de se retrouver dans l'image construite.
</TLDR>

Quelle heureuse et étrange coïncidence. Dans sa nouvelle version (4.26) sortie hier *(le jour de mon anniversaire)*, Docker ajoute le support de **PHP avec Apache** à son instruction `docker init`. Voyons ce que ça donne dans un cas pratique.

<!-- truncate -->

> L'article officiel : [https://www.docker.com/blog/docker-desktop-4-26/](https://www.docker.com/blog/docker-desktop-4-26/)

<AlertBox variant="caution">
On va essayer mais, spoiler, c'est encore très jeune.

</AlertBox>

Démarrez un shell Linux et lancez `mkdir -p /tmp/docker-init && cd $_` pour créer un dossier `docker-init` dans votre dossier temporaire Linux et vous y placer.

Maintenant, dans votre console, lancez simplement `docker init` et suivez l'assistant.

<Terminal typewriter source="./files/terminal-4.txt" />

Veillez à sélectionner `PHP with Apache - suitable for a PHP web application`.

Pour les questions suivantes :

- `What version of PHP do you want to use?`, entrez par exemple `8.2`,
- `What's the relative directory for your app?`, appuyez simplement sur Entrée pour sélectionner le dossier courant,
- `What local port do you want to use to access your server?`, appuyez sur Entrée pour utiliser le port proposé ou entrez par exemple `8080`.

<Terminal typewriter source="./files/terminal-3.txt" />

L'assistant est plutôt direct et, au final, on obtient quatre fichiers.

Deux sont vraiment importants pour l'instant : `compose.yaml` et `Dockerfile`.

## compose.yaml {#composeyaml}

En ouvrant `compose.yaml` avec Visual Studio Code, vous verrez beaucoup de commentaires.

Par défaut, tout est commenté sauf :

<Vars port="8080" labels={{ port: "Port hôte" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Ok, ça veut simplement dire qu'on n'utilisera pas une image Docker standard, déjà existante, mais qu'on va construire la vôtre et que la définition de cette image se trouve dans le dossier courant (`context: .`). La définition de votre image Docker doit être écrite dans le fichier standard `Dockerfile`.

La deuxième chose qu'on voit ici, c'est le numéro de port choisi. Le container Docker sera publié sur le port <Var name="port">8080</Var>.

## Dockerfile {#dockerfile}

Ici aussi, `docker init` a créé un fichier avec beaucoup de commentaires. Si on les retire, voici les lignes non commentées :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<AlertBox variant="danger" title="Bug dans Docker 4.26 - Docker init - PHP + Apache">
Il y a un bug dans la release `4.26` : l'instruction `COPY` doit être `COPY . /var/www/html` (autrement dit, il faut préciser le dossier source `.`). J'ai créé une issue sur le repository Docker ([https://github.com/docker/cli/issues/4702](https://github.com/docker/cli/issues/4702))

Mettez à jour le fichier `Dockerfile` et remplacez la ligne `COPY /var/www/html` par `COPY . /var/www/html`

</AlertBox>

On voit donc qu'on va utiliser l'image `php:8.2-apache` (puisqu'on a demandé PHP `8.2`), qu'on va copier le contenu de votre dossier courant (`.`) vers le dossier `/var/www/html` dans l'image Docker, qu'on va aussi utiliser le fichier `php.ini` de production (voyez <Link to="/blog/docker-php-ini">Update php.ini when using a Docker image</Link> si vous devez l'ajuster) et qu'on va basculer l'utilisateur Linux courant dans le container vers `www-data`.

## Lancer le container {#run-the-container}

Ok, rien de bien compliqué jusqu'ici. On va créer l'image en lançant `docker compose up --build`.

Une fois construite, on peut surfer sur `http://localhost:`<Var name="port">8080</Var> et ... aïe.

<BrowserWindow url="http://localhost:%%port=8080%%">
  ![Forbidden](./images/forbidden.webp)
</BrowserWindow>

**Et c'est tout à fait normal.** Rappelez-vous, votre dossier courant ne contient pour l'instant que les quatre fichiers créés par `docker init`.

Créez le fichier `index.php` avec ce contenu :

<Snippet filename="index.php" source="./files/index.php" />

Retournez dans votre console, appuyez sur <kbd>CTRL</kbd>-<kbd>C</kbd> pour arrêter le premier container et lancez cette fois `docker compose up --detach --build` (comme ça la console ne sera pas bloquée et le container tournera en arrière-plan).

<BrowserWindow url="http://localhost:%%port=8080%%">
  ![phpinfo](./images/phpinfo.webp)
</BrowserWindow>

## Entrer dans le container {#enter-in-the-container}

On va démarrer un shell interactif dans le container. Il suffit de savoir comment le container est nommé.

Retour au fichier `compose.yaml` : on y retrouve le nom du container ; c'est le nom du service, `server` dans ce cas.

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Pour lancer un shell interactif, exécutez la commande suivante :

<Terminal typewriter>
$ docker compose exec server /bin/bash
www-data@86e3fd14ea18:~/html$
</Terminal>

Comme prévu, vous êtes maintenant dans le container. Vous pouvez afficher la liste des fichiers en lançant `ls -alh`

<Terminal typewriter source="./files/terminal-2.txt" />

Donc, même si votre dossier courant, sur votre machine, contient maintenant cinq fichiers, seuls `README.Docker.md` et `index.php` sont présents. Pourquoi pas les autres ?

## .dockerignore {#dockerignore}

Sur votre machine, on a donc cinq fichiers :

<Terminal typewriter source="./files/terminal-1.txt" />

Et seuls `README.Docker.md` et `index.php` ont été copiés dans le container.

La raison : les autres fichiers ont été ignorés parce qu'ils sont mentionnés dans le fichier `.dockerignore`.

<Snippet filename=".dockerignore" source="./files/.dockerignore" />

Nous voilà à la fin de cet article. On a utilisé l'instruction `docker init` pour créer le strict minimum nécessaire à l'exécution d'un script PHP dans un container Apache.

*Si tout ce que vous voulez, c'est lancer un script rapidement, sans aucun fichier généré, <Link to="/blog/docker-php-run-script-or-website">The easiest way to run a PHP script / website</Link> tient en une seule ligne.*

Dans les prochains mois, je garderai un œil sur l'évolution de `docker init` du côté de PHP.
