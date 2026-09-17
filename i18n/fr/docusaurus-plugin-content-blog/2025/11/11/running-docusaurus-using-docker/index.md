---
slug: running-docusaurus-with-docker
title: Faire tourner Docusaurus avec Docker
date: 2025-11-11
description: Simplifiez le développement de votre blog Docusaurus ! Construisez une seule image Docker pour la production et utilisez les Dev Containers de VS Code pour une édition cohérente, rapide et isolée.
authors: [christophe]
image: /img/v2/docusaurus_using_docker.webp
mainTag: docusaurus
series: Running Docusaurus using Docker
tags:
  - devcontainer
  - docker
  - docusaurus
  - nodejs
  - vscode
  - yarn
language: fr
blueskyRecordKey: 3m5ec6d4zn22x
---
![Faire tourner Docusaurus avec Docker](/img/v2/docusaurus_using_docker.webp)

<TLDR>
Ce guide explique comment simplifier le développement d'un blog Docusaurus avec Docker. Il montre comment créer une seule image Docker pour les builds de production et comment exploiter les Dev Containers de VS Code pour obtenir un environnement de développement cohérent, rapide et isolé. Le setup enrichit le workflow avec des outils intégrés comme LanguageTool et Code Spell Checker pour améliorer la qualité du contenu.
</TLDR>


Simplifiez votre workflow Docusaurus avec une configuration propre et reproductible. Dans ce guide mis à jour, vous allez apprendre à maintenir un blog Docusaurus avec une seule image Docker, les DevContainers de VSCode et un workflow qui rend à la fois les builds de production et l'écriture quotidienne rapides et fiables.

Il y a dix-huit mois, j'ai publié [Encapsuler un site Docusaurus entier dans une image Docker](/blog/docker-docusaurus-prod) mais, depuis, j'ai affiné l'approche, surtout autour de la séparation propre des environnements de **production** et de **développement** (voir [Une seule image Docker pour la production et les Devcontainers - la méthode propre](/blog/docker-prod-devcontainer)).

Avec ce setup :

- Vous lancez `make build` une seule fois pour créer une image Docker de base.
- Vous démarrez votre environnement d'édition avec `make devcontainer`.
- VSCode construit et ouvre automatiquement un container isolé avec tout de configuré.

*Si Docusaurus est tout nouveau pour vous, commencez par <Link to="/blog/docusaurus-docker">Running Docusaurus with Docker</Link> ; et une fois le site construit, <Link to="/blog/github-action">GitHub - Use Actions to deploy this blog</Link> s'occupe de le publier.*

Voyons le workflow complet.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Récupérer un blog Docusaurus", to: "#retrieve-a-docusaurus-blog" },
    { label: "Créer l'image Docker de base", to: "#create-the-base-docker-image" },
  ]}
/>

Voici où on va : `make build` une fois, `make up`, et le blog tourne déjà.

<BrowserWindow url="https://localhost/blog">
  ![Le blog tourne](./images/running_prod.webp)
</BrowserWindow>

Quelques commandes plus bas et vous y serez aussi.

<StepsCard
  title="Ce que nous allons apprendre ici :"
  variant="steps"
  steps={[
    "Récupérer un blog Docusaurus,",
    "Créer une image Docker pour faire tourner le blog",
    "Ouvrir le projet dans VSCode avec les DevContainers",
    "Enrichir l'environnement avec des extensions comme LanguageTool, Code Spell Checker ou Markdown lint."
  ]}
/>

## Récupérer un blog Docusaurus {#retrieve-a-docusaurus-blog}

Si vous avez déjà un blog Docusaurus, sautez simplement ce chapitre. Pour la démonstration, nous allons utiliser le blog d'un ami, [Docux](http://docuxlab.com/), qui publie des composants et plugins Docusaurus très utiles.

Récupérez une copie de son blog en lançant les commandes ci-dessous :

<Terminal typewriter wrap={true}>
$ cd /tmp && git clone git@github.com:Juniors017/docux-blog.git && cd docux-blog
</Terminal>

## Créer l'image Docker de base {#create-the-base-docker-image}

Si vous débutez avec Docusaurus, vous vous demandez peut-être : *comment faire tourner le blog en local, tout simplement ?*. Réponse rapide : en lançant une image Docker autonome, et c'est ce que nous allons voir dans ce chapitre.

Ouvrez d'abord VSCode en lançant `code .` :

<Terminal typewriter wrap={true}>
$ code .
</Terminal>

Vous devriez maintenant voir la structure du projet dans votre éditeur.

![Le blog ouvert dans VSCode](./images/initial_after_clone.webp)

### Créer les fichiers requis {#create-required-files}

<Vars name="docusaurus" labels={{ name: "Nom du container" }} />

À la racine du projet, créez les fichiers suivants :

<ProjectSetup folderName="/tmp/docux-blog">
  <Snippet filename="compose.yaml" source="./files/compose.yaml" />
  <Snippet filename="Dockerfile" source="./files/Dockerfile" />
  <Snippet filename="localhost-key.pem" source="./files/localhost-key.pem" />
  <Snippet filename="localhost.pem" source="./files/localhost.pem" />
  <Snippet filename="makefile" source="./files/makefile" />
  <Snippet filename="nginx.conf" source="./files/nginx.conf" />
</ProjectSetup>

### Construire et lancer l'image de production {#build-and-run-the-production-image}

Une fois les fichiers en place, lancez `make` dans une console et vous obtiendrez un écran comme celui-ci :

![Obtenir la liste des targets](./images/make_help.webp)

Si `make` n'est pas encore installé sur votre machine, vous obtiendrez une erreur : installez donc d'abord `make` :

<Terminal typewriter wrap={true}>
$ sudo apt-get update && sudo apt-get install make
</Terminal>

Nous devons maintenant lancer deux commandes. La première va créer une image Docker pour la production, c'est-à-dire où tout est inclus dans l'image.

<Terminal typewriter wrap={true}>
$ TARGET=production make build
</Terminal>

Vous obtiendrez un écran comme celui-ci et il faudra patienter environ 80 secondes le temps que l'image soit construite.

![Lancement de make build pour la PROD](./images/make_build.webp)

Cela fait, lancez la seconde commande pour créer une instance en cours d'exécution de l'image, c'est-à-dire un container :

<Terminal typewriter wrap={true}>
$ TARGET=production make up
</Terminal>

Ce sera très rapide et vous verrez dans la console un message indiquant `Open the PROD blog (https://localhost)`.

Et vous savez quoi ? C'est déjà fait : rendez-vous sur `https://localhost` et laissez-vous surprendre — le blog tourne, exactement le résultat annoncé en haut de cet article.

<AlertBox variant="note" title="Qu'avons-nous fait ?">
En lançant `TARGET=production make build`, nous avons créé une version autonome du blog tournant sur nginx. Nous avons encapsulé tous les articles du blog (des fichiers Markdown) et lancé toutes les commandes nécessaires pour générer la version statique du blog. Nous avons *garé* ces fichiers dans un emplacement temporaire.

Nous avons créé l'image finale en utilisant nginx et en copiant dans l'image les fichiers statiques créés plus tôt.

En lançant `TARGET=production make up`, nous avons créé une instance en cours d'exécution (appelée `container`) de cette image et demandé à notre système d'exploitation d'accéder au container sur le port `443` (celui du protocole `https`). C'est pourquoi, en accédant à `https://localhost`, nous obtenons le site.
</AlertBox>

## Utiliser les DevContainers pour le développement {#using-devcontainers-for-development}

Construire l'image de production, c'est bien et utile si vous voulez la publier sur Docker Hub, mais il nous faut aussi un workflow d'édition confortable. Avec les DevContainers de VS Code, nous obtenons un environnement totalement isolé, taillé pour Docusaurus.

Lancez d'abord `make build` (notez qu'ici, nous ne précisons pas `TARGET=production`). Ce sera extrêmement rapide puisque tout a déjà été créé avant.

Ensuite, lancez `make devcontainer` pour ouvrir VSCode et... rien ne se passe pour l'instant : c'est normal, nous devons créer des fichiers supplémentaires.

<AlertBox variant="tip" title="Les deux en une seule commande">
Sous Linux, vous pouvez lancer `make build && make devcontainer` pour exécuter les deux en une seule commande.
</AlertBox>

### Créer le dossier .devcontainer {#create-the-devcontainer-folder}

Nous devons créer un nouveau dossier `.devcontainer` avec quelques fichiers :

<ProjectSetup folderName="/tmp/docux-blog">
  <Snippet filename=".devcontainer/.env" source="./files/.devcontainer/.env" />
  <Snippet filename=".devcontainer/bootstrap.sh" source="./files/.devcontainer/bootstrap.sh" />
  <Snippet filename=".devcontainer/bash_helpers.sh" source="./files/.devcontainer/bash_helpers.sh" />
  <Snippet filename=".devcontainer/compose.yaml" source="./files/.devcontainer/compose.yaml" />
  <Snippet filename=".devcontainer/devcontainer.json" source="./files/.devcontainer/devcontainer.json" />
  <Snippet filename=".devcontainer/Dockerfile" source="./files/.devcontainer/Dockerfile" />
</ProjectSetup>

<AlertBox variant="danger" title="Utilisez bien vos propres UID/GID">
Éditez le fichier `.devcontainer/.env` et vérifiez que ces valeurs correspondent bien aux vôtres : lancez `id -u` dans votre console et vérifiez que vous obtenez `1000`. Si ce n'est pas le cas, reportez la valeur obtenue (p.ex. `1002`) dans `OS_USERID` et faites de même avec la commande `id -g`, ici pour la variable `OS_GROUPID`.
</AlertBox>

Comme nous avons deux scripts bash, nous devons les rendre exécutables. Lancez cette commande dans un terminal :

<Terminal typewriter wrap={true}>
$ chmod +x .devcontainer/bootstrap.sh .devcontainer/bash_helpers.sh
</Terminal>

Il nous faut maintenant ouvrir le devcontainer, alors lancez :

<Terminal typewriter wrap={true}>
$ make build && make devcontainer
</Terminal>

Une fois dans VSCode, appuyez sur <kbd>F1</kbd> pour ouvrir la **Command Palette** et lancez **Dev Containers: Rebuild Without Cache and Reopen in Container**.

<AlertBox variant="note" title="Vous ne l'avez pas ?">
Si vous n'avez pas cette commande, installez l'extension VSCode [Dev Container de Microsoft](https://marketplace.visualstudio.com/publishers/Microsoft).

</AlertBox>

![Devcontainer](./images/devcontainer_rebuild.webp)

Cliquez donc pour lancer l'action **Dev Containers: Rebuild and Reopen in Container**. Si vous regardez le terminal (depuis VSCode), vous verrez beaucoup de messages comme ceux ci-dessous :

![Construction du devcontainer](./images/building_devcontainer.webp)

À un moment donné, vous verrez ceci :

![Yarn run](./images/yarn_run.webp)

Cela signifie que Docusaurus est prêt à servir votre contenu.

Rendez-vous sur `https://localhost:3000` et tadaaa.

<BrowserWindow url="https://localhost:3000">
  ![Le site tourne](./images/site_is_running.webp)
</BrowserWindow>

Jouons un peu. Ouvrez le dossier `blog` et créez un nouveau fichier appelé `index.md` :

![Création d'un nouvel article](./images/new_blog_post.webp)

Sauvegardez et, oh ?, votre navigateur reflète immédiatement le changement (le hot reload est bien activé) :

<BrowserWindow url="https://localhost/blog/index/">
  ![Le nouvel article est déjà en ligne](./images/new_blog_post_running.webp)
</BrowserWindow>

### Utiliser le terminal depuis le devcontainer {#running-the-terminal-from-the-devcontainer}

Un autre point vraiment sympa : l'utilisation du **Terminal**, toujours dans VSCode.

En cas de besoin, appuyez sur <kbd>CTRL</kbd>+<kbd>ù</kbd> pour ouvrir le Terminal et repérez le bouton `+` en haut à droite de cette fenêtre. Cliquez sur le `+` pour en créer un nouveau :

![Utilisation du terminal dans le devcontainer](./images/devcontainer_terminal.webp)

Vous avez vu ? Vous obtenez un écran d'accueil avec quelques actions à lancer. Par exemple, pour mettre à jour Docusaurus vers la dernière version, il suffit de lancer `upgrade` et c'est tout.

Pourrait-on faire plus simple ?

<AlertBox variant="tip" title="D'où vient cet écran d'accueil ?">
Voyez le fichier `.devcontainer/bash_helpers.sh` que vous avez copié/collé précédemment.

Vous trouverez dans ce script Bash la mise en forme de l'écran d'accueil ainsi que quelques alias comme `version` pour obtenir la version de l'instance Docusaurus installée.
</AlertBox>

## Quels sont les avantages d'une telle approche ? {#what-are-the-advantages-of-such-approach}

Ils sont si nombreux... Commençons par celui-ci : sur mon host, je n'ai que Docker et rien d'autre. Je n'ai pas besoin d'installer `Node` comme l'exige Docusaurus, ni aucune dépendance Linux.

Je peux aussi construire mon blog comme une image autonome. Regardez mon image Docker `cavo789/blog` sur [https://hub.docker.com/r/cavo789/blog](https://hub.docker.com/r/cavo789/blog). Si vous voulez la faire tourner sur votre propre machine, il suffit de lancer `docker pull cavo789/blog && docker run -d -p 443:443 --name blog cavo789/blog` puis d'aller sur `https://localhost` et c'est tout.

Avec un Devcontainer comme illustré dans cet article, vous pouvez aussi affiner votre environnement, c'est-à-dire indiquer quelle extension doit être installée dans VSCode et comment elle doit être configurée. Vous pouvez également définir le look&feel de l'éditeur (la police, la taille, la couleur, le template, ...).

Comme tout est isolé, vous pouvez *jeter* le container et le recréer sans douleur.

Vous travaillez en équipe ? Le devcontainer est alors la voie à suivre puisque tout le monde aura exactement le même environnement.

## Utiliser LanguageTool dans VSCode {#using-languagetool-in-vscode}

Voyons l'un des nombreux avantages : plutôt que de *simplement utiliser VSCode pour écrire nos articles*, utilisons LanguageTool qui fournit une vérification de base de la grammaire et de l'orthographe de vos articles.

Et vous savez quoi ? Vous l'avez déjà. Regardez votre fichier `.devcontainer/compose.yaml`. Vous verrez un service appelé `languagetool` basé sur une image Docker appelée **erikvl87/languagetool**. Et maintenant, regardez votre fichier `.devcontainer/devcontainer.json`. Cherchez **languageToolLinter** et vous verrez une URL locale (basée sur une IP) ; c'est celle exposée par le service. Cherchez ensuite l'extension **davidlday.languagetool-linter**, c'est elle qui fait la magie.

Voici un exemple de LanguageTool à l'œuvre :

![LanguageTool en action](./images/language_tool_in_action.webp)

Bien sûr, la phrase correcte devrait être *This example illustrates LanguageTool in action*.

## Code Spell Checker {#code-spell-checker}

Voici un autre exemple, une erreur qu'un francophone peut faire par inadvertance :

![Le mot example est mal orthographié](./images/example_is_misspelled.webp)

Ici, l'extension utilisée est *Code Spell Checker* de **streetsidesoftware**.

## Markdown lint {#markdown-lint}

Et peut-être que, pendant que vous écrivez votre contenu Markdown, VSCode vous affichera des erreurs en orange comme `MD047/single-training-newline` pour vous dire que vous avez oublié d'ajouter une ligne vide tout en bas du fichier.

Ces avertissements viennent de Markdownlint, une autre extension déjà installée dans le devcontainer.
