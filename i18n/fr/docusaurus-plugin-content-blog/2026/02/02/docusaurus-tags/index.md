---
slug: docusaurus-tags
title: Gestion des tags dans Docusaurus
date: 2026-02-02
description: Automatisez la gestion des tags Docusaurus avec ce script Python. Nettoyez les doublons, corrigez la casse et fusionnez les tags en toute sécurité sur des centaines de fichiers Markdown via Docker.
authors: [christophe]
image: /img/v2/tags_manager.webp
series: Creating Docusaurus components
mainTag: docusaurus
tags:
  - docker
  - docusaurus
  - python
language: fr
blueskyRecordKey: 3mdubzzquds2t
---

![Gestion des tags dans Docusaurus](/img/v2/tags_manager.webp)

<TLDR>
Cet article présente un script Python maison conçu pour automatiser le nettoyage et la gestion des tags incohérents d'un blog Docusaurus. L'outil tourne dans un container Docker pour lister, renommer et supprimer des tags, tout en proposant des suggestions intelligentes pour fusionner les doublons ou corriger les variations de casse. Il aborde aussi les options de configuration natives de Docusaurus pour imposer des règles d'utilisation des tags plus strictes à l'avenir.
</TLDR>

Plus de 200 articles plus tard, mon site Docusaurus a accumulé un joli chaos de tags. Trop de tags similaires, des majuscules incohérentes, du singulier contre du pluriel... Des tags avec un ou deux articles seulement. Et ainsi de suite.

Dans cet article, je partage un **script Python** que j'ai écrit pour automatiser la gestion des tags : en supprimer certains, en fusionner d'autres et nettoyer les incohérences.

C'est quasi impossible à faire à la main quand vous avez des centaines de fichiers Markdown. En plus, le faire manuellement risque de casser le formatage du frontmatter YAML.

<!-- truncate -->

## Voir les suggestions {#seeing-the-suggestions}

Une seule commande liste tous les tags et signale les doublons probables :

<Terminal typewriter wrap={true}>
$ make tags-manager ARGS="list"
</Terminal>

![Liste des tags](./images/list.webp)

## La solution : un gestionnaire de tags intelligent {#the-solution-a-smart-tag-manager}

Je voulais un outil capable de faire trois choses :

1.  **Lister** tous les tags par fréquence.
2.  **Suggérer** des optimisations (trouver les doublons ou les variations singulier/pluriel).
3.  **Renommer** ou **supprimer** des tags sans rien casser.

### Suggestions intelligentes {#smart-suggestions}

La partie la plus sympa du script, ce sont les « suggestions d'optimisation ». Il compare chaque tag à tous les autres pour repérer les doublons potentiels.

Il cherche :

- **Les variations de casse** : `GitHub` contre `github`.
- **Les pluriels** : `snippet` contre `snippets`.
- **Les sous-chaînes** : `visual studio code` contre `vscode`.

Ça m'aide à repérer le bazar dont je ne soupçonnais même pas l'existence.

## Comment l'exécuter (Docker d'abord) {#how-to-run-it-docker-first}

Comme toujours, je ne veux pas polluer ma machine hôte avec des dépendances Python. Je lance ce script avec Docker — exactement comme le vérificateur d'images décrit dans <Link to="/blog/docusaurus-check-images">Running some checks on your Docusaurus images</Link>.

J'ai une cible `Makefile` prête, mais en gros, elle exécute une commande comme celle-ci :

<Terminal typewriter wrap={true}>
$ docker run -it --rm -v .:/app -w /app --entrypoint /bin/sh python:3.14-slim -c "pip install --root-user-action=ignore oyaml python-frontmatter >/dev/null && python .scripts/tags-manager.py list"
</Terminal>

Mais bon, cette commande est franchement difficile à retenir, donc j'utilise plutôt une cible <Link to="/blog/makefile_tips">Makefile</Link> :

<Snippet filename="makefile" source="./files/makefile" defaultOpen={false} />

## Le script {#the-script}

Voici le script Python complet. Il utilise `argparse` pour gérer les arguments en ligne de commande et `python-frontmatter` pour analyser les fichiers.

<Snippet filename=".scripts/tags-manager.py" source=".scripts/tags-manager.py" defaultOpen={false} />

## D'autres exemples {#more-examples}

**Renommer un tag :**

Si, en parcourant la liste des tags, je vois que j'ai un tag `snippets` et un tag `snippet`, je vais les fusionner comme ceci :

<Terminal typewriter wrap={true}>
$ make tags-manager ARGS="rename snippets,snippet"
</Terminal>

**Supprimer un tag :**

Je peux aussi constater qu'un tag précis n'apporte rien ; pour le supprimer, je lance quelque chose comme ça :

<Terminal typewriter wrap={true}>
$ make tags-manager ARGS="delete draft"
</Terminal>

<Details label="Bonus - Le fichier tags.yml">

Nativement, Docusaurus vous permet de créer un fichier spécial appelé `blog/tags.yml`.

Voici celui que j'utilise :

<Snippet filename="blog/tags.yml" source="blog/tags.yml" defaultOpen={false} />

Avec un tel fichier, vous pouvez ensuite configurer votre fichier `docusaurus.config.js` et mettre l'attribut `onInlineTags` à `warn` ou `throw`.

Besoin de plus d'infos ? Lisez la documentation officielle [Tags File](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-docs#tags-file).

</Details>

## Conclusion {#conclusion}

Garder un blog organisé est un travail permanent. Avec ce script, je peux auditer mes tags rapidement et m'assurer que `Docusaurus` ne devienne pas `docusaurus` ou `DocuSaurus` avec le temps.

N'hésitez pas à récupérer le script et à l'adapter à votre propre générateur de site statique !
