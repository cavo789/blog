---
slug: docker-karakeep
title: karakeep - L'application pour tout mettre en favori
date: 2025-07-18
description: Découvrez karakeep, le gestionnaire auto-hébergé de favoris, de notes et d'images. Suivez ce guide simple pour l'installer avec Docker Compose.
authors: [christophe]
image: /img/v2/docker_playing_with_app.webp
series: Self-host your own services
mainTag: self-hosted
tags:
  - docker
  - self-hosted
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lujtc27n7s23
---
<!-- cspell:ignore karakeep,bitwarden -->

![karakeep - L'application pour tout mettre en favori](/img/v2/docker_playing_with_app.webp)

<TLDR>
Cet article présente karakeep, une application auto-hébergée tout-en-un pour gérer favoris, notes et images, avec un moteur de recherche redoutable. Le guide propose un tutoriel pas à pas pour installer karakeep via une configuration Docker Compose personnalisée. Il explique comment configurer le fichier `compose.yaml` pour stocker les données sur la machine hôte et définir les bonnes permissions utilisateur. Après l'installation, l'article détaille la création du premier utilisateur et montre les fonctions clés : ajouter de nouveaux éléments et les organiser en listes hiérarchiques.
</TLDR>

Depuis quelques mois, j'utilise <Link to="/blog/heimdall-dashboard">Heimdall</Link> mais cet outil a une grosse faiblesse : son moteur de recherche hyper basique (voire inexistant, puisqu'il n'est pas possible de rechercher un lien de manière globale).

J'étais donc plutôt insatisfait et j'attendais de trouver mieux : karakeep.

C'est un outil que vous pouvez auto-héberger et qui est un gestionnaire de favoris, de notes et même d'images, tout en restant très simple.

*Il rejoint le petit ensemble d'outils auto-hébergés que j'utilise tous les jours, à côté de <Link to="/blog/docker-memos">Memos</Link> et <Link to="/blog/docker_uptime_kuma">Uptime Kuma</Link> — tous regroupés dans Docker Desktop grâce à l'astuce décrite dans <Link to="/blog/docker-name-property">Docker - How to group containers together</Link>.*

Et le moteur de recherche est plutôt puissant. Globalement, karakeep est un plaisir à utiliser.

Voyons-le à l'œuvre.

<!-- truncate -->

## Ajouter un favori {#add-a-bookmark}

Une fois karakeep lancé, ajouter quelque chose est un jeu d'enfant : cliquez dans la zone de texte **New Item** et commencez à taper (ça peut être du texte brut comme un pense-bête, ou l'URL d'un site web).

Je vais taper `https://awesome-docker-compose.com/apps`, enregistrer et j'obtiens immédiatement ceci :

<BrowserWindow url="http://localhost:%%port=2000%%/dashboard/bookmarks">
  ![Awesome Docker](./images/awesome_docker.webp)
</BrowserWindow>

Comme vous le voyez, karakeep a récupéré une image de la page web — pas de vignette à ajouter à la main, aucune étape supplémentaire.

## Pourquoi ça fonctionne {#why-it-works}

- Une seule barre de recherche couvre à la fois les favoris, les notes et les images — précisément ce qui me manquait et qui m'a poussé à chercher un remplaçant.
- Enregistrer un lien capture automatiquement un aperçu de la page : une liste de favoris reste visuelle, ce n'est pas un mur d'URL nues.
- Notes, images et liens vivent dans les mêmes listes hiérarchiques : plus besoin de jongler avec trois applications auto-hébergées différentes pour trois tâches liées.
- C'est auto-hébergé, donc vos favoris et vos notes restent sur votre propre disque, à côté des autres outils dans <Link to="/blog/heimdall-dashboard">Heimdall</Link>.

## Installons karakeep {#lets-install-karakeep}

Créez un dossier avec `mkdir ~/tools/karakeep && cd $_`. Dans ce dossier, créez un fichier `compose.yaml` avec le contenu ci-dessous :

<Vars port="2000" labels={{ port: "Port hôte" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="note">
La ligne `user: ${UID:-1000}:${GID:-1000}` demande à Docker d'utiliser un utilisateur spécifique (pas `root`) lors de la création des fichiers sur votre disque.

L'utilisateur `1000:1000`, c'est vous dans la plupart des cas, c'est-à-dire votre utilisateur Linux actuel (tapez `id -u` puis `id -g` pour récupérer votre ID utilisateur et votre ID de groupe, et vous verrez que ce sera `1000` pour les deux).

Si vos IDs ne sont pas `1000`, éditez le fichier yaml et mettez les vôtres à la place.

</AlertBox>

<AlertBox variant="info">
Par rapport à la configuration Docker par défaut, j'ai fait un changement : stocker les données sur le disque dur plutôt que d'utiliser un volume Docker.

J'ai dû réinstaller karakeep après un changement de configuration et j'ai dû exporter le volume pour récupérer les données (Docker Desktop propose cette fonction).

Pour éviter cette situation, autant garder directement les fichiers sur mon disque dur.

</AlertBox>

Une fois le fichier `compose.yaml` créé, dans votre console, il suffit de lancer `docker compose up --build --detach`.

karakeep tourne maintenant. Rendez-vous sur `http://localhost:`<Var name="port">2000</Var>`/` et vous obtiendrez cet écran :

<BrowserWindow url="http://localhost:%%port=2000%%/">
  ![karakeep - Écran de connexion](./images/logon.webp)
</BrowserWindow>

Comme c'est votre première fois, cliquez sur `Sign Up` et créons un nouvel utilisateur. karakeep imposera des règles au mot de passe, alors une fois défini, n'oubliez pas de l'ajouter dans votre gestionnaire de mots de passe (Bitwarden pour ma part).

Vous arrivez sur le tableau de bord :

<BrowserWindow url="http://localhost:%%port=2000%%/dashboard/bookmarks">
  ![karakeep - Tableau de bord](./images/dashboard.webp)
</BrowserWindow>

## Ajouter à une liste {#adding-to-a-list}

Créez d'abord une liste et remplissez les différentes options (nom, icône, ...) :

![Création d'une liste](./images/adding_list_1.webp)

De retour sur le tableau de bord, cliquez sur le bouton `...` de l'élément souhaité puis sur l'option `Manage Lists` pour pouvoir créer une nouvelle liste :

![Ajout à une liste spécifique](./images/adding_list_2.webp)

Il est aussi possible de créer une liste comme enfant d'une liste existante et donc d'obtenir facilement quelque chose comme ceci :

![Exemples de listes](./images/lists.webp)

### Astuce - Sélectionnez une liste avant d'ajouter un élément {#tips---select-a-list-before-adding-an-item}

Si vous sélectionnez d'abord une liste, les nouveaux éléments y seront ajoutés directement.

## Fonctions supplémentaires {#extra-features}

### Import / Export {#import--export}

En cliquant sur l'avatar de votre profil (en haut à droite) puis sur `User Settings`, vous accéderez, entre autres, à une fonction `Import / Export`. C'est bon à savoir : vous pouvez importer depuis de nombreuses sources et aussi exporter en JSON ou en page HTML.

## Conclusion {#conclusion}

karakeep a remplacé la recherche inexistante de Heimdall par une seule barre qui couvre favoris, notes et images, et il fait ce qu'un simple gestionnaire de favoris ne fait pas : il capture un aperçu visuel de chaque lien enregistré. Un `compose.yaml`, deux lignes d'UID/GID, et il tourne à côté de <Link to="/blog/docker-memos">Memos</Link> et <Link to="/blog/docker_uptime_kuma">Uptime Kuma</Link> dans la même stack auto-hébergée.

Consultez le site officiel [https://karakeep.app/](https://karakeep.app/) pour plus d'infos, et <Link to="/blog/docker-name-property">Docker - How to group containers together</Link> pour le garder bien rangé à côté de vos autres outils auto-hébergés.
