---
slug: docker-network-and-extra-hosts
title: Utiliser le réseau Docker et la propriété extra_hosts
date: 2024-02-20
description: Résolvez les alias d'hôte dans vos containers Docker ! Apprenez à utiliser docker network et la propriété extra_hosts dans docker compose pour connecter vos services sans friction.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore allnodes,allrouters,localnet,mcastprefix -->
![Utiliser le réseau Docker et la propriété extra_hosts](/img/v2/docker_tips.webp)

<TLDR>
Cet article explique pourquoi un container Docker ne peut pas en joindre un autre si les deux ne tournent pas sur le même réseau Docker. On y crée un réseau partagé, on récupère l'IP de sa gateway avec `docker network inspect`, puis on y connecte un second container via `compose.yaml`. Il montre aussi comment réutiliser, dans un container, un alias défini dans le fichier hosts de la machine hôte grâce à la propriété `extra_hosts`.
</TLDR>

Quand vous lancez un container Docker sur un réseau différent du réseau standard (appelé `bridge`) et que **vous souhaitez lancer un second container qui doit accéder au premier, vous devez lancer ce second container sur le même réseau.**

Imaginons que vous fassiez tourner une base de données MySQL sur un réseau appelé `my_network` et que vous vouliez démarrer un second container comme [phpMyAdmin](https://hub.docker.com/_/phpmyadmin) (voir <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Using Adminer, pgadmin or phpmyadmin to access your Docker database container</Link>) pour accéder à la base : vous devez alors utiliser l'option CLI `--network` au moment de lancer le second container avec `docker run`.

Maintenant, imaginez que le premier container soit une application web et que le second doive pouvoir accéder à sa page web, et en plus réutiliser le même alias ?

<!-- truncate -->

## Le correctif en deux lignes {#the-two-line-fix}

Voici toute la réponse, en début d'article plutôt qu'à la fin. Ajoutez `extra_hosts` au service qui doit joindre votre alias d'hôte :

<Snippet filename="compose.yaml" source="./files/compose.part3.yaml" />

Entrez dans le container et regardez ce que Docker en a fait :

<Terminal typewriter source="./files/terminal-1.txt" />

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<style type="text/css">
body {background-color: #fff; color: #222; font-family: sans-serif;}
pre {margin: 0; font-family: monospace;}
[...]
```

L'alias `my_site.local` est maintenant une vraie ligne dans le `/etc/hosts` du container, et `curl http://my_site.local:8080` renvoie la page servie par l'*autre* container.

## Pourquoi ça marche {#why-it-works}

- **Les deux containers doivent partager un réseau.** Un container sur le réseau `bridge` par défaut ne peut tout simplement pas joindre un container qui tourne sur un autre réseau — c'est une protection, pas un bug.
- **`172.20.0.1` est la gateway de ce réseau**, c'est-à-dire l'adresse depuis laquelle les containers voient votre machine hôte. C'est la valeur que nous allons récupérer plus bas avec `docker network inspect`.
- **Le fichier hosts de votre machine hôte est invisible depuis l'intérieur d'un container.** `extra_hosts` est le moyen de redéclarer l'alias là où le container peut le voir : Docker écrit la ligne dans `/etc/hosts` au démarrage.

Le reste de cet article construit tout le scénario depuis zéro, y compris les deux échecs que vous rencontreriez en chemin.

## Un peu de préparation {#some-preparation-work}

<AlertBox variant="note" title="Passez cette étape si vous avez déjà un réseau dédié et son container qui tourne">
Si vous n'avez pas encore d'application web qui tourne sur son propre réseau, suivez cette étape.

</AlertBox>

Démarrez un shell Linux et lancez `mkdir -p /tmp/network && cd $_` pour créer un dossier `network` dans votre dossier temporaire Linux et vous y placer.

Créez ensuite un fichier `index.php` dans ce dossier avec ce contenu :

<Snippet filename="index.php" source="./files/index.php" />

Voici le contenu de votre répertoire courant :

<Terminal typewriter source="./files/terminal-5.txt" />

Comme il nous faut un réseau Docker, créez-en un :

<Terminal typewriter>
$ docker network create my_network
1df43879fbfc2b328bf36f9205c68168e45a88cea481bc244fab94ff04486da7
</Terminal>

Et lancez le script avec `docker run -d -p 8080:80 -u $(id -u):$(id -g) -v "$PWD":/var/www/html --network my_network php:8.2-apache`.

Cette commande démarre un container Apache et nous pouvons surfer sur notre site local via `http://127.0.0.1:8080`

<BrowserWindow url="http://127.0.0.1:8080">
  ![Notre site local](./images/localsite.webp)
</BrowserWindow>

## Créer notre second container {#creating-our-second-container}

Nous pouvons maintenant créer un second container et essayer simplement de faire un `curl` vers notre site.

Créez un fichier appelé `Dockerfile` avec le contenu ci-dessous. Nous utilisons une très petite image Linux et nous y installons `curl`.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Et un second fichier appelé `compose.yaml` avec ce contenu :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Pour que tout soit clair, voici le contenu de notre répertoire courant :

<Terminal typewriter source="./files/terminal-4.txt" />

Nous devons créer notre image. Pour cela, lancez simplement `docker compose build`.

Nous démarrons ensuite un shell bash interactif dans notre second container et nous essayons d'accéder à notre site local :

<Terminal typewriter>
$ docker compose run -it --rm --entrypoint /bin/sh my_second_container

$ curl http://127.0.0.1:8080
curl: (7) Failed to connect to 127.0.0.1 port 8080 after 0 ms: Couldn't connect to server
</Terminal>

## Quand ça ne marche pas (et pourquoi) {#when-it-doesnt-work-and-why}

<AlertBox variant="danger" title="Ça ne fonctionne pas... **comme prévu**">
Nous confirmons que notre container n'arrive pas à accéder à notre site local `http://127.0.0.1:8080` alors que ce site est bien configuré. Si vous sortez du container et rafraîchissez le site, tout fonctionne.

</AlertBox>

### Il faut lancer le second container sur le même réseau {#we-need-to-run-the-second-container-on-the-same-network}

<AlertBox variant="info" title="Retrouver le réseau utilisé par un container">
Si vous ne connaissez pas le nom du réseau utilisé, lancez simplement `docker inspect xxxx` où `xxxx` est le nom du container. Vous obtiendrez une réponse JSON avec une entrée `Networks`. Pour plus d'informations, lisez l'article <Link to="/blog/docker-inspect">Docker inspect - Retrieve network's information</Link>.

</AlertBox>

Modifiez votre fichier `compose.yaml` comme ceci :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

*Remplacez `my_network` par le vôtre si vous en avez un autre.*

### Il faut trouver l'IP du réseau {#we-need-to-find-the-ip-of-the-network}

Mais il reste une chose à faire : nous devons obtenir l'**adresse IP de la gateway du réseau.**

De retour sur votre machine (et pas depuis l'intérieur du container), lancez :

<Terminal typewriter>
$ {`docker network inspect -f '\{\{json .IPAM.Config}}' 'my_network'`}
[\{"Subnet":"172.20.0.0/16","Gateway":"172.20.0.1"}]
</Terminal>

L'IP dont nous avons besoin est `172.20.0.1` (`Gateway`), comme illustré ci-dessus.

### On réessaie {#try-again}

Nous pouvons maintenant réessayer : démarrez à nouveau un shell interactif. Ça ne marchera toujours pas avec l'IP locale `127.0.0.1`, mais bien, cette fois, avec l'**adresse IP de la gateway du réseau** :

<Terminal typewriter source="./files/terminal-3.txt" />

```html
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml"><head>
<style type="text/css">
body {background-color: #fff; color: #222; font-family: sans-serif;}
pre {margin: 0; font-family: monospace;}
```

## Cas d'usage supplémentaire - les alias {#extra-use-case---aliases}

Et maintenant la dernière partie : imaginez que vous ayez défini un alias dans le fichier hosts (sous Windows, dans le fichier `C:\Windows\System32\drivers\etc\hosts`).

Imaginez que vous ayez créé un alias comme celui-ci :

<Snippet filename="C:\Windows\System32\Drivers\etc\hosts" source="./files/windows_hosts.txt" />

et donc, sur votre machine hôte, vous n'utilisez pas `http://127.0.0.1:8080` mais `http://mysite.local:8080`

<BrowserWindow url="http://mysite.local:8080">
  ![Mon site](./images/mysite.webp)
</BrowserWindow>

Si nous essayons d'y accéder depuis l'intérieur du second container, ça ne fonctionne pas :

<Terminal typewriter>
$ docker compose run -it --rm --entrypoint /bin/sh my_second_container

$ curl http://my_site.local:8080
curl: (6) Could not resolve host: my_site.local
</Terminal>

Et **c'est normal** puisque `my_site.local` est un alias défini sur votre machine hôte, pas dans le container :

<Terminal typewriter source="./files/terminal-2.txt" />

La dernière chose à faire dans ce cas est d'éditer notre fichier `compose.yaml` et d'y ajouter la propriété `extra_hosts` — les deux lignes montrées tout au début de cet article, cette fois avec l'IP de la gateway récupérée plus haut. Entrez une dernière fois dans le container, faites `cat /etc/hosts` : l'alias est là, et `curl http://my_site.local:8080` fonctionne.

## Conclusion {#conclusion}

L'alias que vous tapez dans votre navigateur depuis des mois est une affaire de machine hôte. Rien ne le transporte dans un container, et rien ne vous dit que c'est là le problème — vous obtenez juste `Could not resolve host` et vous commencez à douter de votre réseau. Deux lignes d'`extra_hosts` pointant vers la gateway du réseau comblent le trou, et votre `compose.yaml` documente désormais cette dépendance pour la prochaine personne qui clonera le projet.

Quand tout semble correctement configuré et que la connexion échoue quand même, <Link to="/blog/docker-networking-troubleshooting">Troubleshooting for Docker containers - Accessing the other one</Link> déroule le diagnostic couche par couche.
