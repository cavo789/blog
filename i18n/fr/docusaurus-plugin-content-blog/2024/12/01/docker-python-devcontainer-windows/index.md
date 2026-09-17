---
slug: docker-python-devcontainer-windows
title: Docker - Installation facile de Python sous Windows
date: 2024-12-01
description: Mettez en place facilement un environnement de développement Python sous Windows avec Docker et les devcontainers VSCode. Codez immédiatement, sans installer Python localement.
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
<!-- cspell:ignore bashhistory,groupid,commandhistory,pylint,synchronised,hexa -->
<!-- cspell:ignore mypy,pylance -->
![Docker - Installation facile de Python sous Windows](/img/v2/devcontainer.webp)

<TLDR>
Cet article porte sous Windows la configuration du devcontainer Python déjà vue sous Linux : les mêmes fichiers `Dockerfile`, `compose.yaml`, `.docker.env` et `.devcontainer/devcontainer.json` sont réutilisés tels quels, mais GNU Make est remplacé par un script batch DOS `make.bat`. Les commandes `make build`, `make up`, `make bash` et `make devcontainer` fonctionnent à l'identique depuis une console MS-DOS — vous obtenez un environnement de développement Python sans aucune installation locale de Python.
</TLDR>

Dans un <Link to="/blog/docker-python-devcontainer">article précédent</Link>, j'ai fourni quelques fichiers permettant de créer rapidement un environnement Python sous Linux. Aujourd'hui, amusons-nous à utiliser exactement les mêmes fichiers, mais cette fois sous Windows.

Le défi du jour est simple : créer un environnement Python sur ma machine Windows sans installer Python, évidemment, et sans devoir configurer VSCode. Il suffit de lancer un peu de magie et, voilà, en tant que débutant en Python, je peux commencer à coder sans perdre de temps à configurer mon ordinateur.

*Dès que vous y écrivez du vrai code, ajoutez les outils de <Link to="/blog/python-qa">Python - Code Quality tools</Link> : ils tournent eux aussi dans le container, donc votre machine Windows reste intacte.*

<!-- truncate -->

Dans l'article <Link to="/blog/docker-python-devcontainer">Docker - Python devcontainer</Link>, j'ai donc fourni quelques fichiers et nous allons les réutiliser, sans les modifier, dans cet article. Partons du principe qu'ils se trouvent déjà dans un dossier de projet sur votre machine et que vous avez ouvert une console MS-DOS positionnée dessus — voici ce qui se passe quand vous lancez les mêmes commandes que sous Linux, directement depuis DOS.

## C'est parti {#time-to-start}

Toutes les commandes ci-dessous doivent être lancées depuis une console MS-DOS et vous devez vous trouver dans le dossier de votre projet (`cd %USERPROFILE%\Documents\Python`).

### Construire l'image Docker Python {#build-the-python-docker-image}

La première chose à faire, une seule fois, est de créer l'image Docker. Cela se fait en lançant `make build` :

![Construction de l'image Docker](./images/make_build.webp)

### Créer un container Docker {#create-a-docker-container}

Ensuite, une fois par jour, vous devez lancer `make up` :

![Créer un container Docker](./images/make_up.webp)

Vous ne devez le faire qu'une fois par jour, car le container sera très probablement arrêté quand vous éteindrez votre ordinateur. Lancez simplement `make up` le lendemain matin pour le *réveiller*.

### Entrer dans le container {#entering-the-container}

Si vous devez entrer dans votre container Docker (démarré par `make up`), lancez simplement `make bash`.

Vous obtenez une console différente, comme illustré ci-dessous (voyez la baleine bleue, par exemple). La capture ci-dessous montre l'affichage du numéro de version de Python :

![Entrer dans le container](./images/make_bash.webp)

Souvenez-vous des fichiers créés au chapitre précédent. L'un d'eux s'appelait `main.py` et contenait un script Python tout simple ; lançons-le :

![Exécution de main.py](./images/make_bash_main.webp)

Il suffit de lancer le binaire `python` suivi du nom du script.

<AlertBox variant="info">
Vous êtes donc bien à l'intérieur d'un container en cours d'exécution (voyez la baleine bleue). Tapez `exit` pour quitter le container (celui-ci continuera de tourner) et revenir à votre console MS-DOS.

</AlertBox>

## Démarrer VSCode et commencer votre aventure de développeur {#starting-vscode-and-start-your-developer-journey}

Lancez simplement `make devcontainer` (dans votre console MS-DOS ; pas dans un container) et Visual Studio Code démarrera à l'intérieur de votre container Docker. Cette fonctionnalité s'appelle le *devcontainer*.

![Lancement de VSCode - Devcontainer](./images/make_devcontainer.webp)

Dans VSCode, si vous aimez cette façon de travailler, vous pouvez appuyer sur <kbd>CTRL</kbd>+<kbd>\`</kbd> pour ouvrir un terminal (vous pouvez aussi cliquer sur le menu `View` puis sur l'entrée `Terminal` ; c'est la même chose).

![Utiliser le terminal de VSCode](./images/vscode_terminal.webp)

Ici, si vous voulez exécuter le script `main.py`, tapez simplement `python src/main.py` et appuyez sur <kbd>Enter</kbd>.

![Exécution du script main.py depuis le terminal](./images/vscode_terminal_running.webp)

<AlertBox variant="info">
Pour les utilisateurs Windows, notez que le container (et donc VSCode) tourne sous Linux. Il y a évidemment de nombreuses différences. Ce qu'il faut savoir, c'est que Linux utilise `/` comme séparateur de dossiers et non `\` comme DOS/Windows. C'est pourquoi nous avons tapé `src/main.py` et non `src\main.py`.

</AlertBox>

### Puis-je ajouter des extensions Python dans VSCode ? {#can-i-add-pythons-addons-in-vscode}

Bien sûr, allez simplement dans la liste des extensions (appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>X</kbd>) et... comme vous le voyez, certaines sont déjà installées. C'est l'un des avantages d'utiliser un devcontainer comme vous le faites en ce moment (voyez le fichier `.devcontainer/devcontainer.json` créé plus tôt).

![Extensions VSCode](./images/vscode_addons.webp)

Je parle de magie, mais entrons maintenant dans le détail et voyons comment cette structure de fichiers/dossiers est réellement créée. Je pourrais vous fournir une archive ZIP, par exemple, avec tous les fichiers et la structure déjà prêts, mais ce serait moins... amusant, non ?

## Créer une structure de fichiers/dossiers {#create-a-filefolder-structure}

Créez un dossier sur votre machine Windows, par exemple un dossier `Python` dans vos documents (en MS-DOS, voici la commande à lancer : `mkdir %USERPROFILE%\Documents\Python` puis pour y aller : `cd %USERPROFILE%\Documents\Python`).

Vous pouvez bien sûr lancer l'Explorateur Windows, aller dans votre dossier *Documents* et créer le dossier et tous les fichiers ainsi :

![Explorateur Windows](./images/explorer.webp)

Créez tous les fichiers nécessaires (ceux de l'article précédent). Nous n'avons PAS modifié ces fichiers : nous pouvons donc utiliser exactement les mêmes, que l'on soit sous Linux ou sous Windows.

Ajoutez simplement un nouveau fichier dans votre dossier Windows et copiez/collez le contenu ci-dessous.

Copiez/collez le contenu ci-dessous dans un fichier appelé `.devcontainer/devcontainer.json`.

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

Copiez/collez le contenu ci-dessous dans un fichier appelé `src/main.py`.

<Snippet filename="src/main.py" source="./files/main.py" />

<Snippet filename="src/requirements.txt">

Oui, un fichier vide... Le fichier doit être présent mais, pour l'instant, nous n'avons aucune dépendance à y mettre.

</Snippet>

Copiez/collez le contenu ci-dessous dans un fichier appelé `.docker.env` (dans le monde Linux, ce type de fichier est caché puisqu'il commence par un point).

<Snippet filename=".docker.env" source="./files/.docker.env" />

Copiez/collez le contenu ci-dessous dans un fichier appelé `compose.yaml`.

<Vars name="app_python" labels={{ name: "Nom du container" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Copiez/collez le contenu ci-dessous dans un fichier appelé `Dockerfile`.

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

## Créer notre fichier batch DOS {#create-our-dos-batch-file}

Voici la différence avec Linux : au lieu d'utiliser GNU Make, nous allons simplement utiliser un script batch MS-DOS. Nous l'appellerons `make.bat` afin de pouvoir utiliser des actions comme `make build` ou `make up` comme sous Linux ; mais cette fois, sous DOS.

Créez ce fichier supplémentaire :

<Snippet filename="make.bat" source="./files/make.bat" />

## Notre configuration actuelle {#our-configuration-right-now}

À ce stade, voici notre projet dans VSCode :

![Le projet dans VSCode](./images/vscode_setup.webp)

Et voici à quoi il ressemble dans l'Explorateur Windows :

![Explorateur Windows](./images/explorer.webp)

Ouvrez une console MS-DOS (appuyez sur la touche <kbd>Windows</kbd> de votre clavier ou cliquez sur le menu Démarrer, puis tapez `cmd`)

![Lancer MS DOS](./images/cmd.webp)

Ouvrez la console et allez dans le dossier de votre projet, c'est-à-dire lancez `cd %USERPROFILE%\Documents\Python`.

Voici à quoi ressemble le projet maintenant :

![À quoi ressemble le projet sous DOS](./images/msdos.webp)

## Puis-je utiliser une autre version de Python ? {#can-i-use-another-version-of-python}

Bien sûr, éditez simplement le fichier `.docker.env` et vous y trouverez cette ligne : `DOCKER_PYTHON_VERSION=3.13-slim`. Changez le numéro de version, enregistrez le fichier, puis lancez `make build`, ensuite `make up` et, enfin, `make devcontainer` pour tout reconstruire et utiliser la version plus récente.
