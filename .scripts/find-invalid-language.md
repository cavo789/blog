# 🧪 PrismJS Language Audit for Markdown Code Blocks

This Bash script scans markdown files in your blog directory to identify all code block languages used, verifies their compatibility with PrismJS (used by Docusaurus 3.x), and checks for the presence of corresponding SVG logos in your Snippet component directory.

## 📦 Purpose

* ✅ Ensure all code blocks use languages supported by PrismJS.
* 🖼️ Verify that each language has an associated logo SVG file.
* ⚠️ Suggest valid PrismJS alternatives for unsupported or aliased languages.

## 📁 Directory Structure

* Markdown files are located in: `./blog`
* SVG logos are expected in: `./src/components/Snippet`

## 🔍 What It Does

* Recursively scans `.md` and `.mdx` files for code blocks (e.g., ````python`).
* Extracts and normalizes language identifiers.
* Checks each language against a list of PrismJS-supported languages.
* Verifies if a corresponding logo file exists: `<language>-logo.svg`.
* Provides suggestions for common aliases (e.g., `c++` → `cpp`, `py` → `python`).

## 🧠 How It Works

1. Language Detection Uses grep and sed to extract language identifiers from code blocks.
2. Support Check Compares each language against a hardcoded list of PrismJS-supported languages.
3. Alias Resolution Maps common aliases to their PrismJS equivalents using a predefined dictionary.
4. Logo Verification Checks for the existence of `<language>-logo.svg` in the `Snippet` directory.

## 🚀 Usage

Run the script:

```bash
cd blog
./.scripts/find-invalid-language.sh
```

or just, `make invalid-language`.

## 📋 Output Example

```bash
✅ python → supporté | 🖼️ logo : ✅
✅ bash → supporté | 🖼️ logo : ❌ (manquant : bash-logo.svg)
⚠️  c++ → non supporté → Suggestion : cpp
❌ fooLang → non supporté (aucune suggestion)
```

## 🛠️ Requirements

* Bash shell
* `grep`, `sed`, `tr` and standard Unix utilities

## 🌐 Reference

PrismJS supported languages: https://prismjs.com/#supported-languages

## 📄 License

MIT License — free to use, modify, and distribute.
