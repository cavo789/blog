---
slug: docker-out-of-docker-dood
title: Docker-out-of-Docker aka DooD
date: 2024-12-20
description: Maîtrisez Docker-out-of-Docker (DooD) pour lancer des commandes Docker depuis un container. Un guide pratique couvrant la mise en place pour root et pour un utilisateur non privilégié via le montage du socket Docker.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
updates:
  - date: 2026-08-09
    note: "Restructured for time-to-value: the proof that DooD works now comes before the setup steps."
  - date: 2025-08-03
    note: Corrections based on Metin Y.
---
<!-- cspell:ignore phplint,dind,dood,groupid,johndoe,addgroup,adduser,getent,metin,meyay -->

![Docker-out-of-Docker aka DooD](/img/v2/docker_tips.webp)

<TLDR>
Cet article montre la technique Docker-out-of-Docker (DooD) — lancer des commandes Docker depuis l'intérieur d'un container en montant le `/var/run/docker.sock` de l'host — d'abord en tant que root (simple), puis avec un utilisateur non privilégié, ce qui exige en plus d'ajouter l'utilisateur du container à un groupe `docker` dont l'ID correspond à celui du groupe `docker` de l'host, via `group_add` dans `compose.yaml`.
</TLDR>

Dans des situations très exceptionnelles, vous pourriez avoir besoin de lancer des commandes Docker depuis un container Docker. Attendez ? Quoi ?

Imaginez la situation suivante : vous faites tourner un container PHP, tout va bien, et vous voulez lancer un outil de qualité de code comme, commençons simple, `phplint` (<Link to="/blog/php-jakzal-phpqa/#php-parallel-lint">voir cet article pour plus de détails</Link>). Vous ne voulez pas installer phplint parce que vous connaissez une image Docker très pratique qui le contient déjà (pensez à **[jakzal/phpqa](https://hub.docker.com/r/jakzal/phpqa)**).

Donc, vous êtes dans un container et vous voulez lancer un autre container.

Autre exemple : vous êtes toujours dans un container et vous voulez accéder à la liste des containers qui tournent, aux images Docker déjà installées, aux volumes, ... (pensez à [portainer](https://www.portainer.io/))

Voyons dans cet article comment créer votre propre image Docker, tournant en root ou pas, et la configurer pour autoriser les requêtes Docker.

*L'usage réel le plus courant de cette technique est un pipeline CI dont le job doit lancer `docker run` ; c'est le sujet de <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link>.*

Nous allons utiliser la technique **Docker-out-of-Docker, aussi appelée `DooD`** : monter le socket Docker de l'host (`/var/run/docker.sock`) et lancer le CLI Docker dans le container.

<!-- truncate -->

## Le résultat : des commandes Docker lancées depuis un container {#the-result-docker-commands-run-from-inside-a-container}

Une fois le socket Docker de l'host monté dans un container, les commandes `docker` lancées depuis celui-ci atteignent directement le daemon de l'host — aucune installation Docker-in-Docker nécessaire :

![Docker version](./images/version.webp)

`docker image list` fonctionne aussi, depuis le container, et liste chaque image déjà présente sur l'host. La suite de cet article construit le `Dockerfile` et le `compose.yaml` qui rendent cela possible, puis montre la même astuce avec un utilisateur non-root.

## Pourquoi ça marche {#why-it-works}

- Le container ne fait jamais tourner son propre daemon Docker — il parle uniquement à celui qui tourne déjà sur l'host, via le `/var/run/docker.sock` partagé.
- Ce socket n'est qu'un fichier Unix : le monter dans le container suffit, pas besoin de mode privilégié ni d'une installation complète Docker-in-Docker.
- N'importe quel CLI Docker installé dans le container devient un client du daemon de l'host — `docker version`, `docker ps`, `docker image list` fonctionnent tous dès que le socket est là.

## Installation {#installation}

Comme toujours, nous allons construire un exemple pleinement fonctionnel.

Créez un dossier bidon et placez-vous dedans : `mkdir /tmp/dood && cd $_`.

Il nous faut un `Dockerfile`, créons-le.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Nous allons aussi utiliser un `compose.yaml`, créez ce fichier également :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Nous allons créer notre image Docker et un container avec cette seule commande : `docker compose up --detach --build`.

Et maintenant, entrons dans le container en lançant : `docker compose exec dood /bin/sh`.

En lançant `docker version` dans le container, vous obtenez la sortie montrée plus haut. Pour vérifier maintenant si vous pouvez accéder à la liste des images installées sur votre host (ce qui est en théorie impossible), lancez `docker image list` et ... ça marche.

### Docker-out-of-Docker (DooD) est activé ; cool, mais pourquoi ? {#docker-out-of-docker-dood-is-enabled-cool-but-why}

Pour comprendre *pourquoi*, rouvrez votre fichier `compose.yaml` et mettez l'entrée `volumes` en commentaire comme illustré ci-dessous :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Si vous êtes encore dans le container, tapez `exit` pour revenir à la console de votre host.

De là, reconstruisez l'image et le container en relançant `docker compose up --detach --build && docker compose exec dood /bin/sh`.

Une fois dans la console du container, tapez à nouveau `docker version` et boum.

<Terminal typewriter source="./files/terminal-1.txt" />

Ça ne marche plus.

<AlertBox variant="highlyImportant" title="DooD doit pouvoir accéder au daemon Docker">
Comme vous le voyez, vous devez partager votre socket Docker (c.-à-d. le fichier appelé `/var/run/docker.sock` sur votre host) avec le container.
</AlertBox>

Tapez `exit` à nouveau, quittez le container, remettez le fichier `compose.yaml` comme avant (retirez les lignes commentées) et relancez `docker compose up --detach --build && docker compose exec dood /bin/sh`.

De retour dans la console du container, vous pouvez donc lancer des commandes comme `docker ps` pour obtenir la liste des containers qui tournent sur l'host et, par exemple, en arrêter certains (par ex. `docker container stop 68e41eee2efd` ; possible seulement si DooD est correctement configuré).

## Plus de démos : faire tourner le container avec un utilisateur non privilégié {#more-demos-running-the-container-as-an-unprivileged-user}

Ça fonctionnait sans trop de difficultés parce que nous étions root. Nous avons démarré le container en root. Tapez simplement `whoami` dans le container pour le vérifier. Vous pouvez aussi taper `id -u` pour voir que votre ID utilisateur est `0` (root).

Et vous le savez, faire tourner des containers en root est une mauvaise idée. Créons donc un utilisateur spécifique.

Pour cela, nous devons mettre à jour nos fichiers.

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

<Snippet filename="compose.yaml" source="./files/compose.part3.yaml" />

Maintenant, construisez cette nouvelle image et entrez dans le container avec, toujours la même, cette commande : `docker compose up --detach --build && docker compose exec dood /bin/sh`.

En tapant `whoami`, on voit que nous ne sommes plus root mais `johndoe`, avec l'ID utilisateur 1000 (`id -u`) et l'ID de groupe 1000 (`id -g`).

Comme nous partageons toujours notre `/var/run/docker.sock` dans le fichier yaml, on s'attend à ce que Docker-out-of-Docker fonctionne encore ; non ?

Essayons : `docker ps` pour obtenir la liste des containers.

<Terminal typewriter>
$ docker ps
permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get "http://%2Fvar%2Frun%2Fdocker.sock/v1.51/containers/json": dial unix /var/run/docker.sock: connect: permission denied
</Terminal>

Tout semble correct mais ... pourquoi ?

Pour pouvoir utiliser DooD avec un utilisateur non privilégié, il faut faire attention à ceci : votre utilisateur doit être membre du groupe `docker` de l'host. Et `compose.yaml` offre un moyen simple de le faire.

Mettez à jour votre `compose.yaml` en ajoutant les deux lignes ci-dessous.

<Snippet filename="compose.yaml" source="./files/compose.part4.yaml" />

Entrez une fois encore dans le container : `docker compose up --detach --build && docker compose exec dood /bin/sh`

Et réessayez `docker ps` ; ça marche. Vous avez à nouveau accès à toutes les commandes Docker, comme `docker image list`.

## Sous le capot (passez ceci si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

<AlertBox variant="caution" title="Toujours pas fonctionnel ?">
Ça devrait marcher. Si ce n'est pas le cas, assurez-vous d'avoir la dernière version de Docker (celle que j'ai utilisée pour ce tutoriel est Docker Desktop v4.42.1).

Dans votre container, lancez `ls -alh /var/run/docker.sock` pour regarder les permissions du socket Docker à l'intérieur du container. Vous verrez que le fichier appartient à l'utilisateur `root` **MAIS NE DEVRAIT PAS** appartenir à `root`. Si vous voyez `root` pour l'utilisateur et pour le groupe, vous avez trouvé pourquoi ça ne marchait pas. Votre utilisateur non privilégié n'est pas membre du groupe `root`, mais il est bien membre du groupe `docker` (celui dont l'ID de groupe est `1001`).

En lançant `ls -alh /var/run/docker.sock`, vous devriez voir `1001` (ou `docker`) pour le groupe.

</AlertBox>

### C'est quoi ce groupe 1001 ? {#what-is-this-group-1001}

Comme dit plus haut, pour pouvoir utiliser DooD avec un utilisateur non privilégié, vous devez être membre du groupe `docker` de l'host (pas du groupe `docker` que vous trouvez dans le container).

Une façon de récupérer cet ID est de lancer `getent group docker | cut -d: -f3`. Vous verrez très probablement `1001` puisque c'est l'ID standard de ce groupe.

<AlertBox variant="note">
Comme vous l'avez vu, je n'ai pas codé l'ID en dur dans le fichier yaml proposé : j'ai défini une variable système appelée `DOCKER_GROUPID` et, si cette variable n'existe pas, j'utilise la valeur `1001`.

</AlertBox>

Donc, pour rendre le script robuste, il suffit d'initialiser la variable `DOCKER_GROUPID` avant de construire l'image :

<Terminal typewriter>
$ DOCKER_GROUPID="$(getent group docker | cut -d: -f3)" docker compose up --detach --build && docker compose exec dood /bin/sh
</Terminal>

### Les limites de sécurité de DooD {#doods-security-limits}

Monter `/var/run/docker.sock` est pratique, mais soyez honnête avec vous-même sur ce que cela accorde : tout processus capable d'atteindre ce socket peut demander au daemon de l'host de démarrer un nouveau container avec presque n'importe quel montage ou privilège, y compris un container qui monte le système de fichiers racine de l'host. En pratique, un accès DooD équivaut à un accès root sur l'host, appartenance à un groupe ou non. Réservez-le à des contextes de confiance (votre propre machine de dev, un runner CI que vous contrôlez) — ne l'exposez jamais à un container qui exécute du code tiers ou non fiable.

## Conclusion {#conclusion}

Utiliser Docker-out-of-Docker dans un container qui tourne en root est assez simple — il suffit d'installer `docker` lors du build de l'image et de monter votre socket Docker.

C'est moins simple avec un utilisateur non privilégié, mais ça devient facile une fois la bonne méthode trouvée : utiliser la propriété `group_add` et récupérer l'ID du groupe `docker` local.

<AlertBox variant="note">
N'essayez pas `group_add` avec `docker` (le nom du groupe) au lieu de l'ID ; ça ne marchera pas.

</AlertBox>

L'endroit où cette technique est la plus utile est un runner CI : voir <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link> pour la configuration spécifique à GitLab. Pour un usage quotidien du même montage de socket, <Link to="/blog/lazydocker">lazydocker dans un container</Link> met un tableau de bord live de tous les containers de l'host à une commande de distance.

## Remerciements 🙏 {#special-thanks-}

Merci à Metin Y. ([meyay](https://forums.docker.com/u/meyay/summary)) qui m'a signalé une erreur dans la terminologie que j'utilisais. Dans ma première version, je parlais de la technique décrite ici comme *Docker-in-Docker (dind)* ; c'était incorrect.

En montant le socket Docker de l'host (`/var/run/docker.sock`), il s'agit bien de la technique **Docker-out-of-Docker**.
