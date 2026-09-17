---
slug: windows-terminal
title: Windows Terminal
date: 2024-04-01
description: Un guide complet de Windows Terminal. Découvrez comment l'installer, personnaliser les profils, utiliser des images de fond et configurer les paramètres pour WSL, Docker et l'ouverture de plusieurs onglets au démarrage.
authors: [christophe]
image: /img/v2/windows_terminal_tips.webp
series: Windows Terminal
mainTag: windows-terminal
tags:
  - customization
  - windows
  - windows-terminal
  - wsl
language: fr
review_date: 2026-07-30
---

<!-- cspell:ignore wekyb,bbwe,xmens -->

![Windows Terminal](/img/v2/windows_terminal_tips.webp)

<TLDR>
Cet article traite de la personnalisation de Windows Terminal via son fichier `settings.json` : définir une image de fond par profil, ajouter un nouveau profil pour ouvrir un shell dans une distribution WSL ou un container Docker précis, définir le profil par défaut et le dossier de démarrage, et utiliser `startupActions` pour ouvrir automatiquement plusieurs onglets (par exemple Ubuntu plus un prompt DOS) au lancement.
</TLDR>

Pour ceux qui aiment travailler dans une console, Windows Terminal peut être vu comme le successeur de la vieille console DOS ; vous savez, cet _écran noir_ où vous pouvez taper des commandes comme `dir` ou `mkdir`.

Windows Terminal est un logiciel multi-onglets : au lieu d'avoir plusieurs fenêtres, vous avez plusieurs onglets. Mais la fonctionnalité qui me séduit le plus, c'est la possibilité d'avoir une console DOS dans un onglet, une Powershell dans un deuxième, un ou plusieurs onglets pour Linux et, pourquoi pas, <Link to="/blog/windows-terminal-ssh-profile">un onglet pour une connexion SSH</Link>. Et au lieu d'onglets, vous pouvez aussi afficher plusieurs consoles côte à côte ; voyez <Link to="/blog/windows-terminal-split-panes">Windows Terminal - Split Panes</Link>.

Et c'est vraiment confortable ! Dans une même fenêtre, vous pouvez avoir plusieurs consoles actives et, par exemple, partager votre historique Linux entre les onglets. Plutôt sympa !

<!-- truncate -->

## Personnaliser votre profil {#customize-your-profile}

Sur mon ordinateur, voici à quoi ressemble ma console Ubuntu. J'utilise Windows Terminal et <Link to="/blog/powerlevel10k_sandbox">PowerLevel10k</Link> :

![Windows Terminal avec une console Ubuntu](./images/windows_terminal.webp)

Mais pour rendre l'interface plus geek, j'utilise un fond d'écran au lieu d'un simple écran noir.

Si ça vous tente, procédez comme ceci :

<StepsCard
  variant="steps"
  steps={[
    "Cliquez sur le bouton `+` et choisissez `settings`",
    {
      content: <>Cliquez sur la roue dentée, en bas à gauche, pour ouvrir les paramètres sous forme de fichier JSON (dans mon cas, VSCode s'ouvrira)<br />
      <img className="screenshot" src={require("./images/gear.webp").default} alt="La roue dentée" /></>,
    },
    "Dans l'éditeur ouvert, dépliez la `list` des `profiles` et retrouvez celui que vous souhaitez personnaliser (dans mon cas `Ubuntu`)",
  ]}
/>

Dans mon cas, mon profil a ces paramètres :

<Snippet filename="settings.json" source="./files/settings.json" />

Comme vous pouvez le voir, j'ai téléchargé une jolie image de fond, je l'ai enregistrée dans mon dossier `Backgrounds` puis j'utilise la notation Linux pour y faire référence.

## Installation {#installation}

Windows Terminal fait partie de Windows 11 : vous l'avez donc déjà si vous utilisez cet OS. Si vous êtes sur une version plus ancienne de Windows, vous pouvez installer Windows Terminal via le Windows Store ou, troisième possibilité si ce n'est pas possible, télécharger [la dernière release depuis GitHub](https://github.com/microsoft/terminal/releases).

## Ajouter un nouveau profil {#add-a-new-profile}

Pour ajouter un nouveau profil, disons une console à l'intérieur d'un de vos containers Docker (oui ! c'est possible), regardez le tableau `list` dans le contenu JSON : copiez/collez simplement un profil existant pour créer le nouveau.

Par exemple, je vais créer un nouveau profil pour pouvoir ouvrir directement mon blog dans un container Docker (puisque, bien sûr, mon blog a sa propre image Docker) :

<Snippet filename="settings.json" source="./files/settings.part2.json" />

<AlertBox variant="note" title="Vos paramètres">

- `commandline` : pour démarrer un sous-système Linux, commencez votre commande par `wsl.exe -d` suivi du nom de la distribution, par exemple `wsl.exe -d Debian`. Bien sûr, cette distribution doit être présente sur votre machine. Vous pouvez compléter la ligne de commande par un paramètre : la commande à exécuter au démarrage, par exemple `docker-compose`, `ls` ou autre chose.
- `backgroundImage` : optionnel. Indiquez ici, en notation Linux, le path vers l'endroit où vous avez enregistré l'image à utiliser comme fond,
- `backgroundImageOpacity` : optionnel. Entre `0` et `1` ; en fait, cela dépendra de l'image que vous choisirez,
- `guid` : vous devez, chaque fois, générer un nouveau GUID. Pour cela, lancez simplement `uuidgen` dans une console Linux, puis copiez/collez la valeur obtenue dans `{...}`,
- `icon` : optionnel. Pour personnaliser l'icône, récupérez n'importe quelle icône sur Internet et enregistrez l'image dans le dossier `%USERPROFILE%\AppData\Local\Packages\Microsoft.WindowsTerminalPreview_8wekyb3d8bbwe\RoamingState`. La notation à utiliser ensuite est `ms-appdata:///roaming/your_image_name.png`

</AlertBox>

![Le profil du blog](./images/blog.webp)

![La console du blog](./images/blog_opened.webp)

## Définir le profil par défaut {#set-the-default-profile}

Jetez un œil à la liste des profils définis dans votre fichier `settings.json` : chaque profil a son propre `guid`. Copiez/collez simplement le guid du profil de votre choix dans le nœud racine `defaultProfile`.

## Définir le dossier par défaut pour Ubuntu {#set-the-default-folder-for-ubuntu}

Pour ouvrir directement le dossier souhaité, il faut définir le nœud `startingDirectory` dans un profil. Disons que nous voulons ouvrir le dossier home de l'utilisateur au démarrage d'un nouveau shell Ubuntu :

<Snippet filename="settings.json" source="./files/settings.part3.json" />

Il vous suffit de spécifier le nœud `startingDirectory` et de le définir sur `\\wsl$\Ubuntu\home\christophe\`

## Ouvrir plusieurs onglets au démarrage {#open-multiple-tabs-during-the-startup-process}

Windows Terminal possède une propriété `startupActions` qui vous permet de spécifier les actions à effectuer pendant le processus de démarrage.

Imaginons que je veuille lancer deux onglets : celui par défaut (rien à prévoir) et un second onglet. Pour faciliter la maintenance, je vais utiliser un profil :

<Snippet filename="settings.json" source="./files/settings.part4.json" />

Je dois donc maintenant créer un profil appelé `DOS Command Prompt` :

<Snippet filename="settings.json" source="./files/settings.part5.json" />

Et tadaaa, maintenant, au lancement de Windows Terminal, mon terminal par défaut s'ouvrira (Ubuntu dans mon cas) et, dans un second onglet, j'ouvrirai aussi une console DOS.

## Pour aller plus loin {#going-further}

Voilà pour les bases, mais Windows Terminal a bien plus à offrir. J'ai écrit des articles dédiés, plus détaillés, sur quelques-uns de ces sujets : <Link to="/blog/windows-terminal-background">utiliser une image de fond</Link>, <Link to="/blog/windows-terminal-split-panes">diviser une fenêtre en plusieurs panneaux</Link>, et <Link to="/blog/windows-terminal-ssh-profile">ajouter un profil SSH en un clic</Link>.
