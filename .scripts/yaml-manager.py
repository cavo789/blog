"""
YAML Front Matter Manager
-------------------------
This script provides command-line utilities to manage and standardize the YAML
front matter of Markdown files (e.g., used in static site generators like Jekyll,
Hugo, or Gatsby).

Key features:
1. Reorder keys based on a predefined standard (FRONTMATTER_KEY_ORDER).
2. Add, remove, or check for presence/absence of specific keys.
3. Clean up conceptual duplicates and misspellings (e.g., 'canonicalURL' -> 'canonicalurl').
4. List all unique keys and their values across the entire content base.
5. Check for SEO and content quality issues (check-seo).
6. Check for general mandatory key presence (check-mandatory).

Dependencies:
- python-frontmatter: Used for reliable parsing and dumping of front matter.
- oyaml (Ordered YAML): Used to ensure key order is preserved when dumping YAML.
"""

import argparse
from typing import List, Dict, Any, Set, Tuple, Optional
import os
import glob
from collections import OrderedDict
import sys
import re

# --- Dependency Check and Import ---
try:
    # Use oyaml for guaranteed key order preservation in the output
    import oyaml as yaml
    import frontmatter
except ImportError:
    print("\033[91mERROR: Required libraries 'oyaml' and 'python-frontmatter' not found. Please install them.\033[0m")
    print("Run: pip install python-frontmatter oyaml")
    sys.exit(1)


# --- ANSI Color Codes ---
class Colors:
    """ANSI color codes for console output."""
    HEADER: str = '\033[95m'
    OKBLUE: str = '\033[94m'
    OKCYAN: str = '\033[96m'
    OKGREEN: str = '\033[92m'
    WARNING: str = '\033[93m'
    FAIL: str = '\033[91m'
    ENDC: str = '\033[0m'
    BOLD: str = '\033[1m'
    UNDERLINE: str = '\033[4m'


# --- Configuration ---

# The root directory containing Markdown files
DOCS_DIR: str = 'blog'

# Glob pattern to find all target files (recursive search in DOCS_DIR)
# NOTE: The pattern '**/*.md*' includes files like .md, .mdx, etc.
FILE_PATTERN_BASE: str = os.path.join(DOCS_DIR, '**', '*.md*')

# Regex to find the YAML boundary (e.g., '---')
YAML_BOUNDARY: re.Pattern[str] = re.compile(r'^-{3,}\s*$', re.MULTILINE)

# Define the logical/standard order for front matter keys (Reordering rule)
FRONTMATTER_KEY_ORDER: List[str] = [
    'id', 'slug', 'title', 'subtitle',
    'date', 'updated',
    'description', 'authors', 'image', 'series',
    'mainTag', 'tags', 'categories', 'language'
]

# --- General Mandatory Key Check Configuration (NEW) ---
# List of essential keys that MUST be present in every post, regardless of SEO details.
MANDATORY_KEYS: List[str] = [
    'authors', 'date', 'description', 'image', 'language',
    'mainTag', 'slug', 'tags', 'title'
]

# --- SEO/Quality Check Configuration ---
# Minimum length check for essential SEO fields
SEO_MIN_LENGTHS: Dict[str, int] = {
    'title': 5, # Minimum 5 characters for a meaningful title
    'description': 50 # Minimum 50 characters for a decent meta description
}

# Maximum length check for meta description
SEO_MAX_LENGTHS: Dict[str, int] = {
    'description': 160 # Max 160 characters before truncation
}

# List of keys that must be present in every file for optimal SEO
SEO_MANDATORY_KEYS: List[str] = [
    'title', 'description', 'slug', 'date', 'language'
]

# List of keys whose values must be normalized to lowercase (e.g., tags, categories)
SEO_LOWERCASE_KEYS: List[str] = [
    'tags', 'categories', 'mainTag'
]

# Define groups of keys that should never coexist (misspellings, deprecated names, etc.)
# Normalized Key (for group reference): [List of all conceptual variants]
CONCEPTUAL_DUPLICATE_GROUPS: Dict[str, List[str]] = {
    'blueskyrecordkey': ['blueskyRecordKey', 'blukskyRecordKey', 'bskyRecordKey'],
    'status': ['status', 'postStatus', 'deprecatedStatus'],
    'canonicalurl': ['canonicalUrl', 'canonicalURL', 'canonical_url'],
}


# ----------------------------------------------------------------------
# YAML Dumper Configuration & Custom Logic
# ----------------------------------------------------------------------

def custom_list_representer(dumper: yaml.SafeDumper, data: List[Any]) -> yaml.nodes.SequenceNode:
    """Forces Python lists to be represented in YAML flow style: [item1, item2]."""
    return dumper.represent_sequence('tag:yaml.org,2002:seq', data, flow_style=True)

def custom_string_representer(dumper: yaml.SafeDumper, data: str) -> yaml.nodes.ScalarNode:
    """Prevents PyYAML from folding long strings into multi-line blocks."""
    if '\n' in data:
        # Use block style (literal block) if the string explicitly contains newlines
        return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='|')
    # Use plain style for single-line strings, preventing folding
    return dumper.represent_scalar('tag:yaml.org,2002:str', data, style='')

# Registering custom representers on the SafeDumper
yaml.add_representer(list, custom_list_representer, Dumper=yaml.SafeDumper)
yaml.add_representer(str, custom_string_representer, Dumper=yaml.SafeDumper)


def custom_dumper_factory(metadata: Dict[str, Any], content: str) -> str:
    """
    Generates the final file content string (front matter + markdown content)
    using the customized YAML dumper for consistent formatting.
    """
    import io
    output: io.StringIO = io.StringIO()

    # Dump the metadata to the StringIO object
    yaml.dump(
        metadata,
        output,
        Dumper=yaml.SafeDumper,
        default_flow_style=False,
        allow_unicode=True,
        width=4096  # Prevent line folding
    )

    yaml_output: str = output.getvalue().rstrip() + '\n'

    # Ensure no leading newlines in content
    clean_content: str = content.lstrip('\n')

    # Construct the final content: --- \n YAML_DATA \n --- \n CONTENT
    return f"---\n{yaml_output}---\n{clean_content}"

# ----------------------------------------------------------------------
# Core Utility Functions
# ----------------------------------------------------------------------

def _get_files() -> List[str]:
    """Helper to find all target files using recursive glob."""
    if not os.path.exists(DOCS_DIR):
        print(f"{Colors.FAIL}{Colors.BOLD}ERROR: Directory '{DOCS_DIR}' not found.{Colors.ENDC}")
        return []
    # Use recursive=True (requires Python 3.5+)
    return glob.glob(FILE_PATTERN_BASE, recursive=True)

def _sort_frontmatter_keys(metadata: Dict[str, Any]) -> Dict[str, Any]:
    """
    Sorts the front matter metadata keys according to a defined logical order
    (FRONTMATTER_KEY_ORDER), with remaining keys sorted alphabetically.
    """
    # OrderedDict preserves the order of keys as they are inserted
    sorted_metadata: Dict[str, Any] = OrderedDict()

    # 1. Process required keys in strict order
    for key in FRONTMATTER_KEY_ORDER:
        if key in metadata:
            sorted_metadata[key] = metadata[key]

    # 2. Process remaining keys, sorted alphabetically
    remaining_keys: List[str] = sorted([
        key
        for key in metadata.keys()
        if key not in FRONTMATTER_KEY_ORDER
    ])

    for key in remaining_keys:
        # Check in case a key was mistakenly in both lists (shouldn't happen with set comprehension)
        if key not in sorted_metadata:
            sorted_metadata[key] = metadata[key]

    return sorted_metadata

def _write_file(filepath: str, metadata: Dict[str, Any], content: str) -> None:
    """Sorts keys (via _sort_frontmatter_keys) and writes the combined content back to the file."""
    # The sorting step is implicitly handled inside the write process for consistency
    sorted_metadata: Dict[str, Any] = _sort_frontmatter_keys(metadata)
    full_content: str = custom_dumper_factory(sorted_metadata, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(full_content)

def _parse_key_value_arg(key_value_arg: str) -> Tuple[str, str]:
    """Parses the 'key,value' argument for the add-key action."""
    if ',' not in key_value_arg:
        key: str = key_value_arg.strip()
        default_value: str = '' # Default value is an empty string
    else:
        try:
            # Split only on the first comma to allow commas in the default value
            parts: List[str] = [t.strip() for t in key_value_arg.split(',', 1)]
            key = parts[0]
            default_value = parts[1] if len(parts) > 1 else ''
        except ValueError:
            # Should be caught by the general check, but kept for safety
            raise ValueError(f"Problem splitting key/value. Expected format: 'KEY[,DEFAULT_VALUE]'.")

    if not key:
        raise ValueError("Key must be specified and non-empty.")

    return key, default_value

def _normalize_key_data(filepath: str) -> Tuple[Set[str], List[str]]:
    """
    Reads file using basic text parsing (not frontmatter library) to reliably
    extract all front matter keys, including literal/case variants, for conflict checking.
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            raw_content: str = f.read()

        # Find the YAML block boundaries
        matches: List[re.Match[str]] = list(YAML_BOUNDARY.finditer(raw_content))
        if len(matches) < 2:
            return set(), [] # No valid front matter

        yaml_block: str = raw_content[matches[0].end():matches[1].start()].strip()

        original_keys: List[str] = []
        # Simple line-by-line check: look for 'key:' at the start of a line
        for line in yaml_block.splitlines():
            line = line.strip()
            # Basic filtering for top-level keys
            # Checks: contains ':', not a comment, not indented (no space), not a list item ('-')
            if ':' in line and not line.startswith('#') and not line.startswith(' ') and not line.startswith('-'):
                key_part: str = line.split(':', 1)[0].strip()
                original_keys.append(key_part)

        normalized_keys: Set[str] = {key.lower() for key in original_keys}
        return normalized_keys, original_keys

    except Exception as e:
        print(f"{Colors.FAIL}  ❌ ERROR reading or parsing {filepath}: {e}{Colors.ENDC}")
        return set(), []

def _process_default_value(default_value: str) -> Any:
    """Converts string default value to appropriate Python type (boolean, list, or string)."""
    if default_value.lower() == 'true':
        return True
    if default_value.lower() == 'false':
        return False
    # Basic check for a list format, e.g., '[item1, item2]'
    if default_value.startswith('[') and default_value.endswith(']'):
        try:
            # Attempt to parse as a simple list of strings
            return [v.strip() for v in default_value[1:-1].split(',')]
        except:
            # Fall through to string if parsing fails
            pass
    return default_value

# ----------------------------------------------------------------------
# Action Implementations
# ----------------------------------------------------------------------

def check_mandatory_keys() -> None:
    """Action: Ensures a predefined list of keys (MANDATORY_KEYS) is present in all files."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKCYAN}Running Mandatory Key Presence Check on {len(files)} file(s).{Colors.ENDC}")
    print(f"{Colors.BOLD}Mandatory Keys to check: {', '.join(MANDATORY_KEYS)}{Colors.ENDC}")

    total_issues: int = 0

    for filepath in files:
        issues_found: List[str] = []
        try:
            post = frontmatter.load(filepath)
            metadata: Dict[str, Any] = post.metadata

            # Check if all mandatory keys are present
            for key in MANDATORY_KEYS:
                if key not in metadata:
                    issues_found.append(f"Missing mandatory key: '{key}'")

        except Exception as e:
            issues_found.append(f"Critical parsing error: {e}")

        # --- Reporting ---
        if issues_found:
            print(f"{Colors.FAIL}  ❌ Mandatory Keys missing in: {filepath}{Colors.ENDC}")
            for issue in issues_found:
                print(f"      - {Colors.WARNING}{issue}{Colors.ENDC}")
            total_issues += 1

    print("-" * 50)
    if total_issues == 0:
        print(f"{Colors.OKGREEN}{Colors.BOLD}Mandatory Key Check completed.{Colors.ENDC} All {len(files)} file(s) passed the check.")
    else:
        print(f"{Colors.FAIL}{Colors.BOLD}Mandatory Key Check completed with errors.{Colors.ENDC} {total_issues} file(s) are missing required keys.")

def check_seo() -> None:
    """Action: Performs a comprehensive check on essential SEO and quality front matter keys."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKCYAN}Running SEO and Quality Check on {len(files)} file(s).{Colors.ENDC}")

    total_issues: int = 0

    for filepath in files:
        issues_found: List[str] = []
        try:
            post = frontmatter.load(filepath)
            metadata: Dict[str, Any] = post.metadata

            # ------------------------------------------------
            # 1. Mandatory Key Presence Check
            # ------------------------------------------------
            for key in SEO_MANDATORY_KEYS:
                if key not in metadata:
                    issues_found.append(f"Missing mandatory SEO key: '{key}'")

            # ------------------------------------------------
            # 2. Length and Format Checks
            # ------------------------------------------------
            for key, min_len in SEO_MIN_LENGTHS.items():
                if key in metadata and isinstance(metadata[key], str):
                    content = metadata[key].strip()
                    if len(content) < min_len:
                        issues_found.append(f"Key '{key}' too short ({len(content)} chars). Min recommended: {min_len} chars.")

            for key, max_len in SEO_MAX_LENGTHS.items():
                if key in metadata and isinstance(metadata[key], str):
                    content = metadata[key].strip()
                    if len(content) > max_len:
                        issues_found.append(f"Key '{key}' too long ({len(content)} chars). Max recommended: {max_len} chars.")

            # ------------------------------------------------
            # 3. Normalization (Lowercase) Check
            # ------------------------------------------------
            for key in SEO_LOWERCASE_KEYS:
                if key in metadata:
                    values_to_check: List[str] = []
                    if isinstance(metadata[key], str):
                        values_to_check = [metadata[key]]
                    elif isinstance(metadata[key], list):
                        values_to_check = [str(v) for v in metadata[key]]

                    for value in values_to_check:
                        if value and value != value.lower():
                            issues_found.append(f"Key '{key}' value '{value}' is not normalized (must be lowercase).")
                            # Flag the file, move to next key
                            break

        except Exception as e:
            issues_found.append(f"Critical parsing error: {e}")

        # --- Reporting ---
        if issues_found:
            print(f"{Colors.FAIL}  ❌ SEO Issues found in: {filepath}{Colors.ENDC}")
            for issue in issues_found:
                print(f"      - {Colors.WARNING}{issue}{Colors.ENDC}")
            total_issues += 1

    print("-" * 50)
    if total_issues == 0:
        print(f"{Colors.OKGREEN}{Colors.BOLD}SEO Check completed.{Colors.ENDC} All {len(files)} file(s) passed all checks.")
    else:
        print(f"{Colors.FAIL}{Colors.BOLD}SEO Check completed with errors.{Colors.ENDC} {total_issues} file(s) have SEO issues.")

def reorder_keys() -> None:
    """Action: Reorder keys in the front matter of all files based on FRONTMATTER_KEY_ORDER."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKCYAN}Reordering front matter keys in {len(files)} file(s).{Colors.ENDC}")

    changes_made: int = 0
    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            original_keys: List[str] = list(post.metadata.keys())

            # Get the metadata as it would be sorted and dumped
            sorted_metadata: Dict[str, Any] = _sort_frontmatter_keys(post.metadata)

            # Only write back if the order actually changed
            if original_keys != list(sorted_metadata.keys()):
                _write_file(filepath, sorted_metadata, post.content)
                print(f"{Colors.OKGREEN}  ✓ Reordered keys in: {filepath}{Colors.ENDC}")
                changes_made += 1

        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("-" * 50)
    print(f"{Colors.BOLD}Operation completed.{Colors.ENDC} {changes_made} file(s) modified.")

def list_keys() -> None:
    """Action: Collects and lists all unique front matter keys found, sorted alphabetically."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKBLUE}Listing all unique YAML keys found in {len(files)} file(s).{Colors.ENDC}")

    unique_keys: Set[str] = set()
    key_counts: Dict[str, int] = {}
    files_with_frontmatter: int = 0
    files_without_frontmatter: int = 0
    files_with_no_keys: List[str] = []

    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            if post.metadata:
                files_with_frontmatter += 1
                for key in post.metadata.keys():
                    unique_keys.add(key)
                    key_counts[key] = key_counts.get(key, 0) + 1
            else:
                files_without_frontmatter += 1
                files_with_no_keys.append(filepath)
        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("\n" + "=" * 50)
    print(f"{Colors.HEADER}{Colors.BOLD}Key Statistics (Total Files Scanned: {len(files)}):{Colors.ENDC}")
    print(f"  {Colors.OKCYAN}Files with Front Matter: {files_with_frontmatter}{Colors.ENDC}")
    print(f"  {Colors.WARNING}Files with NO Front Matter: {files_without_frontmatter}{Colors.ENDC}")

    if files_with_no_keys:
          print(f"{Colors.WARNING}  ⚠️ Files without front matter: {', '.join(files_with_no_keys)}{Colors.ENDC}")

    print("=" * 50)

    if not unique_keys:
        print(f"{Colors.WARNING}No front matter keys found in the files.{Colors.ENDC}")
        return

    sorted_keys: List[str] = sorted(list(unique_keys))
    print(f"{Colors.HEADER}{Colors.BOLD}Unique Front Matter Keys (Total: {len(sorted_keys)}):{Colors.ENDC}")
    max_key_len: int = max(len(key) for key in sorted_keys)

    for key in sorted_keys:
        count: int = key_counts[key]
        print(f"  {Colors.OKGREEN}{key:<{max_key_len}}{Colors.ENDC} ({Colors.BOLD}{Colors.OKCYAN}{count}{Colors.ENDC} files)")

    print("-" * 50)


def list_unique_key_values(target_key: str) -> None:
    """Action: Collects and lists all unique values used by a specific key, sorted alphabetically."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKBLUE}Listing unique values for key '{target_key}' across {len(files)} file(s).{Colors.ENDC}")

    unique_values: Set[Any] = set()
    value_counts: Dict[Any, int] = {}
    found_count: int = 0

    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            if target_key in post.metadata:
                found_count += 1
                value = post.metadata[target_key]

                # Handle lists (e.g., 'tags') by iterating over items
                if isinstance(value, list):
                    for item in value:
                        str_value: str = str(item)
                        unique_values.add(str_value)
                        value_counts[str_value] = value_counts.get(str_value, 0) + 1
                else:
                    # Handle single value keys
                    str_value = str(value)
                    unique_values.add(str_value)
                    value_counts[str_value] = value_counts.get(str_value, 0) + 1
        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("\n" + "=" * 50)
    if not unique_values:
        print(f"{Colors.WARNING}Key '{target_key}' not found in any file or contains no values.{Colors.ENDC}")
        return

    sorted_values: List[str] = sorted(list(unique_values))
    print(f"{Colors.HEADER}{Colors.BOLD}Unique Values for Key '{target_key}' (Found in {found_count} files):{Colors.ENDC}")

    max_val_len: int = max(len(v) for v in sorted_values) if sorted_values else 0
    max_num_len: int = len(str(len(sorted_values))) + 1

    for i, value in enumerate(sorted_values, 1):
        count: int = value_counts[value]
        print(
            f"  {Colors.OKCYAN}{str(i) + '.':<{max_num_len}}{Colors.ENDC}"
            f" {Colors.OKGREEN}{value:<{max_val_len}}{Colors.ENDC}"
            f" ({Colors.BOLD}{Colors.OKCYAN}{count}{Colors.ENDC} files)"
        )

    print("-" * 50)


def find_key_present(target_key: str) -> None:
    """Action: Find posts that contain a specific key."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKGREEN}Finding files WITH key '{target_key}' in {len(files)} file(s).{Colors.ENDC}")

    found_count: int = 0
    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            if target_key in post.metadata:
                print(f"{Colors.OKGREEN}  ✓ Found '{target_key}': {filepath}{Colors.ENDC}")
                found_count += 1
        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("-" * 50)
    if found_count == 0:
        print(f"{Colors.WARNING}The key '{target_key}' was NOT found in any file.{Colors.ENDC}")
    else:
        print(f"{Colors.BOLD}Search completed.{Colors.ENDC} {found_count} file(s) contain the key '{target_key}'.")


def find_missing_key(target_key: str) -> None:
    """Action: Find posts that are missing a specific key."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.WARNING}Finding files WITHOUT key '{target_key}' in {len(files)} file(s).{Colors.ENDC}")

    missing_count: int = 0
    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            if target_key not in post.metadata:
                print(f"{Colors.FAIL}  ❌ Missing '{target_key}': {filepath}{Colors.ENDC}")
                missing_count += 1
        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("-" * 50)
    if missing_count == 0:
        print(f"{Colors.OKGREEN}All files contain the key '{target_key}'.{Colors.ENDC}")
    else:
        print(f"{Colors.BOLD}Search completed.{Colors.ENDC} {missing_count} file(s) are missing the key '{target_key}'.")

def add_missing_key(target_key: str, default_value_str: str) -> None:
    """Action: Add a key with a default value to files that are missing it."""
    files: List[str] = _get_files()
    if not files: return

    value: Any = _process_default_value(default_value_str)

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKBLUE}Adding key '{target_key}' with value '{value}' to missing files ({len(files)} file(s)).{Colors.ENDC}")

    changes_made: int = 0
    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            if target_key not in post.metadata:
                post.metadata[target_key] = value
                _write_file(filepath, post.metadata, post.content)
                print(f"{Colors.OKGREEN}  ✓ Added '{target_key}' in: {filepath}{Colors.ENDC}")
                changes_made += 1
        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("-" * 50)
    print(f"{Colors.BOLD}Operation completed.{Colors.ENDC} {changes_made} file(s) modified.")

def remove_key(target_key: str) -> None:
    """Action: Remove a key from the front matter of all files that contain it."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.FAIL}Removing key '{target_key}' from front matter in {len(files)} file(s).{Colors.ENDC}")

    changes_made: int = 0
    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            if target_key in post.metadata:
                del post.metadata[target_key]
                _write_file(filepath, post.metadata, post.content)
                print(f"{Colors.OKGREEN}  ✓ Removed '{target_key}' from: {filepath}{Colors.ENDC}")
                changes_made += 1
        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("-" * 50)
    print(f"{Colors.BOLD}Operation completed.{Colors.ENDC} {changes_made} file(s) modified.")

def cleanup_key_variants(target_key: str, variants_to_remove: List[str]) -> None:
    """Action: Standardize a key by deleting variants and moving their value to the target key."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.WARNING}Cleanup and standardization of key '{target_key}' and variants in {len(files)} file(s).{Colors.ENDC}")

    changes_made: int = 0
    for filepath in files:
        try:
            post = frontmatter.load(filepath)
            metadata: Dict[str, Any] = post.metadata
            is_modified: bool = False
            final_value: Optional[Any] = metadata.get(target_key)

            for variant in variants_to_remove:
                if variant in metadata:
                    variant_value: Any = metadata[variant]

                    # 1. If the target key has no value, take the variant's value
                    if final_value is None:
                        final_value = variant_value
                        print(f"{Colors.OKCYAN}  → Moved value from '{variant}' to '{target_key}' in: {filepath}{Colors.ENDC}")

                    # 2. Delete the variant
                    del metadata[variant]
                    is_modified = True
                    print(f"{Colors.FAIL}  ✗ Removed variant '{variant}' from: {filepath}{Colors.ENDC}")

            # 3. Apply the final, standardized value to the target key
            if is_modified:
                # Ensure the target key exists with the final value if we found one
                if final_value is not None:
                    metadata[target_key] = final_value

                _write_file(filepath, metadata, post.content)
                changes_made += 1

        except Exception as e:
            print(f"{Colors.FAIL}  ❌ ERROR processing {filepath}: {e}{Colors.ENDC}")

    print("-" * 50)
    print(f"{Colors.BOLD}Operation completed.{Colors.ENDC} {changes_made} file(s) modified (variants cleaned).")

def _find_literal_duplicates(files: List[str]) -> Tuple[bool, int]:
    """Finds case-insensitive literal key duplicates in YAML block (e.g., 'date' and 'Date')."""
    print(f"\nSub-Operation: Checking for literal duplicates (case-insensitive).")
    total_duplicate_files: int = 0
    all_pass: bool = True

    for filepath in files:
        _, original_keys = _normalize_key_data(filepath)
        key_variants: Dict[str, List[str]] = {}

        for key_part in original_keys:
            normalized_key: str = key_part.lower()
            key_variants.setdefault(normalized_key, []).append(key_part)

        conflicts: Dict[str, List[str]] = {}
        for normalized_key, originals in key_variants.items():
            # Conflict if multiple *unique* original keys normalize to the same key.
            unique_originals: List[str] = list(set(originals))
            if len(unique_originals) > 1:
                conflicts[normalized_key] = unique_originals

        if conflicts:
            print(f"{Colors.FAIL}  ❌ Literal key duplicates found in: {filepath}{Colors.ENDC}")
            for normalized, variants in conflicts.items():
                print(f"      Conflict Key '{normalized}': Variants found: {', '.join(variants)}")
            total_duplicate_files += 1
            all_pass = False

    if all_pass:
        print(f"{Colors.OKGREEN}All files pass the literal key duplicate check.{Colors.ENDC}")
    return all_pass, total_duplicate_files


def _find_conceptual_duplicates(files: List[str]) -> Tuple[bool, int]:
    """Finds conceptual duplicate keys (misspellings, deprecated keys) based on predefined groups."""
    print("\nSub-Operation: Checking for conceptual duplicates (faults/misspellings).")
    total_duplicate_files: int = 0
    all_pass: bool = True

    for filepath in files:
        normalized_keys, _ = _normalize_key_data(filepath)
        conflicts_found: bool = False

        for normalized_group_key, valid_variants in CONCEPTUAL_DUPLICATE_GROUPS.items():
            # Check if multiple normalized keys from the group exist in the file
            present_variants: List[str] = [
                variant for variant in valid_variants
                if variant.lower() in normalized_keys
            ]

            # If two or more variants from the same conceptual group are present, it's a conflict
            if len(present_variants) > 1:
                if not conflicts_found:
                    print(f"{Colors.FAIL}  ❌ Conceptual duplicates found in: {filepath}{Colors.ENDC}")
                    conflicts_found = True
                    all_pass = False

                print(f"      Conflict Group: {', '.join(valid_variants)}")
                print(f"      Found Keys: {', '.join(present_variants)}")

        if conflicts_found:
            total_duplicate_files += 1

    if all_pass:
        print(f"{Colors.OKGREEN}All files pass the conceptual duplicate check.{Colors.ENDC}")
    return all_pass, total_duplicate_files

def check_duplicates() -> None:
    """Action: Checks for both literal (case-insensitive) and conceptual (misspelling) duplicates."""
    files: List[str] = _get_files()
    if not files: return

    print(f"{Colors.BOLD}Operation:{Colors.ENDC} {Colors.OKBLUE}Running comprehensive duplicate key check on {len(files)} file(s).{Colors.ENDC}")

    # 1. Check for literal duplicates
    _, literal_files = _find_literal_duplicates(files)

    # 2. Check for conceptual duplicates
    _, conceptual_files = _find_conceptual_duplicates(files)

    total_conflicts: int = literal_files + conceptual_files

    print("-" * 50)
    print(f"{Colors.BOLD}Check completed.{Colors.ENDC} {total_conflicts} file(s) contain key conflicts (literal or conceptual).")

# ----------------------------------------------------------------------
# Argparse Configuration and Main Execution
# ----------------------------------------------------------------------

class SortedHelpFormatter(argparse.RawTextHelpFormatter):
    """HelpFormatter that sorts subparsers (actions) alphabetically."""
    def _get_subactions(self, action: argparse.Action, parser: Optional[argparse.ArgumentParser] = None) -> List[argparse.Action]:
        """Retrieves and sorts the sub-actions (commands) for display."""
        if isinstance(action, argparse._SubParsersAction):
            subactions: List[argparse.Action] = super()._get_subactions(action, parser)
            # Sort them by their destination name (which is the action command name)
            subactions.sort(key=lambda x: x.dest)
            return subactions
        else:
            return super()._get_subactions(action, parser)

def main() -> None:
    """Main execution function for the script."""
    parser = argparse.ArgumentParser(
        description=f"{Colors.BOLD}{Colors.OKCYAN}YAML Manager Tool{Colors.ENDC} for Front Matter key management (path: {DOCS_DIR}).",
        epilog="Use 'python yaml_manager.py <action> -h' for action-specific help.",
        formatter_class=SortedHelpFormatter
    )

    # Define subparsers and actions
    subparsers = parser.add_subparsers(dest="action", help="Available actions.")

    # ADD-KEY action
    parser_add = subparsers.add_parser(
        'add-key',
        help="Add a key with a default value to all files where it is missing."
    )
    parser_add.add_argument(
        "key_value",
        type=str,
        metavar="<KEY[,DEFAULT_VALUE]>",
        help="The key and its default value (e.g., 'language,en', 'status,draft').\n"
             "Omit the value to create an empty key (e.g., 'blueskyRecordKey')."
    )

    # CHECK-DUPLICATES action
    subparsers.add_parser(
        'check-duplicates',
        help="Find files with literal (case-insensitive) or conceptual key duplicates."
    )

    # NEW: CHECK-MANDATORY action
    subparsers.add_parser(
        'check-mandatory',
        help=f"Verify that all files contain the required keys: {', '.join(MANDATORY_KEYS)}."
    )

    # CHECK-SEO action (Added to CLI flags)
    subparsers.add_parser(
        'check-seo',
        help="Run content quality checks (mandatory keys, min/max lengths, lowercase tags)."
    )

    # CLEANUP-VARIANTS action
    parser_cleanup = subparsers.add_parser(
        'cleanup-variants',
        help="Clean up known variants of a key, prioritizing the target key."
    )
    parser_cleanup.add_argument(
        "target_key",
        type=str,
        metavar="<TARGET_KEY>",
        help="The canonical key to keep (e.g., 'series')."
    )
    parser_cleanup.add_argument(
        "variants",
        type=str,
        metavar="<VARIANTS_TO_REMOVE>",
        help="Comma-separated list of variant keys to remove (e.g., 'Series,serie')."
    )

    # FIND-MISSING action
    parser_find_missing = subparsers.add_parser(
        'find-missing',
        help="Find posts WITHOUT a specified key."
    )
    parser_find_missing.add_argument(
        "key",
        type=str,
        metavar="<KEY_TO_CHECK>"
    )

    # FIND-PRESENT action
    parser_find_present = subparsers.add_parser(
        'find-present',
        help="Find posts WITH a specified key."
    )
    parser_find_present.add_argument(
        "key",
        type=str,
        metavar="<KEY_TO_CHECK>"
    )

    # LIST-KEYS action
    subparsers.add_parser(
        'list-keys',
        help="List all unique front matter keys found across all files."
    )

    # LIST-VALUES action
    parser_list_values = subparsers.add_parser(
        'list-values',
        help="List all unique, alphabetically sorted values used by a specified key."
    )
    parser_list_values.add_argument(
        "key",
        type=str,
        metavar="<KEY_TO_CHECK>"
    )

    # REMOVE-KEY action
    parser_remove = subparsers.add_parser(
        'remove-key',
        help="Remove a specified key from all files that contain it."
    )
    parser_remove.add_argument(
        "key",
        type=str,
        metavar="<KEY_TO_REMOVE>"
    )

    # REORDER action
    subparsers.add_parser(
        'reorder',
        help="Reorder all front matter keys according to the predefined standard."
    )

    # Display full help page if no arguments are provided
    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    # Parse arguments
    args = parser.parse_args()

    # --- Execute Actions ---
    if args.action == 'reorder':
        reorder_keys()

    elif args.action == 'list-keys':
        list_keys()

    elif args.action == 'list-values':
        list_unique_key_values(args.key)

    elif args.action == 'find-missing':
        find_missing_key(args.key)

    elif args.action == 'find-present':
        find_key_present(args.key)

    elif args.action == 'check-seo':
        check_seo()

    elif args.action == 'check-mandatory':
        check_mandatory_keys() # NEW EXECUTION POINT

    elif args.action == 'add-key':
        try:
            key, default_value_str = _parse_key_value_arg(args.key_value)

            # Interactive confirmation if the user intends to add an empty key
            if not default_value_str:
                confirmation_prompt: str = (
                    f"{Colors.WARNING}⚠️ Warning: The default value for '{key}' is an empty string ('').\n"
                    f"Are you sure you want to create an empty key? ({Colors.BOLD}yes/no{Colors.ENDC}{Colors.WARNING}){Colors.ENDC} "
                )
                user_input: str = input(confirmation_prompt).strip().lower()
                if user_input not in ('yes', 'y'):
                    print(f"{Colors.OKCYAN}Operation 'add-key' cancelled by user.{Colors.ENDC}")
                    sys.exit(0)

            add_missing_key(key, default_value_str)

        except (ValueError, EOFError) as e:
            print(f"{Colors.FAIL}Error: {e}{Colors.ENDC}")
            sys.exit(1)

    elif args.action == 'remove-key':
        remove_key(args.key)

    elif args.action == 'cleanup-variants':
        target_key: str = args.target_key.strip()
        variants_to_remove: List[str] = [v.strip() for v in args.variants.split(',')]

        if not target_key or not variants_to_remove:
            print(f"{Colors.FAIL}Error: Both target_key and variants_to_remove must be specified.{Colors.ENDC}")
            sys.exit(1)

        # Ensure the target key isn't included in the list of keys to remove
        variants_to_remove = [v for v in variants_to_remove if v != target_key]

        if not variants_to_remove:
            print(f"{Colors.WARNING}No actual variants to remove. Operation skipped.{Colors.ENDC}")
            sys.exit(0)

        cleanup_key_variants(target_key, variants_to_remove)

    elif args.action == 'check-duplicates':
        check_duplicates()

    else:
        # Fallback in case a subparser was defined but not handled in the if/elif block
        parser.print_help()

if __name__ == "__main__":
    main()