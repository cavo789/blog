@function
async def lint(self, source: str) -> str:
    """
    Run Pylint on the codebase.
    """
    return f"\033[33mI'm inside your Dagger pipeline and I'll lint {source}\033[0m"
