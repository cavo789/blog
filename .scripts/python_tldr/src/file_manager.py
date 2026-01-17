from pathlib import Path
from typing import Final, List

class FileManager:
    """
    Handles file reading, content checking, and safe injection.
    """

    _FRONTMATTER_DELIMITER: Final[str] = "---"
    _IMAGE_START_TAG: Final[str] = "!["
    _TLDR_TAG: Final[str] = "<TLDR>"

    def __init__(self, file_path: Path) -> None:
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        self._file_path = file_path

    def read_content(self) -> str:
        """Reads the file content securely."""
        return self._file_path.read_text(encoding="utf-8")

    def has_tldr(self, content: str) -> bool:
        """
        Checks if the TLDR component is already present in the content.
        """
        return self._TLDR_TAG in content

    def inject_tldr(self, original_content: str, tldr_text: str) -> None:
        """
        Injects the TL;DR into the content using the custom <TLDR> React component.
        Inserts after the first image following the frontmatter.
        """
        lines: List[str] = original_content.splitlines()
        insertion_index: int = 0

        # 1. Detect Frontmatter end
        if lines and lines[0].strip() == self._FRONTMATTER_DELIMITER:
            try:
                frontmatter_end_index = lines.index(self._FRONTMATTER_DELIMITER, 1)
                insertion_index = frontmatter_end_index + 1
            except ValueError:
                insertion_index = 0

        # 2. Scan for the first image AFTER the frontmatter
        for i in range(insertion_index, len(lines)):
            line = lines[i].strip()
            if line.startswith(self._IMAGE_START_TAG):
                insertion_index = i + 1
                break

        # 3. Prepare the React Component content
        formatted_tldr = (
            f"\n{self._TLDR_TAG}\n"
            f"{tldr_text}\n"
            f"</TLDR>\n"
        )

        # 4. Insert and Save
        lines.insert(insertion_index, formatted_tldr)
        new_content = "\n".join(lines)

        self._file_path.write_text(new_content, encoding="utf-8")
        print(f"Successfully injected React <TLDR> into {self._file_path.name} (Line {insertion_index + 1})")
