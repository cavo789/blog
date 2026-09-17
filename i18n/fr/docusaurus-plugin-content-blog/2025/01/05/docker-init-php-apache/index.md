---
slug: docker-init-php-apache
title: Utiliser Docker init pour dockeriser rapidement votre application PHP
date: 2025-01-05
description: Dockerisez rapidement votre application PHP avec Apache grâce à la commande docker init. Cet outil sous forme d'assistant génère les fichiers Docker nécessaires et montre comment intégrer une base de données de façon sécurisée.
authors: [christophe]
image: /img/v2/docker_init.webp
mainTag: docker
tags:
  - apache
  - docker
  - php
  - security
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore dbmdl -->
![Utiliser Docker init pour dockeriser rapidement votre application PHP](/img/v2/docker_init.webp)

<TLDR>
Apprenez à dockeriser rapidement une application PHP et Apache existante avec la commande `docker init`. Ce guide vous fait passer par l'assistant interactif qui génère automatiquement vos fichiers `Dockerfile`, `compose.yaml` et `.dockerignore`. La démonstration s'appuie sur un script PHP d'exemple, montre comment lancer l'application fraîchement containerisée et explique le rôle de chaque fichier généré. L'article donne aussi une astuce pour étendre la configuration et ajouter un service de base de données de manière sécurisée avec les Docker Secrets.
</TLDR>

Et si on demandait à Docker de créer lui-même les fichiers dont il a besoin ?

Si vous lisez régulièrement ce blog, vous savez désormais qu'il faut un `Dockerfile` pour décrire comment l'image Docker doit être créée et ce qu'elle doit contenir, et très souvent il vous faut aussi un fichier `compose.yaml` pour expliquer comment le container doit être créé : quel port mapper, quels volumes utiliser, etc.

Imaginez que vous avez une application PHP existante et que vous n'avez pas envie de créer à la main les fichiers nécessaires à la dockerisation.

Vous voulez juste, très vite et via un assistant, répondre à quelques questions et hop, c'est prêt.

La commande `docker init` est exactement ce que vous cherchez. *Je l'avais déjà essayée une première fois, à l'époque où le support de PHP venait d'arriver, dans <Link to="/blog/docker-init">Docker init now supports PHP</Link> ; cet article y revient sur une vraie application.*

<!-- truncate -->

## Récupérer les scripts {#get-some-scripts}

À titre d'illustration, je vais utiliser mon projet <Link to="/blog/aesecure-quickscan">aeSecure - QuickScan - Free viruses scanner</Link> déjà présenté sur ce blog.

Il s'agit d'une application web qui analyse des fichiers (un site local) à la recherche de motifs pouvant indiquer la présence d'un virus.

Donc, pour faire tourner aeSecure QuickScan, il nous faut PHP et Apache.

C'est parti...

D'abord, on crée un dossier temporaire et on récupère une copie du script :

<Terminal typewriter>
$ mkdir -p /tmp/aesecure_quickscan && cd $_
$ curl https://raw.githubusercontent.com/cavo789/aesecure_quickscan/master/aesecure_quickscan.php -o index.php
</Terminal>

Vous avez maintenant une version locale du script. C'est un unique script `index.php` ; rien de plus à ce stade.

## La commande docker init {#docker-init}

<Vars port="8080" labels={{ port: "Host port" }} />

Lancez simplement `docker init` dans la console :

![Starting docker init](./images/docker_init.webp)

Comme on le voit, Docker init a déjà détecté la présence d'un fichier PHP et propose donc **PHP with Apache**. Parfait, appuyez sur <kbd>Enter</kbd>.

La question suivante porte sur la version de PHP : saisissez celle que vous voulez (par exemple `8.2`) et appuyez sur <kbd>Enter</kbd>.

La troisième question porte sur le chemin relatif à utiliser pour le projet. Dans notre cas, le script PHP se trouve à la racine du projet (et pas dans `/app` par exemple), donc appuyez simplement sur <kbd>Enter</kbd>.

Vous devez ensuite indiquer quel port sera utilisé pour l'application ; j'utilise le port <Var name="port">8080</Var> mais vous pouvez prendre celui que vous voulez (du moment qu'il est libre).

Et voilà.

![Docker init has created our files](./images/docker_init_done.webp)

C'est trop simple, non ? Essayons les commandes suggérées et voyons si le site fonctionne vraiment.

D'abord, créez le container en exécutant la commande `docker compose up --build` puis, une fois terminé, ouvrez votre navigateur et rendez-vous sur votre site local (dans mon cas `http://localhost:`<Var name="port">8080</Var>) et ...

<BrowserWindow url="http://localhost:%%port=8080%%">
  <img
    alt="The application is running"
    src={require("./images/localhost.webp").default}
  />
</BrowserWindow>

## Regardons les fichiers créés {#lets-take-a-look-on-created-files}

### Le fichier .dockerignore {#dockerignore}

Le fichier `.dockerignore` indique les fichiers et répertoires à exclure des builds Docker. Ainsi, lors de la création d'une image Docker, vous ne voulez certainement pas, par exemple, que le dossier `.git` soit copié dans l'image. Ce dossier (et bien d'autres) doit rester sur la machine.

En ouvrant ce fichier avec un éditeur de code, vous verrez cette ligne :

<Snippet filename=".dockerignore" source="./files/.dockerignore" />

Voyez [https://docs.docker.com/go/build-context-dockerignore/](https://docs.docker.com/go/build-context-dockerignore/) pour plus d'explications.

### Le fichier compose.yaml {#composeyaml}

<AlertBox variant="note">
Auparavant, le fichier s'appelait `docker-compose.yaml` (ou `docker-compose.yml`).

</AlertBox>

Ce fichier explique à Docker comment faire fonctionner ensemble plusieurs containers, par exemple notre application PHP et un service de base de données.

En ouvrant le fichier, vous verrez que pour l'instant, les seules lignes non commentées sont celles-ci :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Le reste est juste là à titre d'illustration.

Voyez [https://docs.docker.com/go/compose-spec-reference/](https://docs.docker.com/go/compose-spec-reference/) pour plus d'explications.

### Le fichier Dockerfile {#dockerfile}

Il y a beaucoup de lignes commentées ; si on regarde les lignes non commentées, on obtient ceci :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

On va donc utiliser l'image Docker PHP 8.2 livrée avec Apache (une seule image contenant PHP et Apache).

On copie tous les fichiers de notre projet (souvenez-vous, notre projet est stocké dans le dossier `/tmp/aesecure_quickscan`) dans le dossier `/var/www/html` de l'image. Tous les fichiers ? Non, c'est inexact. Rappelez-vous le fichier `.dockerignore` : on copie tous les fichiers qui n'y sont pas mentionnés.

Docker se charge aussi de renommer le fichier standard `php.ini-production` en `php.ini`.

La dernière commande sert à basculer vers l'utilisateur `www-data` (ainsi le container ne tournera pas en tant que `root`).

Voyez [https://docs.docker.com/go/dockerfile-reference/](https://docs.docker.com/go/dockerfile-reference/) pour plus d'explications.

### Le fichier README.Docker.md {#readmedockermd}

Comme pense-bête sur la façon d'utiliser votre application dockerisée, ce fichier vous donne les commandes essentielles à exécuter.

## Les fichiers générés vous appartiennent {#generated-files-are-yours}

Les fichiers générés ne seront pas modifiés par Docker tant que vous ne relancez pas `docker init`. Autrement dit, vous pouvez y apporter toutes les modifications que vous voulez sans les perdre. C'est une excellente façon de dockeriser rapidement une application.

L'exemple donné dans cet article est un projet autonome, donc `docker init` fait toute la magie. Si nous avions eu besoin d'une base de données, il aurait suffi de revenir au fichier `compose.yaml` et de décommenter les lignes ci-dessous :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

<AlertBox variant="info" title="Les Docker secrets sont utilisés ici">
Hé ! Vous avez vu ? Au lieu d'écrire le mot de passe en dur dans le fichier, `docker init` a utilisé un secret. C'est malin.

</AlertBox>

<AlertBox variant="info" title="Lisez mon article Docker secrets - Using your SSH key during the build process si vous ne savez pas ce qu'est un secret" />

Pour que l'exemple ci-dessus fonctionne, créez simplement un dossier `db` avec dedans un fichier `password.txt` et collez-y le mot de passe de votre base de données.

Bien sûr, les fichiers générés par `docker init` ne sont que des squelettes : vous pouvez changer ce que vous voulez. Donc si vous ne souhaitez pas utiliser les secrets, pas de souci, vous pouvez écrire le mot de passe en dur ; c'est vous qui voyez.
