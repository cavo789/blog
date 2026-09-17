---
slug: move-wsl-to-another-location
title: Déplacer WSL vers un autre emplacement
date: 2023-11-03
description: Vous manquez d'espace sur le disque C ? Suivez ce guide pas à pas pour déplacer en toute sécurité votre distribution WSL (Windows Subsystem for Linux) et vos données Docker vers un autre disque, à l'aide des commandes wsl --export et wsl --import.
authors: [christophe]
image: /img/v2/wsl.webp
series: WSL2 - Install, move and use it
mainTag: wsl
tags:
  - docker
  - wsl
language: fr
review_date: 2026-07-30
---
![Déplacer WSL vers un autre emplacement](/img/v2/wsl.webp)

> [https://dev.to/mefaba/installing-wsl-on-another-drive-in-windows-5c4a](https://dev.to/mefaba/installing-wsl-on-another-drive-in-windows-5c4a)

<TLDR>
Cet article montre comment déplacer une distribution WSL2 hors du disque C: pour libérer de l'espace, avec `wsl --shutdown`, `wsl --export` vers un fichier `.tar`, `wsl --unregister` pour supprimer l'originale et `wsl --import` pour la recréer sur un autre disque — le même schéma export/unregister/import fonctionne aussi pour déplacer la partition WSL de Docker Desktop.
</TLDR>

Par défaut, la distribution Linux est installée sur votre disque C:. Si, comme moi, vous avez un disque D: quasiment vide, il peut être très intéressant d'y déplacer Linux.

*Une fois déplacée, rien d'autre ne change : votre distribution continue de fonctionner exactement comme avant, <Link to="/blog/wsl-windows-explorer">y compris l'ouverture de vos dossiers Linux dans l'explorateur Windows</Link>.*

<!-- truncate -->

Pour ce faire :

- Lancez `wsl --list --verbose` depuis une console **PowerShell** ; vous obtiendrez le nom de votre distribution (`Ubuntu` dans mon cas),
- Depuis une console **PowerShell administrateur**,
  - Lancez `wsl --shutdown` pour arrêter WSL,
  - Sur votre second disque, créez un dossier temporaire comme `d:\wsl`,
  - Lancez `wsl --export Ubuntu d:\wsl\ubuntu.tar`,
  - Une fois terminé, lancez `wsl --unregister Ubuntu` puis,
  - Lancez `wsl --import Ubuntu d:\wsl\ubuntu d:\wsl\ubuntu.tar --version 2`
  - Lancez `del d:\wsl\ubuntu.tar`

Vous devrez faire cela pour chaque distribution installée que vous souhaitez déplacer.

<AlertBox variant="info">
Si vous avez Docker, vous pouvez faire la même chose et déplacer la partition Docker vers votre second disque.

<Terminal typewriter title="Powershell" source="./files/terminal-1.txt" />


</AlertBox>

Une fois terminé, redémarrez votre ordinateur pour finaliser le déplacement.
