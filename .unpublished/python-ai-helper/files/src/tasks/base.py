from abc import ABC, abstractmethod
from pathlib import Path
from core.llm import OllamaClient

class MaintenanceTask(ABC):
    """Abstract base for all AI-powered maintenance operations."""
    def __init__(self, llm: OllamaClient):
        self.llm = llm

    @abstractmethod
    def run(self, file_path: Path, code: str) -> bool:
        pass