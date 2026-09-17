---
slug: docker-networking-troubleshooting
title: Dépannage des containers Docker - Accéder à l'autre
date: 2025-12-22
description: Dépannez le réseau de vos containers Docker - testez les ports, le DNS et corrigez les problèmes de proxy pour qu'un container puisse appeler l'API d'un autre de façon fiable.
authors: [christophe]
image: /img/v2/autopsy_binary_crime.webp
mainTag: docker
tags:
  - docker
  - linux
language: fr
blueskyRecordKey: 3maksv6gjks25
---
![Dépannage des containers Docker - Accéder à l'autre](/img/v2/autopsy_binary_crime.webp)

<TLDR>
Cet article détaille les étapes de dépannage pour des containers Docker qui n'arrivent pas à communiquer, en particulier quand un container doit accéder à l'API d'un autre sur le même réseau. On vérifie méthodiquement la configuration réseau, l'accessibilité des ports et la résolution DNS entre containers. La solution finale a consisté à configurer les variables d'environnement `no_proxy` dans le container consommateur pour contourner un proxy qui interférait avec les adresses internes du réseau Docker.
</TLDR>


La situation : j'ai deux containers ; l'un s'appelle `provider` et l'autre `consumer`. Le `consumer` doit pouvoir appeler une API sur le `provider`.

Et... ça ne marchait pas : quelque chose dans ma configuration n'est pas correct puisque j'obtiens des erreurs de connexion quand j'essaie d'appeler le `provider`. Commençons l'enquête et comprenons la solution.

Dans la suite de cet article, appelons-les comme ceci : `provider` pour le premier container et `consumer` pour le second.

<!-- truncate -->

## D'abord, ils doivent être sur le même réseau {#first-they-should-be-on-the-same-network}

D'abord, ils doivent être sur le même réseau Docker ; sinon, aucune chance que ça fonctionne. *Si vous avez besoin de l'inverse — atteindre un service qui tourne sur votre host depuis l'intérieur d'un container — lisez <Link to="/blog/docker-network-and-extra-hosts">Using Docker network and the extra_hosts property</Link>.*

En lançant `docker ps`, vous obtiendrez le `container_id` et le `name` de vos deux containers.

La commande pour récupérer le nom du réseau Docker est `docker inspect --format '{{json .NetworkSettings.Networks}}' CONTAINER_NAME | jq` (<Link to="/blog/linux-jq">`jq`</Link> est le couteau suisse du JSON en ligne de commande). Donc, pour le premier container, lancez `docker inspect --format '{{json .NetworkSettings.Networks}}' provider | jq` et `docker inspect --format '{{json .NetworkSettings.Networks}}' consumer | jq` pour le second.

Vous obtiendrez quelque chose comme ceci :

<Snippet source="./files/network.json" />

Dans cet exemple, le réseau s'appelle `your_network`. Vérifiez simplement que c'est le même pour les deux containers. Vérifiez aussi que vous avez la même `Gateway` (`192.168.0.1` dans cet exemple).

<AlertBox variant="tip" title="Ok, ils tournent sur le même réseau." />

## Ensuite, tester le port interne des deux containers {#then-testing-the-internal-port-for-both-containers}

Lancez `docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"` pour obtenir la liste des containers en cours d'exécution et leurs ports (externe/interne).

Vous obtiendrez quelque chose comme ceci :

```bash
CONTAINER ID   NAMES    PORTS
5abd45eecfa3   consumer   0.0.0.0:8001->8000/tcp, [::]:8001->8000/tcp
a95b6174beb9   provider     0.0.0.0:8888->8000/tcp, [::]:8888->8000/tcp
```

Ils tournent donc tous les deux sur le port `8000` en interne, mais le `consumer` est exposé sur l'host via le port `8001` et le `provider` sur le port `8888`.

Au chapitre précédent, nous venons de voir que le réseau s'appelle `your_network`.

On peut s'assurer que le processus qui écoute sur le port `8000` tourne bien dans les deux containers en exécutant `docker inspect -f '{{.NetworkSettings.Networks.your_network.IPAddress}}' consumer` dans la console pour obtenir l'IP de ce container. Dans mon cas, j'obtiens `192.168.0.4` en réponse.

Maintenant que nous l'avons, nous pouvons tester le port interne :

<Terminal typewriter wrap={true} source="./files/terminal-3.txt" />

Appuyez sur <kbd>CTRL</kbd>+<kbd>C</kbd> pour quitter.

<AlertBox variant="tip" title="Ok, les deux containers ont bien un service qui tourne sur leur port interne." />

## Troisièmement, tester le port externe des deux containers {#third-testing-the-external-port-for-both-containers}

Nous avons vu que les containers tournent sur le port `8000` en interne mais que l'un mappe le port `8001` sur l'host et le second le port `8888`.

On peut lancer `telnet 127.0.0.1 8001` et `telnet 127.0.0.1 8888` pour tester ces ports. **Voyez, ici, puisqu'on accède aux ports exposés, on utilise l'adresse IP de notre host local.**

Si vous savez que le service est un service web, vous pouvez lancer `curl -vvv 127.0.0.1:8001` pour vérifier que le service fonctionne bien et que la réponse renvoyée correspond à vos attentes :

<Snippet source="./files/curl.txt" />

<AlertBox variant="tip" title="Ok, les deux containers sont correctement exposés sur leur port externe." />

## Quatrièmement, tester la connectivité entre les deux containers {#fourthly-testing-connectivity-between-the-two-containers}

Relancez `docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Ports}}"` pour récupérer le nom du container et son container ID associé.

Dans notre préambule, nous avons dit : le `consumer` doit pouvoir appeler une API du `provider`. Entrons donc dans le `consumer` en ouvrant une console. On utilisera le CONTAINER_ID du consumer et on se connectera en tant que `root` :

<Terminal typewriter wrap={true}>
$ docker exec --user root -it 5abd45eecfa3 sh
</Terminal>

On va d'abord essayer `ping` pour voir si on peut joindre le container `provider` :

<Terminal typewriter wrap={true}>
$ apt-get update

$ apt-get install -y iputils-ping
</Terminal>

Une fois fait, essayez `ping` suivi du nom du container (nous avons déjà identifié `provider` et `consumer` comme noms de containers grâce à notre commande `docker ps`).

<Terminal typewriter wrap={true} source="./files/terminal-2.txt" />

Appuyez sur <kbd>CTRL</kbd>+<kbd>C</kbd> pour arrêter.

<AlertBox variant="tip" title="Ok, notre consumer peut joindre le provider par son nom (le ping fonctionne).">

Cela signifie que la résolution DNS fonctionne correctement.
</AlertBox>

### Tester le port {#testing-the-port}

Toujours dans le container `consumer`, installez `telnet` si nécessaire

<Terminal typewriter wrap={true}>
$ apt-get update

$ apt-get install -y telnet
</Terminal>

Puis lancez `telnet provider 8000`, c'est-à-dire le nom du container et son port interne (pas celui exposé)

<Terminal typewriter wrap={true} source="./files/terminal-1.txt" />

<AlertBox variant="tip" title="Essayer le port exposé">
Relancez simplement la dernière commande `telnet` mais avec le port `8888` cette fois : ça ne marchera pas.

En utilisant le nom du container avec telnet, on doit utiliser le port interne ; pas celui exposé.
</AlertBox>

<AlertBox variant="tip" title="Ok, la couche transport (telnet) fonctionne aussi.">

`telnet` sert à tester la **couche transport** (couche n°4 du [modèle OSI](https://en.wikipedia.org/wiki/OSI_model)) et notre test ici montre qu'elle fonctionne.
</AlertBox>

### Tester l'application {#testing-the-application}

Maintenant qu'on sait que les containers peuvent communiquer, testons la **couche application** (couche n°7 du [modèle OSI](https://en.wikipedia.org/wiki/OSI_model)).

Dans mon cas, le container `provider` expose une API, je devrais donc pouvoir l'atteindre avec `curl`.

<Terminal typewriter wrap={true}>
$ curl -v http://provider:8000
</Terminal>

Dans ma situation, c'est là que j'ai obtenu une erreur et le dump montre quelque chose comme ceci :

```text
<body><div class="message-container">
<div class="logo"></div>
<h1>504 DNS look up failed</h1>
<p>The webserver reported that an error occurred while trying to access the website. Please return to the previous page.</p>
<table><tbody>
<tr>
<td>URL</td>
<td>http://provider:8000/</td>
</tr>
</tbody></table>
</div></body>
```

**Bingo ! Le problème, c'est... un proxy.**

La requête a été interceptée par un proxy et celui-ci refuse la requête.

Il faut lui dire d'ignorer les requêtes faites vers notre container.

```bash
export no_proxy="provider,192.168.0.0/24,127.0.0.1,localhost"
export NO_PROXY="provider,192.168.0.0/24,127.0.0.1,localhost"
```

- `provider` est le nom de notre container,
- `192.168.0.0/24` est la plage IP du sous-réseau Docker (vous pouvez la récupérer en lançant `docker network inspect your_network | jq -r '.[].IPAM.Config[0].Subnet'`)
- le bien connu `127.0.0.1,localhost` est notre localhost

<AlertBox variant="tip" title="La variable no_proxy">
Pour être sûr que tous les outils (`curl`, `wget`, `apt-get`, ...) utilisent bien la variable `no_proxy`, il est recommandé d'employer les deux notations : minuscules et majuscules.
</AlertBox>

Et voilà, enfin, la commande que j'utilise pour consommer mon API ressemble à `curl -X POST -H 'Content-Type: application/json' -H 'Accept: application/json' http://provider:8000/api/v1/fetch`.

## Cinquièmement, trouver la solution {#fifthly-finding-the-solution}

Si vous êtes tombé sur cet article parce que vous avez le même problème que moi, la solution est maintenant simple : assurez-vous que votre image Docker est configurée avec une variable `no_proxy` contenant les bonnes valeurs.

Cela peut se faire avec une variable `no_proxy` dans votre fichier `compose.yaml`. Ici, juste à titre d'illustration, une façon de faire :

```yaml
services:
  consumer:
    image: your_image
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - HTTP_NO_PROXY=${HTTP_NO_PROXY:-provider,localhost,.local,127.0.0.1,192.168.0.0/24}
```

Ensuite, dans votre `Dockerfile`, faites simplement quelque chose comme :

```Dockerfile
# syntax=docker/dockerfile:1
ARG HTTP_NO_PROXY="localhost,.local,127.0.0.1,192.168.0.0/24"

FROM python:3.14-slim AS production

ARG HTTP_NO_PROXY

ENV no_proxy="${HTTP_NO_PROXY}" \
    NO_PROXY="${HTTP_NO_PROXY}"
```

Recréez vos containers et tadaaaa ! ça marche.

Dans notre exemple, nous avons finalement déterminé que ce n'était pas la couche réseau qui était en cause, mais plutôt la couche où le proxy prenait le contrôle : la couche application.
