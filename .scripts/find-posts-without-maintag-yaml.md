# 🏷️ Audit Markdown Files for Missing mainTag Metadata

This Bash script scans markdown files in your blog directory to identify posts that are missing the mainTag field in their YAML front matter. It helps ensure consistent tagging across your content, which is especially useful for organizing posts in static site generators or content platforms.

## 📦 Purpose

* ✅ Detect markdown files missing the mainTag metadata.
* 📋 Output a list of affected files for review or correction.
* 🧹 Maintain clean and complete front matter across your blog posts.

## 📁 Assumptions

* Markdown files are stored under the `./blog` directory.
* Each file contains YAML front matter enclosed between `---` markers.
* Files inside the `blog/XXX` directory are excluded from the scan.

## 🔍 What It Does

* Recursively scans all `.md` files in the `blog/` directory (excluding `blog/XXX`).
* Extracts the YAML front matter block.
* Checks if the mainTag field is missing.
* Outputs the file path of each markdown file missing the tag.

## 🚀 Usage

Run the script:

```bash
cd blog
./.scripts/find-posts-without-maintag-yaml.sh
```

or just, `make no-main-tag`.

## 📋 Output Example

```bash
blog/2025/08/30/my-post/index.md
blog/2025/08/29/another-post/index.md
```

## 🛠️ Requirements

* Bash shell
* `awk`, `find`, `sort` and standard Unix utilities

## ⚙️ Configuration

You can customize the following variable at the top of the script:

```bash
EXCLUDE_DIR="blog/XXX"  # Directory to exclude from scanning
```

## 📄 License

MIT License — free to use, modify, and distribute.
