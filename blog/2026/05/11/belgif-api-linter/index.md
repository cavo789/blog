---
slug: belgif-api-linter
title: Validate your OpenAPI schema against the Belgif REST standards
authors: [christophe]
series: code quality
mainTag: api
tags:
  - api
  - code-quality
  - docker
  - python
image: /img/v2/belgif.webp
description: "Validate your FastAPI OpenAPI schema against the Belgif REST standards using Docker, with step-by-step fixes for the most common linting errors."
date: 2026-05-11
blueskyRecordKey: 3mlkngj2bp225
---

![Validate your OpenAPI schema against the Belgif REST standards](/img/v2/belgif.webp)

<TLDR>This post offers a practical guide to ensuring your FastAPI applications comply with the Belgif REST standards, a strict set of guidelines required for Belgian public sector APIs. Because FastAPI's default OpenAPI schema generation often conflicts with these rules, the author demonstrates how to set up the official Belgif linter inside an isolated Docker container to easily identify compliance errors. Furthermore, the article provides actionable, step-by-step solutions and custom Python helper functions to resolve common FastAPI linting violations—such as downgrading the OpenAPI version, removing redundant title properties, and fixing camelCase naming conventions—ensuring your API documentation passes validation smoothly.</TLDR>

Building APIs is relatively easy, but building *compliant* and *interoperable* APIs is an entirely different challenge. If you are working on projects for the Belgian government or public sector, you have likely encountered the **[Belgif REST standards](https://www.belgif.be/specification/rest/api-guide/)**. These comprehensive guidelines ensure that APIs across various institutions remain consistent, predictable, and easy to consume.

While modern frameworks like **FastAPI** are fantastic for rapidly building APIs and automatically generating OpenAPI documentation, their default schema generation doesn't always align perfectly with Belgif's strict linting rules.

In this article, we'll explore how to use the official Belgif OpenAPI linter via Docker and how to validate your FastAPI application against some potential errors. More importantly, we'll walk through practical, step-by-step solutions to resolve the most common linting errors caused by FastAPI's default behaviors, ensuring your API gets a clean bill of health.

*Before we dive in, if you are looking for general advice on designing robust APIs, check out my previous article:* <Link to="/blog/php-api-tips">API REST - How to write good APIs</Link>.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Seeing the Linter Run", to: "#seeing-the-linter-run" },
    { label: "Installation — Create a dummy application", to: "#installation--create-a-dummy-application" },
  ]}
/>

## Seeing the Linter Run

<Vars port="8000" labels={{ port: "Host port" }} />

Once the `belgif-lint` container is in place (covered under Installation below), checking an `openapi.json` file is two commands:

<Terminal typewriter wrap={true} source="./files/terminal-openapi.txt" />

<Terminal typewriter wrap={true}>
$ docker compose run --rm belgif-lint
</Terminal>

It'll produce something like this:

<Snippet source="./files/result.txt" />

<AlertBox variant="note" title="Please refer to the official site">
From now on, please refer to [https://www.belgif.be/specification/rest/api-guide](https://www.belgif.be/specification/rest/api-guide) to learn how to manage errors reported by the tool.
</AlertBox>

<Details label="Bonus - Get rid of Belgif intern warnings">

While running the Belgif linter, you may encounter a lot of warnings like below:

<Snippet filename="warnings.txt" source="./files/warnings.txt" />

The warnings are about the linter itself (in fact, comes from a tool called `Drools`) and thus **they have nothing to do with your code**. It's just visual pollution for us; the only thing we can do is to hide them.

Look at the new file below:

<Snippet filename="compose.yaml" source="./files/compose_belgif_no_warnings.yaml" />

In short, we'll run a custom command where we'll collect both STDERR and STDOUT in just one output stream then we'll run a few `grep` commands to purge specific messages from the output (the ones we can't solve).

</Details>

## Belgif standards

[Belgif REST standards](https://github.com/belgif/rest-guide-validator) are defined in [https://www.belgif.be/specification/rest/api-guide/](https://www.belgif.be/specification/rest/api-guide/) and *is a collaborative effort by several Belgian government institutions, originally under the G-Cloud umbrella, before moving to Belgif, the Belgian Interoperability Framework. Its goal is to improve compatibility between RESTful services offered by government institutions or any other organization adopting these guidelines.*

If you want to check if your API is compliant, you can use the [belgif-rest-guide-validator](https://github.com/belgif/rest-guide-validator) as documented in the [Tools](https://www.belgif.be/specification/rest/api-guide/#openapi-tools) section.

## Installation — Create a dummy application

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

- A root endpoint `/` that returns a simple JSON.
- An endpoint `/items/{item_id}` that accepts an integer `item_id` as a path parameter and an optional string query parameter `q`.
- An endpoint `/items/` that accepts `skip` and `limit` query parameters for pagination.

To run it, simply start `docker compose up --build -d` in your terminal:

<Terminal typewriter wrap={true}>
$ docker compose up --build -d
</Terminal>

Then surf to `http://localhost:`<Var name="port">8000</Var>`/docs` to see your application running.

You can test it using `curl` or your browser:

1.  **Root endpoint:**

    <Terminal typewriter wrap={true} source="./files/terminal-root.txt" />

    You should see: `{"Hello":"World"}`

2.  **Item with path and query parameter:**

    <Terminal typewriter wrap={true} source="./files/terminal-item.txt" />

    You should see: `{"item_id":5,"q":"somequery"}`

3.  **Items with pagination:**

    <Terminal typewriter wrap={true} source="./files/terminal-pagination.txt" />

    You should see: `{"skip":0,"limit":20}`

## Adding the Belgif Linter

An easy way to do this is by using a Docker container. In the code sample below, take a look at the newer version of `compose.yaml`, we've added a new service called `belgif-lint` based on `maven`.

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

Once you've fired `docker compose up --build -d` again to create the `belgif-lint` container, you're ready to run the check shown at the top of this article — you just need an `openapi.json` file on disk first, which is exactly what the first command up there produces.

## FastAPI tips

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

If you get the `[MANDATORY]    [oas-comp]   Component names SHOULD use UpperCamelCase notation. For abbreviations as well, all letters except the first one should be lowercased.` error, you'll need to add a rename function to update e.g. `HTTPValidationError` to `HttpValidationError`.

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

The message `[MANDATORY]    [openapi-opid] A unique operationId MUST be specified on each operation. It SHOULD have a lowerCamelCase value following common programming naming conventions for method (function) names.` notifies you about the use of a wrong syntax.

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

The `main.py` file illustrates how to call the helper.

<Snippet filename="main.py" source="./files/main_configure.py" />

<Snippet filename="helpers/openapi.py" source="./files/main_helper.py" />

## Conclusion

FastAPI gets you a working OpenAPI schema for free, but "working" and "Belgif-compliant" are two different bars — the linter above is what closes that gap, and the fixes in this article cover the specific violations FastAPI's defaults trigger most often (tags, the OpenAPI version, `title` properties, naming conventions). Run `belgif-lint` before you ship, not after a reviewer flags it.

If you're still shaping the API itself rather than validating it, <Link to="/blog/php-api-tips">API REST - How to write good APIs</Link> is the article to read first.
