---
slug: linux-sftp-cli
title: Utiliser sftp en ligne de commande, avec ou sans proxy
date: 2024-11-05
description: Connectez-vous à des serveurs SFTP depuis la ligne de commande Linux. Astuces pour automatiser avec sshpass, définir un port personnalisé et configurer l'accès via un serveur proxy.
authors: [christophe]
image: /img/v2/sftp.webp
series: SSH - From your first key to remote development
mainTag: ssh
tags:
  - linux
  - ssh
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore sshpass,ssword -->

![Utiliser sftp en ligne de commande, avec ou sans proxy](/img/v2/sftp.webp)

<TLDR>
Cet article couvre la ligne de commande `sftp` : se connecter avec `sftp user@host`, automatiser l'authentification avec `sshpass`, faire passer la connexion par un proxy HTTP via `-o ProxyCommand='/usr/bin/nc --proxy-type http --proxy ...'`, utiliser un port personnalisé avec `-P`, et scripter des commandes distantes (comme télécharger tous les fichiers `.zip`) avec un here-document passé à `sftp`.
</TLDR>

Après mon article <Link to="/blog/linux-ssh-scp">SSH - Launch a terminal on your session without having to authenticate yourself</Link>, c'était évident : à côté des commandes `ssh` et `scp`, j'avais oublié `sftp`.

Dans cet article, nous allons voir comment ouvrir une connexion SFTP vers un serveur distant, depuis la ligne de commande.

Dans la deuxième partie, nous verrons aussi comment configurer la connexion sftp pour passer par un serveur proxy.

*Pour les mêmes opérations depuis un client graphique sous Windows, voyez <Link to="/blog/winscp-synchronize-both">WinSCP - Synchronize host and remote</Link> et <Link to="/blog/winscp-download-recursively-files">WinSCP - Download files with specific extension recursively</Link>.*

<!-- truncate -->

## Comment ouvrir une connexion sftp {#how-to-run-an-sftp-connection}

Le plus simple est `sftp <username>@<hostname_or_ip>` donc, si vous devez vous connecter au serveur ayant l'IP `1.2.3.4` avec l'utilisateur `christophe`, la commande à lancer est simplement `sftp christophe@1.2.3.4`.

On vous demandera votre mot de passe avant de vous connecter au serveur.

Si vous avez besoin d'automatiser, vous pouvez installer `sshpass` avec `sudo apt-get update && sudo apt-get install sshpass`.

<AlertBox variant="note">
L'utilitaire Linux sshpass est utilisé par le script pour permettre une connexion SFTP sans devoir manipuler le mot de passe en clair. [Plus d'infos](https://www.redhat.com/sysadmin/ssh-automation-sshpass)

</AlertBox>

Imaginons que votre utilisateur soit `christophe`, votre mot de passe `p@ssword` et l'IP du serveur `1.2.3.4`, vous pouvez alors vous connecter ainsi : `SSHPASS="p@ssword" sshpass -e sftp christophe@1.2.3.4`.

Ci-dessus, nous créons une variable système temporaire appelée `SSHPASS` contenant notre mot de passe en clair, puis nous lançons `sshpass -e` suivi de notre commande sftp, donc `sftp <username>@<hostname_or_ip>`.

## Utiliser un serveur proxy {#using-a-proxy-server}

Passer par un proxy n'est pas si intuitif. Le flag à utiliser est `-o ProxyCommand=''` avec une commande spécifique. La commande est `/usr/bin/nc --proxy-type http --proxy PROXY:PORT %h %p` où :

- `proxy-type` doit être initialisé à `http` ou `https` selon votre proxy.
- `--proxy` doit être défini avec le nom de domaine du proxy (p.ex. `my.proxy.be`) et éventuellement suivi de `:8080`, c'est-à-dire le port à utiliser
- ensuite `%h %p` doit faire partie de la commande
  - `%h` est un placeholder qui sera remplacé par le nom d'hôte du serveur SFTP auquel vous tentez de vous connecter.
  - `%p` est un autre placeholder qui sera remplacé par le numéro de port du serveur SFTP.

La commande finale ressemblera à ceci :

<Terminal typewriter>
$ sftp -o ProxyCommand='/usr/bin/nc --proxy-type http --proxy my.proxy.be:8080 %h %p' christophe@1.2.3.4
</Terminal>

Et, si vous voulez utiliser `sshpass` :

<Terminal typewriter>
$ {`SSHPASS="p@ssword" sshpass -e sftp -o ProxyCommand='/usr/bin/nc --proxy-type http --proxy my.proxy.be:8080 %h %p' christophe@1.2.3.4`}
</Terminal>

## Définir le numéro de port du serveur SFTP {#setting-the-port-number-to-use-for-the-sftp-server}

Si votre serveur SFTP n'écoute pas sur le port `22`, vous devrez préciser le numéro de port avec le flag `-P` : `sftp <username>@<hostname_or_ip> -P <port_number>`.

## Lancer des commandes sur le serveur SFTP puis quitter {#running-commands-on-the-sftp-server-then-exit}

Imaginez que vous souhaitiez récupérer des fichiers ZIP depuis votre serveur SFTP.

Comme déjà vu, avec `sshpass` nous pouvons contourner l'authentification. Il suffit de s'assurer qu'une variable `SSHPASS` existe juste avant d'appeler la commande `sshpass`.

Ensuite, pour pouvoir automatiser des commandes sur le serveur SFTP, nous pouvons utiliser la syntaxe *here-document*.

L'allure générale sera celle-ci :

```bash
(
    SSHPASS="<your_password_in_plain_text>"
    sshpass -e sftp <username>@<hostname_or_ip> << !
        <a_list_of_commands>
!
)
```

Donc, si votre utilisateur est `christophe`, votre mot de passe `p@ssword` et l'IP du serveur `1.2.3.4`, nous pouvons nous connecter au serveur et, par exemple, aller dans un dossier appelé `input_folder`, afficher la liste des fichiers / dossiers et, enfin, télécharger tous les fichiers zip présents dans le dossier :

```bash
(
    SSHPASS="p@ssword"
    sshpass -e sftp christophe@1.2.3.4 << !
        cd input_folder
        ls -alh
        get *.zip
!
)
```
