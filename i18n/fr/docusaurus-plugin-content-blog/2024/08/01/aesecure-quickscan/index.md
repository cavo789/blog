---
slug: aesecure-quickscan
title: aeSecure - QuickScan - Scanner de virus gratuit
date: 2024-08-01
description: Scannez rapidement votre site Joomla à la recherche de virus et de fichiers suspects avec l'outil gratuit aeSecure QuickScan. Créé à l'origine par Christophe Avonture, le projet est désormais maintenu par l'AFUJ (Association Francophone des Utilisateurs de Joomla).
authors: [christophe]
image: /img/v2/viruses.webp
mainTag: security
tags:
  - docker
  - security
language: fr
updates:
  - date: 2026-07-31
    note: "Project transferred to AFUJ (Association Francophone des Utilisateurs de Joomla). New repository: https://github.com/AFUJ/quickscan. Demo site (quickscan.avonture.be) is offline."
---
![aeSecure - QuickScan - Scanner de virus gratuit](/img/v2/viruses.webp)

<!-- cspell:ignore aesecure,quickscan -->

<TLDR>
Cet article présente aeSecure QuickScan, un scanner de virus/malwares gratuit écrit en PHP et optimisé pour Joomla (versions 1.0.13 à 5.x), capable de détecter plus de 45 000 signatures. Créé à l'origine par Christophe Avonture, le projet est désormais maintenu par l'AFUJ (Association Francophone des Utilisateurs de Joomla) sur [github.com/AFUJ/quickscan](https://github.com/AFUJ/quickscan). Le principe : déposer un seul fichier `scan.php` sur le site et le lancer depuis le navigateur. Il met en liste blanche, par hash, les fichiers du cœur de Joomla non modifiés, ne scanne que les fichiers inconnus restants à la recherche de signatures suspectes, et doit être supprimé du serveur une fois le scan terminé.
</TLDR>

En 2018, j'ai publié la première version de mon outil gratuit, aeSecure QuickScan.

<AlertBox variant="note">
Depuis 2025, le projet a été repris par l'**AFUJ** (Association Francophone des Utilisateurs de Joomla). Le nouveau repository officiel est [github.com/AFUJ/quickscan](https://github.com/AFUJ/quickscan). Je me suis retiré du projet après avoir [annoncé la recherche d'un nouveau mainteneur](https://forum.joomla.fr/forum/d%C3%A9veloppeurs/projets-open-sources/2068020-aesecure-quickscan-projet-opensource-en-recherche-d-un-repreneur) sur le forum Joomla France. Tout le mérite et les développements futurs reviennent à l'équipe de l'AFUJ.
</AlertBox>

Le scanner détecte plus de 45 000 signatures de virus et est optimisé pour les sites Joomla.

aeSecure QuickScan reconnaît les fichiers natifs de Joomla, de la version 1.0.13 jusqu'à Joomla 6.x.

Il suffit de télécharger le scanner sur votre site, de le lancer depuis une URL et il scannera le site pour identifier rapidement certains virus ou signatures suspectes.

<!-- truncate -->

## Résultat {#result}

![La page d'accueil de aeSecure QuickScan](./images/aesecure_quickscan_welcome.webp)

Voici aeSecure QuickScan en action sur un site Joomla réel : vous déposez un seul fichier PHP sur
le serveur, vous l'ouvrez dans un navigateur, et quatre boutons vous mènent de « rien n'a encore
été scanné » à un rapport complet des fichiers suspects — aucune installation locale nécessaire.

## Pourquoi ça fonctionne {#why-it-works}

- Les fichiers natifs de Joomla (de 1.0.13 à 6.x) sont mis en liste blanche par hash : si la
  signature d'un fichier correspond strictement à celle d'un fichier Joomla original non modifié,
  il est considéré comme fiable et ignoré.
- Seuls les fichiers qui ne correspondent pas — les inconnus, potentiellement modifiés — sont
  scannés à la recherche de signatures de virus.
- Le scanner détecte d'abord votre version de Joomla, il télécharge donc automatiquement la liste
  blanche correspondante au lieu de deviner.

## Télécharger le scanner {#download-the-scanner}

Rendez-vous sur le [repository AFUJ/quickscan](https://github.com/AFUJ/quickscan) et téléchargez-y le fichier du scanner. Une fois le contenu du fichier affiché, appuyez sur <kbd>CTRL</kbd>+<kbd>A</kbd> pour sélectionner tout le contenu puis sur <kbd>CTRL</kbd>+<kbd>C</kbd> pour le copier en mémoire.

Allez dans le dossier qui contient votre site (de préférence sur votre ordinateur local), créez un nouveau fichier appelé par exemple `scan.php` et collez-y le contenu avec <kbd>CTRL</kbd>+<kbd>V</kbd>.

Simple, non ?

Voilà, vous avez copié le moteur du scanner. Il ne reste plus qu'à y accéder en démarrant votre site comme d'habitude (disons via `http://localhost` pour une version locale du site) et en ajoutant le nom du script (bref, `http://localhost/scan.php`).

<AlertBox variant="info">
Ce n'est pas recommandé de faire ça directement sur votre site en ligne, mais c'est possible. Dans ce cas, démarrez votre client FTP, connectez-vous à votre site, créez un fichier `scan.php` distant, lancez votre navigateur et rendez-vous sur votre site.

Ce n'est pas recommandé parce que le scanner demande du temps de calcul et votre hébergeur arrêtera probablement le processus quand le script PHP dépassera xxx secondes (cela dépend de votre configuration).

En lançant le scanner en local, vous n'aurez pas ce genre de problèmes de *timeout*. *Monter une copie locale d'un site Joomla prend deux minutes avec <Link to="/blog/docker-joomla-right-to-the-point">Start Joomla with Docker in just a few clicks</Link>.*

</AlertBox>

## Lancer le scanner {#run-the-scanner}

Démarrez simplement votre navigateur et allez à l'URL où votre site est accessible. À la fin de l'URL, ajoutez `/scan.php`, c'est-à-dire le nom du fichier que vous venez de créer — vous arriverez sur la page d'accueil montrée plus haut.

Le premier bouton *1. Clean the cache and temp folders* permet de supprimer les fichiers temporaires et d'accélérer le scanner en évitant de scanner des fichiers inutiles.

Une fois le premier bouton cliqué et l'action terminée, le deuxième bouton *2. Getting the file list* va parcourir votre site et vérifier quels fichiers doivent être scannés ou non.

Un fichier ne sera pas scanné si sa signature (son hash) est strictement identique à une signature en « liste blanche ».

<AlertBox variant="info" title="Le concept de liste blanche">
Pensez aux fichiers originaux de Joomla. Quand vous faites une nouvelle installation de Joomla, disons la 5.2.0, les fichiers contenus dans le ZIP de Joomla sont considérés comme sûrs. Vous faites confiance à ces fichiers pour ne contenir aucun virus. Donc, les fichiers originaux issus d'une installation Joomla, s'ils sont **non modifiés**, sont sûrs. Si la signature d'un fichier correspond strictement à celle d'un fichier venant de Joomla, aeSecure QuickScan sait que le fichier est sûr. Ces signatures de fichiers sont en liste blanche.
</AlertBox>

L'étape 2 va donc détecter quels fichiers ne sont pas dans une liste blanche et doivent être scannés.

Le troisième bouton *3. Scan the site* lance le vrai scan. Celui-là peut prendre du temps et il vaut donc mieux le faire sur votre localhost.

Le scan se fait via des appels Ajax.

Le dernier bouton *4. Remove this script from the server* s'assure de ne pas laisser le scanner (le fichier `scan.php`) sur votre site. Le script doit être supprimé et ne pas rester là.

## Sous le capot {#under-the-hood}

*Optionnel — passez cette section si vous voulez juste lancer un scan.*

Pendant la découverte de votre site (*2. Getting the file list*), le scanner va d'abord essayer de déterminer si votre site tourne sous Joomla et, si oui, récupérer la version installée. Cette étape est très rapide et permet un gain de performance.

Dès que le scanner a détecté, par exemple, que vous utilisez Joomla 5.2.0, son moteur va aller sur [https://github.com/AFUJ/quickscan/tree/master/hashes/joomla](https://github.com/AFUJ/quickscan/tree/master/hashes/joomla) et chercher un fichier pour cette version (c'est-à-dire `J!5.2.0.json`). S'il le trouve, la version est supportée par le scanner et un fichier JSON sera téléchargé. Celui-ci contient les signatures de fichiers présentées au chapitre précédent.

Le scanner va ensuite récupérer la liste de tous les fichiers de votre site et calculer leur signature (hash). Si la signature est retrouvée dans le fichier de signatures (le JSON), le fichier sera considéré comme sûr.

À la fin de l'action 2, nous avons donc la liste des fichiers inconnus, ceux que le scanner doit analyser à la recherche de virus.

Scanner le site (action 3) signifie alors ne scanner que les fichiers inconnus, ceux qui ne sont pas en liste blanche. Par défaut, 500 fichiers maximum sont scannés à la fois. Si votre serveur web renvoie un timeout (c'est-à-dire que le scan a pris trop de temps et que le serveur a arrêté l'action), vous pouvez essayer de réduire ce nombre en cliquant sur l'accordéon en haut à gauche pour afficher le menu et sélectionner une valeur plus basse :

![aeSecure Quick-Scan - Accordéon](./images/aesecure_quickscan_accordion.webp)

## Conclusion {#conclusion}

aeSecure QuickScan met en liste blanche par hash, ne scanne que le reste, et disparaît une fois le
travail fait — un fichier, un scan, aucun résidu.

<AlertBox variant="note">
Le site de démonstration original (`quickscan.avonture.be`) n'est plus disponible. Consultez le [repository de l'AFUJ](https://github.com/AFUJ/quickscan) pour toute démo ou capture d'écran mise à jour par les nouveaux mainteneurs.
</AlertBox>

Envie d'en lire plus ? Rendez-vous sur [https://github.com/AFUJ/quickscan/blob/master/readme.md](https://github.com/AFUJ/quickscan/blob/master/readme.md) pour continuer votre découverte.

Nettoyer un site infecté est une chose ; s'assurer que ça ne se reproduise pas en est une autre. Mon article <Link to="/blog/apache-htaccess">Apache .htaccess file</Link> liste les directives que j'utilise pour bloquer l'accès aux fichiers cachés, désactiver l'exécution de scripts dans les dossiers d'upload et empêcher le listing des répertoires.
