---
slug: python-pydot
title: Python - Générer des flux avec pydot
date: 2024-12-18
description: Utilisez Python et la bibliothèque pydot pour générer facilement des diagrams-as-code comme des flowcharts ETL, des diagrammes de classes et des arbres de décision. Avec installation Docker et exemples de code.
authors: [christophe]
image: /img/v2/diagrams.webp
series: Diagrams as code
mainTag: python
tags:
  - doc-as-code
  - docker
  - python
language: fr
review_date: 2026-07-30
---
<!-- cspell:ignore Pydot,PYTHONDONTWRITEBYTECODE,hadolint,rankdir,fillcolor -->

![Python - Générer des flux avec Pydot](/img/v2/diagrams.webp)

<TLDR>
Cet article présente Pydot, une bibliothèque Python de diagram-as-code qui transforme du code Python en images (flux ETL, diagrammes de classes, flux de données, arbres de décision). À l'aide d'une petite image Docker, un script `.py` décrivant le diagramme est exécuté avec `docker run ... python etl.py` pour produire un PNG. D'autres exemples proviennent de la documentation Graphviz.
</TLDR>

[Pydot](https://github.com/pydot/pydot) est un générateur **diagram-as-code** : vous écrivez des lignes de code et, grâce à un processus magique, vous pouvez restituer ce code sous forme d'image.

*Ce blog contient deux autres articles de la même famille : <Link to="/blog/docker-diagram-as-code">Docker - Diagrams as code</Link>, qui utilise la bibliothèque `diagrams` et ses icônes de fournisseurs cloud, et <Link to="/blog/docker-python-mermaid">Documentation as Code - Transform Your Infrastructure into Beautiful Diagrams with Python and Mermaid</Link>, où le diagramme est généré **depuis** votre `compose.yaml` au lieu d'être écrit à la main.*

Pour les gens comme moi, catastrophiques dès qu'il s'agit de visuel, c'est de l'or en barre.

Imaginons que vous deviez décrire un processus informatique comme un ETL (les données sont chargées, telle ou telle règle de transformation est appliquée et le résultat est chargé dans une base de données, par exemple). Vous vous voyez déjà dessiner des rectangles avec un outil comme [https://app.diagrams.net/](https://app.diagrams.net/) (anciennement draw.io), ou vous pouvez opter pour une méthode plus intelligente.

Voyons comment dans cet article.

<!-- truncate -->

Pydot peut générer une image comme celle ci-dessous :

![ETL](./images/etl.webp)

D'abord, il nous faut un container Docker Python. Créez un fichier appelé `Dockerfile` avec ce contenu :

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

Et créez l'image en lançant `docker build --tag pydot .`.

Rien de plus n'est nécessaire, sauf... notre flux.

Pour construire une image ETL comme celle ci-dessus, créez un nouveau fichier appelé par exemple `etl.py` avec ce contenu :

<Snippet filename="etl.py" source="./files/etl.py" />

Et maintenant, la partie facile : transformez le fichier Python `etl.py` en image en lançant `docker run --rm -it -v "${PWD}":/diagram -w /diagram pydot python etl.py`.

Et bingo, vous avez maintenant une image appelée `etl.png` dans votre répertoire.

## Quelques autres exemples {#some-other-examples}

Cherchez des exemples sur Internet et vous tomberez par exemple sur ce site : [https://graphviz.readthedocs.io/en/stable/examples.html](https://graphviz.readthedocs.io/en/stable/examples.html).

Vous y trouverez des exemples Python et, en plus, l'image rendue.

### Classes POO {#oop-classes}

<Snippet filename="class_diagram.py" source="./files/class_diagram.py" />

![Diagramme de classes](./images/class_diagram.webp)

### Flux de données {#data-flow}

<Snippet filename="data_flow.py" source="./files/data_flow.py" />

![Flux de données](./images/data_flow_diagram.webp)

### Flux de décision {#decision-flow}

<Snippet filename="decision_flow.py" source="./files/decision_flow.py" />

![Flux de décision](./images/decision_flow.webp)

### Arbre de décision {#decision-tree}

<Snippet filename="decision_tree.py" source="./files/decision_tree.py" />

![Arbre de décision](./images/decision_tree.webp)
