---
slug: bruno
title: Bruno - Un outil à la Postman - GUI et CLI
date: 2025-08-07
description: Découvrez Bruno, un outil de test d'API puissant à la Postman, avec support GUI et CLI.
authors: [christophe]
image: /img/v2/api.webp
series: Building and testing REST APIs
mainTag: api
tags:
  - api
  - docker
  - tests
language: fr
updates:
  - date: 2026-07-30
    note: "Bruno v3 released January 2026; official Docker image is now usebruno/cli (the AlertBox custom-image workaround may no longer be needed)."
blueskyRecordKey: 3lvs336stus2j
---
<!-- cspell:ignore fastapi,uvicorn,hobbyte,keyserver,usebruno,ECONNREFUSED,davidkarlsen -->
![Bruno - A postman-like tool - GUI and CLI](/img/v2/api.webp)

<TLDR>
Cet article présente Bruno, une alternative libre et gratuite à Postman pour tester vos API. Il vous guide dans la mise en place d'une API Python FastAPI d'exemple, puis dans son test via l'interface graphique et le CLI de Bruno. Vous apprendrez à créer des requêtes, gérer des environnements et lancer des tests depuis la ligne de commande avec Docker, y compris comment gérer les problèmes réseau classiques. L'article aborde aussi l'ajout d'assertions pour valider vos tests.
</TLDR>

[Bruno](https://www.usebruno.com/) est un outil comme Postman, utilisable gratuitement. Tout est stocké sur votre machine : vous pouvez donc conserver les fichiers dans votre codebase et les envoyer dans votre outil de versioning, par exemple.

*Comme ces fichiers vivent dans votre repository, la partie CLI de Bruno se transforme naturellement en job de CI — voir <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link>. Et pour vérifier le contrat de l'API plutôt que ses réponses, il y a <Link to="/blog/belgif-api-linter">Validate your OpenAPI schema against the Belgif REST standards</Link>.*

<!-- truncate -->

## Lancer Bruno {#run-bruno}

Une fois installé, démarrez simplement `bruno` depuis la ligne de commande pour lancer l'interface :

![Bruno homepage](./images/homepage.webp)

Commençons par le commencement : créons une collection.

![Creating a collection](./images/create_collection.webp)

Et, comme on est malins, créons aussi un environnement (pour définir l'URL racine de notre site une seule fois) :

![Create the root environment variable](./images/environment.webp)

Nous voilà prêts, créons une nouvelle requête :

![Create a request](./images/new_request.webp)

Récupérer une blague au hasard :

![Getting a random joke](./images/random_joke.webp)

Une fois la requête créée, appuyez sur <kbd>CTRL</kbd>+<kbd>ENTER</kbd> ou cliquez sur la flèche de droite :

![Running a request](./images/run_request.webp)

## Pourquoi ça fonctionne {#why-it-works}

- Tout — collection, environnements, requêtes — est stocké sous forme de fichiers texte `.bru` dans votre repo : une requête se diffe et se relit comme du code.
- La même collection s'exécute de deux façons : en mode exploration dans la GUI, ou en vérifications scriptées depuis le CLI — pas d'outil séparé à garder synchronisé.
- Une collection correspond à un dossier unique et propre (voir la section *Ouvrir le projet avec VSCode* ci-dessous) ; rien ne vit dans une base de données ou un compte cloud que vous ne contrôlez pas.

## Installation {#installation}

Pour installer la GUI de Bruno sur ma distribution Ubuntu, je lance ces commandes :

<Terminal typewriter source="./files/terminal-2.txt" />

Consultez la documentation officielle [Download & Install](https://docs.usebruno.com/get-started/bruno-basics/download) pour plus d'infos.

<Details label="Optionnel - Démarrer une API de test pour essayer Bruno (cliquez pour les détails)">

Bruno a besoin de quelque chose à interroger. Si vous n'avez pas d'API sous la main, voici une API de test FastAPI en une minute, empruntée à <Link to="/blog/python-fastapi">« Python - Fast API - Créez votre API JSON en Python en une minute »</Link> :

<StepsCard
  variant="steps"
  steps={[
    "Lancez `mkdir /tmp/fastapi && cd $_` pour créer un dossier temporaire et vous y placer",
    "Créez un `Dockerfile` avec le contenu ci-dessous",
    "Créez un `main.py` avec le contenu ci-dessous",
    "Lancez la commande `docker build -t python-fastapi . && docker run --detach -v .:/app -p 82:82 python-fastapi` pour démarrer le serveur",
    "Ouvrez un navigateur sur `http://127.0.0.1:82/jokes` pour voir une première blague (F5 pour en obtenir une nouvelle ; au hasard)"
  ]}
/>

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<Snippet filename="main.py" source="./files/main.py" />

</Details>

## Ouvrir le projet avec VSCode {#opening-the-project-with-vscode}

En ouvrant le projet dans VSCode, on voit un nouveau dossier appelé `Jokes` (notre collection) avec très peu de fichiers : `environments/dev.bru` où se trouvent les variables de notre environnement, un fichier générique `bruno.json`, puis notre requête dans `Get a random joke.bru`.

Structure très propre, non ?

![The project in VSCode](./images/vscode.webp)

## Exécuter des requêtes depuis la ligne de commande {#running-requests-from-the-command-line}

Bruno propose une [image Docker](https://hub.docker.com/r/alpine/bruno) : elle va nous aider à automatiser l'exécution de nos requêtes depuis la ligne de commande.

<AlertBox variant="caution">
À la mi-juillet 2025, je n'ai pas réussi à faire fonctionner cette image comme prévu. Je tombais sur des erreurs *Cannot read properties of undefined (reading 'headers')* alors que, à mon avis, tout était correctement configuré.

J'ai donc cherché une autre image et j'ai trouvé celle-ci : [davidkarlsen/bruno-image](https://github.com/davidkarlsen/bruno-image). Pas de chance non plus, même la dernière version de l'époque (2.7.0) posait problème.

En regardant le [Dockerfile](https://github.com/davidkarlsen/bruno-image/blob/main/Dockerfile), j'ai vu que le fichier était vraiment simple et qu'une version plus récente de [Bruno était sortie](https://github.com/usebruno/bruno/tags) : la 2.8.

Bref, je vais créer ma propre image Docker et voir si ça va mieux.

</AlertBox>

### Créer notre propre image Bruno CLI {#create-our-own-bruno-cli-image}

Créons un fichier `bruno.Dockerfile` avec le contenu suivant :

<Snippet filename="bruno.Dockerfile" source="./files/bruno.Dockerfile" />

On crée notre image comme ceci : `docker build --file bruno.Dockerfile  -t bruno-image .` (on peut la vérifier en lançant `docker run -it --rm bruno-image --version` ; on devrait voir `2.8.0`).

Comme on vient de le voir, notre collection est stockée dans le dossier `Jokes` et notre environnement dans `environments/dev.bru`. Mais un container ne peut pas joindre `127.0.0.1` sur votre host : créez donc un second fichier d'environnement, `environments/dev-docker.bru`, qui pointe vers `host.docker.internal` :

```none
vars {
  host: http://host.docker.internal:82
}
```

Lancez maintenant la collection avec cet environnement :

<Terminal typewriter>
$ docker run -it --rm -v "./Jokes":/apps -w /apps \
  --add-host host.docker.internal:host-gateway \
  bruno-image run --env=dev-docker
</Terminal>

![Bruno CLI is working](./images/bruno_cli_is_working.webp)

### Sous le capot (à sauter si vous voulez juste l'utiliser) {#under-the-hood-skip-this-if-you-just-want-to-use-it}

Pourquoi ne pas simplement réutiliser `environments/dev.bru`, celui que la GUI utilise déjà ? Parce que l'exécuter tel quel depuis le CLI échoue :

![Running for the first time the collection from the CLI](./images/connection_refused.webp)

Regardez le message d'erreur `connect ECONNREFUSED 127.0.0.1:82` : le container Bruno CLI essaie de joindre le serveur web sur `127.0.0.1`, mais cette adresse, c'est le container lui-même, pas votre host. `environments/dev.bru` ressemble à ceci :

```none
vars {
  root: http://127.0.0.1:82
}
```

Ça fonctionne depuis la GUI, parce que la GUI tourne directement sur votre host — là, `127.0.0.1` *est* votre machine. Un `curl -v http://127.0.0.1:82/jokes` depuis la ligne de commande de votre host fonctionne aussi :

<!-- cspell:disable -->

<Terminal typewriter source="./files/terminal-1.txt" />

<!-- cspell:enable -->

Un container a son propre namespace réseau : `127.0.0.1` à l'intérieur n'atteint jamais l'host. C'est exactement ce que corrigent `environments/dev-docker.bru` et `host.docker.internal` ci-dessus. Effet de bord : ce nouveau fichier d'environnement ne fonctionnera pas depuis la GUI de Bruno — on peut sélectionner `dev` et tout marche, mais pas `dev-docker` :

![Having a second configuration file](./images/second_environment.webp)

## Ajouter quelques assertions {#adding-some-assertions}

L'intérêt de l'outil CLI, bien sûr, c'est de pouvoir lancer des assertions depuis la ligne de commande et s'assurer que l'API fonctionne toujours.

Mettons à jour le fichier `Get a random joke.bru` comme ceci :

<Snippet filename="Get a random joke.bru" source="./files/Get a random joke.bru" />

![Bruno CLI is running assertions](./images/bruno_cli_assertions.webp)

## Conclusion {#conclusion}

Bruno vous offre un workflow à la Postman — collections, environnements, assertions — sans quitter votre repository : chaque requête est un fichier `.bru` que vous pouvez differ, relire et versionner comme le reste de votre code. La GUI sert à explorer et à construire une collection ; le CLI, emballé dans votre propre image Docker, transforme cette même collection en vérification reproductible.

Cette reproductibilité, c'est exactement ce qu'attend un pipeline de CI. Voir <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link> pour lancer cette image CLI comme job, et <Link to="/blog/belgif-api-linter">Validate your OpenAPI schema against the Belgif REST standards</Link> pour vérifier le contrat de l'API, pas seulement ses réponses.
