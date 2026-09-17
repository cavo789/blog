---
slug: windows-terminal-split-panes
title: Windows Terminal - Split Panes
date: 2026-01-12
description: Apprenez à diviser les panneaux dans Windows Terminal pour un multitâche efficace ; raccourcis, astuces de configuration et exemples de workflow.
authors: [christophe]
image: /img/v2/windows_terminal_splitted_panes.webp
series: Windows Terminal
mainTag: windows-terminal
tags:
  - customization
  - windows-terminal
  - wsl
language: fr
blueskyRecordKey: 3mc7k5cv3js2m
---

![Windows Terminal - Split Panes](/img/v2/windows_terminal_splitted_panes.webp)

<TLDR>
Cet article montre comment configurer Windows Terminal pour du multitâche efficace grâce aux panneaux divisés. Il détaille deux méthodes : écrire la ligne de commande en dur dans de nouveaux profils, ou réutiliser des profils existants (éventuellement masqués) pour construire des dispositions de workspace complexes. Le guide couvre aussi des raccourcis clavier utiles, le zoom sur un panneau et la diffusion de l'entrée vers plusieurs panneaux en même temps.
</TLDR>

Dans cet article, nous allons voir comment créer un profil Windows Terminal avec trois panneaux divisés (ou plus) afin de surveiller plusieurs consoles en même temps.

J'en ai souvent besoin quand je travaille sur un gros projet composé de plusieurs repositories : une application backend, une application cliente, une bibliothèque partagée et un proof-of-concept qui relie le tout. Plutôt que d'ouvrir plusieurs fenêtres de terminal, je préfère une seule fenêtre avec des panneaux divisés.

Cela me permet aussi de lancer la même commande dans tous les panneaux (par exemple pour lancer les tests), de surveiller les logs ou de pousser mes changements vers Git — tout depuis une seule fenêtre.

Et quand j'ai besoin de me concentrer sur un panneau, je peux zoomer dessus et masquer temporairement les autres.

<!-- truncate -->

Nous allons utiliser Windows Terminal. Il est livré avec Windows 10 et les versions suivantes, et c'est le terminal par défaut de Windows. Si vous ne l'avez pas, vous pouvez le télécharger ici : [Windows Terminal on Microsoft Store](https://www.microsoft.com/store/productId/9N0DX20HK701). Si vous n'êtes pas encore familier avec les profils et `settings.json`, mon introduction <Link to="/blog/windows-terminal">Windows Terminal</Link> est un bon point de départ.

*Deux autres astuces de profil à combiner avec les panneaux : <Link to="/blog/windows-terminal-ssh-profile">Windows Terminal - Adding a SSH profile</Link>, pour qu'un de vos panneaux s'ouvre directement sur un serveur distant, et <Link to="/blog/windows-terminal-background">Use a background image in your Windows Terminal console</Link> pour distinguer vos panneaux d'un coup d'œil.*

Il y a deux approches :

1.  Écrire la ligne de commande « en dur ».
2.  Réutiliser des profils existants.

Voyons les deux.

## Ouvrir les paramètres de Windows Terminal {#open-windows-terminal-settings}

La première étape consiste à ouvrir les paramètres de Windows Terminal. Vous pouvez utiliser une de ces méthodes :

<StepsCard
  variant="steps"
  steps={[
    "Cliquez sur le bouton `+` pour ouvrir un nouvel onglet, puis sélectionnez **Paramètres** dans le menu déroulant.",
    "Appuyez sur `Ctrl + ,` dans Windows Terminal.",
    "Faites un clic droit sur la barre de titre et sélectionnez **Paramètres**.",
    "Lancez `wt -p` depuis PowerShell ou CMD.",
  ]}
/>

![Getting access to Windows Terminal Settings](./images/windows_terminal_access_to_settings.webp)

Dans le coin **inférieur gauche**, cliquez sur **Ouvrir le fichier JSON**. Cela ouvrira le fichier `settings.json` dans votre éditeur par défaut (par exemple VS Code).

![Open JSON file link](./images/windows_terminal_open_json_file.webp)

## Créer un nouveau profil et écrire la ligne de commande en dur {#create-a-new-profile-and-hardcode-the-command-line}

Dans `settings.json`, ajoutez un nouvel objet profil au tableau `profiles.list`.

Copiez-collez le code ci-dessous comme nouvelle entrée du tableau `list`, en l'adaptant à vos besoins (nom du profil, icône, ligne de commande, etc.).

```json
{
    "name": "My complex project - Workspace",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3",
    "hidden": false
},
```

<AlertBox variant="note" title="-p 'Ubuntu 24.04'">
Dans la ligne de commande proposée ci-dessus, j'ai utilisé `-p "Ubuntu 24.04"` parce que c'est le nom d'un profil existant dans mon Windows Terminal. Vous utiliserez probablement autre chose.
</AlertBox>

Cela va créer un nouveau profil nommé `My complex project - Workspace` avec trois panneaux divisés, chacun exécutant une instance WSL Ubuntu différente dans un répertoire précis (project_1, project_2, project_3).

Retournez dans Windows Terminal, affichez la liste des profils et vous verrez le nouveau. Cliquez dessus pour démarrer.

<AlertBox variant="info" title="En raison de l'utilisation de la commande `wt.exe nt`, Windows Terminal ouvrira une nouvelle fenêtre avec la disposition indiquée." />

Le premier panneau sera le principal, et les deux autres seront divisés horizontalement et verticalement, comme illustré ci-dessous.

![Three panes in Windows Terminal](./images/windows_terminal_three_splitted_panes.webp)

Si vous avez besoin de quatre panneaux, vous pouvez ajouter une autre commande `sp` dans la propriété `commandline`.

```json
{
  "name": "My complex project - Workspace",
  "icon": "🐍",
  "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_4",
  "hidden": false
}
```

![Four panes in Windows Terminal](./images/windows_terminal_four_splitted_panes.webp)

Ou, si vous voulez une disposition avec l'écran divisé en quatre quadrants (deux en haut et deux en bas), vous pouvez utiliser cette ligne de commande :

```json
{
  "name": "My complex project - Workspace",
  "icon": "🐍",
  "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_4 ; mf up ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2",
  "hidden": false
}
```

![Four panes in a grid Windows Terminal](./images/windows_terminal_four_splitted_panes_grid.webp)

Si vous préférez une disposition verticale :

```json
 {
    "name": "My complex project - Workspace",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_1 ; sp -V -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_2 ; mf left ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_3 ; mf right ; sp -H -p \"Ubuntu 24.04\" wsl.exe -d Ubuntu-24.04 --cd ~/repositories/project_4",
    "hidden": false
},
```

![Vertical four panes in Windows Terminal](./images/windows_terminal_vertical_four_splitted_panes.webp)

Il existe de nombreuses façons de créer des dispositions — voir la référence complète de la commande `wt` ici : [Windows Terminal Command Line Arguments](https://learn.microsoft.com/en-us/windows/terminal/command-line-arguments?tabs=windows).

## Créer un profil workspace et réutiliser des profils existants {#create-a-workspace-profile-and-reuse-existing-profiles}

Comme vous le voyez, une ligne de commande écrite en dur devient vite compliquée à maintenir.

On peut faire mieux en réutilisant des profils existants.

Dans l'exemple ci-dessous, je crée six profils, un pour chaque sous-projet. Dans chaque profil, je définis le répertoire de travail (voir l'attribut `commandline`) et un fond spécifique (image, opacité et mode d'étirement — voir <Link to="/blog/windows-terminal-background">Use a background image in your Windows Terminal console</Link> si vous voulez plus de détails sur ces propriétés). Ensuite, je mets l'attribut `hidden` à `true` pour que le profil n'apparaisse pas dans la liste des profils.

```json
{
    "name": "Core API",
    "commandline": "wsl.exe -d Ubuntu-24.04 --cd ~/repositories/core-api",
    "tabTitle": "Core API",
    "hidden": true,
    "backgroundImage": "c:/Users/Christophe/backgrounds/core_api.jpg",
    "backgroundImageOpacity": 1,
    "backgroundImageStretchMode": "fill",
    "guid": "{ab98421f-2e2e-4ae0-9065-5385ee28c930}"
},
{
    "name": "Facade",
    "commandline": "wsl.exe -d Ubuntu-24.04 --cd ~/repositories/facade",
    "hidden": true,
    "tabTitle": "Facade",
    "backgroundImage": "c:/Users/Christophe/backgrounds/facade.jpg",
    "backgroundImageOpacity": 1,
    "backgroundImageStretchMode": "fill",
    "guid": "{c2f1edf0-a7c6-427e-bc29-f74549363ec7}"
},
{
    "name": "POC Facade",
    "commandline": "wsl.exe -d Ubuntu-24.04 --cd ~/repositories/poc-facade",
    "tabTitle": "POC Facade",
    "hidden": true,
    "backgroundImage": "c:/Users/Christophe/backgrounds/poc_facade.jpg",
    "backgroundImageOpacity": 1,
    "backgroundImageStretchMode": "fill",
    "guid": "{1b82632f-68a2-4611-b03e-ff0d0ff2ff08}"
},
{
    "name": "Shared Lib",
    "commandline": "wsl.exe -d Ubuntu-24.04 --cd ~/repositories/shared",
    "tabTitle": "Shared Lib",
    "hidden": true,
    "backgroundImage": "c:/Users/Christophe/backgrounds/shared_lib.jpg",
    "backgroundImageOpacity": 1,
    "backgroundImageStretchMode": "fill",
    "guid": "{71b426b6-6404-4e12-a549-4546f59683e7}"
},
{
    "name": "API Runtime",
    "commandline": "wsl.exe -d Ubuntu-24.04 --cd ~/repositories/api-runtime",
    "tabTitle": "API Runtime",
    "hidden": true,
    "backgroundImage": "c:/Users/Christophe/backgrounds/api_runtime.jpg",
    "backgroundImageOpacity": 1,
    "backgroundImageStretchMode": "fill",
    "guid": "{c2a595be-9ae2-4038-9f59-a3d4e60eeb4c}"
},
{
    "name": "POC Databases",
    "commandline": "wsl.exe -d Ubuntu-24.04 --cd ~/repositories/poc-databases",
    "tabTitle": "POC Databases",
    "hidden": true,
    "backgroundImage": "c:/Users/Christophe/backgrounds/poc_databases.jpg",
    "backgroundImageOpacity": 1,
    "backgroundImageStretchMode": "fill",
    "guid": "{3b64affc-5130-441c-9653-1e25d78f3209}"
},
```

<AlertBox variant="tip" title="Le GUID n'est plus nécessaire dans les versions récentes de Windows Terminal">
Dans le code ci-dessus, j'en ai utilisé un ancien à titre d'illustration. J'ai conservé l'attribut `guid` parce que les anciennes versions de Windows Terminal l'exigent.

Si vous avez une version récente, vous pouvez supprimer la ligne `guid` ; elle n'est plus requise.

Si vous devez préciser cet attribut et que vous vous demandez *Comment générer une chaîne GUID ?*, il existe une commande Linux pour ça. Tapez simplement `uuidgen` dans votre console. À chaque exécution, vous obtiendrez un nouveau GUID valide.

</AlertBox>

Voilà, c'était pour définir les profils que je vais réutiliser dans mon workspace.

Maintenant, ajoutez ce dernier profil :

```json
{
    "name": "My complex project - Workspace",
    "icon": "🐍",
    "commandline": "wt.exe nt -p \"Core API\" ; sp -H -p \"Shared Lib\" ; sp -V -p \"API Runtime\" ; sp -V -p \"POC Databases\" ; mf up ; sp -V -p \"Facade\" ; sp -V -p \"POC Facade\"",
    "guid": "{521ac4e0-056d-460c-b2b4-69dd727c8836}"
},
```

Si vous enregistrez ce fichier et retournez dans Windows Terminal, un clic sur le bouton `+` affichera la liste des profils :

![The workspace in Windows Terminal](./images/windows_terminal_workspace.webp)

En cliquant dessus, vous aurez maintenant un nouveau terminal avec 6 panneaux différents, chacun clairement identifié par son image de fond :

![Having up to six profiles](./images/windows_terminal_six_profiles.webp)

<Details label="Bonus">

### Activer le zoom sur un panneau {#toggle-zoom-for-a-pane}

Celui-ci est mon préféré. Vous pouvez zoomer et dézoomer sur un panneau en appuyant sur <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> puis en sélectionnant **Toggle pane zoom**. Répétez l'action pour restaurer la vue.

C'est très pratique quand vous voulez vous concentrer sur un panneau précis sans fermer les autres.

### Raccourcis clavier pour gérer les panneaux {#keyboard-shortcuts-to-manage-panes}

Voici une liste de raccourcis clavier utiles pour gérer les panneaux dans Windows Terminal :

<AlertBox variant="note" title="`+` et `-` désignent les touches du clavier principal, pas celles du pavé numérique." />

<StepsCard
  variant="remember"
  title="Raccourcis des panneaux"
  steps={[
    { content: <><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>+</kbd> — Diviser le panneau courant verticalement.</> },
    { content: <><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>-</kbd> — Diviser le panneau courant horizontalement.</> },
    { content: <><kbd>Alt</kbd> + <kbd>Shift</kbd> + touches fléchées — Augmenter ou réduire la taille du panneau courant dans la direction de la flèche.</> },
    { content: <><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> — Fermer le panneau courant.</> }
  ]}
/>

### Actions du panneau de contrôle {#control-panel-actions}

Vous pouvez diffuser l'entrée vers tous les panneaux en activant l'option **Toggle broadcast input to all panes** depuis le menu **Command Palette** (que vous ouvrez avec <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd>).

Activez donc cette option : le curseur change pour indiquer que la diffusion est active. Désormais, tout ce que vous tapez dans un panneau est envoyé à tous les panneaux.

![Broadcast input to all panes](./images/panes_broadcasting.gif)

Réactivez l'option pour désactiver la diffusion.

Par exemple, vous pouvez vider l'écran de tous les panneaux d'un coup en tapant `clear`, ou pousser vos changements vers Git dans tous les repositories en tapant `git add . && git commit -m 'wip' && git push` une seule fois.

</Details>
