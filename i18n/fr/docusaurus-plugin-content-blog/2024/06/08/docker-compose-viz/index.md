---
slug: docker-compose-viz
title: Comment générer un graphe depuis compose.yaml
date: 2024-06-08
description: Visualisez instantanément l'architecture de votre Docker Compose. Utilisez `compose-viz` pour générer un graphe clair des services, dépendances et ports exposés à partir de votre fichier `compose.yaml`.
authors: [christophe]
image: /img/v2/docker_tips.webp
series: Diagrams as code
mainTag: doc-as-code
tags:
  - doc-as-code
  - docker
language: fr
updates:
  - date: 2025-05-14
    note: Adding the `--format` flag
---
![Comment générer un graphe depuis compose.yaml](/img/v2/docker_tips.webp)

<TLDR>
Cet article montre comment visualiser un fichier `compose.yaml` sous forme de graphe de dépendances avec l'image Docker `compose-viz`. Le résultat est une image (PNG, SVG et d'autres formats via `--format`) qui affiche d'un coup d'œil les services, leurs dépendances et les ports exposés — pratique pour comprendre de grosses architectures Docker multi-services. On y parle aussi de `docker compose config` pour résoudre et fusionner plusieurs fichiers `.yml` et variables avant la visualisation.
</TLDR>

Imaginez que vous ayez un très gros fichier `compose.yaml` avec beaucoup de services et de dépendances.

Vous avez aussi plusieurs ports exposés.

Vous aimeriez avoir une vue d'ensemble des services, des dépendances et des ports ouverts. C'est possible ? Oui ! [https://github.com/compose-viz/compose-viz](https://github.com/compose-viz/compose-viz) fait la magie pour nous.

<!-- truncate -->

Voici ce que `compose-viz` génère à partir d'un `compose.yaml` Joomla :

![Joomla compose-viz](./images/joomla.webp)

<AlertBox variant="info" title="Comment interpréter l'image ?">
On voit que le port `8080` est exposé sur la machine. Ce port est, en fait, le port `80` du container `joomla`. Et on voit aussi que `joomla` a une dépendance avec le container `joomladb`. Facile, non ?

</AlertBox>

## Reproduisez-le vous-même {#reproduce-it-yourself}

Pour la démo, ouvrez un shell Linux et lancez `mkdir -p /tmp/compose-viz && cd $_` pour créer un dossier appelé `compose-viz` dans votre dossier temporaire Linux et y entrer.

Créez ensuite un nouveau fichier appelé `compose.yaml` avec ce contenu **simplifié** :

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

Laissez la magie opérer et lancez `docker run --rm -it -u $(id -u):$(id -g) -v $(pwd):/in wst24365888/compose-viz compose.yaml` — vous obtiendrez l'image montrée plus haut.

<!-- cspell:disable -->
<AlertBox variant="info" title="Le flag --format">
En ajoutant `--format svg`, vous obtiendrez un SVG au lieu d'un PNG. La liste des formats de sortie supportés est énorme : `png|dot|jpeg|json|svg|bmp|canon|cmap|cmapx|cmapx_np|dot_json|emf|emfplus|eps|fig|gif|gv|imap|imap_np|ismap|jpe|jpg|json0|metafile|mp|pdf|pic|plain|plain-ext|pov|ps|ps2|tif|tiff|tk|vml|xdot|xdot1.2|xdot1.4|xdot_json`.

</AlertBox>
<!-- cspell:enable -->

## Un exemple plus complexe {#a-more-complex-example}

Remplacez le contenu du `compose.yaml` par celui-ci :

<Snippet filename="compose.yaml" source="./files/compose.part2.yaml" />

Et l'image ci-dessous sera générée par l'outil :

![Exemple plus complexe](./images/more_complex.webp)

Ici, on peut voir :

- Nous avons quatre ports exposés : `5001`, `5000`, `6379` et `8080`.
- Le port `8080` est lié à un service web `visualizer` ; ce service utilise un volume pointant vers `/var/run/docker.sock`
- Les ports `5000` et `5001` renvoient à des services appelés `vote` et `result`. Comme le port interne est le port `80`, on sait que ces ports sont des interfaces web.
- Le service `vote` (port `5000`) utilise un service `redis`, accessible via le port `6379`.
- Le service `result` (port `5001`) est lié à un service Postgres appelé `db` et dispose de données persistantes (puisqu'on a un volume Docker appelé `db-data`).
- Et ainsi de suite.

Un tel outil de visualisation simplifie énormément la compréhension d'une architecture Docker.

*`compose-viz` vous donne un seul rendu, figé. Si vous voulez contrôler exactement ce que le diagramme affiche, <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link> analyse le même `compose.yaml` avec un script Python qui vous appartient, et <Link to="/blog/docker-diagram-as-code">Docker - Diagrams as code</Link> liste une dizaine d'autres outils de diagram-as-code.*

## Docker config {#docker-config}

Si, comme moi, vous utilisez beaucoup de fichiers `.yml` quand vous lancez Docker et/ou que vous y utilisez des variables d'environnement, lancez simplement `docker compose config` pour demander à Docker de *rendre* (à l'écran uniquement) ce qu'il appelle *Parse, resolve and render compose file in canonical format*, c'est-à-dire qu'il va fusionner tous vos `.yml` en une seule chaîne et résoudre les variables.

Copiez/collez la sortie à l'écran dans un fichier temporaire et utilisez cet outil sur ce fichier.
