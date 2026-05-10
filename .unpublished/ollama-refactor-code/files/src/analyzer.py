from pathlib import Path
from typing import Final

from ollama_client import OllamaClient


class CodeAnalyzer:
    def __init__(self, client: OllamaClient, rules_path: Path, debug: bool = False) -> None:
        self.client: Final[OllamaClient] = client
        self.rules_path: Final[Path] = rules_path
        self.debug: Final[bool] = debug

    def _get_specific_rules(self, filename: str) -> str:
        """Cherche les règles dans les sous-dossiers de configuration."""
        name_lower = filename.lower()
        extension = Path(filename).suffix.lstrip(".").lower()

        potential_paths = [
            self.rules_path / "files" / f"{name_lower}.txt",
            self.rules_path / "templates" / f"{name_lower}.txt",
            self.rules_path / "ext" / f"{extension}.txt",
        ]

        for path in potential_paths:
            if path.exists():
                if self.debug:
                    print(f"\033[92m[DEBUG] Rule source found: {path}\033[0m")
                return path.read_text(encoding="utf-8")

        if self.debug:
            print(
                f"\033[93m[DEBUG] No specific rules for {filename} (checked files/, templates/, ext/)\033[0m"
            )
        return ""

    def check_file(self, filename: str, content: str) -> str | None:
        # Liste exhaustive des types gérés
        supported_ext = [".py", ".php", ".sh", ".js", ".ts", ".yaml", ".yml", ".json"]
        is_special = filename.lower() in ["dockerfile", "docker-compose.yml", "compose.yaml"]

        if not (any(filename.endswith(ext) for ext in supported_ext) or is_special):
            return None

        # --- FIX PYLANCE: On définit explicitement que c'est une liste de strings ---
        parts: list[str] = []

        for part_name in ["global.txt", "output_format.txt"]:
            p = self.rules_path / part_name
            if p.exists():
                parts.append(p.read_text(encoding="utf-8"))

        specific_rules = self._get_specific_rules(filename)

        full_prompt = "\n\n".join(parts) + f"\n\nSPECIFIC RULES FOR {filename}:\n{specific_rules}"

        if self.debug:
            print("\n" + "—" * 50)
            print(f"[DEBUG] FINAL PROMPT SENT TO AI ({filename})")
            print(full_prompt)
            print("—" * 50 + "\n")

        return self.client.analyze_code(full_prompt, content)
