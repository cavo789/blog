---
slug: linux-jq
title: L'utilitaire jq pour Linux
date: 2023-12-13
description: Utilisez le puissant utilitaire Linux jq pour manipuler des données JSON, embellir la sortie et filtrer des nœuds directement depuis votre ligne de commande et vos scripts shell.
authors: [christophe]
image: /img/v2/json.webp
series: Modern CLI tools for your terminal
mainTag: linux
tags:
  - bash
  - linux
language: fr
review_date: 2026-07-30
updates:
  - date: 2026-08-22
    note: added a Docker-first demo to try before installing
---
<!-- cspell:ignore Salomé -->
![L'utilitaire jq pour Linux](/img/v2/json.webp)

<TLDR>
Cet article présente `jq`, un processeur JSON en ligne de commande : rediriger la sortie brute d'une API (ici l'API random-user) dans `jq` suffit à la mettre en forme, et ajouter une expression de filtre comme `jq '.results[0].name'` permet d'extraire uniquement un nœud précis de la structure JSON.
</TLDR>

`jq` est un utilitaire puissant pour Linux qui permet de manipuler des données JSON depuis la ligne de commande et qui s'intègre dans vos scripts shell.

<!-- truncate -->

## La même réponse, deux fois {#the-same-answer-twice}

En lançant `curl https://randomuser.me/api/`, vous obtiendrez quelque chose comme ceci :

<Terminal typewriter>
$ curl https://randomuser.me/api/
</Terminal>

<!-- cspell:disable -->
```json
{"results":[{"gender":"female","name":{"title":"Mademoiselle","first":"Milena","last":"Martin"},"location":{"street":{"number":9831,"name":"Rue de L'Abbé-Migne"},"city":"Lengnau (Ag)","state":"Basel-Landschaft","country":"Switzerland","postcode":3789,"coordinates":{"latitude":"-60.0739","longitude":"135.1462"},"timezone":{"offset":"+7:00","description":"Bangkok, Hanoi, Jakarta"}},"email":"milena.martin@example.com","login":{"uuid":"bafdf972-4183-484a-903a-84f2654f0fec","username":"purpleleopard344","password":"cameron","salt":"gGoFrP1a","md5":"af359ca6697c3ac68f4c190583544619","sha1":"19033bc1630d96bba29726823ef91f53800e67d1","sha256":"cac6a35f5135f14707b8b3ec48617f23b4105b1c5e33a2b64597e7a0c7c891a0"},"dob":{"date":"1998-10-10T02:42:04.525Z","age":25},"registered":{"date":"2005-05-01T01:26:36.354Z","age":18},"phone":"079 098 73 86","cell":"077 411 83 18","id":{"name":"AVS","value":"756.9632.2579.59"},"picture":{"large":"https://randomuser.me/api/portraits/women/37.jpg","medium":"https://randomuser.me/api/portraits/med/women/37.jpg","thumbnail":"https://randomuser.me/api/portraits/thumb/women/37.jpg"},"nat":"CH"}],"info":{"seed":"213f93e3e854d33c","results":1,"page":1,"version":"1.4"}}
```
<!-- cspell:enable -->

Le JSON est simplement affiché à l'écran, pas vraiment lisible.

Mais dès qu'on redirige vers `jq`, ça devient bien mieux :

<Terminal typewriter>
$ curl --silent https://randomuser.me/api/ | jq
</Terminal>

<!-- cspell:disable -->
```json
{
  "results": [
    {
      "gender": "female",
      "name": {
        "title": "Mademoiselle",
        "first": "Salomé",
        "last": "Roy"
      },
      "location": {
        "street": {
          "number": 2361,
          "name": "Rue Dumenge"
        },
        "city": "Dierikon",
        [...]
      },
      "email": "salome.roy@example.com",
      [...]
    }
  ],
  "info": {
    "seed": "b7ef95d3b252edca",
    "results": 1,
    "page": 1,
    "version": "1.4"
  }
}
```
<!-- cspell:enable -->

Mêmes octets, même API, un mot de plus sur la ligne de commande. Ça justifie déjà la place de `jq` dans un pipe, mais la vraie raison pour laquelle je l'utilise est juste en dessous.

## Filtrer la sortie {#filtering-the-output}

Imaginons qu'on ait seulement besoin de récupérer le nom. Pour ça, il faut mieux comprendre l'objet JSON.

```json
{
  //highlight-next-line
  "results": [
    {
      "gender": "female",
      //highlight-next-line
      "name": {
        "title": "Mademoiselle",
        "first": "Salomé",
        "last": "Roy"
      },
      "location": {
        [...]
      },
      [...]
  ],
  [...]
}
```

La sortie est une représentation JSON avec une propriété racine appelée `results`. Cette propriété est un tableau. Chaque élément de ce tableau contient un nœud `name` avec quelques propriétés comme `title`, `first` et `last`.

Si on veut uniquement récupérer le nœud `name`, le filtre à utiliser avec `jq` est `.results[0].name`.

<Terminal typewriter>
$ curl --silent https://randomuser.me/api/ | jq '.results[0].name'
</Terminal>

```json
{
  "title": "Ms",
  "first": "Brooke",
  "last": "Morgan"
}
```

Pour en savoir plus sur [le filtrage avec jq](https://jqlang.github.io/jq/tutorial/).

## Le voir à l'œuvre avec Docker {#seeing-it-in-action-with-docker}

Avant d'installer quoi que ce soit, essayez les deux commandes ci-dessus dans un container jetable. Il embarque `jq`
et une copie statique de la réponse de `randomuser.me` utilisée tout au long de cet article, donc la démo
fonctionne même sans accès réseau — l'API en ligne reste toutefois accessible si vous voulez l'essayer
pour de vrai.

<AlertBox variant="tip" title="Pourquoi Docker d'abord ?">
Le Dockerfile ci-dessous installe `jq` et dépose un fichier `sample.json` prêt à l'emploi dans le répertoire
de travail. Rien à taper, télécharger ou configurer — il suffit de le passer dans `jq`.
</AlertBox>

<Snippet
  filename="Dockerfile"
  source="./files/Dockerfile"
  defaultOpen={false}
/>

Buildez et lancez-le :

<Terminal source="./files/terminal_docker_demo.txt" typewriter />

Même filtre que plus haut, même résultat, et même pas besoin de `curl`. Retirez le filtre et lancez `cat
sample.json | jq` seul pour voir tout l'objet mis en forme, ou, puisque le container a un accès
réseau, essayez aussi la version en ligne : `curl --silent https://randomuser.me/api/ | jq`.

## Installer jq {#installing-jq}

Pour vérifier si `jq` est déjà installé sur votre système, lancez simplement `which jq`. Si vous obtenez `jq not found` comme réponse :

<Prerequisite
  name="jq"
  install="sudo apt-get update && sudo apt-get install jq"
  check="jq --version"
  checkOutput={`\njq-1.7.1`}
  typewriter
/>

## Jouons un peu {#lets-play}

`jq` peut être utilisé sans aucun argument et, dans ce cas, la sortie JSON sera mise en forme.

Pour reproduire les exemples ci-dessus, nous allons utiliser une API JSON gratuite et simple comme `https://randomuser.me/api/`. Si vous préférez une autre API, jetez un œil à [https://github.com/public-apis/public-apis#test-data](https://github.com/public-apis/public-apis#test-data) ; les gratuites sont celles qui ont `No` dans la colonne `Auth`.

<AlertBox variant="info" title="L'API randomuser renvoie chaque fois un nouvel utilisateur">
À chaque requête, l'API `randomuser` renvoie un nouvel objet. Ne soyez pas surpris si vos noms diffèrent des miens.

</AlertBox>

<Details label="La réponse complète mise en forme (cliquez pour les détails)">

Voici l'objet complet renvoyé par l'API, tel que `jq` l'affiche :

<!-- cspell:disable -->
```json
{
  "results": [
    {
      "gender": "female",
      "name": {
        "title": "Mademoiselle",
        "first": "Salomé",
        "last": "Roy"
      },
      "location": {
        "street": {
          "number": 2361,
          "name": "Rue Dumenge"
        },
        "city": "Dierikon",
        "state": "Basel-Stadt",
        "country": "Switzerland",
        "postcode": 5075,
        "coordinates": {
          "latitude": "-58.3405",
          "longitude": "134.0131"
        },
        "timezone": {
          "offset": "+4:30",
          "description": "Kabul"
        }
      },
      "email": "salome.roy@example.com",
      "login": {
        "uuid": "dfda3e32-b8b1-44c9-9aa9-194fc17833d3",
        "username": "organiccat614",
        "password": "nacked",
        "salt": "HRepWJ2P",
        "md5": "643f7a890ba9c9fbe04ea971287f57ba",
        "sha1": "9407fd8fdf0c344ac1990a89d8d0190f6baabd19",
        "sha256": "1317478dbfc61c3feaccea4485a367fb6b195009f15eecd9175f2d1a9215d5df"
      },
      "dob": {
        "date": "1960-05-12T07:27:42.104Z",
        "age": 63
      },
      "registered": {
        "date": "2021-05-02T04:18:14.996Z",
        "age": 2
      },
      "phone": "077 228 21 12",
      "cell": "078 051 38 48",
      "id": {
        "name": "AVS",
        "value": "756.1071.1525.27"
      },
      "picture": {
        "large": "https://randomuser.me/api/portraits/women/74.jpg",
        "medium": "https://randomuser.me/api/portraits/med/women/74.jpg",
        "thumbnail": "https://randomuser.me/api/portraits/thumb/women/74.jpg"
      },
      "nat": "CH"
    }
  ],
  "info": {
    "seed": "b7ef95d3b252edca",
    "results": 1,
    "page": 1,
    "version": "1.4"
  }
}
```
<!-- cspell:enable -->

</Details>

## Conclusion {#conclusion}

Deux choses à retenir : `jq` seul rend n'importe quel JSON lisible, et `jq '.some.path'` extrait exactement le nœud dont vous avez besoin — c'est ce qui transforme une réponse d'API en quelque chose qu'un script shell peut consommer.

`jq` devient vite un réflexe : je l'utilise dans <Link to="/blog/docker-networking-troubleshooting">Troubleshooting for Docker containers</Link> pour lire la sortie de `docker inspect`, et dans <Link to="/blog/docusaurus-ollama-tags">la création d'un analyseur d'articles de blog avec Ollama</Link> pour formater les réponses JSON du LLM local, par exemple.

Pour les fois où la console n'est pas le bon outil pour du JSON, ce blog en propose trois autres : <Link to="/blog/json-crack">Rendering a JSON file as a mind map</Link>, <Link to="/blog/json-lint">JSON - Online linter</Link> et <Link to="/blog/json-faker">JSON - Faker & Mockup</Link>.
