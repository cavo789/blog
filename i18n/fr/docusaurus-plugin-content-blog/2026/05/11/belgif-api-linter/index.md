---
slug: belgif-api-linter
title: Validez votre schéma OpenAPI face aux standards REST Belgif
authors: [christophe]
series: code quality
mainTag: api
tags:
  - api
  - code-quality
  - docker
  - python
image: /img/v2/belgif.webp
description: "Validez le schéma OpenAPI de votre FastAPI face aux standards REST Belgif avec Docker, avec des corrections pas à pas pour les erreurs de linting les plus courantes."
date: 2026-05-11
blueskyRecordKey: 3mlkngj2bp225
---

![Validez votre schéma OpenAPI face aux standards REST Belgif](/img/v2/belgif.webp)

<TLDR>Cet article est un guide pratique pour rendre vos applications FastAPI conformes aux standards REST Belgif, un ensemble de règles strictes imposé aux API du secteur public belge. Comme la génération par défaut du schéma OpenAPI de FastAPI entre souvent en conflit avec ces règles, l'auteur montre comment mettre en place le linter officiel Belgif dans un container Docker isolé pour repérer facilement les erreurs de conformité. L'article fournit aussi des solutions concrètes, pas à pas, et des fonctions Python utilitaires pour résoudre les violations les plus fréquentes — rétrograder la version d'OpenAPI, supprimer les propriétés `title` redondantes, corriger les conventions de nommage camelCase — afin que la documentation de votre API passe la validation sans accroc.</TLDR>

Construire des API est relativement facile, mais construire des API *conformes* et *interopérables* est un tout autre défi. Si vous travaillez sur des projets pour le gouvernement belge ou le secteur public, vous avez probablement déjà croisé les **[standards REST Belgif](https://www.belgif.be/specification/rest/api-guide/)**. Ces directives complètes garantissent que les API des différentes institutions restent cohérentes, prévisibles et faciles à consommer.

Les frameworks modernes comme **FastAPI** sont excellents pour construire rapidement des API et générer automatiquement la documentation OpenAPI, mais leur génération de schéma par défaut ne colle pas toujours parfaitement aux règles de linting strictes de Belgif.

Dans cet article, nous allons voir comment utiliser le linter OpenAPI officiel de Belgif via Docker et comment valider votre application FastAPI face à quelques erreurs potentielles. Plus important encore, nous allons parcourir des solutions pratiques, pas à pas, pour résoudre les erreurs de linting les plus courantes causées par les comportements par défaut de FastAPI, afin que votre API obtienne un certificat de bonne santé.

*Avant d'entrer dans le vif du sujet, si vous cherchez des conseils généraux sur la conception d'API robustes, jetez un œil à mon article précédent :* <Link to="/blog/php-api-tips">API REST - How to write good APIs</Link>.

<!-- truncate -->

<QuickJump
  links={[
    { label: "Le linter en action", to: "#seeing-the-linter-run" },
    { label: "Installation — Créer une application bidon", to: "#installation--create-a-dummy-application" },
  ]}
/>

## Le linter en action {#seeing-the-linter-run}

<Vars port="8000" labels={{ port: "Port de l'host" }} />

Une fois le container `belgif-lint` en place (voir la section Installation ci-dessous), vérifier un fichier `openapi.json` tient en deux commandes :

<Terminal typewriter wrap={true} source="./files/terminal-openapi.txt" />

<Terminal typewriter wrap={true}>
$ docker compose run --rm belgif-lint
</Terminal>

Cela produira quelque chose comme ceci :

<Snippet source="./files/result.txt" />

<AlertBox variant="note" title="Référez-vous au site officiel">
À partir de maintenant, référez-vous à [https://www.belgif.be/specification/rest/api-guide](https://www.belgif.be/specification/rest/api-guide) pour apprendre à gérer les erreurs signalées par l'outil.
</AlertBox>

<Details label="Bonus - Se débarrasser des warnings internes de Belgif">

En exécutant le linter Belgif, vous allez peut-être rencontrer de nombreux warnings comme ceux-ci :

<Snippet filename="warnings.txt" source="./files/warnings.txt" />

Ces warnings concernent le linter lui-même (ils viennent en fait d'un outil appelé `Drools`) et donc **ils n'ont rien à voir avec votre code**. C'est juste de la pollution visuelle pour nous ; la seule chose que nous pouvons faire, c'est les masquer.

Regardez le nouveau fichier ci-dessous :

<Snippet filename="compose.yaml" source="./files/compose_belgif_no_warnings.yaml" />

En résumé, nous allons lancer une commande personnalisée où nous récupérons STDERR et STDOUT dans un seul stream de sortie, puis nous exécutons quelques commandes `grep` pour purger certains messages de la sortie (ceux que nous ne pouvons pas résoudre).

</Details>

## Les standards Belgif {#belgif-standards}

Les [standards REST Belgif](https://github.com/belgif/rest-guide-validator) sont définis sur [https://www.belgif.be/specification/rest/api-guide/](https://www.belgif.be/specification/rest/api-guide/) et constituent *un effort collaboratif de plusieurs institutions gouvernementales belges, à l'origine sous l'égide du G-Cloud, avant de passer chez Belgif, le Belgian Interoperability Framework. Son objectif est d'améliorer la compatibilité entre les services RESTful proposés par les institutions publiques ou toute autre organisation adoptant ces directives.*

Si vous voulez vérifier si votre API est conforme, vous pouvez utiliser le [belgif-rest-guide-validator](https://github.com/belgif/rest-guide-validator) comme documenté dans la section [Tools](https://www.belgif.be/specification/rest/api-guide/#openapi-tools).

## Installation — Créer une application bidon {#installation--create-a-dummy-application}

Si vous n'en avez pas encore, cliquez simplement sur `Generate install script` ci-dessous et collez la ligne de commande dans un terminal, puis appuyez sur la touche <kbd>Enter</kbd> pour créer la structure du projet dans un dossier `/tmp/fastapi` sur votre disque.

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

Le code de `main.py` définit :

- Un endpoint racine `/` qui retourne un simple JSON.
- Un endpoint `/items/{item_id}` qui accepte un entier `item_id` comme paramètre de path et un paramètre de query optionnel `q` de type chaîne.
- Un endpoint `/items/` qui accepte les paramètres de query `skip` et `limit` pour la pagination.

Pour le lancer, exécutez simplement `docker compose up --build -d` dans votre terminal :

<Terminal typewriter wrap={true}>
$ docker compose up --build -d
</Terminal>

Rendez-vous ensuite sur `http://localhost:`<Var name="port">8000</Var>`/docs` pour voir votre application tourner.

Vous pouvez la tester avec `curl` ou votre navigateur :

1.  **Endpoint racine :**

    <Terminal typewriter wrap={true} source="./files/terminal-root.txt" />

    Vous devriez voir : `{"Hello":"World"}`

2.  **Item avec paramètre de path et de query :**

    <Terminal typewriter wrap={true} source="./files/terminal-item.txt" />

    Vous devriez voir : `{"item_id":5,"q":"somequery"}`

3.  **Items avec pagination :**

    <Terminal typewriter wrap={true} source="./files/terminal-pagination.txt" />

    Vous devriez voir : `{"skip":0,"limit":20}`

## Ajouter le linter Belgif {#adding-the-belgif-linter}

Le plus simple est d'utiliser un container Docker. Dans l'exemple de code ci-dessous, regardez la nouvelle version de `compose.yaml` : nous avons ajouté un service `belgif-lint` basé sur `maven`.

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

Une fois que vous avez relancé `docker compose up --build -d` pour créer le container `belgif-lint`, vous êtes prêt à lancer la vérification montrée en début d'article — il vous faut juste d'abord un fichier `openapi.json` sur le disque, ce que produit exactement la première commande là-haut.

## Astuces FastAPI {#fastapi-tips}

<AlertBox variant="important" title="Mon expérience personnelle">
En intégrant belgif dans un projet FastAPI, j'ai rencontré plusieurs erreurs de linting qui ont demandé du dépannage manuel. Le guide ci-dessous décrit la solution que j'ai mise au point pour les résoudre. **Notez que cette approche repose sur mes propres constats et peut différer des bonnes pratiques standard.**
</AlertBox>

### oas-tags - Gérer les tags {#oas-tags---managing-tags}

Vous obtiendrez l'erreur `[MANDATORY]    [oas-tags]   Each tag used on an operation SHOULD also be declared in the top level tags list of the OpenAPI document, with an optional description.` lorsque vous utilisez un ou plusieurs tags dans vos endpoints et que ces tags ne sont pas déclarés.

Pour résoudre ça, vous devez utiliser l'attribut `openapi_tags` comme illustré ci-dessous :

<Snippet filename="tags.py" source="./files/tags.py"  defaultOpen={true}/>

### oas-contra - N'utilisez pas encore OpenAPI 3.1 {#oas-contra---dont-use-openapi-31-yet}

Si vous obtenez `[MANDATORY]    [oas-contra] OpenAPI 3.1 improves upon OpenAPI 3.0, but to avoid interoperability problems it SHOULD NOT be used yet because it is not yet widely supported by most tooling.`, vous pouvez régler cette erreur en rétrogradant la version d'OpenAPI utilisée par FastAPI comme ceci :

```python
app = FastAPI(
    # ...
    openapi_version="3.0.2", # belgif [oas-contra]
)
```

### oas-descr - La propriété title doit être supprimée {#oas-descr---title-property-has-to-be-removed}

Vous obtiendrez `[MANDATORY]    [oas-descr]  The title property of a Schema MUST NOT be used.` quand FastAPI génère à la fois une propriété `title` et une propriété `description` pour vos objets.

La solution est d'ajouter une fonction utilitaire et de supprimer le `title` (puisque `description` est toujours généré) :

Code partiel :

```python
if "components" in openapi_schema and "schemas" in openapi_schema["components"]:
    for schema in openapi_schema["components"]["schemas"].values():
        _remove_titles(schema)
```

Voir l'utilitaire fourni plus loin dans l'article.

### oas-comp - Les noms de composants doivent utiliser la notation UpperCamelCase {#oas-comp---component-names-should-use-uppercamelcase-notation}

Si vous obtenez l'erreur `[MANDATORY]    [oas-comp]   Component names SHOULD use UpperCamelCase notation. For abbreviations as well, all letters except the first one should be lowercased.`, vous devrez ajouter une fonction de renommage pour transformer par exemple `HTTPValidationError` en `HttpValidationError`.

Cela peut se faire par exemple comme ceci (code partiel) :

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

Voir l'utilitaire fourni plus loin dans l'article.

### openapi-opid - lowerCamelCase pour operationId {#openapi-opid---lowercamelcase-for-operationid}

Le message `[MANDATORY]    [openapi-opid] A unique operationId MUST be specified on each operation. It SHOULD have a lowerCamelCase value following common programming naming conventions for method (function) names.` vous signale l'utilisation d'une mauvaise syntaxe.

Code partiel :

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

### L'utilitaire openapi.py {#the-openapipy-helper}

L'utilitaire fourni ci-dessous peut vous aider à résoudre les erreurs `oas-descr` et `oas-comp`.

Le fichier `main.py` montre comment appeler cet utilitaire.

<Snippet filename="main.py" source="./files/main_configure.py" />

<Snippet filename="helpers/openapi.py" source="./files/main_helper.py" />

## Conclusion {#conclusion}

FastAPI vous offre gratuitement un schéma OpenAPI fonctionnel, mais « fonctionnel » et « conforme Belgif » sont deux niveaux d'exigence différents — le linter ci-dessus est ce qui comble l'écart, et les corrections de cet article couvrent les violations que les réglages par défaut de FastAPI déclenchent le plus souvent (les tags, la version d'OpenAPI, les propriétés `title`, les conventions de nommage). Lancez `belgif-lint` avant de livrer, pas après qu'un relecteur l'ait signalé.

Si vous êtes encore en train de concevoir l'API elle-même plutôt que de la valider, <Link to="/blog/php-api-tips">API REST - How to write good APIs</Link> est l'article à lire en premier.
