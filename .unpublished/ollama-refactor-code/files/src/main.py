# FILE: src/main.py

"""
Main entry point for the AI Code Reviewer application.
This script initializes and runs the main application logic.
"""

from app import CodeReviewApp


def main() -> None:
    """Initializes and runs the CodeReviewApp."""
    app: CodeReviewApp = CodeReviewApp()
    app.run()


if __name__ == "__main__":
    main()
