---
slug: docker-java
title: Jouer avec Docker et Java
date: 2023-11-28
description: Apprenez à compiler et exécuter des applications Java avec Docker. Mettez en place un environnement de développement Java en quelques secondes, sans rien installer localement — parfait pour les développeurs qui débutent avec Java et Docker.
authors: [christophe]
image: /img/v2/experiments.webp
mainTag: docker
tags: [docker]
language: fr
updates:
  - date: 2026-07-30
    note: "Replaced deprecated openjdk:11 Docker Hub image (deprecated Dec 2022) with eclipse-temurin:21 (official Adoptium LTS successor)"
---
![Jouer avec Docker et Java](/img/v2/experiments.webp)

<TLDR>
Cet article montre comment compiler et exécuter du Java sans rien installer localement, grâce à l'image Docker officielle `openjdk` : `docker run ... eclipse-temurin:21 javac Main.java` pour compiler, puis `docker run ... eclipse-temurin:21 java Main` pour exécuter, avec un second exemple qui appelle une API REST depuis Java et affiche la réponse JSON.
</TLDR>

Dans cet article, nous allons jouer avec Docker et Java, en utilisant les images Java prêtes à l'emploi publiées sur Docker Hub. La seule chose dont vous avez besoin sur votre machine, c'est <Link to="/blog/install-docker">Docker itself</Link>.

*La même approche « zéro installation, juste une image » est utilisée sur ce blog pour <Link to="/blog/docker-php-run-script-or-website">PHP</Link>, <Link to="/blog/docker-python-devcontainer">Python</Link> et <Link to="/blog/docker-quarto">Quarto</Link>.*

<AlertBox variant="note" title="Je ne connais rien à Java">
Sachez juste que je n'ai absolument aucune compétence en Java. Quel logiciel faut-il installer, comment lancer un script, etc. ? Je vais simplement m'appuyer sur quelques commandes Docker et, côté installation, oui, avec Docker c'est facile : rien à installer, rien à configurer.

</AlertBox>

<!-- truncate -->

## Deux commandes, et Java tourne {#two-commands-and-java-runs}

Une commande pour compiler, une pour exécuter :

<Terminal typewriter wrap={true}>
{`$ docker run -it --rm -v \${PWD}:/app -w /app -u 1000:1000 eclipse-temurin:21 javac Main.java

$ docker run --rm -v $PWD:/app -w /app eclipse-temurin:21 java Main
Hello, World`}
</Terminal>

Pas de JDK sur la machine, pas de `JAVA_HOME`, pas de `PATH` à corriger.

## Pourquoi ça fonctionne {#why-it-works}

- L'image `eclipse-temurin:21` embarque déjà le JDK complet, donc `javac` et `java` sont présents, dans la version exacte annoncée par le tag de l'image.
- `-v ${PWD}:/app` partage votre dossier courant avec le container : le container lit votre fichier `.java` et réécrit le fichier `.class` dans votre propre dossier.
- `-u 1000:1000` fait tourner le container sous votre identité, donc le `Main.class` généré appartient à votre utilisateur et non à `root`.

## Le code source {#the-source}

Ouvrez un shell Linux et lancez `mkdir -p /tmp/java && cd $_` pour créer un dossier `java` dans votre dossier temporaire Linux et y entrer.

Créez un nouveau fichier appelé `Main.java` avec ce contenu :

<Snippet filename="Main.java" source="./files/Main.java" />

Après la première commande, votre source `Main.java` a été compilée en un fichier `Main.class`. En lançant `ls -alh`, vous pouvez vérifier que, oui, le script java a bien été compilé :

<Terminal typewriter source="./files/terminal-1.txt" />

## Un exemple un peu plus difficile : appeler une API REST {#a-slightly-more-difficult-example-calling-a-rest-api}

Créez un nouveau fichier appelé `API.java` avec ce contenu :

<Snippet filename="API.java" source="./files/API.java" />

Compilez-le en lançant `docker run --rm -v $PWD:/app -w /app -u 1000:1000 eclipse-temurin:21 javac API.java` ; vous obtenez le fichier `API.class`.

Enfin, lancez `docker run --rm -v $PWD:/app -w /app eclipse-temurin:21 java API` pour exécuter l'appel à l'API et afficher le résultat à l'écran :

<Terminal typewriter>
$ docker run --rm -v $PWD:/app -w /app eclipse-temurin:21 java API
</Terminal>

```json
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```

*Cet exemple utilise l'URL d'exemple `https://jsonplaceholder.typicode.com/todos/1` pour générer un faux TODO. Le JSON sera affiché dans la console.*

## Sous le capot : les flags de docker run (à sauter si vous voulez juste l'utiliser) {#under-the-hood-the-docker-run-flags-skip-this-if-you-just-want-to-use-it}

Les commandes Docker run utilisées ci-dessus sont (presque toujours les mêmes) :

- `-it` pour démarrer Docker en mode interactif, ce qui permettra au script qui tourne dans le container de vous poser des questions par exemple,
- `--rm` pour demander à Docker de tuer et supprimer le container dès que le script a été exécuté (sinon vous aurez une tonne de containers Docker arrêtés mais non supprimés ; vous pouvez le vérifier en omettant le flag `--rm` puis en lançant `docker container list` dans la console),
- `-v ${PWD}:/app` pour partager votre dossier courant avec un dossier appelé `/app` dans le container Docker,
- `-w /app` pour dire à Docker que le répertoire courant, dans le container, sera le dossier `/app`,
- `-u 1000:1000` pour demander à Docker de réutiliser nos identifiants locaux, ainsi quand un fichier est modifié ou créé dans le container, il appartiendra à notre utilisateur,
- ensuite `eclipse-temurin:21`, qui est le nom et la version de l'image Docker à utiliser, et, enfin,
- `javac Main.java`, c'est-à-dire la ligne de commande à lancer dans le container.

## Conclusion {#conclusion}

Compiler et exécuter du Java, y compris un programme qui appelle une API REST, sans une seule ligne de configuration sur l'host : l'image apporte la toolchain, votre dossier apporte le code, et le container disparaît dès que la commande se termine. Vous êtes prêt à démarrer votre aventure Java. Amusez-vous bien.

Même idée, autre langage : j'ai aussi joué avec <Link to="/blog/docker-pascal">Pascal</Link>, <Link to="/blog/docker-assembly">Assembly</Link> et <Link to="/blog/docker-python">Python</Link> en suivant cette même approche Docker « zéro installation locale ».
