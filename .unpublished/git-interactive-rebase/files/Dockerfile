FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        git \
        nano && \
    rm -rf /var/lib/apt/lists/*

RUN git config --global user.email "demo@example.com" && \
    git config --global user.name "Demo" && \
    git config --global init.defaultBranch main && \
    git config --global core.editor nano && \
    git config --global rebase.autosquash true && \
    git config --global rebase.autostash true

# Build the exact "A typical cleanup" scenario from this article: a feature
# built across 7 messy commits, ready for `git rebase -i HEAD~7`
RUN mkdir -p /root/demo && cd /root/demo && \
    git init -q && \
    printf 'chore: initial project setup\n' > README.md && \
    git add -A && git commit -q -m "chore: initial project setup" && \
    printf 'export function ProfilePage() {\n  return null;\n}\n' > profile.js && \
    git add -A && git commit -q -m "feat: add user profile page" && \
    printf 'export function ProfilePage() {\n  return null; // fixed build\n}\n' > profile.js && \
    git add -A && git commit -q -m "fix build" && \
    printf 'export function ProfilePage(user) {\n  // wip\n}\n' > profile.js && \
    git add -A && git commit -q -m "wip" && \
    printf 'export function ProfilePage(user) {\n  // more wip\n  return user.name;\n}\n' > profile.js && \
    git add -A && git commit -q -m "more wip" && \
    printf 'export function ProfilePage(user) {\n  return user ? user.name : null;\n}\n' > profile.js && \
    git add -A && git commit -q -m "actually working now" && \
    printf 'test("renders profile", () => {});\n' > profile.test.js && \
    git add -A && git commit -q -m "add tests" && \
    printf 'test("renders profile", () => { expect(true).toBe(true); });\n' > profile.test.js && \
    git add -A && git commit -q -m "fix test"

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
