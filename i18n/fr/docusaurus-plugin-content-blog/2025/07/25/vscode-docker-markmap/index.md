---
slug: vscode-docker-markmap
title: Obtenir une mindmap plus attrayante avec Markmap et Quarto
date: 2025-07-25
description: Générez des mindmaps attrayantes à partir de Markdown avec Markmap et personnalisez-les dans VSCode. Affichez le résultat HTML final avec Quarto et Docker.
authors: [christophe]
image: /img/v2/mindmaps.webp
series: Diagrams as code
mainTag: doc-as-code
tags:
  - doc-as-code
  - docker
  - quarto
  - vscode
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lurgf4ddp22y
---
![Obtenir une mindmap plus attrayante avec Markmap et Quarto](/img/v2/mindmaps.webp)

<TLDR>
Cet article propose un guide pas à pas pour créer des mindmaps interactives et attrayantes à partir de simples fichiers Markdown. Vous apprendrez à utiliser l'extension VS Code Markmap pour visualiser instantanément vos listes Markdown sous forme de mindmap, directement dans votre éditeur. L'article explique aussi comment personnaliser l'apparence de votre mindmap via les paramètres de VS Code. Enfin, il montre comment utiliser Quarto, via un simple script shell basé sur Docker, pour générer votre mindmap sous forme de page HTML autonome et soignée, sans rien installer localement.
</TLDR>

En 2023, j'ai écrit cet article <Link to="/blog/docker-mindmap">Build a mind map using Docker and Markdown</Link> sur la façon de rendre un document Markdown sous forme de mindmap.

Cette fois, j'aimerais aller un cran plus loin et rendre le tout plus attrayant.

*Deux autres façons de transformer du texte en diagramme sur ce blog : <Link to="/blog/docker-python-mermaid">générer du Mermaid depuis un script Python</Link> et <Link to="/blog/json-crack">afficher un fichier JSON sous forme de mindmap</Link>.*

<!-- truncate -->

Voici où nous allons — la même liste Markdown toute simple, rendue en mindmap HTML autonome et soignée avec Quarto :

![Le résultat final avec Quarto](./images/final_result_quarto.webp)

Commençons par le commencement : lancez VSCode et créez un nouveau fichier. Comme nous allons faire un peu plus que ça, créons un nouveau dossier : `mkdir -p /tmp/markmap && cd $_`.

Créez-y un fichier Markdown, par exemple `overview.qmd`. L'extension `.qmd` sert juste à dire *ceci est un fichier Markdown et nous comptons l'utiliser avec Quarto* ; rien de spécial ici.

<Snippet filename="overview.qmd" source="./files/overview.qmd" />

<AlertBox variant="note">
Le contenu du fichier `overview.qmd` ci-dessus a été généré par IA.

</AlertBox>

Nous obtenons donc ceci :

![Le fichier overview.qmd dans vscode](./images/overview_qmd.webp)

## Afficher la markmap en ligne {#render-the-markmap-online}

Rendez-vous sur [https://markmap.js.org/repl](https://markmap.js.org/repl) et collez le contenu Markdown pour obtenir immédiatement un premier rendu :

![Rendu avec le bac à sable en ligne de Markmap](./images/markmap_online.webp)

Ok, ça marche mais ce n'est pas vraiment impressionnant.

## Installer l'extension VSCode {#installing-the-vscode-extension}

Il existe une extension Markmap sur le marketplace ; rendez-vous sur [https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode](https://marketplace.visualstudio.com/items?itemName=gera2ld.markmap-vscode) pour l'installer.

Une fois installée dans VSCode, appuyez sur <kbd>CTRL</kbd>+<kbd>SHIFT</kbd>+<kbd>P</kbd> pour ouvrir la *Command Palette*, cherchez `Markmap`, sélectionnez `Markmap: open as markmap` et appuyez sur <kbd>Enter</kbd>.

Vous obtiendrez quasiment la même sortie que la version en ligne :

![Rendu de la Markmap dans VSCode - basique](./images/extension_rendering_basic.webp)

### Configurer le rendu {#configuring-the-rendering}

En créant un fichier `.vscode/settings.json`, vous pouvez définir du CSS et des options par défaut, c'est-à-dire configurer l'extension Markmap-vscode.

Créez le fichier `.vscode/settings.json` avec ce contenu :

<Snippet filename=".vscode/settings.json" source="./files/overview.part2.qmd" />

Sauvez le fichier, retournez dans `overview.qmd` et, si nécessaire, relancez `Markmap: open as markmap`.

L'aperçu sera bien meilleur :

![Un meilleur rendu dans VSCode](./images/extension_rendering_advanced.webp)

<AlertBox variant="info" title="Lisez la doc">
La liste des options existantes est documentée sur le site officiel : [https://markmap.js.org/docs/json-options](https://markmap.js.org/docs/json-options)

</AlertBox>

## Générer une page HTML avec Quarto {#rendering-as-an-html-page-using-quarto}

Dernière étape de cet article : rendons notre contenu Markdown sous forme d'une jolie page HTML, grâce à Quarto.

Créons un nouveau fichier `render.sh` avec le contenu suivant :

<Snippet filename="render.sh" source="./files/render.sh" />

Rendez ce fichier exécutable en lançant `chmod +x render.sh`.

Il est temps de l'appeler : dans votre console, lancez `./render.sh` pour exécuter le script.

La toute première fois, ce sera plus long car Docker doit télécharger l'image Docker de Quarto (`ghcr.io/quarto-dev/quarto`).

Le script va appeler Quarto, faire quelques initialisations et convertir le fichier `overview.qmd` en une page HTML qui sera stockée dans un nouveau dossier `.build`.

Après avoir lancé le script, vous aurez donc cette structure dans votre projet :

![Structure du projet après exécution du script](./images/project_structure.webp)

Le plus chouette : Quarto a rendu votre contenu Markdown sous forme d'une belle page — le même résultat déjà montré en haut de cet article, ce qui était l'objectif de ce billet.

## Conclusion {#conclusion}

Il est très simple d'écrire une structure de type MindMap et de générer soit une image, soit une page web. On pourrait aller encore plus loin avec Quarto, car une page web peut être personnalisée avec du CSS.

Et, comme c'est une page web, vous pouvez facilement copier-coller le rendu dans un e-mail, un document Word ou n'importe quoi d'autre et obtenir un visuel plutôt sympa pour ce qui n'était au départ qu'une simple liste.
