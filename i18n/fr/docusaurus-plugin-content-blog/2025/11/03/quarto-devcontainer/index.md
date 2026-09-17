---
slug: quarto-devcontainer
title: Rendez votre projet Quarto prêt pour les Devcontainers — fini les galères de configuration
authors: [christophe]
image: /img/v2/devcontainer_quarto.webp
series: Discovering Quarto
description: Convertissez n'importe quel projet Quarto en devcontainer totalement portable et piloté par VSCode, en quelques minutes.
mainTag: devcontainer
tags:
  - code-quality
  - devcontainer
  - docker
  - markdown
  - quarto
  - vscode
blueskyRecordKey: 3m4piap723s2r
date: 2025-11-03
updates:
  - date: 2025-12-12
    note: Extra - Install GraphViz as optional dependency
---

<!-- markdownlint-disable MD046 -->
<!-- cspell:ignore  -->

![Rendez votre projet Quarto prêt pour les Devcontainers — fini les galères de configuration](/img/v2/devcontainer_quarto.webp)

<TLDR>
Cet article explique comment convertir n'importe quel projet Quarto en devcontainer portable piloté par VSCode, pour éliminer les galères de configuration. En ajoutant trois fichiers de configuration précis (`compose.yaml`, `Dockerfile`, `devcontainer.json`), vous obtenez un environnement de développement complet. Cette configuration inclut Quarto préinstallé, des extensions VSCode configurées, ainsi que des fonctionnalités comme la prévisualisation automatique et des pre-commit hooks optionnels, ce qui simplifie le workflow de documentation.
</TLDR>


J'adore utiliser Quarto et j'ai des tonnes de projets de *documentation* sur mon disque. J'écris de la documentation utilisateur, de la documentation développeur et aussi des guides d'installation pour quasiment chaque projet que je code.

Si vous n'avez jamais lancé Quarto via Docker, <Link to="/blog/docker-quarto">Running Quarto Markdown in Docker</Link> est un bon point de départ ; cet article part de cette idée pour vous offrir un devcontainer VSCode complet.

L'idée m'est vite venue de créer une image Docker pour pouvoir développer ma documentation tranquillement, ainsi qu'une configuration devcontainer pour VSCode. Maintenant, quand je veux écrire ma documentation, en moins d'une minute, je peux créer un environnement entièrement dédié à la rédaction de documentation.

Entre autres, j'installe Quarto, j'installe et configure plusieurs extensions pour VSCode, et je lance Quarto en mode preview : dès que j'enregistre une modification, Quarto régénère la documentation tout seul.

Voyons comment faire ; vous allez voir, c'est vraiment simple.

*Le même devcontainer, spécialisé pour les diaporamas, est utilisé dans <Link to="/blog/running-revealjs-with-docker">Level Up Your Presentations with Quarto, reveal.js, Decktape, Docker and DevContainers</Link> ; et poussé à l'échelle industrielle dans <Link to="/blog/quarto-industrialisation">Quarto - How I Built a Self-Documenting Ecosystem for 50+ Projects</Link>.*

<!-- truncate -->

<QuickJump
  links={[
    { label: "Commençons par un projet Quarto simple", to: "#lets-get-a-simple-quarto-project-first" },
    { label: "Nous allons devoir créer trois fichiers", to: "#well-need-to-create-three-files" },
  ]}
/>

## Commençons par un projet Quarto simple {#lets-get-a-simple-quarto-project-first}

Bien sûr, si vous en avez déjà un, allez directement dans votre projet. Ici, pour ce billet, nous allons simplement réutiliser un projet existant.

En lançant les commandes ci-dessous dans une console, vous téléchargerez uniquement le dossier `brand` du projet `quarto-examples` :

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

Lancez `code .` pour ouvrir le projet dans VSCode et vous obtiendrez ceci :

![Ouverture du projet brand-simple dans VSCode](./images/opening-in-vscode.webp)

Voici où nous allons : ouvrir ce même projet comme devcontainer, lancer `quarto preview .`, et le site tourne déjà — sans aucune installation de Quarto sur votre host.

![Lancement de quarto preview](./images/running_in_preview_mode.webp)

![Le site tourne déjà](./images/preview.webp)

Ridiculement simple, non ? Construisons ça, en commençant par trois fichiers.

## Nous allons devoir créer trois fichiers {#well-need-to-create-three-files}

Pour obtenir les meilleures performances en termes de vitesse de build de l'image Docker et d'utilisation du mécanisme de cache de Docker, nous allons devoir créer trois fichiers :

Le fichier `.devcontainer/compose.yaml` est nécessaire pour dire à VSCode de créer notre image Docker si elle n'existe pas encore, ou de la réutiliser si elle existe. Ce fichier est donc essentiel côté performances.

Le fichier `.devcontainer/Dockerfile` définit notre image Docker : les binaires dont nous avons besoin, la configuration utilisateur, etc.

Le fichier `.devcontainer/devcontainer.json` est utilisé par VSCode pour comprendre et construire notre environnement de travail.

<ProjectSetup folderName="/tmp/quarto-examples/brand/brand-simple">
  <Snippet filename=".devcontainer/compose.yaml" source="./files/compose.yaml" />
  <Snippet filename=".devcontainer/Dockerfile" source="./files/Dockerfile" />
  <Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />
</ProjectSetup>

<AlertBox variant="info">
À strictement parler, nous n'avons pas besoin du fichier `.devcontainer/compose.yaml`, mais c'est le seul moyen de construire l'image Docker **une seule fois** et de la réutiliser sur plusieurs projets.

En ouvrant un Devcontainer, même si le `Dockerfile` est strictement identique dans tous vos projets de documentation, le contexte sera différent (**project1**, **project2**, ...) et VSCode reconstruira l'image pour ce contexte. Pour éviter ça, il faut construire l'image et **lui donner un nom** ; ce n'est possible qu'avec un fichier `.devcontainer/compose.yaml`.

</AlertBox>

## Informations supplémentaires (optionnel — passez si les valeurs par défaut vous conviennent) {#extra-information-optional--skip-if-the-defaults-work-for-you}

### Installation de sudo {#installation-of-sudo}

Pendant la création de l'image Docker, nous installons aussi la commande `sudo` et autorisons notre utilisateur `vscode` à lancer `sudo su root` dans le devcontainer sans devoir saisir de mot de passe. La raison : parfois, Quarto se plaint d'une dépendance manquante (par exemple lors d'un export en PDF, quand une librairie manque). Pour permettre au développeur d'ajouter rapidement la dépendance et de faire quelques tests sans devoir reconstruire le container encore et encore, `sudo` est installé.

## Arguments de build (optionnel — ne lisez que ceux qui vous concernent) {#build-arguments-optional--read-only-the-ones-you-need}

### Installation de Chromium {#installation-of-chromium}

Si vous regardez le fichier `.devcontainer/compose.yaml`, vous verrez un argument appelé `INSTALL_CHROMIUM`. Selon votre projet, vous en aurez besoin ou pas.

En effet, dans certaines situations, lors du rendu de votre documentation en Word (c'est-à-dire en lançant par exemple `quarto render . --profile docx --to docx`), Quarto peut vous demander d'installer Chromium. Pour éviter de le faire chaque fois, ouvrez simplement le fichier `.devcontainer/devcontainer.json`, cherchez `INSTALL_CHROMIUM` et mettez-le à `true`.

Note : si vous modifiez le code du `.devcontainer/Dockerfile` ou le fichier `.devcontainer/devcontainer.json`, vous devrez reconstruire le container comme expliqué ci-dessous.

<AlertBox variant="info" title="Assurez-vous d'en avoir besoin">
Avant d'installer Chromium, assurez-vous d'en avoir besoin : faites d'abord le rendu de votre documentation sans lui et voyez si Quarto se plaint de Chromium. Chromium demande beaucoup de dépendances et fera considérablement grossir la taille de votre image Docker.

</AlertBox>

### Installation de Code Spell Checker {#installation-of-code-spell-checker}

De la même manière, vous avez une variable appelée `INSTALL_CSPELL`. Mettez-la à `true` si vous voulez installer l'outil Code-spell check (nécessite Node.js).

### Installation de GraphViz {#installation-of-graphviz}

De la même manière, vous avez une variable appelée `INSTALL_GRAPHVIZ`. Mettez-la à `true` si vous voulez installer le convertisseur GraphViz.

C'est nécessaire quand, dans votre fichier `.qmd`, vous avez un graphe comme celui-ci :

```markdown
digraph flow {
  rankdir = LR;

  A [shape=box, label="Source"];
  B [shape=ellipse, label="Processor"];
  C [shape=box, label="Destination"];

  A -> B;
  B -> C;
}
```

<AlertBox variant="note" title="GraphViz">
Si vous avez un graphe Graphviz et que vous n'avez pas installé GraphViz, vous obtiendrez une erreur comme celle-ci : `ERROR: AssertionError: Error occurred during cleanup: TypeError: Child process has already terminated`.
</AlertBox>

### Installation des pre-commit-hooks {#installation-of-pre-commit-hooks}

La troisième variable est `INSTALL_PRECOMMIT_HOOKS` et, si votre documentation a son propre dossier `.git`, ce sera une bonne idée de mettre la variable à `true` : ainsi, lors du commit de vos modifications, quelques contrôles de qualité des données et outils de formatage seront appliqués.

## Ouvrir notre projet comme Devcontainer {#opening-our-project-as-a-devcontainer}

Maintenant, appuyez juste sur <kbd>F1</kbd> (ou <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd>) et sélectionnez **Dev Containers: Rebuild and Reopen in Container**. Si vous n'avez pas cette commande, vérifiez que l'extension `ms-vscode-remote.remote-containers` de Microsoft est bien installée.

<AlertBox variant="info" title="Le remote container de Microsoft">
Vous pouvez installer l'extension depuis la console en lançant `code --install-extension ms-vscode-remote.remote-containers` ou en ouvrant cette page : [Marketplace - Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).
</AlertBox>

Donc, une fois la commande **Dev Containers: Rebuild and Reopen in Container** lancée, VSCode fermera votre session courante et en ouvrira une nouvelle. La toute première fois, VSCode devra faire quelques initialisations (comme construire l'image Docker et télécharger les extensions, ce sera donc plus lent).

Après quelques secondes, vous obtiendrez un écran comme celui-ci :

![Le Devcontainer a été ouvert](./images/devcontainer.webp)

1. En bas à gauche, dans la barre de statut, vous avez le texte "Dev Container: xxx" (suivi du nom de notre container tel que configuré dans le fichier `devcontainer.json`).
2. Dans la **fenêtre Terminal** (si vous ne la voyez pas, appuyez sur <kbd>CTRL</kbd>+<kbd>ù</kbd>), vous verrez un pense-bête avec les commandes principales, comme `quarto preview .` pour lancer le site avec le hot reload.

Donc, toujours dans le Terminal, tapez `quarto preview .` puis appuyez sur <kbd>Enter</kbd> — vous obtiendrez la même sortie que celle déjà montrée en haut de cet article.

En théorie, votre navigateur sera lancé automatiquement et le site ouvert, affichant le même résultat que celui déjà montré plus haut. Sinon, suivez simplement le lien en appuyant sur <kbd>ALT</kbd> et en cliquant dessus.

Ridiculement simple, non ?

## Qu'avons-nous fait ? {#what-have-we-done}

À ce stade, qu'avons-nous fait ? Nous avons récupéré un projet de site Quarto et nous nous sommes assurés de le « dockeriser ».

Regardons le fichier `_quarto.yml` du projet que nous venons de cloner (vous trouverez plus d'informations sur le site officiel de Quarto : [Creating a website](https://quarto.org/docs/websites/)) :

<Snippet filename="_quarto.yml" source="./files/_quarto.yml" />

Nous avons ajouté trois fichiers au projet, dans un dossier spécial appelé `.devcontainer`. Ce dossier indique à VSCode que nous souhaitons utiliser un container Docker quand nous travaillons sur ce projet. Le container sera basé sur une image Docker personnalisée (telle que codée dans `.devcontainer/Dockerfile`). L'image réutilisera l'image officielle de Quarto.

Ainsi, sans devoir installer Quarto sur notre machine, nous pourrons utiliser toutes les fonctionnalités de Quarto.

Enfin, nous devons *basculer vers le devcontainer* : juste après avoir ouvert VSCode, nous devons lancer une commande spéciale pour rouvrir le projet comme devcontainer.

Cette commande est, la première fois, **Dev Containers: Rebuild and Reopen in Container** mais, dès que l'image personnalisée a été créée une fois, nous pouvons simplement utiliser **Dev Containers: Reopen in Container**.

## Rédiger notre documentation {#writing-our-documentation}

Jusqu'ici, nous avons déjà lancé `quarto preview .` dans un terminal. La documentation a été générée et notre site est déjà affiché (sur `http://localhost:7519` ou tout autre port).

Testons le hot reload : éditez le fichier `index.qmd` que vous trouverez dans le dossier racine et changez quelque chose. Par exemple, remplacez le mot `Overview` par `Preface` et enregistrez.

![La synchronisation est déjà activée](./images/synchronization-enabled.webp)

Comme vous le voyez sur l'image ci-dessus, il me suffit de faire une modification, d'enregistrer mon fichier et d'attendre moins d'une seconde pour que le site soit mis à jour automatiquement. Rien à faire (je n'ai pas besoin de rafraîchir la page). Simple, non ?

## Utiliser le terminal {#using-the-terminal}

Allez dans la **fenêtre Terminal** (si vous ne la voyez pas, appuyez sur <kbd>CTRL</kbd>+<kbd>ù</kbd>).

Regardez maintenant la partie droite : il y a un terminal `Configuring...` mais aussi un `bash workspace` (le nom de notre projet). Si vous ne le voyez pas, regardez juste au-dessus de `Configuring...` et cliquez sur le bouton `+`.

![Le terminal](./images/terminal.webp)

Comme vous le voyez, vous avez quelques *instructions*. Ces instructions ont été codées dans la dernière partie du fichier `.devcontainer/Dockerfile`. Elles sont là juste pour aider l'utilisateur la première fois.

Donc, si votre objectif est de générer la documentation finale, vous pouvez toujours vous dire *Ah oui, il me suffit de lancer `quarto render .`*

## Qu'est-ce que pre-commit ? {#what-is-pre-commit}

Dans ce projet, j'ai prévu l'installation de [pre-commit](https://pre-commit.com/). C'est un outil optionnel qui lancera quelques contrôles sur votre projet avant que vous ne le poussiez vers votre système de versioning (comme GitHub ou GitLab). *Je lui ai consacré un article complet : <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link>.*

En ajoutant `pre-commit` dans le devcontainer, vous aurez le privilège de ne plus jamais commiter de fichiers avec des défauts comme, par exemple, des problèmes de formatage dans votre contenu Markdown.

Si cette idée vous plaît, créez le fichier `.pre-commit-config.yaml` dans le dossier racine de votre projet (donc pas dans le dossier `.devcontainer` mais dans son dossier parent).

Copiez/collez simplement le contenu ci-dessous :

<Snippet filename=".pre-commit-config.yaml" source="./files/.pre-commit-config.yaml" />

Une fois ce fichier en place, quand vous lancerez la commande `git commit` depuis le terminal (<kbd>CTRL</kbd>+<kbd>ù</kbd>), `git` lancera d'abord `pre-commit` pour exécuter les *hooks*. Dans le fichier `.pre-commit-config.yaml` ci-dessus, nous avons défini deux hooks : le premier pour faire des vérifications génériques sur les fichiers, puis un second pour s'assurer qu'il n'y a pas d'erreurs de linting dans les fichiers `.md` (consultez le repo officiel pour plus d'infos).

Ces hooks sont déclenchés chaque fois que vous commitez des fichiers (et uniquement sur les fichiers commités ; pas sur tout le projet).

Vous pouvez aussi forcer l'exécution des hooks sans commiter, en lançant `pre-commit run --all-files` dans la console.

Cette commande vérifiera tous les fichiers.

`pre-commit` est un outil précieux pour garantir le respect des standards de qualité établis dans l'industrie.

## Conclusion {#conclusion}

Avec seulement trois fichiers (`.devcontainer/compose.yaml`, `.devcontainer/Dockerfile` et `.devcontainer/devcontainer.json`), nous avons converti un projet simple en Devcontainer où Quarto est préinstallé, les extensions installées et configurées, et où des fonctionnalités comme la prévisualisation automatique tournent.

Cool, non ?
