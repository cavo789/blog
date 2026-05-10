
# Define the metadata for your tags
tags_metadata: list[dict[str, str]] = [
    {
        "name": "Retrieving data",
        "description": "Operations related to fetching and querying data.",
    },
    {
        "name": "Healthcheck",
        "description": "Endpoints to monitor the health status of the application.",
    },
]

app = FastAPI(
    # ...
    openapi_tags=tags_metadata,  # belgif [oas-tags]
    # ...
)
