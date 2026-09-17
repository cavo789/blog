---
slug: docker-health-condition
title: Comprendre la condition depends_on dans les fichiers Docker compose
date: 2024-03-23
description: Évitez les erreurs de démarrage dans vos applications multi-services. Apprenez à utiliser la propriété healthcheck et la condition depends_on service_healthy de Docker Compose pour que votre application attende que la base de données soit totalement prête avant de démarrer.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
![Comprendre la condition depends_on dans les fichiers Docker compose](/img/v2/docker_tips.webp)

<TLDR>
Cet article explique comment empêcher le container d'une application de démarrer avant que sa base de données soit prête, grâce à la propriété `healthcheck` de Docker Compose (qui définit quand un service est considéré comme prêt) combinée à `depends_on: condition: service_healthy` sur le service dépendant — de quoi remplacer les fragiles scripts de retry écrits à la main.
</TLDR>

Ça ne fait qu'une dizaine de jours que j'ai appris l'astuce, alors qu'elle était bien documentée : gérer le démarrage des services et, surtout, bloquer l'un si l'autre n'est pas prêt ([documentation officielle](https://docs.docker.com/compose/startup-order/#control-startup)).

Imaginez une application à deux services comme Joomla (voir mon article <Link to="/blog/docker-joomla/">Créez votre site web Joomla avec Docker</Link>), <Link to="/blog/docker-wordpress">WordPress</Link>, <Link to="/blog/docker-limesurvey">LimeSurvey</Link>, Laravel et bien, bien d'autres cas d'usage : vous avez une application et cette application a besoin d'une base de données.

*Cet article parle d'**attendre** un service en bonne santé ; <Link to="/blog/docker-healthy">Get health information from your running containers</Link> parle de **lire** ce statut de santé depuis la ligne de commande. Et <Link to="/blog/frankenphp-docker-joomla">FrankenPHP, a modern application server for PHP</Link> montre exactement le genre de tempête de « Connection refused » que vous obtenez sans ça.*

<!-- truncate -->

Vous avez, en gros, un fichier `compose.yaml` comme celui-ci :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Et, oui, ça fonctionne. Vous pouvez exécuter `docker compose up --detach`, attendre que les deux services soient lancés et, tôt ou tard, votre application sera prête.

Mais vous avez l'intuition que quelque chose ne va pas tout à fait ici... Que se passe-t-il si le service de base de données est lent à démarrer ? Vous auriez l'application (Joomla ici, mais peu importe) qui, dans son processus d'initialisation, va vouloir se connecter à la base de données, et boum ! Ça ne marchera pas et vous recevrez des erreurs *Error when connecting to the database*. Avec un peu de chance, l'application va réessayer plusieurs fois avant de s'arrêter en erreur. Sans chance, l'application va tout simplement crasher.

Comment résoudre ça ? La réponse tient en deux parties.

1. Vous devez indiquer à Docker comment il peut savoir que le service est prêt,
2. Vous devez mettre en pause le service applicatif jusqu'à ce que la base de données soit prête.

## La propriété healthcheck {#the-healthcheck-property}

L'idée est de demander à Docker d'exécuter une commande donnée toutes les xxx secondes jusqu'à obtenir un statut `Success` (en termes Linux, c'est une commande qui retourne un code de sortie égal à `0`).

En cherchant sur Internet avec `docker healthcheck` suivi du nom d'un service (MySQL, PostgreSQL, Apache, Redis, ...), vous trouverez énormément de possibilités.

Pour MySQL, on utilisera celle-ci :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Les quatre lignes ci-dessus demandent à Docker de vérifier la commande définie par la propriété `test` toutes les 20 secondes, jusqu'à 10 fois. Tant que cette commande ne retourne pas `0`, le container est considéré comme `unhealthy`. Puis, avec un peu de chance, la commande retournera `0` et Docker considérera le service comme `healthy`.

## La propriété depends_on {#the-depends_on-property}

La seconde partie consiste maintenant à créer une dépendance dans notre application. Retour au service Joomla (dans notre exemple), on va ajouter une propriété `depends_on` comme ci-dessous.

<Snippet filename="compose.yaml" source="./files/compose.part3.yaml" />

C'est assez explicite, je pense. Docker va mettre en pause la création du container Joomla (juste la création, pas le téléchargement de l'image ni une étape précédente) tant que le service listé dans `depends_on` n'est pas healthy.

Et vous savez quoi ? Je m'en veux de ne pas avoir découvert ça plus tôt, parce que j'avais déjà mis en place un script comme celui ci-dessous dans mes applications :

<AlertBox variant="note" title="Script très simplifié">

```bash
while [[ ! "$exitCode"  = "0" ]]; do
  echo "Waiting MySQL to launch on 3306..."
  exitCode="$(nc joomladb 3306)"
done
```

</AlertBox>
