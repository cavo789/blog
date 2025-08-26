# 🧹 Snippet Filename Extractor

This Bash script scans Markdown (`.md`) and MDX (`.mdx`) files in the `./blog` directory to extract and normalize filenames from `<Snippet filename="...">` tags. It filters out unwanted extensions and outputs a deduplicated, sorted list of relevant snippet types.

## 📂 How It Works

1. Navigates to the `./blog` directory.
2. Searches for all `<Snippet filename="...">` tags in `.md` and `.mdx` files.
3. Extracts the filename values.
4. Normalizes them to lowercase.
5. Filters out common or irrelevant extensions using a predefined ignore list.
6. Outputs a sorted, unique list of remaining file types.

## 🚫 Ignored Extensions

The script excludes filenames with the following extensions or names:

```text
bat, js, javascript, py, python, php, css, json, yaml, yml, vb, vba, vbs, xml, bashrc, sh, zsh, dockerfile, .dockerignore, cmd, md, qmd, markdownlint_ignore, bas, html, sql, zshrc, txt, ini, toml, ps1, makefile, svg
```

## 🛠 Requirements

- Bash shell
- `grep`, `sed`, `awk`, and `sort` utilities (standard on most Unix-like systems)

## ▶️ Usage

```bash
./get-snippets-extensions.sh
```
