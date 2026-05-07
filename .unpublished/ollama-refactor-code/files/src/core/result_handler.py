"""
Handles the processing and presentation of AI code review results.
"""

from typing import Final

from rich.text import Text

from cli.diff import DiffEngine
from cli.ui import UIHelper
from core.parser import AIResponseParser
from core.validator import CodeValidator


class ReviewResultHandler:
    """Processes AI responses and presents them to the user."""

    def __init__(self, ui: UIHelper, validator: CodeValidator) -> None:
        """Initializes the handler with necessary UI and validation components."""
        self.ui: Final[UIHelper] = ui
        self.validator: Final[CodeValidator] = validator

    def _handle_rejected(
        self, review: str, filename: str, original_content: str, show_diff: bool
    ) -> None:
        """Processes a rejected file, validates, and displays feedback."""
        explanation: Final[str] = review.split("[FIXED_CODE]")[0].replace("REJECTED:", "")
        self.ui.print_analysis_results(explanation)

        fixed_code: Final[str | None] = AIResponseParser.extract_fixed_code(review)
        if not fixed_code:
            return

        if not self.validator.validate(fixed_code, filename):
            self.ui.print_fatal_error(
                "AI Code Validation Failed",
                "The AI returned code with a syntax error.",
            )
            return

        self.ui.print_section_header("Refactored Source", "🛠️", "cyan")
        self.ui.print_code_block(fixed_code, filename)

        if show_diff:
            self.ui.print_section_header("Differential View", "Δ", "blue")
            diff: Final[Text] = DiffEngine.generate_colored_diff(
                original_content, fixed_code, filename
            )
            self.ui.console.print(diff)

    def process(
        self,
        review: str | None,
        filename: str,
        original_content: str,
        show_diff: bool,
    ) -> bool:
        """
        Processes the review result for a single file.
        Returns True if the file was rejected, False otherwise.
        """
        if review is None:  # File was skipped by analyzer filters
            return False

        if "REJECTED" in review.upper():
            self.ui.print_section_header(f"REJECTED: {filename}", "❌", "red")
            self._handle_rejected(review, filename, original_content, show_diff)
            return True

        self.ui.print_information(f"✔ {filename}: LGTM", "green")
        return False
