---
slug: running-revealjs-with-docker
title: Améliorez vos présentations avec Quarto, reveal.js, Decktape, Docker et les DevContainers
date: 2025-12-15
description: Créez un slideshow reveal.js avec Quarto, Decktape, Docker et les DevContainers. Écrivez votre contenu en Markdown. Exportez-le en HTML et en PDF (grâce à Decktape)
authors: [christophe]
image: /img/v2/quarto_reveal_docker.webp
mainTag: quarto
series: Coding using a devcontainer
tags:
  - devcontainer
  - docker
  - quarto
  - vscode
language: fr
blueskyRecordKey: 3m7z22w3yjk2y
---
![Améliorez vos présentations avec Quarto, reveal.js, Docker et les DevContainers](/img/v2/quarto_reveal_docker.webp)

<TLDR>
Cet article détaille comment créer et gérer des présentations reveal.js avec Markdown, Quarto, Docker et les DevContainers de VSCode. Il montre comment mettre en place un projet Quarto dans un devcontainer pour écrire ses slides en Markdown, les prévisualiser en direct et voir les modifications se répercuter automatiquement. Le workflow couvre aussi l'export de la présentation en site HTML statique et en PDF de qualité grâce à Decktape : une alternative fluide aux outils traditionnels.
</TLDR>

Cela fait des années, peut-être huit, que je n'ai plus utilisé PowerPoint pour une présentation. Cliquer, glisser, redimensionner, changer la résolution des slides, mince, tout recommencer... Dessiner des zones de texte, jouer avec les polices et les tailles, déplacer les éléments... Ah non, ça suffit ! Fini PowerPoint. J'en tremble encore.

J'utilise Markdown pour toute ma documentation et mes exports (PDF, DOCX, etc.), il était donc logique de choisir [reveal.js](https://revealjs.com/), qui me permet d'écrire mes slides sans toucher la souris, juste en écrivant du Markdown.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Voir le résultat", to: "#the-result" },
    { label: "Installation", to: "#installation" },
  ]}
/>

## Le résultat {#the-result}

Une fois le devcontainer construit et le serveur de preview démarré (voir la section Installation ci-dessous), votre slideshow s'ouvre en direct dans le navigateur — écrit en Markdown, prévisualisé instantanément :

![Le slideshow tourne](./images/first_slide.webp)

Facile, non ?

## Pourquoi ça fonctionne {#why-it-works}

reveal.js est beau, simple et pratique. Il permet d'écrire des slideshows HTML depuis un seul fichier `.md`. Comme j'utilise [Quarto](https://quarto.org/) pour ma documentation et que Quarto sait générer un site reveal.js, quoi de plus naturel que de prolonger <Link to="/blog/quarto-devcontainer">un de mes articles précédents</Link> et de me fixer cet objectif : avec seulement VSCode et Docker sur ma machine, programmer un devcontainer qui me permette d'écrire et de visualiser ma présentation reveal.js, mais aussi de l'exporter en site HTML statique pour pouvoir, par exemple, déployer ma présentation sur un serveur SFTP, et enfin de générer une version PDF de la présentation où chaque slide correspond à une page en mode paysage.

- Quarto génère, depuis la même source Markdown, un slideshow reveal.js, un document Word, un PDF ou <Link to="/blog/quarto-powerpoint">une présentation PowerPoint</Link> — une source, plusieurs sorties.
- Le devcontainer isole toute la toolchain (Quarto, le serveur de preview, Decktape) — rien à installer sur l'host à part VSCode et Docker.
- L'export en HTML ou en PDF de qualité impression est intégré via Decktape — aucun outil d'export supplémentaire à configurer.

Partons à l'aventure.

## Installation {#installation}

Assurez-vous donc d'avoir VSCode et Docker sur votre machine.

### Il nous faut un projet Quarto {#we-need-a-quarto-project}

Pour cet article, l'idée est d'utiliser Quarto et non de créer un projet reveal.js directement *à la main*. En effet, Quarto nous permettra de faire bien plus de choses, comme exporter notre slideshow en document Word, en PDF ou même en <Link to="/blog/quarto-powerpoint">présentation PowerPoint</Link>, ou vers n'importe quel autre format supporté par Quarto.

Nous utiliserons Quarto pour, aussi, pouvoir générer le projet sous forme de slideshow.

#### Vous n'en avez pas encore {#you-dont-have-one-yet}

Pour illustrer cet article, téléchargez le fichier [demo.zip](./files/demo.zip) que j'ai préparé. C'est un projet de slideshow prêt à l'emploi.

Enregistrez le fichier dans un nouveau dossier sur votre disque, par exemple `/tmp/revealjs`, et dézippez-le (`unzip demo.zip`). Ensuite, rendez-vous dans le dossier fraîchement créé (`cd /tmp/revealjs/demo`) et lancez `code .` pour ouvrir le projet dans VSCode.

Dans ce projet de démo, vous trouverez déjà un dossier `.devcontainer` avec les fichiers nécessaires que je décris au chapitre suivant.

#### Vous en avez déjà un {#you-have-one}

Si vous avez déjà un projet Quarto existant, rendez-vous dedans et lancez `code .` pour ouvrir le projet dans VSCode.

Ajoutez ensuite les fichiers suivants à la racine de votre projet :

<ProjectSetup folderName="/tmp/revealjs/demo">
  <Guideline>Lancez maintenant 'code .' pour ouvrir VSCode. Appuyez sur 'F1' et sélectionnez 'Dev containers: Rebuild and Reopen in Devcontainer' pour ouvrir le projet en tant que devcontainer</Guideline>
  <Snippet filename="_quarto.yml" source="./files/_quarto.yml" />
  <Snippet filename=".devcontainer/compose.yaml" source="./files/.devcontainer/compose.yaml" />
  <Snippet filename=".devcontainer/devcontainer.json" source="./files/.devcontainer/devcontainer.json" />
  <Snippet filename=".devcontainer/Dockerfile" source="./files/.devcontainer/Dockerfile" />
</ProjectSetup>

<AlertBox variant="note" title="Les images ci-dessous sont celles de mon projet ; certaines seront forcément différentes chez vous.">
</AlertBox>

### Ouvrir le devcontainer {#open-the-devcontainer}

Dans VSCode, appuyez sur <kbd>F1</kbd> pour ouvrir la **Command Palette** puis sélectionnez **Dev containers: Rebuild and Reopen in Devcontainer**. *Si vous n'avez pas cette commande, installez l'extension VSCode [Dev Container de Microsoft](https://marketplace.visualstudio.com/publishers/Microsoft).*

VSCode va donc *reconstruire et réouvrir le projet en tant que devcontainer* : autrement dit, VSCode va d'abord construire une image Docker spécifique (telle que décrite dans le fichier `.devcontainer/Dockerfile`) et probablement télécharger d'abord l'image Docker de Quarto ; puis, une fois l'image créée, VSCode va créer un container basé sur cette image et enfin réouvrir le projet dans un environnement particulier appelé *un devcontainer*.

Le container va se construire (comptez 1 à 2 minutes la première fois).

Une fois le build terminé, VS Code affiche un écran d'accueil comme celui-ci :

![Construction du devcontainer](./images/building_devcontainer.webp)

En cliquant sur le lien `Connecting to Dev Container (show log)`, vous obtiendrez plus de détails et pourrez suivre ce qui se passe.

Après une ou deux minutes (cela n'arrive que la première fois), vous obtiendrez un écran comme celui-ci :

![Liste des commandes](./images/cheatsheet.webp)

<AlertBox variant="tip" title="Cliquez sur le bouton `+`">
Si vous n'avez pas l'écran **Terminal** comme sur l'image ci-dessus, regardez à droite de l'écran et cliquez sur le bouton `+` pour créer un nouveau terminal bash.
</AlertBox>

## Plus de démos {#more-demos}

### Prévisualiser le slideshow {#preview-the-slideshow}

Regardez la liste des commandes affichée dans le Terminal : il y en a une pour la preview. Lancez-la simplement comme suggéré, donc `quarto preview . --port 5931 --host 0.0.0.0`.

<Terminal typewriter wrap={true}>
quarto preview . --port 5931 --host 0.0.0.0
</Terminal>

Appuyez sur <kbd>Enter</kbd> pour démarrer le serveur de preview. VS Code vous demandera l'autorisation d'ouvrir le site dans votre navigateur.

![Ouverture du site](./images/external_website.webp)

Et, presque immédiatement, VSCode lancera votre navigateur et créera un nouvel onglet avec votre slideshow déjà actif — le même résultat que celui montré en haut de cet article.

#### Mettre à jour le slideshow {#updating-the-slideshow}

Comme vous le voyez, mon slideshow est en français. Traduisons-le.

Utilisez l'outil de traduction que vous voulez, moi j'utilise [DeepL](https://www.deepl.com/). Copiez un peu de contenu et traduisez-le en anglais. Retournez sur votre slideshow, rafraîchissez la page et... tadaaaaa, votre contenu est maintenant en anglais.

![Slide traduite](./images/translated_slide.webp)

Comme nous venons de le voir, les modifications de votre contenu sont automatiquement répercutées dans le navigateur.

<AlertBox variant="tip" title="Aller plus loin avec reveal.js">
Une fois votre slideshow lancé, jetez un œil à <Link to="/blog/quarto-revealjs-tips">Some tips and tricks for Quarto when rendering as a reveal.js slideshow</Link> pour affiner le rendu.
</AlertBox>

### Exporter un PDF {#export-a-pdf}

Maintenant que votre slideshow tourne, retournez dans votre Terminal (appuyez sur <kbd>CTRL</kbd>+<kbd>ù</kbd> pour l'ouvrir) et créez une nouvelle session Bash (cliquez sur le bouton `+`).

Là, lancez `decktape` dans le Terminal pour générer un fichier appelé `slides.pdf` :

<Terminal typewriter wrap={true}>
$ decktape
</Terminal>

Cela va générer un joli fichier PDF (bien meilleur que celui produit par la fonction d'export PDF de reveal.js).

### Exporter en site HTML statique {#export-as-static-html-site}

En lançant `quarto render . --output-dir build`, vous créerez un dossier `build` contenant votre slideshow :

<Terminal typewriter wrap={true}>
$ quarto render . --output-dir build
</Terminal>

<AlertBox variant="tip" title="Envie d'essayer ?">
Sur votre host, rendez-vous dans le dossier `build` et lancez `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine` pour <Link to="/blog/docker-html-site">faire tourner le slideshow</Link> en dehors de votre devcontainer.

C'est un moyen simple de vérifier que ça fonctionne.
</AlertBox>

Vous pouvez désormais lancer votre client SFTP, par exemple, et uploader le dossier `build` sur votre serveur web si c'était votre objectif.

## Conclusion {#conclusion}

Du Markdown en entrée, un slideshow prévisualisé en direct en sortie, et un PDF ou un site HTML statique quand vient le moment de livrer — tout le rituel PowerPoint (cliquer, glisser, redimensionner) a disparu, remplacé par le même workflow de devcontainer que celui utilisé pour tout le reste sur ce blog.

Si vous n'avez jamais mis en place un devcontainer Quarto, <Link to="/blog/quarto-devcontainer">Make your Quarto project Devcontainer-Ready — No More Setup Headaches</Link> détaille davantage ces fondations.
