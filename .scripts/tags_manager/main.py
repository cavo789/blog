#!/usr/bin/env python3
"""Entry point for the Tag Manager application."""

import os
import sys
import argparse

# In main.py
from config import DOCS_DIR
from core import list_tags, suggest_tags_for_file, process_files
from helpers import Colors, print_error, print_success

def main() -> None:
    """Main CLI execution flow."""
    parser = argparse.ArgumentParser(
        description=f"{Colors.BOLD}{Colors.OKCYAN}Tag Manager Tool{Colors.ENDC} for Markdown files (path: {DOCS_DIR}).",
        epilog="Use 'python main.py <action> -h' for action-specific help.",
        formatter_class=argparse.RawTextHelpFormatter
    )

    subparsers = parser.add_subparsers(dest="action", help="Available actions.")

    parser_list = subparsers.add_parser('list', help=f"List tags in '{DOCS_DIR}', sorted by frequency/name.")
    parser_list.add_argument('--sort', type=str, choices=['name', 'count'], default='count',
                             help="Sort method: 'count' (default) or 'name'.")

    parser_delete = subparsers.add_parser('delete', help=f"Delete a tag from all files in '{DOCS_DIR}'.")
    parser_delete.add_argument("tag", type=str, help="The tag to DELETE (e.g., 'draft').")

    parser_rename = subparsers.add_parser('rename', help=f"Rename a tag across all files in '{DOCS_DIR}'.")
    parser_rename.add_argument("tags", type=str, help="Format: 'old_tag,new_tag' (e.g., 'prog,programming').")

    parser_suggest = subparsers.add_parser('suggest', help="Use AI to suggest tags for a file.")
    parser_suggest.add_argument("file", type=str, help="Path to the .md file.")

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    args = parser.parse_args()

    if args.action == 'list':
        list_tags(args.sort)

    elif args.action == 'suggest':
        print(f"{Colors.BOLD}Suggesting tags for: {Colors.OKBLUE}{args.file}{Colors.ENDC}")
        suggestions = suggest_tags_for_file(args.file)
        if suggestions:
            print_success(f"Suggested tags: {', '.join(suggestions)}")
        else:
            print_error("No tags were suggested.")

    elif args.action in ('delete', 'rename'):
        old_tag: str | None = None
        new_tag: str | None = None

        if args.action == 'delete':
            old_tag = args.tag
        elif args.action == 'rename':
            if ',' not in args.tags:
                print_error("Rename argument must be in 'OLD_TAG,NEW_TAG' format.")
                sys.exit(1)
            try:
                old_tag, new_tag = [t.strip() for t in args.tags.split(',', 1)]
                if not old_tag or not new_tag:
                    raise ValueError
            except ValueError:
                print_error("Both tags must be specified. Expected format: 'OLD_TAG,NEW_TAG'.")
                sys.exit(1)

        process_files(action=args.action, old_tag=old_tag, new_tag=new_tag)

if __name__ == "__main__":
    main()
