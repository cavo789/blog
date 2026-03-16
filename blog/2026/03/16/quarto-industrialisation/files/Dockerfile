# Use a clean Ubuntu base
FROM ubuntu:22.04

# Install Dependencies & Quarto
RUN apt-get update && apt-get install -y curl python3 python3-pip
RUN curl -L -o quarto.tar.gz https://github.com/quarto-dev/quarto-cli/releases/download/v1.4.550/quarto-1.4.550-linux-amd64.tar.gz \
    && mkdir -p /opt/quarto && tar -xzf quarto.tar.gz -C /opt/quarto --strip-components=1 \
    && ln -s /opt/quarto/bin/quarto /usr/local/bin/quarto

WORKDIR /workspace

# Disable Python bytecode generation to keep image layers lean
ENV PYTHONDONTWRITEBYTECODE=1

# Force Python stdout and stderr streams to be unbuffered for immediate logging
ENV PYTHONUNBUFFERED=1

# Install Python requirements for Quarto (Jupyter & YAML)
RUN pip3 install --no-cache-dir jupyter PyYAML
