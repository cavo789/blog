---
slug: gitlab-using-private-images
title: GitLab - Utiliser des images Docker privées
date: 2025-06-06
description: Utilisez une image Docker privée de Docker Hub dans votre pipeline GitLab CI/CD. Apprenez à créer un token en lecture seule et à configurer les variables GitLab CI/CD nécessaires à l'authentification.
authors: [christophe]
image: /img/v2/gitlab.webp
mainTag: gitlab
tags:
  - code-quality
  - gitlab
  - ssh
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lun25dkf322r
---
![GitLab - Utiliser des images Docker privées](/img/v2/gitlab.webp)

<TLDR>
Pour utiliser une image Docker privée de Docker Hub dans un pipeline GitLab CI/CD, générez d'abord un token d'accès personnel en lecture seule depuis vos paramètres Docker Hub. Ensuite, dans les paramètres CI/CD de votre projet GitLab, créez deux variables protégées et masquées : `DOCKER_HUB_USERNAME` pour votre nom d'utilisateur Docker et `DOCKER_HUB_TOKEN_RO` pour le token d'accès. Enfin, dans votre `.gitlab-ci.yml`, utilisez `docker login` avec ces variables pour vous authentifier avant de récupérer l'image.
</TLDR>

Dans une de mes CI GitLab, j'ai eu besoin d'utiliser une image Docker stockée sur `hub.docker.com` dans un repository privé.

Je ne pouvais pas simplement faire un `docker pull my_image` parce qu'il fallait d'abord m'authentifier dans la CI avant de pouvoir récupérer l'image (elle est privée).

Cet article est un guide pratique qui explique comment faire.

*Deux articles jumeaux sur la même CI : <Link to="/blog/gitlab-runner-ssh-key">GitLab - Using an SSH key to connect to private repo</Link> pour les repositories **git** privés, et <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link> si votre job doit exécuter des commandes `docker`.*

<!-- truncate -->

<!-- TODO(author): capture a real GitLab CI job log excerpt showing `docker login` followed by a successful `docker pull` of the private image — not reproducible in this session (requires a live GitLab instance and Docker Hub account). -->

Voici le résultat une fois le token et les variables en place : le job s'authentifie et récupère l'image privée au lieu d'échouer avec `denied: requested access to the resource is denied`.

## Pourquoi ça fonctionne {#why-it-works}

- Le token Docker Hub a une portée `Read-Only` : même s'il fuitait, il ne permettrait que de récupérer des images — jamais d'en pousser ni de modifier quoi que ce soit sur votre compte.
- Le nom d'utilisateur et le token vivent en tant que variables CI/CD cachées et protégées, jamais dans le `.gitlab-ci.yml` lui-même — GitLab ne les affichera même pas si vous activez le mode debug complet.

## Créer un token {#create-a-token}

Vous devez d'abord créer un token. Rendez-vous sur cette page : [https://app.docker.com/settings/personal-access-tokens](https://app.docker.com/settings/personal-access-tokens). Vous devrez vous connecter, bien entendu.

Cliquez sur le bouton `Generate new token` et créez-en un nouveau. Veillez à bien spécifier la portée. Pour pouvoir accéder aux images privées, vous devez choisir `Read-Only` et pas `Public Repo Read-Only` (parce que ce dernier ne donne pas accès aux images privées).

Une fois créé, Docker affiche un petit écran d'aide où vous lirez que vous pouvez vous connecter à Docker en utilisant le token comme s'il s'agissait de votre mot de passe.

## Créer deux variables CI/CD dans la page de votre repository {#create-two-cicd-variables-in-your-repository-page}

Dans la page des paramètres CI/CD de GitLab, ajoutez deux nouvelles variables :

- La première s'appellera `DOCKER_HUB_USERNAME`. La valeur à saisir ici est le nom de votre compte Docker (comme `christophe` ou `my_company` si l'image est stockée dans un compte d'entreprise) et
- la seconde s'appellera `DOCKER_HUB_TOKEN_RO`. La valeur à saisir ici est le token que vous avez reçu.

Assurez-vous que les variables sont cachées et protégées. Cela empêchera GitLab d'afficher la valeur dans une sortie quelconque, par exemple quand vous activez `CI_DEBUG_TRACE=true` ([doc](https://docs.gitlab.com/ci/variables/variables_troubleshooting/#enable-debug-logging)) pour le debug complet.

![Les deux variables ont été créées](./images/variables.webp)

<AlertBox variant="note">
Vous pouvez ajouter les variables dans la page des paramètres CI/CD de votre repository ou à un niveau supérieur, comme au niveau du groupe ou au niveau de l'instance (il faut être admin pour ça).

</AlertBox>

## Votre fichier gitlab-ci.yml {#your-gitlab-ciyml-file}

Une fois cela fait, voici comment se connecter à Docker dans votre fichier `.gitlab-ci.yml` :

<Snippet filename=".gitlab-ci.yml" source="./files/.gitlab-ci.yml" />

## Conclusion {#conclusion}

Un token en lecture seule et deux variables CI/CD protégées et masquées suffisent pour récupérer une image Docker Hub privée dans votre pipeline, sans jamais committer le moindre identifiant dans votre repo. Voyez <Link to="/blog/gitlab-runner-ssh-key">GitLab - Using an SSH key to connect to private repo</Link> pour le même problème appliqué à un repository **git** privé plutôt qu'à une image privée.
