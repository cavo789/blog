---
slug: docker-php-ini
title: Mettre à jour php.ini quand on utilise une image Docker
date: 2023-12-22
description: Un guide pas à pas pour mettre à jour votre fichier php.ini dans un container Docker via un volume monté dans compose.yaml. Réglez les problèmes courants comme la taille maximale d'upload.
authors: [christophe]
image: /img/v2/docker_tips.webp
series: Create your joomla website using Docker
mainTag: docker
tags:
  - apache
  - docker
  - joomla
language: fr
review_date: 2026-07-30
---
![Mettre à jour php.ini quand on utilise une image Docker](/img/v2/docker_tips.webp)

<TLDR>
Cet article montre comment surcharger les réglages de `php.ini` (p. ex. la taille maximale d'upload) sur un site PHP dockerisé : créez un fichier `php.ini` local, montez-le par-dessus le fichier de config du container via une entrée `volumes` dans `compose.yaml`, puis lancez `docker compose down && docker compose up --detach` pour appliquer le changement.
</TLDR>

Cet article répond à la situation suivante : *j'utilise une image Docker pour faire tourner mon site et je dois modifier le fichier php.ini ; comment faire ?*

Un exemple concret : vous avez suivi mon article <Link to="/blog/docker-joomla">Créez votre site web Joomla avec Docker</Link> et tout fonctionne bien. Le site tourne, et vous voulez uploader un gros fichier via l'interface d'administration de Joomla. Et là, vous obtenez l'erreur *The selected file cannot be transferred because it is larger than the maximum upload size allowed*.

<!-- truncate -->

![Vos réglages PHP avant modification](./images/before.webp)

Une des façons les plus simples de faire est de créer un fichier `.ini` sur votre disque et de <Link to="/blog/docker-volume">le partager avec votre container</Link>.

Vous avez très probablement un fichier `compose.yaml` ; ouvrez-le dans votre éditeur.

<Vars port="8080" labels={{ port: "Port de l'host" }} />

Pour l'illustration, vous trouverez ci-dessous une copie du fichier `compose.yaml` le plus simple que vous pouvez récupérer dans mon article <Link to="/blog/docker-joomla">Créez votre site web Joomla avec Docker</Link>. *Le vôtre peut évidemment être différent.* C'est juste pour l'exemple.

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

## Étape un - Mettre à jour votre fichier yaml {#step-one---update-your-yaml-file}

La solution consiste à ajouter la ligne `volumes` si elle n'est pas déjà présente dans votre fichier et, surtout, la ligne qui *surcharge* le fichier `php.ini` comme ci-dessous :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

## Étape deux - Créer votre propre fichier php.ini {#step-two---create-your-own-phpini-file}

La deuxième chose à faire est de créer un fichier appelé `php.ini` dans le même dossier que votre `compose.yaml`, où vous définirez vos variables ; par exemple :

<Snippet filename="php.ini" source="./files/php.ini" />

Votre dossier contient donc maintenant au moins deux fichiers :

<Terminal typewriter source="./files/terminal-1.txt" />

## Étape trois - Redémarrer votre container {#step-three---restart-your-container}

Ceci fait, lancez simplement `docker compose down ; docker compose up --detach` dans votre terminal pour arrêter votre/vos container(s) actuel(s) et le/les redémarrer.

Au redémarrage, Docker prendra en compte vos derniers changements et mettra à jour le fichier `php.ini` présent dans Docker.

![Vos réglages PHP après modification](./images/after.webp)
