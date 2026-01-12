"""
OpenAPI Configuration Helper.

This module isolates the logic required to customize the generated OpenAPI (Swagger)
schema (i.e. the "openapi.json" file).

It specifically handles:
1. Removal of redundant 'title' fields (Rule: oas-descr).
2. Renaming schemas to strict CamelCase (e.g. HTTPValidationError -> HttpValidationError).
3. Converting Operation IDs to camelCase (Rule: openapi-opid).

This allows 'main.py' to remain clean while satisfying strict linters like Belgif.
"""

import re
from typing import Any, cast

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

# Define a recursive type for JSON schemas to fix strict typing issues.
type JsonNode = dict[str, Any] | list[Any] | Any


def _remove_titles(schema: Any) -> None:
    """
    Recursively removes the 'title' key from a JSON-like schema dictionary.
    """
    if isinstance(schema, dict):
        # Explicit cast to silence linter warnings about unknown keys
        s_dict: dict[str, Any] = cast(dict[str, Any], schema)

        s_dict.pop("title", None)

        for value in s_dict.values():
            _remove_titles(value)

    elif isinstance(schema, list):
        for item in schema:
            _remove_titles(item)


def _to_camel_case(snake_str: str) -> str:
    """Converts snake_case to lowerCamelCase."""
    components: list[str] = snake_str.split("_")
    # We capitalize the first letter of each component except the first one
    return components[0] + "".join(x.title() for x in components[1:])


def _update_refs(item: Any, old_ref: str, new_ref: str) -> None:
    """
    Recursively updates $ref strings in the schema.

    Used when a schema component is renamed.
    """
    if isinstance(item, dict):
        s_dict: dict[str, Any] = cast(dict[str, Any], item)

        # If this node is a reference to the old name, update it
        if s_dict.get("$ref") == old_ref:
            s_dict["$ref"] = new_ref
            return

        for value in s_dict.values():
            _update_refs(value, old_ref, new_ref)

    elif isinstance(item, list):
        for sub_item in item:
            _update_refs(sub_item, old_ref, new_ref)


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


def configure_custom_openapi(app: FastAPI) -> None:
    """
    Overrides the default OpenAPI generator to apply Belgif compliance fixes.

    Args:
        app: The FastAPI application instance to configure.
    """

    def custom_openapi() -> dict[str, Any]:
        if app.openapi_schema:
            return app.openapi_schema

        # 1. Generate the default OpenAPI schema
        openapi_schema: dict[str, Any] = get_openapi(
            title=app.title,
            version=app.version,
            description=app.description,
            openapi_version=app.openapi_version,
            routes=app.routes,
            tags=app.openapi_tags,
        )

        # 2. Fix 1: Remove Titles (Clutter reduction) (belgif [oas-descr])
        if "components" in openapi_schema and "schemas" in openapi_schema["components"]:
            for schema in openapi_schema["components"]["schemas"].values():
                _remove_titles(schema)

        # 3. Fix 2: Rename Schemas (Naming conventions) (belgif [oas-comp])
        _fix_schema_names(openapi_schema)

        # 4. Fix 3: Operation IDs (snake_case -> camelCase) (belgif [openapi-opid])
        _fix_operation_ids(openapi_schema)

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    # Assign the custom function to the app instance
    app.openapi = custom_openapi  # type: ignore[method-assign]
