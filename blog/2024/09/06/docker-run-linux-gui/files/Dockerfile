FROM ubuntu:latest

RUN apt-get update && apt-get install -y --no-install-recommends x11-apps && \
    rm -rf /var/lib/apt/lists/*

CMD [ "xeyes" ]
