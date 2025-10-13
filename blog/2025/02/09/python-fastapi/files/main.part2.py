app = FastAPI()

@app.get("/")
def read_root():
    # highlight-next-line
    return {"Hello": "Belgium!"}
