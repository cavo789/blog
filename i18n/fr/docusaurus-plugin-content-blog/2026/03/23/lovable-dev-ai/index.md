---
slug: lovable-dev-ai
title: Restaurer Marknotes avec Lovable.dev
description: Demander à Lovable.dev de créer une application dockerisée complète, avec un backend en Python/FastAPI et un frontend en React.
image: /img/v2/lovable_dev.webp
mainTag: ai
tags:
  - ai
  - python
  - react
authors: [christophe]
ai_assisted: true
date: 2026-03-23
blueskyRecordKey: 3mhpgarpcks2o
---

![Restaurer Marknotes avec Lovable.dev](/img/v2/lovable_dev.webp)

<TLDR>Un générateur de code IA peut-il reconstruire une application de prise de notes full-stack à partir d'un seul prompt ? J'ai testé Lovable.dev pour recréer mon ancienne application, Marknotes, en imposant une architecture strictement Docker-first : un backend Python/FastAPI, un frontend React, Redis pour le cache et Meilisearch pour l'indexation.</TLDR>

Cette semaine, un collègue m'a parlé de [Lovable.dev](https://lovable.dev) en me disant : « *Dans un prompt, tu décris simplement le programme que tu veux générer, et l'outil le construit et le déploie même pour toi* ». Wow, il fallait vraiment que j'essaie.

Mais quoi demander ? Et si je lui demandais de créer un clone de [Marknotes](https://github.com/cavo789/marknotes) ? Ceux qui me suivent depuis des années savent que j'ai créé Marknotes, une application de prise de notes, il y a 10 ans. J'y ai travaillé pendant cinq ans avant de passer à autre chose.

![Marknotes](./images/marknotes.webp)

Voyons si Lovable.dev peut construire la même chose en une heure seulement. **Spoiler : non, mais ce n'était pas si mal.**

<!-- truncate -->

## Le résultat, après une heure et demie {#the-result-after-one-hour-and-a-half}

Après quelques corrections (le parcours réel se trouve plus bas), l'application fonctionnait ! Je pouvais parcourir mon disque et afficher le contenu de mes fichiers Markdown.

![Rendu d'un de mes articles](./images/rendering.webp)

Comme vous le voyez, l'interface affiche la liste des fichiers à gauche et, quand je clique sur un fichier, le contenu est rendu à droite. L'application met aussi le HTML en cache dans Redis. Donc, si je reclique sur le même fichier, le contenu est récupéré depuis Redis et n'est pas régénéré.

Le rendu est loin d'être parfait, mais c'est un bon début. Je devrais peut-être préciser comment gérer le YAML front matter, les titres, etc. Cela reste une base très solide.

Comme demandé, j'ai un breadcrumb en haut de page pour afficher le chemin du fichier.

Dans le coin supérieur droit, il y a un moteur de recherche. En tapant `vscode`, j'obtiens une très belle liste des fichiers contenant ce mot. Quand je clique sur un fichier, son contenu est rendu à droite. Cette fonctionnalité est vraiment pratique : elle me permet de trouver rapidement un fichier sans devoir naviguer dans les dossiers.

![Le moteur de recherche](./images/search_engine.webp)

Autre très bon point : l'API fonctionne du premier coup. Je peux obtenir la liste des fichiers en appelant `http://localhost:8000/api/file-tree` et le contenu d'un fichier en appelant `http://localhost:8000/api/render?path=path/to/file.md`.

![Récupération de la liste des fichiers](./images/api.webp)

## L'objectif {#the-objective}

Je lui ai demandé de créer une application entièrement dockerisée avec un backend <Link to="/blog/python-fastapi">Python/FastAPI</Link> et un frontend React. L'application doit convertir le Markdown en HTML une seule fois. Si la conversion a déjà été faite, le HTML doit être servi depuis un cache (Redis). L'application doit pouvoir parcourir un dossier de mon disque de manière récursive et afficher la liste des fichiers et des dossiers. Quand je clique sur un fichier, elle doit convertir le contenu Markdown en HTML et l'afficher.

L'application doit aussi disposer d'un moteur de recherche pour rechercher du texte dans les fichiers Markdown (Meilisearch).

Voici le prompt que j'ai utilisé :

<Snippet filename="prompt.md" source="./files/prompt.txt" />

## Le chemin parcouru : versions successives et erreurs {#the-actual-path-there-successive-versions-and-errors}

Après une minute, j'avais une première version de l'application. Comme je voulais utiliser exclusivement Docker, la commande à lancer était `docker compose up --build`.

![La liste des containers](./images/containers.webp)

Ça ne fonctionnait pas, à cause d'une erreur dans le Dockerfile du frontend. J'ai copié/collé l'erreur dans le prompt et j'ai obtenu une deuxième version. Puis une troisième, une quatrième et enfin une cinquième.

La dernière s'est buildée correctement. J'avais l'interface web avec deux fichiers Markdown d'exemple, mais aucun ne s'affichait à cause d'une erreur Python.

J'ai copié/collé l'erreur dans le prompt et j'ai reçu une réponse du type : « Ok, l'erreur se situe dans le fichier ... et tu dois faire cette modification et celle-là. »

## Conclusion {#conclusion}

Après environ deux heures, tout fonctionnait. Je pouvais parcourir mon disque, afficher le contenu des fichiers Markdown et rechercher du texte dans les fichiers.

Comme l'IA a vraiment participé à la rédaction de cet article (et à cette application), il porte le badge « AI Assisted » — voyez <Link to="/blog/docusaurus-ai-gemini">comment j'indique le contenu assisté par IA</Link> dans Docusaurus si vous voulez savoir comment ça marche.

Comme je dispose du code source complet, je peux continuer à l'améliorer moi-même, demander à Lovable.dev de le faire pour moi, ou envoyer le code sur une autre plateforme IA (comme Google AI Studio).

Si vous voulez l'essayer, vous pouvez le télécharger en cliquant sur le bouton ci-dessous.

<DownloadButton file={require("./files/docuverse.zip").default} />
