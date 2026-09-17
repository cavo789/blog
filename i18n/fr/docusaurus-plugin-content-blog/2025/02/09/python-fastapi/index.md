---
slug: python-fastapi
title: Python - Fast API - Créez votre API JSON en Python en une minute
date: 2025-02-09
description: Construisez votre première API JSON Python avec FastAPI en moins d'une minute ! Ce tutoriel couvre la configuration Docker, la documentation d'API automatisée (Swagger/ReDoc) et le hot-reload pour développer rapidement.
authors: [christophe]
image: /img/v2/api.webp
series: Building and testing REST APIs
mainTag: api
tags:
  - api
  - docker
  - python
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lwgccocnws2i
---
<!-- cspell:ignore Nodidju,pussibe -->
![Python - Fast API - Créez votre API JSON en Python en une minute](/img/v2/api.webp)

<TLDR>
Créez votre première API JSON Python avec FastAPI en une minute seulement. Ce tutoriel vous guide dans la mise en place d'une API basique avec Docker, depuis un simple « Hello World » jusqu'à un générateur de blagues interactif. Vous découvrirez les fonctionnalités puissantes de FastAPI comme la documentation d'API interactive générée automatiquement (Swagger et ReDoc) et comment configurer un environnement de développement avec hot-reload pour des cycles de développement rapides.
</TLDR>

> TLDR : une minute, c'est le temps qu'il vous faudra pour copier/coller le contenu de deux fichiers et lancer une commande Docker.

Ça paraît dingue, mais c'est VRAI. Il vous faudra juste une minute pour créer l'exemple ci-dessous : créer le répertoire de votre projet, créer deux fichiers et lancer deux commandes Docker et ... c'est fini.

En tant que programmeur PHP, quand j'ai pris le temps de lire un article de blog sur FastAPI, j'ai pensé **Nodidju ! Ç' n'est nén pussibe** (*Bon sang ! Ce n'est pas possible*).

Avec seulement deux fichiers, nous allons construire notre propre image Docker avec Python et FastAPI installés et coder notre application REST API. Pas plus de deux !

Impossible de ne pas essayer tout de suite et ... wow ... c'est VRAI !

<!-- truncate -->

<Vars port="82" labels={{ port: "Port de l'host" }} />

Voici le résultat : rendez-vous sur `http://127.0.0.1:`<Var name="port">82</Var> et obtenez votre première réponse JSON.

<BrowserWindow url="http://127.0.0.1:%%port=82%%">
  <img
    alt="Hello World"
    src={require("./images/hello_world.webp").default}
  />
</BrowserWindow>

## Pourquoi ça fonctionne {#why-it-works}

- `main.py` définit une route (`/`) avec deux lignes de Python — FastAPI transforme cette fonction en endpoint HTTP fonctionnel, sans aucune configuration de serveur à écrire.
- Le `Dockerfile` regroupe Python, FastAPI et votre code dans une seule image d'environ 184 Mo, donc il n'y a rien à installer sur votre host à part Docker lui-même.

## Créer notre première API {#creating-our-first-api}

Comme toujours, nous allons construire un exemple complètement fonctionnel. Ça ne pourrait pas être plus simple ; vous allez voir.

Créez un dossier bidon et placez-vous dedans :

<Terminal>
$ mkdir /tmp/fastapi && cd $_
</Terminal>

Dans ce dossier, créez un nouveau fichier appelé `Dockerfile` avec le contenu suivant :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

La taille finale de l'image sera d'environ 184 Mo, c'est-à-dire presque rien.

Comme vous l'avez vu, il nous faut un fichier appelé `main.py` ; créons-le :

<Snippet filename="main.py" source="./files/main.py" />

Ce code très simple définit une route appelée `/`. C'est une méthode `GET` et nous allons retourner un objet JSON :

```json
{
  "Hello": "World"
}
```

Vous savez quoi ? C'est déjà terminé.

## Lancer notre API {#running-our-api}

Il nous faut construire notre image Docker et la lancer :

<Terminal typewriter>
$ docker build -t python-fastapi . && docker run -p %%port=82%%:82 python-fastapi
</Terminal>

Une fois fait, rendez-vous sur <Code>http://127.0.0.1:<Var name="port">82</Var></Code> et vous obtiendrez la même réponse JSON que celle montrée en haut de cet article ; dingue non ?

## Documentation automatisée de votre API {#automated-documentation-of-your-api}

Et ce n'est que le début : FastAPI fournit une API auto-documentée basée sur le schéma OpenAPI. *Ce schéma n'est pas seulement de la documentation : il peut aussi être linté, voir <Link to="/blog/belgif-api-linter">Validate your OpenAPI schema against the Belgif REST standards</Link>.*

Rendez-vous sur <Code>http://127.0.0.1:<Var name="port">82</Var>/docs</Code> et vous le verrez en action :

<BrowserWindow url="http://127.0.0.1:%%port=82%%/docs">
  <img
    alt="Documentation automatisée - Swagger UI"
    src={require("./images/doc.webp").default}
  />
</BrowserWindow>

Il existe un second template, alternatif, appelé ReDoc. Vous pouvez y accéder via l'endpoint `redoc`, c'est-à-dire <Code>http://127.0.0.1:<Var name="port">82</Var>/redoc</Code> :

<BrowserWindow url="http://127.0.0.1:%%port=82%%/redoc">
  <img
    alt="Documentation automatisée - Redoc"
    src={require("./images/redoc.webp").default}
  />
</BrowserWindow>

## Amusons-nous - Créer un générateur de blagues {#lets-play---creating-a-joke-generator}

Nous allons construire un script générateur de blagues. Notre objectif : obtenir une blague au hasard ou une blague précise (du genre *Donne-moi la troisième blague que tu connais*).

Pour cela, nous allons mettre à jour notre script `main.py` et, comme nous ferons probablement plus d'une modification, nous allons monter notre dossier de l'host dans le container.

Pourquoi ? <Link to="/blog/docker-volume">Monter notre dossier</Link> dans le container nous permettra de modifier le script et de simplement rafraîchir la page web pour voir le changement.

La seule chose à faire est de lancer notre container comme ceci : <Code>docker run -v .:/app -p <Var name="port">82</Var>:82 python-fastapi</Code> ... mais ça n'a pas fonctionné comme prévu.

<AlertBox variant="info" title="FastAPI utilise Uvicorn sous le capot">
Uvicorn est une implémentation de serveur web pour Python. Uvicorn possède un mécanisme de cache intégré donc, même si nous avons mis à jour la source de notre script `main.py`, nous obtiendrons encore l'ancienne version.

Nous devons démarrer Uvicorn avec un mécanisme de « hot reload ».

</AlertBox>

### Recréer l'image Docker pour le hot reload (passez cette étape si `docker run -v .:/app` rafraîchissait déjà chez vous) {#recreating-the-docker-image-for-hot-reload-skip-this-if-docker-run--v-app-already-refreshed-for-you}

Arrêtez d'abord le container en cours d'exécution : retournez dans votre console et appuyez sur <kbd>CTRL</kbd>+<kbd>C</kbd> pour arrêter le container. Nous allons aussi supprimer le container. Vous pouvez le faire depuis `Docker Desktop` : cliquez sur le menu `Containers` et tuez votre container *Python - Fastapi*. Supprimez aussi l'image appelée `python-fastapi`.

<AlertBox variant="note">
`python-fastapi` est le nom de l'image Docker que nous avons construite plus tôt.

</AlertBox>

Si vous préférez la ligne de commande, vous pouvez obtenir le même résultat en lançant ces deux commandes :

<Terminal typewriter>
$ docker rm $(docker ps -aq --filter "ancestor=python-fastapi")

$ docker rmi python-fastapi --force

</Terminal>

Maintenant, copiez/collez le contenu suivant dans votre `Dockerfile` existant :

<Snippet filename="Dockerfile" source="./files/Dockerfile.part2" />

Reconstruisez l'image et lancez un nouveau container, cette fois avec un volume, en exécutant ces commandes :

<Terminal typewriter>
$ docker build -t python-fastapi . && docker run -v .:/app -p %%port=82%%:82 python-fastapi
</Terminal>

Nous avons maintenant une image Docker avec hot reload et nous avons monté notre dossier dans le container.

Modifiez votre script `main.py` comme ceci :

<Snippet filename="main.py" source="./files/main.part2.py" />

Rafraîchissez votre page web, vous verrez Hello Belgium!. Modifiez votre `main.py` et remplacez `Belgium!` par `France`. Rechargez votre page web ; vous verrez Hello France. Super, nous avons un hot reload et nous pouvons vraiment commencer à jouer.

### Notre générateur de blagues {#our-joke-generator}

Nous allons mettre à jour notre script `main.py` comme ceci :

<Snippet filename="main.py" source="./files/main.part3.py" />

Vous le voyez immédiatement, je pense :

- j'ai défini un tableau avec cinq blagues, codées en dur ;
- j'ai défini une nouvelle route appelée `/jokes` qui affichera une blague au hasard ;
- et enfin j'ai défini une route `jokes/{joke_id}` pour pouvoir viser une blague précise (comme « Donne-moi la deuxième blague que tu connais »).

<AlertBox variant="info" title="Utilisez un fichier externe plutôt que des blagues codées en dur">
En guise d'exercice, supprimez simplement la partie initialisation du tableau `jokes` et lisez plutôt les blagues depuis un fichier texte. Ce serait vraiment facile à faire.

</AlertBox>

Retournez dans votre navigateur et rendez-vous sur l'endpoint `jokes` (<Code>http://127.0.0.1:<Var name="port">82</Var>/jokes</Code>) et, hop, vous avez une blague au hasard.

<BrowserWindow url="http://127.0.0.1:%%port=82%%/jokes">
  <img
    alt="Obtenir une blague au hasard"
    src={require("./images/random_joke.webp").default}
  />
</BrowserWindow>

Rafraîchissez la page ; encore et encore. Chaque fois vous obtiendrez une blague au hasard (parmi une liste de 5).

Si vous en voulez une précise, ajoutez simplement un ID après, comme <Code>http://127.0.0.1:<Var name="port">82</Var>/jokes/1</Code>

<BrowserWindow url="http://127.0.0.1:%%port=82%%/jokes/1">
  <img
    alt="Une blague précise"
    src={require("./images/specific_joke.webp").default}
  />
</BrowserWindow>

<AlertBox variant="note">
Notez que le tableau commence à la position 0 donc la première blague est celle-ci : <Code>http://127.0.0.1:<Var name="port">82</Var>/jokes/0</Code>.

</AlertBox>

#### Nos endpoints jokes sont documentés automatiquement {#our-jokes-endpoints-are-documented-automatically}

Et en revenant à la documentation (<Code>http://127.0.0.1:<Var name="port">82</Var>/docs</Code>), nous avons maintenant trois routes et, regardez, la docstring Python est utilisée pour décrire la route.

<BrowserWindow url="http://127.0.0.1:%%port=82%%/docs">
  <img
    alt="Swagger UI - Avec les nouvelles routes"
    src={require("./images/doc_with_jokes.webp").default}
  />
</BrowserWindow>

Vraiment, vraiment impressionnant !

<AlertBox variant="info" title="La documentation est interactive">
Et, encore plus impressionnant, vous pouvez jouer directement depuis la documentation, c'est-à-dire exécuter l'endpoint `jokes`. Il y a un bouton *Try it out* puis *Execute* pour voir l'endpoint en action.

Plus d'infos [https://fastapi.tiangolo.com/tutorial/first-steps/#interactive-api-docs](https://fastapi.tiangolo.com/tutorial/first-steps/#interactive-api-docs)

</AlertBox>

## Découvrir FastAPI {#discover-fastapi}

N'attendez plus, allez sur [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/) pour voir plus d'exemples.

Et avant de publier votre API au monde entier, prenez cinq minutes pour lire <Link to="/blog/php-api-tips">API REST - How to write good APIs</Link> : nommer correctement vos endpoints et choisir correctement vos codes de statut HTTP ne coûte rien le premier jour et coûte très cher le centième.

Lisez aussi le long tutoriel sur [Real Python - Using FastAPI to Build Python Web APIs](https://realpython.com/fastapi-python-web-apis/).
