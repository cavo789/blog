---
slug: docusaurus-plugin-replace
title: Créer un plugin de recherche/remplacement pour Docusaurus
date: 2025-09-18
description: Remplacez automatiquement « markdown » par « Markdown » dans tout votre contenu pour garder des articles cohérents.
authors: [christophe]
image: /img/v2/docusaurus_component.webp
series: Creating Docusaurus components
mainTag: component
tags:
  - component
  - docusaurus
  - react
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lz3pbmvd722f
---
<!-- cspell:ignore vstirbu -->

![Créer un plugin de recherche/remplacement pour Docusaurus](/img/v2/docusaurus_component.webp)

<TLDR>
Cet article montre comment créer un plugin remark personnalisé pour Docusaurus afin de rechercher et remplacer automatiquement certains termes sur tout votre site. L'objectif : garantir une terminologie cohérente (par exemple transformer « vscode » en « VSCode ») sans modifier les fichiers Markdown d'origine. Vous allez apprendre à écrire un plugin qui parcourt l'arbre syntaxique abstrait (AST) du contenu pour n'appliquer les remplacements qu'au texte brut, en évitant les blocs de code et les URL. Le guide montre aussi comment configurer le plugin dans votre `docusaurus.config.js`.
</TLDR>

Pour le fun (parce que cette solution n'est peut-être pas infaillible), j'ai demandé à une IA de générer un plugin capable de scanner mes 200 articles et de remplacer des motifs comme `docusaurus` par `Docusaurus`, `github` par `GitHub`, `vscode` par `VSCode`, afin de normaliser tout mon contenu.

Ça peut être risqué, car si le mot `vscode` apparaît :

- dans une URL (comme `https://github.com/microsoft/vscode/`),
- dans un nom (comme `vstirbu.vscode-mermaid-preview`),
- dans un nom de fichier (comme `vscode.png`),
- dans un snippet de code (à l'intérieur d'un bloc <code>\```...\```</code> ou <code>\`.\`</code>),
- ...

nous ne voulons évidemment pas faire le remplacement.

Mais si le mot se trouve dans un simple paragraphe, c'est une autre histoire : là, oui, on veut le remplacement.

Donc, après quelques prompts avec l'IA, un plugin a été généré et il fonctionne jusqu'ici.

<!-- truncate -->

Redémarrez votre serveur Docusaurus une fois le plugin en place et, au démarrage suivant, si des changements doivent être faits, vous les verrez dans votre console :

```bash
🔎 Replacing 'vscode' with 'VSCode' in file: /opt/[...]/index.md
Sentence: One of the best features in vscode is the

🔎 Replacing 'vscode' with 'VSCode' in file: /opt/[...]/index.md
Sentence: With vscode, it's ultra-simple: multiple cursors.
```

Silencieux, sûr, et ça ne touche jamais vos fichiers Markdown d'origine : uniquement le HTML généré. Construisons-le.

## Le plugin {#the-plugin}

Créez le fichier `plugins/remark-replace-terms/index.cjs` et regardez le tableau `replacements`. Ajoutez-y les vôtres.

*Il s'agit d'un plugin **remark** : il parcourt l'AST Markdown avant la production du HTML. J'ai utilisé le même mécanisme pour <Link to="/blog/docusaurus-override-img">remplacer chaque balise `<img>` par mon propre composant</Link> et pour <Link to="/blog/docusaurus-eli5-snippet-tooltips">injecter des tooltips générés par IA dans les snippets de code</Link>.*

La syntaxe est `[/\b(1)\b/g, "(2)"],` où `(1)` est le mot à rechercher (écrit exactement tel quel, sensible à la casse) et `(2)` la valeur de remplacement.

<Snippet filename="plugins/remark-replace-terms/index.cjs" source="plugins/remark-replace-terms/index.cjs" />

## Ajouter le plugin dans votre configuration {#adding-the-plugin-in-your-configuration}

L'étape suivante consiste à enregistrer votre plugin dans la configuration de Docusaurus. Pour ce faire, éditez votre fichier `docusaurus.config.js` et ajoutez les lignes surlignées comme illustré ci-dessous.

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

Cela fait, redémarrez votre serveur Docusaurus et vous obtiendrez la même sortie console que celle montrée au début de cet article.

<AlertBox variant="caution">
La recherche/remplacement ne sera pas effectuée sur vos fichiers Markdown d'origine, mais uniquement lors du rendu HTML. Lancer ce plugin est donc sans danger ; vos fichiers ne seront pas impactés du tout.

</AlertBox>
