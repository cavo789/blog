---
slug: bash-progression-bar
title: Linux - Utiliser une barre de progression dans vos scripts
date: 2024-10-07
description: Ajoutez une barre de progression visuelle à vos scripts Bash sous Linux. Ce guide vous montre comment implémenter facilement une barre de progression pour suivre des jobs concurrents, visualiser l'avancement et améliorer votre interface dans le terminal.
authors: [christophe]
image: /img/v2/linux_progress_bar.webp
series: Writing better Bash scripts
mainTag: bash
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3m2sz4hqz322z
---
<!-- cspell:ignore bashpid, pids, nproc,ephase  -->
<!-- markdownlint-disable MD022,MD025 -->

![Linux - Utiliser une barre de progression dans vos scripts](/img/v2/linux_progress_bar.webp)

<TLDR>
Cet article de suivi ajoute une barre de progression visuelle aux scripts Bash (dans la continuité de l'article précédent sur les jobs parallèles) à l'aide d'un helper réutilisable `progress_bar.sh` : sourcez-le, faites passer la sortie de votre boucle dans `progress_bar::process "Doing some stuff" 50`, et affichez `Progress=N` depuis l'intérieur de la boucle pour piloter la barre — pratique pour les traitements par lots longs comme des uploads vers une API pilotés par un CSV.
</TLDR>

Dans mon article précédent, <Link to="/blog/bash-parallel-task">Linux - Take advantage of the number of CPUs you have; start concurrent jobs</Link>, nous avons vu comment lancer des jobs en parallèle.

La prochaine chose sympa, c'est d'afficher une barre de progression dans votre console. Ça présente plusieurs avantages : une vue claire de ce qui est fait et de ce qui reste à faire, et une interface agréable.

*Quand le nombre d'éléments n'est pas connu à l'avance, un compteur en direct est plus adapté ; voyez <Link to="/blog/linux-inotifywait">Keep running and count the number of files in a folder using inotifywait</Link>. Et pour garder une trace de ce qui s'est passé une fois la barre disparue, <Link to="/blog/bash-logging">Bash - Script to add logging features to your script</Link>.*

Il y a quelques mois, j'ai trouvé cet article de blog français dans mes flux RSS : [https://xieme-art.org/post/bash-avance-barre-de-progression/](https://xieme-art.org/post/bash-avance-barre-de-progression/) et, juste, **wow !!!**

Amusons-nous avec ça.

<!-- truncate -->

## Résultat {#result}

![Barre de progression](./images/progression_bar.gif)

C'est une simple boucle Bash, sans aucun outil externe, qui pilote une barre de progression en direct dans la console.

## Pourquoi ça fonctionne {#why-it-works}

Un script doit faire trois choses pour obtenir cette barre :

1. Sourcer le script `progress_bar.sh` ([merci à ephase](https://xieme-art.org/post/bash-avance-barre-de-progression/)) ;
2. Lancer la fonction qui fait le vrai travail d'une manière particulière : pas juste `main` mais `main > >(progress_bar::process "Doing some stuff" 50)`. Le chiffre `50` doit correspondre au nombre d'itérations de la boucle ;
3. Depuis l'intérieur de cette fonction, afficher une seule chose dans la console avec `echo` : `Progress=` suivi d'un nombre (de 1 à 50) — c'est le signal que la barre lit pour avancer.

Pas si compliqué, non ?

## Créer demo.sh {#create-demosh}

D'abord, créez un nouveau dossier sur votre disque et déplacez-vous dedans : `mkdir /tmp/progress && cd $_`.

Ensuite, créez un fichier `demo.sh` dans ce dossier et copiez/collez le script bash ci-dessous :

<Snippet filename="demo.sh" source="./files/demo.sh" />

Rendez le script exécutable en lançant `chmod +x ./demo.sh`.

## Créer progress_bar.sh {#create-progress_barsh}

Voici le contenu à copier/coller dans un fichier appelé `progress_bar.sh`, créé dans le même dossier que `demo.sh`.

Créez donc un nouveau fichier sur votre disque dur ; nommez-le `progress_bar.sh` et copiez/collez le contenu ci-dessous dedans.

<Snippet filename="progress_bar.sh" source="./files/progress_bar.sh" />

## Place à l'exécution {#time-to-run-the-code}

Retournez simplement dans la console, lancez `./demo.sh` et... wow, c'est vraiment chouette — vous obtenez la barre montrée plus haut.

Dans un cas réel, j'ai implémenté cette fonctionnalité dans un script Bash où je dois lire un fichier CSV et, pour chaque enregistrement récupéré dans le fichier, lancer une commande `curl` pour appeler une API RESTful en POST et uploader un PDF.

Et, quand le script est lancé de manière interactive, la sortie à l'écran est vraiment pratique et terriblement efficace.

Bien sûr, j'utilise aussi un fichier de log où je redirige un maximum d'informations.
