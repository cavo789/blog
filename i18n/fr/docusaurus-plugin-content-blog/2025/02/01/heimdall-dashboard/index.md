---
slug: heimdall-dashboard
title: Heimdall - Dashboard web
date: 2025-02-01
description: Fatigué des vieux favoris de votre navigateur ? Découvrez comment auto-héberger et configurer Heimdall, un superbe dashboard web qui vous donne un accès immédiat et personnalisé à toutes vos applications et liens préférés via Docker.
authors: [christophe]
image: /img/v2/docker_playing_with_app.webp
series: Self-host your own services
mainTag: self-hosted
tags:
  - docker
  - self-hosted
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lwgbxok2ys2i
---
<!-- cspell:ignore puid,pgid,Bitwarden -->

![Heimdall - Dashboard web](/img/v2/docker_playing_with_app.webp)

<TLDR>
Fatigué de vos favoris de navigateur en désordre ? Cet article présente Heimdall, un dashboard web auto-hébergeable et agréable à l'œil pour organiser vos applications et liens préférés. Apprenez à déployer Heimdall rapidement avec Docker et un simple fichier `compose.yaml`. Le guide vous accompagne dans la configuration initiale : personnaliser l'apparence, créer des tags d'organisation et ajouter vos premières applications. Il explique aussi comment faire en sorte que la configuration de votre dashboard survive à la suppression du container.
</TLDR>

> [https://heimdall.site/](https://heimdall.site/)

Je n'ai jamais été un grand fan des favoris du navigateur et, de fait, je n'en ai presque aucun. Et, assez logiquement, je n'affiche presque jamais la barre des favoris.

Je ne visite régulièrement que quelques sites et l'historique de mon navigateur s'en souvient ; sinon, un célèbre moteur de recherche s'en souvient pour moi.

Cela dit, je ne suis pas contre une page d'accueil personnalisée et Heimdall me convient très bien pour le moment.

<!-- truncate -->

Heimdall est une application web que vous pouvez auto-héberger (et c'est un jeu d'enfant avec Docker) sur votre ordinateur.

Voici la démo officielle :

![Heimdall - Dashboard web](./images/heimdall.gif)

Vous allez définir le look&feel de votre page d'accueil en indiquant les liens auxquels vous voulez un accès immédiat et, pour les autres, vous les classerez dans des dossiers. Rien de compliqué.

Mais cela vous donne une manière bien plus agréable d'accéder à vos sites que la gestion dépassée des favoris. C'est peut-être une des choses qui n'ont pas changé depuis trente ans.

## Créer votre dashboard {#creating-your-dashboard}

<Vars port="80" labels={{ port: "Port de l'host" }} />

Créez un dossier de test et placez-vous dedans :

<Terminal>
$ mkdir ~/tools/dashboard && cd $_
</Terminal>

Dans ce dossier, créez un fichier appelé `compose.yaml` avec le contenu suivant (voir la [page officielle Docker Hub](https://hub.docker.com/r/linuxserver/heimdall/) pour la dernière version) :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="note">
Dans le code ci-dessus, j'ai préféré la syntaxe `PUID=${USER_ID:-1000}` et `PGID=${GROUP_ID:-1000}` plutôt que de coder en dur `1000` : sur mon ordinateur, mon id utilisateur Linux est `1002` et pas `1000`, donc je préfère utiliser une variable et, si elle n'est pas définie, utiliser `1000` par défaut. Pareil pour l'id du groupe.
</AlertBox>

## Lancer le dashboard {#running-the-dashboard}

Une fois le fichier `compose.yaml` créé, lancez simplement cette commande : `USER_ID=$(id -u) GROUP_ID=$(id -g) docker compose up --build --detach`.

Cette commande va définir nos deux variables `USER_ID` et `GROUP_ID`, les initialiser avec vos propres valeurs puis démarrer le container.

<AlertBox variant="note">
Si vous avez codé les IDs en dur dans le fichier `compose.yaml`, par ex. `1000` (parce que vous savez que ce sont vos IDs), alors la commande devient plus courte : `docker compose up --build --detach`

</AlertBox>

## Premier lancement {#first-run}

Une fois la commande `docker compose up --build --detach` lancée, le container est déjà créé, c'est-à-dire que vous pouvez déjà aller sur `http://localhost` pour voir le résultat.

<BrowserWindow url="http://localhost">
  <img
    alt="La page d'accueil par défaut"
    src={require("./images/welcome.webp").default}
  />
</BrowserWindow>

Amusons-nous : cliquez sur le dernier bouton en bas à droite (l'icône des paramètres) et, sous `Appearance`, chargeons une nouvelle image de fond.

<BrowserWindow url="http://localhost">
  <img
    alt="Mon propre fond d'écran"
    src={require("./images/welcome_2.webp").default}
  />
</BrowserWindow>

C'est beaucoup plus sympa, non ?

### Sauvegarder la configuration sur le disque {#saving-the-configuration-on-disk}

Avez-vous remarqué que, dans le fichier `compose.yaml`, il y a une section appelée `volumes` avec la configuration suivante ?

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Cela signifie que le dossier `config` de Heimdall sera stocké sur votre disque, dans un dossier appelé `config` lui aussi. *C'est le <Link to="/blog/docker-volume">mécanisme des volumes</Link> en action.*

Je peux le vérifier en lançant `ls -alh` sur mon host :

<Terminal typewriter>
Permissions Size User       Group      Date Modified    Name
drwxr-xr-x     - christophe christophe 2025-01-26 10:36 config
.rw-r--r--   284 christophe christophe 2025-01-26 10:36 compose.yaml
</Terminal>

Et donc, tout ce que je ferai dans Heimdall sera sauvegardé sur mon ordinateur. Autrement dit, si je dois arrêter et supprimer le container Docker, il me suffira de le relancer pour retrouver tous mes réglages.

### Ajouter quelques liens {#adding-some-links}

Je vous suggère, avant d'ajouter de nouveaux liens, de cliquer d'abord sur l'icône Tags (la cinquième icône en bas à droite) parce que vous allez organiser vos liens avec des tags et qu'il faut donc créer les tags d'abord.

<BrowserWindow url="http://localhost">
  <img
    alt="Ajouter des tags"
    src={require("./images/tags.webp").default}
  />
</BrowserWindow>

Ajoutez autant de tags que vous voulez. Pour ce tutoriel, je n'en crée qu'un.

Quand c'est fini, cliquez sur le bouton `Cancel` en haut à droite ou sur le quatrième bouton en bas à droite (appelé `Application list`).

Créez une nouvelle application. Vous pouvez choisir entre un `Application type` et un `Website`. Dans mon usage actuel, je choisis toujours `Website`. Je remplis ensuite l'URL et je clique sur `Go`.

Heimdall va extraire le favicon en différentes tailles. Je clique sur celle que je veux.

<BrowserWindow url="http://localhost">
  <img
    alt="Ajouter Docker"
    src={require("./images/adding_docker.webp").default}
  />
</BrowserWindow>

Heimdall a automatiquement rempli quelques propriétés dans la partie basse de l'écran. Je vais retirer `Home dashboard` de la zone `Tags` et taper `Docker` à la place, c'est-à-dire le tag que j'ai créé précédemment.

<BrowserWindow url="http://localhost">
  <img
    alt="Ajouter Docker"
    src={require("./images/application_docker.webp").default}
  />
</BrowserWindow>

Après sauvegarde, j'obtiens ma nouvelle page d'accueil :

<BrowserWindow url="http://localhost">
  <img
    alt="Page d'accueil avec Docker"
    src={require("./images/homepage_docker.webp").default}
  />
</BrowserWindow>

On voit que les tags sont représentés comme des dossiers. Si je clique dessus, j'*entre* dans le *dossier* et je vois toutes les applications portant ce tag.

Je peux aussi ajouter des applications qui apparaîtront directement sur la page d'accueil (comme des raccourcis sur votre bureau). Pour cela, créez une nouvelle application et gardez `Home dashboard` dans la liste des tags.

Explorons cette fonctionnalité `Application Type` :

<BrowserWindow url="http://localhost">
  <img
    alt="Type d'application"
    src={require("./images/application_type.webp").default}
  />
</BrowserWindow>

C'est juste une sorte de snippet. Si je sélectionne `Bitwarden` là-dedans, Heimdall va faire quelques initialisations de base : il va remplir le champ `Application name` et l'icône. Bon, pourquoi pas.

Je fais pointer l'URL vers `https://vault.bitwarden.com/#/login` et je garde `Home dashboard` comme tag.

<BrowserWindow url="http://localhost">
  <img
    alt="Avec Bitwarden"
    src={require("./images/bitwarden.webp").default}
  />
</BrowserWindow>

Voici le dashboard que j'utilise au travail. Comme c'est très facile d'ajouter de nouveaux éléments, je le modifie dès que je travaille sur un nouveau projet.

<BrowserWindow url="http://localhost">
  <img
    alt="Dashboard Heimdall final"
    src={require("./images/final.webp").default}
  />
</BrowserWindow>

### Plus de personnalisations {#more-customizations}

En cliquant sur la dernière icône en bas à droite, vous pouvez personnaliser encore quelques éléments dans Heimdall. Vous pouvez afficher par ex. un moteur de recherche, ce qui est pratique.

Vous pouvez personnaliser le CSS et ajouter du JS aussi.

## Pour aller plus loin {#continue-your-journey}

Visitez le site officiel [https://heimdall.site/](https://heimdall.site/) pour les mises à jour et la documentation.

Deux autres applications auto-hébergées que je fais tourner à côté de Heimdall : <Link to="/blog/docker_uptime_kuma">Uptime Kuma</Link>, pour savoir quand un de ces liens est hors service, et <Link to="/blog/docker-memos">Memos</Link> pour la prise de notes.

Trouvez l'inspiration en cherchant **dashboard heimdall homepage** dans [Google Images](https://www.google.com/search?sca_esv=e645136bb336bc61&q=dashboard+heimdall+homepage&udm=2).
