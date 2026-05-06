"""Diff generation engine using Rich formatting."""

import difflib

from rich.text import Text


class DiffEngine:
    """Generates colored differential views for code comparison."""

    @staticmethod
    def generate_colored_diff(old_code: str, new_code: str, filename: str) -> Text:
        """Creates a Rich Text object containing the colored diff."""
        old_lines: list[str] = old_code.splitlines(keepends=True)
        new_lines: list[str] = new_code.splitlines(keepends=True)

        diff = difflib.unified_diff(
            old_lines, new_lines, fromfile=f"a/{filename}", tofile=f"b/{filename}"
        )

        rich_diff: Text = Text()
        for line in diff:
            if line.startswith("+") and not line.startswith("+++"):
                rich_diff.append(line, style="green")
            elif line.startswith("-") and not line.startswith("---"):
                rich_diff.append(line, style="red")
            elif line.startswith("^"):
                rich_diff.append(line, style="cyan")
            else:
                rich_diff.append(line)

        return rich_diff
