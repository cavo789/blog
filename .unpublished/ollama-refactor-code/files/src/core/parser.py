"""
Utilities for parsing complex string outputs, such as AI-generated responses.
"""

import re
from typing import Final


class AIResponseParser:
    """A collection of static methods to parse responses from the LLM."""

    @staticmethod
    def extract_fixed_code(text: str) -> str | None:
        """
        Extracts code content from within [FIXED_CODE]...[/FIXED_CODE] tags.
        Also removes markdown code fences (```) if they are present.
        """
        pattern: Final[str] = r"\[FIXED_CODE\](.*?)\[/FIXED_CODE\]"
        match: Final[re.Match[str] | None] = re.search(pattern, text, re.DOTALL)
        if not match:
            return None

        code: str = match.group(1).strip()
        # Clean up potential markdown fences included by the AI
        code = re.sub(r"^```[a-zA-Z]*\n|```$", "", code, flags=re.MULTILINE)
        return code.strip()
