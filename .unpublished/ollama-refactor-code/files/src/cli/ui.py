"""Module for professional CLI output using Rich."""

from typing import Final, Literal

from rich.console import Console
from rich.markdown import Markdown
from rich.markup import escape
from rich.panel import Panel
from rich.syntax import Syntax

from core.file_utils import get_file_extension

ColorName = Literal["red", "green", "blue", "yellow", "cyan", "magenta", "white"]


class UIHelper:
    """Provides a professional CLI interface with forced color support."""

    # Default color for informational messages, preventing magic strings.
    DEFAULT_INFO_COLOR: Final[ColorName] = "cyan"

    def __init__(self) -> None:
        """Initialize Rich console with forced colors for Docker/Hooks."""
        self.console: Final[Console] = Console(highlight=False, force_terminal=True, width=120)

    def print_configuration(self, text: str, color: ColorName = "magenta") -> None:
        """Print a colored box for configuration details."""
        config_panel: Panel = Panel(
            f"[bold {color}]⚙️ CONFIG: {escape(text)}[/bold {color}]",
            border_style=color,
            expand=False,
        )
        self.console.print(config_panel)

    def print_section_header(self, title: str, icon: str, color: ColorName) -> None:
        """Print a colored section header in a box."""
        header_panel: Final[Panel] = Panel(
            f"[bold {color}]{icon} {escape(title.upper())}[/bold {color}]",
            border_style=color,
            expand=False,
        )
        self.console.print(header_panel)

    def print_analysis_results(self, text: str) -> None:
        """Print AI analysis results in Yellow."""
        self.print_section_header("ANALYSIS RESULTS", "📋", "yellow")
        markdown_content: Final[Markdown] = Markdown(text.strip())
        self.console.print(markdown_content)

    def print_code_block(self, code: str, filename: str) -> None:
        """Print highlighted source code with automatic language detection."""
        extension: Final[str] = get_file_extension(filename) or "python"

        # Syntax object explicitly typed for strict mode
        syntax_block: Final[Syntax] = Syntax(
            code,
            extension,
            theme="monokai",
            line_numbers=False,
            # This is the crucial change. It prevents Rich from truncating
            # long lines and delegates wrapping to the terminal itself.
            word_wrap=False,
            background_color="default",
        )

        # We pass a virtually infinite width directly to this print call to
        # ensure the code itself is never truncated, without affecting other
        # print calls that rely on the sane default console width.
        self.console.print(syntax_block, width=1000)

    def print_information(
        self, message: str, color: ColorName = DEFAULT_INFO_COLOR, bold: bool = True
    ) -> None:
        """Print a styled info line with escaped content."""
        style: Final[str] = f"bold {color}" if bold else color
        self.console.print(f"[{style}]{escape(message)}[/{style}]", no_wrap=True)

    def print_fatal_error(self, title: str, message: str) -> None:
        """Print a high-visibility error panel in Red."""
        fatal_panel: Final[Panel] = Panel(
            f"[bold white]{escape(message)}[/bold white]",
            title=f"[bold]❌ ERROR: {escape(title.upper())}[/bold]",
            border_style="red",
            style="on red",
        )
        self.console.print(fatal_panel)

    def print_markdown_block(self, text: str) -> None:
        """
        Renders a block of text as formatted Markdown.
        This is the definitive solution for displaying multi-line, formatted
        text from prompts or AI responses without truncation.
        """
        markdown_content: Final[Markdown] = Markdown(text.strip())
        self.console.print(markdown_content)
