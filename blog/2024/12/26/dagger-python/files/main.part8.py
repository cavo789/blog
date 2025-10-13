@function
    async def run_all(self):
        """Run linter, type-checker, unit tests concurrently"""
        async with anyio.create_task_group() as tg:
            tg.start_soon(self.ruff)
            tg.start_soon(self.lint)
            tg.start_soon(self.format)
            tg.start_soon(self.mypy)
