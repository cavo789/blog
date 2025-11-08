---
slug: python-qa
title: Python - Code Quality tools
date: 2024-12-30
description: Elevate your Python code quality! Discover 9 essential static analysis tools like Pylint, Black, and mypy, plus an optimal QA workflow to ensure cleaner, bug-free code.
authors: [christophe]
image: /img/v2/clean_code.webp
series: code quality
mainTag: code-quality
tags: [autoflake, black, code-quality, devcontainer, docker, isort, mypy, prospector, pydocstyle, pylint, pyright, python, ruff, vulture]
language: en
blueskyRecordKey: 3lymragaqr22l
---
<!-- markdownlint-disable-file MD010 -->
<!-- cspell:ignore analyser,pylint,Autoflake,isort,mypy,pyright,pydocstyle,pylintrc,docparams -->
<!-- cspell:ignore rcfile,pyflakes,pycodestyle,mccabe,pyproject -->

![Python - Code Quality tools](/img/v2/clean_code.webp)

If you're a self-respecting programmer, you can't develop without code analysis tools.  For PHP programmers, you already know a lot of them (`rector`, `phpstan`, `phan`, `phpcs`, ...). See my previous articles <Link to="/blog/php-rector">Rector 1.0.0, my friend, my coach</Link> and <Link to="/blog/php-jakzal-phpqa">Docker image that provides static analysis tools for PHP</Link> f.i.

What about Python?

<!-- truncate -->

I'm a big fan of static code quality tools and here is my short list:

## 1. Pylint

>[https://pypi.org/project/pylint/](https://pypi.org/project/pylint/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.pylint)
>
> Pylint is a static code analyser for Python 2 or 3. The latest version supports Python 3.9.0 and above.
>
> Pylint analyses your code without actually running it. It checks for errors, enforces a coding standard, looks for code smells, and can make suggestions about how the code could be refactored.

The first thing first: make sure your Python code has no syntax error like a bad indentation, you didn't forget a `:` at the end of a control (like an `if` or `for` statement, ...)

I'm running it like this: `pylint . --rcfile .config/.pylintrc`.

<Snippet filename=".config/.pylintrc" source="./files/.pylintrc" />

## 2. Autoflake

> [https://pypi.org/project/autoflake/](https://pypi.org/project/autoflake/)
>
> Autoflake removes unused imports and unused variables from Python code. It makes use of pyflakes to do this.
>
> By default, Autoflake only removes unused imports for modules that are part of the standard library. (Other modules may have side effects that make them unsafe to remove automatically.) Removal of unused variables is also disabled by default.
>
> Autoflake also removes useless pass statements by default.

I'm running it like this: `Autoflake --remove-unused-variables --remove-all-unused-import --recursive .`

## 3. isort

> [https://pycqa.github.io/isort/](https://pycqa.github.io/isort/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.isort)
>
> isort your imports, so you don't have to.
>
> isort is a Python utility / library to sort imports alphabetically, and automatically separated into sections and by type. It provides a command line utility, Python library and plugins for various editors to quickly sort all your imports. It requires Python 3.7+ to run but supports formatting Python 2 code too.

I'm running it like this: `isort .`

Note: I've also configured my VSCode with this setting `"python.sortImports.args": ["--profile", "black"]` so import statement are automatically sorted while I'm coding.

## 4. vulture

> [https://github.com/jendrikseipp/vulture](https://github.com/jendrikseipp/vulture)
>
> Vulture finds unused code in Python programs. This is useful for cleaning up and finding errors in large code bases. If you run Vulture on both your library and test suite you can find untested code.
>
> Due to Python's dynamic nature, static code analyzers like Vulture are likely to miss some dead code. Also, code that is only called implicitly may be reported as unused. Nonetheless, Vulture can be a very helpful tool for higher code quality.

I'm running it like this: `vulture --min-confidence 100 .`

<AlertBox variant="danger" title="">
Be careful with Vulture because his algorithm will detect a lot of false positive so this is why, in my automation process, I've used `--min-confidence 100` to make sure I've **only** real unused code / variables.

</AlertBox>

Note: I've also configured my VSCode with the settings below so, while I'm coding, VSCode will notify me about unused things so I can immediately take action.

<Snippet filename=".vscode/settings.json" source="./files/settings.json" />

## 5. pydocstyle

> [https://www.pydocstyle.org/en/stable/](https://www.pydocstyle.org/en/stable/))
>
> pydocstyle is a static analysis tool for checking compliance with Python docstring conventions.

This tool will check the quality of your comments like the one of your functions description and f.i. make sure if you've a function with two arguments that your description explain these two arguments (there is a control about the name and the type).

I'm running it like this: `pydocstyle --config=.config/.pydocstyle`

<Snippet filename=".config/.pydocstyle" source="./files/.pydocstyle" />

## 6. mypy

> [https://github.com/python/mypy/](https://github.com/python/mypy/)
>
> Mypy is a static type checker for Python.
>
> Type checkers help ensure that you're using variables and functions in your code correctly. With mypy, add type hints (PEP 484) to your Python programs, and mypy will warn you when you use those types incorrectly.
>
> Python is a dynamic language, so usually you'll only see errors in your code when you attempt to run it. Mypy is a static checker, so it finds bugs in your programs without even running them!

I'm running it like this: `mypy --config-file .config/.mypy.ini .`

<Snippet filename=".config/.mypy.ini" source="./files/.mypy.ini" />

## 7. Pyright

> [https://github.com/microsoft/pyright](https://github.com/microsoft/pyright)
>
> Pyright is a full-featured, standards-based static type checker for Python. It is designed for high performance and can be used with large Python source bases.

I'm using it like this: `pyright --project .config/pyright.json`

<Snippet filename=".config/pyright.json" source="./files/pyright.json" />

## 8. Black

> [https://black.readthedocs.io/en/stable/](https://black.readthedocs.io/en/stable/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter)
>
> By using Black, you agree to cede control over minutiae of hand-formatting. In return, Black gives you speed, determinism, and freedom from pycodestyle nagging about formatting. You will save time and mental energy for more important matters.
>
> Black makes code review faster by producing the smallest diffs possible. Blackened code looks the same regardless of the project you’re reading. Formatting becomes transparent after a while and you can focus on the content instead.

I'm using it like this: `black --config .config/black.toml .`

<Snippet filename=".config/black.toml" source="./files/black.toml" />

## 9. prospector

> [https://github.com/prospector-dev/prospector/](https://github.com/prospector-dev/prospector/)
>
> Inspects Python source files and provides information about type and location of classes, methods etc

I'm using it like this: `prospector . --profile .config/prospector.yaml --pylint-config-file .config/.pylintrc`

<Snippet filename=".config/prospector.yaml" source="./files/prospector.yaml" />

## Extra - Ruff

> [https://github.com/astral-sh/ruff](https://github.com/astral-sh/ruff)
>
> Ruff, an extremely fast Python linter and code formatter, written in Rust.
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=charliermarsh.ruff)

Right now, I've too little experience with Ruff so I prefer to add it as **extra**.

The documentation mentions it's extremely fast and I should admit the first time I've run it I was thinking nothing was done (really too fast). I've made an intentional error in my code and it was well detected so, yes, the tool is extremely fast.

According to the Ruff [documentation](https://docs.astral.sh/ruff/faq/#how-does-ruffs-linter-compare-to-flake8), this tool can completely replace Pylint (the linter), Autoflake (deletion of unused imports/variables), Black (the formatting tool) but didn't replace MyPy and Pyright ([doc](https://docs.astral.sh/ruff/faq/#how-does-ruff-compare-to-mypy-or-pyright-or-pyre)).

I'm using it like this: `ruff format --cache-dir /tmp/ruff --config .config/pyproject.toml .` and `ruff check --cache-dir /tmp/ruff --config .config/pyproject.toml .`

<Snippet filename=".config/pyproject.toml" source="./files/pyproject.toml" />

## Running them all at once

But why have I numbered the tools from 1 to 9 and why this order? That's because I'm running them one after the other and I'm running first the faster tool but too the more logical one.

The first tool is `Pylint` and that make sense: there is no need to go further if the syntax is incorrect. The second tool is `Autoflake` and it make sense too to remove unused variables and imports before.

I'm using a <Link to="/blog/tags/makefile">makefile</Link> with an action called `qa` like this:

<Snippet filename="makefile" source="./files/makefile" />

You've understood I think. As soon as an error is detected, the script stops. You'll see the **CONGRATULATIONS** message only if all checks are successful.
