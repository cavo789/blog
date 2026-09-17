---
slug: docker-quarto
title: Exécuter Quarto Markdown dans Docker
date: 2023-12-21
description: Exécutez Quarto Markdown dans Docker pour générer facilement de la documentation et des slideshows. Apprenez à construire votre propre image Docker et à rendre du Markdown en PDF, HTML et Reveal.js.
authors: [christophe]
image: /img/v2/quarto.webp
series: Discovering Quarto
mainTag: quarto
tags:
  - doc-as-code
  - docker
  - markdown
  - quarto
language: fr
updates:
  - date: 2024-11-19
    note: review Dockerfile, use Quarto 1.6.36.
  - date: 2026-07-30
    note: Updated Dockerfile to Quarto 1.10.18 (was 1.6.36).
---
<!-- cspell:ignore rsvg,ggplot2,gdebi,renv,tlmgr,fvextra,footnotebackref,pagecolor,sourcesanspro,sourcecodepro,Aoption -->
![Exécuter Quarto Markdown dans Docker](/img/v2/quarto.webp)

<TLDR>
Cet article montre comment exécuter Quarto (un outil basé sur Pandoc qui convertit du Markdown en PDF, HTML, Word, ePub ou slideshows reveal.js) via Docker, soit en construisant une image personnalisée à partir d'un `Dockerfile`, soit en utilisant l'image prête à l'emploi `ghcr.io/quarto-dev/quarto`. Il détaille le rendu d'un même fichier Markdown en PDF, en HTML et en présentation reveal.js multi-slides avec `quarto render test.md --to <format>`.
</TLDR>

[Quarto](https://quarto.org/) est un outil pour produire des PDF, des documents Word, des pages web HTML, des fichiers ePub, des slideshows et bien d'autres sorties encore à partir d'un fichier Markdown.

Avec Quarto, vous pouvez transformer n'importe quel contenu markdown en un nouveau PDF par exemple.

Quarto propose énormément de fonctionnalités, auxquelles s'ajoutent les extensions de sa communauté, ce qui en fait un outil vraiment pratique pour quiconque souhaite produire de la documentation.

Personnellement, je n'ai plus utilisé de traitement de texte du genre Word depuis plusieurs années ; ni PowerPoint — je ne sais même plus quand c'était la dernière fois.

Et pourtant, je produis beaucoup de documentation et de slideshows. J'écris tout en Markdown et je génère des PDF ou des slideshows depuis le même contenu.

Jusqu'il y a peu, j'utilisais [pandoc](https://pandoc.org/) mais, après avoir pris le temps d'explorer Quarto, c'est nettement plus puissant.

<!-- truncate -->

Comme toujours sur ce blog, vous n'allez pas installer Quarto à l'ancienne. Vous allez l'exécuter depuis une image Docker — et vous n'avez même pas besoin de construire cette image vous-même.

## Générez votre premier PDF, sans rien installer {#render-your-first-pdf-without-installing-anything}

Créez un dossier temporaire (`mkdir -p /tmp/docker-quarto && cd $_`), déposez-y un fichier Markdown nommé `test.md` et lancez :

<Terminal typewriter>
$ docker run -it --rm -v .:/input -w /input -u $(id -u):$(id -g) ghcr.io/quarto-dev/quarto:latest quarto render test.md --to pdf
</Terminal>

<Terminal typewriter source="./files/terminal-1.txt" />

Un fichier `test.pdf` se trouve maintenant à côté de votre Markdown, vous en êtes le propriétaire, et il ressemble à ceci :

![Votre fichier PDF](./images/pdf_version.webp)

Cette image est l'image officielle de Quarto — rien à construire, rien d'installé sur votre machine, et le container se supprime tout seul dès que le rendu est terminé.

<AlertBox variant="info" title="Rappel sur la CLI Docker">
Pour rappel, les options de la commande Docker run utilisées sont (presque toujours les mêmes) :

- `-it` pour démarrer Docker en mode interactif, ce qui permet au script exécuté dans le container de vous poser des questions par exemple,
- `--rm` pour demander à Docker de tuer et supprimer le container dès que le script a été exécuté (sinon vous vous retrouverez avec une longue liste de containers Docker arrêtés mais non supprimés ; vous pouvez le vérifier en n'utilisant pas le flag `--rm` puis en lançant `docker container list` dans la console),
- `-v .:/input` pour partager votre dossier courant avec un dossier appelé `/input` dans le container Docker,
- `-w /input` pour indiquer à Docker que le répertoire courant, dans le container, sera le dossier `/input`,
- `-u $(id -u):$(id -g)` demande à Docker de réutiliser vos identifiants locaux : ainsi, quand un fichier est modifié ou créé dans le container, il vous appartiendra,
- ensuite le nom de l'image Docker de Quarto, et, enfin,
- `quarto render test.md --to pdf` c'est-à-dire la ligne de commande à lancer dans le container.

</AlertBox>

<AlertBox variant="info" title="Masquer les informations non essentielles">
Ajoutez l'argument CLI `--log-level warning` à Quarto pour ne lui faire afficher que les avertissements (et les erreurs). La sortie non essentielle sera masquée et vous garderez une console propre.

</AlertBox>

## Le fichier source {#the-source-file}

Voici le `test.md` utilisé ci-dessus :

<Snippet filename="/tmp/docker-quarto/test.md">

```markdown
# What is Quarto? Explain like I'm five

Imagine you want to write a story or a report, but instead of using a fancy computer program, you use plain text. That's kind of like Markdown, a simple language that lets you format your text without getting too complicated.

Now, Quarto is like a super-powered writing tool that understands Markdown and can also help you write code in different languages, like R or Python. It's like having a helper in your writing process, making things easier and more fun.

So, if you want to create documents, presentations, or even books, Quarto and Markdown can be your friends. They'll help you organize your thoughts, add cool features, and even share your work with the world.
```

</Snippet>

**Référez-vous à la documentation officielle de [Quarto](https://quarto.org/) pour tout savoir en détail sur le Markdown qu'il accepte.**

La seule chose qui change d'un format de sortie à l'autre, c'est l'argument `--to`.

## Le même fichier, en HTML et en slideshow {#the-same-file-as-html-and-as-a-slideshow}

Modifiez simplement l'argument `--to` et remplacez `pdf` par `html` : `docker run -it --rm -v .:/input -w /input -u $(id -u):$(id -g) ghcr.io/quarto-dev/quarto:latest quarto render test.md --to html --log-level warning`

Vous avez maintenant un fichier `test.html` dans votre répertoire.

Pour un slideshow, l'argument `--to` doit valoir `revealjs` : `docker run -it --rm -v .:/input -w /input -u $(id -u):$(id -g) ghcr.io/quarto-dev/quarto:latest quarto render test.md --to revealjs --log-level warning`

Ouvrez le fichier `test.html` et vous obtiendrez ceci :

![Revealjs - un slide](./images/revealjs_version1.webp)

Ok, vous n'avez qu'un seul slide pour l'instant. Réouvrez le fichier `test.md` et insérez des *sauts de slide*. Cela se fait avec la syntaxe `----` :

<Snippet filename="/tmp/docker-quarto/test.md">

```markdown
# What is Quarto? Explain like I'm five

Imagine you want to write a story or a report, but instead of using a fancy computer program, you use plain text. That's kind of like Markdown, a simple language that lets you format your text without getting too complicated.

----

Now, Quarto is like a super-powered writing tool that understands Markdown and can also help you write code in different languages, like R or Python. It's like having a helper in your writing process, making things easier and more fun.

----

So, if you want to create documents, presentations, or even books, Quarto and Markdown can be your friends. They'll help you organize your thoughts, add cool features, and even share your work with the world.
```

</Snippet>

Relancez la commande `--to revealjs` pour régénérer le slideshow en tant que fichier `test.html`.

<AlertBox variant="info">
Lancez simplement `docker run -d --name static-site -p 8080:80 -v .:/usr/local/apache2/htdocs/ httpd:alpine` puis rendez-vous sur `http://127.0.0.1:8080/test.html` pour voir votre slideshow.

</AlertBox>

Votre slideshow comporte maintenant trois slides (appuyez sur <kbd>espace</kbd> ou sur les flèches pour naviguer) :

![Revealjs - slide 1](./images/revealjs_slide1.webp)

![Revealjs - slide 2](./images/revealjs_slide2.webp)

![Revealjs - slide 3](./images/revealjs_slide3.webp)

<AlertBox variant="info" title="Déployez simplement votre slideshow en ligne">
Le plus sympa, c'est que votre slideshow est prêt à être déployé sur votre serveur distant. Copiez le fichier html et le dossier associé (dans notre cas ici, le fichier `test.html` et le dossier `test_files`) sur votre serveur FTP par exemple et votre site sera accessible publiquement. Pas mal, non ?

</AlertBox>

## Construire votre propre image (facultatif — passez si l'image officielle suffit) {#build-your-own-image-optional--skip-it-if-the-official-one-is-enough}

Il existe un certain nombre d'images prêtes à l'emploi sur Internet pour répondre à vos besoins. Vous les trouverez sur [https://gitlab.com/quarto-forge/docker](https://gitlab.com/quarto-forge/docker). L'image dite `Tier 0` — celle utilisée ci-dessus, `ghcr.io/quarto-dev/quarto:latest` — convient pour générer des sorties html / revealjs.

Vous voudrez votre propre image le jour où vous aurez besoin de quelque chose qu'elle ne fournit pas : un package LaTeX pour une mise en page PDF particulière, R ou Python pour des cellules de code exécutables, une police, une extension Quarto intégrée.

Créez un nouveau fichier appelé `Dockerfile` (il n'y a pas d'extension) avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Ceci fait, lancez `docker build -t cavo789/quarto .` et après environ trois minutes la première fois, vous obtiendrez votre propre image Docker :

<Terminal typewriter wrap={false}  source="./files/terminal-2.txt" />

<AlertBox variant="info" title="Choisissez votre propre nom">
L'instruction précédente `docker build -t cavo789/quarto .` a créé une image appelée `cavo789/quarto`. Vous pouvez évidemment choisir un autre nom sans le moindre impact sur l'image.

</AlertBox>

À partir de là, toutes les commandes de cet article fonctionnent de la même façon : remplacez juste `ghcr.io/quarto-dev/quarto:latest` par `cavo789/quarto`.

Vous pouvez vérifier rapidement la taille de votre image ; elle est plutôt énorme mais, sauf si vous êtes vraiment à court de mémoire ou d'espace disque, ce n'est pas un problème.

<Terminal typewriter>
$ docker image list | grep quarto
cavo789/quarto  latest  fe1d20bd71a6  1 minute ago  1.55GB
</Terminal>

## Pour aller plus loin {#going-further}

Un seul fichier Markdown, trois valeurs de `--to`, trois livrables complètement différents — et pas une seule application installée sur votre machine. C'est ce que je trouve encore remarquable : la source de mon PDF, de ma page web et de mon slideshow est le même fichier texte, donc ils ne peuvent jamais diverger.

Une fois à l'aise avec Quarto dans un simple container Docker, deux étapes suivantes s'imposent naturellement : transformer cette configuration en un vrai <Link to="/blog/quarto-devcontainer">devcontainer</Link> VSCode (vous ouvrez le projet, tout est préinstallé et le hot-reload fonctionne directement), et parcourir <Link to="/blog/quarto-extensions">mes extensions Quarto préférées</Link> pour enrichir votre documentation. Pour le volet slideshow en profondeur, voyez <Link to="/blog/running-revealjs-with-docker">Level Up Your Presentations with Quarto, reveal.js, Decktape, Docker and DevContainers</Link>.
