# 🔗 Markdown Audit for Missing blueskyRecordKey

This Bash script scans markdown files in your blog directory to identify posts that are missing the blueskyRecordKey field in their YAML front matter. For each such file, it generates a corresponding URL based on its folder name, helping you track and potentially publish missing records to platforms like Bluesky.

## 📦 Purpose

* ✅ Detect markdown files missing the blueskyRecordKey metadata.
* 🔗 Generate a URL for each file based on its directory name.µ
* 📤 Prepare for publishing or syncing with external services like Bluesky.

## 📁 Assumptions

* Markdown files are stored under the `./blog` directory.
* Each file has YAML front matter enclosed between `---` markers.
* The last folder name before the `.md` file is used as the slug.
* Files inside `blog/XXX` are excluded from the scan.

## 🔍 What It Does

* Recursively scans all `.md` or `.mdx` files in the `blog/` directory (excluding `blog/XXX)`.
* Extracts the YAML front matter block.
* Checks if the `blueskyRecordKey` field is missing.
* Constructs a URL using the base path and the file's slug.
* Outputs a list of file paths and their corresponding URLs.

## 🚀 Usage

Run the script:

```bash
cd blog
./.scripts/find-posts-without-bluesky-repost.sh
```

or just, `make not-yet-shared`.

## 📋 Output Example

```bash
blog/2025/08/30/my-post/index.md           https://www.avonture.be/blog/my-post
blog/2025/08/29/another-post/index.md      https://www.avonture.be/blog/another-post
```

## 🛠️ Requirements

* Bash shell
* `awk`, `find`, `sort` and standard Unix utilities

## ⚙️ Configuration

You can customize the following variables at the top of the script:

```bash
EXCLUDE_DIR="blog/XXX"                  # Directory to exclude
BASE_URL="https://www.avonture.be/blog" # Base URL for constructing links
```

## 📄 License

MIT License — free to use, modify, and share.
