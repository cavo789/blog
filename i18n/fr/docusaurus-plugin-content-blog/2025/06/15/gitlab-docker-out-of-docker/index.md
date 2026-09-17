---
slug: gitlab-docker-out-of-docker
title: GitLab - Exécuter Docker-out-of-Docker dans votre CI
date: 2025-06-15
description: Découvrez comment mettre en place Docker-out-of-Docker (DooD) dans votre pipeline GitLab CI/CD. Ce guide explique comment configurer votre GitLab Runner pour partager le socket Docker de l'host et les fichiers du projet, afin que les containers puissent exécuter des commandes `docker run`.
authors: [christophe]
image: /img/v2/gitlab.webp
mainTag: gitlab
tags:
  - code-quality
  - docker
  - gitlab
  - quarto
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lun2kg2vmk2r
---
![GitLab - Exécuter Docker-out-of-Docker dans votre CI](/img/v2/gitlab.webp)

<TLDR>
Pour exécuter des commandes Docker dans un job GitLab CI (Docker-out-of-Docker), vous devez configurer votre GitLab Runner pour qu'il partage le socket Docker de l'host. Cela se fait en modifiant le fichier `/etc/gitlab-runner/config.toml` du runner. Dans la section `[[runners.docker]]`, vous devez ajouter `"/var/run/docker.sock:/var/run/docker.sock"` à la liste `volumes`. Le container de la CI peut alors communiquer avec le démon Docker de l'host. De plus, pour partager les fichiers du projet avec les containers imbriqués, mappez le répertoire builds en ajoutant également `"/builds:/builds"` aux volumes.
</TLDR>

<!-- cspell:ignore dood,phplint,certdir -->

Au boulot, ma CI tourne avec Docker. Chaque fois que je pousse des modifications sur GitLab, une CI démarre : GitLab lance un container Docker, récupère mon code et exécute une série d'outils.

Le container démarré par GitLab peut être basé sur une image Docker PHP, Python ou simplement Alpine. GitLab récupère ensuite mon code dans le container et exécute par exemple un outil comme `phplint` : tout va bien.

Depuis quelques mois, je construis une image Docker pour exécuter [Dagger](https://dagger.io) (voir <Link to="/blog/dagger-python">Dagger.io - Using dagger to automate your CI workflows</Link>). Et là, ça se complique : mon container Docker GitLab CI devrait pouvoir exécuter `docker run ... my_dagger_image` et, par défaut, ce n'est pas possible.

Mais c'est encore pire quand, dans mon container Dagger, je dois lancer un autre container (un par outil).

Oui, vous avez devine : je me retrouve à devoir exécuter Docker depuis un container Docker qui tourne déjà dans un autre container.

Voyons comment résoudre ce problème.

<!-- truncate -->

<!-- TODO(author): capture a real GitLab CI job log excerpt showing `docker run --rm --volume "$CI_PROJECT_DIR:/app" --workdir /app jakzal/phpqa phplint .` executing successfully from inside the CI container, once Docker Socket Passthrough is configured — not reproducible in this session (requires a live GitLab Runner). -->

Voici le résultat une fois le runner configuré : un job de CI qui exécute `docker run` — un container qui démarre un autre container — sans l'erreur « Cannot connect to the Docker daemon » que vous obtiendriez sinon.

## Pourquoi ça fonctionne {#why-it-works}

- Le GitLab Runner partage son propre socket Docker (`/var/run/docker.sock`) avec le container de la CI. Du coup, `docker run` dans le job parle au démon Docker de l'*host* au lieu d'avoir besoin du sien : aucun moteur Docker-in-Docker imbriqué à installer ou à maintenir.
- Partager aussi le dossier `builds` permet à un container démarré depuis le job de CI de monter les mêmes fichiers de projet que ceux dans lesquels le job a été checkouté. Sans ça, des chemins comme `$CI_PROJECT_DIR` pointeraient vers un dossier invisible pour le nouveau container.
- Ce sont deux lignes ajoutées à `config.toml`, pas une autre image de CI ni un service Docker-in-Docker privilégié. La technique s'appelle **Docker Socket Passthrough**.

Comme prérequis, vous devez avoir accès au serveur où tourne votre instance GitLab (le *GitLab Runner*), puisque vous allez devoir modifier la configuration du runner.

## Le fichier de configuration du runner {#the-runner-configuration-file}

Sur mon serveur GitLab Runner, ma configuration actuelle `/etc/gitlab-runner/config.toml` définit Docker comme executor, grâce à cette entrée :

<Snippet filename="/etc/gitlab-runner/config.toml" source="./files/config.toml" />

Donc, lors de l'exécution de ma CI, GitLab commence par créer un container Docker. L'image de base par défaut peut être forcée dans `/etc/gitlab-runner/config.toml` comme ci-dessous, ou alors vous précisez simplement l'image de base dans le `.gitlab-ci.yml` de votre projet avec le tag `image` ([doc](https://docs.gitlab.com/ci/docker/using_docker_images/#define-image-in-the-gitlab-ciyml-file)).

<Snippet filename="/etc/gitlab-runner/config.toml" source="./files/config.part2.toml" />

## Comprendre le processus {#understanding-the-process}

Pour cette partie, je vais prendre un exemple très basique. Bien sûr, il n'est pas nécessaire d'utiliser Docker-in-Docker pour une simple action « php lint ». Je me sers juste de ce scénario pour ne pas trop compliquer les choses.

Donc, sur la base du fichier `config.toml` ci-dessus, je peux avoir un fichier `.gitlab-ci.yml` comme celui-ci :

<Snippet filename=".gitlab-ci.yml" source="./files/.gitlab-ci.yml" />

Il va récupérer tous les fichiers `.php` et exécuter `php -l <filename.php>` pour chacun d'eux, dans un container Docker basé sur PHP 8.4.

Simple et direct.

## Exécuter Docker-out-of-Docker {#running-docker-out-of-docker}

Sur la base du même exemple, on peut aussi utiliser une image Docker existante, comme [phpqa/jakzal](https://github.com/jakzal/phpqa) (je lui ai dédié un article : <Link to="/blog/php-jakzal-phpqa">Docker image that provides static analysis tools for PHP</Link>) :

<Snippet filename=".gitlab-ci.yml" source="./files/.gitlab-ci.yml.part2" />

Pour que ça fonctionne, il va falloir mettre à jour le fichier de configuration de notre serveur GitLab Runner :

<Snippet filename="/etc/gitlab-runner/config.toml" source="./files/config.part3.toml" />

<AlertBox variant="caution">
La syntaxe `volumes = [ ..., "/var/run/docker.sock:/var/run/docker.sock","/builds:/builds"]` utilisée ci-dessus signifie qu'il faut ajouter ces deux valeurs à la liste que vous avez déjà. Donc, si vous avez actuellement `volumes = ["/cache", "/certs/client"]`, ajoutez les valeurs pour obtenir `volumes = ["/cache", "/certs/client", "/var/run/docker.sock:/var/run/docker.sock","/builds:/builds"]`

</AlertBox>

Il faut autoriser le **démon Docker** qui tourne sur le serveur GitLab Runner à partager son socket (le fichier `/var/run/docker.sock`) afin que le container Docker GitLab CI puisse exécuter des instructions `docker run` comme par exemple `docker run --rm --volume "$CI_PROJECT_DIR:/app" --workdir /app jakzal/phpqa phplint .`

Comme vous pouvez le voir, il y a aussi un flag `--volume "$CI_PROJECT_DIR:/app"`. Cela va <Link to="/blog/docker-volume">partager le dossier</Link> référencé par la variable `$CI_PROJECT_DIR` avec le container mais ici, attention.

Disons que `$CI_PROJECT_DIR` est initialisée à `/builds/your-group/your-project`. Ce `/builds/your-group/your-project` est celui de votre serveur GitLab Runner (c'est donc un dossier sur le serveur). Dans votre container Docker GitLab CI, `/builds/your-group/your-project` existe aussi mais, quand vous exécutez `docker run --rm --volume "$CI_PROJECT_DIR:/app" --workdir /app jakzal/phpqa phplint .`, vous essayez donc de partager le répertoire de l'host avec votre nouveau container et ça ne marchera pas **sauf** si vous l'avez autorisé.

Reportez-vous à la mise à jour déjà faite dans le fichier `config.toml` ci-dessus. Nous avons partagé `"/var/run/docker.sock:/var/run/docker.sock"` pour permettre le partage du socket Docker, mais nous avons aussi partagé `"/builds:/builds"` et ici, c'est pour partager le dossier `builds`.

<AlertBox variant="info">
Cette technique s'appelle **Docker Socket Passthrough**.

</AlertBox>

Maintenant, ça va fonctionner : on partage notre démon Docker et aussi le dossier du serveur où notre codebase a été récupérée avant l'exécution de la CI.

Dès lors, on peut non seulement exécuter des instructions `docker run [...]` mais aussi partager notre dossier avec le container fraîchement créé.

Pourquoi j'ai besoin de ça ? Prenons un seul exemple : la génération de documentation. Je pousse ma documentation sous forme d'un ensemble de fichiers `.md` (dans un dossier appelé `documentation`) puis, pendant ma CI, j'exécute [Quarto](https://quarto.org/) (voir <Link to="/blog/quarto-industrialisation">Quarto - How I Built a Self-Documenting Ecosystem for 50+ Projects</Link>) pour traiter ces fichiers Markdown et, selon ma configuration (le fichier `_quarto.yml`), je peux générer des fichiers hors ligne (comme `.docx`, `.pdf`, ...) mais aussi un site HTML statique. Dans ce dernier cas, j'exporte le site statique quelque part (`./public/documentation`) puis je le publie avec GitLab pages.

## Conclusion {#conclusion}

Deux lignes dans `config.toml` — le socket Docker et le dossier `builds` — suffisent à transformer un job GitLab CI en un job capable de démarrer ses propres containers, sans moteur Docker-in-Docker imbriqué à installer ou à maintenir. C'est la même astuce qui rend une <Link to="/blog/bruno">image Docker Bruno CLI</Link> ou un pipeline Dagger exécutable directement depuis votre CI, et c'est sur elle que je m'appuie aujourd'hui pour lancer le build de documentation Quarto comme un container depuis un container.
