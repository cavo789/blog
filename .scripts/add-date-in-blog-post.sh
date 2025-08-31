#!/bin/bash

# Set the path to your blog directory
BLOG_DIR="./blog"

# Function to add the date to the front matter of each markdown file
add_date_to_frontmatter() {
  local file_path="$1"

  # Extract year, month, day from the folder structure
  relative_path="${file_path#${BLOG_DIR}/}"  # Remove the blog base directory from the path
  IFS="/" read -r year month day _ <<< "$relative_path"

  # Ensure the date is valid (in case of folder structure issues)
  if [[ ! "$year" || ! "$month" || ! "$day" ]]; then
    echo "Skipping $file_path: Invalid folder structure"
    return
  fi

  # Format the date as YYYY-MM-DD
  date="$year-$month-$day"

  # Use awk to safely manipulate the front matter while preserving content
  awk -v date="$date" '
    BEGIN { inside_front_matter = 0; added_date = 0 }

    # Detect the start and end of the front matter
    /^---$/ {
      inside_front_matter = (inside_front_matter == 0) ? 1 : 0
      print $0
      next
    }

    # Add date inside the front matter if not already present
    inside_front_matter == 1 && !added_date {
      # Ensure the date is added after the other keys, not as the first line
      print "date: " date
      added_date = 1
    }

    # Print all lines
    { print $0 }
  ' "$file_path" > temp_file && mv temp_file "$file_path"

  echo "Added date to: $file_path"
}

# Traverse the blog directory and process each file
find "$BLOG_DIR" -type f \( -iname "*.md" -o -iname "*.mdx" \) | while read -r file; do
  add_date_to_frontmatter "$file"
done
