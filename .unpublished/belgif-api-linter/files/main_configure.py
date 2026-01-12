from helpers.openapi import configure_custom_openapi

# Your code...

app = FastAPI(
    # ...
)

# Call the helper and pass the FastAPI object

configure_custom_openapi(app)
