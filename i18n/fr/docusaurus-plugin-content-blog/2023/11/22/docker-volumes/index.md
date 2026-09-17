---
slug: docker-volumes
title: Utiliser les volumes avec Docker, cas d'usage
date: 2023-11-22
description: Maîtrisez les volumes Docker pour ne plus perdre vos données ! Volumes gérés par Docker, volumes montés et cas d'usage concrets pour la persistance des données de vos containers.
authors: [christophe]
image: /img/v2/docker_concepts.webp
mainTag: docker
tags:
  - docker
  - wsl
language: fr
review_date: 2026-07-30
---
![Utiliser les volumes avec Docker, cas d'usage](/img/v2/docker_concepts.webp)

<TLDR>
Cet article illustre la persistance des données avec Docker à l'aide d'un container tout simple qui compte ses exécutions : sans volume, les données repartent de zéro à chaque redémarrage ; avec un volume géré par Docker (déclaré dans `compose.yaml`), les données survivent aux redémarrages mais les fichiers sont stockés en dehors de votre projet (accessibles via Docker Desktop ou l'extension Docker de VSCode) ; et avec un volume monté (bind mount, `./data:/data`), les données sont synchronisées directement dans le dossier de votre projet, sur votre disque — avec une note sur l'usage de `user: 1000:1000` pour éviter les fichiers appartenant à `root`.
</TLDR>

Quand on travaille avec un container Docker, les données peuvent être persistantes ou non. Imaginez que vous créez un site web en local avec <Link to="/blog/docker-joomla-right-to-the-point">Joomla</Link>, <Link to="/blog/docker-wordpress">WordPress</Link> ou n'importe quel autre outil (Laravel, Symfony, etc.).

Vous avez créé parfaitement les différents fichiers Docker nécessaires pour faire tourner le site local, vous avez lancé la commande `docker compose up --detach` pour démarrer les containers et vous voilà en train d'installer le site. Après quelques instants, votre site local est en ligne et vous pouvez commencer à développer ses fonctionnalités.

Par défaut, si vous n'avez pris aucune précaution, au moment où vous arrêtez le container (`docker compose down`), vous tuez votre site. Autrement dit : n'ayant pas pris soin de sauvegarder vos données (votre site, votre base de données), tout sera perdu et remis à zéro au prochain `docker compose up --detach`. Bon... peut-être que c'était justement votre souhait (quelque chose de totalement éphémère) ; peut-être pas.

<!-- truncate -->

Cet article se concentre sur les différents types de volumes et sur le moment où utiliser chacun d'eux ; si vous voulez simplement faire entrer et sortir des fichiers d'un container en cours d'exécution, <Link to="/blog/docker-volume">Share data between your running Docker container and your computer</Link> traite ce cas plus précis.

## Ce que change un volume {#what-a-volume-changes}

<Vars name="counter" labels={{ name: "Nom du container" }} />

Pour illustrer la notion de persistance, nous allons travailler avec une image Docker qui fait une seule chose : compter le nombre de fois où elle a été exécutée. Appelons-la cinq fois :

<Terminal typewriter source="./files/terminal-8.txt" />

Maintenant, arrêtez et redémarrez le container avec `docker compose down ; docker compose up --detach`, puis appelez à nouveau le compteur :

<Terminal typewriter>
$ docker compose exec %%name=counter%% /counter.sh
You have executed this script 1 times.
</Terminal>

<AlertBox variant="caution" title="Nous avons perdu nos données">
Comme vous le voyez, nous avons perdu notre compteur. En arrêtant puis redémarrant le container, nos données ont disparu. Et c'est parfaitement normal, car c'est le concept intrinsèque d'un container Docker : il est éphémère. **Un container doit être jetable ; en le redémarrant, il est remis à zéro.**

</AlertBox>

Maintenant exactement le même scénario, après avoir ajouté trois lignes à `compose.yaml` pour déclarer un volume :

<Terminal typewriter source="./files/terminal-7.txt" />

Même `down`, même `up`, et le compteur reprend à 7 là où il s'était arrêté à 6. C'est tout le sujet de cet article.

## Pourquoi ça fonctionne {#why-it-works}

Il existe trois stratégies, et choisir entre elles est la vraie décision :

- **Aucun volume** (le comportement par défaut) : tout ce que le container écrit vit et meurt avec lui. Parfait pour un container avec lequel vous ne faites que jouer.
- **Un volume géré par Docker** : les données survivent au `down`/`up`, mais Docker les stocke *quelque part* en dehors de votre projet, et c'est à Docker de savoir où.
- **Un volume monté** (bind mount) : c'est vous qui décidez, les données arrivent dans un dossier de votre projet, sur votre disque, visible dans votre éditeur.

La démo ci-dessous parcourt les trois avec le même compteur.

## Mise en place de la démo {#setting-up-the-demo}

Pour l'illustration, démarrez un shell Linux et lancez `mkdir -p /tmp/counter && cd $_`.

Maintenant que vous êtes dans un dossier temporaire sur votre disque, créez un nouveau fichier appelé `Dockerfile` avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Créez aussi un fichier appelé `counter.sh` avec ce contenu :

<Snippet filename="counter.sh" source="./files/counter.sh" defaultOpen={false} />

Il ne reste plus qu'à créer l'image Docker avec `docker build -t demo/counter .`.

<Terminal typewriter>
$ docker image list
REPOSITORY     TAG       IMAGE ID       CREATED          SIZE
demo/counter   latest    89505911ec33   21 minutes ago   5.61MB
</Terminal>

<AlertBox variant="info" title="Impossible de faire plus petit">
Comme vous le voyez, notre image est vraiment minuscule. C'est l'avantage d'utiliser l'image Docker alpine.

</AlertBox>

Créez ensuite le fichier `compose.yaml`. C'est la première stratégie : aucun volume, d'où la remise à zéro du compteur vue plus haut.

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={false} />

Nous allons lancer notre container avec `docker compose up --detach` :

<Terminal typewriter source="./files/terminal-9.txt" />

On peut vérifier que le container tourne avec `docker container list` (sortie simplifiée) :

<Terminal typewriter>
$ docker container list

CONTAINER ID   IMAGE          STATUS          NAMES
6296459f7827   demo/counter   Up 30 seconds   %%name=counter%%
</Terminal>

`docker compose exec ` <Var name="name">counter</Var> ` /counter.sh` est la commande utilisée plus haut pour exécuter notre script.

## Volumes gérés par Docker {#volumes-managed-by-docker}

Mettez à jour le fichier `compose.yaml` comme ceci :

<Snippet filename="compose.yaml" source="./files/compose.volumes.yaml" />

Comme vous le voyez, on utilise un `volumes` (toujours au pluriel) et on dit que le dossier `/data` à l'intérieur du container doit être mappé vers un volume appelé `counter_data`. En bas du fichier `compose.yaml`, on déclare simplement notre volume. Voilà les trois lignes qui ont produit le compteur persistant montré en début d'article.

Redémarrons notre container : `docker compose down ; docker compose up --detach`.

Mais maintenant, nous devrions avoir un volume Docker appelé `counter_data` ; vérifions :

<Terminal typewriter>
$ docker volume list
DRIVER    VOLUME NAME
local     demo_counter_data
</Terminal>

Oui, il est bien là.

<AlertBox variant="info" title="Cette fois, notre compteur est bien persistant">
Comme vous le voyez, en lançant `down` puis `up`, nous avons conservé la valeur de notre compteur. Cette valeur est enregistrée dans un fichier désormais stocké dans un volume Docker. Tant que nous ne supprimons pas le volume, notre valeur est préservée.

</AlertBox>

C'est exactement le schéma que vous voulez pour les réglages propres d'un outil — un dossier de configuration qui doit survivre à un container lancé avec `--rm`. <Link to="/blog/lazydocker">Containerizing lazydocker</Link> utilise un volume géré par Docker de cette manière pour conserver la disposition de ses panneaux d'un projet à l'autre.

Vous pouvez supprimer le volume avec `docker volume rm demo_counter_data` mais :

<Terminal typewriter>
$ docker volume rm demo_counter_data
Error response from daemon: remove demo_counter_data: volume is in use - [b976c92eed6ed4e54f6ec75d652b8977bbbd86392e604216dd61d0c446e1fc0c]
</Terminal>

En effet, vous ne pouvez pas supprimer un volume s'il reste au moins un container qui l'utilise. Il faut donc lancer `docker compose down && docker volume rm demo_counter_data` ou, plus simple, `docker compose down --volumes`. Le flag `--volumes` demande de supprimer tous les volumes déclarés dans le fichier `compose.yaml`.

## Volumes montés {#mounted-volumes}

Un volume monté est synchronisé avec votre disque dur. Au lieu de laisser Docker tout gérer pour vous, c'est vous qui décidez où les fichiers doivent être stockés.

Faisons un peu de nettoyage tout de suite ; lancez `docker compose down --volumes` pour supprimer le volume utilisé au chapitre précédent et arrêter le container Docker.

Mettez à jour le fichier `compose.yaml` comme ceci :

<Snippet filename="compose.yaml" source="./files/compose.mounted_volumes.yaml" />

La syntaxe est maintenant légèrement différente : il n'y a plus d'entrée `volumes` en bas du fichier mais on a utilisé une notation relative comme `./data:/data`. Ainsi, le dossier local `./data` (sur votre disque dur) doit être synchronisé avec le dossier `/data` du container.

En lançant `docker compose up --detach && docker compose exec ` <Var name="name">counter</Var> ` /counter.sh`, on exécute notre compteur et on s'attend à voir `You have executed this script 1 times.` mais vous obtiendrez probablement une erreur :

<Terminal typewriter source="./files/terminal-5.txt" />

Nous devons créer notre dossier local `data` :

<Terminal typewriter source="./files/terminal-4.txt" />

Maintenant que nous avons notre dossier data, réessayons :

<Terminal typewriter source="./files/terminal-3.txt" />

Cette fois, le fichier `counter.txt` est présent dans notre répertoire :

<Terminal typewriter source="./files/terminal-2.txt" />

<AlertBox variant="caution" title="Aïe, le fichier appartient à `root` et pas à moi">
Oups ! Le fichier appartient à l'utilisateur root et pas à moi (l'utilisateur `christophe` dans mon cas). C'est embêtant puisque je ne peux ni l'éditer ni le supprimer sans passer par `sudo`.

</AlertBox>

Ce dernier point se corrige en une ligne, décrite dans la section suivante.

## Sous le capot (passez si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

### Récupérer vos propres fichiers depuis un volume monté {#getting-your-own-files-back-from-a-mounted-volume}

Le fichier appartient à `root` parce que l'utilisateur courant, utilisé dans le container, est l'utilisateur `root`. Nous devons informer Docker qu'il doit utiliser le nôtre.

Pour cela, mettons à jour une fois de plus notre fichier `compose.yaml` :

<Snippet filename="compose.yaml" source="./files/compose.mounted_volumes_permissions.yaml" />

<AlertBox variant="info" title="Pourquoi 1000:1000 ?">
Nous devons transmettre à Docker notre user id et notre group id actuels pour qu'il puisse créer fichiers et dossiers avec notre utilisateur. Pour connaître votre user id et group id, lancez simplement `echo "$(id -u):$(id -g)"` dans la console et vous verrez : le premier utilisateur créé (après l'installation de Linux) a toujours l'user id 1000 et le group id 1000. Très probablement vous.

</AlertBox>

Réessayons, mais supprimons d'abord le fichier incorrect : `sudo rm -f data/counter.txt`

Puis lancez `docker compose down && docker compose up --detach && docker compose exec ` <Var name="name">counter</Var> ` /counter.sh`

Maintenant, le fichier sera bien à vous :

<Terminal typewriter source="./files/terminal-1.txt" />

### Emplacement des volumes gérés par Docker {#location-of-the-volumes-managed-by-docker}

Les volumes sont stockés *quelque part* sur le disque par Docker, vous n'avez pas à vous en occuper. Et surtout, ils ne sont pas enregistrés dans le dossier de votre projet ; vérifions :

<Terminal typewriter source="./files/terminal-6.txt" />

<AlertBox variant="info" title="Les fichiers ne sont pas stockés dans notre projet">
Comme vous le voyez, nous n'avons que nos fichiers, pas le compteur. Les fichiers stockés dans un volume géré par Docker ne sont pas enregistrés dans le répertoire de notre projet.

</AlertBox>

<AlertBox variant="info" title="Emplacement">
En réalité, les volumes sont stockés dans `\\wsl$\docker-desktop-data\data\docker\volumes` si vous utilisez WSL, mais c'est vraiment une mauvaise idée d'accéder aux fichiers directement depuis là. Laissez Docker faire le travail pour vous.

</AlertBox>

### Accéder aux fichiers du volume avec Docker Desktop {#accessing-files-in-the-volume-using-docker-desktop}

L'une des façons les plus simples d'accéder aux fichiers contenus dans un volume est d'utiliser l'interface graphique de Docker Desktop.

![Docker Desktop - Liste des volumes](./images/docker_desktop_volumes.webp)

En cliquant sur le nom du volume (`demo_counter_data` ici), vous verrez la liste des fichiers qu'il contient.

![Docker Desktop - Affichage du dossier data](./images/showing_data.webp)

En double-cliquant sur le nom du fichier, vous ouvrez un éditeur de texte basique où vous pouvez, si vous voulez, modifier le compteur et enregistrer le changement.

![Docker Desktop - Modification du compteur](./images/updating_data.webp)

Un nouvel appel à notre compteur montre que nous avons bidouillé le nombre :

<Terminal typewriter>
$ docker compose exec %%name=counter%% /counter.sh
You have executed this script 51 times.
</Terminal>

### Accéder aux fichiers du volume avec vscode {#accessing-files-in-the-volume-using-vscode}

Mais vous pouvez aussi utiliser Visual Studio Code pour accéder aux fichiers.

D'abord, si besoin, installez l'extension Docker :

- Appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>X</kbd> pour afficher la fenêtre `Extensions` de vscode,
- Cherchez l'extension `Docker` de Microsoft (assurez-vous de chercher `ms-azuretools.vscode-docker`),
- et installez l'extension

Maintenant, dans le panneau de gauche, vous verrez un nouveau bouton pour Docker. Cliquez dessus.

Dans la nouvelle fenêtre, vous obtenez la liste des containers, la liste des images et d'autres choses.

Dépliez la liste des containers, cliquez sur `demo/counter` (notre container) et affichez la liste des fichiers.

Ouvrez le dossier racine `data`, faites un clic droit sur `counter.txt`, notre fichier compteur, et sélectionnez `Open`.

Vous pouvez désormais éditer ce fichier depuis vscode, faire des modifications et les enregistrer.

![VSCode - Accès aux fichiers dans le container](./images/vscode.webp)

<Terminal typewriter>
$ docker compose exec %%name=counter%% /counter.sh
You have executed this script 101 times.
</Terminal>

Oui, accéder aux fichiers avec vscode fonctionne aussi.

## Conclusion {#conclusion}

Selon vos besoins, vous pouvez opter pour l'une des trois solutions.

Vous voulez *jouer* avec un container Docker, le tester, apprendre... Vous ne voulez laisser aucune trace sur votre disque dur. La première solution est parfaite ici, c'est-à-dire : ne vous souciez pas des volumes.

Vous voulez tester mais aussi garder les données quelque part sans *polluer* votre disque dur. Vous travaillez sur quelque chose de temporaire, donc vous voulez peut-être conserver les données, mais sans certitude. La deuxième solution vous conviendra le mieux, c'est-à-dire les volumes gérés par Docker.

À l'inverse, votre travail est important et vous ne voulez rien perdre. Vos données doivent être enregistrées sur votre disque dur. La troisième solution sera celle que vous utiliserez, c'est-à-dire les volumes montés.

La question à se poser n'est jamais *« ai-je besoin d'un volume ? »* mais *« à qui appartiennent ces données : au container, à Docker, ou à moi ? »*. Et quand la réponse est *à moi*, n'oubliez pas la ligne `user: 1000:1000`, sinon vous taperez `sudo` sur vos propres fichiers. Pour aller plus loin avec les bind mounts et le flag `-v` sur un simple `docker run`, voyez <Link to="/blog/docker-volume">Share data between your running Docker container and your computer</Link>.
