# 📝 Add `inLanguage` to Markdown Front Matter

This script automatically adds an `inLanguage: en-US` field to the front matter of all `.md` and `.mdx` files in a specified blog directory—if the field doesn't already exist. It's useful for ensuring consistent metadata across your markdown-based blog posts, especially when working with static site generators like Hugo or Gatsby.

## 🚀 Features

* Recursively scans a blog directory for `.md` and `.mdx` files
* Detects YAML front matter blocks (`---`)
* Adds `inLanguage: en-US` only if it's missing
* Preserves original file formatting and content

## 📂 Directory Structure

By default, the script targets the `./blog` directory. You can modify the `BLOG_DIR` variable to point to your desired location.

## 🛠️ Usage

Run the script:

```bash
cd blog
./.scripts/add-language-in-blog-post.sh.sh
```

or just, `make add-language`.

## 🧠 How It Works

* Uses `sed` to extract YAML front matter
* Checks for the presence of `inLanguage:` using `grep`
* Uses `awk` to safely inject the field inside the front matter block
* Overwrites the original file only if necessary

## 🧪 Example Front Matter Before & After

Before:

```yaml
---
title: "My Blog Post"
date: 2023-08-31
---
```

After:

```yaml
---
inLanguage: en-US
title: "My Blog Post"
date: 2023-08-31
---
```

## ⚠️ Notes

The script assumes that front matter is delimited by `---` and appears at the top of the file.

It does not validate YAML syntax beyond checking for the presence of `inLanguage:`.

## 📄 License

This script is provided as-is under the MIT License. Feel free to modify and use it in your own projects.