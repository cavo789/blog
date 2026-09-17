---
slug: docker-git
title: Docker - Installer et utiliser Git dans un container comme sur votre machine hôte
date: 2025-01-25
description: Améliorez votre workflow de développement ! Apprenez à installer et configurer Git dans votre container Docker en partageant la configuration et la clé SSH de votre host, afin de lancer toutes les commandes Git sans quitter le container.
authors: [christophe]
image: /img/v2/git.webp
mainTag: docker
tags:
  - devcontainer
  - docker
  - git
  - ssh
language: fr
review_date: 2026-07-30
---
![Docker - Installer et utiliser Git dans un container comme sur votre machine hôte](/img/v2/git.webp)

<TLDR>
Simplifiez votre workflow de développement en lançant les commandes Git directement dans votre container Docker. Ce guide montre comment installer Git dans le container et le configurer pour utiliser les réglages Git et les clés SSH de votre machine hôte. En montant vos `.gitconfig` et `.ssh` locaux dans le container, vous pouvez faire `git clone`, `git commit` et `git push` depuis votre environnement de développement, sans devoir revenir sur votre host pour les tâches de gestion de versions.
</TLDR>

Bon, ce n'est plus la peine de le préciser : je fais tout dans des containers Docker, même coder (puisque je code avec des devcontainers) mais... jusqu'ici, j'utilisais `git` uniquement sur mon host.

Je veux dire : j'ai besoin de `git` sur mon host parce que je dois pouvoir cloner un repository. Mais la question est la suivante : dois-je utiliser git depuis mon host en dehors du `git clone` ? Est-ce que je peux travailler dans mon container et, de là, faire des actions comme un `git push` ?

Mon workflow actuel : depuis mon host, je clone un repo sur mon disque, puis je construis la ou les images Docker, je lance le ou les containers et je saute dedans (comme démarrer mon devcontainer). Je démarre aussi une console dans mon container pour lancer des processus, travailler sur des fichiers, ...

De temps en temps, je pousse mes modifications vers mon système de versioning (comme Gitlab/GitHub) et c'est là que le bât blesse : je dois quitter mon devcontainer (ou utiliser une autre console), revenir sur mon host et y lancer des commandes comme `git add . && git commit -m "feat: The great feature I'm working on it" && git push`.

Voyons comment améliorer ce processus et pouvoir lancer les commandes `git` depuis l'intérieur de notre container.

*Partager votre clé SSH avec un **container en cours d'exécution**, comme nous le faisons ici, n'est pas le même problème que de l'utiliser pendant le **build** d'une image ; ce second cas est traité dans <Link to="/blog/docker-use-ssh-during-build">Docker secrets - Using your SSH key during the build process</Link>. Et le `.gitconfig` que nous allons monter est celui décrit dans <Link to="/blog/git-config">Git - Some tips for your .gitconfig file</Link>.*

<!-- truncate -->

<!-- TODO(author): capture a real terminal transcript showing `git --version` then `git config --list` run from inside the container, with the host's `.gitconfig` values visible — not reproducible in this session (requires a live Docker daemon and the reader's own SSH key/.gitconfig). -->

## Pourquoi ça fonctionne {#why-it-works}

- Votre `.gitconfig` et votre clé SSH sont **montés**, pas copiés, dans le container — en lecture seule pour la clé — donc il n'y a rien à garder synchronisé et rien de supplémentaire figé dans l'image.
- `git` tourne *dans* le container mais s'authentifie et identifie les commits exactement comme il le ferait sur votre host, puisqu'il lit les mêmes fichiers.

## Créer un container de démonstration {#creating-a-demo-container}

Comme toujours, nous allons construire un exemple pleinement fonctionnel.

Créez un dossier bidon et allez dedans :

<Terminal>
$ mkdir /tmp/git && cd $_
</Terminal>

Il nous faut un `Dockerfile`, créons-le :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Nous allons aussi utiliser un `compose.yaml`, créez également ce fichier :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<AlertBox variant="caution" title="Je suppose que votre clé ssh actuelle s'appelle id_ed25519">
Lancez `ls -alh ${HOME}/.ssh/` sur votre host et vérifiez si vous y avez un fichier `id_ed25519`. C'est votre clé privée SSH. Peut-être n'utilisez-vous pas ce fichier mais un autre appelé `id_rsa`. Si c'est le cas, modifiez le fichier `compose.yaml` et remplacez-y `id_ed25519` par `id_rsa`.

</AlertBox>

## Lancer le tout {#running-it}

Nous allons créer notre image Docker et créer un container avec cette seule commande : `docker compose up --detach --build`.

Et, maintenant, nous allons entrer dans le container en lançant : `docker compose exec docker_git /bin/sh`.

Première vérification : lancez simplement `git --version` pour contrôler que `git` est bien installé (ce qui est le cas).

## Partager votre configuration {#sharing-your-configuration}

Jetez un œil au fichier `compose.yaml` que vous avez créé précédemment.

Nous y avons la ligne suivante :

```yaml
- ${HOME}/.gitconfig:/root/.gitconfig
```

Cela dit à Docker de partager (monter) notre fichier local `${HOME}/.gitconfig` (c'est-à-dire notre fichier de configuration) avec le container. Comme, dans cet exemple, nous lançons le container en tant que root, nous devons mettre `/root/.gitconfig` comme cible.

<AlertBox variant="info">
Si vous ne savez pas encore ce qu'est ce fichier, tapez simplement `cat ${HOME}/.gitconfig` dans la console pour voir son contenu ; ce sont vos réglages de configuration git.

</AlertBox>


Vérifions si ça fonctionne, toujours dans la console à l'intérieur du container : lancez `git config --list` dans le shell de votre container. Vous verrez la même configuration que celle de votre machine hôte. Le partage a fonctionné comme prévu.

<AlertBox variant="caution">
Si, par exemple, votre container tourne en tant que `john_doe`, la ligne doit être `- ${HOME}/.gitconfig:/home/john_doe/.gitconfig` dans le fichier yaml.

</AlertBox>


## Partager vos credentials {#share-your-credentials}

Regardez encore une fois le fichier `compose.yaml`.

Nous y avons cette ligne :

```yaml
- ${HOME}/.ssh/id_ed25519:/root/.ssh/id_ed25519:ro
```

Pensez à remplacer `id_ed25519` par le nom de la clé que vous utilisez, comme par exemple `id_rsa` si nécessaire.

<AlertBox variant="info">
Même remarque que précédemment : adaptez le path cible pour qu'il corresponde au répertoire home de votre utilisateur dans le container, si nécessaire.

</AlertBox>

Donc, puisque nous avons déjà partagé à la fois notre fichier de configuration et notre clé SSH, vous pouvez, depuis l'intérieur du container, lancer une commande git comme `git clone git@your_private_repo` et, comme mentionné dans l'introduction, travailler sur votre codebase puis lancer `git add . && git commit -m "feat: The great feature I'm working on it" && git push`.

## Conclusion {#conclusion}

Dès maintenant, vous pouvez utiliser n'importe quelle commande git dans votre container.

Si vous avez suivi le tutoriel ci-dessus, vous pouvez à présent parfaitement faire `git clone <<your_private_repo>>` depuis l'intérieur du container et ça fonctionnera.

Pour aller plus loin, jetez un œil à l'article <Link to="/blog/git-precommit">Git - pre-commit hooks</Link> pour apprendre à configurer votre container afin de lancer des hooks avant de committer des fichiers.
