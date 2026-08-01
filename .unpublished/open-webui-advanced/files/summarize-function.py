"""
Open WebUI Function: Summarize selection
Adds a button in the chat toolbar that summarizes the selected/pasted text.

Install: Open WebUI → Workspace → Functions → + New Function → paste this file
"""

from pydantic import BaseModel


class Tools:
    class Valves(BaseModel):
        """Configuration options shown in the function settings panel."""
        max_words: int = 200
        language: str = "English"

    def __init__(self):
        self.valves = self.Valves()

    def summarize(self, text: str, __user__: dict = {}) -> str:
        """
        Summarize the provided text.
        :param text: The text to summarize.
        :return: A concise summary.
        """
        prompt = (
            f"Summarize the following text in {self.valves.language} "
            f"using at most {self.valves.max_words} words. "
            f"Be concise and focus on the key points.\n\n{text}"
        )
        return prompt
