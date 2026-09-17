---
slug: docker-gui-in-browser
title: Docker - Exécuter des interfaces graphiques dans le navigateur
date: 2024-09-05
description: Lancez facilement des applications Linux graphiques comme Firefox et GIMP dans un container Docker et accédez-y directement depuis votre navigateur web avec ces quelques commandes.
authors: [christophe]
image: /img/v2/docker_gui.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore seccomp,pgid,puid -->
![Docker - Exécuter des interfaces graphiques dans le navigateur](/img/v2/docker_gui.webp)

<TLDR>
Cet article montre comment exécuter des applications Linux graphiques comme Firefox et GIMP dans des containers Docker et accéder à leur interface directement depuis un navigateur web (via `http://localhost:3000`), en utilisant les images `linuxserver/firefox` et `linuxserver/gimp` — pratique pour tester un site dans une version précise d'un navigateur sans l'installer.
</TLDR>

Dans un prochain article, je vais aborder un sujet que je viens de découvrir : la possibilité de lancer des interfaces graphiques dans Docker et, donc, d'avoir une application Linux qui tourne sous Windows. *Cet article est maintenant écrit : <Link to="/blog/docker-run-linux-gui">Docker - Run Graphical User Interfaces - Firefox, Chrome & GIMP</Link>, où les applications s'affichent comme de vraies fenêtres et non dans un onglet de navigateur.*

Mais d'abord, regardons quelques interfaces graphiques, comme Firefox ou GIMP (logiciel de traitement d'images), qui peuvent être lancées comme s'il s'agissait d'applications web.

<!-- truncate -->

## Démarrer Firefox dans votre navigateur {#start-firefox-in-your-browser}

<Vars
  port="3000"
  port_alt="3001"
  labels={{ port: "Port de l'interface web", port_alt: "Port secondaire" }}
/>

Imaginez que vous soyez développeur web et que vous vouliez juste vérifier si votre site s'affiche correctement sur une version précise de Firefox (sans devoir installer cette version, bien sûr). La voici, qui tourne dans un container et s'affiche directement dans Chrome :

<BrowserWindow url="http://localhost:%%port=3000%%">
  ![Démarrer Firefox dans Docker depuis Chrome](./images/firefox_in_chrome.webp)
</BrowserWindow>

Pour reproduire ceci, copiez/collez la commande ci-dessous dans votre console (elle vient de [https://hub.docker.com/r/linuxserver/firefox](https://hub.docker.com/r/linuxserver/firefox)) :

<Terminal typewriter source="./files/terminal-2.txt" />

Ouvrez ensuite votre navigateur et rendez-vous sur `http://localhost:`<Var name="port">3000</Var> pour démarrer Firefox. Vous pouvez alors surfer sur n'importe quel site formidable.

 <AlertBox variant="info" title="Sur ma capture ci-dessus, vous verrez que j'utilise plutôt le port 5000 (parce que mon blog tourne sur le port 3000)" />

Et, pour le fun, voici la même chose mais j'ai démarré Firefox dans Docker depuis un environnement MS-DOS et j'ai ensuite utilisé Edge au lieu de Chrome :

<BrowserWindow url="http://localhost:%%port=3000%%">
  ![Démarrer Firefox dans Docker depuis Edge](./images/firefox_in_edge.webp)
</BrowserWindow>

La commande que j'ai utilisée sous DOS est : `docker run -d --name=firefox --security-opt seccomp=unconfined -e PUID=1000 -e PGID=1000 -e TZ=Etc/UTC -e FIREFOX_CLI=https://www.linuxserver.io/ -p ` <Var name="port">3000</Var>`:3000 -p ` <Var name="port_alt">3001</Var>`:3001 -v %CD%\temp:/config --shm-size="1gb" --restart unless-stopped lscr.io/linuxserver/firefox:latest`.

## Démarrer GIMP dans votre navigateur {#start-gimp-in-your-browser}

Autre exemple : lancer GIMP (logiciel de traitement d'images) dans le navigateur :

<BrowserWindow url="http://localhost:%%port=3000%%">
  ![GIMP qui tourne dans Docker](./images/gimp_in_docker.webp)
</BrowserWindow>

Jetez un œil à [https://github.com/linuxserver/docker-gimp?tab=readme-ov-file#docker-cli-click-here-for-more-info](https://github.com/linuxserver/docker-gimp?tab=readme-ov-file#docker-cli-click-here-for-more-info). Vous y trouverez une commande à lancer dans votre console.

Commencez par créer un sous-dossier appelé `config` et, dans mon exemple ci-dessous, je crée aussi un sous-dossier `images` où j'ai copié un avatar de suricate.

<Terminal typewriter source="./files/terminal-1.txt" />

Comme tout à l'heure, démarrez maintenant votre navigateur et rendez-vous sur `http://localhost:`<Var name="port">3000</Var> pour lancer GIMP — c'est la capture ci-dessus.

La version MS-DOS de la ligne de commande est : `docker run -d --name=gimp --security-opt seccomp=unconfined -e PUID=1000 -e PGID=1000 -e TZ=Etc/UTC -p ` <Var name="port">3000</Var>`:3000 -p ` <Var name="port_alt">3001</Var>`:3001 -v %CD%/config:/config -v ./images:/images -w /images --restart unless-stopped lscr.io/linuxserver/gimp:latest`.

## Conclusion {#conclusion}

Deux commandes `docker run`, deux applications graphiques dans un onglet de navigateur — pas d'installation, pas de nettoyage. Si vous préférez que ces applications s'ouvrent comme de vraies fenêtres sur votre bureau plutôt que dans un onglet,
<Link to="/blog/docker-run-linux-gui">Docker - Run Graphical User Interfaces - Firefox, Chrome & GIMP</Link> couvre cette variante.
