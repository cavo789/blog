# cspell:disable
# Version number of Quarto to download and use
# See https://github.com/quarto-dev/quarto-cli/pkgs/container/quarto for existing versions
ARG QUARTO_VERSION=1.6.36

ARG OS_USERNAME=quarto
ARG UID=1000
ARG GID=1000

FROM ghcr.io/quarto-dev/quarto:${QUARTO_VERSION}

# librsvg2-bin is to allow SVG conversion when rendering a PDF file
# (will install the rsvg-view binary)
RUN --mount=type=cache,target=/var/cache/apt,rw \
    set -e -x && \
    apt-get update -y \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        pandoc \
        pandoc-citeproc \
        curl \
        gdebi-core \
        librsvg2-bin \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

USER root

# The input folder will be the one where we'll put our files before the conversion.
# We should do this as root since it's a folder under /
RUN set -e -x && \
    mkdir -p /input

# Should be done for the user; won't work if done for root
# (quarto will say that "tinytex is not installed")
ARG OS_USERNAME
ARG UID
ARG GID

RUN set -e -x && \
    groupadd -g ${GID} -o "${OS_USERNAME}" && \
    useradd -l -m -u ${UID} -g ${GID} -o -s /bin/bash "${OS_USERNAME}"

USER "${OS_USERNAME}"

WORKDIR /

# Install tools like tinytex to allow conversion to PDF
RUN set -e -x && \
    quarto install tool tinytex --update-path && \
    ~/.TinyTeX/bin/x86_64-linux/tlmgr update --self --all && \
    ~/.TinyTeX/bin/x86_64-linux/fmtutil-sys --all && \
    # See https://github.com/rstudio/tinytex/issues/426 for explanation
    # Run tlmgr install for a few tinyText packages (needed for PDF conversion)
    ~/.TinyTeX/bin/x86_64-linux/tlmgr install fvextra footnotebackref pagecolor sourcesanspro sourcecodepro titling
