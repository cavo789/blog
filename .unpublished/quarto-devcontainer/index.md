---
slug: quarto-devcontainer
title: Level up your Quarto workflow: unleash the power of devcontainers
authors: [christophe]
image: /img/v2/quarto.jpg
series: Creating Docusaurus components
mainTag: quarto
tags: [devcontainer, quarto]
blueskyRecordKey:
date: 2025-09-30
---

<!-- cspell:ignore  -->

![Level up your Quarto workflow: unleash the power of devcontainers](/img/v2/quarto.jpg)

```bash
git clone --filter=blob:none --sparse https://github.com/quarto-dev/quarto-examples
cd quarto-examples
git sparse-checkout set brand
cd brand
```

<Snippet filename=".devcontainer/Dockerfile">

```dockerfile
# syntax=docker/dockerfile:1.4

# cspell:disable
FROM ghcr.io/quarto-dev/quarto:latest

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

# ---------- Stage 1: Install system dependencies ----------
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libx11-dev \
    libxkbfile-dev \
    libsecret-1-dev \
    unzip && \
    rm -rf /var/lib/apt/lists/*

# ---------- Stage 2: Create the user and setup permissions ------------------

RUN set -eux && \
    USER_UID=${USER_UID:-1000} && \
    USER_GID=${USER_GID:-1000} && \
    groupadd -g "${USER_GID}" "${USERNAME}" && \
    useradd -m -u "${USER_UID}" -g "${USER_GID}" -s /bin/bash "${USERNAME}"  && \
    chown -R "${USERNAME}":"${USERNAME}" "/home/${USERNAME}"

# ---------- Stage 3: Install code-server and preinstall extensions ----------

# Put extensions in a separate layer to cache them
ARG EXTENSIONS="\
    DavidAnson.vscode-markdownlint \
    esbenp.prettier-vscode \
    gitkraken.gitlens \
    maptz.regionfolder \
    mde.select-highlight-minimap \
    mikestead.dotenv \
    ms-vscode.makefile-tools \
    quarto.quarto \
    redhat.vscode-yaml \
    sirtori.indenticator \
    streetsidesoftware.code-spell-checker-dutch \
    streetsidesoftware.code-spell-checker-french \
    streetsidesoftware.code-spell-checker \
    yzhang.markdown-all-in-one"

# Install code-server and extensions with caching
RUN --mount=type=cache,target=/home/${USERNAME}/.local/share/code-server/extensions \
    curl -fsSL https://code-server.dev/install.sh | sh && \
    for ext in $EXTENSIONS; do \
    code-server --install-extension "$ext" || true; \
    done

# ---------- Stage 4: Finalization -------------------------------------------

USER ${USERNAME}

# Make bash history persistent
RUN mkdir -p /home/${USERNAME}/.bash_history && \
    touch /home/${USERNAME}/.bash_history/.bash_history

# Configure bash to use this file
RUN echo 'export HISTFILE=/home/${USERNAME}/.bash_history/.bash_history' >> /home/${USERNAME}/.bashrc && \
    echo 'export HISTSIZE=10000' >> /home/${USERNAME}/.bashrc && \
    echo 'export HISTFILESIZE=10000' >> /home/${USERNAME}/.bashrc && \
    echo 'shopt -s histappend' >> /home/${USERNAME}/.bashrc

# Set up the shell prompt and history for devcontainer
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${USERNAME}/.bashrc"

RUN echo 'echo -e "\n📘 Welcome to the Quarto Docs Dev Container!\n👉 Run \`quarto preview docs\` to start the preview.\n👉 Run \`quarto render .\` to generate the default documentation (based on _quarto.yml).\n👉 Run \`quarto render . --profile docx\` (here, _quarto-docx.yml will be used)."' >> /home/${USERNAME}/.bashrc
```

</Snippet>

<Snippet filename=".devcontainer/devcontainer.json">

```json

{
  "name": "Quarto Docs Project",
  "build": {
    "dockerfile": "Dockerfile",
    "args": {
      "USER_UID": "${localEnv:UID}",
      "USER_GID": "${localEnv:GID}"
    }
  },
  "remoteUser": "vscode",
  "customizations": {
    "vscode": {
      "settings": {
        "[dockerfile]": {
          "files.eol": "\n",
          "editor.defaultFormatter": "ms-azuretools.vscode-docker"
        },
        "[json]": {
          "editor.defaultFormatter": "vscode.json-language-features"
        },
        "[jsonc]": {
          "editor.defaultFormatter": "vscode.json-language-features",
          "editor.wordWrap": "wordWrapColumn",
          "editor.wordWrapColumn": 80,
          "editor.wrappingIndent": "indent"
        },
        "[markdown]": {
          "editor.defaultFormatter": "DavidAnson.vscode-markdownlint",
          "editor.wordWrap": "wordWrapColumn",
          "editor.wordWrapColumn": 80,
          "editor.wrappingIndent": "indent"
        },
        "cSpell.language": "en,fr,nl",
        "cSpell.words": [
          "Quarto",
          "devcontainer",
          "frontmatter",
          "Pandoc",
          "Gitlens"
        ],
        "editor.formatOnSave": true,
        "editor.defaultFormatter": "esbenp.prettier-vscode",
        "editor.guides.bracketPairs": "active",
        "editor.guides.bracketPairsHorizontal": "active",
        "editor.guides.highlightActiveIndentation": true,
        "editor.guides.indentation": true,
        "editor.multiCursorModifier": "ctrlCmd",
        "editor.renderWhitespace": "all",
        "editor.rulers": [
          120,
          70
        ],
        "editor.stickyScroll.enabled": true,
        "editor.tabCompletion": "on",
        "editor.tabSize": 4,
        "editor.wordBasedSuggestionsMode": "allDocuments",
        "editor.wordWrapColumn": 120,
        "explorer.compactFolders": false,
        "explorer.confirmDelete": true,
        "explorer.confirmDragAndDrop": true,
        "extensions.autoCheckUpdates": false,
        "files.associations": {
          "resources/*.json": "jsonc"
        },
        "files.autoSave": "onFocusChange",
        "files.defaultLanguage": "${activeEditorLanguage}",
        "files.eol": "\n",
        "files.exclude": {
          "**/.DS_Store": true,
          "**/.cache": true,
          "**/.git": true,
          "**/.hg": true,
          "**/.svn": true,
          "**/CVS": true,
          "**/documentation/**/*.html": true,
          "**/documentation/**/readme_files/**": true,
          "**/documentation/**/site_libs/**": true
        },
        "files.insertFinalNewline": true,
        "files.trimTrailingWhitespace": true,
        "maptz.regionfolder": {
          "[dockerfile]": {
            "foldEnd": "[\\S]*\\#[\\s]*endregion",
            "foldEndRegex": "[\\S]*\\#[\\s]*endregion[\\s]*(.*)$",
            "foldStart": "[\\S]*\\#[\\s]*region [NAME]",
            "foldStartRegex": "[\\S]*\\#[\\s]*region[\\s]*(.*)$"
          }
        },
        "markdown.extension.toc.levels": "2..6",
        "markdownlint.config": {
          "MD033": false,
          "MD036": false
        },
        "quarto.preview.renderOnSave": true,
        "telemetry.telemetryLevel": "off",
        "terminal.integrated.profiles.linux": {
          "bash": {
            "path": "/bin/bash",
            "icon": "terminal-bash"
          }
        },
        "terminal.integrated.defaultProfile.linux": "bash",
        "terminal.integrated.fontFamily": "MesloLGS NF",
        "yaml.schemas": {
          "https://json.schemastore.org/github-workflow.json": "_quarto.yml"
        }
      }
    }
  },
  "forwardPorts": [
    8000
  ],
  "postAttachCommand": "quarto preview ."
}

```

</Snippet>


NOUVELLES VERSIONS AFIN DE PERMETTRE GIT ET PRE-COMMIT-HOOKS


<Snippet filename=".devcontainer/Dockerfile">

```dockerfile
# syntax=docker/dockerfile:1.4

# cspell:disable
FROM ghcr.io/quarto-dev/quarto:latest

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=1000

# ---------- Stage 1: Install system dependencies ----------
#
# openssh-client: used by git when pushing/pulling using git@ protocol
# python3-pip:    needed to be able to install pre-commit-hooks
RUN --mount=type=cache,target=/var/cache/apt \
    --mount=type=cache,target=/var/lib/apt \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    git \
    libsecret-1-dev \
    libx11-dev \
    libxkbfile-dev \
    openssh-client \
    python3-pip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip to its latest version
RUN pip3 install --no-cache-dir --upgrade pip

# Install pre-commit hook tool
RUN pip3 install --no-cache-dir pre-commit

# ---------- Stage 2: Create the user and setup permissions ------------------

RUN set -eux && \
    USER_UID=${USER_UID:-1000} && \
    USER_GID=${USER_GID:-1000} && \
    groupadd -g "${USER_GID}" "${USERNAME}" && \
    useradd -m -u "${USER_UID}" -g "${USER_GID}" -s /bin/bash "${USERNAME}" && \
    chown -R "${USERNAME}":"${USERNAME}" "/home/${USERNAME}"

# ---------- Stage 3: Install code-server and preinstall extensions ----------

# Put extensions in a separate layer to cache them
ARG EXTENSIONS="\
    DavidAnson.vscode-markdownlint \
    esbenp.prettier-vscode \
    gitkraken.gitlens \
    maptz.regionfolder \
    mde.select-highlight-minimap \
    mikestead.dotenv \
    ms-vscode.makefile-tools \
    quarto.quarto \
    redhat.vscode-yaml \
    sirtori.indenticator \
    streetsidesoftware.code-spell-checker-dutch \
    streetsidesoftware.code-spell-checker-french \
    streetsidesoftware.code-spell-checker \
    yzhang.markdown-all-in-one"

# Install code-server and extensions with caching
RUN --mount=type=cache,target=/home/${USERNAME}/.local/share/code-server/extensions \
    curl -fsSL https://code-server.dev/install.sh | sh && \
    for ext in $EXTENSIONS; do \
    code-server --install-extension "$ext" || true; \
    done

# ---------- Stage 4: Finalization -------------------------------------------

USER ${USERNAME}

# Create .ssh directory and set permissions for the non-root user
# This is crucial for the git push to work, as ssh requires strict permissions
RUN set -eux && \
    mkdir -p /home/${USERNAME}/.ssh && \
    chown -R "${USERNAME}":"${USERNAME}" "/home/${USERNAME}/.ssh" && \
    chmod 700 /home/${USERNAME}/.ssh

# Make bash history persistent
RUN mkdir -p /home/${USERNAME}/.bash_history && \
    touch /home/${USERNAME}/.bash_history/.bash_history

# Configure bash to use this file
RUN echo 'export HISTFILE=/home/${USERNAME}/.bash_history/.bash_history' >> "/home/${USERNAME}/.bashrc" && \
    echo 'export HISTSIZE=10000' >> "/home/${USERNAME}/.bashrc" && \
    echo 'export HISTFILESIZE=10000' >> "/home/${USERNAME}/.bashrc" && \
    echo 'shopt -s histappend' >> "/home/${USERNAME}/.bashrc"

# Set up the shell prompt and history for devcontainer
RUN set -eux && \
    echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> "/home/${USERNAME}/.bashrc"

# When the user will start a new terminal session in the container, he'll see the tips below
RUN set -eux && \
    cat <<EOF >> "/home/${USERNAME}/.bashrc"
echo -e "\n📘 Welcome to the Quarto Docs Dev Container!"
echo -e "Below are some useful commands:"
echo -e ""
echo -e "  \e[1mQuarto Commands\e[0m"
echo -e "  ───────────────"
echo -e "  ✨ \e[32mquarto preview .\e[0m                Start a hot-reloading preview in your browser."
echo -e "  ✨ \e[32mquarto render .\e[0m                 Build the documentation (based on _quarto.yml)."
echo -e "  ✨ \e[32mquarto render . --profile docx\e[0m  Build a .docx file (requires _quarto-docx.yml)."
echo -e ""
echo -e "  \e[1mGit Hooks\e[0m"
echo -e "  ─────────"
echo -e "  ⚙️  \e[32mpre-commit run --all-files\e[0m     Run code quality checks on all files."
echo -e ""
EOF

```

</Snippet>

<Snippet filename=".devcontainer/devcontainer.json">

```json

{
    "name": "Quarto Docs Project",
    "build": {
        "dockerfile": "Dockerfile",
        "args": {
            "USER_UID": "${localEnv:UID}",
            "USER_GID": "${localEnv:GID}"
        }
    },
    "remoteUser": "vscode",
    "runArgs": [
        "--mount=type=bind,source=${env:HOME}/.ssh,target=/home/vscode/.ssh,readonly"
    ],
    "containerEnv": {
        "GIT_SSH_COMMAND": "ssh -i /home/vscode/.ssh/id_ed25519 -o 'StrictHostKeyChecking no'"
    },
    "customizations": {
        "vscode": {
            "settings": {
                "[dockerfile]": {
                    "files.eol": "\n",
                    "editor.defaultFormatter": "ms-azuretools.vscode-docker"
                },
                "[json]": {
                    "editor.defaultFormatter": "vscode.json-language-features"
                },
                "[jsonc]": {
                    "editor.defaultFormatter": "vscode.json-language-features",
                    "editor.wordWrap": "wordWrapColumn",
                    "editor.wordWrapColumn": 80,
                    "editor.wrappingIndent": "indent"
                },
                "[markdown]": {
                    "editor.defaultFormatter": "yzhang.markdown-all-in-one",
                    "editor.wordWrap": "wordWrapColumn",
                    "editor.wordWrapColumn": 80,
                    "editor.wrappingIndent": "indent"
                },
                "[yaml]": {
                    "editor.defaultFormatter": "redhat.vscode-yaml"
                },
                "cSpell.language": "en,fr,nl",
                "cSpell.words": [
                    "Quarto",
                    "devcontainer",
                    "frontmatter",
                    "Pandoc",
                    "Gitlens"
                ],
                "editor.formatOnSave": true,
                "editor.guides.bracketPairs": "active",
                "editor.guides.bracketPairsHorizontal": "active",
                "editor.guides.highlightActiveIndentation": true,
                "editor.guides.indentation": true,
                "editor.multiCursorModifier": "ctrlCmd",
                "editor.renderWhitespace": "all",
                "editor.rulers": [
                    120,
                    70
                ],
                "editor.stickyScroll.enabled": true,
                "editor.tabCompletion": "on",
                "editor.tabSize": 4,
                "editor.wordBasedSuggestionsMode": "allDocuments",
                "editor.wordWrapColumn": 120,
                "explorer.compactFolders": false,
                "explorer.confirmDelete": true,
                "explorer.confirmDragAndDrop": true,
                "extensions.autoCheckUpdates": false,
                "files.associations": {
                    "resources/*.json": "jsonc"
                },
                "files.autoSave": "onFocusChange",
                "files.defaultLanguage": "${activeEditorLanguage}",
                "files.eol": "\n",
                "files.exclude": {
                    "**/.DS_Store": true,
                    "**/.cache": true,
                    "**/.git": true,
                    "**/.hg": true,
                    "**/.svn": true,
                    "**/CVS": true,
                    "**/documentation/**/*.html": true,
                    "**/documentation/**/readme_files/**": true,
                    "**/documentation/**/site_libs/**": true
                },
                "files.insertFinalNewline": true,
                "files.trimTrailingWhitespace": true,
                "maptz.regionfolder": {
                    "[dockerfile]": {
                        "foldEnd": "[\\S]*\\#[\\s]*endregion",
                        "foldEndRegex": "[\\S]*\\#[\\s]*endregion[\\s]*(.*)$",
                        "foldStart": "[\\S]*\\#[\\s]*region [NAME]",
                        "foldStartRegex": "[\\S]*\\#[\\s]*region[\\s]*(.*)$"
                    }
                },
                "markdown.extension.toc.levels": "2..6",
                "markdown.extension.tableFormatter.enabled": true,
                "markdownlint.config": {
                    "MD033": false,
                    "MD036": false
                },
                "quarto.preview.renderOnSave": true,
                "telemetry.telemetryLevel": "off",
                "terminal.integrated.profiles.linux": {
                    "bash": {
                        "path": "/bin/bash",
                        "icon": "terminal-bash"
                    }
                },
                "terminal.integrated.defaultProfile.linux": "bash",
                "terminal.integrated.fontFamily": "MesloLGS NF",
                "yaml.schemas": {
                    "https://json.schemastore.org/github-workflow.json": "_quarto.yml"
                }
            }
        }
    },
    "forwardPorts": [
        8000
    ],
    "postAttachCommand": "pre-commit install && quarto preview ."
}


```

</Snippet>

<Snippet filename=".pre-commit-config.yaml">

```yaml
# .pre-commit-config.yaml

repos:
  # Universal hooks for clean files
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v6.0.0
    hooks:
      - id: check-added-large-files
      - id: check-case-conflict
      - id: check-json
      - id: check-merge-conflict
      - id: check-yaml
      - id: detect-private-key
      - id: end-of-file-fixer
      - id: trailing-whitespace

  # Markdown linter
  - repo: https://github.com/DavidAnson/markdownlint-cli2
    rev: v0.18.1
    hooks:
      - id: markdownlint-cli2
        args:
          - '--disable'
          - 'MD013' # Disable line length rule, which is often too strict for documentation

  # Typo checker
  - repo: https://github.com/crate-ci/typos
    rev: v1.36.2
    hooks:
      - id: typos

```

</Snippet>
