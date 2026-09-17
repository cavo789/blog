---
slug: keepass-overriding-url
title: KeePass - Remplacer le champ URL
date: 2023-11-02
description: Découvrez comment détourner le champ URL de KeePass pour lancer des programmes comme PuTTY, WinSCP ou une connexion Bureau à distance (RDP) directement depuis vos entrées.
authors: [christophe]
image: /img/v2/keepass.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - windows
  - winscp
language: fr
review_date: 2026-07-30
---
![KeePass - Remplacer le champ URL](/img/v2/keepass.webp)

<TLDR>
Cet article montre comment détourner le champ `URL` de KeePass pour lancer des programmes externes au lieu d'un navigateur web, à l'aide du préfixe `cmd://` et des placeholders d'entrée : démarrer PuTTY avec les identifiants enregistrés, ouvrir WinSCP directement sur un chemin SFTP ou lancer une connexion Bureau à distance Windows (`mstsc.exe`) vers un host enregistré.
</TLDR>

Le champ `url` peut aussi servir à démarrer un programme et donc ne pas contenir uniquement une URL valide.

La documentation officielle se trouve ici : [https://keepass.info/help/base/autourl.html](https://keepass.info/help/base/autourl.html).

<!-- truncate -->

## Démarrer PuTTY depuis KeePass {#start-putty-from-keepass}

Si PuTTY n'est pas installé sur votre machine, téléchargez-le depuis [https://www.putty.org/](https://www.putty.org/). Vous n'avez besoin que du fichier `putty.exe`. *Si PuTTY refuse votre session enregistrée avec une erreur d'authentification, voyez <Link to="/blog/putty-no-supported-authentication-methods">Fatal error was starting Putty after having saved settings</Link>.*

Téléchargez-le et enregistrez `putty.exe` dans un répertoire présent dans votre PATH.

Pour cela, même si vous n'êtes pas administrateur de votre machine, démarrez simplement une console MS-DOS et lancez `echo %PATH%`. Vous verrez alors la liste des répertoires déjà présents et vous choisirez celui où vous pouvez copier un nouveau fichier. Copiez ensuite `putty.exe` dans ce dossier. Désormais, vous pouvez lancer `putty.exe` depuis n'importe où.

Mettez à jour votre entrée KeePass et donnez à la propriété `URL` l'instruction suivante : `cmd://putty.exe  -load "Default Settings" {S:host} -l {USERNAME} -pw {PASSWORD}`

<AlertBox variant="caution">
Assurez-vous d'avoir rempli la propriété avancée `host`.

</AlertBox>

## Démarrer WinSCP depuis KeePass {#start-winscp-from-keepass}

> [https://winscp.net/eng/docs/integration_keepass](https://winscp.net/eng/docs/integration_keepass)

Si vous souhaitez ouvrir WinSCP (voyez aussi <Link to="/blog/winscp-synchronize-both">WinSCP - Synchronize host and remote</Link>) et consulter des fichiers, vous pouvez y arriver en mettant à jour votre entrée KeePass et en donnant à la propriété `URL` l'instruction suivante : `cmd://"{ENV_PROGRAMFILES_X86}\WinSCP\WinSCP.exe" sftp://{USERNAME}:{PASSWORD}@{S:ip}:{T-REPLACE-RX:/{S:port}/-1//}{S:path}`

<AlertBox variant="caution">
Assurez-vous d'avoir rempli la propriété avancée `ip`. Vous pouvez aussi définir les propriétés `port` et `path` ; elles restent toutefois facultatives.

</AlertBox>

## Démarrer une connexion RDP/TS depuis KeePass {#start-an-rdpts-connection-from-keepass}

> [https://keepass.info/help/base/autourl.html](https://keepass.info/help/base/autourl.html)

Vous pouvez aussi démarrer une connexion Bureau à distance / terminal server depuis KeePass.

L'URL doit être définie comme ceci : `cmd://mstsc.exe /v:{S:host} /f`

<AlertBox variant="caution">
Assurez-vous d'avoir rempli la propriété avancée `host`.

</AlertBox>
