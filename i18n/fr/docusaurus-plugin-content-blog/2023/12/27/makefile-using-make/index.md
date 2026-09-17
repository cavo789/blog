---
slug: makefile-using-make
title: Linux Makefile - Quand utiliser un makefile
date: 2023-12-27
description: Arrêtez de mémoriser des commandes Docker complexes. Découvrez quand et comment utiliser un makefile Linux avec GNU make pour automatiser la mise en place de votre projet, les logs et la gestion de l'environnement.
authors: [christophe]
image: /img/v2/makefile.webp
mainTag: makefile
tags:
  - docker
  - linux
  - makefile
language: fr
review_date: 2026-07-30
---
![Linux Makefile - Quand utiliser un makefile](/img/v2/makefile.webp)

<TLDR>
Cet article plaide pour l'usage d'un `makefile` de projet (Linux/WSL uniquement) comme endroit unique pour centraliser les commandes difficiles à retenir — transformant par exemple `docker compose up --detach` en `make up` — et montre un fichier de départ basique avec des targets pour les actions Docker courantes, plus une astuce sur l'utilisation de `printf` pour afficher des infos utiles (comme les identifiants) quand une target s'exécute.
</TLDR>

Écrire votre propre `makefile` a l'énorme avantage, **terriblement puissant**, de pouvoir centraliser en un seul endroit les commandes que vous utilisez sur votre projet, quelle que soit la nature de celui-ci (php, javascript, nodeJs, markdown, etc.).

La présence d'un fichier nommé `makefile` envoie un message clair à quiconque vient travailler sur le projet : *Hé, regarde ici, tu y trouveras toutes les commandes dont tu as besoin*.

Vous pouvez donc définir une commande `up` (c'est vous qui choisissez le nom) qui lancera toutes les actions nécessaires au démarrage du projet ; vous pourriez avoir `down` pour l'inverse, `check` pour vérifier que le projet est valide (par exemple lancer des contrôles statiques de la qualité de votre code, comme dans <Link to="/blog/python-qa">Python - Code Quality tools</Link>), et ainsi de suite.

<!-- truncate -->

## Un mot au lieu de cette commande {#one-word-instead-of-that-command}

<Vars
  port_adminer="8088"
  port_phpmyadmin="8089"
  network="kingsbridge_default"
  db="joomladb"
  labels={{ port_adminer: "Port Adminer", port_phpmyadmin: "Port phpMyAdmin", network: "Réseau Docker", db: "Container de base de données" }}
/>

Voici un appel `make phpmyadmin` et, juste en dessous, la commande Docker qu'il remplace :

<Terminal typewriter source="./files/terminal-1.txt" />

Un mot à gauche. Cent vingt caractères de `--link`, `--network` et `-p` à droite — le genre de ligne que personne ne tape de mémoire et que tout le monde finit par chercher dans son historique de shell.

Et remarquez la deuxième ligne de la sortie : les identifiants et l'URL sont affichés aussi, comme ça vous n'avez pas à les chercher non plus.

## Ce que contient le makefile {#whats-inside-the-makefile}

Tout ce comportement vient d'un simple fichier texte à la racine du projet :

<Snippet filename="makefile" source="./files/makefile" />

Les lignes comme `adminer:` ou `bash:` s'appellent des `targets` ; ce sont vos commandes. Regardez la target `up:` : vous y trouverez une seule commande, `docker compose up --detach`. Donc au lieu de retenir `docker compose up --detach` pour lancer votre application, vous exécutez simplement `make up`. Pour ouvrir le navigateur et parcourir votre site, ce sera `make start`.

Les identifiants montrés plus haut sont affichés par un appel `printf` dans cette target — une bonne habitude pour tout ce que vous devriez sinon aller rechercher.

<AlertBox variant="danger">
L'indentation dans un makefile **DOIT** se faire avec des tabulations et pas des espaces, c'est crucial. Alors assurez-vous de ce point : si votre fichier ne fonctionne pas, vous savez quoi faire.

</AlertBox>

<AlertBox variant="info" title="Ce fichier est spécifique à chaque projet, pas global.">
Le `makefile`, créé dans le répertoire de votre projet, peut contenir des instructions pour ce projet précis. Vous pouvez avoir un `makefile` par projet.

</AlertBox>

## Pourquoi s'embêter {#why-bother}

Dans l'article <Link to="/blog/docker-joomla">Créez votre site Joomla avec Docker</Link>, nous avons vu beaucoup de commandes Docker.

Par ordre alphabétique :

- `docker compose down`,
- `docker compose exec joomla /bin/sh`,
- `docker compose kill`,
- `docker compose logs --follow`,
- `docker compose up --detach`,
- `docker container list`,
- `docker image list`,
- `docker network list`,
- et bien d'autres

Ce n'est certainement pas facile de toutes les retenir — et il est beaucoup plus simple de se souvenir d'une commande du type `make quelquechose` (et ça peut être n'importe quoi, pas seulement du Docker).

<Details label="`make` n'est pas encore installé ?">

Nous utilisons [GNU make](https://www.gnu.org/software/make/) pour cela.

Lancez d'abord `which make` dans votre console Linux pour vérifier si `make` est installé. Si c'est le cas, vous obtiendrez par exemple `/usr/bin/make` comme résultat. Si vous obtenez `make not found`, exécutez `sudo apt-get update && sudo apt-get -y install make` pour l'installer.

Le `makefile` lui-même est du texte pur, vous pouvez donc utiliser l'éditeur que vous voulez. De mon côté, j'ai maintenant mes habitudes avec Visual Studio Code. Assurez-vous que l'indentation utilise des tabulations, pas des espaces.

<AlertBox variant="note" title="Uniquement pour Linux / WSL (pas pour DOS/PowerShell)">
Ce chapitre concerne uniquement Linux puisque DOS/PowerShell ne supporte pas la commande GNU make.

</AlertBox>

</Details>

## Conclusion {#conclusion}

Un `makefile` à la racine d'un projet est un message pour la prochaine personne qui l'ouvrira — vous compris, dans six mois : *tout ce dont tu as besoin pour faire tourner ce truc est ici*. Les commandes cessent de vivre dans votre historique de shell et commencent à vivre dans le repository, versionnées à côté du code sur lequel elles agissent.

L'étape suivante évidente est de rendre cette liste auto-documentée : <Link to="/blog/makefile-help">Linux Makefile - Adding a help screen</Link> montre comment un simple `make` peut afficher chaque target disponible avec sa description. Et une fois convaincu, <Link to="/blog/makefile_tips">Makefile - Tutorial and Tips & Tricks</Link> rassemble tout ce que j'ai appris depuis l'écriture de mon premier.
