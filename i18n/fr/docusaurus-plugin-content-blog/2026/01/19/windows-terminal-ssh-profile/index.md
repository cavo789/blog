---
slug: windows-terminal-ssh-profile
title: Windows Terminal - Ajouter un profil SSH
date: 2026-01-19
description: Ajouter un profil SSH à Windows Terminal pour se connecter rapidement à vos serveurs sans taper la commande SSH complète à chaque fois.
authors: [christophe]
image: /img/v2/adding_ssh_profile_to_windows_terminal.webp
series: Windows Terminal
mainTag: windows-terminal
tags:
  - customization
  - windows
  - windows-terminal
  - wsl
language: fr
blueskyRecordKey: 3mcr66gr7zk2k
---

![Windows Terminal - Ajouter un profil SSH](/img/v2/adding_ssh_profile_to_windows_terminal.webp)

<TLDR>
Ce guide montre comment simplifier les connexions à un serveur en créant un profil SSH dédié directement dans les paramètres de Windows Terminal. Il suffit d'ajouter un nouveau profil vide, de configurer la ligne de commande avec votre instruction SSH et, éventuellement, de personnaliser l'apparence avec une icône ou une image de fond. Cette configuration donne un accès immédiat aux serveurs distants via le menu déroulant du Terminal, sans avoir à taper les commandes de connexion à la main.
</TLDR>

Dans cet article, nous allons voir comment créer un nouveau profil SSH dans <Link to="/blog/windows-terminal">Windows Terminal</Link> pour ne même plus devoir se souvenir de la façon de se connecter au serveur ; il suffit d'ouvrir le profil et c'est tout.

À titre d'illustration, j'utiliserai mon serveur d'hébergement chez PlanetHoster, mais vous pouvez appliquer la même technique à n'importe quel serveur SSH.

<!-- truncate -->

## Le résultat {#the-result}

Une fois le profil créé (voir plus bas), la connexion au serveur se fait en un clic depuis le menu déroulant à côté du bouton `+` :

![Le nouveau profil SSH dans Windows Terminal](./images/windows_terminal_ssh_profile.webp)

Sélectionnez-le et une nouvelle console s'ouvre, déjà connectée en SSH.

## Pourquoi ça marche {#why-it-works}

- Plus besoin de retaper la commande `ssh planethoster` — le profil s'en charge pour vous.
- Le serveur est accessible directement depuis le menu déroulant du Terminal, à côté de vos autres profils.
- Entièrement personnalisable — une icône, une image de fond, son propre jeu de couleurs, tout ce qui vous aide à le repérer d'un coup d'œil.

## Installation {#installation}

### Ouvrir les paramètres de Windows Terminal {#open-windows-terminal-settings}

Pour ouvrir les paramètres de Windows Terminal, vous pouvez utiliser les méthodes suivantes :

<StepsCard
  variant="steps"
  steps={[
    'Cliquez sur le bouton `+` pour ouvrir un nouvel onglet, puis sélectionnez "Paramètres" dans le menu déroulant.',
    'Appuyez sur `Ctrl + ,` depuis Windows Terminal.',
    'Faites un clic droit sur la barre de titre et sélectionnez "Paramètres".',
    'Utilisez la commande `wt -p` dans PowerShell ou CMD.',
  ]}
/>

![Accéder aux paramètres de Windows Terminal](./images/windows_terminal_access_to_settings.webp)

### Ajouter un profil pour n'importe quelle connexion SSH {#add-a-profile-for-any-ssh-connection}

Dans un article récent, nous avons vu comment créer un profil SSH et pouvoir lancer une commande comme `ssh planethoster` (ou autre). Si vous l'avez manqué, lisez <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link>.

Donc, à ce stade, pour vous connecter à votre serveur d'hébergement, il suffit de lancer `ssh planethoster` dans une console Windows Terminal (PowerShell, CMD ou WSL).

Voyons comment créer un profil Windows Terminal qui ouvrira directement une console connectée à votre serveur d'hébergement :

<StepsCard
  variant="steps"
  steps={[
    'Ouvrez les paramètres de Windows Terminal,',
    'Dans le menu de gauche, sélectionnez "Ajouter un nouveau profil",',
    'Cliquez sur "Nouveau profil vide",',
    'Dans le champ "Nom", tapez "SSH - PlanetHoster" (ou ce que vous voulez),',
    'Dans le champ "Ligne de commande", tapez `ssh planethoster` (ou l\'alias que vous avez défini dans votre fichier `~/.ssh/config`),',
    'Éventuellement, choisissez une icône pour votre profil en cliquant sur le bouton "Parcourir" ou collez ici un emoji comme "⚡",',
    'Enfin, cliquez sur le bouton "Enregistrer" en bas à droite.',
  ]}
/>

Le changement est immédiat : en cliquant sur la flèche vers le bas à côté du bouton `+`, vous verrez votre nouveau profil — exactement le résultat montré en haut de cet article.

## Autres démos {#more-demos}

### Ajouter une image de fond (optionnel) {#adding-a-background-image-optional}

Retournez dans les paramètres, sélectionnez le profil que vous venez de créer (`SSH - PlanetHoster` dans notre exemple), descendez jusqu'à la section "Apparence" et cliquez dessus pour la déployer.

Dans le champ "Chemin d'accès à l'image d'arrière-plan", cliquez sur le bouton "Parcourir" et sélectionnez un fichier image sur votre ordinateur (par exemple un fichier `.jpg` ou `.webp`).

Ajustez les autres réglages que vous souhaitez (par exemple le curseur "Opacité de l'image d'arrière-plan" pour rendre l'image plus ou moins visible).

Cliquez sur le bouton "Enregistrer" en bas à droite.

![Le profil SSH avec une image de fond](./images/windows_terminal_ssh_profile_with_background.webp)

## Conclusion {#conclusion}

Désormais, dès que vous voulez vous connecter à votre serveur d'hébergement, ouvrez simplement Windows Terminal et sélectionnez votre profil SSH. Une nouvelle console s'ouvrira, automatiquement connectée à votre serveur via SSH.

Fermez la console pour terminer la session quand vous avez fini.

Pensez aussi à explorer les autres réglages personnalisables du profil : taille de police, jeu de couleurs et bien plus, pour améliorer votre expérience. Vous pouvez également définir le répertoire de départ à ouvrir au lancement du profil.

Envie d'aller plus loin ? Combinez ce profil SSH avec les <Link to="/blog/windows-terminal-split-panes">panneaux divisés</Link> pour surveiller plusieurs serveurs distants côte à côte dans une seule fenêtre.
