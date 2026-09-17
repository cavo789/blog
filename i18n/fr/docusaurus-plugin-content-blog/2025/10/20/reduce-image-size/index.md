---
slug: reduce-image-size
title: CaesiumCLT – Compressez vos images sans effort, directement sur votre machine
date: 2025-10-20
description: Outil de compression d'images rapide et efficace, avec ou sans perte
authors: [christophe]
image: /img/v2/image_optimization.webp
mainTag: linux
tags:
  - docker
  - linux
language: fr
updates:
  - date: 2026-02-04
    note: add recursive CLI
  - date: 2026-09-13
    note: pin the Homebrew install revision instead of piping HEAD into bash
blueskyRecordKey: 3m3m74j2e6c2e
---
<!-- cspell:ignore Korben,Squoosh,brew,caesiumclt,behat -->

![CaesiumCLT – Compressez vos images sans effort, directement sur votre machine](/img/v2/image_optimization.webp)

<TLDR>
Cet article présente CaesiumCLT, un outil en ligne de commande pour compresser efficacement vos images. L'auteur explique comment l'installer avec Homebrew et fournit une commande concrète pour convertir et compresser des fichiers PNG vers le format moderne WEBP, avec une réduction de taille significative à la clé. L'article propose aussi une commande shell bien pratique pour repérer les dossiers contenant les images les plus lourdes, afin de cibler vos efforts d'optimisation, et montre comment lancer la compression de manière récursive dans les sous-dossiers.
</TLDR>

Korben, un blogueur français bien connu, a récemment publié cet article : [https://korben.info/caesium-compression-images-ecologie-numerique.html](https://korben.info/caesium-compression-images-ecologie-numerique.html) et, zut, quelques jours trop tard pour moi.

Je venais de recréer toutes les images de mon blog et de les convertir à la main... une par une... avec [Squoosh](https://squoosh.app/). *Et je savais exactement lesquelles étaient trop lourdes grâce au script d'audit décrit dans <Link to="/blog/docusaurus-check-images">Running some checks on your Docusaurus images</Link>.*

Voyons dans cet article comment faire la conversion avec une seule ligne de commande.

<!-- truncate -->

## Lancer l'outil d'optimisation {#run-the-optimization-tool}

Une fois `caesiumclt` installé — voir plus bas — voici ce qu'il fait : je vais dans le dossier qui contient mes images et je lance cette commande :

<Terminal typewriter source="./files/terminal-3.txt" />

Comme on le voit ci-dessus, j'ai converti sept PNG en WEBP, et les nouveaux fichiers sont enregistrés dans le même dossier.

Il ne me reste plus qu'à éditer manuellement mon article de blog (celui qui utilise ces images).

<AlertBox variant="tip" title="En mode récursif">
Ajoutez le flag `--recursive`, comme dans `caesiumclt -q 85 --recursive --format webp --same-folder-as-input *.png`, pour traiter tous les fichiers depuis votre dossier courant.
</AlertBox>

## Installation {#installation}

Le guide d'installation est disponible ici : [https://saerasoft.com/caesiumclt/](https://saerasoft.com/caesiumclt/).

Si, comme moi, vous n'avez pas encore `brew`, installez-le d'abord. Plutôt que d'envoyer `HEAD` directement dans `bash` et d'exécuter ce qui se trouve sur la branch à cette seconde précise, fixez une révision que vous pouvez lire sur GitHub au préalable :

```bash
SHA=8949852f785a3bacaba2a979d0790337950b0a4a
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/${SHA}/install.sh)"
```

Sur Apple Silicon, vous pouvez carrément vous passer du script : Homebrew propose un [`Homebrew.pkg`](https://github.com/Homebrew/brew/releases/latest) signé. <Link to="/blog/atuin-bash-history">Un article plus récent</Link> explique en détail pourquoi un `curl | bash` mérite autant de prudence.

Cela fait, lancez simplement `brew install caesiumclt`.

Lisez bien les informations affichées dans la console : vous devrez finaliser l'installation en éditant votre fichier `.bashrc` et en ajoutant `caesiumclt` à votre `PATH`.

## Comment repérer les dossiers les plus volumineux de votre disque {#how-to-determine-the-biggest-folders-on-your-disk}

Sur mon blog, j'écris mes articles dans des dossiers du type `blog/2025/10/02/`, c'est-à-dire un dossier basé sur la date de publication. Je place ensuite les images de l'article dans un sous-dossier `images`.

Cela dit, pour retrouver le dossier le plus volumineux de mon disque, je lance la commande ci-dessous. Elle récupère tous les fichiers `.png`, additionne leur taille par répertoire et liste les répertoires par taille.

<Terminal typewriter source="./files/terminal-2.txt" />

Je peux donc sauter dans `2025/02/01/heimdall-dashboard/images` et lancer `caesiumclt -q 85 --format webp --same-folder-as-input *.png` pour optimiser ces images :

*Les images sont souvent la partie la plus lourde d'une page, mais pas la seule ; <Link to="/blog/assets-minification">Streamline Your Frontend - Minifying Assets with Docker, Bash, and YAML</Link> applique le même raisonnement à vos CSS et JavaScript.*

<Terminal typewriter source="./files/terminal-1.txt" />
