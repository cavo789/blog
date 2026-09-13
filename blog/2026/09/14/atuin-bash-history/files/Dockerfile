FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        bash \
        bash-completion \
        ca-certificates \
        curl \
        sqlite3 \
        tar && \
    rm -rf /var/lib/apt/lists/*

# Install Atuin
RUN curl -fsSL \
    https://github.com/atuinsh/atuin/releases/download/v18.22.0/atuin-x86_64-unknown-linux-musl.tar.gz \
    | tar -xz && \
    mv atuin-*/atuin /usr/local/bin/

# Install bash-preexec (hook system required by Atuin on Bash)
RUN curl -fsSL \
    https://raw.githubusercontent.com/rcaloras/bash-preexec/master/bash-preexec.sh \
    -o /opt/bash-preexec.sh

# Pre-populate the database so CTRL+R has a real history to search from the
# very first second. Demo-only: on a real machine Atuin fills this by itself.
COPY seed-history.sh /opt/seed-history.sh
RUN chmod +x /opt/seed-history.sh

# Wire Atuin into the interactive shell. The seeding script runs last and is
# idempotent: it does nothing if the database already holds commands.
RUN printf '%s\n' \
    'source /opt/bash-preexec.sh' \
    'eval "$(atuin init bash)"' \
    '/opt/seed-history.sh' \
    >> /root/.bashrc

CMD ["/bin/bash", "-i"]
