---
slug: docker-mindmap
title: Créer une mind map avec Docker et Markdown
date: 2023-12-16
description: Apprenez à créer facilement une mind map dynamique avec Markmap, Docker et Markdown. Convertissez du texte brut en une superbe mind map HTML interactive.
authors: [christophe]
image: /img/v2/mindmaps.webp
series: Diagrams as code
mainTag: doc-as-code
tags:
  - doc-as-code
  - docker
language: fr
review_date: 2026-07-30
---
![Créer une mind map avec Docker et Markdown](/img/v2/mindmaps.webp)

<TLDR>
Cet article montre comment transformer un simple plan Markdown (titres et listes à puces) en une mind map SVG interactive et zoomable grâce à Markmap, soit via son éditeur en ligne, soit sans rien installer avec l'image Docker `leopoul/markmap` (`docker run ... mindmap.md --output mindmap.html`).
</TLDR>

Fan de markdown, j'adore dénicher un petit outil qui me permet d'écrire du texte et de le convertir dans un autre format.

Pour cet article, nous allons écrire une mind map en texte brut, autrement dit : notre texte sera converti en une image de mind map.

<!-- truncate -->

## Le résultat {#what-comes-out}

Voici la mind map que vous obtiendrez à la fin de cet article :

![Une mind map rendue par Markmap](./images/mindmap.webp)

C'est un SVG dans une page HTML : les branches peuvent être repliées et dépliées, et vous pouvez zoomer ou dézoomer. Et voici l'unique commande qui l'a produite, à partir d'un simple fichier Markdown :

```bash
docker run -it --rm -v ${PWD}:/project -w /project -u $(id -u):$(id -g) \
  leopoul/markmap:1.0.0 mindmap.md --output mindmap.html
```

Rien d'installé sur la machine ; l'outil que nous utilisons s'appelle `Markmap` et il reste dans son container.

## Et voici le texte qui l'a produite {#and-here-is-the-text-that-produced-it}

<Snippet filename="mindmap.md">

```markdown
# Social Media Uses

## Blogging

- Blogger
- Medium
- Joomla

## Social Network

### Common

- Facebook

### For developers

- Dev.to
- Daily.dev
- Github

## Photo Sharing

- Flicker
- Pinterest

```

</Snippet>

Les titres deviennent des branches, les listes à puces deviennent des feuilles. Voilà toute la syntaxe ; vous la connaissez déjà.

## Le faire sur votre machine {#doing-it-on-your-machine}

Pour la démo, lancez un shell Linux et exécutez `mkdir -p /tmp/markmap && cd $_` pour créer un dossier `markmap` dans votre dossier temporaire Linux et vous y placer.

Créez un nouveau fichier appelé `mindmap.md` avec le contenu markdown à propos de *Social Media Uses* fourni juste au-dessus. Vous devriez avoir ceci :

<Terminal typewriter source="./files/terminal-2.txt" />

Exécutez maintenant la commande `docker run` affichée en début d'article pour convertir le document markdown en page HTML. L'image est automatiquement créée sous forme de contenu SVG dans le fichier `.html` :

<Terminal typewriter source="./files/terminal-1.txt" />

Ouvrez `mindmap.html` dans votre navigateur et la carte s'affichera sur toute la largeur de l'écran.

<AlertBox variant="info" title="Utilisateur WSL">
Si vous êtes sous Windows et WSL2, une façon d'ouvrir le fichier `mindmap.html` est de lancer `explorer.exe .` dans votre console Linux (voir <Link to="/blog/wsl-windows-explorer">cet article</Link> pour en savoir plus). L'explorateur Windows démarrera ; il suffit alors de double-cliquer sur le fichier `mindmap.html`.

</AlertBox>

## Sans Docker, dans votre navigateur {#without-docker-in-your-browser}

`Markmap` peut aussi être utilisé en ligne : voyez la démo et l'éditeur sur [https://markmap.js.org/repl](https://markmap.js.org/repl). Copiez/collez le markdown ci-dessus dans l'[éditeur](https://markmap.js.org/repl) pour le voir en action, sans créer le moindre fichier.

## Aller plus loin {#go-further}

Vous pouvez ajouter des éléments de configuration dans votre document markdown, voyez [https://markmap.js.org/docs/json-options](https://markmap.js.org/docs/json-options) pour obtenir la liste de toutes les options JSON supportées.

## Conclusion {#conclusion}

Une mind map que vous pouvez versionner, comparer et éditer dans n'importe quel éditeur de texte, produite par un seul `docker run` — et rien à désinstaller ensuite.

Deux suites : <Link to="/blog/vscode-docker-markmap">Getting a more attractive mindmap with Markmap and Quarto</Link>, qui soigne le rendu, et <Link to="/blog/json-crack">Rendering a JSON file as a mind map</Link> quand la source est un fichier JSON plutôt que du Markdown.
