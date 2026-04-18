FROM node:20-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    python3 \
    py3-pip \
    py3-yaml

RUN fc-cache -fv

RUN npm install -g @mermaid-js/mermaid-cli

RUN mkdir -p /home/node/.cache/puppeteer && \
    chmod -R 777 /home/node

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV HOME=/home/node

WORKDIR /app
