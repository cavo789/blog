"""Logic for mutating file states, specifically editing tags."""

import os
import glob
from typing import Any
import frontmatter
from config import DOCS_DIR, FILE_PATTERN_BASE
from helpers import generate_markdown_file_content, Colors, print_error, print_warning, print_info, print_success

def process_files(action: str, old_tag: str | None = None, new_tag: str | None = None) -> None:
    """Modifies tags across all markdown files based on the specified action."""
    if action == 'delete':
        operation_desc = f"{Colors.FAIL}Deleting tag '{old_tag}'{Colors.ENDC}"
    elif action == 'rename':
        operation_desc = f"{Colors.OKCYAN}Renaming tag '{old_tag}' to '{new_tag}'{Colors.ENDC}"
    else:
        return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {operation_desc}")
    print(f"Base Directory: {Colors.OKBLUE}{DOCS_DIR}/{Colors.ENDC}")

    if not os.path.exists(DOCS_DIR):
        print_error(f"Directory '{DOCS_DIR}' not found.")
        return

    files: list[str] = glob.glob(FILE_PATTERN_BASE, recursive=True)
    if not files:
        print_warning(f"No files found matching '{FILE_PATTERN_BASE}'.")
        return

    print_info(f"{len(files)} file(s) found. Processing...")

    changes_made: int = 0
    old_tag_lower = old_tag.lower() if old_tag else None
    new_tag_lower = new_tag.lower() if new_tag else None

    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            metadata: dict[str, Any] = post.metadata
            file_changed: bool = False

            if 'tags' in metadata and isinstance(metadata['tags'], list):
                original_tags: list[str] = metadata['tags']
                new_tags: list[str] = []

                for tag in original_tags:
                    tag_lower: str = tag.lower()

                    if tag_lower == old_tag_lower:
                        if action == 'delete':
                            file_changed = True
                            continue
                        elif action == 'rename':
                            if new_tag_lower and new_tag_lower not in [t.lower() for t in new_tags]:
                                new_tags.append(new_tag) # type: ignore
                                file_changed = True
                    else:
                        if tag_lower not in [t.lower() for t in new_tags]:
                            new_tags.append(tag)

                if file_changed:
                    post.metadata['tags'] = new_tags
                    full_content: str = generate_markdown_file_content(post.metadata, post.content)

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(full_content)

                    if action == 'delete':
                        print_success(f"  ✓ Deleted '{old_tag}' from: {filepath}")
                    else:
                        print_success(f"  ✓ Renamed '{old_tag}' to '{new_tag}' in: {filepath}")

                    changes_made += 1

        except Exception as e:
            print_error(f"FATAL ERROR PROCESSING {filepath}: {str(e)}")

    print("-" * 50)
    print(f"{Colors.BOLD}Operation completed.{Colors.ENDC} {changes_made} file(s) modified.")
