#!/bin/bash

# Set the path to your blog directory
BLOG_DIR="./blog"

# Function to add the inLanguage to the front matter of each markdown file
add_inlanguage_to_frontmatter() {
  local file_path="$1"

  # Extract the front matter from the file (everything between the first and second '---')
  front_matter=$(sed -n '/^---$/,/^---$/p' "$file_path")

  # Check if the file does not contain the 'inLanguage' field in the front matter
  if ! echo "$front_matter" | grep -q '^inLanguage:.*'; then
    # Read the content of the file (carefully handle newlines)
    content=$(<"$file_path")

    # Use awk to safely insert inLanguage field inside the front matter without disturbing the file
    awk '
      BEGIN { inside_front_matter = 0; added_inLanguage = 0 }

      # Identify front matter start and end
      /^---$/ {
        inside_front_matter = (inside_front_matter == 0) ? 1 : 0
        print $0
        next
      }

      # If inside front matter, and inLanguage is not added, add it
      inside_front_matter == 1 && !added_inLanguage {
        print "inLanguage: en-US"
        added_inLanguage = 1
      }

      # Print the rest of the lines as they are
      { print $0 }
    ' "$file_path" > temp_file && mv temp_file "$file_path"

    echo "Added inLanguage to: $file_path"
  else
    echo "inLanguage already exists in: $file_path"
  fi
}

# Traverse the blog directory and process each file
find "$BLOG_DIR" -type f \( -iname "*.md" -o -iname "*.mdx" \) | while read -r file; do
  add_inlanguage_to_frontmatter "$file"
done
