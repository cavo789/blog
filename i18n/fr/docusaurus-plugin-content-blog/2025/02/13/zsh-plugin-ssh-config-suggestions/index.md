---
slug: zsh-plugin-ssh-config-suggestions
title: SSH - Autosuggestions avec ZSH
date: 2025-02-13
description: Obtenez des autosuggestions SSH instantanées dans ZSH. Apprenez à installer le plugin zsh-ssh-config-suggestions et à afficher tous les alias de votre ~/.ssh/config avec un simple appui sur TAB.
authors: [christophe]
image: /img/v2/ssh.webp
series: SSH - From your first key to remote development
mainTag: ssh
tags:
  - customization
  - linux
  - ssh
  - wsl
  - zsh
language: fr
updates:
  - date: 2026-02-04
    note: updated plugins array; show only installed plugins
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
blueskyRecordKey: 3lwgca4zqh22i
---
![SSH - Autosuggestions avec ZSH](/img/v2/ssh.webp)

<TLDR>
Arrêtez de mémoriser les IP de serveurs et les commandes SSH. Cet article vous montre comment fluidifier votre workflow SSH avec `zsh-ssh-config-suggestions`, un plugin ZSH qui fournit des autosuggestions pour vos connexions SSH. En s'appuyant sur votre fichier `~/.ssh/config`, ce plugin vous permet de simplement taper `ssh ` et d'appuyer sur Tab pour voir la liste de tous les alias de serveurs configurés. Découvrez comment installer et configurer ce plugin bien pratique pour vous connecter à vos serveurs plus vite et plus efficacement.
</TLDR>

Il y a quelques semaines, j'ai publié un article <Link to="/blog/linux-ssh-scp#using-the-config-file">SSH - Launch a terminal on your session without having to authenticate yourself</Link> à propos de la commande `ssh` sous Linux.

Je suis presque sûr que, comme moi, vous êtes fatigué de taper des lignes de commande comme `ssh christophe@1.2.3.4` pour démarrer une connexion SSH parce que... vous savez, vous n'avez pas besoin de vous connecter sur un serveur ; non, vous avez besoin de vous connecter au serveur où tourne l'application ; vous connaissez le nom de l'application *MyAmazingApp* mais certainement pas le nom du serveur ni son IP.

C'est mon cas en tout cas.

Du coup, je dois me connecter à mon coffre-fort, dans lequel je liste toutes les informations sur les applications, les noms de serveurs, les identifiants à utiliser, ...

Ce serait plutôt cool de lancer `ssh MyAmazingApp` non ?

*Deux articles voisins : <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link> pour remplir ce `~/.ssh/config` au départ, et <Link to="/blog/ssh-with-fuzzy-finder">Master your ssh command and select the host from a list</Link> quand l'autocomplétion ne suffit plus — passé la cinquantaine d'hosts, une liste filtrable vaut mieux que <kbd>TAB</kbd>.*

<!-- truncate -->

Voici le résultat : tapez `ssh ` (avec l'espace à la fin) et appuyez sur <kbd>TAB</kbd> pour obtenir tous les alias de votre fichier `~/.ssh/config`, en autosuggestion.

![Utilisation de ssh-config-suggestions](./images/zsh-plugin-ssh-config-suggestions.gif)

<AlertBox variant="highlyImportant" title="Vous devez ajouter un espace après `ssh`">
Pour que ça fonctionne, notez bien ceci : vous devez ajouter un espace après avoir tapé `ssh` et avant d'appuyer sur <kbd>tab</kbd>.
</AlertBox>

## Pourquoi ça fonctionne {#why-it-works}

Le plugin lit les alias `Host` déjà déclarés dans votre fichier `~/.ssh/config` et les branche sur le système de complétion de ZSH — aucune liste séparée à maintenir, aucun coffre-fort à ouvrir, juste le fichier de configuration que vous avez déjà.

Ce serait vraiment sympa de pouvoir lancer `ssh MyAmazingApp` et hop, je suis connecté sur le serveur.

C'est là que le `~/.ssh/config` est si utile (référez-vous à cet <Link to="/blog/linux-ssh-scp#using-the-config-file">article</Link>) mais on peut aller un cran plus loin : ce serait génial de taper `ssh` et, par magie, que Linux vous montre la liste des alias définis dans le fichier `~/.ssh/config`. Installons ça.

## Le voir en action avec Docker {#seeing-it-in-action-with-docker}

Aucun serveur réel n'est jamais contacté par ce plugin — il lit uniquement les alias `Host` d'un fichier
de configuration — ce qui en fait un test Docker en une commande parfaitement sûr.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe Oh-My-Zsh et le plugin, l'active dans `~/.zshrc`, et écrit le
`~/.ssh/config` exact montré plus bas. Rien ne change sur votre propre machine, et rien n'essaie
de se connecter réellement où que ce soit.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez-le et lancez-le :

<Terminal title="user@machine: ~/ssh-suggest-demo">
$ docker build -t ssh-suggest-demo .
[+] Building 20.7s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it ssh-suggest-demo
🐳 root ~ # ssh
</Terminal>

Tapez `ssh ` (avec l'espace à la fin) et appuyez sur <kbd>TAB</kbd> — les mêmes quatre alias de la
section « Utilisez-le » ci-dessous (`MyAmazingApp_PROD`, `MyAmazingApp_TEST`, `YourAmazingApp`,
`LegacyApp`) apparaissent immédiatement, lus directement depuis le `~/.ssh/config` préparé dans l'image.

## Installation du plugin zsh-ssh-config-suggestions {#installation-of-the-zsh-ssh-config-suggestions-plugin}

On suppose ici qu'Oh-My-Zsh est déjà installé (voir <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> si ce n'est pas le cas). Clonez simplement le repository officiel en lançant cette commande : `git clone https://github.com/yngc0der/zsh-ssh-config-suggestions.git ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-ssh-config-suggestions`. Vous obtiendrez une copie locale du plugin dans votre dossier de plugins `Oh-my-zsh`.

Éditez ensuite le fichier `~/.zshrc`, cherchez `plugins=(` et ajoutez `zsh-ssh-config-suggestions` à la liste. Vous aurez par exemple quelque chose comme ceci :

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Fermez votre console, ouvrez-en une nouvelle (ou lancez `source ~/.zshrc` pour charger votre modification) et c'est terminé.

## Utilisez-le {#use-it}

Imaginez que j'aie ce contenu dans mon `~/.ssh/config` :

<Snippet filename="~/.ssh/config" source="./files/config" />

Maintenant, je n'ai vraiment plus besoin de me souvenir de quoi que ce soit et je n'ai même plus besoin de connaître le nom des alias !

Je dois juste taper (c'est important) : <kbd>ssh </kbd> suivi de <kbd>TAB</kbd> et j'obtiens les mêmes suggestions que celles déjà montrées en haut de cet article.

Comme vous pouvez le voir, le système affiche la liste des hosts définis dans mon fichier de configuration ! Je peux alors éditer le fichier, ajouter une nouvelle application et hop, la prochaine fois, j'aurai son nom dans la liste. Je n'ai plus besoin de me connecter à mon coffre-fort. Sympa non ?

Ce n'est qu'un plugin parmi beaucoup d'autres ; si votre `~/.zshrc` commence à grossir avec ce genre de personnalisations, jetez un œil à <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link> pour le garder maintenable.
