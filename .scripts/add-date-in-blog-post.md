# 🗓️ Add Date to Markdown Front Matter

This Bash script automatically inserts a date field into the front matter of markdown (`.md` or `.mdx`) files in a blog directory. It extracts the date from the folder structure and ensures each file has consistent metadata for use in static site generators like Hugo, Jekyll, or Next.js..

## 📁 Folder Structure Assumption

The script expects your blog posts to be organized in the following format:

```bash
./blog/YYYY/MM/DD/post-title/index.md
```

Example:

```bash
./blog/2025/08/30/my-first-post/index.md
```

From this structure, the script derives the date `2025-08-30` and adds it to the front matter of the markdown file.

## ⚙️ How It Works

* Traverses all `.md` and `.mdx` files under the `./blog` directory.
* Extracts the date from the folder path.
* Checks if the file already contains a date: field.
* If not, it inserts the date into the front matter (between `---` markers).

## 🚀 Usage

Run the script:

```bash
cd blog
./.scripts/add-date-in-blog-post.sh
```

or just, `make add-date`.

## 🧠 Notes

* The script assumes that the front matter starts and ends with `---`.
* Files with an existing `date:` field will be skipped.
* Invalid folder structures (missing year/month/day) will be ignored with a warning.

## 📌 Example Output

For a file at `/blog/2025/08/30/my-post/index.md` without a date, the script will update it like this:

```markdown
---
date: 2025-08-30
title: My Post
---

Content goes here...
```

## 🛠️ Requirements

* Bash shell
* `grep`, `sed` and `find` utilities (standard on most Unix-like systems)

## 📄 License

MIT License — feel free to use, modify, and share.