---
slug: python-pydot
title: Python - Generate flows using pydot
date: 2024-12-18
description: Use Python and the pydot library to easily generate diagrams-as-code like ETL flowcharts, class diagrams, and decision trees. Includes Docker setup and code examples.
authors: [christophe]
image: /img/v2/diagrams.webp
mainTag: python
tags: [docker, python, visualisation]
language: en
---
<!-- cspell:ignore Pydot,PYTHONDONTWRITEBYTECODE,hadolint,rankdir,fillcolor -->

![Python - Generate flows using Pydot](/img/v2/diagrams.webp)

[Pydot](https://github.com/pydot/pydot) is a **diagram as code** generator i.e. you write lines of code and thanks to a magic process, you can render the code as an image.

For guys just like me who are terrible at visuals, this is gold.

Let's say you have to describe an IT process such as ETL (data is loaded, one or other transformation rule is applied and the result is loaded into a database, for example), you can easily imagine to draw some rectangles using a tool like [https://app.diagrams.net/](https://app.diagrams.net/) (formerly known as draw.io) or use a smarter way to do it.

Let's see how in this article.

<!-- truncate -->

Pydot can generate an image like the one below:

![ETL](./images/etl.png)

First, we'll need a Python Docker container. Please create a file called `Dockerfile` with this content:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

And create the image by running `docker build --tag pydot .`.

We don't need more except ... our flow.

To build an ETL image like the one above, please create a new file called f.i. `etl.py` with this content:

<Snippet filename="etl.py" source="./files/etl.py" />

And, now, the easy part, render the Python `etl.py` file as an image by running `docker run --rm -it -v "${PWD}":/diagram -w /diagram pydot python etl.py`.

And bingo, you've now an image called `etl.png` in your directory.

## Some other examples

Search on the Internet for some examples and you'll find f.i. this site: [https://graphviz.readthedocs.io/en/stable/examples.html](https://graphviz.readthedocs.io/en/stable/examples.html).

You'll find there Python examples and, too, the rendered image.

### OOP classes

<Snippet filename="class_diagram.py" source="./files/class_diagram.py" />

![Class diagram](./images/class_diagram.png)

### Data flow

<Snippet filename="data_flow.py" source="./files/data_flow.py" />

![Data flow](./images/data_flow_diagram.png)

### Decision flow

<Snippet filename="decision_flow.py" source="./files/decision_flow.py" />

![Decision flow](./images/decision_flow.png)

### Decision tree

<Snippet filename="decision_tree.py" source="./files/decision_tree.py" />

![Decision tree](./images/decision_tree.png)
