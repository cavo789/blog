"""AI integration for tag suggestion."""

import requests
import frontmatter
from config import OLLAMA_URL, OLLAMA_MODEL, OLLAMA_TIMEOUT
from helpers import Colors, print_error

def suggest_tags_for_file(filepath: str) -> list[str]:
    """Sends file content to Ollama to retrieve tag suggestions."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            post = frontmatter.load(f)
            content = post.content
    except Exception as e:
        print_error(f"Failed to read file {filepath}: {e}")
        return []

    prompt = f"""
    Analyze the following blog post content and suggest 3 to 5 relevant technical tags.
    Return ONLY a comma-separated list of tags, nothing else.

    Content:
    {content[:3000]}
    """

    print(f"\n{Colors.WARNING}{Colors.BOLD}--- CALLING {OLLAMA_URL} using {OLLAMA_MODEL} ---{Colors.ENDC}")

    try:
        response = requests.post(
            OLLAMA_URL,
            json={'model': OLLAMA_MODEL, 'prompt': prompt, 'stream': False},
            timeout=OLLAMA_TIMEOUT
        )
        response.raise_for_status()
        raw_tags = response.json().get('response', '').strip()
        return [t.strip() for t in raw_tags.split(',')]
    except requests.exceptions.RequestException as e:
        print_error(f"Error calling Ollama API: {e}")
    except KeyError:
        print_error("Unexpected response format from Ollama API.")

    return []
