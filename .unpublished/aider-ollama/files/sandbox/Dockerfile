# syntax=docker/dockerfile:1

# Sandbox to run a generated PowerShell script against read-only data
FROM mcr.microsoft.com/powershell:7.5-ubuntu-24.04

LABEL org.opencontainers.image.title="pwsh-sandbox" \
      org.opencontainers.image.description="PowerShell and exiftool, to run untrusted scripts against read-only data" \
      org.opencontainers.image.vendor="cavo789" \
      org.opencontainers.image.licenses="MIT" \
      org.opencontainers.image.authors="no-reply@gmail.com"

# exiftool reads EXIF on Linux, where System.Drawing does not exist; it handles HEIC and videos too
RUN apt-get update \
    && apt-get install -y --no-install-recommends libimage-exiftool-perl \
    && rm -rf /var/lib/apt/lists/*

# The root filesystem is mounted read-only at run time: PowerShell's caches go to a tmpfs
ENV HOME=/tmp \
    POWERSHELL_TELEMETRY_OPTOUT=1 \
    POWERSHELL_UPDATECHECK=Off

WORKDIR /app
ENTRYPOINT ["pwsh", "-NoLogo", "-NoProfile", "-NonInteractive", "-File"]
