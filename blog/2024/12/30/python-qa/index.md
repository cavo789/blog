---
slug: python-qa
title: Python - Code Quality tools
authors: [christophe]
image: /img/python_tips_social_media.jpg
mainTag: code-quality
tags: [autoflake, black, code-quality, devcontainer, docker, isort, mypy, prospector, pydocstyle, pylint, pyright, python, ruff, vulture]
enableComments: true
---

<!-- markdownlint-disable-file MD010 -->
<!-- cspell:ignore analyser,pylint,Autoflake,isort,mypy,pyright,pydocstyle,pylintrc,docparams -->
<!-- cspell:ignore rcfile,pyflakes,pycodestyle,mccabe,pyproject -->

![Python - Code Quality tools](/img/python_tips_banner.jpg)

If you're a self-respecting programmer, you can't develop without code analysis tools.  For PHP programmers, you already know a lot of them (`rector`, `phpstan`, `phan`, `phpcs`, ...). See my previous articles [Rector 1.0.0, my friend, my coach](/blog/php-rector) and [Docker image that provides static analysis tools for PHP](/blog/php-jakzal-phpqa) f.i.

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

<Snippets filename=".config/.pylintrc">

```text
[MASTER]
; Pickle collected data for later comparisons.
persistent=yes

; List of plugins (as comma-separated values of python modules names) to load,
; usually to register additional checkers.
load-plugins=
    pylint.extensions.check_elif,
    pylint.extensions.bad_builtin,
    pylint.extensions.docparams,
    pylint.extensions.for_any_all,
    pylint.extensions.set_membership,
    pylint.extensions.code_style,
    pylint.extensions.overlapping_exceptions,
    pylint.extensions.typing,
    pylint.extensions.redefined_variable_type,
    pylint.extensions.comparison_placement,

; Use multiple processes to speed up Pylint. Specifying 0 will auto-detect the
; number of processors available to use.
jobs=0

; When enabled, pylint would attempt to guess common misconfiguration and emit
; user-friendly hints instead of false-positive error messages.
suggestion-mode=yes

; Minimum supported python version
py-version = 3.13.0

; Specify a score threshold to be exceeded before program exits with error.
fail-under=9.50

[FORMAT]
max-line-length=120
```

</Snippets>

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
> Due to Python's dynamic nature, static code analysers like Vulture are likely to miss some dead code. Also, code that is only called implicitly may be reported as unused. Nonetheless, Vulture can be a very helpful tool for higher code quality.

I'm running it like this: `vulture --min-confidence 100 .`

:::danger
Be careful with Vulture because his algorithm will detect a lot of false positive so this is why, in my automation process, I've used `--min-confidence 100` to make sure I've **only** real unused code / variables.
:::

Note: I've also configured my VSCode with the settings below so, while I'm coding, VSCode will notify me about unused things so I can immediately take action.

<Snippets filename=".vscode/settings.json">

```json
"python.analysis.diagnosticSeverityOverrides": {
    "reportUnusedClass": "information",
    "reportUnusedFunction": "information",
    "reportUnusedImport": "information",
    "reportUnusedVariable": "information"
},
```

</Snippets>

## 5. pydocstyle

> [https://www.pydocstyle.org/en/stable/](https://www.pydocstyle.org/en/stable/))
>
> pydocstyle is a static analysis tool for checking compliance with Python docstring conventions.

This tool will check the quality of your comments like the one of your functions description and f.i. make sure if you've a function with two arguments that your description explain these two arguments (there is a control about the name and the type).

I'm running it like this: `pydocstyle --config=.config/.pydocstyle`

<Snippets filename=".config/.pydocstyle">

```text
[pydocstyle]
ignore = D100,D203,D205,D212,D213,D400,D404,D406,D407,D413,D415
match = .*\.py
```

</Snippets>

## 6. mypy

> [https://github.com/python/mypy/](https://github.com/python/mypy/)
>
> Mypy is a static type checker for Python.
>
> Type checkers help ensure that you're using variables and functions in your code correctly. With mypy, add type hints (PEP 484) to your Python programs, and mypy will warn you when you use those types incorrectly.
>
> Python is a dynamic language, so usually you'll only see errors in your code when you attempt to run it. Mypy is a static checker, so it finds bugs in your programs without even running them!

I'm running it like this: `mypy --config-file .config/.mypy.ini .`

<Snippets filename=".config/.mypy.ini">

```text
[mypy]
show_error_codes = true

; First we turn on *all the checks*, and then we turn off those that are too annoying.
strict = True

cache_dir = /tmp/mypy

no_implicit_optional = true

strict_equality = true
warn_redundant_casts = true
warn_unused_ignores = true

python_version = 3.13
```

</Snippets>

## 7. Pyright

> [https://github.com/microsoft/pyright](https://github.com/microsoft/pyright)
>
> Pyright is a full-featured, standards-based static type checker for Python. It is designed for high performance and can be used with large Python source bases.

I'm using it like this: `pyright --project .config/pyright.json`

<Snippets filename=".config/pyright.json">

```json
{
    "include": [ "." ],
    "pythonVersion": "3.13",
    "pythonPlatform": "Linux"
  }

```

</Snippets>

## 8. Black

> [https://black.readthedocs.io/en/stable/](https://black.readthedocs.io/en/stable/)
>
> [VSCode Addon](https://marketplace.visualstudio.com/items?itemName=ms-python.black-formatter)
>
> By using Black, you agree to cede control over minutiae of hand-formatting. In return, Black gives you speed, determinism, and freedom from pycodestyle nagging about formatting. You will save time and mental energy for more important matters.
>
> Black makes code review faster by producing the smallest diffs possible. Blackened code looks the same regardless of the project you’re reading. Formatting becomes transparent after a while and you can focus on the content instead.

I'm using it like this: `black --config .config/black.toml .`

<Snippets filename=".config/black.toml">

```toml
[tool.black]

# The same as in prospector.yaml and .pylintrc
line-length = 120

# We'll format the code for Python 3.13.0; we can add multiple versions (the ones supported by
# the script, all versions separated by a comma like in ['py312', 'py313'] (run "black --help" to get them)
target-version = ['py313']
```

</Snippets>

## 9. prospector

> [https://github.com/prospector-dev/prospector/](https://github.com/prospector-dev/prospector/)
>
> Inspects Python source files and provides information about type and location of classes, methods etc

I'm using it like this: `prospector . --profile .config/prospector.yaml --pylint-config-file .config/.pylintrc`

<Snippets filename=".config/prospector.yaml">

```yaml
strictness: high
test-warnings: true
doc-warnings: false

pycodestyle:
  options:
    max-line-length: 120

  disable:
    - D100
    - D203
    - D205
    - D212
    - D213
    - D400
    - D404
    - D406
    - D407
    - D413
    - D415

bandit:
  run: true

dodgy:
  run: true

pyflakes:
  run: true

mccabe:
  run: true
```

</Snippets>

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

<Snippets filename=".config/pyproject.toml">

```toml
[tool.ruff]

exclude=[]

# The same as in prospector.yaml, .pylintrc, black.toml and pyproject.toml
line-length = 120
indent-width = 4
```

</Snippets>

## Running them all at once

But why have I numbered the tools from 1 to 9 and why this order? That's because I'm running them one after the other and I'm running first the faster tool but too the more logical one.

The first tool is `Pylint` and that make sense: there is no need to go further if the syntax is incorrect. The second tool is `Autoflake` and it make sense too to remove unused variables and imports before.

I'm using a [makefile](/blog/tags/makefile) with an action called `qa` like this:

<Snippets filename="makefile">

```makefile
.PHONY: qa
qa:
	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " Step  Tool" "Run?" "Techno" "Description"
	@echo "--------------------------------------------------------------------------------------------------------------"
	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 1/9  RUNNING make Pylint" "Lint python scripts using Pylint (https://pypi.org/project/pylint/)"
	@pylint . --rcfile .config/.pylintrc

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 2/9  RUNNING make Autoflake" "Detect unused variables and unused imports (https://pypi.org/project/autoflake/)"
	@autoflake --remove-unused-variables --remove-all-unused-import --recursive .

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 3/9  RUNNING make isort" "Sort import statement using isort (https://pycqa.github.io/isort/)"
	@isort .

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 4/9  RUNNING make Vulture" "Find dead Python code (https://github.com/jendrikseipp/vulture)"
	@vulture --min-confidence 100 .

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 5/9  RUNNING make Pydocstyle" "pydocstyle is a static analysis tool for checking compliance with Python docstring conventions (https://www.pydocstyle.org/en/stable/)"
	@pydocstyle --config=.config/.pydocstyle

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 6/9  RUNNING make Mypy" "Mypy is a program that will type check your Python code (https://github.com/python/mypy/)"
	@mypy --config-file .config/.mypy.ini .

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 7/9  RUNNING make Pyright" "Pyright is a full-featured, standards-based static type checker for Python (https://github.com/microsoft/pyright)"
	@pyright --project pyright.json

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n" " 8/9  RUNNING make Black" "Format the script using Black (https://black.readthedocs.io/en/stable/)"
	@black --config .config/black.toml .

	@printf "\e[1;37m%-35s%-10s%-10s\e[m%s\n\n" " 9/9  RUNNING make Prospector" "Inspects Python source files and provides information about type and location of classes, methods, ... (https://github.com/prospector-dev/prospector/)"
	@prospector . --profile .config/prospector.yaml --pylint-config-file .config/.pylintrc

	@printf "%s\n" "CONGRATULATIONS!!!"
	@printf "%s\n" "Not the slightest error or notice detected, that's .. amazing!"
	@printf "%s\n" "🥳 🎉 🎊 🤩 🕺 💃 👏"
```

</Snippets>

You've understood I think. As soon as an error is detected, the script stops. You'll see the **CONGRATULATIONS** message only if all checks are successful.
