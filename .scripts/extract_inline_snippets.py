"""
Script to Externalize Inline Code Snippets from Markdown Files

This utility processes multiple Markdown files, identifies code blocks enclosed
within custom <Snippet> tags, extracts the code content, and saves it to
separate files in a dedicated 'files/' subdirectory relative to the Markdown file.

Key Features:
1. Extracts code content from the Markdown file and saves it to a file named
   after the <Snippet filename="..."> attribute.
2. Creates the 'files/' subdirectory only if there is code to externalize.
3. Automatically handles path placeholders in 'filename' (e.g., /tmp/config.txt -> config.txt).
4. Resolves naming conflicts by appending '.part2', '.part3', etc., to the externalized file.
5. Replaces the original <Snippet>...</Snippet> block with a self-closing tag
   <Snippet filename="..." source="./files/..." /> pointing to the new file.
6. Ignores snippets targeting files with a '.md' extension to prevent externalizing Markdown into Markdown.

Usage:
1. Save this code as 'externalize_snippets.py'.
2. Set the 'markdown_files_pattern' variable to target your documentation files.
3. Run the script: python externalize_snippets.py
"""
import re
import os
import glob
from pathlib import Path

def extract_and_replace_snippets(markdown_file_path):
    """
    Core logic to process a single Markdown file.

    Extracts content from <Snippet> tags, externalizes it to the 'files' subdirectory,
    handles conflicts, and updates the Markdown file with 'source' references.
    """

    # Absolute path of the Markdown file
    md_path = Path(markdown_file_path)
    # Directory where the Markdown file is located
    md_dir = md_path.parent
    # The 'files' subdirectory relative to the Markdown file
    files_dir = md_dir / "files"

    # Display the file path relative to the directory where the script is run
    relative_path = md_path.relative_to(Path.cwd()) if md_path.is_relative_to(Path.cwd()) else md_path
    print(f"Processing file: {relative_path}")

    try:
        # Read the content of the Markdown file
        content = md_path.read_text(encoding='utf-8')
    except Exception as e:
        print(f"Error reading file {md_path.name}: {e}")
        return

    # Regular expression to find <Snippet>...</Snippet> blocks
    regex = re.compile(
        r'<Snippet\s+filename="([^"]+)">(.*?)</Snippet>',
        re.DOTALL
    )

    def replacement_function(match):
        """
        Function called by re.sub() for each <Snippet> match found.
        Handles filename cleaning, conflict resolution, file creation, and tag replacement.
        """
        # --- Extracting base filename ---
        full_path_filename = match.group(1).strip()
        # Use Path().name to safely extract only the file name, stripping directories (like /tmp/)
        filename = Path(full_path_filename).name
        # --------------------------------

        # --- LOGIC: IGNORE .md FILES ---
        if filename.lower().endswith('.md'):
            print(f"  ⚠️ Skipping snippet for '{filename}': Target is a Markdown file (.md).")
            # Return the original matched text unchanged
            return match.group(0)
        # -----------------------------------

        raw_snippet_content = match.group(2).strip()

        # Extract the inline code content (everything between the triple backticks)
        code_match = re.search(r'```[a-zA-Z\s]*\n(.*?)\n```', raw_snippet_content, re.DOTALL)

        if code_match:
            snippet_content = code_match.group(1).strip()
        else:
            print(f"  ⚠️ Warning: No code block (```...```) found for '{filename}'. Snippet ignored.")
            return match.group(0)

        # --- Determine the output path and handle conflicts ---

        # The initial filename is the base filename (e.g., ".htaccess")
        current_filename = filename

        # Relative path to use in the 'source' attribute (e.g., files/.htaccess)
        relative_filepath_base = Path("files") / current_filename

        # Absolute path for file writing
        output_filepath = files_dir / current_filename

        # Conflict resolution (adding .part2, .part3, etc.)
        part_counter = 2
        while output_filepath.exists():
            print(f"  ⚠️ Existing file: {output_filepath.name}. Adding '.part{part_counter}'.")

            # Recalculate the new filename with the .partX suffix
            if "." not in filename or filename.startswith('.'):
                # Handles files like .env or LICENSE (no standard extension or starts with dot)
                new_filename = f"{filename}.part{part_counter}"
            else:
                # Handles files like compose.yaml or index.html
                base, ext = filename.rsplit('.', 1)
                new_filename = f"{base}.part{part_counter}.{ext}"

            # Update current filename and paths for the next check/write
            current_filename = new_filename
            relative_filepath_base = Path("files") / current_filename
            output_filepath = files_dir / current_filename
            part_counter += 1

        # --- CONDITIONAL FOLDER CREATION: Create 'files' directory ONLY HERE ---
        try:
            files_dir.mkdir(exist_ok=True)
        except Exception as e:
            print(f"  ❌ Error creating directory {files_dir}: {e}")
            return match.group(0) # Abort processing this snippet

        # --- Write the snippet content to the new file ---
        try:
            # Note: We use the final 'output_filepath' here, which may contain .partX
            output_filepath.write_text(snippet_content + '\n', encoding='utf-8')
            print(f"  ✅ File created: {relative_filepath_base}")
        except Exception as e:
            print(f"  ❌ Write error for {relative_filepath_base}: {e}")
            return match.group(0)

        # --- Return the new self-closing <Snippet /> tag ---
        # The 'filename' attribute keeps the ORIGINAL name for reference/metadata
        # The 'source' attribute uses the new relative path (which might include .partX)
        return f'<Snippet filename="{full_path_filename}" source="./{relative_filepath_base}" />'

    # Apply the replacement function to all file content
    new_content = regex.sub(replacement_function, content)

    # Check if any modifications were made
    if new_content != content:
        try:
            # Write the modified content back to the original file
            md_path.write_text(new_content, encoding='utf-8')
            print(f"  🎉 File {md_path.name} updated successfully.\n")
        except Exception as e:
            print(f"  ❌ Write error for modified file {md_path.name}: {e}\n")
    else:
        print(f"  No modifications in {md_path.name}.\n")

# --- Main Part of the Script ---

if __name__ == "__main__":
    # Use a pattern to find all your Markdown files
    # CAUTION: The pattern is relative to the directory where you run the script.
    # Recommended default: './**/*.md' to process all files recursively.
    markdown_files_pattern = './**/*.md' # Set this to your desired path pattern

    # Use glob.glob to find all matching files
    file_list = glob.glob(markdown_files_pattern, recursive=True)

    if not file_list:
        print(f"No files found with the pattern '{markdown_files_pattern}'. Check the path.")
    else:
        print("="*60)
        print(f"Starting snippet externalization for {len(file_list)} Markdown files...")
        print("="*60)
        for file_path in file_list:
            extract_and_replace_snippets(file_path)

    print("="*60)
    print("Processing finished.")
    print("="*60)