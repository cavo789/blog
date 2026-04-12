import logging
import sys
from typing import Final

class AgentLogger:
    """Premium structured logging helper."""
    FORMAT: Final[str] = "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"

    @staticmethod
    def setup(verbose: bool = False) -> logging.Logger:
        level = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(
            level=level,
            format=AgentLogger.FORMAT,
            handlers=[
                logging.StreamHandler(sys.stdout),
                logging.FileHandler("/tmp/agent.log")
            ]
        )
        return logging.getLogger("AI-Agent")