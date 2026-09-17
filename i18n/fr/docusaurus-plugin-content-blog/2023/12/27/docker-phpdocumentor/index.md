---
slug: docker-phpdocumentor
title: Générer la documentation d'un projet PHP
date: 2023-12-27
description: Générez sans effort une documentation de qualité pour votre code PHP. Ce guide montre comment utiliser l'image Docker phpDocumentor pour créer la documentation en une seule commande.
authors: [christophe]
image: /img/v2/php_tips.webp
mainTag: php
tags:
  - code-quality
  - docker
  - php
language: fr
review_date: 2026-07-30
---
![Générer la documentation d'un projet PHP](/img/v2/php_tips.webp)

<TLDR>
Cet article montre comment générer un site de documentation navigable pour un projet PHP (avec le cœur de WordPress comme exemple) sans rien installer localement : un fichier de configuration `phpdoc.xml` et une seule commande `docker run ... phpdoc/phpdoc:3` analysent le dossier `src` et produisent un site HTML complet dans `.phpdoc/index.html`.
</TLDR>

Vous avez un projet PHP et vous souhaitez — hop, hop, en deux temps trois mouvements — générer un site de documentation sans vous prendre la tête.

Facile ! [phpDocumentor](https://docs.phpdoc.org/) le fait pour vous et, comme une image Docker existe, presque tout tient en une seule commande.

<!-- truncate -->

## Une commande, un site de documentation complet {#one-command-a-full-documentation-website}

Depuis la racine de votre projet PHP, lancez :

<Terminal typewriter>
$ docker run -it --rm -u $(id -u):$(id -g) -v .:/data phpdoc/phpdoc:3
</Terminal>

Et voici ce qui atterrit dans le dossier `.phpdoc` — celui-ci a été généré à partir du code de WordPress :

<BrowserWindow url="http://localhost/">
  ![Documentation PHP de WordPress 6.4.2](./images/wordpress_phpdoc.webp)
</BrowserWindow>

Un site navigable avec les namespaces, les classes, leurs méthodes et les docblocks que vous avez écrits. Rien n'a été installé sur votre machine : phpDocumentor, PHP et toutes les dépendances vivent dans l'image, qui disparaît avec le container grâce à `--rm`.

## Le fichier de configuration {#the-configuration-file}

[phpDocumentor](https://docs.phpdoc.org/) a besoin d'un fichier de configuration pour savoir quoi analyser et où écrire. Créez un nouveau fichier appelé `phpdoc.xml` avec ce contenu, dans le répertoire de votre projet :

<Snippet filename="phpdoc.xml" source="./files/phpdoc.xml" />

C'est ce qui indique à la commande ci-dessus d'analyser le dossier `src` et de créer le répertoire `.phpdoc` où la documentation sera enregistrée.

<AlertBox variant="info" title="WSL2 - Windows">
Si vous travaillez sous WSL2, pour accéder à la documentation, lancez simplement `powershell.exe .phpdoc/index.html` pour ouvrir la documentation. Lisez <Link to="/blog/wsl-powershell">Starting the default associated Windows program on WSL</Link> ou <Link to="/blog/wsl-windows-explorer">Open your Linux folder in Windows Explorer</Link> pour plus d'informations.

</AlertBox>

<Details label="Pas de projet PHP sous la main ? Récupérez-en un gros pour jouer.">

Pour l'illustration ci-dessus, j'ai utilisé le code de WordPress. Démarrez un shell Linux et lancez `mkdir -p /tmp/wordpress && cd $_`.

Lancez ensuite `curl -L --silent -o wordpress-develop-6.4.2.zip https://github.com/WordPress/wordpress-develop/archive/refs/tags/6.4.2.zip` pour télécharger WordPress v6.4.2. Vous obtiendrez un fichier `wordpress-develop-6.4.2.zip` sur votre disque.

Décompressez-le avec `unzip wordpress-develop-6.4.2.zip && rm wordpress-develop-6.4.2.zip` ; vous aurez maintenant un dossier `wordpress-develop-6.4.2`, alors entrez-y avec `cd wordpress-develop-6.4.2`.

</Details>

## Conclusion {#conclusion}

Un `docker run`, un fichier XML, et n'importe quel projet PHP — le vôtre, ou celui dont vous venez d'hériter — devient un site de documentation navigable. Le plus intéressant n'est pas la génération elle-même : c'est que la qualité de la sortie reflète directement les docblocks présents dans le code. Lancez-la une fois sur un projet et vous voyez immédiatement où l'effort de documentation est réellement passé.

Bash n'a pas d'équivalent à phpDocumentor, c'est pourquoi j'ai écrit le mien ; voyez <Link to="/blog/linux-generate-documentation-from-bash-scripts">Linux - Generate documentation from Bash scripts</Link>. Et pour de la documentation qui n'est pas extraite du code du tout, il y a <Link to="/blog/quarto-industrialisation">Quarto - How I Built a Self-Documenting Ecosystem for 50+ Projects</Link>.
