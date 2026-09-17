---
slug: markitdown
title: Markitdown - Convertir des fichiers et documents MS Office en Markdown
date: 2026-05-04
description: Convertissez facilement vos documents MS Office (Word, Excel) et vos PDF en Markdown avec l'outil Markitdown de Microsoft. Avec un guide pas à pas pour l'installation via Docker.
authors: [christophe]
image: /img/v2/markdown.webp
mainTag: markdown
tags:
  - docker
  - excel
  - markdown
language: fr
updates:
  - date: 2026-07-30
    note: "markitdown updated from v0.1.5 to v0.1.7; Dockerfile and AlertBox version reference updated."
blueskyRecordKey: 3mkzumi3cf22g
---
![Markitdown - Convertir des fichiers et documents MS Office en Markdown](/img/v2/markdown.webp)

<!-- cspell:ignore markitdown -->

<TLDR>Cet article explore l'utilisation de Markitdown, un utilitaire très complet de Microsoft qui convertit des fichiers comme les documents Word, les feuilles Excel et les PDF en Markdown propre. Pour garder votre système local propre et éviter de gérer des dépendances Python globalement, l'auteur propose un guide pas à pas pour installer l'outil dans un container Docker isolé et léger. Le tutoriel couvre la création d'un Dockerfile sur mesure, l'utilisation de Docker Compose pour l'orchestration et, au final, la construction d'un script wrapper exécutable global (md-convert). Cette configuration vous permet de lancer des conversions de documents en toute sécurité et sans effort, depuis n'importe quel répertoire, directement dans votre terminal.</TLDR>

Récemment, un ami m'a parlé d'un outil de Microsoft appelé [Markitdown](https://github.com/microsoft/markitdown/) : un utilitaire qui convertit des fichiers PDF et MS Office (comme `.docx` ou `.xlsx`) en Markdown. En regardant le repository GitHub, il a l'air très complet. Ils annoncent la conversion des PDF, PowerPoint, Word, Excel, images, audio, HTML et formats texte comme CSV, JSON ou XML — et il parcourt même les fichiers ZIP. C'est une sacrée promesse ! Comme il est toujours utile de convertir rapidement les fichiers `.docx` de collègues qui n'écrivent pas en Markdown, j'ai voulu le tester sérieusement.

Dans cet article, nous allons créer une image Docker et un petit script de conversion appelé `md-convert` que vous pourrez appeler depuis n'importe où sur votre disque pour convertir facilement des fichiers `docx`, `xlsx` et `pdf` en Markdown grâce à Markitdown.

<AlertBox variant="note" title="Besoin uniquement d'une plage Excel ou d'un fichier CSV sous forme de tableau Markdown ?">
Markitdown est un outil généraliste et plutôt lourd. Si votre besoin est plus restreint — transformer une plage Excel copiée ou un fichier CSV en tableau Markdown — mes outils en ligne <Link to="/blog/markdown-xls2md">XLS2MD</Link> et <Link to="/blog/markdown-csv2md">CSV2MD</Link> sont plus rapides, sans Docker.
</AlertBox>

<!-- truncate -->

## Première conversion {#first-conversion}

Une fois l'image et le wrapper `md-convert` construits (voir la section Installation plus bas), convertir un document tient en une commande, depuis n'importe quel dossier :

Copiez un fichier `.docx` dans le dossier qui contient votre `Dockerfile` et votre `compose.yaml`. Disons dans le dossier `/tmp/markitdown`.

Vous pouvez ensuite lancer la conversion avec cette commande : `docker compose run --rm markitdown sample.docx > sample.md`.

Cette approche n'est cependant pas très pratique au quotidien. Il serait bien plus simple de lancer la conversion depuis n'importe quel répertoire.

### Utiliser un binaire {#using-a-binary}

Créons le fichier `md-convert` :

<Snippet filename="/usr/local/bin/md-convert" source="./files/md-convert.sh" />

Et n'oubliez pas de le rendre exécutable : `sudo chmod +x /usr/local/bin/md-convert`.

Dès lors, il suffit d'aller dans n'importe quel dossier contenant un document à convertir. Par exemple :

<Terminal typewriter source="./files/terminal-1.txt" />

## Pourquoi cette approche {#why-this-approach}

Comme toujours, je commence par créer une image Docker pour ne pas devoir installer Python sur ma machine ni gérer l'utilitaire et toutes ses dépendances.

<AlertBox variant="info" title="J'aime Docker aussi pour ça">
C'est exactement pour cela que Docker est indispensable : l'isolation complète. Tout tourne dans le container. Une fois mes expérimentations terminées, je supprime l'image et il ne reste rien sur mon disque, à part le Dockerfile qui permet de la recréer à la demande. *Si ce raisonnement est nouveau pour vous, <Link to="/blog/docker-definition-like-im-five">Docker - Explain me like I'm five - What's Docker for?</Link> l'explique avec une analogie culinaire.*
</AlertBox>

## Installation {#installation}

### Créer notre image Docker {#create-our-docker-image}

Créons un nouveau dossier et plaçons-nous dedans : `mkdir -p /tmp/markitdown && cd $_`

Créez ensuite un nouveau fichier appelé `Dockerfile` :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<AlertBox variant="info" title="Extensions supportées">
Regardez la ligne `pip install --prefix=/python "markitdown[docx,xlsx,pdf]==0.1.7"` dans notre `Dockerfile` ; nous pourrions remplacer `docx,xlsx,pdf` par `all` pour pouvoir convertir tous les formats supportés par Markitdown, mais notre image Docker finale serait plus volumineuse.

Ou alors, ajoutez simplement les extensions dont vous avez besoin. Référez-vous à la documentation officielle pour cela.
</AlertBox>

### Créer un fichier d'orchestration {#create-an-orchestration-file}

Cette étape n'est pas obligatoire, mais créer un fichier `compose.yaml` va nous permettre de simplifier la commande finale et d'y intégrer des options de sécurité strictes.

Créez le fichier `compose.yaml` avec ce contenu :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

### Construire l'image {#build-the-image}

Une fois les deux fichiers créés, lancez simplement `docker compose build` pour construire l'image Docker. L'image finale s'appellera `markitdown`.

Vous pouvez ensuite la tester avec cette commande : `docker compose run --rm markitdown --help`.

## Conclusion {#conclusion}

Grâce à Markitdown et au script wrapper `md-convert` que nous venons de construire, convertir des documents bureautiques en Markdown propre devient simple, sécurisé et natif à votre terminal.

Consultez le [repository officiel](https://github.com/microsoft/markitdown/) pour la liste complète des formats supportés :

- PDF
- PowerPoint
- Word
- Excel
- Images (métadonnées EXIF et OCR)
- Audio (métadonnées EXIF et transcription vocale)
- HTML
- Formats texte (CSV, JSON, XML)
- Archives ZIP (parcours récursif du contenu)
- URL YouTube
- EPUB
- ... et plus encore !

Dans ce guide, nous avons délibérément choisi de ne compiler que les extensions pour Word, Excel et PDF (`[docx,xlsx,pdf]`) afin de garder notre image Docker légère et bien cadrée. Vous pouvez toutefois étendre facilement les capacités de l'outil selon vos besoins. Il suffit d'ajuster les extras du `pip install` dans le `Dockerfile` et de reconstruire votre image.

Référez-vous à la section [Optional Dependencies](https://github.com/microsoft/markitdown/#optional-dependencies) de la documentation officielle pour explorer tout le potentiel de cet utilitaire.

<AlertBox variant="tip" title="PDF complexes, tableaux denses, pages scannées ?">
Markitdown analyse chaque format avec une bibliothèque dédiée, ce qui est rapide et léger mais aplatit parfois une mise en page complexe. Quand le document compte vraiment, je passe désormais à une seconde image, plus lourde, construite exactement de la même façon : voir <Link to="/blog/docling">Docling - Convert PDF, Word, PowerPoint, Excel and HTML to Markdown, GPU-Accelerated</Link>, qui fait tourner de vrais modèles d'analyse de mise en page et de structure de tableaux (sur le GPU, si vous en avez un).
</AlertBox>
