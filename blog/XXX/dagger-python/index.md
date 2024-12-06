---
slug: dagger-python
title: Dagger.io - Using dagger to automate your Python workflows
authors: [christophe]
image: /img/dagger_tips_social_media.jpg
tags: [ci, dagger, pipeline, tip, workflow]
enableComments: true
draft: true
---
<!-- cspell:ignore pylint,pyproject,stopit,randint,workdir,pylintrc,docparams,mccabe,mypy -->
<!-- cspell:ignore hadolint,xvfz,aaaaaargh,dind -->
<!-- markdownlint-disable-file MD010 -->

![Dagger.io - Using dagger to automate your Python workflows](/img/dagger_tips_banner.jpg)

Careful, it's a bomb.  Docker has revolutionized the world; let's not be afraid to say it loud and clear, and maybe Dagger.io, created by the same people as Docker, will follow in its footsteps.

Dagger.io aims to be a tool that lets you execute a workflow in exactly the same way as a CI/CD (continuous integration/continuous development) system.

In concrete terms: at the office, when I push my code onto our GitLab server, I've implemented a `.gitlab-ci.yml' file through which a very large number of tasks are executed to check that my code contains no syntax errors (linting), no formatting violations, no gross quality errors (code quality), ... and to execute the unit tests for my project.

This CI process will then run on my GitLab server and will accept or reject my commit depending on what I have decided to do (can fail Yes/No).

Let's see how Dagger.io will improve all this stull

<!-- truncate -->

## Why using Dagger?

Anyone who uses a CI that runs in remote knows: it's a pain in the arse (sorry).

You have to push your code onto the server (git push) and you have to wait until a runner is available to start executing the tasks defined in your CI. If you have several colleagues doing the same, you may have to wait several minutes for your jobs to start.

Then, your first jobs pass and then the sixth job crashes.  You look at the error displayed in the CI output and correct it locally, then you push again and damned, no, still not correct. You change something else and push again, and again, and again.

And sometimes the error isn't linked to your code but to the environment because the CI is running with a user that isn't yours, in a different context (perhaps some files are missing, there are permissions issues, etc.).

And there you are, pushing for the 46th time and damned and aaaaaargh, feeling like you want to throw this server out.

Read more about Dagger on their website: [https://dagger.io/](https://dagger.io/)

## Let's build a real example

Did you know the word we use when an existing application is *converted* to use Docker? It's a **dockerized** application.

And did you know the word when an existing application is *converted* to use Dagger? Yes, it's **daggerized**.

Let's daggerize an existing application.

## Our existing python project

Let's create a temporary folder for Dagger and jump in it: `mkdir /tmp/dagger && cd $_`,

Please create there a Python script in a sub folder `src` and let's call it `src/main.py`:

<details>
<summary>src/main.py</summary>

```python
import random

if random.randint(0, 1) == 0:
    print("Hello world")
else:
    print("Bonjour le monde!")
```

</details>

Amazing application to tell us, random, *Hello world* or *Bonjour le monde!*

Ok, we've our application and we want to do a lot of things:

* Run [Pylint](https://pypi.org/project/pylint/), *Lint python scripts using Pylint - Run analyses your code without actually running it*,
* Run [Black](https://black.readthedocs.io/en/stable/), *Format the script using Black*,
* Run [Mypy](https://github.com/python/mypy/), *Mypy is a program that will type check your Python code* and
* Run [Ruff](https://github.com/astral-sh/ruff), *an extremely fast Python linter and code formatter*

These steps are fired in our CI (GitLab, github, ...) every time we'll push our code and, to do the same actions locally, we need to create f.i. some make actions (`make lint`, `make format`, ...)

## We need Dagger

No surprise there; at some point we have to install Dagger. Install? Ouch no; we're not going to install it because, being Docker lovers, we're going to use Docker and create our Dagger image.

Please create a new sub folder called `.docker` and in that folder, a file called `Dockerfile`:

<details>
<summary>.docker/Dockerfile</summary>

<!-- cspell:disable -->

```Dockerfile
FROM python:3.11-slim-buster AS base

# Dagger is using the Docker technology so we need to install Docker in the image
# Also install required Linux dependencies
# hadolint ignore=DL3008
RUN set -e -x \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends docker.io wget \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

# Install Dagger
ARG VERSION=0.14.0
ARG ARCHIVE=dagger_v${VERSION}_linux_amd64.tar.gz
ARG URL=https://github.com/dagger/dagger/releases/download/v${VERSION}/${ARCHIVE}

# hadolint ignore=DL3003
RUN set -e -x \
    && cd /tmp \
    && wget --quiet --output-document ${ARCHIVE} ${URL} \
    && tar xvfz ${ARCHIVE} \
    && mv dagger /usr/local/bin/ \
    && rm -rf /tmp/
```
<!-- cspell:enable -->
</details>

We need to build our image so let's run `docker build -t dagger_daemon -f .docker/Dockerfile .`

## Daggerize our application

As said above, we need to create some stuff to *daggerize* our application.

To do this, we have to run a `dagger init` command using our Docker image.

Here is how: `docker run -it --user root -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src -w /app/src dagger_daemon dagger init --sdk=python --source=./.pipeline`

Let's understand this long command line:

* by using `-it` we will interact (if needed) with the container and we'll allocate a TTY terminal i.e. get the output of running command just like if we've started it on our machine,
* you've to share your local `/var/run/docker.sock` with the container because Dagger will use Docker-in-Docker (aka `dind`) and for this reason, the container should be able to interact with your instance of Docker (`-v /var/run/docker.sock:/var/run/docker.sock`) and
* you've to mount your local current folder with the container (`-v .:/app/src`) and make that folder the working directory in the container (`-w /app/src`).
* `dagger_daemon` is the name of our image
* `dagger init --sdk=python --source=./.pipeline` is the command to start

:::

It'll take around two minutes to download and initialize Dagger. By looking at your file system, you'll see, oh, the owner is `root` and not you.

```bash
❯ ls -alh

Permissions Size User       Group      Date Modified    Name
drwxr-xr-x     - christophe christophe 2024-11-30 11:04 .
drwxrwxrwt     - root       root       2024-11-30 10:51 ..
drwxr-xr-x     - christophe christophe 2024-11-30 10:51 .docker
drwxr-xr-x     - root       root       2024-11-30 10:57 .pipeline
drwxr-xr-x     - christophe christophe 2024-11-30 10:51 src
.rw-r--r--    94 root       root       2024-11-30 10:57 dagger.json
.rw-------   10k root       root       2024-11-30 11:04 LICENSE
```

Please run `sudo chown -R christophe:christophe .` (and replace my firstname by your username).

Let's look at the tree structure:

```bash
.
├── LICENSE
├── dagger.json
└── .pipeline
    ├── pyproject.toml
    ├── sdk
    │   ├── [...]
    ├── src
    │   └── src
    │       ├── __init__.py
    │       └── main.py
    └── [...]
```

## Calling functions

Start a shell session in the container by running `docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src -w /app/src dagger_daemon /bin/bash`.

And, then, run `dagger call --help`. You'll get the list of functions available (this first time it'll take more time since Dagger needs to build the pipeline):

```text
Setup tracing at https://dagger.cloud/traces/setup. To hide: export STOPIT=1

Call one or more functions, interconnected into a pipeline

USAGE
  dagger call [options] <function>

FUNCTIONS
  container-echo   Returns a container that echoes whatever string argument is provided
  grep-dir         Returns lines that match a pattern in the files of the provided Directory
```

You'll see two functions: `container-echo` and `grep-dir`.

## Create our linting function

Functions are defined in the `.pipeline/src/src/main.py` file.

Please open that file and add a new function like below:

```python
@function
async def lint(self, source: str) -> str:
    """
    Run Pylint on the codebase.
    """
    return f"\033[33mI'm inside your Dagger pipeline and I'll lint {source}\033[0m"
```

Save the file and run `dagger call --help` again. See, we've our new function:

```text
USAGE
  dagger call [options] <function>

FUNCTIONS
  container-echo   Returns a container that echoes whatever string argument is provided
  grep-dir         Returns lines that match a pattern in the files of the provided Directory
  lint             Run Pylint on the codebase.
```

And we also get the list of parameters for our lint function `dagger call lint --help`:

```text
USAGE
  dagger call lint [arguments]

ARGUMENTS
  --source string   [required]
```

Now, back to the `.pipeline/src/src/main.py` and replace the entire file (we don't need sample functions) with this content:

```python
import dagger
from dagger import dag, function, object_type

@object_type
class Src:
    @function
    async def lint(self, source: dagger.Directory) -> str:
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
```

We'll thus remove the two sample functions and we'll implement our linting function.

By running `dagger call lint --source src` we'll then ask the pipeline to run Pylint on to the `src` folder.

Since it's the first time, Dagger will need to make some initializations (like installing PyLint) then we'll get the output:

![Partial output - Pylint](./images/pylint.png)

Yes!, PyLint has worked and alert us about missing module docstring.

Edit `src/main.py` and add some valid module docstring (or just ignore that warning):

<details>
<summary>src/main.py</summary>

```python
# pylint: disable=missing-module-docstring

import random

if random.randint(0, 1) == 0:
    print("Hello world")
else:
    print("Bonjour le monde!")
```

</details>

Running `dagger call lint --source src` again will congratulates us now with a score of 10/10.

Edit the `src/main.py` file again, f.i. make a typo by updating the line `else:` and remove the final `:` and the linter won't be happy anymore.

:::info
We've successfully created our first task and we've successfully fired it on our machine.
:::

### Running the lint task from our host

Remember: we've first started an interactive shell to jump in the Docker container then we've started the lint function.

We can do this directly from our host by running: `docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src -w /app/src dagger_daemon dagger call lint --source src`

It becomes quite difficult to remember all these commands no? Let's simplify this by creating a `makefile`.

## Create a makefile

Thanks the following `makefile`, we'll be able to just run `make build` to create our Dagger Docker image and `make lint` to run the lint function.

You'll also have a `make bash` action to jump in an interactive shell. Easy no?

<details>
<summary>makefile</summary>

```makefile
DAEMON_NAME=dagger_daemon
DOCKER_SOCK=-v /var/run/docker.sock:/var/run/docker.sock

.PHONY:build
build:
	docker build -t ${DAEMON_NAME} -f .docker/Dockerfile .

.PHONY:bash
bash:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} /bin/bash

.PHONY:lint
lint:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} dagger call lint
```

</details>

## Formatting the code using Black

Edit the `.pipeline/src/src/main.py` file and add this new function:

<details>
<summary>.pipeline/src/src/main.py</summary>

```python
import dagger
from dagger import dag, function, object_type

# cspell:ignore workdir

@object_type
class Src:
    @function
    async def lint(self, source: dagger.Directory) -> str:
        """
        Run Pylint on the codebase.
        """
        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","pylint"])
            .with_mounted_directory("/app/src", source)
            .with_workdir("/app/src")
            .with_exec(["pylint","."])
            .stdout()
        )

    # highlight-start
    @function
    async def format(self, source: dagger.Directory) -> str:
        """
        Format the codebase using Black.
        """
        return await (
            dag.container()
            .from_("python:3.13-slim")
            .with_exec(["pip","install","black"])
            .with_mounted_directory("/app/src", source)
            .with_workdir("/app/src")
            .with_exec(["black","."])
            .stdout()
        )
    # highlight-end
```

</details>

So, from now, you can run `dagger call format --source src` (from inside the container) or `docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v .:/app/src -w /app/src dagger_daemon dagger call format --source src` (from your host).

## Towards the universe and infinity

Ok, we've now two tasks and we've to implement a lot more. We can do a lot of copy/paste or take time to start thinking:

1. It would be nice to not specify every time the source folder,
2. It would be nice to start all tasks at once, asynchronously
3. It would be nice to have a configuration folder where we'll store configuration files

We need to make a little change to our Docker image:

<details>
<summary>.docker/Dockerfile</summary>

<!-- cspell:disable -->

```Dockerfile
FROM python:3.11-slim-buster AS base

# Dagger is using the Docker technology so we need to install Docker in the image
# Also install required Linux dependencies
# hadolint ignore=DL3008
RUN set -e -x \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends docker.io wget \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

# Install Dagger
ARG VERSION=0.14.0
ARG ARCHIVE=dagger_v${VERSION}_linux_amd64.tar.gz
ARG URL=https://github.com/dagger/dagger/releases/download/v${VERSION}/${ARCHIVE}

# hadolint ignore=DL3003
RUN set -e -x \
    && cd /tmp \
    && wget --quiet --output-document ${ARCHIVE} ${URL} \
    && tar xvfz ${ARCHIVE} \
    && mv dagger /usr/local/bin/ \
    && rm -rf /tmp/

# highlight-start
# anyio is required by Python to be able to run tasks concurrently and asynchronously
RUN set -e -x \
    pip install anyio
    
# highlight-end
```
<!-- cspell:enable -->
</details>

This done, run `make build` to create a fresh Docker image with `anyio` installed.


Now, we'll update the `.pipeline/src/src/main.py` file and add some more new functions:

<details>
<summary>.pipeline/src/src/main.py</summary>

```python
# cspell:ignore anyio,rcfile,pylintrc,workdir
import anyio

from typing import Annotated

import dagger
from dagger import Doc, dag, function, object_type, Directory

@object_type
class Src:

    source: Directory
    config: Directory

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
```

</details>

This new file comes with a lot of changes:

We've defined two global variables called `source` and `config`. So, now, we don't pass the `source` folder to the lint function anymore (local parameter) but just need to set it once (global parameter). We've also add a `config` folder to be able to tells Dagger where our configuration files are stored.

```python
source: Directory
config: Directory
```

We've a two new functions called `mypy` and `ruff` and a last one called `run_all`:

```python
@function
    async def run_all(self):
        """Run linter, type-checker, unit tests concurrently"""
        async with anyio.create_task_group() as tg:
            tg.start_soon(self.ruff)
            tg.start_soon(self.lint)
            tg.start_soon(self.format)
            tg.start_soon(self.mypy)
```

That one will start all the four functions concurrently and will wait until one fails or the four succeed.

Now, before running these functions, we need to create some configurations files.

<details>
<summary>.config/.pylintrc</summary>

```txt
[MASTER]
disable=
    broad-exception-caught,
    consider-using-assignment-expr,
    invalid-name,
    missing-module-docstring,
    too-few-public-methods,
    too-many-instance-attributes,
    too-many-positional-arguments

; Pickle collected data for later comparisons.
persistent=yes

; List of plugins (as comma separated values of python modules names) to load,
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
    ; pylint.extensions.mccabe,

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
; The same as in prospector.yaml, .pylintrc, black.toml and pyproject.toml
max-line-length=120
```

</details>

<details>
<summary>.config/black.toml</summary>

```toml
[tool.black]

# The same as in prospector.yaml, .pylintrc, black.toml and pyproject.toml
line-length = 120

# We'll format the code for Python 3.13.0; we can add multiple versions (the ones supported by
# the script, all versions separated by a comma like in ['py312', 'py313'] (run "black --help" to get them)
target-version = ['py313']
```

</details>

<details>
<summary>.config/mypy.ini</summary>

```ini
[mypy]
show_error_codes = true

; First we turn on *all the checks*, and then we turn off those that are too annoying.
strict = True

; Don't know why but mypy returns errors like
;     Customer? has no attribute "input_path"  [attr-defined]
; when that attribute is well present. Ignore the error temporarily
disable_error_code = attr-defined

cache_dir = /tmp/mypy

; Disallows defining functions without type annotations or with incomplete type annotations
disallow_untyped_defs = true

no_implicit_optional = true

strict_equality = true
warn_redundant_casts = true
warn_unused_ignores = true

python_version = 3.13
```

</details>

<details>
<summary>.config/pyproject.toml</summary>

```toml
[tool.ruff]

exclude=[]

# The same as in prospector.yaml, .pylintrc, black.toml and pyproject.toml
line-length = 120
indent-width = 4
```

</details>

<details>
<summary>makefile</summary>

```makefile
DAEMON_NAME=dagger_daemon
DOCKER_SOCK=-v /var/run/docker.sock:/var/run/docker.sock

.PHONY:build
build: 
	docker build -t ${DAEMON_NAME} -f .docker/Dockerfile .

.PHONY:remove
remove:
	docker rmi --force ${DAEMON_NAME}

.PHONY:bash
bash:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} /bin/bash

.PHONY:lint
lint:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} dagger call --source src --config .config lint

.PHONY:format
format:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} dagger call --source src --config .config format

.PHONY:mypy
mypy:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} dagger call --source src --config .config mypy

.PHONY:ruff
ruff:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} dagger call --source src --config .config ruff

.PHONY:pipeline
pipeline:
	docker run -it ${DOCKER_SOCK} -v .:/app/src -w /app/src ${DAEMON_NAME} dagger call --source src --config .config run-all

```

</details>

## Time for a first break

Right now, we've build a local pipeline: we've create a custom Dagger Docker image and we've daggerized an existing project.

We've defined a few functions (`lint`, `format`, `mypy` and `ruff`) and a last one `run-all` to start all functions at the same time.

We've simplified our work with `make` actions to not remember these long Docker CLI commands.

Our pipeline is working fine locally.

## Implementing a GitLab CI using Dagger

Let's go back to our objective: to simplify the pipeline process both at CI level (GitLab, GitHub, etc.) and locally.

We've just done the local part, let's tackle the remote CI.

For the next chapters, I'll suppose you're using a self-hosted GitLab server.

### Allowing the Gitlab runner to access to Docker

I'm not expert in GitLab runner configuration but the following configuration is working for me.

Do a SSH connection to your GitLab runner server and edit the `/etc/gitlab-runner/config.toml` file (you should be root). Just add `/var/run/docker.sock:/var/run/docker.sock` for the `volumes` property:

```toml
 [runners.docker]
    # Adding /var/run/docker.sock:/var/run/docker.sock
    # will allow to use commands like "docker image list" i.e. running Docker commands
    # in CI scripts. This is called "Docker socket binding".
    volumes = ["/cache", "/var/run/docker.sock:/var/run/docker.sock"]
```

Also, make sure the Linux user used by your GitLab runner (default username is `gitlab-runner`) is part of the `docker` group. This is done by running `sudo usermod -aG docker gitlab-runner` in the CLI (see [https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-the-shell-executor](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html#use-the-shell-executor)).

:::info
Official Gitlab documentation about [volumes](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#volumes-in-the-runnersdocker-section).

To check if it's work, run `sudo su gitlab-runner` to switch to that user and run `docker info` and `docker image list` and check if it's works. If yes, then your user is part of the Docker group.

### Configure your CI

Please create a GitLab repository, push your existing project there.

Now, please create a file called `.gitlab-ci.yml` with this content:

<details>
<summary>.gitlab-ci.yml</summary>

```yaml
.docker:
  image: docker:latest
  services:
    - docker:${DOCKER_VERSION}-dind
  variables:    
    DOCKER_HOST: unix:///var/run/docker.sock # Docker Socket Binding
.dagger:
  extends: [.docker]
  before_script:
    - apk add curl
    - curl -fsSL https://dl.dagger.io/dagger/install.sh | BIN_DIR=/usr/local/bin sh
lint:
  extends: [.dagger]
  script:
    - dagger call --source src --config .config lint
```

</details>

And push the changes to GitLab. The presence of the `.gitlab-ci.yml` file will tells to GitLab to instantiate a pipeline after each commit and, here in our example, to start a job called `lint`.

:::info
The provided example is using the technique called **Docker Socket Binding**: we don't need to define the `DOCKER_HOST` variable for instance as we can see in [the official Dagger documentation](https://docs.dagger.io/integrations/gitlab/#docker-executor). Indeed, if not specified, `DOCKER_HOST` is set to `unix:///var/run/docker.sock` ([doc](https://docs.gitlab.com/runner/configuration/advanced-configuration.html#the-runnersdocker-section)).

Since we've shared the Docker daemon (`/var/run/docker.sock`) in our GitLab `/etc/gitlab-runner/config.toml` configuration file, we've allowed the CI to access to the socket.
:::
