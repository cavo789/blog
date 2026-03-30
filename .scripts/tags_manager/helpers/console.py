"""Terminal UI and color definitions."""

class Colors:
    """ANSI color codes for console output."""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def print_error(msg: str) -> None:
    """Prints a formatted error message."""
    print(f"{Colors.FAIL}{Colors.BOLD}ERROR: {msg}{Colors.ENDC}")

def print_warning(msg: str) -> None:
    """Prints a formatted warning message."""
    print(f"{Colors.WARNING}{msg}{Colors.ENDC}")

def print_success(msg: str) -> None:
    """Prints a formatted success message."""
    print(f"{Colors.OKGREEN}{msg}{Colors.ENDC}")

def print_info(msg: str) -> None:
    """Prints a formatted info message."""
    print(f"{Colors.OKBLUE}{msg}{Colors.ENDC}")
