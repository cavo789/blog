---
slug: winscp-synchronize-both
title: WinSCP - Synchroniser l'host et le serveur distant
date: 2024-05-17
description: Utilisez un script avec WinSCP pour synchroniser facilement des fichiers entre votre machine locale et un serveur FTP/SFTP distant. Découvrez les commandes pour une synchronisation locale, distante ou bidirectionnelle.
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - self-hosted
  - windows
  - winscp
language: fr
review_date: 2026-07-30
---
![WinSCP - Synchroniser l'host et le serveur distant](/img/v2/winscp.webp)

<TLDR>
Cet article partage un script WinSCP qui synchronise un dossier local avec un serveur FTP/SFTP distant (ou l'inverse) via la commande `synchronize`, lancée avec `winscp.com /script=...`. Il explique les options de direction `local`/`remote`/`both`, pratiques pour des sauvegardes automatisées comme la synchronisation d'un dossier vers un NAS Synology.
</TLDR>

Grâce à un script, il est possible de demander à [WinSCP](https://winscp.net/) de synchroniser votre machine locale et votre machine distante : si un fichier est plus récent en local, il est copié vers le serveur distant, et inversement.

Si un fichier a été ajouté en local, il est copié vers le serveur distant, et vice versa.

J'utilise ce genre de script pour faire une sauvegarde complète de certains de mes dossiers vers mon Synology. *Je l'ai aussi utilisé pendant des années pour déployer ce blog, avant de passer à <Link to="/blog/github-action">GitHub Actions</Link>.*

*Deux autres scripts WinSCP sur ce blog : <Link to="/blog/winscp-download-recursively-files">télécharger récursivement les fichiers ayant une extension précise</Link> et <Link to="/blog/keepass-overriding-url">ouvrir une session WinSCP directement depuis KeePass</Link>.*

<!-- truncate -->

## Le script {#the-script}

<Snippet filename="c:\temp\synchronize.txt" source="./files/synchronize.txt" />

## Comment l'utiliser {#how-to-use}

1. Enregistrez le script ci-dessus sous, par exemple, `c:\temp\synchronize.txt`
2. Éditez le script et précisez :
   1. si nécessaire, remplacez `ftp` par `sftp`
   2. `USERNAME` : le nom d'utilisateur FTP
   3. `PASSWORD` : le mot de passe associé à ce compte
   4. `HOST_OR_IP` : le nom d'host FTP ou son IP
   5. `PORT` : le port à utiliser (21 pour une connexion FTP par exemple)
   6. Le dossier local où vos fichiers sont stockés (ligne `lcd "C:\Christophe"`)
   7. Le dossier distant depuis lequel les fichiers doivent être copiés (ligne `cd /Christophe`), ça peut être la racine FTP ou n'importe quel sous-dossier
3. Ouvrez une session DOS
4. Lancez `cd \temp`
5. Lancez `winscp.com` depuis là : tapez `"c:\program files (x86)\WinSCP\WinSCP.com" /script="c:\temp\synchronize.txt"`

Si tout est correctement configuré, WinSCP ouvrira un terminal de session et démarrera la synchronisation.

## Plus d'infos {#more-info}

Plus d'infos sur le verbe Synchronize de WinSCP : [https://winscp.net/eng/docs/scriptcommand_synchronize](https://winscp.net/eng/docs/scriptcommand_synchronize).

- Si les fichiers/dossiers sont déjà présents, ne rien faire.
- S'il y a de nouveaux fichiers/dossiers, les copier.
- Si des fichiers/dossiers ne sont plus sur le disque local, les supprimer du serveur distant.

Le local est donc le maître.

### Local / Remote / Both {#local--remote--both}

Voyez la ligne `synchronize remote`.

Choisissez `remote`, `local` ou `both` :

- Quand le premier paramètre est `local`, les changements des répertoires distants sont appliqués aux répertoires locaux.
- Quand le premier paramètre est `remote`, les changements des répertoires locaux sont appliqués aux répertoires distants.
- Quand le premier paramètre est `both`, les répertoires locaux et distants peuvent tous les deux être modifiés ([source](https://winscp.net/eng/docs/scriptcommand_synchronize#remarks)).
