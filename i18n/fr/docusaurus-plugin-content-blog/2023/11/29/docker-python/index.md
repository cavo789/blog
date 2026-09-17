---
slug: docker-python
title: Jouer avec Docker et Python
date: 2023-11-29
description: Oubliez les installations Python compliquées. Découvrez comment exécuter rapidement vos scripts Python avec des containers Docker, du « Hello World » à un jeu du pendu, et simplifiez votre développement.
authors: [christophe]
image: /img/v2/python.webp
mainTag: python
tags:
  - docker
  - python
language: fr
review_date: 2026-07-30
---
![Jouer avec Docker et Python](/img/v2/python.webp)

<TLDR>
Cet article exécute des scripts Python sans aucune installation locale, grâce à l'image Docker officielle `python` (`docker run ... python python Hello.py`), en passant d'un script « Hello World » à un jeu du pendu en console — de quoi montrer à quelle vitesse on peut commencer à expérimenter avec un nouveau langage grâce à Docker.
</TLDR>

Vous souvenez-vous de l'époque où vous vouliez apprendre un nouveau langage de programmation comme Python ? De quoi aviez-vous besoin avant même de pouvoir programmer votre premier *Hello World* ? Il fallait installer le langage sur votre machine ; peut-être aussi installer tout un tas de bibliothèques et de dépendances ; il fallait passer du temps à configurer votre machine avant même d'écrire votre premier script.

Tout ça, c'est fini avec l'arrivée de Docker et du concept de containers.

Cette fois, nous allons jouer avec Python. **Je découvre Python en même temps que j'écris cet article : à cet instant précis, je n'ai jamais écrit de script `.py`.**

<!-- truncate -->

## Bienvenue dans le monde {#welcome-to-the-world}

Ouvrez un shell Linux et lancez `mkdir -p /tmp/python && cd $_` pour créer un dossier appelé `python` dans votre dossier temporaire Linux et y entrer.

Créez un nouveau fichier appelé `Hello.py` avec ce contenu :

<Snippet filename="Hello.py" source="./files/Hello.py" />

Maintenant, comment exécuter ce script ? Comme je connais bien Docker, je sais que :

1. il me faut une image Docker Python ([https://hub.docker.com/_/python](https://hub.docker.com/_/python)),
2. je vais devoir utiliser une instruction `docker run`,
3. je vais devoir partager mon script via un volume et
4. je dois savoir comment lancer le script.

<Terminal typewriter>
$ {`docker run -it --rm -v \${PWD}:/app -w /app python python Hello.py`}
Hello World!
</Terminal>

Et voilà, mon premier script Python est écrit. Souvenez-vous de l'ancien temps, avant Docker : combien d'heures et de lectures vous fallait-il pour exécuter votre premier script ? **Ici, il ne m'a pas fallu cinq minutes pour être opérationnel.**

*Une fois le « Hello World » passé, deux articles vont plus loin : <Link to="/blog/docker-python-devcontainer">Docker - Python devcontainer</Link> pour un véritable environnement VSCode, et <Link to="/blog/python-qa">Python - Code Quality tools</Link> pour garder vos scripts propres dès le premier jour.*

<AlertBox variant="info" title="Rappel sur la CLI Docker">
Pour rappel, les commandes `docker run` utilisées sont (presque toujours les mêmes) :

- `-it` pour démarrer Docker en mode interactif, ce qui permettra au script qui tourne dans le container de vous demander des saisies par exemple,
- `--rm` pour demander à Docker de tuer et supprimer le container dès que le script a été exécuté (sinon vous aurez un tas de containers Docker arrêtés mais non supprimés ; vous pouvez le vérifier en n'utilisant pas le flag `--rm` puis en lançant `docker container list` dans la console),
- `-v ${PWD}:/app` pour partager votre dossier courant avec un dossier appelé `/app` dans le container Docker,
- `-w /app` pour dire à Docker que le répertoire courant, dans le container, sera le dossier `/app`
- ensuite `python` qui est le nom de l'image Docker à utiliser (vous pouvez aussi préciser une version comme `python:3.9.18` si besoin ; voir [https://hub.docker.com/_/python/tags](https://hub.docker.com/_/python/tags)) et, enfin,
- `python Hello.py` c'est-à-dire la ligne de commande à lancer dans le container.

</AlertBox>

## Jouer au pendu {#playing-the-hangman}

Comme dit plus haut, en novembre 2023, je n'ai pas commencé à apprendre Python, alors essayons de trouver quelques scripts d'exemple. Sur [https://hackr.io/blog/python-projects](https://hackr.io/blog/python-projects), on trouve un script de pendu.

Créez le fichier `Hangman.py` sur votre disque avec ce contenu :

<Snippet filename="Hangman.py" source="./files/Hangman.py" />

Lancez-le ensuite avec `docker run -it --rm -v ${PWD}:/app -w /app python python Hangman.py` et bonne chance :

```none
Hangman Word: ______ Enter your guess:
A
   _____
  |
  |
  |
  |
  |
  |
__|__

Wrong guess: 4 guesses remaining

Hangman Word: ______ Enter your guess:
E
   _____
  |     |
  |     |
  |
  |
  |
  |
__|__

Wrong guess: 3 guesses remaining

Hangman Word: ______ Enter your guess:
I
   _____
  |     |
  |     |
  |     |
  |
  |
  |
__|__

Wrong guess: 2 guesses remaining

Hangman Word: ______ Enter your guess:
C
   _____
  |     |
  |     |
  |     |
  |     O
  |
  |
__|__

Wrong guess: 1 guesses remaining

Hangman Word: ______ Enter your guess:
O
   _____
  |     |
  |     |
  |     |
  |     O
  |    /|\
  |    / \
__|__

Wrong guess. You've been hanged!!!

The word was: border
Do you want to play again? y = yes, n = no
```

Zut, j'ai perdu.

À vous de creuser... Vous trouverez un script qui [teste la robustesse d'un mot de passe](https://hackr.io/blog/python-projects#toc-6-password-strength-checker) ; à vous de créer le script `check_password.py` et de le lancer sur votre machine.

Si Docker lui-même est nouveau pour vous, commencez par <Link to="/blog/docker-definition-like-im-five">Docker - Explain me like I'm five</Link>. Et puisque tout l'intérêt est que cette approche fonctionne avec n'importe quel langage, j'ai fait la même expérience avec <Link to="/blog/docker-pascal">Pascal</Link>, <Link to="/blog/docker-assembly">Assembly</Link> et <Link to="/blog/docker-java">Java</Link>.
