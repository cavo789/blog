# syntax=docker/dockerfile:1

# gitlab-ci-local, plus a small project mixing Bash, PHP and Python, and a
# quality pipeline with tools in their own images.
# Bump GCL_VERSION during a /freshness pass.
FROM node:24-alpine

ARG GCL_VERSION=4.77.1
RUN apk add --no-cache bash docker-cli git rsync && \
    npm install --global "gitlab-ci-local@${GCL_VERSION}"

WORKDIR /demo

COPY <<'YML' .gitlab-ci.yml
stages:
  - format
  - lint

shell-format:
  stage: format
  image:
    name: mvdan/shfmt:v3-alpine
    entrypoint: [""]
  script:
    - shfmt --diff scripts/

shell-lint:
  stage: lint
  image: koalaman/shellcheck-alpine:stable
  script:
    - shellcheck scripts/*.sh

php-style:
  stage: format
  image: jakzal/phpqa:php8.4
  script:
    - php-cs-fixer check --rules=@PSR12 --diff src/
    - phpcs --standard=PSR12 src/

python-quality:
  stage: lint
  image: python:3.14-slim
  script:
    - pip install --quiet --disable-pip-version-check --root-user-action=ignore ruff mypy
    - ruff check app/
    - mypy app/
YML

COPY <<'SH' scripts/backup.sh
#!/usr/bin/env bash
target=$1
   echo "Saving to $target"
cp -r data $target
SH

COPY <<'PHP' src/Greeter.php
<?php

class Greeter {
  function hello( $name ) { return "Hello ".$name; }
}
PHP

COPY <<'PY' app/main.py
import os


def add(a: int, b: int) -> int:
    return a + b


print(add("1", 2))
PY

# The corrected versions, to copy over the project at the end of the demo
COPY <<'SH' /fixed/scripts/backup.sh
#!/usr/bin/env bash
target=$1
echo "Saving to $target"
cp -r data "$target"
SH

COPY <<'PHP' /fixed/src/Greeter.php
<?php

namespace Demo;

class Greeter
{
    public function hello($name)
    {
        return "Hello " . $name;
    }
}
PHP

COPY <<'PY' /fixed/app/main.py
def add(a: int, b: int) -> int:
    return a + b


print(add(1, 2))
PY

RUN git config --global user.name Demo && \
    git config --global user.email demo@example.com && \
    git config --global init.defaultBranch main && \
    git init -q && \
    git remote add origin https://gitlab.example.com/demo/quality.git && \
    git symbolic-ref refs/remotes/origin/HEAD refs/remotes/origin/main && \
    git add . && git commit -qm "Initial commit"

CMD ["/bin/bash"]
