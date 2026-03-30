"""Configuration settings for the Tag Manager."""

import os

DOCS_DIR: str = 'blog'
FILE_PATTERN_BASE: str = os.path.join(DOCS_DIR, '**', '*.md*')
MAX_LENGTH_DIFFERENCE: int = 3

# AI Configuration
OLLAMA_URL: str = 'http://host.docker.internal:11434/api/generate'
OLLAMA_MODEL: str = 'gemma2:27b'  # Consider 'gemma2:27b' or 'mixtral:8x7b' for higher accuracy
OLLAMA_TIMEOUT: int = 30

MERGE_EXCEPTIONS: set[tuple[str, str]] = {
    ('ftp', 'sftp'),
    ('git', 'github'),
    ('git', 'gitlab'),
    ('mysql', 'sql'),
    ('php', 'phpcbf'),
    ('php', 'phpcs'),
    ('php', 'phpdoc'),
    ('scp', 'winscp'),
    ('ssh', 'sshpass'),
    ('xml', 'xmlstarlet'),
}
