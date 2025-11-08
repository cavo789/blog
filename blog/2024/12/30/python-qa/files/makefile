# cspell:disable
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
