---
slug: ubuntu-install
title: Ubuntu - Installation from scratch
date: 2024-05-20
description: Installez Ubuntu Desktop 24.04 from scratch grâce à ce guide simple, étape par étape. Apprenez à désactiver Bitlocker, à créer une clé USB bootable et à contourner le bug d'installation des pilotes NVIDIA.
authors: [christophe]
image: /img/v2/linux_tips.webp
series: WSL2 - Install, move and use it
mainTag: linux
tags:
  - linux
  - wsl
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore Bitlocker,bootable,balena,askubuntu -->

![Ubuntu - Installation from scratch](/img/v2/linux_tips.webp)

<TLDR>
Cet article déroule une installation propre d'Ubuntu Desktop 24.04 en remplacement de Windows : désactiver Bitlocker en premier, créer une clé USB bootable avec balenaEtcher, démarrer dessus, effacer le disque avec chiffrement LVM, et un avertissement pour éviter l'option « installer les logiciels propriétaires recommandés » sur les cartes NVIDIA afin de contourner un bug de clé Secure Boot. Le tout se termine par une liste de packages snap essentiels à installer après coup (Firefox, Thunderbird, LibreOffice, VSCode, Docker, GIMP).
</TLDR>

Aujourd'hui, c'est jour férié en Belgique, je prends donc enfin le temps d'installer Ubuntu sur mon vieux PC.

L'idée : supprimer Windows et installer Ubuntu Desktop 24.04 sur la machine.

C'est parti, vous verrez, c'est facile.

<!-- truncate -->

## Résultat {#result}

![L'installation est terminée](./images/installation_done.webp)

Voilà une installation Ubuntu 24.04 fonctionnelle, prête à redémarrer. Avant d'en arriver là, un piège à éviter — celui qui m'a réellement coûté du temps pendant cette installation :

<AlertBox variant="highlyImportant" title="IMPORTANT - N'INSTALLEZ PAS DE PILOTES SUPPLÉMENTAIRES SI VOUS AVEZ UNE CARTE GRAPHIQUE NVIDIA">
L'assistant vous demandera si vous voulez **installer les logiciels propriétaires recommandés**. La première fois, j'ai répondu Oui aux deux options. L'installation a tourné pendant près de vingt minutes, puis j'ai eu un message d'erreur *The Secure Boot key is not valid*.

En cherchant sur le site **askubuntu.com**, quelqu'un mentionnait qu'il s'agissait d'un bug et qu'il ne faut pas installer les pilotes pendant l'installation d'Ubuntu, mais qu'on peut le faire facilement plus tard, en renvoyant à ce bug : [https://bugs.launchpad.net/subiquity/+bug/2060353](https://bugs.launchpad.net/subiquity/+bug/2060353).

J'ai donc abandonné l'installation et en ai lancé une nouvelle.
</AlertBox>

## Désactivez d'abord Bitlocker {#turn-off-bitlocker-first}

Si vous utilisez Bitlocker sur votre machine, vous devez d'abord le désactiver ; sinon, passez ce chapitre.

Vous pouvez suivre la documentation officielle ici : [Turn Bitlocker off](https://ubuntu.com/tutorials/install-ubuntu-desktop#13-additional-installing-ubuntu-alongside-windows-with-bitlocker).

En résumé, toujours dans votre session Windows, ouvrez le **Panneau de configuration**, cherchez **Bitlocker** et cliquez sur **Désactiver Bitlocker**. Selon la vitesse de votre machine et la taille du disque dur, cela prendra plusieurs minutes.

![Désactivation de Bitlocker](./images/disabling_bitlocker.webp)

<AlertBox variant="info" title="Suivez la progression dans la zone de notification">
Si, comme moi, vous ne voyez aucune progression à l'écran, pensez à cliquer sur l'icône de la zone de notification (près de l'horloge). Vous y trouverez une icône relative au processus de déchiffrement.

</AlertBox>

## Téléchargez Ubuntu et créez votre clé USB bootable {#download-ubuntu-and-create-your-bootable-usb-stick}

Il vous faut l'ISO d'Ubuntu ; rendez-vous simplement sur [https://ubuntu.com/tutorials/install-ubuntu-desktop#2-download-an-ubuntu-image](https://ubuntu.com/tutorials/install-ubuntu-desktop#2-download-an-ubuntu-image) et téléchargez-la.

Une fois le fichier **ubuntu-24.04-desktop-amd64.iso** téléchargé, il vous faudra un logiciel supplémentaire appelé [balenaEtcher](https://etcher.balena.io/). balenaEtcher sert à créer la clé USB bootable. Rien de plus simple : sélectionnez le fichier ISO téléchargé, puis la lettre du lecteur USB (D: pour moi) et confirmez.

Après quelques minutes, la clé USB sera prête.

## Pensez à brancher un câble Ethernet avant d'installer Ubuntu {#think-to-plug-an-ethernet-cable-before-installing-ubuntu}

Même si c'est optionnel, veillez à brancher un câble Ethernet : pendant l'installation, Ubuntu pourra ainsi télécharger des logiciels supplémentaires comme le pilote de votre carte graphique directement depuis Internet.

## Lancez l'assistant d'installation {#start-the-installation-wizard}

Allumez votre vieille machine et assurez-vous de démarrer sur la clé USB. Pour cela, pendant le démarrage (dans mon cas, quand je vois le logo Dell), appuyez sur la touche <kbd>F12</kbd> ou <kbd>DEL</kbd> pour ouvrir le BIOS.

Là, sélectionnez l'option qui permet de démarrer sur une clé USB ; enregistrez vos modifications le cas échéant et quittez.

Votre machine va maintenant démarrer sur la clé USB et lancer l'installation d'Ubuntu.

![Démarrage sur la clé USB](./images/boot_usb.webp)

Tout est très bien couvert par le [tutoriel officiel](https://ubuntu.com/tutorials/install-ubuntu-desktop).

Quelques notes :

- Sélectionnez le *mode interactif* pour choisir plus finement les options qui vous conviennent ;
- Quand on vous le demande, choisissez *Extended selection* pour pouvoir installer des logiciels supplémentaires pendant l'installation (outils de bureau, utilitaires et un navigateur web) ;
- Quand on vous demande *Install recommended proprietary software?*, vérifiez que les cases sont **décochées** (voir plus haut) ;
- L'assistant vous demandera *comment installer Ubuntu* : à côté de Windows (donc en dual boot) ou seul. Je vais opter pour la seconde option.
Personnellement, c'est mon objectif et je vais demander la suppression complète de mon disque actuel (Windows) ; pour cela, je clique sur *Erase disk and install Ubuntu* puis sur le bouton *Advanced features*. Je choisis *Use LVM and encryption*, ce qui me donnera un chiffrement comme celui que j'avais avec Bitlocker : quelqu'un qui viendrait voler mon disque dur n'aurait pas accès à mes fichiers sans la clé de déchiffrement.

*Souvenez-vous de l'avertissement NVIDIA/Secure Boot du début de cet article quand l'assistant vous parlera des pilotes propriétaires.*

On vous demandera de créer votre compte administrateur et de choisir votre fuseau horaire.

Ensuite, une fois vos choix confirmés, l'assistant va préparer votre machine puis copier les fichiers. C'est évidemment l'étape la plus lente. Elle peut prendre 10 minutes ou plus.

<AlertBox variant="note" title="L'installation semble figée">
Pendant quelques minutes, l'écran semblait bloqué sur *Setting up the system...*. Pourtant, je pouvais bouger le pointeur de la souris et, par exemple, afficher le menu (à gauche). J'ai continué à attendre et tout s'est *débloqué*. Soyez donc patient si besoin.

Vous pouvez commencer à découvrir l'interface avant même la fin de l'installation ! Déplacez simplement le curseur vers le bord gauche de l'écran et vous aurez accès à quelques applications.

</AlertBox>

<AlertBox variant="info" title="Voir la progression en mode console">
En bas à droite de l'écran d'installation, vous trouverez un petit bouton. Cliquez dessus et vous obtiendrez une fenêtre de logs où suivre l'action en cours.

</AlertBox>

C'est l'installation terminée montrée en haut de cet article.

## Redémarrez et activez Ubuntu Pro {#reboot-and-enable-ubuntu-pro}

Une fois l'installation terminée, retirez la clé USB et redémarrez.

L'assistant post-installation vous accueille et vous demande si vous souhaitez activer le service *Ubuntu Pro* ; allez-y.

[Ubuntu Pro](https://ubuntu.com/pro) est un service gratuit (pour un usage personnel) proposé par Canonical qui garde votre machine à jour.

Toute dernière étape : lancez l'application **Software Updater** pour vérifier s'il reste des logiciels à installer. Si vous êtes un pro de la console, c'est l'équivalent de `sudo apt update`.

## Place aux logiciels {#time-to-add-software}

- [Firefox](https://snapcraft.io/firefox) comme navigateur (`sudo snap install firefox`),
- [Thunderbird](https://snapcraft.io/thunderbird) comme client mail (`sudo snap install thunderbird`),
- [LibreOffice](https://snapcraft.io/libreoffice) pour créer des documents, des feuilles de calcul ou des présentations (`sudo snap install libreoffice`),
- [Visual Studio Code](https://snapcraft.io/code) pour se mettre à coder (`sudo snap install code --classic`),
- [Docker](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository) pour travailler avec des containers (voir <Link to="/blog/install-docker">Install Docker and play with PHP</Link>),
- [Gimp](https://snapcraft.io/gimp) pour retoucher des images (`sudo snap install gimp`),

Et la toute première chose que j'installe sur un Linux frais, avant tout le reste : <Link to="/blog/zsh-install">Oh-My-ZSH</Link>. Travailler dans `bash` après avoir goûté à l'autocomplétion de ZSH, c'est pénible.

*Ubuntu n'est pas le seul candidat pour un vieux PC ; j'ai aussi jeté un œil à <Link to="/blog/zorin">Zorin</Link>, basé sur Ubuntu mais livré avec un bureau qui ressemble à Windows.*
