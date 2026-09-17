---
slug: docker-volume
title: Partagez des données entre votre container Docker en cours d'exécution et votre ordinateur
date: 2023-11-03
description: Activez la persistance des données dans Docker ! Découvrez comment utiliser les volumes (-v) pour partager et gérer efficacement des fichiers entre votre machine hôte et vos containers en cours d'exécution.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
updates:
  - date: 2026-07-30
    note: "Updated example image from php:8.1.5-apache (EOL Nov 2024) to php:8.3-apache"
---
![Partagez des données entre votre container Docker en cours d'exécution et votre ordinateur](/img/v2/docker_tips.webp)

<TLDR>
Cet article explique les volumes Docker : sans `-v`, tout ce que le container écrit reste uniquement dans sa propre mémoire et disparaît quand le container est supprimé (pratique pour exécuter sans risque des scripts non fiables) ; ajouter `-v $(pwd):/var/www/html` synchronise dans les deux sens un dossier de l'host avec un dossier du container, et ajouter `-u ${UID}:${GID}` garantit que les fichiers créés dans le container vous appartiennent au lieu d'appartenir à `root`.
</TLDR>

> Si vous n'avez pas encore Docker, consultez d'abord mon article <Link to="/blog/install-docker">Install Docker and play with PHP</Link>.

Quand vous lancez Docker sans spécifier de volume, tout ce qui se passe pendant l'exécution se passe en mémoire. Autrement dit : si le script PHP que vous exécutez depuis Docker crée des dossiers ou des fichiers, ils ne seront pas créés sur votre disque. Ils seront créés exclusivement en mémoire.

<!-- truncate -->

## Ce que `-v` fait pour vous {#what--v-does-for-you}

<Vars port="81" name="step_1_2" labels={{ port: "Port de l'host", name: "Nom du container" }} />

Démarrez un container PHP + Apache en partageant votre dossier courant avec le dossier servi par Apache :

<Terminal typewriter>
$ docker run --detach --name %%name=step_1_2%% -p %%port=81%%:80 -v $(pwd):/var/www/html php:8.3-apache
</Terminal>

Créez maintenant un fichier `index.php` dans ce dossier. Sur votre disque, dans votre éditeur, pas dans le container :

<Snippet filename="index.php" source="./files/index.php" />

Rendez-vous sur <Code>http://127.0.0.1:<Var name="port">81</Var>/</Code> et le container le sert déjà :

<BrowserWindow url="http://127.0.0.1:%%port=81%%/">
  ![Hello world!](./images/hello_world.webp)
</BrowserWindow>

Pas de copie, pas de rebuild, pas de `docker cp`. Vous avez enregistré un fichier et le container l'a vu.

## Pourquoi ça marche {#why-it-works}

- Sans `-v`, tout ce que le container écrit ne vit qu'en mémoire : supprimez le container et c'est perdu. C'est le comportement par défaut, et c'est une fonctionnalité (voir *Sous le capot* plus bas).
- Avec `-v`, le partage est **bi-directionnel** : votre éditeur écrit un fichier, le container le voit ; le script PHP écrit un fichier dans `/var/www/html`, il apparaît sur votre disque.
- Le flag `-u` décide *à qui appartiennent* les fichiers que le container crée sur votre disque. Oubliez-le et vous récupérerez des fichiers appartenant à `root` dans votre propre projet.

## À vous de jouer {#doing-it-yourself}

Pour cet article, créons un dossier temporaire dans votre dossier `/tmp` : démarrez une console Linux et exécutez `mkdir /tmp/docker-volume && cd /tmp/docker-volume`, puis lancez la commande `docker run` montrée plus haut.

<AlertBox variant="info">
Si vous utilisez Windows (MS DOS), remplacez `$(pwd)` par `%CD%` dans l'instruction ci-dessus.

</AlertBox>

Explication des arguments utilisés dans cette commande :

- `--name` <Var name="name">step_1_2</Var> : pour plus de clarté, nous utilisons un autre nom,
- <Code>-p <Var name="port">81</Var>:80</Code> : cette fois, nous utilisons le port <Var name="port">81</Var> sur notre ordinateur et nous le mappons sur le port `80` du container,
- `-v $(pwd):/var/www/html` : l'instruction `-v` sert à définir un volume. Ici, nous synchronisons le dossier `/var/www/html` du container avec `$(pwd)` (ou `${PWD}` en notation Linux), qui correspond au dossier courant sur notre ordinateur.

Pour créer le fichier `index.php`, si vous avez Visual Studio Code sur votre machine, exécutez ceci dans la console Linux : `cd /tmp/docker-volume && code index.php`. Cela démarre vscode et vous pourrez créer le script.

## Le même container, avant que le fichier existe {#the-same-container-before-the-file-existed}

Si vous vous rendez sur <Code>http://127.0.0.1:<Var name="port">81</Var>/</Code> *avant* de créer `index.php`, vous obtenez plutôt ceci :

<BrowserWindow url="http://127.0.0.1:%%port=81%%/">
  ![Localhost est interdit](./images/localhost_is_forbidden.webp)
</BrowserWindow>

Comme vous le savez probablement, Apache affiche par défaut le contenu du dossier `/var/www/html`. Et, à ce moment-là, nous n'avons pas de fichier `index.php` dans notre container, donc nous obtenons la page **Forbidden**. Même container, même commande ; la seule chose qui a changé entre cette capture et la précédente, c'est un fichier que vous avez enregistré sur votre propre disque.

*Ce que nous avons utilisé ici est un **bind mount** : un de vos dossiers, monté dans le container. Docker propose aussi des volumes *gérés*, qu'il stocke lui-même quelque part en dehors de votre projet ; <Link to="/blog/docker-volumes">Using volumes with Docker, use cases</Link> compare les deux et explique quand préférer l'un à l'autre.*

## Sous le capot (passez cette section si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

<AlertBox variant="note">
Imaginez que vous vouliez jouer avec un script PHP malveillant. Exécuter le script *sur* votre ordinateur est vraiment dangereux puisque vous ne savez pas ce que le virus va faire ; où il va créer des fichiers. Mais si vous exécutez le script du virus dans un container Docker **sans volume attaché** (ce qui est le comportement par défaut), rien sur votre ordinateur ne sera modifié. Tout reste en mémoire (RAM). En supprimant le container Docker, tout sera supprimé. C'est une excellente fonctionnalité de sécurité.

</AlertBox>

Passons maintenant à la question de la propriété des fichiers :

<AlertBox variant="caution">
Les fichiers ou dossiers créés dans le container Docker appartiendront à l'utilisateur courant utilisé dans le container ; le plus souvent l'utilisateur `root`. Ces fichiers/dossiers seront donc aussi créés / mis à jour par l'utilisateur `root` sur votre disque.

</AlertBox>

Pour être sûr que les fichiers/dossiers créés dans le container vous appartiennent et n'appartiennent pas à `root`, modifiez la ligne de commande comme ceci :

<Terminal typewriter>
{`$ docker run --detach --name %%name=step_1_2%% -p %%port=81%%:80 -v $(pwd):/var/www/html -u \${UID}:\${GID} php:8.3-apache`}
</Terminal>

Le nouveau flag `-u ${UID}:${GID}` réutilise votre id utilisateur et votre id de groupe courants et transmet cette information à Docker. Désormais, l'utilisateur courant dans le container Docker ne sera plus `root` mais un utilisateur avec vos uid/gid locaux. Les fichiers/dossiers créés dans le container Docker vous appartiendront donc, sur votre disque.

## Conclusion {#conclusion}

Un seul flag, `-v host_folder:container_folder`, et votre éditeur devient l'éditeur du container. Les deux choses à retenir dans trois mois : la synchronisation va dans les deux sens, et `-u ${UID}:${GID}` est ce qui empêche `root` de s'approprier vos fichiers.

Un bind mount n'est qu'un des deux types de volume proposés par Docker. Quand les données appartiennent au container plutôt qu'à vous (une base de données, un cache), un volume géré est le bon outil : <Link to="/blog/docker-volumes">Using volumes with Docker, use cases</Link> passe en revue les trois stratégies.
