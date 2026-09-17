---
slug: winscp-retrieve-password
title: WinSCP - Récupérer un mot de passe enregistré
date: 2024-01-21
description: Vous avez oublié un mot de passe WinSCP enregistré ? Suivez ce guide rapide pour activer les logs et récupérer votre mot de passe en clair depuis le fichier de log de session.
authors: [christophe]
image: /img/v2/winscp.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - ssh
  - winscp
language: fr
review_date: 2026-07-30
---
![WinSCP - Récupérer un mot de passe enregistré](/img/v2/winscp.webp)

<TLDR>
Cet article montre comment récupérer un mot de passe WinSCP oublié : activez temporairement « Log passwords and other sensitive information » dans les préférences de logging, reconnectez-vous au site pour qu'il soit écrit dans le log de session dans `%TEMP%`, puis lisez le mot de passe en clair dans ce log — sans oublier de désactiver les logs et de supprimer le fichier ensuite.
</TLDR>

Il m'est arrivé plus d'une fois d'avoir un site enregistré dans la configuration de [WinSCP](https://winscp.net/) avec le mot de passe sauvegardé et, euh, mince, c'était quoi déjà ?

*Le vrai remède, c'est d'arrêter complètement de taper des mots de passe : <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link> met en place l'authentification par clé, et <Link to="/blog/keepass-overriding-url">KeePass - Overriding the URL field</Link> ouvre WinSCP avec les bons identifiants directement depuis votre coffre.*

Saviez-vous que WinSCP propose une option pour afficher, en clair, un mot de passe enregistré ?

<!-- truncate -->

Pour cela, allez dans le menu `Preferences`, puis dans `Logging` et cochez *Log passwords and other sensitive information*.

![Log password](./images/log_password.webp)

Cliquez sur `Ok` et double-cliquez sur votre site pour établir effectivement une connexion.

Lancez l'explorateur Windows et allez dans votre répertoire `%TEMP%`. Triez sur la date/heure de dernière modification. Vous devriez retrouver un fichier portant le même nom que votre session, avec l'extension `.log`.

<AlertBox variant="highlyImportant" title="N'oubliez pas de supprimer le fichier et de décocher la case">
Retournez sur la page `preferences` - `Logging` et décochez la case. Vous ne voulez pas que ça arrive à chaque fois.
</AlertBox>

Vous vous battez plutôt avec PuTTY ? Voyez <Link to="/blog/putty-no-supported-authentication-methods">Fatal error was starting Putty after having saved settings</Link>. Et si vous préférez ne plus dépendre du tout des mots de passe enregistrés, <Link to="/blog/linux-ssh-scp">SSH - Launch a terminal on your session without having to authenticate yourself</Link> montre comment passer à l'authentification par clé.
