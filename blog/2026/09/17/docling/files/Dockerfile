# syntax=docker/dockerfile:1

# Pinned down to the Debian release, not just "slim": the runtime package names
# below moved between Debian 12 and 13 (libglib2.0-0 became libglib2.0-0t64),
# so a floating base would break the build without warning
FROM python:3.12-slim-trixie AS final

# Prevent Python from writing .pyc files, buffer logs, and skip pip update checks
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    DOCLING_ARTIFACTS_PATH=/opt/docling-models

# Latest release at the time of writing; bump it deliberately, not by accident
ARG DOCLING_VERSION=2.127.0

# libgl1 and libglib2.0-0t64: OpenCV, pulled in by the OCR stage, needs them at
# import time and the slim image ships neither. gcc and libc6-dev: the VLM
# pipeline runs through Triton, PyTorch's JIT compiler, which builds a small
# shared library on first use
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        libgl1 libglib2.0-0t64 \
        gcc libc6-dev && \
    rm -rf /var/lib/apt/lists/*

# Create an unprivileged user without a valid login shell for strict security. Its
# UID does not have to match yours: the wrapper script runs the container with
# "-u $(id -u):$(id -g)", so the process takes your own identity at run time and
# whatever it writes into the mounted folder already belongs to you
RUN groupadd -g 1000 developer && \
    useradd -m -u 1000 -g 1000 -s /usr/sbin/nologin developer

# The BuildKit cache mount keeps the wheels between rebuilds without leaving
# them in the image layer, so no --no-cache-dir here. The torch wheel pulled in
# here ships its own CUDA and cuDNN libraries, hence no nvidia/cuda base image:
# the only thing the container needs from the host is the driver, and --gpus
# injects that at run time
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install "docling==${DOCLING_VERSION}"

# Bake the models in now, while we are still root and the filesystem is still
# writable. At run time the container is unprivileged and read-only, so nothing
# can be downloaded any more — and the OCR engine would try to write into its
# own site-packages folder, not into $HOME/.cache, so mounting a volume over the
# home directory would not help either. DOCLING_ARTIFACTS_PATH tells Docling to
# read the models from here instead of reaching for the network
RUN docling-tools models download layout tableformer rapidocr \
        -o "${DOCLING_ARTIFACTS_PATH}" && \
    docling-tools models download-hf-repo ibm-granite/granite-docling-258M \
        -o "${DOCLING_ARTIFACTS_PATH}" && \
    chmod -R a+rX "${DOCLING_ARTIFACTS_PATH}"

# Docling's --quiet silences its own logger, but not the model stack underneath:
# Transformers still prints a pad_token_id advisory on every VLM run, and the Hub
# still draws a "Loading weights" bar. These switch both off at the source. Kept
# below the heavy layers so tuning it never invalidates the model download
ENV TRANSFORMERS_VERBOSITY=error \
    HF_HUB_DISABLE_PROGRESS_BARS=1

WORKDIR /workspace

USER developer

# Execute the CLI tool directly
ENTRYPOINT ["docling"]
