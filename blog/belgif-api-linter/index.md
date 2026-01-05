---
slug: belgif-api-linter
title: Validate your OpenAPI schema against the Belgif REST standards
authors: [christophe]
mainTag: api
tags: [api, code-quality, docker, fastapi, rest, belgif, openapi]
image: /img/v2/belgif.webp
description: "Use VS Code Remote - SSH: connect to production servers, and edit/execute remotely while avoiding common pitfalls."
date: 2026-12-31
draft: true
blueskyRecordKey:
---

![Validate your OpenAPI schema against the Belgif REST standards](/img/v2/belgif.webp)

A RETRAVAILLER... L'OBJECTIF EST D'EXPLIQUER COMMENT LANCER UN LINT BELGIF

AJOUTER UN LIEN VERS L'ARTICLE A PROPOS DE FASTAPI QUE J'AI DEJA ECRIT.


<Link to="/blog/php-api-tips">API REST - How to write good APIs</Link>

<!-- truncate -->

For this blog post, we'll suppose you already have an OpenAPI compatible application. Such applications are documented using an Open API json file; often called `opendata.json` or `openapi.json`.

## Create a dummy application

If you don't have one yet, just click on the `Generate install script` below and paste the CLI into a terminal then press the <kbd>Enter</kbd> key to create the project structure in a `/tmp/fastapi` folder on your disk.

<ProjectSetup folderName="/tmp/fastapi" createFolder={true} >
  <Guideline>
    Now, please run 'docker compose up --build -d' to
    create your API website. Wait a few and open your browser, surf to
    http://localhost:8000/docs to open your site and see your API OpenData documentation.
  </Guideline>
  <Snippet filename="main.py" source="./files/main.py" />
  <Snippet filename="compose.yaml" source="./files/compose.yaml" />
  <Snippet filename="Dockerfile" source="./files/Dockerfile" />
</ProjectSetup>

The `main.py` code defines:

* A root endpoint `/` that returns a simple JSON.
* An endpoint `/items/{item_id}` that accepts an integer `item_id` as a path parameter and an optional string query parameter `q`. [2, 3, 6]
* An endpoint `/items/` that accepts `skip` and `limit` query parameters for pagination. [1, 7, 18]

To run it, simply start `docker compose up --build -d` in your terminal:

<Terminal wrap={true}>
$ docker compose up --build -d
</Terminal>

Then surf to `http://localhost:8000/docs` to see your application running.

You can test it using `curl` or your browser:

1.  **Root endpoint:**

    ```bash
    curl http://localhost:8000/
    ```

    You should see: `{"Hello":"World"}`

2.  **Item with path and query parameter:**

    ```bash
    curl "http://localhost:8000/items/5?q=somequery"
    ```

    You should see: `{"item_id":5,"q":"somequery"}`

3.  **Items with pagination:**

    ```bash
    curl "http://localhost:8000/items/?skip=0&limit=20"
    ```

    You should see: `{"skip":0,"limit":20}`

## Belgif standards

[Belgif REST standards](https://github.com/belgif/rest-guide-validator) are defined in [https://www.belgif.be/specification/rest/api-guide/](https://www.belgif.be/specification/rest/api-guide/) and *is a collaborative effort by several Belgian government institutions, originally under the G-Cloud umbrella, before moving to Belgif, the Belgian Interoperability Framework. Its goal is to improve compatibility between RESTful services offered by government institutions or any other organization adopting these guidelines.*

If you want to check if your API is compliant, you can use the [belgif-rest-guide-validator](https://github.com/belgif/rest-guide-validator) as documented in the [Tools](https://www.belgif.be/specification/rest/api-guide/#openapi-tools) section.

An easy way to do this is by using a Docker container. In the code sample below, take a look to the newer version of `compose.yaml`, we've added a new service called `belgif-lint` based on `maven`.

<ProjectSetup folderName="/tmp/fastapi" createFolder={true} >
  <Guideline>
    Now, please run 'docker compose up --build -d' to
    create your API website. Wait a few and open your browser, surf to
    http://localhost:8000/docs to open your site.
  </Guideline>
  <Snippet filename="main.py" source="./files/main.py" />
  <Snippet filename="compose.yaml" source="./files/compose_belgif.yaml" />
  <Snippet filename="Dockerfile" source="./files/Dockerfile" />
</ProjectSetup>

Once you've fired `docker compose up --build -d` again to create the `belgif-lint` container, you're almost ready to use it but first, you need to make sure you've a `openapi.json` file on your disk. So let's create it by running the following command:

<Terminal wrap={true}>
$ curl -s http://localhost:8000/openapi.json > openapi.json
</Terminal>

We've now everything to run the check:

<Terminal wrap={true}>
$ docker compose run --rm belgif-lint
</Terminal>

It'll produce something like this:

<Snippet source="./files/result.txt" />

<AlertBox variant="note" title="Please refer to the official site">
From now on, please refer to [https://www.belgif.be/specification/rest/api-guide](https://www.belgif.be/specification/rest/api-guide) to learn how to manage errors reported by the tool.
</AlertBox>
