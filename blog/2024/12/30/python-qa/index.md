---
slug: python-qa
title: Python - Code Quality tools
date: 2024-12-30
description: Elevate your Python code quality! Discover 9 essential static analysis tools like Pylint, Black, and mypy, plus an optimal QA workflow to ensure cleaner, bug-free code.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags:
  - code-quality
  - devcontainer
  - docker
  - python
language: en
updates:
  - date: 2026-08-09
    note: "Restructured for time-to-value: the make qa run now opens the article, before the tool-by-tool catalog."
  - date: 2026-07-30
    note: "pydocstyle GitHub repo was archived November 2023 and is no longer maintained; Ruff (see Extra section) is the recommended replacement for docstring checks."
blueskyRecordKey: 3lymragaqr22l
---
<!-- markdownlint-disable-file MD010 -->
<!-- cspell:ignore analyser,pylint,Autoflake,isort,mypy,pyright,pydocstyle,pylintrc,docparams -->
<!-- cspell:ignore rcfile,pyflakes,pycodestyle,mccabe,pyproject -->

![Python - Code Quality tools](/img/v2/clean_code.webp)

<TLDR>
This article catalogs the author's Python code-quality toolchain — Pylint, Autoflake, isort, Vulture, pydocstyle, mypy, Pyright, Black, and Prospector, plus Ruff as an emerging fast all-in-one alternative — with the exact CLI command and config file for each. They're chained together, fastest/most fundamental first, in a `make qa` target that stops at the first failure and only prints "CONGRATULATIONS" when every check passes.
</TLDR>

If you're a self-respecting programmer, you can't develop without code analysis tools. For PHP programmers, you already know a lot of them (`rector`, `phpstan`, `phan`, `phpcs`, ...). See my previous articles <Link to="/blog/php-rector">Rector 1.0.0, my friend, my coach</Link> and <Link to="/blog/php-jakzal-phpqa">Docker image that provides static analysis tools for PHP</Link>.

What about Python?

<!-- truncate -->

## The Result: One Command, Nine Checks, One Clear Failure Point

`make qa` chains Pylint, Autoflake, isort, Vulture, pydocstyle, mypy, Pyright, Black and Prospector — fastest tool first — and stops at the very first failure. Here's what a clean run looks like:

<Terminal typewriter source="./files/terminal-qa.txt" />

Nothing green to look for: silence (or a rating like Pylint's `10.00/10`) means the check passed. Miss a single one and the chain stops right there — no **CONGRATULATIONS**, and only one thing to fix before re-running.

## Why It Works

- Tools run fastest/most fundamental first: no point running a slow type-checker if the code doesn't even parse — that's why Pylint is 1/9 and Autoflake, cleaning up imports, is 2/9.
- The chain stops at the first failure: one `make qa` run, one clear thing to fix, not nine reports to reconcile.
- `make qa` is a single entry point: the same target is what you run by hand, what a pre-commit hook runs, and what CI runs — more on that in the conclusion.

## Installation

I'm a big fan of static code quality tools and here is my short list, wired together with a <Link to="/blog/tags/makefile">makefile</Link> action called `qa`:

<Snippet filename="makefile" source="./files/makefile" />

As soon as an error is detected, the script stops. You'll see the **CONGRATULATIONS** message, exactly as shown above, only if all nine checks are successful.

## More Demos: The Nine Tools, One by One

### 1. Pylint

>[https://pypi.org/project/pylint/](https://pypi.org/project/pylint/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.pylint)
>
> Pylint is a static code analyzer for Python 2 or 3. The latest version supports Python 3.9.0 and above.
>
> Pylint analyzes your code without actually running it. It checks for errors, enforces a coding standard, looks for code-smells, and can make suggestions about how the code could be refactored.

First things first: make sure your Python code has no syntax errors — no bad indentation, no forgotten `:` at the end of a control statement (like an `if` or `for`).

I'm running it like this: `pylint . --rcfile .config/.pylintrc`.

<Snippet filename=".config/.pylintrc" source="./files/.pylintrc" />

### 2. Autoflake

> [https://pypi.org/project/autoflake/](https://pypi.org/project/autoflake/)
>
> Autoflake removes unused imports and unused variables from Python code. It makes use of pyflakes to do this.
>
> By default, Autoflake only removes unused imports for modules that are part of the standard library. (Other modules may have side effects that make them unsafe to remove automatically.) Removal of unused variables is also disabled by default.
>
> Autoflake also removes useless pass statements by default.

I'm running it like this: `autoflake --remove-unused-variables --remove-all-unused-import --recursive .`

### 3. isort

> [https://pycqa.github.io/isort/](https://pycqa.github.io/isort/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.isort)
>
> `isort` your imports, so you don't have to.
>
> isort is a Python utility / library to sort imports alphabetically, and automatically separates into sections and by type. It provides a command line utility, Python library and plugins for various editors to quickly sort all your imports. It requires Python 3.7+ to run but supports formatting Python 2 code too.

I'm running it like this: `isort .`

Note: I've also configured my VSCode with this setting `"python.sortImports.args": ["--profile", "black"]` so import statements are automatically sorted while I'm coding.

### 4. vulture

> [https://github.com/jendrikseipp/vulture](https://github.com/jendrikseipp/vulture)
>
> Vulture finds unused code in Python programs. This is useful for cleaning up and finding errors in large code bases. If you run Vulture on both your library and test suite you can find untested code.
>
> Due to Python's dynamic nature, static code analyzers like Vulture are likely to miss some dead code. Also, code that is only called implicitly may be reported as unused. Nonetheless, Vulture can be a very helpful tool for higher code quality.

I'm running it like this: `vulture --min-confidence 100 .`

<AlertBox variant="danger">
Be careful with Vulture because its algorithm will detect a lot of false positives so this is why, in my automation process, I've used `--min-confidence 100` to make sure I've **only** real unused code / variables.

</AlertBox>

Note: I've also configured my VSCode with the settings below so, while I'm coding, VSCode will notify me about unused things so I can immediately take action.

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

### 5. pydocstyle

> [https://www.pydocstyle.org/en/stable/](https://www.pydocstyle.org/en/stable/)
>
> `pydocstyle` is a static analysis tool for checking compliance with Python docstring conventions.

This tool checks the quality of your comments, such as your function descriptions, and, for example, makes sure that if you have a function with two arguments, your description explains both arguments (there's a check on the name and the type).

I'm running it like this: `pydocstyle --config=.config/.pydocstyle`

<Snippet filename=".config/.pydocstyle" source="./files/.pydocstyle" />

<AlertBox variant="caution">
The pydocstyle GitHub repository was archived in November 2023 and is no longer actively maintained. The community recommends migrating to **Ruff** (see the "Under the Hood" section below), which covers equivalent docstring checks via its `pydocstyle`-compatible rule set.
</AlertBox>

### 6. mypy

> [https://github.com/python/mypy/](https://github.com/python/mypy/)
>
> Mypy is a static type checker for Python.
>
> Type checkers help ensure that you're using variables and functions in your code correctly. With mypy, add type hints (PEP 484) to your Python programs, and mypy will warn you when you use those types incorrectly.
>
> Python is a dynamic language, so usually you'll only see errors in your code when you attempt to run it. Mypy is a static checker, so it finds bugs in your programs without even running them!

I'm running it like this: `mypy --config-file .config/.mypy.ini .`

<Snippet filename=".config/.mypy.ini" source="./files/.mypy.ini" />

### 7. Pyright

> [https://github.com/microsoft/pyright](https://github.com/microsoft/pyright)
>
> Pyright is a full-featured, standards-based static type checker for Python. It is designed for high performance and can be used with large Python source bases.

I'm using it like this: `pyright --project .config/pyright.json`

<Snippet filename=".config/pyright.json" source="./files/pyright.json" />

### 8. Black

> [https://black.readthedocs.io/en/stable/](https://black.readthedocs.io/en/stable/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter)
>
> By using Black, you agree to cede control over minutiae of hand-formatting. In return, Black gives you speed, determinism, and freedom from pycodestyle nagging about formatting. You will save time and mental energy for more important matters.
>
> Black makes code review faster by producing the smallest diffs possible. Blackened code looks the same regardless of the project you’re reading. Formatting becomes transparent after a while and you can focus on the content instead.

I'm using it like this: `black --config .config/black.toml .`

<Snippet filename=".config/black.toml" source="./files/black.toml" />

### 9. prospector

> [https://github.com/prospector-dev/prospector/](https://github.com/prospector-dev/prospector/)
>
> Inspects Python source files and provides information about type and location of classes, methods etc.

I'm using it like this: `prospector . --profile .config/prospector.yaml --pylint-config-file .config/.pylintrc`

<Snippet filename=".config/prospector.yaml" source="./files/prospector.yaml" />

## Under the Hood (skip this if you just want to use it)

### Extra - Ruff, a potential replacement for several tools

> [https://github.com/astral-sh/ruff](https://github.com/astral-sh/ruff)
>
> Ruff, an extremely fast Python linter and code formatter, written in Rust.
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)

Right now, I've too little experience with Ruff so I prefer to add it as **extra**.

The documentation mentions it is extremely fast and I should admit the first time I've run it I was thinking nothing was done (really too fast). I've made an intentional error in my code and it was detected correctly so, yes, the tool is extremely fast.

According to the Ruff documentation, this tool can completely replace Pylint (the linter), Autoflake (deletion of unused imports/variables), Black (the formatting tool) but does not replace MyPy and Pyright (doc).

I'm using it like this: `ruff format --cache-dir /tmp/ruff --config .config/pyproject.toml .` and `ruff check --cache-dir /tmp/ruff --config .config/pyproject.toml .`

<Snippet filename=".config/pyproject.toml" source="./files/pyproject.toml" />

## Conclusion

Nine tools, one command, one clear failure point — `make qa` turns "did I remember to check everything" into a single deterministic run, fastest/most fundamental check first, stopping the instant something's wrong.

Running it by hand still relies on you remembering to do it, though. Two ways to make it automatic: <Link to="/blog/git-precommit">Git - pre-commit-hooks</Link> refuses the commit when a check fails, and <Link to="/blog/dagger-python">Dagger.io - Using dagger to automate your CI workflows</Link> runs the exact same steps locally and in your CI.
