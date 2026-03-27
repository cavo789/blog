import json
import os

from collections import Counter

# --- Configuration ---
TOP_TAGS_COUNT = 20

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "output")

ANALYSIS_OUTPUT_FILE = os.path.join(OUTPUT_DIR, "tag_analysis.json")
INTERLINK_OUTPUT_FILE = os.path.join(OUTPUT_DIR, "suggested_interlinks.json")
TAG_DATA_FILE = os.path.join(OUTPUT_DIR, "all_articles_with_tags.json")

def analyze_tags(articles_data):
    """Analyzes tag frequency and identifies top tags."""
    print("--- 1. Analyzing Tag Frequency ---")
    all_tags = [tag for article in articles_data for tag in article["tags"]]

    if not all_tags:
        print("No tags found to analyze.")
        return {}

    tag_counts = Counter(all_tags)
    most_common_tags = tag_counts.most_common(TOP_TAGS_COUNT)

    print(f"Total unique tags: {len(tag_counts)}")
    print(f"Top {TOP_TAGS_COUNT} most effective tags:")
    for tag, count in most_common_tags:
        print(f"- {tag}: ({count} articles)")

    analysis_result = {
        "total_unique_tags": len(tag_counts),
        "top_tags": [{"tag": tag, "count": count} for tag, count in most_common_tags]
    }

    # Save analysis
    with open(ANALYSIS_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(analysis_result, f, indent=4)
    print(f"Tag analysis saved to {ANALYSIS_OUTPUT_FILE}")

    return tag_counts

def suggest_interlinks(articles_data):
    """Suggests interlinks between articles based on shared tags."""
    print("--- 2. Generating Interlinking Suggestions ---")

    if not articles_data:
        print("No article data to process for interlinking.")
        return

    # Create an inverted index: tag -> [list of article filenames]
    tag_to_articles = {}
    for article in articles_data:
        for tag in article["tags"]:
            if tag not in tag_to_articles:
                tag_to_articles[tag] = []
            tag_to_articles[tag].append(article["filename"])

    interlink_suggestions = []
    for article in articles_data:
        current_filename = article["filename"]
        suggested_links = set()

        for tag in article["tags"]:
            # Find other articles with the same tag
            shared_tag_articles = tag_to_articles.get(tag, [])
            for linked_article in shared_tag_articles:
                if linked_article != current_filename:
                    suggested_links.add(linked_article)

        interlink_suggestions.append({
            "source_article": current_filename,
            "suggested_links": sorted(list(suggested_links))
        })

    # Save suggestions
    with open(INTERLINK_OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(interlink_suggestions, f, indent=4)
    print(f"Interlinking suggestions saved to {INTERLINK_OUTPUT_FILE}")


def main():
    """Main function to load tag data and perform analysis."""
    try:
        with open(TAG_DATA_FILE, "r", encoding="utf-8") as f:
            articles_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Tag data file not found at {TAG_DATA_FILE}")
        print("Please run 01_generate_tags.py first.")
        return
    except json.JSONDecodeError:
        print(f"Error: Could not parse JSON from {TAG_DATA_FILE}. It might be empty or corrupted.")
        return

    analyze_tags(articles_data)
    suggest_interlinks(articles_data)
    print("Analysis and linking process complete.")

if __name__ == "__main__":
    main()

