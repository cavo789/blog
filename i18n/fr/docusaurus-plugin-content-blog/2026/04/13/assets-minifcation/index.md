---
slug: assets-minification
title: Optimisez votre frontend - Minifier vos assets avec Docker, Bash et YAML
description: Oubliez les lourdes chaînes d'outils Node. Construisez un pipeline de minification d'assets rapide et sans dépendances avec un manifeste YAML déclaratif, Bash et Docker.
authors: [christophe]
image: /img/v2/minification.webp
mainTag: bash
tags:
  - bash
  - docker
date: 2026-04-13
blueskyRecordKey: 3mje5jxw6ts2a
---

![Optimisez votre frontend - Minifier vos assets avec Docker, Bash et YAML](/img/v2/minification.webp)

<TLDR>Ce guide montre comment construire un pipeline d'assets propre, modulaire et ultra-rapide sans polluer votre machine hôte. En combinant un manifeste YAML déclaratif, un orchestrateur Bash tout simple et un minifieur écrit en Go tournant dans Docker (`tdewolff/minify`), vous obtenez des builds reproductibles et isolés. C'est le setup parfait pour les projets qui veulent une approche Docker-first et légère de l'optimisation frontend.</TLDR>

Dans le développement web moderne, garder vos fichiers CSS et JavaScript légers est crucial pour la performance. Les bundlers lourds comme Webpack ou Vite sont excellents pour les applications complexes, mais parfois vous voulez juste une manière simple et portable de concaténer et minifier des fichiers, sans installer tout l'écosystème Node.js sur votre machine locale ou sur votre runner CI/CD.

Aujourd'hui, nous allons construire un pipeline de build maison avec :

1. **YAML** pour définir nos bundles d'assets.
2. **Bash** pour orchestrer la concaténation des fichiers.
3. **Docker** pour effectuer la minification avec des outils très performants.

<!-- truncate -->

## Le lancer {#running-it}

Une fois le manifeste et le script en place (voir plus bas), tout le pipeline tient en une seule commande :

![Exécution de la minification](./images/running.png)

Et oui, ça n'a pris que cinq secondes (téléchargement de l'image Docker compris).

## Pourquoi cette approche ? {#why-this-approach}

1. **Aucune dépendance Node** : pas besoin de `package.json` ni de dossier `node_modules`. Le moteur de minification vit dans un container Docker.
2. **Ultra-rapide** : `tdewolff/minify` est écrit en Go. Il est nettement plus rapide que beaucoup de minifieurs écrits en JavaScript.
3. **Déclaratif** : ajouter un nouveau fichier à votre bundle CSS se résume à ajouter une ligne dans votre `manifest.yaml`.
4. **Cohérence** : puisque nous utilisons Docker, le résultat de la minification sera exactement le même sur votre machine locale, sur le portable de votre collègue et sur votre serveur CI de production.

## L'architecture {#the-architecture}

Notre workflow est vraiment (vraiment !) simple :

1. Un script Bash lit un fichier `manifest.yaml`.
2. Il rassemble les fichiers sources et les fusionne dans un seul fichier temporaire.
3. Il lance un container Docker qui exécute le moteur [minify](https://github.com/tdewolff/minify) pour compresser le code.

### 1. La configuration (`manifest.yaml`) {#1-the-configuration-manifestyaml}

D'abord, il nous faut un moyen d'indiquer à notre script quels fichiers vont ensemble. Cette structure YAML vous permet de définir plusieurs bundles, aussi bien pour le CSS que pour le JS.

Voici ce dont nous avons besoin :

<Snippet filename="manifest.yaml" source="./files/manifest.yaml" defaultOpen={true} />

Nous avons deux parties, une pour le CSS et une pour le JS, et nous allons définir deux choses

1. Le nom de notre fichier cible (par ex. ici, le fichier CSS minifié sera `dist/assets/app.min.css`)
2. Une liste de fichiers d'entrée

### 2. Le script orchestrateur (`build.sh`) {#2-the-orchestrator-script-buildsh}

Ce script Bash utilise `yq` (un processeur YAML léger ; voyez-le comme le cousin YAML de <Link to="/blog/linux-jq">`jq`</Link>) pour parser notre manifeste. Il concatène les fichiers puis appelle l'image Docker `[tdewolff/minify](https://hub.docker.com/r/tdewolff/minify)` pour faire le gros du travail. Résultat : nous ne polluons pas notre système avec des dépendances supplémentaires — juste une petite image Docker.

### 3. Comment l'exécuter {#3-how-to-run-it}

#### Prérequis {#prerequisites}

1. **Docker** : installé et démarré.
2. **yq** : un processeur YAML portable en ligne de commande. Vous pouvez l'installer avec `sudo apt-get update && sudo apt-get install yq` si vous ne l'avez pas encore.

#### Mise en place {#set-up}

Pour ce tutoriel, créons quelques fichiers d'exemple. Ouvrez un nouveau terminal et lancez cette longue commande :

<Snippet source="./files/cli.txt" defaultOpen={false} />

Cette instruction va créer un nouveau dossier `/tmp/minification` et automatiser la création de quelques fichiers :

```tree
├── dist
│   └── assets
└── public
    └── assets
        ├── css
        │   ├── components.css
        │   ├── layout.css
        │   ├── reset.css
        │   └── variables.css
        └── js
            ├── api.js
            ├── main.js
            └── utils.js
```

##### Créons maintenant le manifeste et le script {#now-please-create-the-manifest-and-the-script}

Cela fait, terminez la mise en place en créant le fichier manifeste `/tmp/minification/manifest.yaml` :

<Snippet filename="manifest.yaml" source="./files/manifest.yaml" defaultOpen={false} />

Et créez aussi le script Bash `/tmp/minification/build.sh` :

<Snippet filename="build.sh" source="./files/build.sh" defaultOpen={false} />

Dernière chose : le rendre exécutable (`chmod +x /tmp/minification/build.sh`).

#### Exécution {#execution}

Vous êtes prêt. Lancez simplement `./build.sh` pour démarrer la concaténation et la minification — c'est exactement la commande derrière la capture d'écran au début de cet article.

##### Jetez un œil aux options de l'image Docker {#look-at-the-docker-image-flags}

Rendez-vous sur [tdewolff/minify](https://hub.docker.com/r/tdewolff/minify) et regardez le [site de démo](https://go.tacodewolff.nl/minify), les [options CLI](https://github.com/tdewolff/minify/tree/master/cmd/minify) et la documentation.

## Conclusion {#conclusion}

En combinant la puissance du scripting Bash avec l'isolation de Docker, nous avons créé un pipeline d'assets robuste. Ce setup est parfait pour les sites statiques, les projets PHP legacy, ou tout environnement où vous voulez garder votre outillage de développement le plus léger possible.

Des assets minifiés ne représentent toutefois que la moitié du chemin côté performance : les images sont généralement la partie la plus lourde d'une page. Voyez <Link to="/blog/docusaurus-check-images">Running some checks on your Docusaurus images</Link> pour l'audit automatisé que je fais tourner sur les miennes.
