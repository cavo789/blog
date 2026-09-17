---
slug: docker-memos
title: Application de prise de notes auto-hébergée
date: 2025-07-29
description: Déployez rapidement l'application de prise de notes auto-hébergée memos avec Docker. Découvrez ses fonctionnalités simples - Markdown, checklists, tags et collage d'images.
authors: [christophe]
image: /img/v2/docker_playing_with_app.webp
series: Self-host your own services
mainTag: self-hosted
tags:
  - docker
  - self-hosted
language: fr
blueskyRecordKey: 3lv3hzdh4mk2v
updates:
  - date: 2026-07-30
    note: "Fixed dead link to shortcuts documentation (URL moved from /docs/getting-started/shortcuts to /docs/usage/shortcuts)."
---
<!-- cspell:ignore neosmemo -->

![Application de prise de notes auto-hébergée](/img/v2/docker_playing_with_app.webp)

<TLDR>
Cet article présente « memos », une application de prise de notes auto-hébergée, légère et simple, parfaite pour les rappels et les tâches quotidiennes d'un développeur. Le guide détaille pas à pas l'installation de memos avec une configuration Docker Compose personnalisée, en insistant sur la persistance des données et les bonnes permissions de fichiers. Vous verrez comment démarrer, créer des notes en Markdown et avec des checklists, les organiser avec des tags et utiliser des filtres avancés appelés « shortcuts ». L'article met aussi en avant des fonctionnalités pratiques comme le collage direct d'images dans vos notes.
</TLDR>

Comme développeur, je travaille toute la journée sur un ordinateur et parfois (trop souvent en fait), en fin de journée, je m'envoie un email pour le moi de demain : *N'oublie pas de ...*, *tu dois continuer [une tâche]*, *je me suis arrêté à [un fichier], je dois continuer les autres*. Bref, j'utilise ma boîte de réception comme un gestionnaire de to-dos / pense-bêtes.

Peut-on faire mieux ? Bien sûr, mais quel outil choisir ?

Ce que j'aimerais : pouvoir écrire des notes très facilement, que certaines notes soient des tâches (une case à cocher me suffit) et pouvoir copier/coller des images comme une capture d'écran.

Idéalement, j'aimerais avoir un site web local que je peux consulter chaque jour comme pense-bête.

La simplicité est la clé.

<!-- truncate -->

Il existe énormément d'applications mais, comme j'ai vraiment besoin d'un outil simple et rapide (c'est la fin de journée, je dois filer prendre mon train, hop hop, quelques secondes, ok, la note pour demain est créée), j'ai essayé **[memos](https://www.usememos.com/)** et je l'apprécie beaucoup.

![démo de memos](./images/memos.webp)

## Installons memos {#lets-install-memos}

Cette fois, je ne vais pas proposer d'utiliser le dossier temporaire puisque nous devrons conserver nos notes, nos images collées, ... sur notre disque pendant les prochains jours, semaines ou mois. *Cela se fait avec un <Link to="/blog/docker-volume">Docker volume</Link> : le container peut être détruit et recréé, vos notes restent sur votre disque.*

Lancez donc `mkdir -p  ~/tools/memos && cd $_` pour créer un dossier dans votre répertoire personnel et vous y rendre.

Ensuite, créez un fichier appelé `compose.yaml` avec ce contenu :

<Vars port="5230" labels={{ port: "Port de l'hôte" }} />

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="note">
La ligne `user: ${UID:-1000}:${GID:-1000}` demande à Docker d'utiliser un utilisateur spécifique (pas `root`) lors de la création de fichiers sur votre disque.

L'utilisateur `1000:1000`, c'est vous dans la plupart des cas, c'est-à-dire votre utilisateur Linux actuel (tapez `id -u` puis `id -g` pour récupérer votre ID utilisateur et votre ID de groupe et vous verrez que ce sera `1000` pour les deux).

Si vos IDs ne sont pas `1000`, éditez le fichier yaml et mettez les vôtres à la place.

</AlertBox>

Dans votre console, maintenant, lancez simplement `docker compose up --build --detach`.

En six secondes à peine, memos a été installé sur ma machine et un container a été créé :

![Installation de memos](./images/installation.webp)

Rendez-vous sur `http://localhost:`<Var name="port">5230</Var> et vous verrez que le site tourne déjà :

<BrowserWindow url="http://localhost:%%port=5230%%">
  ![Premier lancement](./images/first_run.webp)
</BrowserWindow>

<AlertBox variant="info">
Regardez en bas à gauche ; il est possible de choisir une autre langue ; le français est supporté par exemple.

</AlertBox>

Je vais créer mon compte (`admin/admin` puisque je travaille sur mon localhost) et je suis prêt à créer ma première note. Ça m'a pris moins d'une minute jusqu'ici.

<BrowserWindow url="http://localhost:%%port=5230%%">
  ![La page d'accueil de memos](./images/homepage.webp)
</BrowserWindow>

Cliquez dans la zone d'édition `Any thoughts...` et commencez à taper votre idée... Par exemple :

```markdown
**Python Codebase - User Authentication Module:**

- [ ] Implement password hashing using bcrypt.
- [ ] Create user registration endpoint (`/register`).
- [ ] Develop user login endpoint (`/login`) with JWT token generation.
```

<BrowserWindow url="http://localhost:%%port=5230%%">
  ![Ma première note](./images/first_note.webp)
</BrowserWindow>

En appuyant sur le bouton `Save`, la note est créée. C'est propre et, demain, oh chouette, oh oui, c'est vrai, j'ai ces trois choses à faire.

Imaginez qu'on soit demain et que j'aie terminé la première : il me suffit de cocher la case et c'est sauvegardé automatiquement :

<BrowserWindow url="http://localhost:%%port=5230%%">
  ![La première tâche est terminée](./images/first_task_is_done.webp)
</BrowserWindow>

Je peux toujours éditer, épingler, supprimer, archiver, ... la tâche via le bouton à trois points :

![Les différentes options](./images/task_options.webp)

## Créons quelques tâches en plus {#lets-create-a-few-more-tasks}

Comme vous le voyez, même si c'est optionnel, assignons un ou plusieurs tags à une note. Simplement en utilisant la syntaxe avec le dièse :

```markdown
**Python Codebase - User Authentication Module:** #python

- [x] Implement password hashing using bcrypt.
- [ ] Create user registration endpoint (`/register`).
- [ ] Develop user login endpoint (`/login`) with JWT token generation.
```

```markdown
Investigate and resolve the bug in the budgetary application that occurs when initializing a new financial exercise. #budget
```

```markdown
Write the missing documentation for the new user authentication module, covering API endpoints, data models, and setup instructions. #python
```

```markdown
Review the Dockerfile for the user authentication service to ensure optimal image size and security practices. #docker #python
```

<BrowserWindow url="http://localhost:%%port=5230%%">
  ![Quelques tâches en plus](./images/few_tasks.webp)
</BrowserWindow>

## Filtrer avec les tags {#filtering-using-tags}

Quand vous avez utilisé des tags, vous les voyez immédiatement en bas à gauche sous `Tags`. Cliquez simplement sur un tag pour filtrer dessus. Vous pouvez en cliquer plusieurs si vous voulez. Dans l'exemple ci-dessous, j'ai trois notes pour `Python` et une seule avec le tag Docker :

<BrowserWindow url="http://localhost:%%port=5230%%/?filter=tagSearch%3Apython%2CtagSearch%3Adocker">
  ![Filtrer avec les tags](./images/filtering_using_tags.webp)
</BrowserWindow>

## Créer des shortcuts {#creating-shortcuts}

En plus des tags, vous pouvez utiliser des filtres plus sophistiqués, ce que memos appelle des `shortcut`.

![Créer des shortcuts](./images/creating_shortcuts.webp)

Le filtre utilisé est `has_task_list && tag in ["python"]`.

Maintenant, cliquez simplement sur le filtre pour l'activer. Vous ne verrez qu'une seule tâche (parce que les autres notes avec le tag `python` n'avaient pas de case à cocher). Vraiment facile non ?

[En savoir plus sur l'écriture des filtres](https://usememos.com/docs/usage/shortcuts)

## Coller des images {#pasting-images}

Comme dans n'importe quelle application moderne, copiez l'image dans le presse-papier et collez-la dans la zone de texte. Ajoutez du texte si vous le souhaitez.

## Personnalisation {#customization}

En cliquant sur l'icône de profil en bas à gauche, vous pouvez modifier les paramètres de l'application, par exemple définir `Monday` comme premier jour de la semaine (pour le calendrier en haut à gauche).

Vous pouvez aussi injecter du CSS / JavaScript pour personnaliser l'apparence de memos.

## Conclusions {#conclusions}

Comme annoncé en introduction, personnellement, c'est plus que suffisant pour mes besoins. Je voulais quelque chose d'ultra-simple (un onglet dans mon navigateur) et la possibilité d'écrire mes notes très vite (avec le support de Markdown), d'avoir des cases à cocher et de pouvoir copier/coller une capture d'écran.

Memos va un cran plus loin avec la gestion des tags et des shortcuts, et la possibilité de restreindre la to-do list à une période du calendrier.

Et tout ça est 100% gratuit !

## Plus d'infos {#more-info}

Consultez le site officiel [https://www.usememos.com](https://www.usememos.com) pour plus d'informations.

*Deux autres outils auto-hébergés qui tournent à côté de memos sur ma machine : <Link to="/blog/heimdall-dashboard">Heimdall</Link>, le dashboard depuis lequel je les ouvre tous, et <Link to="/blog/docker_uptime_kuma">Uptime Kuma</Link> pour le monitoring.*
