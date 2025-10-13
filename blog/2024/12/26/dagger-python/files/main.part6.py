# cspell:ignore anyio,rcfile,pylintrc,workdir
import anyio

from typing import Annotated

import dagger
from dagger import DefaultPath, Doc, dag, function, object_type, Directory

@object_type
class Src:

    # This is the directory where source files are located (f.i. "/app/src")
    source: Annotated[
        Directory,
        Doc("The source folder; where the codebase is located"),
        DefaultPath("src")
    ]

    # This is the directory where configuration files are located (f.i. "/app/.config")
    config: Annotated[
        Directory,
        Doc("The folder container configuration files"),
        DefaultPath(".config")
    ]

    @function
    async def lint(self) -> str:
        """
        Lint python scripts using Pylint - Run analyses your code without actually running it (https://pypi.org/project/pylint/)
        """
        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","pylint"])
            .with_mounted_directory("/app/src", self.source)
            .with_mounted_directory("/app/config", self.config)
            .with_workdir("/app/src")
            .with_exec(["pylint",".","--rcfile","/app/config/.pylintrc"])
            .stdout()
        )

    @function
    async def format(self) -> str:
        """
        Format the script using Black (https://black.readthedocs.io/en/stable/)
        """
        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","black"])
            .with_mounted_directory("/app/src", self.source)
            .with_mounted_directory("/app/config", self.config)
            .with_workdir("/app/src")
            .with_exec(["black",".","--config","/app/config/black.toml"])
            .stdout()
        )

    @function
    async def mypy(self)-> str:
        """
        Mypy is a program that will type check your Python code (https://github.com/python/mypy/)
        """
        mypy_cache = dag.cache_volume("python_mypy")

        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","mypy"])
            .with_mounted_directory("/app/src", self.source)
            .with_mounted_directory("/app/config", self.config)
            .with_mounted_cache("/tmp/mypy", mypy_cache)
            .with_workdir("/app/src")
            # .with_exec(["ls","-alhR"])
            .with_exec(["mypy","--config-file",f"/app/config/mypy.ini","."])
            .stdout()
        )

    @function
    async def ruff(self) -> str:
        """
        An extremely fast Python linter and code formatter (https://github.com/astral-sh/ruff)
        """
        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","ruff"])
            .with_mounted_directory("/app/src", self.source)
            .with_mounted_directory("/app/config", self.config)
            .with_workdir("/app/src")
            .with_exec(["ruff","check","--config","/app/config/pyproject.toml", "."])
            .with_exec(["ruff","format","--config","/app/config/pyproject.toml", "."])
            .stdout()
        )

    @function
    async def run_all(self):
        """Run linter, type-checker, unit tests concurrently"""
        async with anyio.create_task_group() as tg:
            tg.start_soon(self.ruff)
            tg.start_soon(self.lint)
            tg.start_soon(self.format)
            tg.start_soon(self.mypy)
