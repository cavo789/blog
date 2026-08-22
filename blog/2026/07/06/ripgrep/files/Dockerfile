FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        zsh \
        ripgrep \
        git \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# ~/.ripgreprc — the exact config file from this article
RUN printf '%s\n' \
    '--colors=match:fg:red' \
    '--colors=match:style:bold' \
    '--colors=path:fg:blue' \
    '--follow' \
    '--glob=!.cache/*' \
    '--glob=!.git/*' \
    '--glob=!.output/*' \
    '--glob=!.yarn/*' \
    '--glob=!build/*' \
    '--glob=!dist/*' \
    '--glob=!node_modules/*' \
    '--glob=!vendor/*' \
    '--hidden' \
    '--max-filesize=10M' \
    '--smart-case' \
    > /root/.ripgreprc

# ~/.zsh/fns/ — the two custom functions from this article
RUN mkdir -p /root/.zsh/fns

RUN printf '%s\n' \
    '# rgtodo — surface all TODO/FIXME/HACK/NOTE comments in the project' \
    'rgtodo() {' \
    '    local dir="${1:-.}"' \
    '    rg --color=always --line-number --smart-case "(TODO|FIXME|HACK|NOTE):?\s" "${dir}" | sort' \
    '}' \
    > /root/.zsh/fns/rgtodo.zsh

RUN printf '%s\n' \
    '# rgenv — find all references to an environment variable' \
    'rgenv() {' \
    '    local var="${1}"' \
    '    [[ -z "${var}" ]] && { echo "Usage: rgenv <VARIABLE_NAME>"; return 1; }' \
    "    rg --type-add 'config:*.{env,cfg,ini,conf}' --type config --type yaml --type sh --type php --type py \"\${var}\"" \
    '}' \
    > /root/.zsh/fns/rgenv.zsh

# ~/.zshrc — the exact ripgrep section from this article
RUN printf '%s\n' \
    'export RIPGREP_CONFIG_PATH="$HOME/.ripgreprc"' \
    'for fn_file in ~/.zsh/fns/*.zsh; do source "${fn_file}"; done' \
    'alias rgp="rg --type php"' \
    'alias rgj="rg --type js"' \
    'alias rgy="rg --type yaml"' \
    'alias rgd="rg --glob \"Dockerfile*\" --glob \"*.dockerfile\""' \
    >> /root/.zshrc

# Build a small demo project: a `vendor/` folder that must stay invisible, a
# PHP controller worth finding, TODO/FIXME comments, a leaking JWT in a JS
# file, and a compose file with image references
RUN mkdir -p /root/demo/vendor/legacy /root/demo/src && \
    printf '<?php\nfunction getUser($id) {\n    // vendored copy, must NOT show up in searches\n}\n' \
        > /root/demo/vendor/legacy/User.php && \
    printf '<?php\nfunction getUser($id) {\n    return User::find($id);\n}\n' \
        > /root/demo/src/UserController.php && \
    printf '<?php\n// TODO: cache this lookup\n// FIXME: N+1 query below\nfunction getAllUsers() {\n    // HACK: temporary workaround for #482\n}\n' \
        > /root/demo/src/legacy.php && \
    printf 'DB_PASSWORD=demo-secret\n' > /root/demo/.env && \
    printf 'services:\n  app:\n    image: php:8.3-fpm\n  db:\n    image: postgres:16\n' \
        > /root/demo/compose.yml && \
    printf 'function refreshToken(token) {\n  console.log(token);\n}\n\nfunction checkout(cart) {\n  for (const item of cart) {\n    console.log(item);\n  }\n}\n' \
        > /root/demo/src/app.js && \
    printf 'FROM php:8.3-fpm\nCOPY . /app\n' > /root/demo/Dockerfile.app && \
    printf 'vendor/\n' > /root/demo/.gitignore && \
    git -C /root/demo init -q && \
    git -C /root/demo -c user.email=demo@example.com -c user.name=Demo \
        add -A && \
    git -C /root/demo -c user.email=demo@example.com -c user.name=Demo \
        commit -q -m "Demo project"

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
