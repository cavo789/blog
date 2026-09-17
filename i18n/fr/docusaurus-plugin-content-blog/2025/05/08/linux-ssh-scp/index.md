---
slug: linux-ssh-scp
title: SSH - Lancer un terminal sur votre session sans avoir à vous authentifier
date: 2025-05-08
description: Arrêtez de taper votre mot de passe SSH ! Apprenez à utiliser les clés SSH et `ssh-copy-id` pour lancer instantanément une session terminal Linux sans avoir à vous authentifier chaque fois.
authors: [christophe]
image: /img/v2/ssh.webp
series: SSH - From your first key to remote development
mainTag: ssh
tags:
  - linux
  - ssh
  - winscp
language: fr
blueskyRecordKey: 3lun2x6tugs2r
updates:
  - date: 2025-05-08
    note: Adding the config file chapter
---
<!-- markdownlint-disable MD012 -->
![SSH - Lancer un terminal sur votre session sans avoir à vous authentifier](/img/v2/ssh.webp)

<TLDR>
Ce guide explique comment mettre en place une connexion SSH sans mot de passe vers vos serveurs Linux. Vous allez apprendre à générer une paire de clés SSH, à utiliser `ssh-copy-id` pour transférer votre clé publique vers le serveur de façon sécurisée, et à vous connecter sans mot de passe. Le tutoriel aborde aussi `scp` pour les transferts de fichiers sécurisés et montre comment créer des raccourcis pratiques pour vos connexions grâce à un fichier `~/.ssh/config`, ce qui permet de se connecter avec un simple alias.
</TLDR>

<!-- cspell:ignore randomart -->

Imaginez que vous devez régulièrement vous connecter à votre serveur Linux : vous devez lancer un outil comme Putty, saisir votre login, votre mot de passe, etc. et effectuer plusieurs opérations avant d'accéder au terminal.

Si votre mot de passe n'est pas enregistré dans la configuration de Putty, vous devrez lancer un autre outil comme un coffre-fort de mots de passe ; bref, c'est pénible.

Dans cet article, nous allons voir comment s'authentifier une fois pour toutes sur le serveur à l'aide d'une clé SSH.

*Deux articles qui prolongent celui-ci : <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link>, appliqué à un vrai compte d'hébergement, et <Link to="/blog/ssh-with-fuzzy-finder">Master your ssh command and select the host from a list</Link> quand votre `~/.ssh/config` contient une dizaine d'alias.*

<!-- truncate -->

<AlertBox variant="info">
Pour illustrer cet article, partons du principe que `christophe` est le nom d'utilisateur distant (c'est le nom d'utilisateur sur le serveur, différent de votre nom d'utilisateur local) et que `my_blog.be` est l'adresse du serveur distant.

Pensez à remplacer ces deux constantes par les vôtres ;-)

</AlertBox>

## TLDR {#tldr}

Créez une clé SSH, copiez-la sur le serveur distant et lancez une connexion SSH. Les étapes 1 et 2 ne se font qu'une seule fois.

<StepsCard
  title="Les étapes à lancer dans votre console :"
  variant="steps"
  steps={[
    '`ssh-keygen -t ed25519 -C "christophe@my_blog.be" -f ~/.ssh/id_ed25519_my_blog`',
    '`ssh-copy-id -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be`',
    '`ssh -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be`'
  ]}
/>

## En détail {#in-depth}

### 1. Créer la clé SSH {#1-creating-the-ssh-key}

La première chose à faire, une seule fois, est de générer une clé SSH sur votre host pour le serveur distant.

En lançant `ssh-keygen -t ed25519 -C "christophe@my_blog.be" -f ~/.ssh/id_ed25519_my_blog` (ou `ssh-keygen -t rsa -C "christophe@my_blog.be" -b 4096 -f ~/.ssh/id_rsa_my_blog` pour l'algorithme RSA) :

1. Vous allez créer une clé SSH pour l'utilisateur distant `christophe` sur le serveur `my_blog.be`. Vous obtiendrez une clé privée et une clé publique,
2. La clé sera enregistrée sur votre machine et le nom de fichier sera `~/.ssh/id_ed25519_my_blog` pour la clé privée (et `~/.ssh/id_ed25519_my_blog.pub` pour la publique),
3. La clé sera basée sur l'algorithme ed25519.

### 2. Copier la clé {#2-copying-the-key}

Ceci fait, vous devez copier la clé SSH publique sur votre serveur distant. Pour cela, lancez `ssh-copy-id -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be`. Cela ne doit être fait qu'une seule fois.

1. Vous allez copier votre clé publique SSH locale `id_ed25519_my_blog` sur le serveur `my_blog.be`,
2. La clé sera ajoutée pour l'utilisateur distant `christophe`,
3. Vous devrez fournir le mot de passe de cet utilisateur lorsqu'il sera demandé.

<AlertBox variant="info">
La commande `ssh-copy-id` ajoutera votre clé publique à la fin du fichier `~/.ssh/authorized_keys` sur le serveur.

</AlertBox>

### 3. Se connecter au serveur {#3-connect-to-the-server}

Maintenant, tout est en place : vous pouvez lancer `ssh -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be` et cela devrait fonctionner puisque la clé publique `id_ed25519_my_blog` a déjà été copiée sur le serveur `my_blog.be` pour l'utilisateur `christophe`.

<AlertBox variant="info">
Vous pouvez afficher ou éditer le contenu du fichier `~/.ssh/authorized_keys` en lançant `cat ~/.ssh/authorized_keys` (ou `vi ~/.ssh/authorized_keys`). Vous pourrez ainsi supprimer d'anciennes clés autorisées, par exemple.

</AlertBox>

## Copier des fichiers de votre host vers le serveur {#copying-files-from-your-host-to-the-server}

Maintenant que nous pouvons nous connecter au serveur si facilement, nous pouvons par exemple copier des fichiers depuis notre host comme ceci :

<Terminal typewriter>
$ scp -i ~/.ssh/id_ed25519_my_blog local_file christophe@my_blog.be:/remote_file
</Terminal>

Il faut d'abord indiquer notre fichier (ou dossier) local puis où le copier.

## Copier des fichiers du serveur vers votre host {#copy-files-from-the-server-to-your-host}

Maintenant, dans l'autre sens, du serveur vers votre host :

<Terminal typewriter>
$ scp -i ~/.ssh/id_ed25519_my_blog christophe@my_blog.be:/remote_file local_file
</Terminal>

## Copier des dossiers {#copying-folders}

Si vous devez copier un dossier, ajoutez simplement le flag récursif, c'est-à-dire `-r`.

Par exemple, `scp -r christophe@my_blog.be:~/backup/ .` va copier tout le dossier `~/backup` du serveur dans mon dossier local courant. Vraiment pratique.

## Astuces {#tips}

### Lancer ssh depuis Microsoft Terminal {#running-ssh-from-microsoft-terminal}

L'expérience SSH est bien, bien meilleure avec Microsoft Terminal qu'avec la vieille application Putty.

Avec Microsoft Terminal, vous pouvez travailler en plein écran, avoir une jolie image de fond, utiliser une bien meilleure police (celle de Putty par défaut est affreuse), utiliser des onglets, ...

Si vous avez déjà utilisé Putty, vous voyez ce que je veux dire.

### Utiliser le fichier config {#using-the-config-file}

Comme nous l'avons vu, avec la commande `ssh` ou `scp`, nous devons préciser le nom d'utilisateur, le nom ou l'adresse IP du serveur et le nom du fichier contenant la clé privée. Ça fait beaucoup d'informations à fournir, non ?

En plus, comme moi, je n'arrive pas à retenir toutes ces informations. Je veux juste me connecter à mon serveur d'applications, c'est tout !

Ce serait bien de pouvoir faire ssh my_application et basta. Non ? C'est justement le but du fichier `~/.ssh/config` !

Pour me connecter à ce serveur, ma commande ssh ressemble à ceci : `ssh christophe@my_blog.be -i ~/.ssh/id_ed25519_my_blog`. Pas facile à retenir !

Créons un fichier `~/.ssh/config`. Si le fichier existe déjà, éditez-le : `code ~/.ssh/config`.

Ajoutez ces lignes dans le fichier :

<Snippet filename="~/.ssh/config" source="./files/config" />

Enregistrez le fichier et retournez dans la console.

Maintenant, il suffit de lancer `ssh my_app` pour établir la connexion. Plutôt simple, non ?

Vous voulez en savoir plus ? Poursuivez votre lecture ici [https://linuxize.com/post/using-the-ssh-config-file/](https://linuxize.com/post/using-the-ssh-config-file/)

## Pour aller plus loin {#going-further}

Une fois que votre fichier `~/.ssh/config` commence à se remplir d'alias, deux articles complémentaires valent le coup d'œil : <Link to="/blog/zsh-plugin-ssh-config-suggestions">SSH - Autosuggestions with ZSH</Link>, pour ne plus jamais devoir retenir un alias, et <Link to="/blog/linux-sftp-cli">Utiliser sftp en ligne de commande</Link> si vous avez besoin du pendant sftp de `scp`.
