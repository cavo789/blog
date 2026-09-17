---
slug: docker-name-property
title: Docker - Comment regrouper vos containers
date: 2025-10-10
description: Apprenez à organiser vos containers Docker en groupes logiques grâce à compose.yaml pour un workflow plus propre.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags: [docker]
language: fr
blueskyRecordKey: 3m2syybizfc2z
---
![Docker - Comment regrouper vos containers](/img/v2/docker_tips.webp)

<!-- cspell:ignore Karakeep,neosmemo,heimdall -->

<TLDR>
Cet article propose une astuce rapide pour organiser vos containers dans Docker Desktop. Il explique comment utiliser la propriété de premier niveau `name` dans vos fichiers `compose.yaml` pour regrouper les services liés sous une seule entrée repliable dans l'interface de Docker Desktop. Cela simplifie la gestion : vous pouvez démarrer et arrêter plusieurs containers d'un coup et garder votre workspace rangé. L'article précise aussi qu'il s'agit d'une fonctionnalité de l'interface et suggère de convertir vos commandes `docker run` en fichier compose pour en profiter.
</TLDR>

Au quotidien, je fais tourner plusieurs outils sous forme de containers Docker : <Link to="/blog/heimdall-dashboard">Heimdall</Link>, <Link to="/blog/docker-memos">Memos</Link> et <Link to="/blog/docker-karakeep">Karakeep</Link>. Ça peut représenter un ou plusieurs containers par outil.

Je travaille sous Windows, donc j'utilise Docker Desktop pour obtenir la liste des containers et, comme j'utilise Docker pour mes propres projets (Python, PHP ou autre), je me retrouve dans la situation suivante : j'ai une longue liste de containers et j'aimerais un peu d'ordre.

Des outils comme Heimdall, Memos et Karakeep, je les utilise pour me faciliter le travail au quotidien et ce serait bien de pouvoir les regrouper.

<!-- truncate -->

Voyez ci-dessous : je regroupe des outils d'origines différentes sous `Tools` pour les gérer plus facilement.

![Regrouper les outils](./images/grouping_tools.webp)

Ainsi, j'ai une vue plus compacte des containers et je peux rapidement distinguer mes outils de mes projets. Et si besoin, je peux arrêter tous les outils d'un coup. Bien pratique.

## La propriété name dans le fichier compose.yaml {#the-name-property-in-the-composeyaml-file}

La solution est facile à mettre en place : si vous avez un `compose.yaml` (ou `docker-compose.yml` si vous utilisez l'ancienne convention de nommage), ajoutez simplement une entrée `name: tools` en haut du fichier.

Par exemple :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Et c'est tout.

*Autre façon de garder une longue liste de containers gérable, cette fois depuis le terminal plutôt que depuis Docker Desktop : les fonctions interactives basées sur `fzf` de <Link to="/blog/zsh-docker-functions">ZSH Functions - Customizing Your Shell for Docker Management</Link>.*

Maintenant, en lançant `docker compose up --build --detach`, vous verrez vos containers regroupés dans `tools` (visible uniquement dans le logiciel Docker Desktop pour Windows ; pas avec la commande `docker ps`).

Faites de même pour chaque outil souhaité : s'il y a un fichier `compose.yaml`, ajoutez simplement l'entrée de premier niveau `name: tools`.

Mais que faire si vous n'avez pas de fichier YAML et que vous utilisez une commande `docker run` à la place ? Il existe bien un flag `--name` avec `docker run` mais il sert à nommer le container (l'équivalent de l'entrée `container_name`, donc).

Donc, si vous lancez `docker run [something]`, il vous faudra convertir la ligne en fichier YAML. N'importe quelle IA peut le faire. Copiez/collez votre commande `docker run [something]` complète et demandez-lui de la convertir en fichier `compose.yaml`.

Simple et vraiment pratique.

## Les outils peuvent se trouver dans des dossiers différents {#tools-can-be-located-in-different-folders}

Juste pour préciser : vous pouvez placer vos fichiers, volumes, etc. dans des dossiers différents, ça n'a aucune importance. Sur mon disque, j'ai un dossier `~/tools` avec un répertoire par outil (un pour Heimdall, un pour Memos, un pour Karakeep, ...) et ça ne pose aucun problème.

Ça me permet de stocker fichiers et volumes proprement.
