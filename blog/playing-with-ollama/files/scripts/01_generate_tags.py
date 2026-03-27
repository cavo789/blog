import json
import os
import requests

from tqdm import tqdm

# --- Configuration ---
OLLAMA_API_URL = "http://ollama:11434/api/generate"
MODEL_NAME = "llama3:8b"

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

OUTPUT_DIR = os.path.join(BASE_DIR, "output")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "all_articles_with_tags.json")

POSTS_DIRECTORY = os.path.join(BASE_DIR, "data/posts")

def get_tags_for_article(filepath):
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        prompt = f"""Analyze this blog post and return EXACTLY this JSON format: {{"tags": ["tag1", "tag2"]}}

        --- CONTENT ---
        {content}
        """

        payload = {
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
            "format": "json"
        }

        response = requests.post(OLLAMA_API_URL, json=payload)
        response.raise_for_status()

        data = response.json()
        raw_response = data.get("response", "")

        # Parse the JSON returned by the model
        tags_data = json.loads(raw_response)

        # Look for "tags" either at the root or within a nested key
        if "tags" in tags_data:
            return tags_data["tags"]
        elif "response" in tags_data:
            return tags_data["response"].get("tags", [])
        else:
            print(f"\nUnexpected JSON structure for {os.path.basename(filepath)}: {tags_data}")
            return []

    except Exception as e:
        print(f"\nError on {os.path.basename(filepath)}: {e}")
        return None

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    markdown_files = [f for f in os.listdir(POSTS_DIRECTORY) if f.endswith(".md")]
    all_articles_data = []

    for filename in tqdm(markdown_files, desc="Processing"):
        filepath = os.path.join(POSTS_DIRECTORY, filename)
        tags = get_tags_for_article(filepath)
        if tags:
            all_articles_data.append({"filename": filename, "tags": tags})

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(all_articles_data, f, indent=4)
    print(f"\nDone ! Saved in {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
