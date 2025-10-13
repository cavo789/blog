# The user ID and name and group ID of the user to create in our image
ARG DOCKER_UID=1000
ARG DOCKER_GID=1000
ARG USERNAME=johndoe

# The version of Chrome we'll install
ARG CHROME_VERSION=115.0.5763.0

# This is a PHP project
FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y git jq zip unzip wget gnupg \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

# We'll create a new user with the same uid/gid than ours, on our host machine.
ARG DOCKER_UID
ARG DOCKER_GID
ARG USERNAME

RUN groupadd --gid ${DOCKER_GID} "${USERNAME}" \
    && useradd --home-dir /home/"${USERNAME}" --create-home --uid ${DOCKER_UID} \
        --gid ${DOCKER_GID} --shell /bin/sh --skel /dev/null "${USERNAME}"

# Download and install Chrome
ARG CHROME_VERSION
ARG DOWNLOAD_URL="https://googlechromelabs.github.io/chrome-for-testing/known-good-versions-with-downloads.json"

# Download Chrome (the browser and the driver)
RUN wget --no-check-certificate --no-verbose -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update -yqq \
    && apt-get install -y --no-install-recommends -yq gconf-service libasound2 libatk1.0-0 libc6 libcairo2 \
        libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libgconf-2-4 \
        libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 \
        libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 \
        libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
        libxss1 libxtst6 ca-certificates fonts-liberation libnss3 lsb-release \
        xdg-utils \
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/* \
    # --- Download the browser ---
    && ZIP_URL=$(curl $DOWNLOAD_URL | jq -r ".versions[] | select(.version==\""$CHROME_VERSION"\").downloads.chrome[] | select(.platform==\""linux64"\") .url") \
    && wget --no-check-certificate --no-verbose -O /tmp/chrome_browser.zip $ZIP_URL \
    && printf "\e[0;105m%s\e[0;0m\n" "Using chromedriver $(/usr/local/bin/chrome/chromedriver --version)" \
    #  Unzip and create the /usr/local/bin/chromedriver executable  (-j means don't create a subfolder with the name of the archive; unzip in the folder directly)
    && unzip -j /tmp/chrome_browser.zip -d /usr/local/bin/chrome \
    && rm -f /tmp/chrome_browser.zip \
    && ls -alh /usr/local/bin/chrome \
    && chmod +x /usr/local/bin/chrome/chrome \
    # --- Download the driver ---
    && ZIP_URL=$(curl $DOWNLOAD_URL | jq -r ".versions[] | select(.version==\""$CHROME_VERSION"\").downloads.chromedriver[] | select(.platform==\""linux64"\") .url") \
    && wget --no-check-certificate --no-verbose -O /tmp/chrome_driver.zip $ZIP_URL \
    #  Unzip and create the /usr/local/bin/chromedriver executable  (-j means don't create a subfolder with the name of the archive; unzip in the folder directly)
    && unzip -j /tmp/chrome_driver.zip -d /usr/local/bin/chrome \
    && rm -f /tmp/chrome_driver.zip \
    && chmod +x /usr/local/bin/chrome/chrome \
    # Make some cleanup
    && apt-get clean \
    && rm -rf /tmp/* /var/list/apt/*

# Get latest composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Where we'll put our script
RUN mkdir /opt/behat

# Set working directory
WORKDIR /opt/behat
