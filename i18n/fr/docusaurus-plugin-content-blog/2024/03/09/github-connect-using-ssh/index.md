---
slug: github-connect-using-ssh
title: GitHub - Connectez votre compte en SSH et travaillez avec le protocole git@
date: 2024-03-09
description: Sécurisez votre connexion GitHub ! Suivez ce guide pas à pas pour configurer vos clés SSH et utiliser le protocole git@ pour des opérations Git plus sûres et plus rapides.
authors: [christophe]
image: /img/v2/github_tips.webp
series: SSH - From your first key to remote development
mainTag: github
tags:
  - github
  - ssh
language: fr
updates:
  - date: 2026-02-04
    note: remove /root in paths; replaced by ~ for the current user
---
![GitHub - Connectez votre compte en SSH et travaillez avec le protocole git@](/img/v2/github_tips.webp)

<TLDR>
Cet article explique pourquoi se connecter à GitHub en SSH est plus sûr qu'en HTTPS, puis détaille la mise en place : générer une paire de clés ed25519 avec `ssh-keygen`, l'ajouter à l'agent SSH et coller la clé publique dans les paramètres SSH de GitHub. Il se termine par une commande `ssh -T git@github.com` pour vérifier que la connexion fonctionne, afin que vous puissiez utiliser le protocole `git@` avec `git clone`.
</TLDR>

Utiliser SSH plutôt que HTTPS pour se connecter à GitHub est plus sûr. En effet, SSH repose sur la cryptographie à clé publique. Cela rend un accès non autorisé beaucoup plus difficile qu'avec un mot de passe, qui peut être volé par phishing ou par force brute. De plus, HTTPS transmet votre nom d'utilisateur et votre mot de passe (chiffrés) sur le réseau, ce qui peut être intercepté lors d'une attaque de type Man-in-the-Middle (MITM). SSH, lui, ne transmet aucun mot de passe une fois la configuration initiale faite.

Voyons comment ajouter une clé SSH et, dès maintenant, pouvoir travailler avec GitHub via le protocole `git@` avec `git clone`.

<!-- truncate -->

Ajouter une clé SSH sur votre ordinateur et l'utiliser pour vous connecter à GitHub est assez simple.

D'abord, lancez la commande ci-dessous sur votre machine. Remplacez `your_email@example.com` par l'adresse e-mail liée à votre compte GitHub existant.

<Terminal typewriter>
$ ssh-keygen -t ed25519 -C "your_email@example.com"
</Terminal>

On vous demandera de saisir une *passphrase* ; ce n'est pas obligatoire, appuyez simplement sur <kbd>Enter</kbd>.

Vous verrez alors quelque chose comme ceci dans votre console :

<Terminal typewriter source="./files/terminal-1.txt" />

Ensuite, il faut ajouter la clé à votre agent SSH. Lancez simplement :

<Terminal typewriter>
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519
</Terminal>

Enfin, ajoutez la clé à GitHub en vous rendant sur [https://github.com/settings/ssh/new](https://github.com/settings/ssh/new).

![GitHub - Add SSH key](./images/ssh_add_key.webp)

Donnez un titre clair, par exemple `Home computer`.

Dans la zone de texte `Key`, vous devez coller votre clé **publique**.

Regardez ce qui s'est affiché à l'écran juste avant, lors de l'exécution de la commande `ssh-keygen`. Le chemin de la clé publique y était indiqué ; par exemple, `Your public key has been saved in ~/.ssh/id_ed25519.pub`.

Lancez donc `cat ~/.ssh/id_ed25519.pub` dans votre console Linux et vous obtiendrez la valeur de la clé. Copiez/collez cette ligne dans la page de paramètres GitHub puis cliquez sur le bouton `Add SSH key`.

Enfin, si vous voulez tester que la connexion est bien établie, lancez `ssh -T git@github.com`. Vous devriez obtenir `Hi cavo789! You've successfully authenticated, but GitHub does not provide shell access.` (avec votre propre pseudo, bien sûr).

Deux suites possibles : si vous avez déjà des repositories clonés en HTTPS, <Link to="/blog/git-config">Git - Some tips for your .gitconfig file</Link> montre un réglage en une ligne pour forcer SSH globalement sans rien re-cloner ; et le même mécanisme de clé fonctionne pour votre serveur d'hébergement, voir <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link>.
