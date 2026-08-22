FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        git && \
    rm -rf /var/lib/apt/lists/*

RUN git config --global user.email "demo@example.com" && \
    git config --global user.name "Demo" && \
    git config --global init.defaultBranch main

# Build a repo with 12 commits where one, right in the middle, silently
# flips a `+` to a `-` in calculate_total.sh — a real, deterministic bug for
# `git bisect run` to hunt down automatically
RUN mkdir -p /root/demo && cd /root/demo && \
    git init -q && \
    printf '#!/bin/bash\ncalculate_total() {\n  echo $(( $1 + $2 ))\n}\ncalculate_total "$@"\n' \
        > calculate_total.sh && \
    chmod +x calculate_total.sh && \
    git add -A && git commit -q -m "chore: initial project setup" && \
    git tag v1.0 && \
    echo "note 1" >> CHANGELOG.md && git add -A && git commit -q -m "doc: add changelog" && \
    echo "note 2" >> CHANGELOG.md && git add -A && git commit -q -m "chore: update dependencies" && \
    echo "note 3" >> CHANGELOG.md && git add -A && git commit -q -m "feat: add search component" && \
    echo "note 4" >> CHANGELOG.md && git add -A && git commit -q -m "fix: typo in sidebar" && \
    echo "note 5" >> CHANGELOG.md && git add -A && git commit -q -m "chore: bump lockfile" && \
    sed -i 's/\$1 + \$2/\$1 - \$2/' calculate_total.sh && \
    git add -A && git commit -q -m "chore: upgrade remark-gfm to v4" && \
    echo "note 6" >> CHANGELOG.md && git add -A && git commit -q -m "doc: fix broken link" && \
    echo "note 7" >> CHANGELOG.md && git add -A && git commit -q -m "chore: reformat code" && \
    echo "note 8" >> CHANGELOG.md && git add -A && git commit -q -m "feat: add reading time to blog posts" && \
    echo "note 9" >> CHANGELOG.md && git add -A && git commit -q -m "chore: update CI config" && \
    echo "note 10" >> CHANGELOG.md && git add -A && git commit -q -m "chore: final tweaks"

# The test script git bisect run will execute at every candidate commit
RUN printf '%s\n' \
    '#!/bin/bash' \
    'result=$(./calculate_total.sh 2 3)' \
    '[ "$result" = "5" ]' \
    > /root/demo/bisect-test.sh && \
    chmod +x /root/demo/bisect-test.sh

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
