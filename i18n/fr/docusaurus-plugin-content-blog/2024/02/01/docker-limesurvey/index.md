---
slug: docker-limesurvey
title: Installer LimeSurvey avec Docker
date: 2024-02-01
description: Apprenez à installer LimeSurvey rapidement et facilement avec Docker Compose. Un guide complet sur la mise en place, la persistance des données avec les volumes et l'exécution de versions spécifiques.
authors: [christophe]
image: /img/v2/limesurvey.webp
series: Self-host your own services
mainTag: self-hosted
tags:
  - docker
  - self-hosted
language: fr
updates:
  - date: 2026-06-15
    note: Pinned MySQL to `8.4` (MySQL 9.x removed `mysql_native_password`, breaking LimeSurvey authentication); added `healthcheck` and `service_healthy` to all compose files to eliminate startup race conditions; fixed several grammar errors.
---
![Installer LimeSurvey avec Docker](/img/v2/limesurvey.webp)

<TLDR>
Cet article montre comment démarrer LimeSurvey, un outil de sondage open source, avec Docker Compose et l'image `martialblog/docker-limesurvey`. Il couvre une configuration minimale pour faire tourner le site sur `http://localhost:8080`, l'ajout de volumes pour que vos sondages et votre configuration survivent aux redémarrages du container, et le fait de figer LimeSurvey et MySQL sur des versions précises quand vous devez reproduire localement un ancien environnement de production.
</TLDR>

LimeSurvey est un outil de sondage open source qui permet de créer et de mener des enquêtes en ligne. C'est un outil puissant et intuitif, utilisable par tout le monde.

Une fois de plus, il est facile de jouer avec et de créer un site bac à sable pour découvrir toutes ses fonctionnalités ; merci Docker.

*Deux choses sur lesquelles repose ce `compose.yaml` et qui sont expliquées ailleurs sur ce blog : <Link to="/blog/docker-volumes">les volumes</Link>, pour que vos sondages survivent au redémarrage d'un container, et <Link to="/blog/docker-healthy">les healthchecks</Link>, pour que LimeSurvey attende que MySQL accepte réellement les connexions.*

Pour cela, nous allons utiliser l'image Docker [https://github.com/martialblog/docker-limesurvey](https://github.com/martialblog/docker-limesurvey).

<!-- truncate -->

## LimeSurvey, opérationnel en deux minutes {#limesurvey-running-in-two-minutes}

Un fichier `compose.yaml`, un `docker compose up --detach`, et voici ce qui vous attend sur `http://localhost:`<Var name="port">8080</Var>`/admin` :

<BrowserWindow url="http://localhost:%%port=8080%%/admin">
  ![Tableau de bord LimeSurvey](./images/dashboard.webp)
</BrowserWindow>

Une installation LimeSurvey complète — liste des sondages, participants, statistiques — qui tourne sur votre machine, sans rien installer à part Docker. Construisons-la.

## À nous de jouer {#lets-play}

Ouvrez un shell Linux et lancez `mkdir -p /tmp/limesurvey && cd $_` pour créer un dossier `limesurvey` dans votre dossier temporaire Linux et vous y rendre.

Créez ensuite un fichier `compose.yaml` dans ce dossier avec ce contenu :

<Vars
  port="8080"
  app_name="limesurvey-app"
  db_name="limesurvey-db"
  labels={{ port: "Port de l'host", app_name: "Container LimeSurvey", db_name: "Container base de données" }}
/>

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Il suffit maintenant de lancer la commande suivante pour télécharger (uniquement la première fois) les images nécessaires (LimeSurvey et MySQL) et créer les deux containers :

<Terminal typewriter>
$ docker compose up --detach
</Terminal>

Une fois tout téléchargé et démarré, vous pouvez vérifier que vous avez bien deux containers en lançant la commande suivante :

<Terminal typewriter source="./files/terminal-1.txt" />

<AlertBox variant="info" title="La sortie ci-dessus a été simplifiée">
Pour plus de clarté, la sortie de `docker container list` a été simplifiée ci-dessus ; toutes les colonnes ne sont pas reprises dans l'article.

</AlertBox>

La condition `service_healthy` dans le fichier compose garantit que LimeSurvey ne démarrera pas avant que MySQL soit prêt, ce qui élimine les erreurs de connexion dont vous avez peut-être entendu parler dans de vieux tutoriels. Patientez tout de même **une ou deux minutes** (selon votre machine) le temps que LimeSurvey initialise les tables de sa base de données.

Rendez-vous sur `http://localhost:`<Var name="port">8080</Var> et si vous voyez `ERR_CONNECTION_REFUSED`, attendez encore un peu et rafraîchissez. Quand c'est prêt, vous devriez voir la page d'accueil par défaut de LimeSurvey.

<AlertBox variant="info" title="Regardez les logs">
Si l'attente se prolonge et que quelque chose semble anormal, lancez `docker compose logs -f` pour inspecter les logs. Vous devriez voir `[core:notice] [pid 1] AH00094: Command line: 'apache2 -D FOREGROUND'` quand LimeSurvey est prêt, ce qui signifie que le serveur web est lancé et accepte les connexions.

Appuyez sur <kbd>CTRL</kbd>-<kbd>C</kbd> pour arrêter de suivre les logs.
</AlertBox>

## Première connexion {#first-login}

Quand LimeSurvey est prêt, vous verrez la page suivante sur `http://localhost:`<Var name="port">8080</Var> :

<BrowserWindow url="http://localhost:%%port=8080%%">
  ![Page d'accueil de LimeSurvey](./images/homepage.webp)
</BrowserWindow>

Allez sur `http://localhost:`<Var name="port">8080</Var>`/admin` pour ouvrir l'interface d'administration. Les identifiants à utiliser sont `admin` / `admin` (comme défini dans le fichier `compose.yaml`, voir les variables `ADMIN_USER` et `ADMIN_PASSWORD`).

<BrowserWindow url="http://localhost:%%port=8080%%/admin">
  ![Page d'administration de LimeSurvey](./images/admin.webp)
</BrowserWindow>

Une fois connecté, vous arrivez sur le tableau de bord montré au début de cet article, et vous êtes prêt à jouer avec LimeSurvey sur votre machine.

## Utiliser des volumes {#using-volumes}

Le fichier `compose.yaml` fourni plus haut n'utilisait aucun volume : quand vous arrêterez les containers, votre travail sera perdu et LimeSurvey redémarrera sans configuration ni sondages, comme après une réinitialisation complète.

Si vous voulez tester LimeSurvey sur plusieurs jours et conserver vos éléments de configuration et vos sondages, vous voudrez garder votre travail. Pour cela, vous devez utiliser des volumes.

Voici un fichier `compose.yaml` mis à jour pour demander à Docker d'utiliser des volumes qu'il gère lui-même.

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

<AlertBox variant="info" title="Envie d'en savoir plus sur les volumes ?">
Dans ce cas, lisez cet article : <Link to="/blog/docker-volumes">Using volumes with Docker, use cases</Link>
</AlertBox>

## Télécharger une ancienne version {#download-an-old-version}

<AlertBox variant="danger" title="Cette section fige MySQL 5.7, qui est en fin de vie">
MySQL 5.7 est en fin de vie depuis octobre 2023 et ne reçoit plus de correctifs de sécurité. Le figer est volontaire ci-dessous, car tout l'intérêt est de reproduire un ancien environnement de production sur votre machine. **N'utilisez jamais `mysql:5.7` pour autre chose que la reproduction locale d'une installation legacy.**
</AlertBox>

Vous savez quoi ? Télécharger une ancienne version est vraiment simple.

Imaginons la situation suivante : vous devez intervenir sur une ancienne installation de LimeSurvey. Pour l'exemple, disons que vous devez installer un plugin quelconque mais, évidemment, avant de le faire sur un site de production, vous allez vous salir les mains en local. Il vous faut donc télécharger la même version que celle de production.

Plus tôt dans cet article, nous avons vu qu'on pouvait facilement télécharger la version « latest ».

Recommençons, mais cette fois pour une version précise. En regardant le site de production, vous voyez par exemple la version `3.22.6+200219`.

Dans notre `compose.yaml`, nous devons alors remplacer `image: docker.io/martialblog/limesurvey:latest` par autre chose, mais par quoi ? Un tag valide, à coup sûr. Allez sur [https://hub.docker.com/r/martialblog/limesurvey/tags](https://hub.docker.com/r/martialblog/limesurvey/tags) et, dans la zone `Filter Tags`, tapez `3.22.6`, notre version de production donc. Nous obtenons trois images, mais une seule pour `apache` (en effet, nous voulons utiliser l'image Docker contenant à la fois PHP et Apache). Bingo, nous savons maintenant que notre ligne sera `image: docker.io/martialblog/limesurvey:3.22.6_200219-apache`.

La deuxième partie, c'est de savoir avec certitude quelles lignes mettre dans le fichier yaml. Pour cela, rendez-vous simplement sur [https://github.com/martialblog/docker-limesurvey/releases/tag/](https://github.com/martialblog/docker-limesurvey/releases/tag/) et essayez de retrouver la même release. Ici, c'est : [https://github.com/martialblog/docker-limesurvey/releases/tag/3.22.6%2B200219](https://github.com/martialblog/docker-limesurvey/releases/tag/3.22.6%2B200219).

Cliquez par exemple sur `Source code (zip)` pour télécharger l'archive et ouvrez-la. Récupérez le fichier `compose.yaml` depuis l'archive et regardez attentivement comment il est configuré.

Par exemple, nous voyons que la version de MySQL utilisée à l'époque était `mysql:5.7` (utilisez donc la même pour éviter les conflits).

Notre `compose.yaml` devient alors :

<Snippet filename="compose.yaml" source="./files/compose.part3.yaml" />

Lancez simplement `docker compose up --detach` puis rendez-vous sur `http://localhost:`<Var name="port">8080</Var> et, félicitations, vous avez un site LimeSurvey v3.22.6 en local.

## Conclusion {#conclusion}

Deux services dans un `compose.yaml`, une condition `service_healthy` pour que LimeSurvey attende sa base de données, et quelques volumes nommés quand vous voulez que vos sondages survivent : c'est tout ce qu'il faut pour obtenir un LimeSurvey jetable — ou persistant — sur votre propre machine. Et comme la version n'est qu'un tag Docker, reproduire exactement la release qui tourne en production ne demande qu'une seule ligne à modifier.

Même recette, autres outils : parcourez les articles <Link to="/blog/tags/self-hosted">self-hosted</Link> de ce blog.
