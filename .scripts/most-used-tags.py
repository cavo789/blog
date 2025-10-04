import os
import yaml
import re
from collections import Counter

DOCS_DIR = './blog'

def extract_frontmatter(content):
    match = re.match(r'^---\n(.*?)\n---\n', content, re.DOTALL)
    if match:
        return yaml.safe_load(match.group(1))
    return {}

def collect_tags_from_docs(directory):
    tag_counter = Counter()

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith(('.md', '.mdx')):
                with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                    content = f.read()
                    frontmatter = extract_frontmatter(content)
                    tags = frontmatter.get('tags', [])
                    if isinstance(tags, list):
                        tag_counter.update(tags)

    return tag_counter

if __name__ == "__main__":
    tag_counts = collect_tags_from_docs(DOCS_DIR)
    print("Tags les plus utilisés :")
    for tag, count in tag_counts.most_common():
        print(f"{tag}: {count}")
