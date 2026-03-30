"""Logic for analyzing, listing, and cross-referencing tags."""

import os
import glob
from collections import Counter
import frontmatter
from config import DOCS_DIR, FILE_PATTERN_BASE, MERGE_EXCEPTIONS, MAX_LENGTH_DIFFERENCE
from helpers import Colors, print_error, print_warning, print_info

def _is_exception(t1: str, t2: str) -> bool:
    """Checks if a pair of tags is explicitly excluded from merge suggestions."""
    canonical_pair = tuple(sorted((t1.lower(), t2.lower())))
    return canonical_pair in MERGE_EXCEPTIONS

def list_tags(sort_by: str = 'count') -> None:
    """Collects and displays all tags, identifying case variations and merge candidates."""
    tag_counter: Counter = Counter()

    print(f"{Colors.BOLD}Action:{Colors.ENDC} {Colors.OKBLUE}Listing all tags{Colors.ENDC} (Sort by: {Colors.OKCYAN}{sort_by.upper()}{Colors.ENDC})")
    print(f"Base Directory: {Colors.OKBLUE}{DOCS_DIR}/{Colors.ENDC}")

    if not os.path.exists(DOCS_DIR):
        print_error(f"Directory '{DOCS_DIR}' not found.")
        return

    files: list[str] = glob.glob(FILE_PATTERN_BASE, recursive=True)

    if not files:
        print_warning(f"No files found matching '{FILE_PATTERN_BASE}'.")
        return

    print_info(f"{len(files)} file(s) found. Processing tags...")

    case_variants: dict[str, list[str]] = {}
    unique_tags: set[str] = set()

    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            tags: list[str] = post.metadata.get('tags', [])

            if isinstance(tags, list):
                tag_counter.update(tags)
                for tag in tags:
                    tag_lower = tag.lower()
                    if tag_lower not in case_variants:
                        case_variants[tag_lower] = []
                    if tag not in case_variants[tag_lower]:
                        case_variants[tag_lower].append(tag)
                    unique_tags.add(tag)
        except Exception:
            continue

    print("\n" + "=" * 50)
    if not tag_counter:
        print_warning("No tags found in the files.")
        return

    # --- LISTING ---
    tag_list: list[tuple[str, int]] = list(tag_counter.items())
    if sort_by == 'count':
        tag_list.sort(key=lambda item: item[0])
        tag_list.sort(key=lambda item: item[1], reverse=True)
        sort_desc = "Frequency DESC, Name ASC"
    else:
        tag_list.sort(key=lambda item: item[0])
        sort_desc = "Name ASC"

    print(f"{Colors.HEADER}{Colors.BOLD}Top Tags ({sort_desc}):{Colors.ENDC}")
    for tag, count in tag_list:
        print(f"  {Colors.OKGREEN}{tag:<30}{Colors.ENDC}{Colors.BOLD}{Colors.OKBLUE}{count}{Colors.ENDC}")
    print("=" * 50)

    # --- OPTIMIZATION SUGGESTIONS ---
    case_issues: list[list[str]] = [v for v in case_variants.values() if len(v) > 1]
    merge_suggestions: set[tuple[str, str]] = set()
    sorted_unique_tags = sorted(list(unique_tags))

    for i, t1 in enumerate(sorted_unique_tags):
        t1_lower = t1.lower()
        for j in range(i + 1, len(sorted_unique_tags)):
            t2 = sorted_unique_tags[j]
            t2_lower = t2.lower()

            if t1_lower == t2_lower or _is_exception(t1, t2):
                continue

            pair = tuple(sorted((t1, t2)))

            if t1_lower + 's' == t2_lower or t2_lower + 's' == t1_lower:
                merge_suggestions.add(pair)
                continue

            len_diff = abs(len(t1_lower) - len(t2_lower))
            if 0 < len_diff <= MAX_LENGTH_DIFFERENCE:
                shorter_tag, longer_tag = (t1_lower, t2_lower) if len(t1_lower) < len(t2_lower) else (t2_lower, t1_lower)
                if shorter_tag in longer_tag:
                    merge_suggestions.add(pair)

    print(f"\n{Colors.WARNING}{Colors.BOLD}--- TAG OPTIMIZATION SUGGESTIONS ---{Colors.ENDC}")

    if case_issues:
        print_warning("1. Case Variations (Easy Duplicates):")
        for variants in sorted(case_issues, key=lambda x: x[0].lower()):
            counts_info = ", ".join([f"{v} ({tag_counter[v]})" for v in sorted(variants)])
            print(f"  {Colors.FAIL}❌ Case Issue ({variants[0].lower()}): {Colors.ENDC}{counts_info}")
            print(f"    {Colors.OKCYAN}  Suggestion: Rename all to '{variants[0]}'.{Colors.ENDC}")

    if merge_suggestions:
        print_warning("\n2. Potential Merge Candidates:")
        for t1, t2 in sorted(list(merge_suggestions)):
            print(f"  {Colors.WARNING}⚠️ Found: {Colors.ENDC}{t1} ({tag_counter[t1]}) vs {t2} ({tag_counter[t2]})")
            print(f"    {Colors.OKCYAN}  Suggestion: Merge into '{t1}' or '{t2}'.{Colors.ENDC}")

    if not case_issues and not merge_suggestions:
        print(f"  {Colors.OKGREEN}No obvious tag duplicates or merge candidates found.{Colors.ENDC}")

    print("-" * 50)
