---
slug: docker-adminer-pgadmin-phpmyadmin
title: Utiliser Adminer, pgadmin ou phpmyadmin pour accéder à votre container de base de données Docker
date: 2023-12-27
description: Utilisez Adminer, pgadmin ou phpmyadmin pour accéder à votre container de base de données Docker. Les instructions simples en ligne de commande pour MySQL, MariaDB et PostgreSQL.
authors: [christophe]
image: /img/v2/database_admin.webp
mainTag: database
tags:
  - database
  - docker
language: fr
review_date: 2026-07-30
---
![Utiliser Adminer, pgadmin ou phpmyadmin pour accéder à votre container de base de données Docker](/img/v2/database_admin.webp)

<TLDR>
Cet article montre comment brancher une interface web de gestion de base de données sur un container MySQL/MariaDB/PostgreSQL existant en une seule commande : `docker inspect` (avec `jq`) pour trouver le nom du réseau du container, puis `docker run --network <net> --link <container>:db -p <port>:<port> adminer` (ou `phpmyadmin`) pour parcourir les tables et les enregistrements sans rien ajouter au `compose.yaml` d'origine.
</TLDR>

Vous avez une application dockerisée et l'un de ses containers est un service MariaDB, MySQL ou PostgreSQL — pensez à ceux démarrés dans <Link to="/blog/docker-wordpress">Quickly install WordPress in just three commands</Link> ou <Link to="/blog/docker-joomla-right-to-the-point">Start Joomla with Docker in just a few clicks</Link>.

Votre besoin : démarrer une interface web de gestion de base de données comme [Adminer](https://hub.docker.com/_/adminer/), [pgadmin](https://hub.docker.com/r/dpage/pgadmin4/) ou [phpmyadmin](https://hub.docker.com/_/phpmyadmin) et pouvoir accéder à vos tables et à vos enregistrements.

Cela se fait en une seule ligne de commande.

<!-- truncate -->

## Une commande, votre base de données dans un navigateur {#one-command-your-database-in-a-browser}

<Vars
  network="joomla_default"
  db_container="joomla-joomladb-1"
  port_adminer="8088"
  port_phpmyadmin="8089"
  labels={{ network: "Réseau Docker", db_container: "Container de base de données", port_adminer: "Port Adminer", port_phpmyadmin: "Port phpMyAdmin" }}
/>

<Terminal typewriter>
$ docker run -d --rm --name adminer --network %%network=joomla_default%% --link %%db_container=joomla-joomladb-1%%:db -p %%port_adminer=8088%%:8080 adminer
</Terminal>

Rendez-vous sur `http://127.0.0.1:`<Var name="port_adminer">8088</Var> et votre base de données est là :

<BrowserWindow url="http://127.0.0.1:%%port_adminer=8088%%">
  ![adminer](./images/adminer.webp)
</BrowserWindow>

Tables, enregistrements, structure, console SQL — et rien n'a été ajouté à votre `compose.yaml`, rien n'a été installé sur votre machine. Quand vous avez terminé, le container se supprime tout seul grâce à `--rm`.

Seules deux valeurs de cette commande vous appartiennent : le **nom du container** qui héberge la base de données, et le **nom du réseau** sur lequel il tourne. Les deux sont à une commande de distance.

## Trouver votre container et son réseau {#find-your-container-and-its-network}

Nous allons utiliser `docker container list` pour obtenir la liste des containers ; on veut juste le nom de l'image et le nom du container.

**À titre d'illustration**, voici la sortie sur ma machine en ce moment :

<Terminal typewriter source="./files/terminal-1.txt" />

Pour notre exemple, on veut se connecter au container MySQL 8.x <Var name="db_container">joomla-joomladb-1</Var>.

La deuxième chose à déterminer est le nom du réseau utilisé par ce container. On utilise ici `docker inspect` (lisez mon article <Link to="/blog/docker-inspect">Docker inspect - Retrieve network's information</Link>).

<Terminal typewriter>
$ docker inspect %%db_container=joomla-joomladb-1%% | jq -r '.[0].NetworkSettings.Networks'
</Terminal>

```json
{
  # highlight-next-line
  "joomla_default": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": [
      "joomla-joomladb-1",
      "joomladb",
      "8bd385bf14c4"
    ],
    [ ... ]
  }
}
```

Le nom du réseau utilisé par <Var name="db_container">joomla-joomladb-1</Var> est donc <Var name="network">joomla_default</Var>, comme vous le voyez dans le JSON retourné.

## Lancer Adminer {#run-adminer}

Sous forme de template, la commande Adminer est :

<Terminal typewriter>
$ {`docker run -d --rm --name adminer --network <network_name> --link <container-name>:db -p 8088:8080 adminer`}
</Terminal>

Le flag `--network` doit donc recevoir le nom du réseau utilisé et `--link` est une valeur en deux parties : le nom du container auquel se connecter, suivi de `:db`.

<AlertBox variant="info" title="Utilisez votre propre port avec le flag `-p`">
Dans l'exemple, on rend adminer accessible sur le port <Var name="port_adminer">8088</Var>. N'hésitez pas à en utiliser un autre, libre.

</AlertBox>

Sur l'écran de connexion d'Adminer :

- `System` : sélectionnez le service de base de données utilisé,
- `Server` : doit être le nom du service de base de données à l'intérieur de votre container Docker,
- `Username` : le nom de l'utilisateur de la base de données,
- `Password` : le mot de passe associé,
- `Database` : peut rester vide pour tout obtenir, sinon indiquez le nom de la base à ouvrir.

Pour retrouver le nom du serveur, c'est le nom du service tel que défini dans votre fichier `compose.yaml`, mais vous pouvez aussi l'obtenir avec cette commande : `docker inspect` <Var name="db_container">joomla-joomladb-1</Var> `| grep com.docker.compose.service`. Remplacez simplement <Var name="db_container">joomla-joomladb-1</Var> par le nom de votre container.

<AlertBox variant="info" title="Utiliser un lien paramétré">
Si vous connaissez déjà certaines de ces valeurs, vous pouvez les fournir dans un lien, comme `http://127.0.0.1:`<Var name="port_adminer">8088</Var>`?server=joomladb&username=root&db=joomla_db`.

</AlertBox>

## Lancer pgadmin {#run-pgadmin}

<AlertBox variant="info" title="pgadmin est réservé aux bases de données PostgreSQL" />

## Lancer phpmyadmin {#run-phpmyadmin}

Pour phpmyadmin, la ligne de commande à lancer ressemble à ceci

<Terminal typewriter>
$ {`docker run -d --rm --name phpmyadmin --network <network_name> --link <container-name>:db -p 8089:80 phpmyadmin`}
</Terminal>

et donc, avec les valeurs de notre exemple,

<Terminal typewriter>
$ docker run -d --rm --name phpmyadmin --network %%network=joomla_default%%  --link %%db_container=joomla-joomladb-1%%:db -p %%port_phpmyadmin=8089%%:80 phpmyadmin
</Terminal>

Pour ouvrir phpmyadmin, lancez votre navigateur et allez sur `http://127.0.0.1:`<Var name="port_phpmyadmin">8089</Var> puisque c'est le port défini ici.

<BrowserWindow url="http://127.0.0.1:%%port_phpmyadmin=8089%%">
  ![phpmyadmin](./images/phpmyadmin.webp)
</BrowserWindow>

<BrowserWindow url="http://127.0.0.1:%%port_phpmyadmin=8089%%">
  ![Liste des bases de données](./images/phpmyadmin_databases.webp)
</BrowserWindow>

## Conclusion {#conclusion}

Ce qu'il faut retenir : vous n'avez pas à prévoir ça à l'avance. Votre `compose.yaml` n'a pas besoin d'un service `adminer` « au cas où » : le jour où vous devez regarder les données, vous attachez une interface au réseau avec un seul `docker run`, et elle disparaît quand vous l'arrêtez.

Le seul prérequis est de connaître le nom du réseau, et <Link to="/blog/docker-inspect">Docker inspect - Retrieve network's information</Link> détaille cette commande. Pour une application complète sur laquelle essayer tout ça, voyez <Link to="/blog/docker-joomla">Créez votre site Joomla avec Docker</Link>.
