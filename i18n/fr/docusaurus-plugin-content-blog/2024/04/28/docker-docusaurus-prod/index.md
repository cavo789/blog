---
slug: docker-docusaurus-prod
title: Encapsuler un site Docusaurus complet dans une image Docker
date: 2024-04-28
description: Déployez votre site de documentation Docusaurus en production avec Docker. Suivez ce guide pas à pas pour créer une image Docker multi-stage très efficace.
authors: [christophe]
image: /img/v2/docusaurus_using_docker.webp
series: Running Docusaurus using Docker
mainTag: docusaurus
tags:
  - docker
  - docusaurus
  - nodejs
  - yarn
language: fr
updates:
  - date: 2026-07-30
    note: "Updated base image from node:21-alpine (EOL Jun 2024) to node:22-alpine LTS in Dockerfile."
---
<!-- cspell:ignore corepack,docusaurus,johndoe -->
![Encapsuler un site Docusaurus complet dans une image Docker](/img/v2/docusaurus_using_docker.webp)

<TLDR>
Cet article (aujourd'hui remplacé par un plus récent) montre comment empaqueter un site Docusaurus complet dans une seule image Docker autonome, à l'aide d'un `Dockerfile` en trois stages : un stage de base Node, un stage de build qui lance `yarn build`, et un stage final `nginx` qui n'embarque que la sortie statique — faisant passer l'image de ~740 Mo à ~87 Mo. On y voit le build, l'exécution, l'ouverture d'un shell interactif et la publication de l'image sur Docker Hub.
</TLDR>

<AlertBox variant="important" title="Cet article est obsolète">
Cet article a été revu récemment, lisez plutôt [Running Docusaurus using Docker](/blog/running-docusaurus-with-docker).
</AlertBox>

Commencé le 2 novembre 2023, cet article est déjà le centième que je publie sur ce blog. Pour marquer l'occasion, je voulais faire quelque chose d'un peu spécial en l'honneur du blog. Quoi de mieux qu'une version **100% Docker**, c'est-à-dire sous la forme d'une image Docker téléchargeable que **vous pouvez lancer avec une seule ligne de commande**.

Une seule commande pour télécharger le blog et le faire tourner sur votre machine (Linux, Mac ou Windows) avec un site parfaitement fonctionnel ; sympa, non ?

Et comme d'habitude, vous trouverez ci-dessous toutes les informations nécessaires pour faire de même avec votre propre installation Docusaurus.

<AlertBox variant="info" title="N'attendez pas plus longtemps">
Ouvrez une console, lancez `docker pull cavo789/blog && docker run -d -p 80:80 --name blog cavo789/blog` pour télécharger une copie locale de mon blog et la démarrer. Ensuite, ouvrez simplement `http://localhost` sur votre ordinateur et... félicitations, vous venez d'obtenir une version hors ligne et exécutable !
</AlertBox>

Voyons maintenant comment faire la même chose pour votre propre instance Docusaurus. Mesdames et messieurs, suivez le guide...

<!-- truncate -->

## Résultat {#result}

Cette unique commande `docker run` de l'AlertBox ci-dessus vous donne ceci, entièrement hors ligne :

<BrowserWindow url="http://localhost">
  ![Page d'accueil de votre instance Docusaurus en cours d'exécution](./images/homepage.webp)
</BrowserWindow>

<BrowserWindow url="http://localhost/blog">
  ![Notre blog](./images/blog.webp)
</BrowserWindow>

La suite de cet article construit l'image qui produit ce résultat : un `Dockerfile` multi-stage qui
transforme n'importe quel site Docusaurus en une seule image autonome de ~87 Mo.

## Créer un blog bidon si besoin {#create-a-dummy-blog-if-needed}

*Si vous avez déjà une installation Docusaurus sur votre ordinateur, sautez ce chapitre. Sinon, <Link to="/blog/docusaurus-docker">Running Docusaurus with Docker</Link> couvre la configuration de développement qui précède celle-ci.*

Dans cette partie, je suppose que vous n'avez pas encore d'installation Docusaurus. Nous allons donc créer un site bidon avec quelques articles de blog très basiques.

Ouvrez une console et lancez les commandes suivantes : `mkdir /tmp/docusaurus && cd $_`.

Vous êtes maintenant dans le dossier `/tmp/docusaurus`.

Copiez/collez dans la console les instructions ci-dessous, parenthèses incluses. Cela va créer un sous-dossier appelé `blog` avec trois fichiers markdown dedans, nos trois faux articles.

<Terminal typewriter source="./files/terminal-2.txt" />

Voilà, nous avons maintenant un blog bidon.

## Préparer notre installation Docusaurus pour Docker {#prepare-our-docusaurus-installation-for-docker}

*Si vous avez sauté le chapitre précédent parce que vous aviez déjà une instance Docusaurus, placez-vous dedans (`cd <your_docusaurus_folder>`).*

Nous allons devoir créer quelques fichiers pour Docker.

Lancez votre éditeur préféré et ouvrez le dossier ; de mon côté, j'utilise Visual Studio Code, donc je lance simplement `code .` dans ma console Linux.

Il nous faut créer quelques fichiers...

### Créer un fichier Dockerfile {#create-a-dockerfile-file}

Créez un fichier appelé `Dockerfile` avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Ce fichier est un Dockerfile **multi-stage**. Les objectifs principaux sont d'avoir un meilleur système de cache des layers et une image finale plus petite en taille. Un fichier multi-stage est aussi très pratique pour pouvoir construire plusieurs images, par exemple une de développement et une de production.

Comme vous le voyez, nous utilisons trois stages (un stage commence par la clause `FROM`).

Notre but dans cet article est de créer une image Docker finale contenant une version statique de notre installation Docusaurus. **Nous voulons une image contenant un serveur web et notre site.**

Avant de pouvoir faire ça, il nous faut :

1. Utiliser une image `node` puisque Docusaurus est une application `NodeJS`. Nous utiliserons `node:21-alpine` comme image de base.
2. Ensuite, il faut installer `docusaurus` et lancer `yarn` pour installer les dépendances. Cela fait, nous copierons tous les fichiers de notre dossier courant dans l'image Docker. Une fois copiés, il faut builder notre site et convertir les fichiers markdown en pages HTML et, enfin,
3. Il nous faut un serveur web comme `Apache`, `Caddy` ou `nginx` *(`Caddy` donnera l'image la plus petite mais configurer le SSL avec Docker reste assez compliqué)*.

Voilà nos trois stages.

**Le stage 1 s'appelle `base`**. Dans ce stage, on ne fait presque rien : télécharger une version alpine de `node` et initialiser quelques variables. Cette étape pourra, à l'avenir, aussi servir à un stage `development` mais, dans cet article, concentrons-nous sur celui de production.

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

**Dans le stage 2, appelé `building_production`**, nous étendons le stage `base`.

Comme vous le voyez ci-dessous, nous allons installer Docusaurus et ses dépendances.

Ensuite, nous copierons les fichiers de notre dossier courant dans l'image en cours de création et, enfin, nous générerons (builderons) les pages web statiques (HTML, CSS, JavaScript et images).

À la fin de ce stage, nous obtiendrons une version statique de notre site Docusaurus dans le dossier `/opt/docusaurus/build`.

<Snippet filename="Dockerfile" source="./files/Dockerfile.part3" />

Ce qui est important à noter ici, c'est notre répertoire de travail : `/opt/docusaurus/`. Notre site statique a été copié dans ce dossier, donc le résultat de la dernière instruction du deuxième stage (`yarn build`) va créer un sous-dossier `build` dans `/opt/docusaurus/`.

À la fin de ce stage, nous avons notre site statique mais pas encore de serveur web.

**Dans le stage 3**, nous allons utiliser [nginx](https://hub.docker.com/_/nginx).

<Snippet filename="Dockerfile" source="./files/Dockerfile.part4" />

Comme vous le voyez, ce stage est très basique. On utilise juste nginx, on copie le site statique créé plus tôt dans son dossier web par défaut et c'est tout.

<AlertBox variant="info" title="Pourquoi une image multi-stage est-elle meilleure qu'un stage `monolithique` ?">
Regardez le dernier stage, notre serveur web. On utilise juste le serveur web `nginx` et pour le faire fonctionner, on doit copier notre dossier `build` où Docusaurus a mis ses fichiers statiques (html, css, js et images).

Comme on ne récupère que le dossier `build` du stage précédent, l'image finale ne contiendra plus `NodeJs`, `Yarn`, `Docusaurus` ni rien d'autre installé auparavant. Nous n'aurons pas non plus de fichiers temporaires éventuellement installés ; nous n'avons pas besoin de la version originale de notre blog, c'est-à-dire de nos fichiers markdown d'origine.

Nous utiliserons l'image `nginx` et dans cette image, nous copierons uniquement les fichiers dont nous avons besoin depuis le stage précédent. Ainsi, notre image finale sera plus petite et ne contiendra que ce qu'il faut pour faire tourner l'application finale, ici notre site statique Docusaurus.

La taille de l'image du stage `building_production` était de 740 Mo et celle du stage `nginx` n'est que de 87 Mo. **Environ 9 fois moins !!!**
</AlertBox>

<AlertBox variant="info" title="Voir mon propre Dockerfile">
Pour mon propre blog, j'utilise un stage de développement. Jetez un œil à mon [Dockerfile](https://github.com/cavo789/blog/blob/main/Dockerfile) pour voir comment je procède. Regardez aussi mon [makefile](https://github.com/cavo789/blog/blob/main/makefile) et les différents fichiers `docker-compose-xxx.yml` de mon projet.
</AlertBox>

### Créer un fichier .dockerignore {#create-a-dockerignore-file}

Le deuxième fichier à créer doit s'appeler `.dockerignore` et contenir ceci :

<Snippet filename=".dockerignore" source="./files/.dockerignore" />

Le fichier `.dockerignore` est là pour demander à Docker de ne pas tout copier dans votre image finale lors de l'exécution de l'instruction `COPY . /opt/docusaurus/` présente dans le `Dockerfile`.

En effet, dans notre image finale, nous n'avons pas besoin par exemple des dossiers `build/` ou `node_modules/` puisqu'ils seront créés pendant le build de l'image. Nous n'avons pas besoin de notre dossier `.git/` (s'il existe) non plus, ni des fichiers temporaires ou nécessaires uniquement au build.

Le fichier `.dockerignore` sert donc à garder une image plus petite et à éviter de copier des fichiers sensibles (ceux contenant des secrets ou des éléments de configuration) dans l'image finale.

## Petit résumé {#small-summary}

Si vous avez suivi la création du dossier temporaire décrite plus haut, vous devriez avoir la situation suivante : deux fichiers dans le dossier `/tmp/docusaurus` et trois fichiers Markdown dans le sous-répertoire `blog`.

<Terminal typewriter source="./files/terminal-1.txt" />

## Builder notre image Docker {#build-our-docker-image}

Notre objectif était de créer une image Docker contenant notre site Docusaurus.

Quand on crée une image Docker, il faut lui donner un nom.

<AlertBox variant="caution" title="Le nom de l'image doit respecter le motif `owner/name`.">
`owner` doit être votre nom d'utilisateur sur Docker Hub. Dans mon cas, mon nom d'utilisateur est `[cavo789](https://hub.docker.com/u/cavo789)`, donc si je veux publier une image, je dois utiliser `cavo789` comme première partie. Ensuite, je dois indiquer un nom unique pas encore présent dans mon profil.

Dans mon cas, `cavo789/blog` est donc un bon choix. Pour cet article, j'utiliserai `johndoe/blog` puisque je ne vais pas publier cette image sur Internet.

</AlertBox>

Toujours dans votre console, lancez la commande suivante :

<Terminal typewriter>
$ docker build --tag johndoe/blog --target production .
</Terminal>

Le `.` final dans l'instruction ci-dessus signifie *dossier courant* ; `/tmp/docusaurus` dans mon cas.

<AlertBox variant="caution">
Comme notre `Dockerfile` est multi-stage, nous devons préciser quel stage nous voulons. Cela se fait avec le flag CLI `--target`.

Si vous regardez le fichier `Dockerfile` créé plus tôt, nos trois stages s'appellent `base`, `building_production` et `production`. Pour builder l'image avec le serveur web, vous devez spécifier `production` comme cible, mais si ce sont les fichiers générés qui vous intéressent, pas le serveur web, vous pouvez lancer `docker build --tag johndoe/blog --target building_production .`.

</AlertBox>

La commande `docker build` prendra une ou deux minutes selon la vitesse de votre connexion réseau et de votre ordinateur. Une fois exécutée avec succès, vous aurez une nouvelle image Docker sur votre machine. Vous pouvez la retrouver en lançant `docker image list` pour obtenir la liste des images locales.

<AlertBox variant="info">
En lançant `docker image list | grep -i blog`, vous pouvez retrouver l'image et sa taille. Pour moi, c'est 87 Mo à cet instant pour le blog bidon créé dans cet article.

En lançant `docker build --tag johndoe/blog --target building_production .` (donc sans `nginx` mais avec `Node`), la taille sera de 740 Mo. Comme vous le voyez, nous avons divisé la taille par presque 9.

</AlertBox>

## Et l'utiliser {#and-use-it}

Maintenant que notre image est créée, on peut faire plusieurs choses : la lancer simplement pour obtenir une version hors ligne de notre site Docusaurus, jouer avec un container et démarrer une session shell interactive ou, bien sûr, la publier sur Docker Hub.

### Lancer l'image, c'est-à-dire créer un container et faire tourner le site {#run-the-image-ie-create-a-container-and-run-the-site}

<Vars port="80" name="blog" labels={{ port: "Port de l'host", name: "Nom du container" }} />

Pour ça, lancez simplement la commande suivante :

<Terminal typewriter>
$ docker run -d --publish %%port=80%%:80 --name %%name=blog%% johndoe/blog
</Terminal>

Très vite, vous obtiendrez un très long ID en résultat, du genre `cae6989bee2a2339a4c0116be2b86ee3dae0b46d47a6c53dcb6e50098726c0b1`. Ignorez-le pour le moment, ça veut juste dire que votre container a été créé avec succès.

Maintenant, lancez votre navigateur et rendez-vous sur <Code>http://localhost:<Var name="port">80</Var></Code> — c'est la page d'accueil et le blog montrés en haut de cet article.

Comme dit plus haut, le site tournera sur votre ordinateur, donc hors ligne. Vous pouvez vous déconnecter d'Internet, tout tourne en RAM ; sur votre machine.

Si vous êtes curieux, lancez `docker ps` (ou `docker container list`, qui est un synonyme) pour voir la liste des containers. Vous verrez le vôtre.

En lançant <Code>docker container stop <Var name="name">blog</Var></Code> (<Var name="name">blog</Var> est le nom défini dans le `docker run` utilisé plus haut dans ce chapitre), on peut arrêter le blog. Retournez dans votre navigateur, allez sur <Code>http://localhost:<Var name="port">80</Var></Code> et vous verrez : le site n'est plus actif. Lancez <Code>docker container start <Var name="name">blog</Var></Code> pour le réactiver.

### Démarrer une session shell interactive {#start-an-interactive-shell-session}

Si vous voulez démarrer un shell interactif dans votre image, lancez simplement `docker run -it johndoe/blog /bin/sh`. Vous serez alors *à l'intérieur* du container et vous pourrez inspecter les fichiers, par exemple.

Attention à bien comprendre la notion de container : votre site tourne dans un container et vous venez d'en démarrer un second. Pour le prouver, lancez `rm -rf blog` pour tuer le blog dans votre container shell, retournez dans le navigateur, rafraîchissez la page : ça fonctionne toujours.

Tapez `exit` pour quitter le shell et revenir à votre console. Relancez `docker run -it johndoe/blog /bin/sh` et vérifiez si le dossier `blog` supprimé est là ou pas : il est là.

Un container est quelque chose qui est recréé à chaque fois, donc tout ce qui est fait dans un container (quand il n'y a pas de volumes montés comme celui utilisé ici) reste juste en RAM.

<AlertBox variant="note" title="Utilisez Docker Desktop - Containers si vous voulez interagir avec votre site">
Purement informatif : si vous êtes sous Windows, vous pouvez aller dans *Docker Desktop*, ouvrir la liste des containers, cliquer sur celui qui tourne (le blog) puis cliquer sur l'onglet *Exec* pour démarrer un shell interactif dans *ce* container. Si vous supprimez par exemple le dossier blog comme illustré ci-dessous, alors en retournant dans le navigateur, oui, vous avez supprimé le blog et rafraîchir le site mènera à une page d'erreur 404.

![Docker Desktop](./images/docker_desktop.webp)

Supprimez simplement le container et recréez-le pour retrouver le blog.

</AlertBox>

### La pousser sur Docker {#push-it-on-docker}

Avant de pouvoir publier votre image sur Docker Hub, assurez-vous d'abord d'être connecté.

Lancez `docker login` dans votre ligne de commande et connectez-vous avec un compte valide. *Si vous étiez déjà authentifié, vous verrez `Authenticating with existing credentials...`*

Maintenant, poussez votre image en lançant `docker image push` suivi du nom de votre image ; dans mon cas, ce sera `cavo789/blog` puisque je suis connecté en tant que `cavo789`.

### La récupérer depuis Docker Hub {#retrieve-it-from-docker-hub}

La boucle est bouclée... Vous pouvez dire à vos amis et collègues qu'ils peuvent désormais utiliser votre image en lançant simplement la commande <Code>{`docker pull <your_image> && docker run -d -p `}<Var name="port">80</Var>{`:80 --name `}<Var name="name">blog</Var>{` <your_image>`}</Code> comme je l'indiquais en préface de cet article.

Amusez-vous bien !
