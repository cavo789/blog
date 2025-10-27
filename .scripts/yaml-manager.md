# 🏷️ YAML Front Matter Manager

This is a Python command-line utility designed to maintain consistency, structure, and quality within the YAML front matter of a large collection of Markdown files (e.g., for a blog or documentation site).

It uses `python-frontmatter` and oyaml to reliably parse and write YAML while ensuring key order is preserved.

## 🚀 Setup

1. **Save the script**: Save the Python code above as `yaml_manager.py`.
2. **Install dependencies**: This script requires two main libraries.

    ```bash
    pip install python-frontmatter oyaml
    ```

3. **Configure**: Check the `DOCS_DIR` variable (currently set to `blog`) inside the script and update it to your content directory if needed.

## 📋 Key Order Standard

The script enforces a standard key order defined in `FRONTMATTER_KEY_ORDER`:

```python
FRONTMATTER_KEY_ORDER: List[str] = [
    'id', 'slug', 'title', 'subtitle',
    'date', 'updated',
    'description', 'authors', 'image', 'series',
    'mainTag', 'tags', 'categories', 'language'
]
```

All other keys not listed here are automatically placed at the end and sorted alphabetically.

## 💻 Usage and Examples

Run the script using python `yaml_manager.py <action> [arguments]`.

| Action | Description | Example |
| --- | --- | --- |
| `add-key` | Add a key with a default value to files where it's missing. | `python yaml_manager.py add-key 'language,en'` |
| `check-duplicates` | Find files with literal (e.g., date vs Date) or conceptual key conflicts. | `python yaml_manager.py check-duplicates` |
| `check-mandatory` | Verify that all files contain the required keys: `authors`, `date`, `description`, `image`, `language`, `mainTag`, `slug`, `tags`, `title` | `python yaml_manager.py check-mandatory` |
| `check-seo` | Run content quality checks (mandatory keys, min/max lengths, lowercase tags). | `python yaml_manager.py check-seo` |
| `cleanup-variants` | Consolidate variant keys to a single target key. | `python yaml_manager.py cleanup-variants canonicalUrl canonicalURL,canonical_url` |
| `find-missing` | Show files without a specific key. | `python yaml_manager.py find-missing date` |
| `find-present` | Show files with a specific key. | `python yaml_manager.py find-present subtitle` |
| `list-keys` | List all unique front matter keys found and count their occurrences. | `python yaml_manager.py list-keys` |
| `list-values` | List all unique values for a specific key (e.g., all distinct series). | `python yaml_manager.py list-values series` |
| `remove-key` | Delete a specified key from all files that contain it. | `python yaml_manager.py remove-key old_status` |
| `reorder` | **Standardize key order** in all files. | `python yaml_manager.py reorder` |

### 🎬 Available Actions and Detailed Explanations

#### `add-key`

This action facilitates the rollout of new front matter fields by inserting a key only into files where it is currently missing.

* **What it does**: Checks every file. If the specified key is absent, it is added with the provided default value.
* **Example (Adding a language key)**: `python yaml_manager.py add-key 'language,en'`
* **Example (Adding an empty key)**: `python yaml_manager.py add-key 'blueskyRecordKey'`

#### `check-duplicates`

Performs a comprehensive check for common key conflicts.

* **What it does**: Runs two sub-checks:
    1. **Literal Duplicates (Case-Insensitive)**: Flags files where two different casings of the same key exist (e.g., having both `Title` and `title` in the same front matter).
    2. **Conceptual Duplicates (Misspellings/Faults)**: Flags files where multiple keys from a predefined conflict group (like the `CONCEPTUAL_DUPLICATE_GROUPS`) are present simultaneously (e.g., having both `status` and `deprecatedStatus`).
* **Example**: `python yaml_manager.py check-duplicates`

#### `check-mandatory`

This action performs a general check to ensure a baseline set of required keys (`MANDATORY_KEYS`) is present in every post. This is used for structural integrity, separate from quality checks.

* **Configuration**: The list of keys checked is defined by `MANDATORY_KEYS` in the script.
* **Example:** `python yaml_manager.py check-mandatory`

#### `check-seo`

This action performs a comprehensive content quality and SEO check based on the dedicated configurations (`SEO_MIN_LENGTHS`, `SEO_MAX_LENGTHS`, `SEO_LOWERCASE_KEYS`, etc.).

##### Checks Performed

* **Mandatory SEO Keys**: Ensures keys like title, description, and slug are present.
* **Length Constraints**: Verifies title and description meet minimum/maximum character length recommendations.
* **Normalization**: Checks keys like tags and categories to ensure their values are consistently lowercase.
* **Example:**: `python yaml_manager.py check-seo`

#### `cleanup-variants`

This is a powerful standardization tool used to fix key misspellings or consolidate old/new key names.

* **What it does**: It standardizes one or more "variant" keys into a single "target" key.
    1. It checks the target key's value.
    2. If the target key is empty, it attempts to move the value from the first found variant key to the target key.
    3. It then **deletes** all specified variant keys, ensuring only the canonical key remains.

* **Example (Consolidating misspellings)**: `python yaml_manager.py cleanup-variants canonicalUrl canonicalURL,canonical_url`.

#### `find-missing`

Quickly locate all files that are missing a required key.

* **What it does**: Lists the file paths for every Markdown file that does **not** contain the specified `<KEY_TO_CHECK>`. This is typically the first step before running the `add-key` action.

* **Example**: `python yaml_manager.py find-missing date`.

#### `find-present`

Quickly locate all files that include a specific key.

* **What it does**: Lists the file paths for every Markdown file that contains the specified `<KEY_TO_CHECK>` in its front matter.

* **Example**: `python yaml_manager.py find-present subtitle`.

#### `list-keys`

Provides a high-level inventory of all unique keys used across all files.

* **What it does**: Scans every front matter block, collects every unique key name, and displays them alphabetically, along with a count of how many files contain that specific key. This is useful for identifying unused, deprecated, or potentially misspelled keys.
* **Example**: `python yaml_manager.py list-keys`.

#### `list-values`

Provides an inventory of the actual content used for a specific key.

**What it does**: Extracts all values associated with the `<KEY_TO_CHECK>` (e.g., `series`, `tags`). It handles lists (like tags) by treating each item in the list as a separate unique value. It then lists the unique values alphabetically and provides a count of how many files use that value.

* **Example**: `python yaml_manager.py list-values tags`.

#### `remove-key`

Used for quick cleanup of deprecated or unwanted keys across the entire content base.

* **What it does**: Iterates through all files and deletes the specified key from the front matter if it exists.
* **Example**: `python yaml_manager.py remove-key old_status`

#### `reorder`

This action iterates through all Markdown files and rewrites the YAML front matter to enforce the standard key order defined by `FRONTMATTER_KEY_ORDER`.

* **What it does**: Ensures keys appear in a predictable, standardized sequence (e.g., `title` always comes before `date`). It also applies custom YAML formatting rules, such as writing lists (like `tags` or `categories`) in **flow style** (inline) rather than block style, for a cleaner appearance:

```yaml
# Before
tags:
  - Python
  - CLI

# After (reorder ensures this format)
tags: [Python, CLI]
```

* **Example**: `python yaml_manager.py reorder`

## 📄 License

MIT — free to use, modify, and share.

## 💬 AI generated

This code has been generated by Christophe Avonture using AI.
