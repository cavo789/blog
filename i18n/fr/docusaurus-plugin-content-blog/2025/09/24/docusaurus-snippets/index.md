---
slug: docusaurus-snippets
title: Un composant pour afficher des snippets de code dans un blog Docusaurus
date: 2025-09-24
description: Apprenez à créer un composant React personnalisé pour intégrer des snippets de code dynamiques dans votre blog Docusaurus et offrir une expérience de lecture plus interactive.
authors: [christophe]
image: /img/v2/docusaurus_react.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - markdown
  - react
language: fr
blueskyRecordKey: 3lzkrxkfpo22m
updates:
  - date: 2025-10-10
    note: Allow relative paths
  - date: 2026-02-23
    note: Add a cross reference to the <Link to="/blog/docusaurus-project-setup">Introducing the ProjectSetup Component - A Standardized Way to Share Project Structures</Link> article
---

<!-- markdownlint-disable MD046 -->
<!-- cspell:ignore iconify,docux,pyproject -->
![Un composant pour afficher des snippets de code dans un blog Docusaurus](/img/v2/docusaurus_react.webp)

<TLDR>
Cet article vous guide dans la création d'un composant `<Snippet>` puissant pour Docusaurus, destiné à afficher des blocs de code. Ce composant personnalisé améliore le HTML natif en ajoutant des fonctionnalités comme des icônes propres au type de fichier et un style sur mesure. Le tutoriel montre comment construire le composant React, l'intégrer à une bibliothèque d'icônes, puis va plus loin avec la création d'un plugin remark. Ce plugin permet de charger dynamiquement du code depuis des fichiers sources directement dans vos articles, pour que vos snippets soient toujours à jour, sans copier/coller manuel. Vous apprendrez à gérer les chemins relatifs comme absolus et à enregistrer le plugin dans la configuration de votre site.
</TLDR>

Si vous lisez ce blog régulièrement, vous savez que je partage beaucoup de snippets de code.

*Ce composant est devenu la base de deux autres : <Link to="/blog/docusaurus-project-setup">ProjectSetup</Link>, qui assemble plusieurs snippets en une arborescence de projet téléchargeable, et <Link to="/blog/docusaurus-eli5-snippet-tooltips">les tooltips ELI5</Link>, qui annotent les lignes délicates d'un snippet.*

La façon native de faire ça en HTML, c'est l'élément `<summary>` (voir la [documentation officielle](https://www.w3schools.com/tags/tag_summary.asp)).

Peut-on faire quelque chose, pas forcément mieux, mais plus esthétique ?

<!-- truncate -->

## L'élément summary {#the-summary-element}

En HTML pur, on peut utiliser l'élément DOM `<summary>` comme ceci :

```html
<details>
  <summary>blog/index.md</summary>

  Hello world! Proud to be here!!!
</details>
```

<AlertBox variant="info">
Ça fonctionne mais... peut-on faire mieux. Je pense par exemple à ajouter une icône selon le type de langage, distinguer aussi les couleurs par langage et, bien mieux encore, ne plus copier/coller le code dans l'article mais le lire directement depuis le disque.

</AlertBox>

Dans cet article, nous allons apprendre à créer un composant `Snippets` et obtenir ce look&feel :

```html
<Snippet filename="blog/index.md"> Hello world! Proud to be here!!! </Snippet>
```

et voici le rendu :

<Snippet filename="blog/index.md">

Hello world! Proud to be here!!!

</Snippet>

## Création de notre composant Snippets {#creation-of-our-snippets-component}

Créez le fichier `src/components/Snippet/index.tsx` avec ce contenu :

<Snippet filename="src/components/Snippet/index.tsx" source="src/components/Snippet/index.tsx" />

Créez aussi la feuille de style *(icône CSS et bordure bleue ici)* :

<Snippet filename="src/components/Snippet/styles.module.css" source="src/components/Snippet/styles.module.css" />

Dernière chose à faire : apprendre à Docusaurus l'existence de notre composant personnalisé.

Éditez également le fichier `src/theme/MDXComponents.js` (et s'il n'existe pas, créez-le)

<Snippet filename="src/theme/MDXComponents.js" source="./files/MDXComponents.js" />

### LogoIcon de Docux {#logoicon-of-docux}

Vous aurez aussi besoin du composant [LogoIcon](https://docuxlab.com/blog/logoicon-component-docusaurus/) créé par <img alt="Docux" src="/img/docux.webp" style={{border: "none", borderRadius: 0, height: "1.2em", verticalAlign: "middle", margin: "0 0.2em"}} /> <Link to="https://github.com/Juniors017">Docux</Link>.

Ce composant permet de récupérer facilement une icône SVG pour un langage (disons Python) et de l'afficher. En coulisses, LogoIcon utilise [Iconify](https://icon-sets.iconify.design/).

En très court :

<StepsCard
  variant="steps"
  steps={[
    "Lancez `yarn add @iconify/react` pour installer la bibliothèque iconify",
    "Créez ce fichier `src/components/Blog/LogoIcon/index.tsx`"
  ]}
/>

<Snippet filename="src/components/Blog/LogoIcon/index.tsx" source="src/components/Blog/LogoIcon/index.tsx" />

## Utiliser le composant Snippets {#using-the-snippets-component}

Maintenant, si vous voulez ajouter un snippet dans votre blog, faites simplement ceci :

```html
<Snippet filename="who_are_you.py">
  name = input("What's your name? ") if name: print(f"Hello, {name}!") else:
  print("Hello, stranger!") print("Nice to meet you.")
</Snippet>
```

Et voici le rendu :

<Snippet filename="who_are_you.py" source="./files/who_are_you.py" />

## Ne plus copier/coller de contenu {#dont-copypaste-content-anymore}

Faisons beaucoup, beaucoup mieux : ne plus copier/coller le code dans l'article mais le lire depuis le disque.

Imaginons ceci :

`<Snippet filename="src/components/Snippet/index.tsx" source="src/components/Snippet/index.tsx" />`

- `filename` est donc le titre à afficher dans l'article, pour que le lecteur sache comment le fichier doit être nommé
- `source` est le chemin relatif (depuis le dossier racine de Docusaurus) où le fichier peut être récupéré. Dans ce scénario, on n'a pas à mettre le code source dans le fichier, Docusaurus le fera pour nous :
  - En prévisualisation du site (mode dev), un plugin lira le contenu directement depuis le disque et injectera son contenu. Ainsi, si le fichier source est modifié, votre article sera toujours à jour
  - Lors du build de la version statique (mode prod), le moteur de build de Docusaurus lira aussi le contenu du fichier depuis le disque et l'injectera dans votre article.

<AlertBox variant="caution">
Vous avez deux types de chemins : depuis votre dossier racine ou relatif à l'article de blog.

Si vous utilisez la syntaxe `source="./files/example.js"` (le chemin commence par un point), le fichier sera relatif à votre article de blog.

La seconde syntaxe possible est sans le point, comme `source="src/components/Snippet/index.tsx"` et, dans ce cas, le nom de fichier sera relatif au dossier racine de Docusaurus, c'est-à-dire le dossier où se trouve le fichier `docusaurus.config.js`.

</AlertBox>

### Pour que ça fonctionne, il nous faut un plugin {#to-make-this-work-we-need-a-plugin}

Dans le vocabulaire Docusaurus, il nous faut un plugin pour faire ça, c'est-à-dire lire le contenu du fichier depuis le disque et l'« injecter » dans l'article.

Le plugin va donc parcourir l'article, chercher chaque appel à `<Snippet>` et vérifier s'il y a un attribut `src=`. Si oui, le plugin ouvrira le fichier et lira son contenu. Le plugin extraira aussi l'extension du fichier (comme `.js`). Avec ces deux informations (contenu et extension), le plugin injectera le contenu dans la balise `<Snippet>`, exactement comme si vous, l'auteur de l'article, aviez fait un copier/coller.

L'avantage ultime ici : votre article sera toujours à jour ; si vous modifiez le fichier sur le disque, votre article récupérera automatiquement la dernière version.

Créez le fichier `plugins/remark-snippet-loader/index.cjs` avec le contenu ci-dessous :

<Snippet filename="plugins/remark-snippet-loader/index.cjs" source="plugins/remark-snippet-loader/index.cjs" />

Éditez aussi votre fichier `docusaurus.config.js` comme ceci :

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

Cela fait, redémarrez votre serveur Docusaurus et au prochain démarrage, si des changements doivent être faits, vous les verrez dans votre console :

## Démo, contenu en dur {#demo-hardcoded-content}

Dans cette section, j'ai copié/collé la source dans la balise `<Snippet>`. Utile quand je n'ai pas le fichier sur mon disque.

<Snippet filename="sample.apacheconf" source="./files/sample.apacheconf" />

<Snippet filename="sample.asm" source="./files/sample.asm" />

<Snippet filename="script.sh" source="./files/script.sh" />

<Snippet filename="script.bat" source="./files/script.bat" />

<Snippet filename="styles.css" source="./files/styles.css" />

<Snippet filename="data.csv" source="./files/data.csv" />

<Snippet filename="change.diff" source="./files/change.diff" />

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<Snippet filename="login.feature" source="./files/login.feature" />

<Snippet filename="hello.html" source="./files/hello.html" />

<Snippet filename=".gitignore" source="./files/.gitignore" />

<Snippet filename="config.ini" source="./files/config.ini" />

<Snippet filename="HelloWorld.java" source="./files/HelloWorld.java" />

<Snippet filename="script.js" source="./files/script.js" />

<Snippet filename="data.json" source="./files/data.json" />

<Snippet filename="application.log" source="./files/application.log" />

<Snippet filename="makefile" source="./files/makefile" />

<Snippet filename="readme.md">

```md
# Hello World

This is a markdown example.
```

</Snippet>

<Snippet filename="hello_world.pas" source="./files/hello_world.pas" />

<Snippet filename="HelloWorld.php" source="./files/HelloWorld.php" />

<Snippet filename="Hello_World.ps1" source="./files/Hello_World.ps1" />

<Snippet filename="hello_world.py" source="./files/hello_world.part2.py" />

<Snippet filename="active.sql" source="./files/active.sql" />

<Snippet filename="logo.svg" source="./files/logo.svg" />

<Snippet filename="pyproject.toml" source="./files/pyproject.toml" />

<Snippet filename="HelloWorld.vb" source="./files/HelloWorld.vb" />

<Snippet filename="message.xml" source="./files/message.xml" />

<Snippet filename="config.yaml" source="./files/config.yaml" />

## Démo, récupérer le contenu depuis le disque {#demo-get-content-from-the-disk}

Contrairement au chapitre précédent, ici la syntaxe `<Snippet filename="src/components/Blog/PostCard/index.tsx" source="src/components/Blog/PostCard/index.tsx" />` a été utilisée. Le code source est donc injecté dynamiquement pendant la prévisualisation/le rendu du blog. Si le fichier source est modifié, l'article le sera aussi. Les deux sont synchronisés.

<Snippet filename="src/components/Blog/PostCard/index.tsx" source="src/components/Blog/PostCard/index.tsx" />

<Snippet filename="src/components/Blog/PostCard/readme.md" source="src/components/Blog/PostCard/readme.md" />

<Snippet filename="src/components/Blog/PostCard/styles.module.css" source="src/components/Blog/PostCard/styles.module.css" />

Et, dernière démo, récupérer le contenu d'un fichier relatif à cet article **(le nom du fichier source commence donc ici par un point pour indiquer qu'il est relatif au fichier `.md`)** :

<Snippet filename="./files/hello_world.py" source="./files/hello_world.py" />

## Aller plus loin avec ProjectSetup {#go-further-with-projectsetup}

Le composant `Snippet` est une excellente façon d'afficher des snippets de code dans votre blog Docusaurus, mais que faire si vous voulez partager toute une structure de projet avec vos lecteurs ? C'est là qu'intervient le composant `ProjectSetup`.

Poursuivez votre lecture pour découvrir le composant `ProjectSetup`, qui permet d'afficher la structure de fichiers d'un projet de façon claire, interactive et standardisée. Il montre non seulement les fichiers et leur contenu, mais fournit aussi des outils pour générer le projet en une seule commande ou le télécharger en ZIP.

<Link to="/blog/docusaurus-project-setup">Introducing the ProjectSetup Component - A Standardized Way to Share Project Structures</Link>
