---
slug: docker-wordpress
title: Installer rapidement WordPress en seulement trois commandes
date: 2023-12-28
description: Installez un site WordPress complet avec Docker en seulement trois commandes simples. Apprenez à mettre en place le réseau, la base de données (MySQL/MariaDB) et le container WordPress rapidement et facilement.
authors: [christophe]
image: /img/v2/wordpress.webp
mainTag: docker
tags:
  - docker
  - php
language: fr
updates:
  - date: 2026-07-30
    note: "Updated mysql:8.0.13 (EOL Apr 2026)→mysql:8.4 LTS, mariadb:11.2.2 (EOL short-term)→mariadb:11.4 LTS, wordpress:6.4.2-php8.2-apache→wordpress:php8.3-apache"
---
![Installer rapidement WordPress en seulement trois commandes](/img/v2/wordpress.webp)

<TLDR>
Cet article monte un site WordPress complet avec de simples commandes `docker run` plutôt qu'un `compose.yaml` : créer un réseau partagé, démarrer un container MySQL/MariaDB avec la base et l'utilisateur WordPress préconfigurés via des variables d'environnement, puis démarrer le container WordPress pointant vers cette base — trois commandes pour un site fonctionnel sur `http://127.0.0.1:8080`, plus un container phpMyAdmin optionnel pour accéder à la base.
</TLDR>

Vous pensez qu'il est possible de lancer un nouveau site WordPress en seulement trois commandes ? Impossible, non ? Eh bien, si, c'est possible.

Voyons cela...

<!-- truncate -->

## Trois commandes, un site WordPress {#three-commands-one-wordpress-site}

<Vars
  port="8080"
  db_name="db_wordpress"
  app_name="app_wordpress"
  labels={{ port: "Port hôte de WordPress", db_name: "Container de base de données", app_name: "Container WordPress" }}
/>

Les voici, en entier :

<Terminal typewriter source="./files/terminal-1.txt" />

Rendez-vous sur `http://127.0.0.1:`<Var name="port">8080</Var> et WordPress vous accueille avec son assistant d'installation :

<BrowserWindow url="http://127.0.0.1:%%port=8080%%">
  ![Running WordPress](./images/run_wp.webp)
</BrowserWindow>

<BrowserWindow url="http://127.0.0.1:%%port=8080%%">
  ![Installing WordPress](./images/installing_wordpress.webp)
</BrowserWindow>

<AlertBox variant="info" title="Error establishing a database connection">
Si vous obtenez `Error establishing a database connection`, patientez un peu avant de rafraîchir la page. Cela signifie que MySQL / MariaDB n'était pas encore prêt à accepter la connexion.

</AlertBox>

Pas de `compose.yaml`, pas de `wp-config.php` à éditer : un réseau partagé permet aux deux containers de communiquer, et chaque réglage dont WordPress a besoin est passé comme variable d'environnement sur la ligne de commande.

Dans l'article <Link to="/blog/docker-joomla">Créez votre site Joomla avec Docker</Link>, nous avons appris que dès que nous avons besoin de plus d'un service Docker (php/apache ainsi que mysql), il nous faut un fichier `compose.yaml`. C'est vrai et c'est la façon la plus simple de gérer l'application sur le long terme — mais pour un site jetable, lancer les containers à la main fonctionne tout aussi bien. Regardons ces trois commandes une par une.

## Première étape, il nous faut un réseau {#first-step-we-need-a-network}

Utiliser un réseau permettra aux containers de communiquer entre eux (voir <Link to="/blog/docker-network-and-extra-hosts">Using Docker network and the extra_hosts property</Link> pour les détails).

<AlertBox variant="caution" title="Vous avez besoin d'un réseau, ne sautez pas cette étape">
Dès que vous avez deux containers ou plus, vous avez besoin d'un réseau.

</AlertBox>

Créons notre réseau. Copiez/collez la commande ci-dessous dans un terminal (DOS ou Linux) et exécutez-la.

<Terminal typewriter>
$ docker network create wordpress
</Terminal>

## Deuxième étape, il nous faut un container de base de données {#second-step-we-need-a-database-container}

Pour cet article, je propose d'utiliser MySQL 8.x ou, si vous préférez, MariaDB 11.x. Choisissez celui que vous préférez et exécutez la commande dans un terminal.

Pour MySQL 8.x :

<Terminal typewriter>
$ docker run -d --name %%db_name=db_wordpress%% --hostname %%db_name=db_wordpress%% --network wordpress -e MYSQL_RANDOM_ROOT_PASSWORD=1 -e MYSQL_DATABASE=wordpress -e MYSQL_USER=wpuser -e MYSQL_PASSWORD=example mysql:8.4
</Terminal>

Pour MariaDB :

<Terminal typewriter>
$ docker run -d --name %%db_name=db_wordpress%% --hostname %%db_name=db_wordpress%% --network wordpress -e MYSQL_RANDOM_ROOT_PASSWORD=1 -e MYSQL_DATABASE=wordpress -e MYSQL_USER=wpuser -e MYSQL_PASSWORD=example mariadb:11.4
</Terminal>

Une fois démarré par Docker, le container MySQL / MariaDB va créer une base de données vide appelée `wordpress`, un utilisateur appelé `wpuser` dont le mot de passe sera `example` (tel que défini par nos variables `MYSQL_DATABASE`, `MYSQL_USER` et `MYSQL_PASSWORD`). Le container sera nommé <Var name="db_name">db_wordpress</Var> (comme défini par `--hostname`).

## Troisième étape, il nous faut WordPress {#third-step-we-need-wordpress}

Et maintenant, il nous faut un second container pour WordPress lui-même. Je propose d'utiliser la dernière version disponible à ce moment :

<Terminal typewriter>
$ docker run -d --name %%app_name=app_wordpress%% --hostname %%app_name=app_wordpress%% --network wordpress -p %%port=8080%%:80 -e WORDPRESS_DB_HOST=%%db_name=db_wordpress%% -e WORDPRESS_DB_NAME=wordpress -e WORDPRESS_DB_USER=wpuser -e WORDPRESS_DB_PASSWORD=example wordpress:php8.3-apache
</Terminal>

Cette commande lance WordPress dans un container Apache et rend le site accessible sur `http://127.0.0.1:`<Var name="port">8080</Var> — l'écran montré au début de cet article.

Le flag `-p ` <Var name="port">8080</Var>`:80` est le seul qui concerne votre machine hôte : changez le port s'il est déjà pris. Tous les autres décrivent comment WordPress atteint le container de base de données, par son `--hostname`, via le réseau `wordpress`.

## Optionnel, démarrer phpmyadmin {#optional-start-phpmyadmin}

Comme nous l'avons vu dans l'article <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Using Adminer, pgadmin or phpmyadmin to access your Docker database container</Link>, nous pouvons accéder à un container de base de données en utilisant par exemple phpMyAdmin. Pour cela, il suffit de lancer la commande suivante dans un terminal :

<Terminal typewriter>
$ docker run -d --rm --network wordpress --name phpmyadmin -e PMA_HOST=%%db_name=db_wordpress%% -p 8089:80 phpmyadmin
</Terminal>

En vous rendant sur `http://127.0.0.1:8089`, vous pouvez vous connecter à la base de données. Les identifiants à utiliser pour la connexion sont `wpuser` / `example`.

<BrowserWindow url="http://127.0.0.1:8089">
  ![phpmyadmin](./images/phpmyadmin.webp)
</BrowserWindow>

## Supprimer les containers {#remove-containers}

Si vous souhaitez arrêter et supprimer les containers après usage, vous pouvez exécuter le bloc d'instructions suivant dans un terminal Linux :

<Terminal typewriter source="./files/terminal-2.txt" />

Ou, à la main, allez dans votre interface `Docker Desktop`, cliquez sur l'onglet `containers` et supprimez les containers manuellement.

## Conclusion {#conclusion}

Comme annoncé, il nous faut juste trois commandes pour créer, de zéro, un nouveau site WordPress sur notre disque. Cela prend quelques secondes (selon la vitesse de votre ordinateur). Facile, non ?

Gardez à l'esprit que tout ici vit dans les containers : le jour où vous lancez les commandes de suppression ci-dessus, le site disparaît. Si vous voulez qu'il survive, la prochaine chose à ajouter est un <Link to="/blog/docker-volume">volume</Link>.
