# syntax=docker/dockerfile:1

# Inspired by https://docusaurus.community/knowledge/deployment/docker/?package-managers=yarn

# Stage 1: Base image.

FROM node:21-alpine AS base

# Disable color output from yarn to make logs easier to read.
ENV FORCE_COLOR=0

# Enable corepack.
RUN corepack enable

# --------------------------------------------------------------------

# Stage 2: Production build mode.

FROM base AS building_production

# Install the latest version of Docusaurus
RUN npx create-docusaurus@latest /opt/docusaurus/ classic --javascript \
  # Uncomment the line below to remove dummy files like dummy blog, docs, src, ...
  # && rm -rf /opt/docusaurus/blog /opt/docusaurus/docs /opt/docusaurus/src\
  && chown -R node:node /opt/docusaurus/

# Set the working directory to `/opt/docusaurus`.
WORKDIR /opt/docusaurus

# We need our package.json / package.lock file before running yarn install
COPY package.* .

# Install dependencies with `--immutable` to ensure reproducibility.
RUN yarn install --immutable

# Copy over the source code.
COPY . /opt/docusaurus/

# Build the static site (generated files will be created in /opt/docusaurus/build)
RUN yarn build

# --------------------------------------------------------------------

# Stage 3: Serve with nginx

FROM nginx:stable-alpine3.19-perl AS production

# Copy the Docusaurus build output.
COPY --from=building_production /opt/docusaurus/build /usr/share/nginx/html

WORKDIR /usr/share/nginx/html
