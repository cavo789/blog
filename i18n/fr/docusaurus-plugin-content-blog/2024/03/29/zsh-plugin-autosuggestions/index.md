---
slug: zsh-plugin-autosuggestions
title: Autosuggestions dans la console avec ZSH
date: 2024-03-29
description: Boostez l'efficacité de votre console ZSH. Installez facilement le plugin zsh-autosuggestions et obtenez des suggestions de commandes intelligentes tirées de votre historique pendant que vous tapez.
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
    note: added a Docker-first demo with a pre-seeded history to try before installing
---
![Autosuggestions dans la console avec ZSH](/img/v2/zsh.webp)

<TLDR>
Cet article présente `zsh-autosuggestions`, un plugin Zsh qui suggère des commandes issues de l'historique de votre shell pendant que vous tapez, affichées en gris et acceptables avec <kbd>TAB</kbd>. Il explique comment installer le plugin en le clonant dans le dossier des plugins personnalisés d'Oh My Zsh et comment l'activer dans `~/.zshrc`, puis montre comment accepter, faire défiler ou ignorer les suggestions avec <kbd>TAB</kbd> et les flèches.
</TLDR>

ZSH supporte les plugins, et l'une des merveilles s'appelle [zsh-autosuggestions](https://github.com/zsh-users/zsh-autosuggestions) — en supposant que vous avez déjà installé Oh-My-Zsh (voir <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> sinon).

Celui-là vous suggère des commandes pendant que vous tapez, sur base de votre historique et des complétions. Trois frappes, et la commande de quarante caractères que vous aviez péniblement assemblée le mois dernier est là, à attendre un <kbd>TAB</kbd>.

<!-- truncate -->

## Trois caractères, et la commande est déjà là {#three-characters-and-the-command-is-already-there}

Imaginez que vous ayez déjà tapé, aujourd'hui, hier ou il y a des semaines, la commande `docker compose up --detach`. Aujourd'hui, vous tapez `doc` et voici ce que votre console affiche :

![Plugin autosuggestions pour ZSH](./images/autosuggestions.webp)

La partie en gris, c'est la suggestion. Appuyez sur <kbd>TAB</kbd> et toute la ligne est à vous ; continuez à taper et la suggestion se met à jour à chaque caractère ; ignorez-la et il ne se passe rien.

Vous pouvez aussi jouer avec <kbd>UP</kbd> et <kbd>DOWN</kbd> pour passer aux autres commandes correspondant aux mêmes touches (*doc* dans mon exemple).

## Pourquoi ça marche {#why-it-works}

- Les suggestions viennent directement de votre HISTORY Linux : aucun index à construire, aucune configuration, rien à apprendre au plugin.
- Plus vous utilisez votre console, meilleures sont les suggestions — il apprend de vous et de vous seul.
- Fini le « Mince, c'était quoi déjà les paramètres que j'avais utilisés pour ... ».

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Vous n'avez pas besoin d'avoir déjà Oh-My-Zsh sur votre machine pour voir le plugin fonctionner — un
container jetable fait l'affaire.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe Oh-My-Zsh, clone le plugin, l'active dans `~/.zshrc` et — c'est
ça qui compte — pré-remplit un historique de shell contenant `docker compose up --detach`. Tapez `doc`
et vous obtenez exactement le scénario de la capture ci-dessus, sans rien avoir à configurer.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez et lancez :

<Terminal title="user@machine: ~/autosuggestions-demo">
$ docker build -t autosuggestions-demo .
[+] Building 19.8s (8/8) FINISHED
 ✔ exporting to image

$ docker run --rm -it autosuggestions-demo
🐳 root ~ #
</Terminal>

Tapez maintenant `doc` (n'appuyez pas encore sur <kbd>ENTER</kbd>) et la scène exacte de la capture en
haut de cet article se rejoue : `docker compose up --detach` apparaît en gris, comme un fantôme,
juste après votre curseur — lu directement depuis l'historique pré-rempli. Appuyez sur <kbd>TAB</kbd> pour
l'accepter, ou sur <kbd>↑</kbd>/<kbd>↓</kbd> pour passer aux deux autres commandes `docker compose` qui se trouvent
elles aussi dans cet historique.

## Installation {#installation}

Clonez simplement le repository officiel comme ceci :

<Terminal typewriter>
$ {`git clone https://github.com/zsh-users/zsh-autosuggestions \${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions`}
</Terminal>

Éditez ensuite le fichier `~/.zshrc`, cherchez `plugins=(` et ajoutez `zsh-autosuggestions` à la liste. Vous aurez par exemple quelque chose comme ceci :

<Snippet filename="~/.zshrc" source="./files/.zshrc" />

Fermez votre console, ouvrez-en une nouvelle (ou lancez `source ~/.zshrc` pour charger votre modification) et c'est fait.

## Conclusion {#conclusion}

Un `git clone`, une ligne dans `~/.zshrc`, et votre terminal arrête de vous demander de retenir des flags tapés il y a trois semaines. Comme tout est lu depuis votre historique, le plugin prend de la valeur chaque jour que vous l'utilisez.

Puisque les suggestions ne valent que ce que vaut le contenu stocké, il est utile de savoir comment cet historique est conservé et filtré : voir <Link to="/blog/linux-history">Linux - Working with the history of your last fired actions</Link>. Et pour un plugin dans le même esprit, dédié à vos hosts SSH : <Link to="/blog/zsh-plugin-ssh-config-suggestions">SSH - Autosuggestions with ZSH</Link>.
