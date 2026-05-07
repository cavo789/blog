# FILE: src/core/exceptions/files.py

"""Custom exceptions related to file system operations."""


class DirectoryAccessError(Exception):
    """Raised when a directory cannot be created or written to."""


class FileReadError(Exception):
    """Raised when a file cannot be read due to permissions or other OS issues."""


class FileWriteError(Exception):
    """Raised when a file cannot be written to the disk."""
