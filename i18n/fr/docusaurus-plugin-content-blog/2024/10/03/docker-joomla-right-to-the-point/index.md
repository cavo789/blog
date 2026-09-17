---
slug: docker-joomla-right-to-the-point
title: Démarrer Joomla avec Docker en quelques clics
date: 2024-10-03
description: Lancez votre site Joomla avec Docker en quelques clics ! Suivez ce guide rapide et direct pour démarrer votre projet Joomla instantanément grâce à une configuration Docker Compose toute simple.
authors: [christophe]
image: /img/v2/joomla.webp
series: Create your joomla website using Docker
mainTag: joomla
tags:
  - database
  - docker
  - joomla
  - makefile
language: fr
review_date: 2026-07-30
---
![Démarrer Joomla avec Docker en quelques clics](/img/v2/joomla.webp)

<TLDR>
Voici un guide minimaliste, sans fioritures, pour lancer Joomla avec Docker : copiez le snippet officiel `compose.yaml` depuis Docker Hub, lancez `docker compose up --detach` et connectez-vous sur `http://127.0.0.1:8080/administrator` avec les identifiants par défaut `joomla`/`joomla@secured` définis dans ce fichier.
</TLDR>

Hier midi, en discutant avec un ami, il m'a lancé un défi tout simple : expliquer la manière la plus facile au monde de démarrer un projet Joomla avec Docker.

L'objectif : hop, hop, on copie/colle un fichier, hop, Joomla est lancé et vous pouvez commencer à jouer avec le site.

*Trois choses dont vous aurez envie très vite : un <Link to="/blog/docker-volume">volume</Link> pour que le site survive à un `docker compose down`, <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Adminer ou phpmyadmin</Link> pour regarder à l'intérieur de la base de données, et <Link to="/blog/docker-php-ini">Update php.ini when using a Docker image</Link> le jour où Joomla refusera votre upload de fichier parce qu'il est trop gros.*

Regardons ça ; pas en détail, mais droit au but.

<!-- truncate -->

<StepsCard
  title="Voici les quelques étapes à suivre pour démarrer votre site Joomla avec Docker :"
  variant="steps"
  steps={[
    'Rendez-vous sur <a href="https://hub.docker.com/_/joomla">https://hub.docker.com/_/joomla</a>',
    'Descendez jusqu\'à voir le contenu `yaml` et cliquez sur le bouton `Copy`. Ce bouton apparaît quand le pointeur de la souris survole le texte (il est caché sinon)',
    'Sur votre ordinateur, créez un nouveau fichier appelé `compose.yaml` et collez-y le contenu',
    'Le plus difficile arrive maintenant : ouvrez une nouvelle console et allez dans le dossier où vous venez de créer le fichier (dans mon cas, j\'ai créé le fichier dans mon dossier `/tmp/joomla`, donc j\'y saute avec `cd /tmp/joomla`)',
    'Toujours dans votre console, lancez `docker compose up --detach`.'
  ]}
/>

À partir de là, Docker va télécharger (uniquement la première fois) le CMS Joomla, PHP, Apache et MySQL. Ensuite, Docker démarrera les images téléchargées (appelées containers).

Rendez-vous sur `http://127.0.0.1:8080/administrator` et profitez !

<BrowserWindow url="http://127.0.0.1:8080/administrator">
  ![Administration Joomla](./images/administrator.webp)
</BrowserWindow>

<AlertBox variant="caution">
Le compte admin à utiliser est `joomla` et son mot de passe est `joomla@secured` (tel que défini dans le fichier yaml que vous venez de copier).

</AlertBox>

<AlertBox variant="info">
Cet article est volontairement simple ; suivez le tag <Link to="/blog/tags/joomla">Joomla</Link> si vous voulez aller plus loin que cette introduction.

</AlertBox>
