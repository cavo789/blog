---
slug: docker-run-linux-gui
title: Docker - Lancer des interfaces graphiques - Firefox, Chrome & GIMP
date: 2024-09-06
description: Libérez la puissance de Docker ! Un guide pas à pas pour lancer des interfaces graphiques Linux (GUI) comme Firefox, Chrome et GIMP dans des containers Docker.
authors: [christophe]
image: /img/v2/docker_gui.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore xeyes,xhost,dearmor,dpkg -->
![Docker - Lancer des interfaces graphiques - Firefox, Chrome & GIMP](/img/v2/docker_gui.webp)

<TLDR>
Cet article de suivi montre comment construire ses propres images Docker (en commençant par un exemple minimal avec `xeyes`) qui lancent des applications graphiques Linux — Firefox, Chrome, GIMP — comme des fenêtres natives sur l'host, en partageant la variable d'environnement `DISPLAY` et le socket `/tmp/.X11-unix` avec le container, et en autorisant l'accès au serveur X via `xhost +local:docker`.
</TLDR>

Dans mon <Link to="/blog/docker-gui-in-browser">article précédent</Link>, j'ai illustré comment démarrer Firefox ou GIMP dans un navigateur. C'était la première partie de cette série sur les interfaces graphiques car, jusqu'à très récemment, je ne savais pas qu'il était possible de lancer des GUI avec Docker et c'est tout simplement génial.

<AlertBox variant="info" title="`GUI` signifie `Graphical User Interface`" />

Donc, avec Docker, on peut démarrer Firefox, GIMP ou même... [Doom 2](https://hub.docker.com/r/classiccontainers/doom2). Et si une seule application ne suffit pas, <Link to="/blog/docker-lubuntu">Start lubuntu Desktop in Docker</Link> vous offre un bureau complet.

Dans cet article, nous allons créer notre propre image Docker xeyes, puis jouer avec Firefox et GIMP.

<!-- truncate -->

## Un premier aperçu {#a-first-look}

![xeyes sous Docker](./images/xeyes_in_docker.webp)

Oui, c'est vrai, c'est inutile, mais wow ! il est possible de lancer une GUI depuis un container et de reproduire l'image en temps réel sur notre machine hôte. C'est `xeyes` — une paire d'yeux qui suit votre curseur — qui tourne entièrement dans un container, affiché comme une fenêtre native.

## Pourquoi ça fonctionne {#why-it-works}

- Le container partage la variable d'environnement `DISPLAY` de l'host, il sait donc sur quel affichage X dessiner.
- Le socket `/tmp/.X11-unix` de l'host est monté dans le container ; c'est le canal réel que les applications X11 utilisent pour parler au serveur d'affichage.
- `xhost +local:docker` autorise le socket Docker à se connecter au serveur X de l'host ; sans ça, la connexion est refusée.

## Créer notre propre image Docker xeyes {#creating-our-own-xeyes-docker-image}

Commençons par quelque chose de vraiment geek.

Allez dans un dossier temporaire (p.ex. `mkdir -p /tmp/xeyes && cd $_`) et créez un fichier appelé `Dockerfile` avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Créez maintenant l'image avec docker build comme ceci : `docker build --tag cavo789/xeyes .` (remplacez `cavo789` par autre chose, comme votre pseudo).

Assurez-vous d'avoir une variable appelée `DISPLAY`. Vous pouvez le vérifier en lançant `printenv | grep DISPLAY`. Si vous ne l'avez pas, créez la variable en lançant `export DISPLAY=:0` dans la console.

Lancez ensuite `xhost +local:docker` dans votre console. Cette commande autorise la connexion à un serveur X via le socket Docker. Cela signifie que les applications tournant dans des containers Docker peuvent afficher leur interface graphique (GUI) sur le système hôte. Le résultat attendu est ce texte : `non-network local connections being added to access control list`

Maintenant, lancez simplement un container en veillant à partager la variable `DISPLAY` : `docker run --rm --env DISPLAY=$DISPLAY --volume /tmp/.X11-unix:/tmp/.X11-unix cavo789/xeyes` — vous obtiendrez la fenêtre montrée plus haut.

## Créer notre propre image Docker Firefox {#creating-our-own-firefox-docker-image}

Une fois que vous avez compris l'exemple très basique de xeyes, vous pouvez sortir du cadre : quelle GUI puis-je installer avec Docker ?

Essayons Firefox... En utilisant mon moteur de recherche préféré, j'ai trouvé cet article : [Install Official Firefox .deb in Dockerfile](https://jetthoughts.com/blog/install-official-firefox-deb-in-dockerfile-docker-devops/).

Dans un Dockerfile et avec quelques petites modifications, ça nous donne ceci :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

Pour construire l'image, lancez la commande suivante (et n'oubliez pas de remplacer `cavo789` par votre nom d'utilisateur) : `docker build --tag cavo789/firefox .`.

Et pour démarrer Firefox, lancez simplement `docker run --rm -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY cavo789/firefox`.

![Firefox lancé dans une fenêtre](./images/firefox.webp)

Comme vous le savez, mon OS est Windows 11 et je fais tourner Linux grâce à l'incroyable technologie WSL2. Donc, en bref, ci-dessus, vous voyez que j'ai démarré Firefox pour Debian comme une application fenêtrée dans mon Windows.

Le vieux développeur MS-DOS en moi reste émerveillé par cette possibilité.

## Créer notre propre image Docker Chrome {#creating-our-own-chrome-docker-image}

On peut faire la même chose avec Chrome :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part3" />

Construisez l'image avec `docker build --tag cavo789/chrome .` puis lancez-la avec `docker run --rm -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY cavo789/chrome`.

![Chrome lancé dans une fenêtre](./images/chrome.webp)

## Créer notre propre image Docker GIMP {#creating-our-own-gimp-docker-image}

Bon, maintenant, je pense que vous avez compris le principe. Donc, très rapidement, voici comment lancer GIMP pour Linux dans un container Docker :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part4" />

Créez l'image en lançant `docker build --tag cavo789/gimp .`.

Et pour démarrer GIMP, lancez simplement `docker run --rm -v /tmp/.X11-unix:/tmp/.X11-unix -e DISPLAY=$DISPLAY cavo789/gimp`.

![GIMP pour Linux lancé dans un container Docker](./images/gimp.webp)

## Conclusion {#conclusion}

La même recette à chaque fois — partager `DISPLAY`, monter `/tmp/.X11-unix`, `docker run` — et
n'importe quelle application graphique Linux apparaît comme une fenêtre native sur l'host, que ce
soit une démo idiote comme `xeyes`, un navigateur complet ou un éditeur d'images. Si une seule
application ne suffit pas et que vous préférez un bureau entier pour jouer,
<Link to="/blog/docker-lubuntu">Start lubuntu Desktop in Docker</Link> est l'étape suivante.
