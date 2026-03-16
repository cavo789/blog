#!/usr/bin/env python3
"""
Fetch 10 fake users from RandomUser API
and display the result as a Markdown table.
"""

from typing import Any, Dict, List
import requests

API_URL: str = "https://randomuser.me/api/"


def fetch_users() -> List[Dict[str, Any]]:
    """Call RandomUser API and return a list of users."""
    params: Dict[str, Any] = {"results": 10}

    response: requests.Response = requests.get(
        API_URL,
        params=params,
        timeout=10
    )
    response.raise_for_status()

    data: Dict[str, Any] = response.json()
    return data["results"]


def format_markdown_table(users: List[Dict[str, Any]]) -> str:
    """Convert users data into a Markdown table."""
    headers = ["Name", "Email", "Phone", "City", "Country"]

    lines = []
    lines.append("| " + " | ".join(headers) + " |")
    lines.append("| " + " | ".join(["---"] * len(headers)) + " |")

    for user in users:
        name = f"{user['name']['first']} {user['name']['last']}"
        email = user["email"]
        phone = user["phone"]
        city = user["location"]["city"]
        country = user["location"]["country"]

        lines.append(f"| {name} | {email} | {phone} | {city} | {country} |")

    return "\n".join(lines)


def main() -> None:
    """Main program."""
    users = fetch_users()
    markdown_table = format_markdown_table(users)
    print(markdown_table)


if __name__ == "__main__":
    main()
