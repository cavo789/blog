---
slug: linux-eza
title: Revisitons la commande ls grâce à eza
date: 2024-07-23
description: "Fatigué de taper ls -alh ? Découvrez eza, le remplaçant moderne et complet de la commande ls de Linux. Apprenez à l'installer et à configurer un alias puissant pour une meilleure expérience en ligne de commande."
authors: [christophe]
image: /img/v2/linux_tips.webp
series: Modern CLI tools for your terminal
mainTag: customization
tags:
  - customization
  - linux
language: fr
updates:
  - date: 2026-02-04
    note: still accurate, no obsolete info
  - date: 2026-07-30
    note: Updated website link from the.eza.website (domain expired) to eza.rocks (current official site).
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
![Revisitons la commande ls grâce à eza](/img/v2/linux_tips.webp)

<TLDR>
Cet article présente `eza`, un remplaçant moderne de la commande `ls` (anciennement connu sous le nom d'`exa`), avec de meilleurs réglages par défaut, des icônes et un meilleur formatage. Il montre comment l'installer avec `apt-get` et configurer un alias avec une combinaison utile de flags (`--all --long --group --group-directories-first --icons --header --time-style long-iso`) pour que `ls` utilise automatiquement `eza` et affiche une liste de fichiers plus riche.
</TLDR>

Quelle commande CLI utilisez-vous le plus sous Linux ? Très probablement `ls`, pour afficher la liste des fichiers du répertoire courant.

<AlertBox variant="note" title="Je ne sais pas pour vous, mais j'utilise rarement `ls` sans paramètres. Presque sans y penser, j'ajoute `-alh` chaque fois. C'est devenu mécanique." />

Et là vous me direz : il suffit de créer un alias `alias ls="ls -alh"`. Bien sûr, mais allons plus loin : revisitons cette commande de base et ajoutons-lui quelques fonctionnalités.

<!-- truncate -->

`eza` est un remplaçant moderne de `ls`, comme annoncé sur leur site : [https://eza.rocks/](https://eza.rocks/).

*Il appartient à la même famille de « réécritures modernes des classiques » que <Link to="/blog/ripgrep">ripgrep</Link> (pour `grep`) et <Link to="/blog/git-delta">delta</Link> (pour `git diff`). Et tant que vous personnalisez votre console, <Link to="/blog/powerlevel10k_sandbox">Customize your Linux prompt with Powerlevel10k</Link> vaut aussi dix minutes de votre temps.*

<AlertBox variant="info" title="eza s'appelait d'abord exa">
[https://github.com/ogham/exa](https://github.com/ogham/exa) est abandonné ; voir [cette issue](https://github.com/ogham/exa/issues/1243).

**exa est devenu eza** : [https://eza.rocks/](https://eza.rocks/)

</AlertBox>

## Résultat {#result}

Une fois `ls` aliasé vers `eza` avec quelques flags, voici à quoi ressemble un simple `ls` :

![eza](./images/eza.webp)

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Avant de toucher à votre `~/.bashrc`, essayez l'alias dans un container jetable avec un petit dossier varié déjà prêt — un fichier caché, un ou deux sous-dossiers, des fichiers de tailles différentes — pour que le listing ait vraiment quelque chose à montrer.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe `eza`, met en place l'alias `ls` exact de cet article et construit un dossier de démo pour vous. Rien ne change sur votre propre machine.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez-le et lancez-le :

<Terminal title="user@machine: ~/eza-demo">
$ docker build -t eza-demo .
[+] Building 14.2s (7/7) FINISHED
 ✔ exporting to image

$ docker run --rm -it eza-demo
🐳 root ~/demo # ls
Permissions Size User Date Modified Name
drwxr-xr-x     - root 2026-08-22    docs
drwxr-xr-x     - root 2026-08-22    src
.rw-r--r--    0 root 2026-08-22    .env
.rw-r--r--    8 root 2026-08-22    README.md
</Terminal>

Voilà `ls` — en réalité `eza` sous le capot, grâce à l'alias intégré dans l'image. Icônes, dossiers regroupés en premier, dates lisibles : le même résultat que la capture ci-dessus, sans rien avoir installé sur votre propre machine.

## Installer eza {#install-eza}

L'installation est simple, il suffit de lancer `sudo apt-get update && sudo apt-get install eza` ; rien de plus.

À partir de là, lancez simplement `eza` en ligne de commande et vous obtiendrez la liste des fichiers avec tous les réglages par défaut.

Sur mon ordinateur, j'ai opté pour cette liste de paramètres : `--all --long --group --group-directories-first --icons --header --time-style long-iso` et, bien sûr, j'ai mis à jour mon fichier `~/.bashrc` en y ajoutant un alias (si vous êtes sous ZSH, <Link to="/blog/modular-zsh-workflow">donnez à cet alias son propre fichier</Link> plutôt que de faire grossir un `.zshrc` monolithique) :

<Terminal typewriter>
$ alias ls='eza --all --long --group --group-directories-first --icons --header --time-style long-iso'
</Terminal>

Et maintenant, en tapant simplement `ls`, vous obtiendrez le listing montré plus haut.
