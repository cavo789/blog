---
slug: docker-python-devcontainer
title: Docker - Python devcontainer
date: 2024-10-30
description: Découvrez comment mettre en place rapidement un devcontainer VSCode pour développer en Python avec Docker. Récupérez le Dockerfile complet, le compose.yaml et les configurations .docker.env.
authors: [christophe]
image: /img/v2/devcontainer.webp
series: Coding using a devcontainer
mainTag: python
tags:
  - devcontainer
  - docker
  - python
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore PYTHONDONTWRITEBYTECODE,PYTHONUNBUFFERED,HISTFILE -->
<!-- cspell:ignore addgroup,adduser,keyscan,hadolint,gecos,endregion -->
<!-- cspell:ignore bashhistory,groupid,commandhistory,pylint,synchronised -->
![Docker - Python devcontainer](/img/v2/devcontainer.webp)

<TLDR>
Cet article construit un devcontainer Python réutilisable pour VSCode : un `Dockerfile`, un `compose.yaml`, un `.docker.env` (pour les réglages propres à chaque projet, comme la version de Python) et un `makefile` qui enveloppe les commandes courantes (`make up`, `make bash`), puis un `.devcontainer/devcontainer.json` préconfiguré avec l'extension Python et les settings nécessaires. Résultat : `make devcontainer` ouvre VSCode qui tourne entièrement dans le container, avec les fichiers synchronisés avec l'host.
</TLDR>

Comme vous le savez, VSCode est un superbe éditeur qui vous permet de programmer dans probablement n'importe quel langage. Un éditeur, pas un IDE, parce que VSCode est au fond un Notepad dans sa version ultime.

Si vous voulez programmer en Python, vous aurez besoin d'installer quelques extensions dans VSCode pour être vraiment à l'aise : coloration syntaxique, navigation dans le code, refactoring (renommer une variable ou une classe), etc.

Il existe des éditeurs « prêts à l'emploi » comme PyCharm mais 1. ils sont payants et 2. ils sont spécifiques (vous ne pourrez pas programmer en PHP avec PyCharm ; ni même travailler facilement avec des fichiers HTML/CSS).

Dans ce nouvel article, nous allons voir comment obtenir un environnement VSCode immédiatement prêt à l'emploi pour coder en Python. Et comme c'est VSCode, c'est 1. gratuit, 2. polyvalent et 3. terriblement puissant.

<!-- truncate -->

## Voyons-le tourner {#lets-see-it-running}

Voici ce que vous obtenez, avant même d'avoir créé un seul fichier : lancez `make up` dans votre console et vous verrez cet écran :

![Makefile](./images/make.webp)

Comme vous le voyez, nous avons tout un tas de commandes, comme `make up` pour démarrer notre container Docker. Essayons, et aïe, il nous manque un fichier appelé `/src/requirements.txt`.

![requirements.txt is missing](./images/requirements_txt.webp)

### src/requirements.txt {#srcrequirementstxt}

Créez un fichier vide appelé `src/requirements.txt`. Le fichier peut rester vide (vous y ajouterez vos propres dépendances plus tard).

En relançant `make up`, ça y est ! Cette fois nous pouvons construire nos images et créer notre container :

![Docker up](./images/docker-up.webp)

Cette fois, si besoin, nous pouvons entrer dans notre container en lançant `make bash` et, par exemple, vérifier ce que contient le dossier courant et quelle version de Python a été installée :

![Inside the container](./images/container-python.webp)

<AlertBox variant="note">
Comme vous le voyez, c'est Python 3.13 qui est utilisé. Pourquoi cette version précise ? Retournez dans votre fichier `.docker.env` et regardez la variable `DOCKER_PYTHON_VERSION`. Si vous en voulez une autre, mettez simplement à jour le fichier `.docker.env` et relancez `make up`.

</AlertBox>

## Créons notre premier script {#lets-start-creating-our-first-script}

Si vous êtes toujours dans votre container, tapez `exit` afin que votre prompt soit celui de votre machine (votre *host*), et non plus celui du container en cours d'exécution.

Créez votre premier script : un nouveau fichier dans le dossier `src`, appelé `hello.py`.

Soyez créatif et tapez un simple `print` :

```python
print("I'm your Python code")
```

![Hello](./images/hello.webp)

Pour pouvoir exécuter le code, relancez `make bash` (pour entrer dans le container) puis lancez `python hello.py`

![Run hello](./images/run-hello.webp)

<AlertBox variant="info">
Ça fonctionne parce que, dans le container, le répertoire de travail est `/app/src`. Si ça n'avait pas été le cas, il aurait fallu écrire par exemple `python /app/src/hello.py`, c'est-à-dire le chemin absolu vers le script.

</AlertBox>

Comme vous pouvez le constater, les fichiers de votre machine sont synchronisés avec votre host. Si VSCode est toujours ouvert, vous pouvez modifier votre script, par exemple :

```python
print("Hey! It's synchronized; cool!")
```

![It's synchronized](./images/it-is-synchronized.webp)

Les fichiers derrière tout ça — `Dockerfile`, `compose.yaml`, `.docker.env` et le `makefile` — sont présentés juste après.

## Créons les fichiers de notre environnement Docker {#lets-create-the-files-for-our-docker-environment}

Dans cet article, nous allons créer le devcontainer, c'est-à-dire l'environnement de développement basé sur Docker que vous venez de voir tourner. La création du devcontainer prendra quelques minutes, mais il s'agit juste de copier/coller depuis cet article vers votre système.

Une fois les fichiers créés, vous pourrez réutiliser le devcontainer pour tous vos projets Python.

*Deux prolongements naturels : ajouter les outils de <Link to="/blog/python-qa">Python - Code Quality tools</Link> à l'image pour que chaque projet en hérite, et lire <Link to="/blog/docker-prod-devcontainer">One Docker Image for Production and Devcontainers - The Clean Way</Link> pour garder cet outillage en dehors de l'image que vous déployez.*

Comme toujours, nous allons créer un nouveau dossier et y créer des fichiers. Lancez `mkdir /tmp/python && cd $_` pour créer ce dossier et vous y placer.

Démarrez VSCode depuis là, c'est-à-dire lancez `code .` dans la console quand vous êtes dans le dossier. Cela ouvrira VSCode et vous pourrez créer autant de fichiers que vous voulez.

### Dockerfile {#dockerfile}

Le premier fichier à créer servira à construire notre image Docker. Créez un fichier appelé `Dockerfile` avec le contenu suivant :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

### compose.yaml {#composeyaml}

À côté du `Dockerfile`, nous allons créer notre `compose.yaml`. Créez ce fichier avec le contenu suivant :

<Vars name="app_python" labels={{ name: "Nom du container" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

### .docker.env {#dockerenv}

Le troisième fichier à créer s'appellera `.docker.env` ; nous y initialiserons quelques valeurs. Créez ce fichier avec le contenu ci-dessous :


<Snippet filename=".docker.env" source="./files/.docker.env" />

<AlertBox variant="info">
Il vous suffit de dupliquer les autres fichiers que nous avons créés pour chacun de vos projets, et les réglages propres à votre projet se feront ici, dans le fichier `.docker.env`.

</AlertBox>

### makefile {#makefile}

Pour se simplifier la vie, nous allons regrouper un ensemble de commandes dans un fichier appelé `makefile`. Créez un fichier `makefile` avec le contenu ci-dessous :

<Snippet filename="makefile" source="./files/makefile" />

<AlertBox variant="caution">
Si vous ne savez pas si `GNU make` est déjà installé, lancez `which make` dans la console. Si vous voyez `make not found`, lancez `sudo apt-get update && sudo apt-get install make` pour procéder à l'installation.

</AlertBox>

## Qu'avons-nous fait jusqu'ici ? {#what-have-we-done-so-far}

Nous avons créé la structure minimale pour nos futurs projets Python. Nous avons défini notre image Docker (grâce au fichier `Dockerfile`) et la façon de l'utiliser (fichier `compose.yaml`).

Nous avons aussi configuré notre projet (fichier `.docker.env`) et mis en place un certain nombre de commandes utiles (fichier `makefile`).

Tous ces fichiers sont réutilisables dans l'ensemble de vos projets Python.

## Maintenant, créons notre environnement devcontainer {#now-lets-create-our-devcontainer-environment}

Il nous faut créer un fichier supplémentaire. Créez un nouveau dossier appelé `.devcontainer` et, dedans, un fichier appelé `devcontainer.json`. Copiez/collez le contenu ci-dessous :

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

Ce fichier est très long ; il pourrait être plus court, mais l'idée est de configurer VSCode. Nous avons donc listé toutes les extensions que nous voulons dans notre environnement de codage, ainsi qu'un paquet de settings.

Notre installation est terminée. Voici la structure finale de notre projet :

![Our final project's structure](./images/final-structure.webp)

## Démarrer le projet dans un devcontainer {#start-the-project-in-a-devcontainer}

Si VSCode est toujours ouvert, fermez-le. Si vous êtes toujours dans la console du container, tapez `exit` pour revenir à la console de votre host.

Maintenant, lancez `make devcontainer` (donc sur votre machine hôte), qui est l'une des commandes déjà présentes dans notre `makefile`.

VSCode démarre et ouvre le projet directement *dans* le container :

![VSCode - Devcontainer](./images/vscode_devcontainer.webp)

VSCode va demander (voir en bas à droite) d'installer l'extension Python de Microsoft ; autorisez-le et cliquez sur `Install`.

VSCode demandera aussi si vous voulez installer les extensions recommandées ; faites-le.

![Install recommended extensions](./images/vscode_install_extensions.webp)

## Conclusion {#conclusion}

Vous avez maintenant un environnement de développement Python pleinement fonctionnel. Grâce à notre image Docker, Python a été installé et configuré pour tourner dans un container Docker (comprenez : rien n'a été installé sur votre machine) et, grâce au devcontainer, vous êtes sûr que VSCode est correctement configuré avec toutes les extensions nécessaires pour travailler sereinement.

Vous êtes sous Windows et vous voulez exactement les mêmes fichiers, adaptés ? Voyez <Link to="/blog/docker-python-devcontainer-windows">Docker - Easy setup of Python under Windows</Link>. Vous préférez ne pas créer les fichiers à la main du tout ? <Link to="/blog/docker-python-devcontainer-microsoft">Docker - Even easier setup of Python</Link> utilise l'assistant intégré de VSCode à la place.
