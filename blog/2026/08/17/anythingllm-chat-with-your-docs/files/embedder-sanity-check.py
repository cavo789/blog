#!/usr/bin/env python3
"""Prove an Ollama embedding model separates related text from unrelated text.

    python3 embedder-sanity-check.py mxbai-embed-large nomic-embed-text
"""

import json
import math
import sys
import urllib.request

OLLAMA = "http://localhost:11434/api/embed"

# The first two sentences say the same thing; the third is unrelated.
SENTENCES = [
    "Installing WordPress using Docker containers",
    "WordPress installation with Docker",
    "Powerlevel10k is a theme for the zsh shell",
]


def embed(texts, model):
    payload = json.dumps({"model": model, "input": texts}).encode()
    request = urllib.request.Request(
        OLLAMA, data=payload, headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(request, timeout=300) as response:
        return json.loads(response.read())["embeddings"]


def cosine(a, b):
    dot = sum(x * y for x, y in zip(a, b))
    return dot / (math.sqrt(sum(x * x for x in a)) * math.sqrt(sum(y * y for y in b)))


for model in sys.argv[1:] or ["mxbai-embed-large"]:
    vectors = embed(SENTENCES, model)
    related = cosine(vectors[0], vectors[1])
    unrelated = cosine(vectors[0], vectors[2])
    print(
        f"{model:<20} dims={len(vectors[0]):<5}"
        f" related={related:.4f}  unrelated={unrelated:.4f}"
        f"  separation={related - unrelated:+.4f}"
    )
