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
<<<<<<< Updated upstream
=======

## Bonus - Get rid of Belgif intern warnings

While running the Belgif linter, you may encounter a lot of warnings like below:

<Snippet filename="warnings.txt" source="./files/warnings.txt" />

The warnings are about the linter itself (in fact, comes from a tool called `Drools`) and thus **they have nothing to do with your code**.  It's just visual pollution for us; the only thing we can do is to hide them.

Look at the new file below:

<Snippet filename="compose.yaml" source="./files/compose_belgif_no_warnings.yaml" />

In short, we'll run a custom command where we'll collect both STDERR and STDIN in just one output stream then we'll run a few `grep` commands to expurge the output for specific messages (the ones we can't solve).

## Bonus - FastAPI tips

<AlertBox variant="important" title="My own experience">
When integrating belgif into a FastAPI project, I encountered several linting errors that required manual troubleshooting. The guide below outlines the solution I developed to resolve these issues. **Please note that this approach is based on my personal findings and may differ from standard best practices.**
</AlertBox>

### oas-tags - Managing tags

You'll get the `[MANDATORY]    [oas-tags]   Each tag used on an operation SHOULD also be declared in the top level tags list of the OpenAPI document, with an optional description.` error when you're using one or more tags in your endpoints and if these tags are not declared.

To solve this, you've to use the `openapi_tags` attribute like illustrated below:

<Snippet filename="tags.py" source="./files/tags.py"  defaultOpen={true}/>

### oas-contra - Don't use OpenAPI 3.1 yet

If you get `[MANDATORY]    [oas-contra] OpenAPI 3.1 improves upon OpenAPI 3.0, but to avoid interoperability problems it SHOULD NOT be used yet because it is not yet widely supported by most tooling.`, you can address this error by downgrading the OpenAPI version used by FastAPI like this:

```python
app = FastAPI(
    # ...
    openapi_version="3.0.2", # belgif [oas-contra]
)
```

### oas-descr - Title property has to be removed

You'll get the `[MANDATORY]    [oas-descr]  The title property of a Schema MUST NOT be used.` when FastAPI will generate both a `title` and a `description` property for your objects.

The solution is to add a helper function and remove the `title` (since `description` is always generated):

Partial code:

```python
if "components" in openapi_schema and "schemas" in openapi_schema["components"]:
    for schema in openapi_schema["components"]["schemas"].values():
        _remove_titles(schema)
```

See the helper provided later on in the post.

### oas-comp - Component names SHOULD use UpperCamelCase notation

If you get the `[MANDATORY]    [oas-comp]   Component names SHOULD use UpperCamelCase notation. For abbreviations as well, all letters except the first one should be lowercased.` error, you'll need to foresee a rename function to update f.i. `HTTPValidationError` to `httpValidationError`.

It can be done f.i. like this (partial code):

```python
def _fix_schema_names(openapi_schema: dict[str, Any]) -> None:
    """
    Renames schemas that violate Belgif's naming conventions.

    Specifically targets 'HTTPValidationError' (abbreviations must be camel-cased
    like 'Http', not 'HTTP').
    """
    components: Any = openapi_schema.get("components", {})
    schemas: Any = components.get("schemas", {})

    # Fix: HTTPValidationError -> HttpValidationError
    if "HTTPValidationError" in schemas:
        # 1. Move the definition to the new key
        schemas["HttpValidationError"] = schemas.pop("HTTPValidationError")

        # 2. Update all references ($ref) in the entire document to point to the new key
        _update_refs(
            openapi_schema, "#/components/schemas/HTTPValidationError", "#/components/schemas/HttpValidationError"
        )
```

See the helper provided later on in the post.

### openapi-opid - lowerCamelCase for operationId

The message `[MANDATORY]    [openapi-opid] A unique operationId MUST be specified on each operation. It SHOULD have a lowerCamelCase value following common programming naming conventions for method (function) names.` notify you about the use of a wrong syntax.

Partial code:

```python
def _fix_operation_ids(openapi_schema: dict[str, Any]) -> None:
    """
    Iterates over all paths and converts snake_case operationIds to camelCase.
    """
    paths: Any = openapi_schema.get("paths", {})

    for path_item in paths.values():
        for operation in path_item.values():
            if isinstance(operation, dict) and "operationId" in operation:
                old_id: str = cast(str, operation["operationId"])
                operation["operationId"] = _to_camel_case(old_id)
```

### The openapi.py helper

The helper provided below can help you to solve `oas-descr` and `oas-comp` errors.

The `main.py` file illustrate how to call it the helper.

<Snippet filename="main.py" source="./files/main_configure.py" />

<Snippet filename="helpers/openapi.py" source="./files/main_helper.py" />
>>>>>>> Stashed changes
