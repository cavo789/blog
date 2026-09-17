---
slug: wslg-rpd-connection
title: Ouvrir une connexion RDP vers l'instance Linux locale
date: 2023-11-02
description: Apprenez à ouvrir une connexion RDP vers votre instance Linux WSLg (Ubuntu) pour obtenir un environnement de bureau graphique complet. Suivez ce guide pas à pas pour installer et configurer xrdp.
authors: [christophe]
image: /img/v2/wsl.webp
series: WSL2 - Install, move and use it
mainTag: wsl
tags:
  - docker
  - windows
  - wsl
language: fr
review_date: 2026-07-30
---
![Ouvrir une connexion RDP vers l'instance Linux locale](/img/v2/wsl.webp)

> [https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote](https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote)
> [https://medium.com/@riley.kao/wsl2-ubuntu20-04-gui-remote-desktop-connection-rdp-2bbd21d2fa71](https://medium.com/@riley.kao/wsl2-ubuntu20-04-gui-remote-desktop-connection-rdp-2bbd21d2fa71)

<TLDR>
Cet article montre comment faire du RDP vers une instance WSL2 Ubuntu : installer et démarrer `xrdp` (sur un port non standard comme 3390 pour éviter les conflits), se connecter depuis Windows via `mstsc.exe`, et installer un environnement de bureau Xfce complet (`xubuntu-desktop`) avec `startwm.sh` reconfiguré pour le lancer, afin que la session RDP affiche un vrai bureau graphique et pas seulement une console.
</TLDR>

Quand WSLg est activé, il est possible d'accéder à l'interface graphique de votre distribution Linux (dans mon cas, il s'agit d'Ubuntu).

*Vous obtenez le **bureau complet** de votre instance WSL, et pas juste une fenêtre par-ci par-là. L'équivalent Docker, si vous préférez ne pas toucher à votre instance WSL, c'est <Link to="/blog/docker-lubuntu">démarrer un bureau lubuntu complet dans Docker</Link>.*

<!-- truncate -->

## À quoi ressemble vraiment une session RDP vers WSL {#what-an-rdp-session-into-wsl-actually-looks-like}

Par défaut, une instance WSL vous donne une console bash. Voici la même instance, dans une fenêtre RDP Windows, avec un bureau Xfce complet :

![Écran du bureau](./images/desktop.webp)

Quatre commandes et un fichier de configuration plus bas, et voilà le résultat.

## Faire tourner xrdp {#get-xrdp-running}

Si vous n'avez pas encore `xrdp`, vous pouvez l'installer en lançant :

<Terminal typewriter>
$ sudo apt update && sudo apt -y upgrade
...
$ sudo apt-get install -y xrdp
...
</Terminal>

Pensez aussi à changer le numéro de port en `3390` en lançant la commande ci-dessous et en faisant quelques modifications mineures. *Cela semble nécessaire car, avec le port 3389 par défaut, vous obtenez l'erreur « already in use » avec mstsc.*

<Terminal typewriter source="./files/terminal-2.txt" />

(voir [https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote](https://www.nextofwindows.com/how-to-enable-wsl2-ubuntu-gui-and-use-rdp-to-remote) pour des informations plus détaillées)

Une fois fait, lancez `sudo service xrdp start` pour démarrer le service. Vous verrez la notification `* Starting Remote Desktop Protocol server` dans la console.

## Se connecter depuis Windows {#connect-from-windows}

Retournez dans votre environnement Windows, démarrez `mstsc.exe` et indiquez comme nom d'ordinateur `localhost:3390` (ou le numéro de port que vous utilisez).

![Démarrer la connexion RDP](./images/rdp_localhost.webp)

<AlertBox variant="caution">
La connexion n'est possible que si `xrdp` est démarré. Donc, si ça ne marche pas, vous savez quoi faire (vous pouvez aussi lancer `sudo service xrdp status` pour obtenir des informations détaillées).

</AlertBox>

![Écran d'authentification](./images/authentication.webp)

Utilisez votre utilisateur Linux local et connectez-vous.

## Installer l'environnement de bureau {#get-the-desktop-environment}

À ce stade, vous êtes connecté, mais vous n'obtenez qu'une console bash et pas le bureau illustré en haut de cet article.

Si vous voulez le bureau et toutes ses fonctionnalités, lancez `sudo apt-get install -y xubuntu-desktop xfce4 xfce4-goodies`. On vous demandera de choisir entre `gdm3` et `lightdm` ; sélectionnez le premier pour avoir toutes les fonctionnalités.

Lancez ensuite `sudo nano /etc/xrdp/startwm.sh` pour éditer le fichier.

1. Commentez les deux dernières lignes :

    <Snippet filename="/etc/xrdp/startwm.sh">

    ```bash
    # test -x /etc/X11/Xsession && exec /etc/X11/Xsession
    # exec /bin/sh /etc/X11/Xsession
    ```

    </Snippet>

2. Ajoutez ces deux dernières lignes :

    <Snippet filename="/etc/xrdp/startwm.sh">

    ```bash
    # xfce4
    startxfce4
    ```

    </Snippet>

Enfin, activez `dbus` :

<Terminal typewriter source="./files/terminal-1.txt" />

Lancez `sudo service xrdp restart` pour redémarrer le serveur Remote Desktop Protocol et démarrez `mstsc.exe` à nouveau. Vous devriez maintenant avoir le bureau complet.

<AlertBox variant="info">
Quand vous n'avez plus besoin du RDP, libérez des ressources en lançant `sudo service xrdp stop` dans votre console Linux.

</AlertBox>

### Configurer votre clavier {#set-your-keyboard}

Par défaut, le clavier est en `QWERTY`, allez donc dans `Applications` → `Settings` → `Keyboard`.

![Configurer votre clavier](./images/settings_keyboard.webp)

Dans le troisième onglet, trouvez votre propre configuration de clavier. Si vous utilisez le `Français - Belgique` sous Windows, vous devez régler votre clavier sur `Belgian (alt.)` sous Ubuntu.

![Configurer votre clavier en belge](./images/settings_keyboard_belgian.webp)

## Conclusion {#conclusion}

WSLg seul vous donne des fenêtres Linux isolées qui flottent sur votre bureau Windows ; avec `xrdp` et Xfce, vous obtenez le bureau entier à la place, barre des tâches et panneau de configuration inclus, dans une seule fenêtre RDP que vous pouvez réduire comme n'importe quelle autre.

Si un bureau complet est plus que ce dont vous avez besoin : <Link to="/blog/docker-run-linux-gui">lancer une seule application graphique depuis un container</Link> est plus léger, et si vous voulez simplement accéder à vos fichiers Linux, <Link to="/blog/wsl-windows-explorer">Open your Linux folder in Windows Explorer</Link> suffit.
