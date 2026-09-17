---
slug: putty-no-supported-authentication-methods
title: Erreur fatale au démarrage de Putty après avoir sauvegardé les paramètres
date: 2024-03-30
description: "Corrigez l'agaçante erreur fatale « No supported authentication methods available » de PuTTY qui survient après la sauvegarde des paramètres. Voici la solution rapide : supprimer une entrée précise du registre PuTTY."
authors: [christophe]
image: /img/v2/putty.webp
series: WinSCP & remote file transfer
mainTag: winscp
tags:
  - ssh
  - winscp
language: fr
review_date: 2026-07-30
---
![Erreur fatale au démarrage de Putty après avoir sauvegardé les paramètres](/img/v2/putty.webp)

<TLDR>
Cet article corrige l'erreur fatale « No supported authentication methods available » de PuTTY, qui peut apparaître après avoir sauvegardé les paramètres par défaut : supprimez l'entrée `Default%20Settings` sous `HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions` dans le registre Windows pour réinitialiser les valeurs par défaut de PuTTY.
</TLDR>

Il y a quelques jours, j'ai modifié ma configuration Putty pour passer la taille de police par défaut à 12 ; fini le 10.

Aujourd'hui, au démarrage de Putty — quel que soit le serveur auquel je voulais me connecter — j'ai obtenu l'erreur *No supported authentication methods available*, suivie, dans mon cas, de *(server sent: publickey, gssapi-keyex, gssapi-with-mic, keyboard-interactive)*.

Je n'ai compris l'origine du problème qu'en regardant le titre de la fenêtre : Putty essayait de se connecter à un autre serveur que celui que je voulais. Pourquoi ? Ah, ok, la dernière fois que j'ai modifié mes paramètres, je travaillais sur ce serveur. La solution devait donc venir de là : *comment réinitialiser mes paramètres Putty ?*

<!-- truncate -->

La solution a été donnée par @makurison sur [https://stackoverflow.com/questions/57072011/delete-putty-default-settings-modification-to-original](https://stackoverflow.com/questions/57072011/delete-putty-default-settings-modification-to-original).

Lancez simplement `regedit.exe`, cherchez la clé `Computer\HKEY_CURRENT_USER\SOFTWARE\SimonTatham\PuTTY\Sessions` et, là, supprimez l'entrée appelée `Default%20Settings`.

*Tant qu'on y est : <Link to="/blog/keepass-overriding-url">KeePass - Overriding the URL field</Link> montre comment lancer une session PuTTY directement depuis une entrée KeePass, identifiants compris — et <Link to="/blog/windows-terminal-ssh-profile">Windows Terminal - Adding a SSH profile</Link> fait la même chose sans PuTTY du tout.*

<AlertBox variant="tip" title="Fatigué des soucis de sessions et de mots de passe avec Putty ?">
Si vous vous battez aussi avec un mot de passe stocké que vous avez oublié, voyez <Link to="/blog/winscp-retrieve-password">WinSCP - Retrieve a stored password</Link>. Ou mieux, passez à l'authentification par clé une fois pour toutes : <Link to="/blog/linux-ssh-scp">SSH - Launch a terminal on your session without having to authenticate yourself</Link>.
</AlertBox>
