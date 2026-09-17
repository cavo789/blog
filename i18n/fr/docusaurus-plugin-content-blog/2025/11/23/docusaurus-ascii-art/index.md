---
slug: docusaurus-ascii-art
title: Injecter de l'ASCII art dans toutes les pages HTML générées par Docusaurus
date: 2025-11-23
description: Injectez une bannière en ASCII art dans chaque page HTML générée par Docusaurus grâce à un plugin postBuild léger. Elle apparaît dans le code source de la page ou peut être affichée visiblement.
authors: [christophe]
image: /img/v2/ascii_art_html.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags:
  - docusaurus
  - linux
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3m6bvf4ph6224
---
![Injecter de l'ASCII art dans toutes les pages HTML générées par Docusaurus](/img/v2/ascii_art_html.webp)

<TLDR>
Cet article montre comment injecter une bannière ASCII art personnalisée dans chaque page HTML générée par Docusaurus. Il s'agit de créer un plugin `postBuild` léger qui parcourt les fichiers générés et insère l'ASCII art sous forme de commentaire HTML juste après la balise `<!doctype html>`. Le guide détaille les étapes pour créer le fichier ASCII art, le plugin, et configurer Docusaurus pour l'activer.
</TLDR>


C'est peut-être totalement inutile, et seuls les plus curieux le remarqueront, mais nous allons voir comment injecter une bannière ASCII art personnalisée tout en haut de chaque page HTML générée pour notre blog.

Dès maintenant, appuyez sur <kbd>CTRL</kbd>+<kbd>U</kbd> (l'équivalent de `View page source`) pour voir ce que nous allons faire dans cet article.

<!-- truncate -->

## Le résultat {#the-result}

Une fois le plugin en place (voir plus bas), un <kbd>CTRL</kbd>+<kbd>U</kbd> sur n'importe quelle page du site généré affiche ceci, juste après la balise `<!doctype html>` :

![HTML meerkat](./images/html_meerkat.webp)

<AlertBox variant="info" title="Votre site est manifestement de classe mondiale et absolument unique dans son domaine. ;-)">
</AlertBox>

## Pourquoi ça fonctionne {#why-it-works}

- Le plugin s'accroche à l'événement `postBuild` de Docusaurus — il ne s'exécute qu'une fois que `yarn docusaurus build` a fini d'écrire le HTML sur le disque.
- Il parcourt chaque fichier `.html` généré dans la sortie du build.
- Pour chacun, il injecte l'ASCII art sous forme de commentaire HTML juste après la balise ouvrante `<!doctype html>` — invisible sur la page affichée, visible uniquement dans le code source.

*Contrairement aux plugins remark que j'ai écrits auparavant (voir <Link to="/blog/docusaurus-plugin-replace">Creating a search&replace plugin for Docusaurus</Link>), celui-ci ne touche pas du tout au Markdown : il travaille sur le HTML généré.*

## Installation {#installation}

### Créez votre logo personnalisé {#create-your-personalized-logo}

D'abord, il nous faut de l'ASCII art. Si vous n'en avez pas encore, vous pouvez utiliser cet outil en ligne : [Image to ASCII Art Converter](https://folge.me/tools/image-to-ascii). Uploadez simplement un petit personnage et convertissez-le. *J'ai aussi abordé la méthode en ligne de commande pour produire ce genre de bannières dans <Link to="/blog/bash-ascii-art">Bash - ASCII art</Link>.*

Dans votre site Docusaurus, créez le fichier `src/data/banner.txt` et collez-y votre ASCII art. Voici le mien :

<Snippet filename="src/data/banner.txt" source="src/data/banner.txt" />

### Créez le plugin et chargez-le {#create-the-plugin-and-load-it}

Passons au plugin. Créez `plugins/ascii-injector/index.mjs` et copiez/collez le code source ci-dessous dans votre fichier :

<Snippet filename="plugins/ascii-injector/index.mjs" source="plugins/ascii-injector/index.mjs" />

C'est presque fini. Finalisez l'installation en éditant votre fichier `docusaurus.config.js` et, sous `plugins`, faites ceci :

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

Dernière étape : redémarrez votre site Docusaurus pour charger le fichier de configuration mis à jour.

## Autres démos {#more-demos}

### Place aux tests {#time-to-test}

Rien de neuf ici, générez simplement la version statique de votre site.

<Terminal typewriter wrap={true}>
$ yarn docusaurus build

$ yarn docusaurus serve
</Terminal>

Une fois votre site généré, ouvrez n'importe quelle page, appuyez sur <kbd>CTRL</kbd>+<kbd>U</kbd> et tadaaa, votre ASCII art est là — exactement le résultat montré en haut de cet article.

## Sous le capot (passez votre chemin si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

<AlertBox variant="caution" title="Pas en mode preview">
Ce plugin n'est déclenché que lors de l'événement `postBuild`, c'est-à-dire uniquement après que votre blog a été rendu sous forme de page HTML. Donc si vous lancez Docusaurus en mode preview, vous ne verrez pas l'ASCII art.
</AlertBox>

## Conclusion {#conclusion}

Un plugin `postBuild`, un fichier ASCII art et trois lignes de configuration en plus — et chaque page générée par votre site porte dans son source une petite signature inutile, totalement assumée. Si le côté ligne de commande de la génération de bannières ASCII vous intéresse plus que la tuyauterie Docusaurus, <Link to="/blog/bash-ascii-art">Bash - ASCII art</Link> couvre cette partie.
