# tag_manager.py

import argparse
from typing import List, Dict, Any, Tuple, Set
import os
import glob
from collections import Counter

# YAML processing libraries
import oyaml as yaml
import frontmatter

# --- ANSI Color Codes ---
class Colors:
    """ANSI color codes for console output."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

# --- Configuration ---
DOCS_DIR: str = 'blog'
FILE_PATTERN_BASE: str = os.path.join(DOCS_DIR, '**', '*.md*')
MAX_LENGTH_DIFFERENCE: int = 3 # Max difference in characters to suggest a merge based on substring

# Tags to exclude from merge suggestions (case-insensitive and order-independent)
# Example: ('php', 'phpcbf') will prevent 'php' vs 'phpcbf' from being suggested.
MERGE_EXCEPTIONS: Set[Tuple[str, str]] = {
    ('ftp', 'sftp'),
    ('git', 'github'),
    ('git', 'gitlab'),
    ('mysql', 'sql'),
    ('php', 'phpcbf'),
    ('php', 'phpcs'),
    ('php', 'phpdoc'),
    ('scp', 'winscp'),
    ('ssh', 'sshpass'),
    ('xml', 'xmlstarlet'),
}


# --- YAML Dumper Configuration ---

def custom_list_representer(dumper: yaml.SafeDumper, data: List[Any]) -> yaml.nodes.SequenceNode:
    """Forces Python lists to be represented in YAML flow style: [item1, item2]."""
    return dumper.represent_sequence('tag:yaml.org,2002:seq', data, flow_style=True)

def custom_string_representer(dumper: yaml.SafeDumper, data: str) -> yaml.nodes.ScalarNode:
    """Prevents PyYAML from folding long strings into multi-line blocks."""
    if '\n' in data:
        # Use block style if the string explicitly contains newlines
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    # Use plain style for single-line strings, preventing folding
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='')


# Registering custom representers on the SafeDumper
yaml.add_representer(list, custom_list_representer, Dumper=yaml.SafeDumper)
yaml.add_representer(str, custom_string_representer, Dumper=yaml.SafeDumper)


def custom_dumper_factory(metadata: Dict[str, Any], content: str) -> str:
    """
    Generates the final file content string (front matter + markdown content)
    while preserving YAML formatting.
    """

    import io
    output = io.StringIO()

    yaml.dump(
        metadata,
        output,
        Dumper=yaml.SafeDumper,
        default_flow_style=False,
        allow_unicode=True,
        width=4096 # High width ensures long single-line strings are not folded
    )

    yaml_output: str = output.getvalue()

    return f"---\n{yaml_output}---\n{content}"


# ----------------------------------------------------------------------
# Core Tag Management Functions
# ----------------------------------------------------------------------

def list_tags(sort_by: str = 'count') -> None:
    """
    Collects and displays all tags, sorted either by count (desc) or name (asc).
    It also lists tags with case variations and suggests tags for potential merging.

    Args:
        sort_by: The primary sorting method ('count' or 'name').
    """

    tag_counter: Counter = Counter()

    print(f"{Colors.BOLD}Action:{Colors.ENDC} {Colors.OKBLUE}Listing all tags{Colors.ENDC} (Sort by: {Colors.OKCYAN}{sort_by.upper()}{Colors.ENDC})")
    print(f"Base Directory: {Colors.OKBLUE}{DOCS_DIR}/{Colors.ENDC}")

    if not os.path.exists(DOCS_DIR):
        print(f"{Colors.FAIL}{Colors.BOLD}ERROR: Directory '{DOCS_DIR}' not found.{Colors.ENDC}")
        return

    files: List[str] = glob.glob(FILE_PATTERN_BASE, recursive=True)

    if not files:
        print(f"{Colors.WARNING}No files found matching '{FILE_PATTERN_BASE}'.{Colors.ENDC}")
        return

    print(f"{Colors.OKBLUE}INFO: {len(files)} file(s) found. Processing tags...{Colors.ENDC}")

    case_variants: Dict[str, List[str]] = {}
    unique_tags: set[str] = set()

    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            tags: List[str] = post.metadata.get('tags', [])

            if isinstance(tags, list):
                tag_counter.update(tags)

                for tag in tags:
                    tag_lower = tag.lower()

                    # Fill case variant dictionary
                    if tag_lower not in case_variants:
                        case_variants[tag_lower] = []
                    if tag not in case_variants[tag_lower]:
                        case_variants[tag_lower].append(tag)

                    # Fill unique tags set (case-sensitive)
                    unique_tags.add(tag)

        except Exception:
            pass

    print("\n" + "=" * 50)
    if not tag_counter:
        print(f"{Colors.WARNING}No tags found in the files.{Colors.ENDC}")
        return

    # --- PART 1: PRIMARY SORT AND LISTING ---

    tag_list: List[Tuple[str, int]] = list(tag_counter.items())

    if sort_by == 'count':
        # Default sort: Primary by Count (DESC), Secondary by Tag Name (ASC)
        tag_list.sort(key=lambda item: item[0]) # Secondary sort by name (ASC)
        tag_list.sort(key=lambda item: item[1], reverse=True) # Primary sort by count (DESC)

        sort_desc = "Frequency DESC, Name ASC"

    elif sort_by == 'name':
        # Name sort: Only by Tag Name (ASC)
        tag_list.sort(key=lambda item: item[0])

        sort_desc = "Name ASC"

    print(f"{Colors.HEADER}{Colors.BOLD}Top Tags ({sort_desc}):{Colors.ENDC}")
    for tag, count in tag_list:
        print(f"  {Colors.OKGREEN}{tag:<30}{Colors.ENDC}{Colors.BOLD}{Colors.OKBLUE}{count}{Colors.ENDC}")
    print("=" * 50)


    # --- PART 2 & 3: OPTIMIZATION SUGGESTIONS ---

    case_issues: List[List[str]] = [
        variants
        for variants in case_variants.values()
        if len(variants) > 1
    ]
    merge_suggestions: set[Tuple[str, str]] = set()
    sorted_unique_tags = sorted(list(unique_tags))


    # Logic to check if a pair is an exception (case-insensitive and order-independent)
    def is_exception(t1: str, t2: str) -> bool:
        t1_lower, t2_lower = t1.lower(), t2.lower()

        # Create the canonical lowercased and sorted tuple (e.g., ('php', 'phpcbf'))
        canonical_pair = tuple(sorted((t1_lower, t2_lower)))

        # Check against the MERGE_EXCEPTIONS set
        return canonical_pair in MERGE_EXCEPTIONS


    # Refined merge suggestion logic
    for i in range(len(sorted_unique_tags)):
        t1 = sorted_unique_tags[i]
        t1_lower = t1.lower()

        for j in range(i + 1, len(sorted_unique_tags)):
            t2 = sorted_unique_tags[j]
            t2_lower = t2.lower()

            # Skip tags that only differ by case
            if t1_lower == t2_lower:
                continue

            # Skip if the pair is explicitly listed as an exception
            if is_exception(t1, t2):
                continue

            pair = tuple(sorted((t1, t2)))

            # Heuristic 1: Singular/Plural Check (Highly reliable)
            # Example: 'snippet' vs 'snippets'
            if (t1_lower + 's' == t2_lower or t2_lower + 's' == t1_lower):
                merge_suggestions.add(pair)
                continue

            # Heuristic 2: Substring with Length Constraint

            len_diff = abs(len(t1_lower) - len(t2_lower))

            if len_diff > 0 and len_diff <= MAX_LENGTH_DIFFERENCE:

                # Check if the shorter tag is a substring of the longer tag
                if len(t1_lower) < len(t2_lower):
                    shorter_tag = t1_lower
                    longer_tag = t2_lower
                else:
                    shorter_tag = t2_lower
                    longer_tag = t1_lower

                if shorter_tag in longer_tag:
                    merge_suggestions.add(pair)


    print(f"\n{Colors.WARNING}{Colors.BOLD}--- TAG OPTIMIZATION SUGGESTIONS ---{Colors.ENDC}")

    # Display Case Issues (Part 2)
    if case_issues:
        print(f"{Colors.WARNING}1. Case Variations (Easy Duplicates):{Colors.ENDC}")

        for variants in sorted(case_issues, key=lambda x: x[0].lower()):
            counts_info = ", ".join([
                f"{v} ({tag_counter[v]})" for v in sorted(variants)
            ])
            print(f"  {Colors.FAIL}❌ Case Issue ({variants[0].lower()}): {Colors.ENDC}{counts_info}")
            print(f"    {Colors.OKCYAN}  Suggestion: Rename all to a canonical form (e.g., '{variants[0]}').{Colors.ENDC}")

    # Display Merge Suggestions (Part 3 - Refined)
    if merge_suggestions:
        print(f"\n{Colors.WARNING}2. Potential Merge Candidates (Singular/Plural or Small Prefix/Suffix):{Colors.ENDC}")

        for t1, t2 in sorted(list(merge_suggestions)):
            count1 = tag_counter[t1]
            count2 = tag_counter[t2]

            print(f"  {Colors.WARNING}⚠️ Found: {Colors.ENDC}{t1} ({count1}) vs {t2} ({count2})")
            print(f"    {Colors.OKCYAN}  Suggestion: Merge into a canonical form (e.g., '{t1}' or '{t2}').{Colors.ENDC}")

    if not case_issues and not merge_suggestions:
        print(f"  {Colors.OKGREEN}No obvious tag duplicates or merge candidates found.{Colors.ENDC}")

    print("-" * 50)


# ----------------------------------------------------------------------
# Argparse Configuration (Remains unchanged)
# ----------------------------------------------------------------------

def _process_files(action: str, old_tag: str = None, new_tag: str = None) -> None:
    # ... (function body remains unchanged) ...

    if action == 'delete':
        operation_desc: str = f"{Colors.FAIL}Deleting tag '{old_tag}'{Colors.ENDC}"
    elif action == 'rename':
        operation_desc: str = f"{Colors.OKCYAN}Renaming tag '{old_tag}' to '{new_tag}'{Colors.ENDC}"
    else:
        return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {operation_desc}")
    print(f"Base Directory: {Colors.OKBLUE}{DOCS_DIR}/{Colors.ENDC}")

    if not os.path.exists(DOCS_DIR):
        print(f"{Colors.FAIL}{Colors.BOLD}ERROR: Directory '{DOCS_DIR}' not found.{Colors.ENDC}")
        return

    files: List[str] = glob.glob(FILE_PATTERN_BASE, recursive=True)

    if not files:
        print(f"{Colors.WARNING}No files found matching '{FILE_PATTERN_BASE}'.{Colors.ENDC}")
        return

    print(f"{Colors.OKBLUE}INFO: {len(files)} file(s) found. Processing...{Colors.ENDC}")

    changes_made: int = 0
    old_tag_lower: str | None = old_tag.lower() if old_tag else None
    new_tag_lower: str | None = new_tag.lower() if new_tag else None

    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            metadata: Dict[str, Any] = post.metadata
            file_changed: bool = False

            if 'tags' in metadata and isinstance(metadata['tags'], list):

                original_tags: List[str] = metadata['tags']
                new_tags: List[str] = []

                for tag in original_tags:
                    tag_lower: str = tag.lower()

                    if tag_lower == old_tag_lower:
                        if action == 'delete':
                            file_changed = True
                            continue

                        elif action == 'rename':
                            # Avoid adding the new tag if a case-insensitive match already exists
                            if new_tag_lower and new_tag_lower not in [t.lower() for t in new_tags]:
                                new_tags.append(new_tag)
                                file_changed = True

                    else:
                        # Ensure no duplicates in the new list (case-insensitive)
                        if tag_lower not in [t.lower() for t in new_tags]:
                            new_tags.append(tag)

                if file_changed:
                    post.metadata['tags'] = new_tags

                    # Generate content and write the file manually to preserve YAML formatting
                    full_content: str = custom_dumper_factory(post.metadata, post.content)

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(full_content)

                    if action == 'delete':
                        print(f"{Colors.OKGREEN}  ✓ Deleted '{old_tag}' from: {filepath}{Colors.ENDC}")
                    else:
                        print(f"{Colors.OKGREEN}  ✓ Renamed '{old_tag}' to '{new_tag}' in: {filepath}{Colors.ENDC}")

                    changes_made += 1

        except Exception as e:
            error_message: str = str(e)
            print(f"{Colors.FAIL}  ❌ FATAL ERROR PROCESSING {filepath}: {error_message}{Colors.ENDC}")

    print("-" * 50)
    print(f"{Colors.BOLD}Operation completed.{Colors.ENDC} {changes_made} file(s) modified.")

# ... (The rest of the argparse block remains the same) ...
if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description=f"{Colors.BOLD}{Colors.OKCYAN}Tag Manager Tool{Colors.ENDC} for Markdown files (path: {DOCS_DIR}).",
        epilog="Use 'python tag_manager.py <action> -h' for action-specific help.",
        formatter_class=argparse.RawTextHelpFormatter
    )

    # Define subparsers and actions
    subparsers = parser.add_subparsers(dest="action", help="Available actions.")

    # LIST action
    parser_list = subparsers.add_parser(
        'list',
        help=f"List all tags found in '{DOCS_DIR}', sorted by frequency and name."
    )
    parser_list.add_argument(
        '--sort',
        type=str,
        choices=['name', 'count'],
        default='count',
        help="Primary sorting method: 'count' (default, frequency descending) or 'name' (alphabetical ascending)."
    )

    # DELETE action
    parser_delete = subparsers.add_parser(
        'delete',
        help=f"Delete a specified tag from all files in '{DOCS_DIR}'. (Parameter: TAG)"
    )
    parser_delete.add_argument(
        "tag",
        type=str,
        metavar="<TAG_TO_DELETE>",
        help="The tag to DELETE (e.g., 'draft')."
    )

    # RENAME action
    parser_rename = subparsers.add_parser(
        'rename',
        help=f"Rename an old tag to a new one in all files in '{DOCS_DIR}'. (Parameters: OLD_TAG,NEW_TAG)"
    )
    parser_rename.add_argument(
        "tags",
        type=str,
        metavar="<OLD_TAG,NEW_TAG>",
        help="The tags to rename, in 'old_tag,new_tag' format (e.g., 'prog,programming')."
    )

    # Display full help page if no arguments are provided
    if len(os.sys.argv) == 1:
        parser.print_help()
        os.sys.exit(0)

    # Parse arguments
    args = parser.parse_args()

    # Execute actions
    if args.action == 'list':
        list_tags(args.sort)

    elif args.action == 'delete' or args.action == 'rename':

        old_tag: str | None = None
        new_tag: str | None = None

        if args.action == 'delete':
            old_tag = args.tag

        elif args.action == 'rename':
            if ',' not in args.tags:
                print(f"{Colors.FAIL}Error: Rename argument must be in 'OLD_TAG,NEW_TAG' format.{Colors.ENDC}")
                os.sys.exit(1)

            try:
                old_tag, new_tag = [t.strip() for t in args.tags.split(',', 1)]

                if not old_tag or not new_tag:
                     print(f"{Colors.FAIL}Error: Both tags (old and new) must be specified and non-empty.{Colors.ENDC}")
                     os.sys.exit(1)

            except ValueError:
                 print(f"{Colors.FAIL}Error: Problem splitting tags. Expected format: 'OLD_TAG,NEW_TAG'.{Colors.ENDC}")
                 os.sys.exit(1)

        _process_files(
            action=args.action,
            old_tag=old_tag,
            new_tag=new_tag
        )