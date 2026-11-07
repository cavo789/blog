# syntax=docker/dockerfile:1

# act, plus a small project whose GitHub Actions workflow currently fails.
# Bump ACT_VERSION during a /freshness pass.
FROM docker:29-cli

ARG ACT_VERSION=0.2.97
ARG TARGETARCH=amd64
RUN apk add --no-cache git && \
    case "${TARGETARCH}" in amd64) arch=x86_64 ;; *) arch=arm64 ;; esac && \
    wget -qO- "https://github.com/nektos/act/releases/download/v${ACT_VERSION}/act_Linux_${arch}.tar.gz" | \
    tar -xz -C /usr/local/bin act

WORKDIR /demo

COPY <<'YML' .github/workflows/quality.yml
name: Code quality
on: push

jobs:
  formatting:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npx --yes prettier@3 --check .
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: npm install --no-save eslint@9
      - run: npx eslint .
YML

COPY <<'JS' app.js
const answer   =  42
console.log( "Hello" )
console.log(unknownVariable)
JS

COPY <<'CFG' eslint.config.mjs
export default [
  {
    languageOptions: { globals: { console: "readonly" } },
    rules: { "no-undef": "error" },
  },
];
CFG

# act uses this image to play the role of GitHub's ubuntu-latest runner
COPY <<'RC' /root/.actrc
-P ubuntu-latest=node:24-bookworm-slim
RC

RUN git init -q && git add . && \
    git -c user.name=Demo -c user.email=demo@example.com commit -qm "Initial commit"

ENTRYPOINT []
CMD ["/bin/sh"]
