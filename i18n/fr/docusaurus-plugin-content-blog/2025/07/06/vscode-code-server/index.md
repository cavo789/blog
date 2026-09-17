---
slug: vscode-code-server
title: Ai-je besoin de VSCode sur ma machine pour l'utiliser ?
date: 2025-07-06
description: Découvrez comment lancer VSCode dans votre navigateur avec Docker et l'image `code-server`. Éditez votre code à distance sans installer VSCode sur votre machine locale.
authors: [christophe]
image: /img/v2/vscode_tips.webp
series: VSCode - Tips, extensions and shortcuts
mainTag: vscode
tags:
  - docker
  - vscode
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lujtglddu223
---
![Ai-je besoin de VSCode sur ma machine pour l'utiliser ?](/img/v2/vscode_tips.webp)

<!-- cspell:ignore codercom -->

<TLDR>
Cet article vous montre comment faire tourner un environnement VS Code complet directement dans votre navigateur, avec l'image Docker `code-server`. C'est la solution parfaite si vous devez coder sur une machine où VS Code n'est pas installé. Le guide fournit une seule commande `docker run` et détaille chaque flag : comment monter votre projet, conserver la configuration et éviter les problèmes de permissions de fichiers en mappant votre utilisateur local. Vous apprendrez où trouver le mot de passe généré automatiquement et à démarrer avec votre éditeur dans le navigateur en quelques minutes.
</TLDR>

Un jour, peut-être, nous n'aurons plus besoin d'installer un système d'exploitation : juste Docker sur notre machine. Bon, ce ne sera pas pour demain, mais en ce qui concerne VSCode, oui, c'est déjà possible.

Vous avez bien lu : il existe une image Docker qui n'est rien d'autre que VSCode dans un navigateur.

C'est inutile si vous êtes un gros utilisateur de VSCode (= vous l'avez installé sur chacun de vos ordinateurs), mais il y a des situations où, par exemple, vous devez travailler sur un autre ordinateur (le vôtre est en réparation ou vous êtes en déplacement sans votre machine) et là, l'image Docker de VSCode sera bien pratique.

*Une troisième option, quand vous avez bien VSCode en local mais que le code se trouve ailleurs : <Link to="/blog/vscode-remote-ssh">SSH Remote development with VSCode</Link>.*

Ou alors... vous n'êtes pas encore convaincu par VSCode et vous voulez juste l'essayer.

Si tout ce dont vous avez besoin est d'éditer un fichier ou deux dans un repository GitHub, il existe une option encore plus légère qui ne nécessite pas Docker du tout : voyez <Link to="/blog/vscode-github-dev">Start vscode from github.com</Link>.

<!-- truncate -->

Une commande `docker run codercom/code-server`, et voici le résultat : un VS Code complet, dans votre navigateur.

![VScode dans le navigateur](./images/code_server.webp)

## Pourquoi ça fonctionne {#why-it-works}

- Aucune installation locale de VS Code nécessaire — l'éditeur tourne dans le container, votre navigateur ne sert que d'affichage.
- La configuration est stockée sur votre host (`~/.config/`), pas dans le projet : elle survit aux containers et est partagée si vous lancez code-server pour plusieurs projets.
- L'utilisateur du container est mappé sur le vôtre (`-u "$(id -u):$(id -g)"`), donc les fichiers créés ou modifiés depuis le navigateur conservent vos permissions habituelles — pas de fichiers appartenant à `root` à nettoyer ensuite.

## Installation {#installation}

<Vars port="8080" name="code-server" labels={{ port: "Port de l'host", name: "Nom du container" }} />

En exécutant l'instruction ci-dessous, vous allez télécharger (une seule fois) l'image Docker `codercom/code-server` puis lancer un container en tant que daemon.

<Terminal typewriter source="./files/terminal-2.txt" />

Une fois la commande passée avec succès, ouvrez simplement votre navigateur et rendez-vous sur `http://127.0.0.1:`<Var name="port">8080</Var> pour démarrer VSCode dans le navigateur.

<AlertBox variant="info" title="Le `docker run` expliqué">
* `-d` : le code-server tournera comme un service daemon,
* <Code>-p <Var name="port">8080</Var>:8080</Code> : on expose le service sur notre port <Var name="port">8080</Var>,
* `--name` : c'est juste pour donner un nom parlant à notre container (optionnel),
* `-v "${HOME}/.config:/home/coder/.config"` : sauvegarde la configuration de code-server sur votre host, dans votre répertoire personnel.
* `-v ".:/home/coder/project"` : monte votre répertoire courant dans le container pour que vous puissiez y travailler dans code-server,
* `-u "$(id -u):$(id -g)"` : mappe l'utilisateur utilisé dans le container avec l'utilisateur local, ainsi les fichiers/dossiers créés/modifiés dans le container auront exactement les mêmes permissions et
* `-e "DOCKER_USER=${USER}"` : si vous exécutez `echo ${USER}` sur votre host, vous verrez apparaître votre nom Linux (`christophe` pour moi) ; ici, il s'agit donc juste d'informer le container de votre nom.

</AlertBox>

La configuration de code-server est donc stockée dans votre répertoire personnel, dans le dossier `~/.config/`. Ainsi, les fichiers de configuration ne font pas partie de votre projet courant et la configuration sera la même si vous lancez code-server à plusieurs endroits, pour différents projets.

## Récupérer le mot de passe {#getting-the-password}

En ouvrant <Code>http://127.0.0.1:<Var name="port">8080</Var></Code>, vous obtiendrez cet écran :

<BrowserWindow url="http://127.0.0.1:%%port=8080%%">
  ![Demande de mot de passe](./images/prompt_for_password.webp)
</BrowserWindow>

Retournez dans votre console et exécutez `cat ${HOME}/.config/code-server/config.yaml` pour découvrir la configuration de code-server. Vous verrez quelque chose comme ceci :

<Terminal typewriter source="./files/terminal-1.txt" />

Copiez/collez le mot de passe dans le formulaire, validez et tadaaa — le même VS Code dans le navigateur que celui déjà montré en haut de cet article.

## Conclusion {#conclusion}

Une image Docker, une commande `docker run`, et un VS Code complet est disponible depuis n'importe quel navigateur — pas d'installation locale, pas de configuration perdue, pas de casse-tête de permissions sur les fichiers que vous éditez. Poursuivez avec la documentation officielle : [https://github.com/coder/code-server](https://github.com/coder/code-server) ou [https://coder.com/docs/code-server/guide](https://coder.com/docs/code-server/guide) pour plus d'informations.
