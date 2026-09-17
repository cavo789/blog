---
slug: linux-inotifywait
title: Compter en continu le nombre de fichiers d'un dossier avec inotifywait
date: 2024-11-24
description: Utilisez inotifywait sous Linux pour surveiller un répertoire en continu et obtenir en temps réel le compte des fichiers nouvellement créés, avec un simple script Bash.
authors: [christophe]
image: /img/v2/linux_tips.webp
mainTag: bash
tags:
  - bash
  - linux
  - python
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore joinpath,pathlib -->

![Compter en continu le nombre de fichiers d'un dossier avec inotifywait](/img/v2/linux_tips.webp)

<TLDR>
Cet article montre comment obtenir un compte en direct, mis à jour en continu, des fichiers créés dans un dossier grâce à `inotifywait` (contrairement au `ls folder | wc -l` qui ne s'exécute qu'une fois), le tout dans un petit script `monitor.sh` — utilisé ici dans un second terminal pour suivre la progression pendant qu'un script Python (exécuté dans un container Docker) génère des dizaines de milliers de fichiers PDF.
</TLDR>

Ces dernières semaines, j'ai travaillé sur un script Python qui génère des PDF. Mon script devait en produire 70 000 et ça prend évidemment un certain temps.

Mon idée était de lancer le script dans une console Linux et, dans une seconde console, d'avoir un compteur qui augmente au fur et à mesure que les fichiers sont créés sur le disque dur.

Le premier script sera en Python et je voulais quelque chose d'ultra-simple, basé sur une commande Linux toute bête.

La commande `ls folder_name | wc -l` fonctionne mais ne reste pas active. Voyons comment faire mieux avec **inotifywait**.

<!-- truncate -->

## Lancer les scripts {#running-the-scripts}

Voici le résultat, avant toute chose : deux terminaux côte à côte, l'un qui génère des fichiers, l'autre qui en affiche le compte en direct, mis à jour en continu.

D'abord, dans une console séparée, on lance notre script de monitoring : `./monitor.sh out`.

Dans une seconde fenêtre, on démarre le script Python : `docker exec -it demo python script.py`.

![Lancer un monitoring avec inotifywait](./images/inotifywait.gif)

C'est exactement le compteur en direct que je cherchais. Voyons comment chaque pièce est construite — l'environnement Python de démo, le script générateur de fichiers et `monitor.sh` lui-même.

## Mettre en place l'environnement de démo (optionnel — passez si vous avez déjà Python et un dossier à surveiller) {#setting-up-the-demo-environment-optional--skip-if-you-already-have-python-and-a-folder-to-watch}

J'ai besoin d'un environnement Python, alors créons-le rapidement avec Docker.

Créez un fichier appelé `Dockerfile` avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Créez l'image en lançant `docker build --tag inotify .`.

On peut maintenant créer notre container Docker : `docker run --detach --name demo -v ./src:/app/src -v ./out:/app/out inotify`.

Cela crée un container Docker qui restera actif. Nous allons <Link to="/blog/docker-volume">partager</Link> notre script `src/script.py` avec le container et, aussi, le dossier `out/` de notre host en tant que dossier `/app/out` du container.

## Créer un script Python d'exemple {#create-a-sample-python-script}

Il nous faut un tout petit script Python pour générer nos fichiers :

<Snippet filename="src/script.py" source="./files/script.py" />

## Créer le script monitor.sh {#creating-the-monitorsh-script}

Créez un script appelé `monitor.sh` avec ce contenu :

<Snippet filename="monitor.sh" source="./files/monitor.sh" />

Rendez le script exécutable : `chmod +x ./monitor.sh` et pensez à installer **inotify** en lançant `sudo apt-get update && sudo apt-get install -y --no-install-recommends inotify-tools`.

<AlertBox variant="info">
Vous pouvez vérifier rapidement si `inotifywait` est déjà installé en lançant `which inotifywait`. Si vous n'obtenez aucune réponse (réponse vide), c'est qu'il n'est pas encore là.

</AlertBox>

Voilà tout ce qu'il faut pour reproduire le compteur montré en début d'article.

## Conclusion {#conclusion}

Maintenant, je peux réduire l'écran principal et garder uniquement le compteur affiché.

Je suis aussi certain que le script crée bien les fichiers, puisque j'ai utilisé deux technologies différentes : Python et Bash.

*Quand vous savez à l'avance combien de fichiers seront produits, un compteur peut devenir une vraie jauge ; voyez <Link to="/blog/bash-progression-bar">Linux - Using a progression bar in your script</Link>.*
