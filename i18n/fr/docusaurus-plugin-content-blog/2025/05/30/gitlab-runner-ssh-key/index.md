---
slug: gitlab-runner-ssh-key
title: GitLab - Utiliser une clé SSH pour se connecter à un repo privé
date: 2025-05-30
description: Guide pas à pas pour configurer un runner GitLab CI/CD afin qu'il utilise une clé SSH privée en toute sécurité pour accéder et cloner des repositories privés.
authors: [christophe]
image: /img/v2/gitlab.webp
mainTag: gitlab
tags:
  - code-quality
  - gitlab
  - ssh
language: fr
review_date: 2026-07-30
blueskyRecordKey: 3lun2oxe3zs2r
---
<!-- cspell:ignore libcrypto -->

![GitLab - Utiliser une clé SSH pour se connecter à un repo privé](/img/v2/gitlab.webp)

<TLDR>
Ce guide est un tutoriel pas à pas sur l'utilisation d'une clé SSH privée dans un pipeline GitLab CI/CD pour accéder à des repositories privés. Vous allez apprendre à générer une clé SSH, à stocker la clé privée encodée en base64 dans une variable CI/CD masquée, et à configurer votre `.gitlab-ci.yml` pour utiliser cette clé afin de vous authentifier et de cloner des repos privés pendant vos jobs CI.
</TLDR>

Dans cet article, nous allons voir comment utiliser une clé SSH privée dans une CI GitLab.

Le besoin : quand ma CI tourne, le runner GitLab doit pouvoir se connecter à mon environnement GitLab auto-hébergé (et privé). Car il devra en récupérer des projets privés. Pensez à un projet PHP par exemple : dans mon `composer.json`, je référence des dépendances hébergées sur mon serveur GitLab. Ou idem pour un projet JavaScript et son fichier `package.json`.

Autre exemple : ma CI va produire des fichiers (comme un `.pdf`) en convertissant des documents Markdown en une vraie documentation. À la fin de cette conversion, le PDF doit être poussé dans le repository.

Mon besoin est donc le suivant : je dois partager ma clé SSH avec le runner GitLab.

*Deux articles frères sur la même CI : <Link to="/blog/gitlab-using-private-images">GitLab - Using Docker private images</Link>, qui résout le même problème d'authentification pour une **image** privée plutôt que pour un repository privé, et <Link to="/blog/gitlab-docker-out-of-docker">GitLab - Running Docker-out-of-Docker in your CI</Link>.*

<!-- truncate -->

<!-- TODO(author): capture a real GitLab CI job log excerpt showing the private repo clone succeeding (`git clone` / `Cloning into ...` over SSH) once SSH_PRIVATE_KEY is configured — not reproducible in this session (requires a live GitLab instance and runner). -->

Voici le résultat une fois la variable CI en place : le job clone le repo privé via SSH au lieu d'échouer avec une erreur de permission.

## Pourquoi ça fonctionne {#why-it-works}

- La clé privée ne touche jamais votre `.gitlab-ci.yml` ni votre repo : elle vit sous forme de variable CI/CD masquée, encodée en base64, et n'est décodée dans un fichier qu'à l'intérieur du job en cours d'exécution.
- Une seule variable peut être limitée à un repo unique, à un groupe GitLab entier ou à toute l'instance : vous la configurez une fois et la réutilisez partout où vous avez besoin du même accès privé.

<AlertBox variant="info">
Pour illustrer cet article, partons du principe que `christophe` est mon compte utilisateur sur mon serveur GitLab auto-hébergé et que ce serveur s'appelle `my_self_hosted_gitlab`.

Pensez à remplacer ces deux constantes par les vôtres ;-)

</AlertBox>

## D'abord, il me faut une clé SSH {#first-i-need-to-have-an-ssh-key}

> Pour l'histoire complète, lisez mon article <Link to="/blog/linux-ssh-scp">SSH - Launch a terminal on your session without having to authenticate yourself</Link>.

Je vais créer une clé privée en exécutant `ssh-keygen -t ed25519 -C "christophe@my_self_hosted_gitlab" -f ~/.ssh/id_ed25519_my_self_hosted_gitlab`.

Cette commande va créer le fichier `~/.ssh/id_ed25519_my_self_hosted_gitlab`. C'est ma clé privée et c'est celle dont j'aurai besoin à l'étape suivante.

## Ensuite, je vais l'encoder pour plus de sécurité {#then-i-will-encode-it-for-better-security}

En exécutant `cat ~/.ssh/id_ed25519_my_self_hosted_gitlab | base64 -w 0`, je vais *encoder en base64* ma clé privée sous la forme d'une très longue chaîne de caractères alphanumériques.

Je dois copier cette longue chaîne dans le presse-papiers.

## Troisièmement, je dois créer une variable CI SSH_PRIVATE_KEY {#third-i-have-to-create-a-ssh_private_key-ci-variable}

Ici, j'ai plusieurs possibilités :

- j'utilise la variable pour un seul repo ;
- j'utilise la variable pour tous les repositories d'un groupe donné (un groupe GitLab est comme un dossier contenant plusieurs repos) ;
- j'utilise la variable pour tous les repositories stockés sur mon instance GitLab.

En allant dans mon repository, je dois cliquer sur **CI/CD Settings**, déplier la zone **Variables** pour pouvoir ajouter une nouvelle variable.

Le nom de la variable doit être **SSH_PRIVATE_KEY** et je choisis `Masked` (ou `Masked and hidden`) pour la visibilité. Pour la valeur, je colle la chaîne encodée en base64 que je viens de copier dans le presse-papiers.

Je finalise la création de la variable en cliquant sur le bouton `Add variable` présent en bas du panneau.

<AlertBox variant="info">
Si je veux utiliser la clé pour tous les repositories d'un groupe donné, je procède exactement de la même façon, mais pas au niveau du repository : au niveau du groupe.

</AlertBox>

<AlertBox variant="info">
Et si je suis administrateur GitLab, je peux ouvrir l'interface d'administration et, de là, aller sur la page **CI/CD Settings** et procéder de la même manière.

</AlertBox>

## Enfin, je dois adapter mon fichier .gitlab-ci.yml {#finally-i-have-to-adjust-my-gitlab-ciyml-file}

Comme exemple, je vais réutiliser celui fourni par GitLab : [https://gitlab.com/gitlab-examples/ssh-private-key/-/blob/main/.gitlab-ci.yml](https://gitlab.com/gitlab-examples/ssh-private-key/-/blob/main/.gitlab-ci.yml)

<AlertBox variant="note">
Selon l'image utilisée, vous devrez utiliser `apt` ou `apk`.

Pour une image ubuntu comme dans l'exemple ci-dessous, ce sera `apt`. Si, par exemple, vous utilisez l'image `docker`, remplacez alors
`apt-get update -y && apt-get install openssh-client git -y` par `apk update && apk add --no-cache openssh-client git`.

</AlertBox>

<Snippet filename=".gitlab-ci.yml" source="./files/.gitlab-ci.yml" />

<AlertBox variant="note">
Si la CI échoue avec une erreur du type *load pubkey "id_ed25519": invalid format* ou *error in libcrypto*, une cause possible est la clé utilisée : la variable `SSH_PRIVATE_KEY` doit être initialisée avec la clé privée, pas la clé publique.

La chaîne base64 doit être créée comme ceci : `cat ~/.ssh/id_ed25519_my_self_hosted_gitlab | base64 -w 0` (et donc sans utiliser le fichier `.pub`).

</AlertBox>

## Conclusion {#conclusion}

Une paire de clés, une variable CI/CD masquée encodée en base64 et quelques lignes dans `.gitlab-ci.yml` : c'est tout ce qu'il faut pour que votre CI clone un repository privé via SSH, sans jamais committer un secret dans votre code. Voyez <Link to="/blog/gitlab-using-private-images">GitLab - Using Docker private images</Link> pour le même problème d'authentification appliqué à une image Docker privée plutôt qu'à un repository privé.
