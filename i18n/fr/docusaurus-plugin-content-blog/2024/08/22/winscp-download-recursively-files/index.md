---
slug: winscp-download-recursively-files
title: WinSCP - Télécharger récursivement les fichiers d'une extension donnée
date: 2024-08-22
description: Apprenez à utiliser la fonction de scripting de WinSCP pour télécharger récursivement les fichiers d'une extension spécifique (comme .php) depuis votre serveur FTP/SFTP. Avec un exemple de script simple.
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - ssh
  - winscp
language: fr
review_date: 2026-07-30
---
![WinSCP - Télécharger récursivement les fichiers d'une extension donnée](/img/v2/winscp.webp)

<TLDR>
Cet article partage un script d'automatisation WinSCP qui télécharge récursivement tous les fichiers correspondant à une extension donnée (par ex. `.php`) depuis un serveur FTP/SFTP distant vers un dossier local, lancé via `winscp.com /script=...` — pratique pour récupérer un type de fichier précis sur tout un site et l'analyser en local.
</TLDR>

Le client FTP [WinSCP](https://winscp.net/) prend en charge le scripting, comme on peut le lire sur [https://winscp.net/eng/docs/guide_automation](https://winscp.net/eng/docs/guide_automation).

Dans une vie antérieure, j'ai souvent eu besoin de télécharger un certain type de fichier : me connecter à un serveur FTP et récupérer les fichiers PHP en local pour les analyser.

*Tout télécharger juste pour y faire une recherche est parfois exagéré : <Link to="/blog/php-grep-searching-at-lightning-speed">Search your FTP server at lightning speed</Link> fait la recherche **sur** le serveur. Et une fois les fichiers en local, <Link to="/blog/php-jakzal-phpqa">jakzal/phpqa</Link> vous donne tous les outils d'analyse PHP sans rien installer.*

Comme WinSCP permet l'automatisation, il est facile d'écrire un petit script pour faire exactement ça.

À titre d'exemple, nous allons donc télécharger tous les fichiers `.php` d'un host.

<!-- truncate -->

## Le script {#the-script}

Le script est plutôt simple, si vous voulez bien me croire :

<Snippet filename="C:\temp\download.txt" source="./files/download.txt" />

## Comment l'utiliser {#how-to-use}

1. Sauvegardez le script ci-dessus sous, par exemple, `C:\temp\download.txt`
2. Éditez le script et apportez ces modifications :
   1. L'endroit où les fichiers doivent être téléchargés, le dossier local (ligne `lcd "c:\temp"`)
   2. Si besoin, remplacez `ftp` par `sftp`
   3. `USERNAME` : le nom d'utilisateur FTP
   4. `PASSWORD` : le mot de passe associé à ce compte
   5. `HOST_OR_IP` : le nom d'host FTP ou son IP
   6. Le dossier distant depuis lequel les fichiers doivent être téléchargés (ligne `cd /public_html`)
   7. L'extension de fichier à télécharger (si ce n'est pas `.php`) (ligne `get -filemask:*.php *`)
   8. Sauvegardez le script
3. Ouvrez une session DOS
4. Lancez `cd c:\temp`
5. Lancez `winscp.com` depuis là : tapez `"C:\Program Files (x86)\WinSCP\WinSCP.com" /script="c:\temp\download.txt"`

Si tout est correctement configuré, WinSCP ouvrira une session terminal et commencera à télécharger chaque fichier `.php` trouvé dans votre dossier distant (sous-dossiers inclus).
