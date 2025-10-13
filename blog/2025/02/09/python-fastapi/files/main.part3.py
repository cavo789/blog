// highlight-next-line
from random import choice
from fastapi import FastAPI

app = FastAPI()

// highlight-start
jokes = [
    "Why do programmers always mix up Halloween and Christmas? Because Oct 31 == Dec 25",
    "Why don't programmers like nature? Because it's full of bugs!",
    "How many programmers does it take to change a light bulb? None. That's a hardware problem.",
    "What do you call 8 hobbits? A hobbyte",
    "What is this [“hip”, ”hip”]? hip hip array!"
]

@app.get("/jokes")
async def get_jokes():
    """
    Returns a random joke from the list.
    """
    return {"joke": choice(jokes)}

@app.get("/jokes/{joke_id}")
def read_item(joke_id: int):
    """
    Returns a specific joke (between 0 and 4).
    """
    try:
        return {"joke": jokes[joke_id]}
    except IndexError:
        return {"error": f"Joke with ID {joke_id} not found."}, 404
// highlight-end
