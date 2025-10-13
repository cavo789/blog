from dagger import dag, DefaultPath, Directory, function, object_type
from typing import Annotated

@object_type
class Src:
    @function
    async def lint(self, source: Annotated[Directory, DefaultPath("src")]) -> str:
        """
        Run Pylint on the codebase.
        """
        print(f"\033[33mI'm inside your Dagger pipeline and I'll lint {source}\033[0m")

        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","pylint"])
            .with_mounted_directory("/app/src", source)
            .with_workdir("/app/src")
            .with_exec(["pylint","."])
            .stdout()
        )
