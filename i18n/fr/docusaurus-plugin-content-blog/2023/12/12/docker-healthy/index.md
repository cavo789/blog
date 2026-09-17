---
slug: docker-healthy
title: Obtenez les informations de santé de vos containers en cours d'exécution
date: 2023-12-12
description: Obtenez instantanément les informations de santé de vos containers Docker. Cet article présente un script bash utilisant docker ps et docker inspect pour des vérifications rapides.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: bash
tags:
  - bash
  - docker
language: fr
review_date: 2026-07-30
---
![Obtenez les informations de santé de vos containers en cours d'exécution](/img/v2/docker_tips.webp)

<TLDR>
Cet article partage un script Bash qui parcourt tous les containers Docker (`docker container list --all`) et rapporte l'état de santé de chacun via le champ `State.Health` de `docker inspect`. Vous obtenez un aperçu rapide des containers sains, en mauvaise santé, ou sans healthcheck configuré (`null`).
</TLDR>

Quand vous avez quelques containers qui tournent sur votre machine, vous pouvez récupérer rapidement les informations de santé avec `docker ps` et sa réponse `State.Health`.

Dans cet article, nous allons voir comment créer un script bash qui pourra servir de base pour d'autres besoins.

<!-- truncate -->

## La vue d'ensemble en un coup d'œil {#the-one-glance-overview}

Voici ce que j'obtiens sur ma machine, en une seule commande :

![Docker health checks](./images/healthy.webp)

J'ai quelques containers qui tournent, beaucoup sont `healthy`, ce qui veut dire qu'ils fonctionnent sans problème. J'en ai deux dans un état `null`, c'est-à-dire qu'ils dorment, et aucun n'est arrêté à cause d'une erreur.

C'est tout l'intérêt : un seul écran, et vous savez quel container demande votre attention.

## Le script qui la produit {#the-script-that-produces-it}

Créez quelque part sur votre disque, dans une console Linux, un script appelé par exemple `health.sh` avec ce contenu :

<Snippet filename="health.sh" source="./files/health.sh" />

Pensez à rendre le script exécutable : `chmod +x health.sh`, puis lancez-le avec `./health.sh`.

<AlertBox variant="info" title="Obtenir la liste de tous les containers">
`docker container list --all --format "{{.Names}}"` retourne la liste de tous les containers et n'affiche que la colonne `Name` dans la console.

</AlertBox>

## Conclusion {#conclusion}

Quelques lignes de Bash, et la question *« est-ce que tout va toujours bien sur cette machine ? »* obtient une réponse en un coup d'œil, au lieu d'un `docker inspect` par container. N'hésitez pas à ajuster le script selon vos besoins.

Ce script vous donne un instantané, à la demande. Si vous préférez être **notifié** quand un service tombe, jetez un œil à <Link to="/blog/docker_uptime_kuma">Self-hosted monitoring tool</Link>. Et quand un container tourne mais reste injoignable depuis un autre, <Link to="/blog/docker-networking-troubleshooting">Troubleshooting for Docker containers - Accessing the other one</Link> déroule le diagnostic, couche par couche.
