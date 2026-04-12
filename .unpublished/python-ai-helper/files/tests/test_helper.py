from pathlib import Path

import pytest

from helper import *


def test_read_text_content():
    with pytest.raises(FileNotFoundError):
        read_text_content(Path("/nonexistent/file.txt"))


def test_write_text_content(tmp_path):
    file_path = tmp_path / "test.txt"
    write_text_content(file_path, "Hello, world!")
    assert read_text_content(file_path) == "Hello, world!"


def test_get_file_info(tmp_path):
    file_path = tmp_path / "test.txt"
    with open(file_path, "w") as f:
        f.write("Test content")
    info = get_file_info(file_path)
    assert isinstance(info["size_bytes"], int)
    assert isinstance(info["modified_at"], float)


def test_list_files_by_extension(tmp_path):
    (tmp_path / "test.txt").touch()
    (tmp_path / "test.py").touch()
    files = list_files_by_extension(tmp_path, "txt")
    assert len(files) == 1
    assert files[0].name == "test.txt"


def test_safe_delete(tmp_path):
    file_path = tmp_path / "test.txt"
    with open(file_path, "w") as f:
        f.write("Test content")
    assert safe_delete(file_path)
    assert not file_path.exists()
