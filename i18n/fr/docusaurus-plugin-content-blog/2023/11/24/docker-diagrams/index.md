---
slug: docker-diagram-as-code
title: Docker - Des diagrammes en tant que code
date: 2023-11-24
description: Générez de superbes diagrammes d'infrastructure et d'application directement depuis du code Python, avec la librairie diagrams et une simple commande Docker. Visualisez vos systèmes complexes sans effort.
authors: [christophe]
image: /img/v2/diagrams.webp
series: Diagrams as code
mainTag: doc-as-code
tags:
  - doc-as-code
  - docker
language: fr
review_date: 2026-07-30
---
![Docker - Des diagrammes en tant que code](/img/v2/diagrams.webp)

<TLDR>
Cet article montre comment générer des diagrammes-as-code avec la librairie Python `diagrams` via une image Docker prête à l'emploi (`gtramontina/diagrams`) : on envoie un fichier `.py` dans `docker run` pour produire des diagrammes d'architecture (icônes AWS/Azure/GCP, par exemple) sans rien installer localement. Il se termine par un large tour d'horizon des autres outils de diagram-as-code : Mermaid, PlantUML, Graphviz, Kroki, DBML-renderer, Structurizr, et d'autres encore.
</TLDR>

Quel plaisir de pouvoir dessiner des diagrammes en écrivant simplement du texte. Certains outils sont plus connus que d'autres, par exemple [Mermaid](https://mermaid-js.github.io/mermaid/) — que j'ai depuis automatisé dans <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link>, et dont le cousin Graphviz est traité dans <Link to="/blog/python-pydot">Python - Generate flows using pydot</Link>.

Connaissiez-vous [https://diagrams.mingrammer.com/](https://diagrams.mingrammer.com/) ? Explorons-le avec, bien entendu, une image Docker prête à l'emploi.

<!-- truncate -->

## Le résultat {#what-comes-out}

Voici un diagramme produit par cet article, et il n'y avait que du texte en entrée :

![Team](./images/team.webp)

La commande qui l'a produit tient sur une ligne ; le fichier `.py` est envoyé dans un container et le `.png` atterrit dans votre dossier courant :

<Terminal typewriter>
$ cat team.py | docker run -i --rm -v $(pwd):/out -u 1000:1000 gtramontina/diagrams:0.23.3
</Terminal>

## Pourquoi ça fonctionne {#why-it-works}

- Le fichier `.py` n'est pas exécuté sur votre machine : il est envoyé dans le container, qui contient Python, la librairie `diagrams`, Graphviz et l'ensemble des jeux d'icônes AWS/Azure/GCP/K8S.
- `-v $(pwd):/out` est ce qui permet à l'image générée de revenir dans votre dossier au lieu de mourir avec le container.
- `-u 1000:1000` exécute le container avec votre identité, de sorte que le fichier produit appartienne à votre utilisateur et pas à `root`.

<AlertBox variant="note" title="Notation Windows">
Si vous travaillez sous Windows, remplacez `$(pwd)` par `%CD%`. Et remplacez `cat` par `type`.

</AlertBox>

## Le code source {#the-source}

Comme toujours pour la démo, ouvrez un shell Linux et lancez `mkdir -p /tmp/docker-diagrams && cd $_` pour créer un dossier `docker-diagrams` dans votre dossier temporaire Linux et vous y rendre.

Créez ensuite un nouveau fichier `team.py` avec le contenu qui a produit le diagramme ci-dessus :

<Snippet filename="team.py" source="./files/team.py" />

Puis lancez la commande de conversion montrée plus haut.

*0.23.3 est la dernière version disponible au moment d'écrire ce document. Voir [https://hub.docker.com/r/gtramontina/diagrams/tags](https://hub.docker.com/r/gtramontina/diagrams/tags) pour récupérer la plus récente.*

Facile, non ?

## Une vraie architecture {#a-real-architecture}

Vingt lignes de Python pour un organigramme d'équipe, c'est sympa ; voici le même exercice sur une infrastructure réelle :

<Snippet filename="stateful.py" source="./files/stateful.py" />

Et l'image obtenue :

![Stateful Architecture](./images/stateful_architecture.webp)

Dingue, non ? Et tout ça sans rien installer !

<AlertBox variant="info" title="Plus d'exemples">
Retrouvez d'autres exemples sur [https://diagrams.mingrammer.com/docs/getting-started/examples](https://diagrams.mingrammer.com/docs/getting-started/examples)

</AlertBox>

Le code de l'image Docker est ici : [https://github.com/gtramontina/docker-diagrams](https://github.com/gtramontina/docker-diagrams), et vous trouverez plein d'autres exemples sur [https://github.com/mingrammer/diagrams](https://github.com/mingrammer/diagrams).

## Icônes et autres outils (référence, à garder sous le coude) {#icons-and-other-tools-reference-skip-this-for-now}

Une énorme liste d'icônes/nœuds est disponible sur plusieurs pages à partir de [https://diagrams.mingrammer.com/docs/nodes/onprem](https://diagrams.mingrammer.com/docs/nodes/onprem). Voir [OnPrem](https://diagrams.mingrammer.com/docs/nodes/onprem), [AWS](https://diagrams.mingrammer.com/docs/nodes/aws), [Azure](https://diagrams.mingrammer.com/docs/nodes/azure), [GCP](https://diagrams.mingrammer.com/docs/nodes/gcp), [IBM](https://diagrams.mingrammer.com/docs/nodes/ibm), [K8S](https://diagrams.mingrammer.com/docs/nodes/k8s) et aussi comment créer les vôtres (à partir d'images `.png` locales) : [Custom](https://diagrams.mingrammer.com/docs/nodes/custom).

Et comme `diagrams` est loin d'être le seul outil texte-vers-image, voici la liste sur laquelle je reviens sans cesse :

- [DB Diagram](https://dbdiagram.io/home) *(voir aussi <Link to="/blog/drawdb-app">Drawdb-app - Render your database model as png, markdown, mermaid, ...</Link>)*
- [DBML-renderer](https://github.com/softwaretechnik-berlin/dbml-renderer), dbml-renderer convertit des fichiers DBML en images SVG
- [Graphviz](https://www.graphviz.org/), un logiciel open source de visualisation de graphes
- [JSON Crack](https://jsoncrack.com/), visualisez instantanément vos données JSON sous forme de graphes *(je lui ai consacré un article : <Link to="/blog/json-crack">Rendering a JSON file as a mind map</Link>)*
- [Kroki](https://kroki.io/), crée des diagrammes à partir de descriptions textuelles
- [Mermaid](https://mermaid-js.github.io/mermaid/), son [éditeur en ligne](https://mermaid.live/), l'[extension de prévisualisation pour vscode](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview) et l'[outil de conversion en ligne de commande](https://github.com/mermaid-js/mermaid-cli)
- [Nomnoml](https://www.nomnoml.com/), un outil pour dessiner des diagrammes UML avec une syntaxe simple
- [Pikchr](https://pikchr.org/), Pikchr (prononcez « picture ») est un langage de balisage à la PIC pour les diagrammes dans la documentation technique
- [Plantuml](https://github.com/plantuml/plantuml), génère des diagrammes à partir d'une description textuelle
- [Sequence diagram](https://sequencediagram.org/) *(semble basé sur Mermaid)*
- [Structurizr](https://github.com/structurizr/dsl), une façon de créer des modèles d'architecture logicielle Structurizr basés sur le modèle C4, via un langage dédié textuel
- [svgbob](https://github.com/ivanceras/svgbob), transforme vos gribouillis de diagrammes ASCII en jolis petits SVG
- [Vega](https://vega.github.io/vega/), une grammaire de visualisation
- [yEd Graph Editor](https://www.yworks.com/products/yed), une interface graphique : il faut glisser-déposer des objets et les redimensionner. Il ne gère pas les fichiers texte comme les autres outils cités ici.

## Conclusion {#conclusion}

Des diagrammes d'architecture qui vivent dans votre repository, que vous pouvez differ et relire comme n'importe quel autre fichier, et qui n'exigent jamais Python ni Graphviz sur votre machine. La prochaine fois que l'infrastructure change, vous modifiez une ligne de texte au lieu de déplacer une boîte à la souris.

Si vous préférez rester sur une syntaxe que vous connaissez déjà, <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link> fait la même chose avec Mermaid.
