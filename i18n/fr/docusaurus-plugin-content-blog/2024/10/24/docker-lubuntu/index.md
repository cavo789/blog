---
slug: docker-lubuntu
title: Démarrer le bureau Lubuntu dans Docker
date: 2024-10-24
description: Apprenez à lancer l'interface graphique Lubuntu Desktop dans un container Docker sous Windows grâce à un X Server. Un environnement jetable parfait pour apprendre Linux et expérimenter.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: linux
tags:
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore lubuntu,initialising,xremote,autologin,realise -->
![Démarrer le bureau Lubuntu](/img/v2/docker_tips.webp)

<TLDR>
Cet article montre comment lancer une interface graphique Lubuntu Desktop complète dans un container Docker sous Windows : construire une image Lubuntu à partir d'un Dockerfile, installer un X Server Windows (VcXsrv) pour afficher le rendu, puis lancer `docker run` pour obtenir un bureau Linux jetable, idéal pour expérimenter sans toucher à la machine hôte.
</TLDR>

Pendant mes vacances d'été, j'ai regardé cette vidéo : [Full Ubuntu GUI in a Container Displayed on Windows (XServer)](https://www.youtube.com/watch?v=WutV6n21dys) et, bien sûr, j'ai voulu jouer avec.

L'idée est de démarrer une distribution Lubuntu Desktop dans un container Docker. Lubuntu est une distribution Ubuntu légère, conçue pour être moins gourmande en ressources que l'Ubuntu standard.

Avec Docker et [Windows X Server](https://sourceforge.net/projects/vcxsrv/), nous pourrons jouer avec Lubuntu comme avec n'importe quel autre container : on essaie, on jette, et l'host n'en garde aucune trace. Idéal pour apprendre, donc.

*Ceci est la variante « bureau complet ». Pour une application seule, voyez <Link to="/blog/docker-run-linux-gui">Docker - Run Graphical User Interfaces - Firefox, Chrome & GIMP</Link> ; et si vous préférez éviter complètement l'installation d'un X Server, <Link to="/blog/docker-gui-in-browser">Docker - Running some GUI interfaces in the browser</Link> les affiche dans un onglet de navigateur.*

<!-- truncate -->

## Résultat {#result}

![Le bureau Lubuntu](./images/lubuntu-desktop.webp)

Un bureau Lubuntu complet, qui tourne dans un container Docker et s'affiche sur l'host Windows — pas de VM, pas de dual-boot, aucune trace une fois le container jeté.

## Pourquoi ça fonctionne {#why-it-works}

- Docker nous donne un environnement jetable : tout le bureau vit dans un container, donc rien ne touche l'host — jetez le container et il disparaît comme s'il n'avait jamais existé.
- [Windows X Server](https://sourceforge.net/projects/vcxsrv/) est ce qui affiche réellement le rendu : le container envoie sa sortie graphique au serveur X qui tourne sous Windows, et celui-ci la dessine à l'écran.

Je vous encourage à regarder la vidéo [Full Ubuntu GUI in a Container Displayed on Windows (XServer)](https://www.youtube.com/watch?v=WutV6n21dys).

## Étape 1 - Créer le Dockerfile {#step-1---create-the-dockerfile}

Il n'y a qu'un seul fichier à créer, appelé `Dockerfile`, avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Construisez l'image en lançant `docker build --tag cavo789/lubuntu .` (n'oubliez pas de remplacer `cavo789` par votre propre nom d'utilisateur).

## Étape 2 - Installer Windows X Server {#step-2---install-windows-x-server}

Le build de l'image prendra quelques minutes (l'image finale pèsera environ 3 Go).

Pendant la création de l'image, installez [Windows X Server](https://sourceforge.net/projects/vcxsrv/). C'est juste un .exe à installer sur votre machine Windows.

Une fois installé, lancez le programme. Sur le premier écran, comme expliqué dans la vidéo, sélectionnez *One large window* ; cliquez sur `Next`, gardez toutes les valeurs par défaut puis cliquez sur `Finish` au dernier écran.

![Windows X Server](./images/xserver.webp)

En cliquant sur `Finish`, vous obtiendrez un écran noir. **C'est normal.**

![La fenêtre noire du X Server](./images/xserver-black-window.webp)

## Étape 3 - Démarrer le container {#step-3---start-the-container}

Lancez votre container avec `docker run -t cavo789/lubuntu` et **patientez, patientez, puis patientez encore. Si vous voyez des avertissements dans la console, ne vous inquiétez pas et continuez d'attendre**.

Il faudra peut-être une minute avant de voir apparaître le bureau Linux Lubuntu, et il faudra encore attendre parce que le système d'exploitation se charge et s'initialise (c'est le premier démarrage) — vous obtiendrez alors le bureau montré en haut de cet article.

<AlertBox variant="note" title="Le multi-écran ne semble pas fonctionner avec X Server">
Lors de mes tests, l'affichage n'était pas correct et j'ai dû débrancher le câble de mon second écran pour obtenir un rendu correct.

</AlertBox>

## Conclusion {#conclusion}

Vous réalisez qu'on vient d'installer une distribution Linux et de lancer son interface graphique dans un container ? En fait, c'est comme installer un nouveau PC.

Bien sûr, il faudrait aller plus loin, par exemple pour rendre les données persistantes (<Link to="/blog/docker-volume">via les volumes</Link>).
