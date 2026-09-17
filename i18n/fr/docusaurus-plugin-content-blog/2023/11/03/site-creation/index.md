---
slug: site-creation
title: Création du site
date: 2023-11-03
description: Suivez les étapes suivies pour créer ce blog Docusaurus. Découvrez l'utilisation de plugins essentiels comme la recherche, le sitemap, le zoom sur les images, et l'ajout du système de commentaires Giscus.
authors: [christophe]
image: /img/v2/site_creation.webp
mainTag: docusaurus
tags:
  - docker
  - docusaurus
  - nodejs
  - winscp
language: fr
review_date: 2026-07-30
---
> [Docusaurus.io](https://docusaurus.io/)

![Creation of this blog](/img/v2/site_creation.webp)

<TLDR>
Cet article documente la façon dont ce blog a été construit : initialisation de Docusaurus en mode blog uniquement, entièrement via l'image Docker officielle `node` (sans installation locale de Node.js), configuration de `docusaurus.config.js`, et ajout de plugins pour la recherche locale, le sitemap, le zoom sur les images et les commentaires Giscus. Il se termine par le build du site statique avec `yarn build` et son déploiement en FTP avec WinSCP, plus l'injection d'un script d'analytics conforme au RGPD depuis withcabin.com.
</TLDR>

Voici les étapes que j'ai suivies pour créer ce blog.

<!-- truncate -->

## Utiliser Docusaurus {#using-docusaurus}

Comme j'aime vraiment la simplicité de Docker, je ne vais pas installer Node.js sur ma machine mais utiliser l'image Docker officielle. *Cet article montre l'approche brute avec `docker run` ; si vous préférez un `Dockerfile` et un `compose.yaml` prêts à l'emploi, allez voir <Link to="/blog/docusaurus-docker">Running Docusaurus with Docker</Link>.*

<Vars name="blog" port="3000" labels={{ name: "Nom du container", port: "Port du serveur de dev" }} />

<Terminal typewriter source="./files/terminal-0.txt" />

L'instruction ci-dessus va télécharger Node.js (la dernière version) sur ma machine s'il n'est pas déjà présent et créer une instance en cours d'exécution (appelée un *container*). Le flag `--user $UID:$GID` permet de démarrer le container avec les mêmes identifiants que les miens en local (c.-à-d. réutiliser mon utilisateur Unix local `christophe` pour que les fichiers/dossiers créés dans le container appartiennent à mon utilisateur local).

L'argument de ligne de commande `-v ${PWD}/:/project` va <Link to="/blog/docker-volume">partager mon dossier courant</Link> sur mon ordinateur avec le container : le dossier `/project` dans le container sera mon dossier courant sur mon ordinateur.

Et enfin, je lance un shell interactif puisque j'ai indiqué `/bin/bash` comme point d'entrée.

Maintenant que j'ai un prompt dans le container, je vais créer mon blog avec Docusaurus (comme expliqué dans la [documentation officielle](https://docusaurus.io/docs/installation)).

<Terminal typewriter>
$ npx create-docusaurus@latest blog classic --javascript
</Terminal>

Après un bon moment, le dossier blog est créé et je peux jeter un œil à son contenu :

```tree
.
├── blog
├── docs
├── node_modules
├── src
└── static
```

L'étape d'installation est terminée ; je vais quitter le container et revenir sur mon ordinateur. Pour cela, depuis la console Docker, je tape simplement `exit`.

## Lancer le site web {#run-the-website}

De retour sur mon ordinateur, je vais aller dans mon dossier `blog` (`cd blog`) et relancer la commande Docker, mais cette fois avec le paramètre supplémentaire <Code>-p <Var name="port">3000</Var>:3000</Code>. Ce paramètre va exposer le port <Var name="port">3000</Var> du container vers ma machine pour que je puisse voir le site en surfant sur `http://localhost:`<Var name="port">3000</Var>.

Plutôt que de lancer une session shell interactive, je préfère exécuter `/bin/bash -c "npx docusaurus start"` pour lancer le watcher de Docusaurus et servir mes fichiers :

<Terminal typewriter files="files/terminal-2.txt" />

Après quelques secondes, le container est prêt et je surfe sur mon site en allant sur <Code>http://localhost:<Var name="port">3000</Var></Code>.

<BrowserWindow url="http://localhost:%%port=3000%%">
  ![Homepage](./images/homepage.webp)
</BrowserWindow>

<AlertBox variant="highlyImportant" title="Le flag --host 0.0.0.0">
Il est vraiment crucial d'utiliser le flag `--host 0.0.0.0` lors de l'appel à `npx docusaurus start`. Cela autorise l'accès externe au site. S'il manque, aller sur <Code>http://localhost:<Var name="port">3000</Var></Code> (ou lancer <Code>curl http://127.0.0.1:<Var name="port">3000</Var></Code>) affichera une erreur `Empty reply from server`.
</AlertBox>

## Quelques réglages {#some-settings}

Par défaut (avec l'installation standard), Docusaurus va créer le squelette d'un site web avec deux entrées principales : un blog et un tutoriel.

Pour rester simple, je ne garde que le blog et supprime la partie tutoriel. Pour cela, j'ai suivi cet article officiel : [https://docusaurus.io/docs/blog#blog-only-mode](https://docusaurus.io/docs/blog#blog-only-mode).

Maintenant, je peux supprimer le dossier `/docs` de mon répertoire `blog` :

```tree
.
├── blog
├── node_modules
├── src
└── static
```

Je vais aussi apporter quelques modifications à des fichiers comme `docusaurus.config.js` ou `blog/authors.yml` pour coller à mes besoins.

### Fichier docusaurus.config.js {#file-docusaurusconfigjs}

En mettant `hideOnScroll` à `true`, la barre de navigation sera masquée quand l'utilisateur défile vers le bas mais réapparaîtra dès qu'il défile vers le haut. L'idée est de donner plus de place à l'écran pour le contenu.

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.js" />

Définir l'image par défaut pour les réseaux sociaux :

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.social_media.js" />

## Écrire mon premier article {#make-my-first-article}

Avec mon éditeur préféré ([vscode](https://code.visualstudio.com/)), j'ouvre le site de mon blog (je tape juste `code .` dans ma console Linux pour ouvrir mon projet `blog`).

Maintenant, dans le répertoire `/blog`, je crée un nouveau dossier appelé `2023-11-02-site-creation` et j'y crée le fichier `index.md`.

<AlertBox variant="note">
Quand mon article de blog ne contient que du texte, sans images ni fichiers liés, je peux simplement créer un fichier `.md` comme `/blog/2023-11-02-this-is-a-test.md`. La création d'un dossier n'est donc pas du tout obligatoire.

</AlertBox>

Dans le chapitre précédent, npx a été exécuté avec la commande <Code>{`docker run --rm -it --name `}<Var name="name">blog</Var>{` --user \$UID:\$GID -v \${PWD}/:/project -w /project -p `}<Var name="port">3000</Var>{`:3000 node /bin/bash -c "npx docusaurus start --host 0.0.0.0"`}</Code> donc, toute modification faite au blog sera immédiatement synchronisée avec Docker : je n'ai qu'à sauvegarder mon article et npx rechargera mon site ; très simple et pratique.

### Utiliser quelques mises en page {#using-some-layouts}

Docusaurus supporte des tags Markdown spéciaux appelés *admonition* (voir [https://docusaurus.io/docs/markdown-features/admonitions](https://docusaurus.io/docs/markdown-features/admonitions)).

Par exemple, pour afficher un paragraphe comme une astuce, comme ci-dessous, il suffit d'utiliser cette syntaxe :

```none
:::tip
Some **content** with _Markdown_ `syntax`.
:::
```

<AlertBox variant="info">
Un peu de **contenu** avec la *syntaxe* `Markdown`.

</AlertBox>

Pour obtenir la liste complète des fonctionnalités supportées, voir [Markdown Features](https://docusaurus.io/docs/markdown-features).

### Ajouter des plugins {#adding-plugins}

#### Moteur de recherche {#search-engine}

> [https://github.com/cmfcmf/docusaurus-search-local](https://github.com/cmfcmf/docusaurus-search-local)

La fonctionnalité de moteur de recherche a été ajoutée en suivant cet article de blog : [https://yoandev.co/une-documentation-avec-docusaurus-et-gitlab-pages/#bonus--ajoutons-un-moteur-de-recherche](https://yoandev.co/une-documentation-avec-docusaurus-et-gitlab-pages/#bonus--ajoutons-un-moteur-de-recherche)

Ajouté en lançant `yarn add @cmfcmf/docusaurus-search-local` dans le container Docker (ouvert avec `make bash`).

#### Support de PHP et bash dans prism {#support-for-php-and-bash-in-prism}

> [https://www.npmjs.com/package/@docusaurus/theme-classic](https://www.npmjs.com/package/@docusaurus/theme-classic)

Ajouté en lançant `yarn swizzle @docusaurus/theme-classic prism-include-languages` dans le container Docker (ouvert avec `make bash`). Plus de détails sur [Supported Languages](https://docusaurus.io/docs/markdown-features/code-blocks#supported-languages).

#### Générateur de sitemap {#sitemap-generator}

> [https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-sitemap)

Ajouté en lançant `yarn add @docusaurus/plugin-sitemap` dans le container Docker (ouvert avec `make bash`).

Après l'ajout, j'ai aussi créé manuellement le fichier `static/robots.txt` avec ce contenu :

<Snippet filename="static/robots.txt" source="./files/robots.txt" />

#### Plugins d'images {#image-plugins}

> [https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-ideal-image](https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-ideal-image)

Ajouté en lançant `yarn add @docusaurus/plugin-ideal-image` dans le container Docker (ouvert avec `make bash`). Plus de détails sur [Supported Languages](https://docusaurus.io/docs/markdown-features/code-blocks#supported-languages).

> [https://www.npmjs.com/package/docusaurus-plugin-image-zoom](https://www.npmjs.com/package/docusaurus-plugin-image-zoom)

Ajouté en lançant `yarn add docusaurus-plugin-image-zoom` dans le container Docker (ouvert avec `make bash`).

#### Ajouter une zone de commentaires {#adding-a-comment-area}

> [How to add Giscus comments to Docusaurus](https://dev.to/m19v/how-to-add-giscus-comments-to-docusaurus-439h)

Ajout de Giscus pour permettre les commentaires et les retours.

## Pousser sur Github {#push-to-github}

Sur Github.com, j'ai créé un nouveau repository appelé `blog` ([https://github.com/cavo789/blog](https://github.com/cavo789/blog)). Une fois cela fait, retour à ma console et je lance quelques commandes git :

<Terminal typewriter source="./files/terminal-1.txt" />

Cela fait, j'ai donc poussé mes fichiers sur Github comme prévu par Docusaurus : par exemple, `/node_modules` ne fait pas partie de mon repo ; ce qui est très bien puisque nous créerons ce dossier plus tard en lançant une commande npx sur le serveur web où le site sera hébergé.

## Construire la version statique du blog {#build-static-version-of-the-blog}

Pour construire les pages statiques, je lance `docker run --rm -it --user $UID:$GID -v ${PWD}/:/project -w /project node /bin/bash -c "yarn build"`.

Cela va créer/mettre à jour le dossier `/build` avec une version fraîche du site.

L'étape suivante est de démarrer mon client FTP (qui est [WinSCP](https://winscp.net/eng/download.php)) et de copier mon dossier local `/blog/build` vers mon site distant. Pour n'envoyer que les fichiers réellement modifiés, voir <Link to="/blog/winscp-synchronize-both">WinSCP - Synchronize host and remote</Link>.

*Aujourd'hui, je ne le fais plus à la main : le site est déployé automatiquement, comme expliqué dans <Link to="/blog/github-action">GitHub - Use Actions to deploy this blog</Link>.*

## Ajouter withcabin pour des stats conformes au RGPD {#adding-withcabin-for-gdpr-compliant-stats}

En ajoutant les lignes ci-dessous au `docusaurus.config.js` comme nœud enfant de `const config`, j'injecte un script dans la partie body. Cela permettra ensuite d'avoir des stats conformes au RGPD sur [https://withcabin.com/](https://withcabin.com/).

<Snippet filename="docusaurus.config.js" source="./files/docusaurus.config.withcabin.js" />

Note : le script n'est injecté dans les pages qu'après un `yarn build`, c'est-à-dire quand le site statique est généré ; pas pendant un `yarn watch`.
