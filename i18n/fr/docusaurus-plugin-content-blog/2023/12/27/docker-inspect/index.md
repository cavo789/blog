---
slug: docker-inspect
title: Docker inspect - Récupérer les informations réseau
date: 2023-12-27
description: Utilisez docker inspect pour récupérer rapidement la configuration détaillée et les informations réseau de vos containers Docker au format JSON. Avec une astuce bonus via jq.
authors: [christophe]
image: /img/v2/docker_tips.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
review_date: 2026-07-30
---
![Docker inspect - Récupérer les informations réseau](/img/v2/docker_tips.webp)

<TLDR>
Cet article montre comment utiliser `docker inspect <container>` pour obtenir la configuration JSON complète d'un container, et comment n'en extraire que le nom du réseau et l'IP depuis la propriété `NetworkSettings.Networks` avec `docker inspect <container> | jq -r '.[0].NetworkSettings.Networks'`.
</TLDR>

La commande `docker inspect` sert à récupérer des informations détaillées sur différents objets Docker : images, containers, volumes, réseaux et nœuds. Elle fournit une vue d'ensemble complète de la configuration de l'objet, de son état et d'autres détails utiles.

Les informations renvoyées sont une représentation JSON de l'objet.

Un cas d'usage : retrouver le nom du réseau utilisé par un container donné.

<!-- truncate -->

## Obtenir le nom du réseau en une ligne {#get-the-network-name-in-one-line}

Vous avez un container qui tourne et vous voulez savoir à quel réseau il est rattaché. Une seule commande :

<Terminal typewriter>
$ docker inspect phpinfo | jq -r '.[0].NetworkSettings.Networks'
</Terminal>

Vous obtiendrez quelque chose comme ceci :

```json
{
  "bridge": {
    "IPAMConfig": null,
    "Links": null,
    "Aliases": null,
    "NetworkID": "efd8b4ee99a7d4283cdfecd122a9357ea8415d3f7cb60b53bda36f1f08d76847",
    "EndpointID": "58ff9063ffdb295ed5b9935a036c2f32225312a3290fdcd90eda96e5f5b6c12b",
    "Gateway": "172.17.0.1",
    "IPAddress": "172.17.0.3",
    "IPPrefixLen": 16,
    "IPv6Gateway": "",
    "GlobalIPv6Address": "",
    "GlobalIPv6PrefixLen": 0,
    "MacAddress": "02:42:ac:11:00:03",
    "DriverOpts": null
  }
}
```

Le voilà : le nom du réseau est la clé (`bridge` ici), et juste en dessous les `Gateway` et `IPAddress` dont vous avez généralement besoin dans la foulée. Remplacez `phpinfo` par le nom de votre propre container et c'est réglé.

<AlertBox variant="info" title="jq">
Si vous n'avez pas encore le binaire `jq`, lisez l'article <Link to="/blog/linux-jq">The jq utility for Linux</Link>.

</AlertBox>

## La sortie complète de inspect {#the-full-inspect-output}

Cette ligne de commande n'est qu'un filtre sur une réponse bien plus large. Lancer `docker inspect <container_name>` (dans notre cas, `docker inspect phpinfo`) sans `jq` donne une représentation JSON très détaillée :

```json
[
    {
        "Id": "1243e5a1d063920759525befa6e374fe2a9bc7ae032559877522e59d7afdc6e8",
        "Created": "2023-12-12T07:52:38.480516578Z",
        "Path": "docker-php-entrypoint",
        "Args": [
            "apache2-foreground"
        ],
        [...]
        //highlight-next-line
        "NetworkSettings": {
            //highlight-next-line
            [...]
            //highlight-next-line
            "Networks": {
                //highlight-next-line
                "bridge": {
                    //highlight-next-line
                    "IPAMConfig": null,
                    //highlight-next-line
                    "Links": null,
                    //highlight-next-line
                    [...]
                //highlight-next-line
                }
            //highlight-next-line
            }
            [...]
        }
        [...]
    }
]
```

Les lignes mises en évidence sont celles que le filtre `jq` ci-dessus parcourt : `NetworkSettings`, puis `Networks`. Tout le reste de ce dump — mounts, environnement, entrypoint, état, santé — est accessible de la même façon, en pointant `jq` vers une autre propriété.

<Details label="Aucun container ne tourne ? Créez-en un pour tester.">

Pour l'illustration, ouvrez un shell Linux et lancez `mkdir -p /tmp/inspect && cd $_`.

Créez un nouveau fichier `index.php` avec ce contenu :

<Snippet filename="index.php" source="./files/index.php" />

Puis lancez `docker run --name phpinfo -d -p 8080:80 -u ${UID}:${GID} -v "$PWD":/var/www/html php:8.2-apache` pour créer un nouveau container Docker (rendez-vous sur `http://localhost:8080` pour le voir à l'œuvre).

En lançant `docker container list`, on retrouve notre container nommé `phpinfo`.

</Details>

## Conclusion {#conclusion}

`docker inspect` répond avec tout, et c'est exactement pour ça qu'il paraît inutile la première fois qu'on le lance. Associé à `jq` et à un chemin de propriété, il devient le moyen le plus rapide d'obtenir une information précise sur un container en cours d'exécution — et le nom du réseau est celle dont vous aurez le plus souvent besoin.

Deux applications concrètes de ce principe : rattacher une interface de base de données à un container existant dans <Link to="/blog/docker-adminer-pgadmin-phpmyadmin">Utiliser Adminer, pgadmin ou phpmyadmin</Link>, et diagnostiquer pourquoi deux containers n'arrivent pas à communiquer dans <Link to="/blog/docker-networking-troubleshooting">Troubleshooting for Docker containers</Link>.
