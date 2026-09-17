---
slug: windows-winget
title: Mettre à jour tous les programmes Windows obsolètes en une fois
date: 2023-12-14
description: Mettez à jour tous vos programmes Windows obsolètes en une fois grâce au puissant outil en ligne de commande winget. Découvrez les commandes pour un système rapide et efficace.
authors: [christophe]
image: /img/v2/windows_tips.webp
mainTag: windows
tags:
  - customization
  - windows
language: fr
review_date: 2026-07-30
---
![Mettre à jour tous les programmes Windows obsolètes en une fois](/img/v2/windows_tips.webp)

<TLDR>
Cet article couvre `winget`, le gestionnaire de packages intégré à Windows : mettre à jour en lot tous les programmes installés avec `winget upgrade --all --silent` (éventuellement avec `--include-unknown` pour en attraper davantage), lister les logiciels installés et les mises à jour disponibles avec `winget list --upgrade-available`, et mettre à jour une seule application par son nom.
</TLDR>

> [Use the winget tool to install and manage applications](https://learn.microsoft.com/en-us/windows/package-manager/winget/)

Si vous travaillez sous Linux ou <Link to="/blog/wsl-windows-explorer">WSL</Link>, vous connaissez très bien l'instruction `sudo apt-get update && sudo apt-get upgrade` qui demande au système d'exploitation de mettre à jour les programmes présents sur votre disque vers une version plus récente.

Sous Windows, depuis quelques années (à partir de Windows 10), une telle commande existe aussi : c'est `winget`.

<!-- truncate -->

En lançant `winget upgrade --all --silent` dans **<Link to="/blog/windows-terminal">une console DOS (ou Powershell)</Link>** démarrée avec les droits admin, vous déclenchez un processus qui va scanner (en une seconde) votre ordinateur, détecter quels programmes y sont installés et vérifier si une version plus récente existe (et est connue de winget).

![Démarrage de winget](./images/start-winget.webp)

Ensuite, comme nous avons ajouté les flags `--all --silent`, nous autorisons winget à procéder aux mises à jour sans demander confirmation. Laissez l'ordinateur travailler quelques minutes et... tadaaa... vous avez des versions toutes fraîches de vos logiciels *(ceux supportés par winget)*.

![winget en cours d'exécution](./images/running-winget.webp)

Winget a détecté que 17 programmes devaient être mis à jour et va, un par un, télécharger et installer les versions plus récentes.

Facile non ?

<AlertBox variant="info" title="Y compris les inconnus">
[Marc Dechèvre](https://www.woluweb.be/) me dit que la commande `winget upgrade --all --silent` a trouvé 29 mises à jour à faire sur sa machine et qu'ajouter le flag `--include-unknown` en a trouvé 15 de plus.

</AlertBox>

## Obtenir la liste des logiciels {#getting-the-list-of-software}

Lancer `winget list` retourne la liste de tous les logiciels installés sur votre machine et `winget list --upgrade-available` uniquement ceux pour lesquels une version plus récente est disponible sur internet.

Et, pour obtenir la liste triée, assurez-vous d'être sous **PowerShell** et lancez plutôt cette commande : `winget list --upgrade-available | Sort-Object`. Le résultat n'est pas très joli mais, au moins, les noms d'applications sont triés.

## Mettre à jour une seule application {#upgrade-just-one-application}

En lançant `winget upgrade Docker` par exemple, vous ne mettrez à jour que celle-là.
