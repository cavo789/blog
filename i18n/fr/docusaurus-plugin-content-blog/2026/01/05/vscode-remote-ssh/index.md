---
slug: vscode-remote-ssh
title: Développement distant en SSH avec VSCode
authors: [christophe]
mainTag: ssh
tags:
  - self-hosted
  - ssh
  - vscode
image: /img/v2/vscode_ssh_dev.webp
series: SSH - From your first key to remote development
description: "Utilisez VS Code Remote - SSH : connectez-vous à vos serveurs de production, éditez et exécutez à distance en évitant les pièges classiques."
date: 2026-01-05
blueskyRecordKey: 3mbnw2vy6as2l
updates:
  - date: 2026-01-11
    note: Adding extra note about SSH key pair security.
---
![Développement distant en SSH avec VSCode](/img/v2/vscode_ssh_dev.webp)

<TLDR>
Cet article montre comment utiliser l'extension Remote - SSH de VS Code pour développer directement sur un serveur distant. Il détaille la mise en place des connexions, d'une simulation locale avec Docker jusqu'à un environnement de production, pour contourner les restrictions réseau et éviter les transferts de fichiers manuels. Résultat : édition et exécution de commandes directement sur l'host distant, avec toute la puissance de VS Code.
</TLDR>

Dans cet article, nous allons voir comment développer directement sur un serveur distant avec VS Code, en éditant les fichiers stockés sur le serveur sans garder de copie locale ni faire d'upload manuel.

Mon cas d'usage était simple : je devais exécuter un script Python sur un serveur Linux qui pouvait accéder à <Link to="/blog/docker-oracle-database-server">une base de données Oracle</Link>. Mais mon environnement de développement local (mon ordinateur ou une VM Windows) ne pouvait pas joindre la base à cause de restrictions réseau.

*Trois articles liés : <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link> pour mettre en place la connexion par clé, sans mot de passe, sur laquelle repose cette extension ; <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers</Link> pour l'approche inverse — amener l'environnement du serveur sur votre machine plutôt que le contraire ; et <Link to="/blog/vscode-remote-ssh-proxyjump-devcontainer">Ouvrir un DevContainer sur un serveur distant avec VSCode Remote SSH</Link> pour l'étape suivante — ouvrir un devcontainer sur l'host distant afin d'atteindre des services inaccessibles depuis votre machine locale.*

<!-- truncate -->

<QuickJump
  links={[
    { label: "Le résultat en action", to: "#the-result" },
    { label: "Installation — simuler un serveur en local avec Docker", to: "#installation--simulate-a-server-locally-with-docker" },
  ]}
/>

## Le résultat {#the-result}

Une fois l'extension Remote - SSH connectée (on voit ça plus bas), VS Code édite les fichiers et exécute les commandes directement sur l'host distant — pas d'upload, pas de copie locale :

![Travailler sur le serveur de production](./images/vscode_ssh_planethoster.webp)

## Pourquoi ça fonctionne {#why-it-works}

- Aucun transfert de fichier manuel — l'éditeur lit et écrit directement sur le système de fichiers distant.
- Le terminal intégré tourne sur l'host distant lui-même, exactement comme si vous étiez connecté en SSH.
- Un seul outil pour éditer et exécuter — plus besoin d'une session SSH d'un côté et d'un client SFTP de l'autre.

Entrons dans le vif du sujet : le développement distant avec VS Code et SSH.

## Installation — simuler un serveur en local avec Docker {#installation--simulate-a-server-locally-with-docker}

On va d'abord simuler un serveur en local avec Docker, histoire d'apprendre le workflow sans risque. Ensuite, on refera les mêmes étapes sur un vrai serveur de production.

Créons un container Docker qui jouera le rôle de serveur SSH Linux, pour s'entraîner à s'y connecter depuis VS Code.

### Créer le container Docker qui servira de serveur SSH {#create-the-docker-container-that-will-act-as-our-ssh-server}

Créez un `Dockerfile` avec le contenu ci-dessous.

<ProjectSetup folderName="/tmp/remote-ssh" createFolder={true} >
  <Guideline>
    Now, please run 'docker build -t ssh-server .' to build the Docker image then 'docker run -d -p 2222:22 --name remote-dev ssh-server' to create the container.
  </Guideline>
  <Snippet filename="Dockerfile" source="./files/Dockerfile" />
</ProjectSetup>

<Vars port="2222" name="remote-dev" labels={{ port: "Port de l'host", name: "Nom du container" }} />

Ensuite, il faut construire l'image Docker et créer le container. Pour le build, lancez `docker build -t ssh-server .`. Puis créez le container avec <Code>docker run -d -p <Var name="port">2222</Var>:22 --name <Var name="name">remote-dev</Var> ssh-server</Code>.

<Terminal typewriter>
$ docker build -t ssh-server .

$ docker run -d -p %%port=2222%%:22 --name %%name=remote-dev%% ssh-server
</Terminal>

Le container joue le rôle de serveur SSH et (pour cette démo) crée un utilisateur `christophe` avec le mot de passe `p@ssword`.

#### Tester notre container {#test-our-container}

Testez le container en acceptant l'empreinte de l'host et en saisissant le mot de passe (`p@ssword`) quand il est demandé.

<Terminal typewriter source="./files/terminal-1.txt" />

Une fois connecté, lancez des commandes comme `ls -alh`, `hostname` ou `whoami`.

![Jouer avec le terminal SSH](./images/ssh_terminal.webp)

<AlertBox variant="info" title="Tapez `exit` pour quitter le terminal et revenir sur votre host." />

Ce test rapide montre que le container fonctionne et qu'on peut s'y connecter en SSH.

## Autres démos {#more-demos}

### L'extension Remote - SSH {#the-remote---ssh-extension}

Notre objectif : démarrer VS Code et éditer des fichiers directement sur le serveur.

Pour ça, il faut installer l'extension [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) de Microsoft.

![Installer l'extension Remote - SSH](./images/installing_remote_ssh_extension.webp)

Une fois installée, un nouveau bouton apparaît sur la gauche : **Remote Explorer**. Cliquez dessus et, dans le nouveau panneau, sélectionnez `Remotes (Tunnels/SSH)` dans la liste déroulante. (Si vous ne le voyez pas, vérifiez que l'extension est bien installée.)

![Remotes (Tunnels/SSH)](./images/remote_tunnels.webp)

Cliquez sur le bouton `+` pour créer une nouvelle connexion :

![Ajouter une nouvelle connexion](./images/add_new_connection.webp)

VS Code vous demande alors la chaîne de connexion SSH.

Dans notre exemple, ce sera <Code>ssh christophe@localhost -p <Var name="port">2222</Var></Code> parce que :

-   L'utilisateur défini dans notre `Dockerfile` est `christophe`,
-   Notre serveur est `localhost` (puisqu'il s'agit d'un container Docker qui tourne sur notre machine), et
-   Le port à utiliser est <Var name="port">2222</Var> (celui qu'on a indiqué dans la commande `docker run`).

VS Code vous demandera ensuite quel fichier de configuration SSH mettre à jour.

<AlertBox variant="important" title="Utilisateurs WSL2 & Windows">
Si vous utilisez WSL2, sachez que VS Code tournant sous Windows ne lit pas forcément votre fichier Linux `~/.ssh/config`. Recopiez les entrées nécessaires dans votre configuration SSH Windows (généralement `C:\Users\<you>\.ssh\config`) et copiez aussi vos clés SSH (publique et privée) pour que VS Code puisse les utiliser.

Vérifiez également que les fichiers de clés SSH sont accessibles au client que vous utilisez.
</AlertBox>

VS Code va créer ou mettre à jour le fichier de configuration SSH choisi et afficher quelque chose comme ceci :

![Le fichier de configuration SSH](./images/ssh_config_file.webp)

Maintenant, si vous cliquez sur la cible **SSH** dans le panneau de gauche, vous verrez le serveur <Var name="name">remote-dev</Var> avec une icône de connexion à côté :

![Le serveur apparaît sous SSH](./images/ssh_unfolded.webp)

Sélectionnez le type d'OS distant (Linux), authentifiez-vous, puis ouvrez le dossier home de l'utilisateur. Vous pouvez créer des fichiers (par exemple `hello.sh`), les rendre exécutables et les lancer depuis le terminal intégré. Un `hostname` affiche le nom d'host du container (pas celui de votre machine locale).

<AlertBox variant="note" title="Le hostname correspond à l'ID du container Docker" />

Pour bien voir la différence, quittez VS Code, retournez dans votre terminal et lancez <Code>ssh christophe@localhost -p <Var name="port">2222</Var></Code>.

On retrouve bien notre fichier `hello.sh` :

![Vérification du script Bash hello.sh](./images/ssh_check.webp)

<AlertBox variant="info" title="Ce qu'on vient de démontrer">

Nous avons utilisé un container Docker local comme serveur SSH pour simuler du développement distant. L'éditeur modifie les fichiers sur l'host distant et le terminal intégré y exécute les commandes — un workflow fluide pour développer et débugger.

</AlertBox>

### On refait la même chose sur un vrai serveur de production {#repeat-on-a-real-production-server}

D'abord, assurez-vous que votre configuration SSH et vos clés sont en place pour vous connecter au serveur de production.

J'ai expliqué comment créer une connexion SSH vers un serveur d'hébergement (PlanetHoster, dans mon cas) dans cet article : <Link to="/blog/connect-using-ssh-to-your-hosting-server">How to connect to your hosting server using SSH</Link>.

Si vous avez suivi ce guide, vous devriez pouvoir vous connecter à votre serveur de production avec des clés SSH et un alias configuré dans `~/.ssh/config` (par exemple `planethoster`).

<AlertBox variant="important" title="Parce que je travaille sous WSL2">
Un point important dans ma situation : je travaille sous WSL2, donc mon fichier Linux `~/.ssh/config` **n'est pas utilisé** par VS Code (qui tourne sous Windows). J'ai dû copier la configuration dans mon fichier Windows `C:\Users\Christophe\.ssh\config`. Dans mon cas, j'ai simplement ouvert Notepad et copié les lignes dont j'avais besoin.

J'ai aussi dû copier mes clés (publique et privée) de Linux vers Windows.

![Fichier de configuration SSH Windows](./images/powershell.webp)

Voici le contenu de ma configuration SSH sous Windows :

<Snippet filename="C:\Users\Christophe\.ssh\config" source="./files/windows_config" />

</AlertBox>

Dans VS Code, ouvrez le panneau **Remote Explorer** et choisissez `Remotes (Tunnels/SSH)`. Sélectionnez l'host configuré (par exemple `planethoster`) et cliquez sur l'icône de connexion. Choisissez l'OS (Linux) et le dossier à ouvrir (généralement le home de l'utilisateur). Une fois connecté, vos modifications et vos commandes dans le terminal agissent directement sur l'host distant — aucun upload nécessaire.

![La liste déroulante du Remote Explorer](./images/remote_explorer_dropdown.webp)

![Connexion Planethoster](./images/vscode_remote_planethoster.webp)

![Connexion à Planethoster en cours](./images/vscode_connecting_planethoster.webp)

Vous êtes maintenant connecté à votre serveur de production via VS Code et l'extension Remote - SSH — exactement le résultat montré en début d'article. Si vous modifiez des fichiers, vous modifiez directement ceux du serveur. Plus rien à uploader.

<AlertBox variant="caution" title="Prudence en production">
Éditer des fichiers directement sur un serveur de production est risqué : une erreur peut provoquer une indisponibilité ou une perte de données. Privilégiez l'authentification par clé SSH, testez vos changements sur un environnement de staging, gardez des backups et réservez les opérations risquées aux fenêtres de maintenance.
</AlertBox>

## Sous le capot (à sauter si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

<Details label="Bonus - Un mot sur les paires de clés SSH">

Voyez ça comme des mots de passe. Vous pourriez utiliser le même mot de passe pour plusieurs services, mais s'il est compromis, tous vos services sont en danger. Tout le monde sait ça, non ?

C'est pareil pour les clés SSH. Si vous utilisez la même paire de clés pour plusieurs serveurs et qu'elle est compromise, tous ces serveurs sont en danger.

Quand vous lancez une commande comme `ssh-keygen -t ed25519 -C "john_doe" -f ~/.ssh/id_ed25519`, `john_doe` n'est qu'un libellé pour vous aider à identifier la clé plus tard. Ça n'ajoute aucune sécurité. Ce n'est pas le nom d'utilisateur pour se connecter au serveur, c'est juste un commentaire.

Vous pouvez tout à fait faire `ssh-keygen -t ed25519 -C "this is my super SSH key for all servers" -f ~/.ssh/id_ed25519` puis réutiliser cette clé sur plusieurs serveurs. Mais si elle est compromise, tous ces serveurs sont en danger.

Pour cette raison, je conseille de créer une paire de clés SSH dédiée par serveur. Comme ça, si une clé est compromise, seul le serveur concerné est exposé.

</Details>

## Conclusion {#conclusion}

L'extension [Remote - SSH](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-ssh) de VS Code vous permet de développer directement sur des hosts distants avec toute la puissance de votre éditeur et de vos outils locaux. Combinée à un workflow sûr (tests en local, clés SSH, bonnes pratiques de sécurité évoquées plus haut), c'est une option très efficace quand des contraintes réseau empêchent le développement en local.

Les commandes lancées dans le terminal intégré de VS Code s'exécutent sur l'host distant, comme si vous y étiez connecté en SSH.

En début d'article, je disais ne pas pouvoir joindre une base de données depuis mon ordinateur à cause de restrictions réseau. Avec l'extension Remote - SSH, se connecter au serveur depuis l'éditeur devient possible, et plutôt simple.
