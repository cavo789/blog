---
slug: powerlevel10k_sandbox
title: Personnalisez votre prompt Linux avec Powerlevel10k
date: 2023-12-31
description: Testez et personnalisez le thème Zsh Powerlevel10k pour votre prompt Linux ou WSL dans un sandbox Docker jetable avant de vous lancer dans une installation complète.
authors: [christophe]
image: /img/v2/customization_prompt.webp
series: Customize your shell with ZSH
mainTag: customization
tags:
  - customization
  - docker
  - wsl
  - zsh
language: fr
review_date: 2026-07-30
---
![Personnalisez votre prompt Linux avec Powerlevel10k](/img/v2/customization_prompt.webp)

<TLDR>
Cet article montre comment essayer le thème de prompt Zsh Powerlevel10k sans aucun risque, grâce à un container Docker Alpine jetable (une commande unique tirée du README officiel) : tout — git, zsh, nano, le thème et son assistant de configuration — tourne entièrement en RAM et disparaît au `exit`. De quoi décider si vous l'installez pour de bon avant de toucher à votre vraie machine.
</TLDR>

Quand vous travaillez sous Linux (donc aussi avec WSL), il existe de nombreuses façons de personnaliser votre prompt. Une des solutions les plus simples est d'utiliser [Powerlevel10k](https://github.com/romkatv/powerlevel10k) et son assistant.

Dans cet article, nous allons utiliser un container Docker uniquement pour : *tester et jeter*. Vous verrez exactement à quoi ressemble le prompt, vous jouerez avec l'assistant, et votre machine restera intacte.

L'astuce vient de [https://github.com/romkatv/powerlevel10k/blob/master/README.md](https://github.com/romkatv/powerlevel10k/blob/master/README.md#try-it-in-docker)

<!-- truncate -->

## À quoi ressemble Powerlevel10k {#what-powerlevel10k-looks-like}

Voici mon propre prompt, une fois l'assistant passé :

![Un prompt Powerlevel10k](./images/p10k-prompt.webp)

Lisez-le de gauche à droite : le dossier courant, puis la branch git (`main`) avec `?1` qui m'indique qu'un fichier est modifié et pas encore commité, puis — à droite — une coche verte pour la commande précédente, l'identité `root@AVONTURE-RACOUR` avec laquelle je suis connecté, et l'heure de fin de la commande.

Tout ça en permanence, sans taper `git status` ni `whoami`. Voilà l'argument ; le reste de cet article explique comment l'essayer sans toucher à votre machine.

## L'essayer sans rien installer {#try-it-without-installing-anything}

En lançant la commande ci-dessous, vous allez télécharger une toute petite image Linux Alpine puis démarrer quelques initialisations comme l'installation de `git`, `nano`, `zsh`, ... Le repository Powerlevel10k sera téléchargé depuis Github et son assistant sera lancé.

<Terminal typewriter source="./files/terminal-1.txt" />

Répondez aux questions de l'assistant, jouez avec le résultat, et décidez si vous l'adoptez ou non.

<AlertBox variant="note" title="Tout se passe en RAM ; rien sur votre disque">
Lancer la commande `docker run` ci-dessus va télécharger une image Docker Alpine Linux sur votre disque (moins de 7 Mo) puis installer des binaires dans le container en cours d'exécution. Donc, en quittant le container avec la commande `exit`, rien ne restera sur votre disque. Idéal pour tester.

</AlertBox>

## Pourquoi je l'ai gardé {#why-i-kept-it}

- Quand une instruction est terminée, le nouveau prompt affiche le temps qu'elle a pris, pratique quand vous cherchez à optimiser une commande,
- À droite, vous voyez immédiatement si l'instruction a échoué, avec un affichage rouge et le code d'erreur (`exitcode`),
- Il s'intègre bien avec <Link to="/blog/windows-terminal">Windows Terminal</Link> si vous êtes sous WSL, et avec la configuration modulaire décrite dans <Link to="/blog/modular-zsh-workflow">Beyond the Monolith - Organizing Your ZSH Workflow Like a Pro</Link>,
- Et, bien sûr, l'aspect visuel, qui est plutôt sympa.

Et aussi, comme je travaille dans des containers Docker au quotidien, utiliser Powerlevel10k en local me donne une indication visuelle forte pour savoir à tout moment si je suis en local ou dans un container.

## Conclusion {#conclusion}

L'avantage de ce sandbox, c'est que la décision ne vous coûte rien : vous tapez une commande, vous regardez le prompt pendant deux minutes, et vous tapez `exit`. Tout ce que vous avez répondu à l'assistant disparaît avec le container.

Si ce que vous avez vu vous plaît, faites-le pour de vrai : <Link to="/blog/zsh-install">How to install Oh-My-ZSH</Link> couvre l'installation sur disque (Oh-My-Zsh d'abord, puis Powerlevel10k), et le [guide d'installation](https://github.com/romkatv/powerlevel10k#installation) officiel donne les détails pour toutes les autres configurations.
