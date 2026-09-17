---
slug: docusaurus-docker-own-blog
title: Faire tourner son propre blog avec Docusaurus et Docker
date: 2024-02-07
description: "Prenez le contrôle total de votre blog Docusaurus auto-hébergé dans un container Docker. Un guide pas à pas : personnalisation du site, montage de volumes et gestion du contenu."
authors: [christophe]
image: /img/v2/docusaurus_docker.webp
series: Discovering Docusaurus
mainTag: docusaurus
tags:
  - docker
  - docusaurus
  - nodejs
  - npm
  - yarn
language: fr
review_date: 2026-07-30
---
![Faire tourner son propre blog avec Docusaurus et Docker](/img/v2/docusaurus_docker.webp)

<TLDR>
Cet article de suivi montre comment personnaliser un blog Docusaurus dockerisé en copiant les fichiers clés (`docusaurus.config.js`, `src`, `static`) hors du container en cours d'exécution avec `docker compose cp`, puis en les montant comme volumes dans `compose.yaml`, de sorte que les modifications faites sur l'host soient reflétées en direct — titre du site, favicon, branding de la navbar, pages personnalisées et fichiers statiques.
</TLDR>

Cet article reprend là où <Link to="/blog/docusaurus-docker/">Running Docusaurus with Docker</Link> s'était arrêté. Lisez-le d'abord et créez les fichiers nécessaires.

Vous avez donc créé votre propre blog avec Docker et Docusaurus. En suivant les étapes expliquées dans l'article <Link to="/blog/docusaurus-docker/">Running Docusaurus with Docker</Link>, vous disposez maintenant d'un blog dont la liste des articles est stockée sur votre machine, dans un dossier `blog`.

Allons plus loin.

*Et quand votre blog est prêt à quitter votre machine, <Link to="/blog/docker-docusaurus-prod">Encapsulate an entire Docusaurus site in a Docker image</Link> l'empaquette pour la production, tandis que <Link to="/blog/github-action">GitHub - Use Actions to deploy this blog</Link> le publie automatiquement à chaque push. Une fois en ligne, <Link to="/blog/matomo-install">How to self-host Matomo</Link> vous dit qui le lit.*

<!-- truncate -->

Dans l'article précédent, nous avons créé un dossier sur votre disque ; nous allons le réutiliser.

Lancez `cd /tmp/docusaurus` pour y entrer, puis ouvrez le dossier dans votre éditeur (de mon côté, je lance `code .`).

Dans Visual Studio Code, vous devriez voir ceci (sinon, relisez et exécutez les commandes du premier article) :

![Point de départ dans vscode](./images/vscode_starting_point.webp)

Et en lançant `docker compose up --detach --build` pour démarrer le blog, vous obtiendrez cet écran :

<BrowserWindow url="http://localhost:3000">
  ![Blog au point de départ](./images/blog_starting_point.webp)
</BrowserWindow>

## Personnaliser le nom, le titre, les icônes et l'URL de votre site {#customize-the-name-title-icons-and-url-of-your-site}

Pour l'instant, on voit *My Site* en haut à gauche de l'écran.

Il y a un fichier très important dans Docusaurus : `docusaurus.config.js` ([https://docusaurus.io/docs/api/docusaurus-config](https://docusaurus.io/docs/api/docusaurus-config)).

Nous devons l'adapter à nos envies.

<AlertBox variant="caution" title="Il nous faut le fichier sur notre ordinateur">
Ok, maintenant, un concept très important : nous devons garder sur notre ordinateur une copie de tout ce que nous voulons modifier.

Pour copier un fichier depuis notre container vers notre disque, la commande à utiliser est `docker compose cp <service-name>:/file/path/within/container /host/path/to/copy/file/to`

</AlertBox>

Donc, pour copier le fichier `docusaurus.config.js` sur votre disque, lancez `docker compose cp blog:/app/docusaurus.config.js /tmp/docusaurus/docusaurus.config.js` (remplacez `/tmp/docusaurus` par le nom du dossier où vous avez créé votre blog, sur votre disque dur).

Une fois la copie faite, vous retrouvez le fichier dans votre éditeur :

![Docusaurus.config.js sur le disque local](./images/docusaurus.config.js.webp)

Et la deuxième chose à faire pour pouvoir modifier le fichier et refléter les changements dans notre container Docker, c'est de monter le fichier.

Éditez votre fichier `compose.yaml` et ajoutez la ligne surlignée ci-dessous :

```yaml
name: my_docusaurus_blog

services:
  blog:
    build: .
    ports:
      - 3000:3000
    user: 1000:1000
    volumes:
      - ./blog:/app/blog
      //highlight-next-line
      - ./docusaurus.config.js:/app/docusaurus.config.js
```

On y est presque : il faut recréer notre container, donc on relance `docker compose up --detach`.

En rafraîchissant la page web, on ne verra aucun changement mais... modifions maintenant le fichier `docusaurus.config.js`.

Ouvrez donc `docusaurus.config.js` et cherchez `themeConfig`, puis, à l'intérieur, le nœud `navbar`.

Vous trouverez quelque chose comme ceci :

![La navbar dans config.js](./images/navbar_default.webp)

Changez le texte comme vous voulez, par exemple :

```js
navbar: {
  title: 'Welcome world!',
  logo: {
    alt: 'It\'s a photo of me ... or not',
    src: 'https://i.pravatar.cc/300',
  },
}
```

Sauvez, rafraîchissez votre navigateur et vous obtenez :

<BrowserWindow url="http://localhost:3000">
  ![Ma propre navbar](./images/navbar_me.webp)
</BrowserWindow>

<AlertBox variant="info" title="Vous venez d'apprendre un concept très important !">
Quand vous voulez pouvoir modifier un fichier présent dans un container, vous devez récupérer le fichier sur votre disque (1) puis synchroniser le fichier entre votre ordinateur et le container (2).

Pour la première étape, la commande à utiliser est `docker compose cp` suivie du nom du container (regardez votre fichier `compose.yaml`, c'est le nom du service), puis vous indiquez où le fichier est stocké dans le container et où le copier sur votre disque. C'est pour ça que nous avons utilisé `docker compose cp blog:/app/docusaurus.config.js docusaurus.config.js`.

La deuxième étape consiste à faire en sorte que les changements dans ce fichier copié soient reflétés entre votre host et le container : c'est pourquoi nous avons mis à jour la liste des `volumes` dans le fichier `compose.yaml`. Désormais, les changements faits sur votre disque ou par le container sont synchronisés des deux côtés.

</AlertBox>

Étape suivante, toujours dans le fichier `docusaurus.config.js` : cherchez `title`, `favicon` et `url`, puis renseignez vos propres valeurs, par exemple :

```js
const config = {
  title: 'MyBlog',
  favicon: 'https://www.iconarchive.com/download/i75799/martz90/circle/android.ico',
  url: 'https://yoursite.com',

  // ...
};
```

<BrowserWindow url="http://localhost:3002/blog">
  ![Favicon](./images/favicon.webp)
</BrowserWindow>

<AlertBox variant="info" title="Un simple rafraîchissement suffit">
Cette fois, pas besoin de relancer la commande `docker up` : appuyez simplement sur <kbd>F5</kbd> pour voir vos changements directement dans le navigateur.

</AlertBox>

<AlertBox variant="caution" title="Lisez la documentation officielle">
Vous pouvez faire bien plus en modifiant le fichier `docusaurus.config.js` ; référez-vous à la documentation officielle [https://docusaurus.io/docs/api/docusaurus-config](https://docusaurus.io/docs/api/docusaurus-config).

</AlertBox>

## Le dossier src/pages {#the-srcpages-folder}

Le dossier `src/pages` contient des fichiers comme `index.md` qui seront convertis en `index.html` (votre page d'accueil, donc). Vous pouvez aussi créer un fichier appelé `tutorial.md` (qui deviendra `tutorial.html`) et créer une entrée de menu dans votre barre de navigation avec `/tutorial.html` comme cible.

Vous devez copier le dossier du container vers votre host, comme vous l'avez déjà vu. Lancez la commande ci-dessous pour copier le dossier sur votre host :

<Terminal typewriter>
$ docker compose cp blog:/app/src src
</Terminal>

Vous devez mettre à jour votre fichier `compose.yaml` et ajouter la ligne surlignée ci-dessous :

```yaml
name: my_docusaurus_blog

services:
  blog:
    build: .
    ports:
      - 3000:3000
    user: 1000:1000
    volumes:
      - ./blog:/app/blog
      - ./docusaurus.config.js:/app/docusaurus.config.js
      //highlight-next-line
      - ./src:/app/src
```

## Le dossier static {#the-static-folder}

Ce dossier contient les fichiers qui seront copiés dans votre répertoire racine lors du déploiement de votre blog. C'est donc l'endroit parfait pour mettre, par exemple, un fichier `.htaccess` ou `robots.txt`.

<AlertBox variant="info" title="Cas d'usage réel">
De mon côté, j'utilise le dossier static pour stocker mes images communes (celles que j'utilise plusieurs fois). J'ai donc créé un dossier `static/img` sur mon blog. Ce dossier sera copié vers `/img` (directement sous la racine) sur mon serveur. Accéder aux images dans mes articles devient alors facile : la source ressemblera à `/img/image_name.ext`.

</AlertBox>

Lancez la commande ci-dessous pour copier le dossier sur votre host :

<Terminal typewriter>
$ docker compose cp blog:/app/static static
</Terminal>

Et mettez à jour votre fichier `compose.yaml` comme ceci :

```yaml
name: my_docusaurus_blog

services:
  blog:
    build: .
    ports:
      - 3000:3000
    user: 1000:1000
    volumes:
      - ./blog:/app/blog
      - ./docusaurus.config.js:/app/docusaurus.config.js
      - ./src:/app/src
      //highlight-next-line
      - ./static:/app/static
```

## Vous avez maintenant les bases {#you-now-have-the-basics}

Poursuivez votre route, rendez-vous sur [https://docusaurus.io/docs](https://docusaurus.io/docs) et lisez la documentation.

Trouvez aussi l'inspiration dans la *Docusaurus Site Showcase* : [https://docusaurus.io/showcase](https://docusaurus.io/showcase).

Le clavier est à vous ! N'attendez pas, commencez à écrire votre blog dès maintenant !
