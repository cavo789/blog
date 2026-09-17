---
slug: docusaurus-docker
title: Exécuter Docusaurus avec Docker
date: 2024-02-04
description: Faites tourner Docusaurus avec Docker ! Suivez ce tutoriel simple pour créer votre image Docker Docusaurus, utiliser docker compose et lancer rapidement votre documentation ou votre blog.
authors: [christophe]
image: /img/v2/docusaurus_tips.webp
series: Running Docusaurus using Docker
mainTag: docusaurus
tags:
  - docker
  - docusaurus
  - nodejs
  - npm
  - yarn
language: fr
updates:
  - date: 2026-07-30
    note: "Updated base image from node:21-alpine (EOL Jun 2024) to node:22-alpine LTS in Dockerfile."
---
![Exécuter Docusaurus avec Docker](/img/v2/docusaurus_tips.webp)

<TLDR>
Ce guide explique comment faire tourner Docusaurus avec Docker pour éviter d'installer Node.js en local. Vous allez créer un Dockerfile sur mesure, mettre en place un `compose.yaml` pour le développement avec rechargement à chaud, et gérer le contenu de votre blog dans un environnement containerisé.
</TLDR>

Comme vous le savez, ce blog tourne avec [Docusaurus](https://docusaurus.io/).

J'écris mes articles dans des fichiers Markdown (un article = un fichier `.md`) et Docusaurus les convertit en pages HTML.

Dans ce premier article, nous allons apprendre à installer Docusaurus... oups, pardon, pas à installer Docusaurus puisque nous allons utiliser Docker pour nous simplifier la vie.

<!-- truncate -->

## Trois fichiers, une commande {#three-files-one-command}

<Vars port="3000" labels={{ port: "Port hôte" }} />

Trois fichiers dans un dossier vide — un `Dockerfile`, un `.dockerignore` et un `compose.yaml` — puis :

<Terminal typewriter>
$ docker compose up --detach --build
</Terminal>

Quelques minutes plus tard (uniquement la première fois), `http://localhost:`<Var name="port">3000</Var> répond :

<BrowserWindow url="http://localhost:%%port=3000%%">
  ![Page d'accueil de Docusaurus](./images/homepage.webp)
</BrowserWindow>

Et le menu `Blog` liste les fichiers Markdown présents dans le dossier `blog` de votre propre machine :

<BrowserWindow url="http://localhost:%%port=3000%%/blog">
  ![Nos articles](./images/posts.webp)
</BrowserWindow>

Pas de Node.js installé, pas de `npm`, pas de `yarn`, aucun conflit de version avec le reste de vos projets.

## Pourquoi ça fonctionne {#why-it-works}

- **L'image construit le squelette Docusaurus au moment du build**, donc le moteur du site vit dans le container et ne touche jamais à votre machine.
- **Votre dossier `blog` est monté depuis l'host**, pas copié : le container lit exactement les fichiers que vous éditez dans votre éditeur.
- **Le rechargement à chaud suit vos fichiers** : enregistrer un fichier Markdown dans VS Code rafraîchit la page dans votre navigateur — le container exécute `yarn start`, pas un build statique.

## Créez votre propre image Docusaurus {#create-your-own-docusaurus-image}

Créez un répertoire temporaire en lançant `mkdir /tmp/docusaurus && cd $_`.

Ceci fait, démarrez votre éditeur préféré et ouvrez le dossier. De mon côté, j'utilise Visual Studio Code donc je lance simplement `code .` dans ma console Linux.

### Créer un fichier Dockerfile {#create-a-dockerfile-file}

Dans le répertoire de votre projet (donc `/tmp/docusaurus`), créez un fichier nommé `Dockerfile` avec ce contenu :

<Snippet filename="/tmp/docusaurus/Dockerfile" source="./files/Dockerfile" />

Sept lignes, et chacune mérite sa place — si vous voulez le détail ligne par ligne, une section dédiée se trouve à la fin de cet article.

### Créer un fichier .dockerignore {#create-a-dockerignore-file}

Nous avons vu ci-dessus la commande `COPY . .` qui demande de copier tout le répertoire du projet depuis notre machine locale vers l'image Docker mais, en fait, non, nous n'avons pas besoin de tout copier.

Dans l'image Docker, nous n'avons pas besoin de dossiers comme `build` ou `node_modules`, ni de fichiers comme `.gitignore` et quelques autres. Nous n'en avons pas besoin parce qu'ils seront créés dans Docker (`node_modules` est créé par la commande `yarn install`, donc inutile de perdre du temps à copier ce dossier).

Mais nous n'avons pas non plus besoin de copier des dossiers comme `blog`, `pages`, `static`, ... puisque ces dossiers doivent rester sur notre machine et simplement être *synchronisés* avec le container Docker en cours d'exécution (donc inutile de les mettre dans l'image à ce stade).

Créez donc un fichier `.dockerignore` avec ce contenu :

<Snippet filename=".dockerignore" source="./files/.dockerignore" />

### Créer un fichier compose.yaml {#create-a-composeyaml-file}

Le troisième fichier à créer est `compose.yaml` avec ce contenu :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Comme vous le voyez, nous devons avoir un dossier nommé `blog` sur notre machine et nous allons synchroniser ce dossier dans le container Docker. Notre dossier `blog` sera *monté* dans le dossier `/app/blog` du container (si la notion de volumes est nouvelle pour vous, lisez <Link to="/blog/docker-volume">Share data between your running Docker container and your computer</Link>).

### Créer quelques articles de blog simples {#create-simple-blog-items}

Juste pour avoir un peu de contenu, créons automatiquement quelques articles.

Lancez les commandes suivantes pour créer trois fichiers Markdown (nos articles) dans le dossier `blog` :

<Terminal typewriter source="./files/terminal-1.txt" />

Si vous prenez le temps de regarder ce que contient maintenant notre dossier `/tmp/docusaurus`, voici la liste des fichiers / dossiers :

```tree expanded=true showJSX=false debug=false title="/tmp/docusaurus"
.
├── .dockerignore
├── Dockerfile
├── blog
│   ├── 2024-02-04-welcome-world.md
│   ├── 2024-02-05-my-first-post.md
│   └── 2024-02-06-my-second-post.md
└── compose.yaml

```

<AlertBox variant="info" title="`tree` ne fait pas partie de l'installation Linux de base">
Si l'utilitaire `tree` vous intéresse et que vous ne l'avez pas encore, lancez simplement `sudo apt-get update && sudo apt-get install tree` pour l'installer. Cette étape est optionnelle.

</AlertBox>

### Lancer Docusaurus {#run-docusaurus}

À ce stade du tutoriel, vous avez tous les fichiers requis et quelques articles de blog. Démarrons donc le tout avec la commande `docker compose up --detach --build` montrée au début de cet article. Votre blog est alors accessible sur votre machine ici : `http://localhost:`<Var name="port">3000</Var>.

<AlertBox variant="info" title="Quel numéro de port utiliser ?">
Le numéro de port est celui que vous avez indiqué dans le fichier `compose.yaml` à la ligne <Var name="port">3000</Var>`:3000`.

Si vous préférez un autre port comme `3002` par exemple, éditez simplement le fichier yaml et remplacez <Code><Var name="port">3000</Var>:3000</Code> par `3002:3000`, puis relancez la commande `docker compose up --detach`.

</AlertBox>

<AlertBox variant="info" title="Chronologie des articles">
En cliquant sur le menu `Blog`, vous remarquerez que l'ordre par défaut suit l'ordre chronologique : le dernier article créé (`2024-02-06-my-second-post.md`) est le premier de la liste.

</AlertBox>

Pour ce tutoriel, les images viennent de `unsplash.com` mais avec un thème : les dinosaures. *Si vous rafraîchissez la page, vous obtenez de nouvelles images.*

### Un rendu amélioré {#improved-look--feel}

Nous allons créer un fichier sur notre machine, dans notre dossier `blog`. J'utilise VS Code donc je passe dans mon éditeur, je vais dans le dossier `blog` et je crée un nouveau fichier, disons : `2024-02-07-really-better.md`

![Bien mieux](./images/vscode.webp)

Pour aller plus vite, rendez-vous sur ce tutoriel : [https://docusaurus.io/docs/blog#adding-posts](https://docusaurus.io/docs/blog#adding-posts).

Copiez/collez l'exemple `2019-09-05-hello-docusaurus.md` dans votre fichier `2024-02-07-really-better.md`.

<BrowserWindow url="http://localhost:%%port=3000%%/blog/2019-09-05-hello-docusaurus.md">
  ![Notre nouvel article](./images/vscode-article.webp)
</BrowserWindow>

Retournez dans votre navigateur et rafraîchissez la page (appuyez sur <kbd>F5</kbd>). Votre nouvel article est là !

<BrowserWindow url="http://localhost:%%port=3000%%/blog/2024-02-07-really-better.md">
  ![Votre nouvel article est là](./images/with-new-post.webp)
</BrowserWindow>

## Sous le capot — le Dockerfile, ligne par ligne (à sauter si vous voulez juste que ça tourne) {#under-the-hood--the-dockerfile-line-by-line-skip-this-if-you-just-want-it-running}

- Ligne 1 : nous utilisons Node.js v22 LTS dans sa version alpine,
- Ligne 2 : la commande `RUN npx create-docusaurus@latest /app classic && chown -R node:node /app` installe la dernière version de Docusaurus (dans le dossier `/app`) et s'assure que le dossier appartient à notre utilisateur `node`,
- Ligne 3 : à partir de maintenant, tout se fait avec l'utilisateur `node`,
- Ligne 4 : `/app` sera le répertoire de travail par défaut dans l'image,
- Ligne 5 : la commande `cd /app && yarn install` entre dans le dossier et installe les dépendances node,
- Ligne 6 : `COPY . .` copie tout le répertoire de votre projet (sur votre host) dans l'image Docker (dans le dossier `/app` puisque c'est le répertoire de travail par défaut) et
- Ligne 7 : la commande `CMD ["yarn", "start", "--host", "0.0.0.0"]` exécute `yarn start --host 0.0.0.0`, l'instruction qui lance Docusaurus, fait la conversion *transparente* des pages Markdown en HTML et affiche le site sur le port par défaut (le port `3000`).

## Arrêter et redémarrer {#stop-and-restart}

Comme le dossier `blog` est stocké sur votre machine, nous pouvons arrêter le blog et le relancer sans rien perdre.

Pour l'illustrer, lançons `docker compose stop && docker compose rm --force` pour arrêter et supprimer le container. Puis `docker compose up --detach --build` pour le reconstruire. En retournant sur <Code>http://localhost:<Var name="port">3000</Var></Code>, vous verrez que votre blog est toujours là avec vos derniers changements. Rien n'a été perdu.

## Et ensuite ? {#whats-next}

L'installation ci-dessus est une installation de *développement* : votre contenu reste sur votre host et est monté dans le container. Deux articles de suivi vont plus loin :

- <Link to="/blog/docusaurus-docker-own-blog">Running your own blog with Docusaurus and Docker</Link> — transformer ce bac à sable en votre vrai blog et
- <Link to="/blog/docker-docusaurus-prod">Encapsulate an entire Docusaurus site in a Docker image</Link> — construire une image autonome prête à être déployée.
