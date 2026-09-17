---
slug: zsh-syntax-highlighting
title: La coloration syntaxique dans la console avec ZSH
date: 2024-03-29
description: Améliorez votre console Zsh avec la coloration syntaxique ! Les commandes passent au vert (valides) ou au rouge (invalides) pendant que vous tapez. Guide d'installation rapide pour zsh-syntax-highlighting.
authors: [christophe]
image: /img/v2/zsh.webp
series: Customize your shell with ZSH
mainTag: zsh
tags:
  - customization
  - linux
  - wsl
  - zsh
language: fr
updates:
  - date: 2026-02-04
    note: updated plugins array; show only installed plugins
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
![La coloration syntaxique dans la console avec ZSH](/img/v2/zsh.webp)

<TLDR>
Cet article présente `zsh-syntax-highlighting`, un plugin Zsh qui colore les commandes dans votre terminal pendant que vous tapez : vert pour les commandes valides et exécutables, rouge pour les fautes de frappe ou les commandes inconnues. Il détaille le clonage du plugin dans le dossier des plugins personnalisés d'Oh My Zsh et son ajout à la liste `plugins=(...)` de `~/.zshrc`, sans aucune autre configuration pour commencer à l'utiliser.
</TLDR>

[zsh-syntax-highlighting](https://github.com/zsh-users/zsh-syntax-highlighting/) est une autre perle pour ZSH — à condition d'avoir déjà installé Oh-My-Zsh (voir <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> si ce n'est pas le cas).

Pendant que vous tapez, les couleurs vous diront par exemple que quelque chose ne va pas.

Si vous tapez `head` suivi d'un espace, ZSH affichera ce mot en vert : cette commande existe et elle est valide. Si vous tapez `heat`, le mot apparaîtra en rouge : cette commande n'existe pas.

Ça paraît simple, mais c'est tellement pratique.

<!-- truncate -->

## À quoi ressemble la coloration syntaxique {#what-syntax-highlighting-looks-like}

Tapez une commande comme `cat` ou `head` et elle passe au vert : la commande existe, elle est correctement écrite et elle est exécutable.

![Highlight in green](./images/head.webp)

Faites une faute de frappe et le même mot passe au rouge avant même d'appuyer sur <kbd>ENTER</kbd> :

![Highlight in red](./images/docker_compose.webp)

Cette couleur apparaît **pendant que vous tapez**, pas après l'échec de la commande. Vous savez que vous avez mal écrit `docekr` avant de perdre une seconde avec un `command not found`. <!-- typos:disable-line -->

## Comment l'utiliser {#how-to-use-it}

En réalité, il n'y a rien à faire : pas de fichier de configuration, aucune option à régler, aucun alias à définir. Installez le plugin, rechargez votre shell, et la coloration est là dès le prochain caractère tapé.

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Pas d'historique à alimenter, pas de config à écrire — ce plugin n'a besoin de rien d'autre que
lui-même, ce qui en fait un test Docker parfait en une seule commande.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe Oh-My-Zsh et le plugin, puis l'active dans `~/.zshrc` — exactement
les deux étapes de la section « Installation », faites pour vous. Rien ne change sur votre machine.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez et lancez-le :

<Terminal title="user@machine: ~/syntax-demo">
$ docker build -t syntax-demo .
[+] Building 18.4s (7/7) FINISHED
 ✔ exporting to image

$ docker run --rm -it syntax-demo
🐳 root ~ # head
</Terminal>

Tapez `head` et le mot passe au vert dès que vous finissez de l'écrire — la commande existe. Effacez-le,
tapez `heat` ou `docekr` à la place, et il passe au rouge avant même d'appuyer sur <kbd>ENTER</kbd> : la même <!-- typos:disable-line -->
scène que sur les deux captures ci-dessus, en direct dans votre propre terminal.

## Installation {#installation}

Il suffit de cloner le repository officiel comme ceci :

<Terminal typewriter>
$ {`git clone https://github.com/zsh-users/zsh-syntax-highlighting \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting`}
</Terminal>

Éditez ensuite le fichier `~/.zshrc`, cherchez `plugins=(` et ajoutez `zsh-syntax-highlighting` à la liste. Vous aurez par exemple quelque chose comme ceci :

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Fermez votre console, ouvrez-en une nouvelle (ou lancez `source ~/.zshrc` pour charger votre modification) et c'est terminé.

## Conclusion {#conclusion}

Deux lignes de configuration et votre terminal se met à vous relire : le vert veut dire « ça va tourner », le rouge « corrige-moi d'abord ». C'est le genre de petite boucle de feedback qu'on ne remarque plus après une semaine — jusqu'au jour où vous vous asseyez devant une machine qui n'en a pas et où vous tapez à l'aveugle.

Son compagnon naturel est <Link to="/blog/zsh-plugin-autosuggestions">Autosuggestions in the console using ZSH</Link> : celui-ci vous dit si ce que vous tapez est valide, l'autre vous évite de le taper tout court.
