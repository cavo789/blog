---
slug: wsl-windows-explorer
title: Ouvrir votre dossier Linux dans l'Explorateur Windows
date: 2023-11-03
description: Accédez à vos fichiers Linux dans l'Explorateur Windows ! Découvrez la commande toute simple pour ouvrir votre dossier WSL courant et comment corriger rapidement l'erreur « wsl.localhost is not accessible ».
authors: [christophe]
image: /img/v2/wsl.webp
series: WSL2 - Install, move and use it
mainTag: wsl
tags:
  - windows
  - wsl
language: fr
updates:
  - date: 2026-06-15
    note: Fixed inverted Windows 10/11 UNC path note (the AlertBox had `\\wsl$` and `\\wsl.localhost` the wrong way round); fixed Markdown formatting of the error message; corrected the OS version in the accessibility error section.
---
<!-- cspell:ignore cbfsconnect -->
![Ouvrir votre dossier Linux dans l'Explorateur Windows](/img/v2/wsl.webp)

<TLDR>
Cet article montre comment ouvrir votre dossier WSL courant dans l'Explorateur Windows en lançant `explorer.exe .` depuis votre console Linux. Cela correspond à un chemin UNC (`\\wsl.localhost\...` sous Windows 11, `\\wsl$\...` sous Windows 10). Il explique aussi comment corriger l'erreur « wsl.localhost is not accessible » : ajouter le fournisseur `P9NP` à deux clés du registre Windows, puis redémarrer.
</TLDR>

Saviez-vous qu'il est possible d'utiliser l'Explorateur Windows pour naviguer dans votre système de fichiers Linux ?

Une manière simple d'ouvrir votre dossier courant dans l'Explorateur Windows est d'appeler le binaire `explorer.exe`.

Par exemple, dans votre console Linux, ouvrez n'importe quel dossier existant comme `cd ~/repositories/blog` puis lancez simplement `explorer.exe .`.

<!-- truncate -->

Eh oui, il est possible d'appeler n'importe quel programme Windows (comme la calculatrice (`calc.exe`)) en tapant son nom suivi de `.exe`. Si le programme est dans le `PATH`, il démarrera. *Vous pouvez aller encore plus loin et laisser Windows choisir le bon programme pour un type de fichier donné ; voyez <Link to="/blog/wsl-powershell">Starting the default associated Windows program on WSL</Link>.*

Le `.` final signifie *dossier courant*, donc `explorer.exe .` ouvrira le dossier courant dans l'Explorateur Windows.

![Naviguer dans le système de fichiers Linux avec Explorer.exe](./images/explorer.webp)

Ça paraît dingue, non ? Windows va *convertir* le dossier Linux `/home/christophe/repositories/blog` en `\\wsl.localhost\Ubuntu\home\christophe\repositories\blog` (à la sauce Windows) et l'ouvrir. Cette adresse s'appelle un chemin UNC (UNC signifie *Uniform Naming Convention*).

Désormais, je peux utiliser l'Explorateur Windows pour gérer mes fichiers et dossiers comme je le fais depuis des décennies sous Windows.

<AlertBox variant="info" title="Windows 10">
Si vous êtes sous Windows 10, le chemin UNC utilise l'ancien préfixe `\\wsl$\` au lieu de `\\wsl.localhost\`. Le format `\\wsl.localhost\` a été introduit avec Windows 11.
</AlertBox>

## WSL localhost n'est pas accessible {#wsl-localhost-is-not-accessible}

> [https://github.com/microsoft/WSL/discussions/7742#discussioncomment-6069601](https://github.com/microsoft/WSL/discussions/7742#discussioncomment-6069601).

Il peut arriver, sur votre ordinateur Windows 11, que le dossier ne s'ouvre pas et que vous obteniez l'erreur : *\\wsl.localhost is not accessible. You might not have permission to use this network resource. Contact the administrator of this server to find out if you have access permissions.*

![wsl.localhost n'est pas accessible](./images/wsl_localhost_not_accessible.webp)

**Ce n'est pas un problème de permissions**, mais quelque chose à modifier dans votre registre Windows.

Sous Windows, cliquez sur `Start - Run` et lancez `regedit`, l'éditeur du registre Windows.

Recherchez la clé `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\NetworkProvider\Order`, éditez la clé `ProviderOrder` et ajoutez la valeur `P9NP` à la liste. Faites de même pour `HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\NetworkProvider\HwOrder`.

Une fois terminé, redémarrez votre ordinateur.

![Édition du registre](./images/registry.webp)

<AlertBox variant="note" title="Toujours rien ?">
Retirez `cbfsconnect2017` de la liste et réessayez.
</AlertBox>
