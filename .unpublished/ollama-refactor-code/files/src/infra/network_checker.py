"""Provides generic network utility functions, like service health checks."""

from typing import Final

import requests


class NetworkChecker:
    """A utility for checking network service availability."""

    DEFAULT_TIMEOUT: Final[int] = 5

    @staticmethod
    def is_service_available(
        url: str, endpoint_path: str = "/api/tags", timeout: int = DEFAULT_TIMEOUT
    ) -> bool:
        """
        Performs a health check on a given URL.

        Args:
            url: The base URL of the service to check.
            endpoint_path: The path to append to the base URL for the health check.
            timeout: The timeout in seconds for the request.

        Returns:
            True if the service responds with a 200 OK, False otherwise.
        """
        try:
            health_check_url: Final[str] = f"{url}{endpoint_path}"
            response: requests.Response = requests.get(health_check_url, timeout=timeout)
            return bool(response.status_code == 200)
        except requests.RequestException:
            return False
