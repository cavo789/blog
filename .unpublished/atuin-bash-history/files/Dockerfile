FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        bash \
        bash-completion \
        curl \
        tar \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Atuin
RUN curl -fsSL \
    https://github.com/atuinsh/atuin/releases/download/v18.16.1/atuin-x86_64-unknown-linux-gnu.tar.gz \
    | tar -xz && \
    mv atuin-*/atuin /usr/local/bin/

# Install bash-preexec (hook system required by Atuin on Bash)
RUN curl -fsSL \
    https://raw.githubusercontent.com/rcaloras/bash-preexec/master/bash-preexec.sh \
    -o /opt/bash-preexec.sh

# Wire Atuin into the interactive shell
RUN printf '%s\n' \
    'source /opt/bash-preexec.sh' \
    'eval "$(atuin init bash)"' \
    >> /root/.bashrc

CMD ["/bin/bash", "-i"]
