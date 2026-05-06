"""Module for professional CLI output using Rich."""

from typing import Final, Literal

from rich.console import Console
from rich.markup import escape
from rich.panel import Panel
from rich.syntax import Syntax

ColorName = Literal["red", "green", "blue", "yellow", "cyan", "magenta", "white"]


class UIHelper:
    """Provides a professional CLI interface with forced color support."""

    def __init__(self) -> None:
        """Initialize Rich console with forced colors for Docker/Hooks."""
        # Explicitly typing the attribute to prevent Pylance 'unknown member' errors
        self.console: Final[Console] = Console(highlight=False, force_terminal=True)

    def print_config(self, text: str) -> None:
        """Print a Magenta box for configuration details."""
        # Explicitly typed local variable to help static analysis
        config_panel: Final[Panel] = Panel(
            f"[bold magenta]⚙️ CONFIG:[/bold magenta] {escape(text)}",
            border_style="magenta",
            expand=False,
        )
        self.console.print(config_panel)

    def print_header(self, title: str, icon: str, color: ColorName) -> None:
        """Print a colored section header in a box."""
        header_panel: Final[Panel] = Panel(
            f"[bold {color}]{icon} {escape(title.upper())}[/bold {color}]",
            border_style=color,
            expand=False,
        )
        self.console.print(header_panel)

    def print_analysis_results(self, text: str) -> None:
        """Print AI analysis results in Yellow."""
        self.print_header("ANALYSIS RESULTS", "📋", "yellow")
        self.console.print(escape(text.strip()))

    def print_code_block(self, code: str, filename: str) -> None:
        """Print highlighted source code with automatic language detection."""
        extension: Final[str] = filename.split(".")[-1] if "." in filename else "python"

        # Syntax object explicitly typed for strict mode
        syntax_block: Final[Syntax] = Syntax(
            code,
            extension,
            theme="monokai",
            line_numbers=False,
            background_color="default",
        )
        self.console.print(syntax_block)

    def print_info(self, message: str, color: ColorName = "cyan", bold: bool = True) -> None:
        """Print a styled info line with escaped content."""
        style: Final[str] = f"bold {color}" if bold else color
        self.console.print(f"[{style}]{escape(message)}[/{style}]")

    def print_fatal(self, title: str, message: str) -> None:
        """Print a high-visibility error panel in Red."""
        fatal_panel: Final[Panel] = Panel(
            f"[bold white]{escape(message)}[/bold white]",
            title=f"[bold]❌ ERROR: {escape(title.upper())}[/bold]",
            border_style="red",
            style="on red",
        )
        self.console.print(fatal_panel)
