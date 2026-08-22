FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        zsh \
        git \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Install Oh-My-Zsh unattended (host framework required by the plugin)
RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" \
    "" --unattended --keep-zshrc

# Install zsh-autosuggestions and enable it in the default plugins=() list
RUN git clone --depth=1 https://github.com/zsh-users/zsh-autosuggestions \
        /root/.oh-my-zsh/custom/plugins/zsh-autosuggestions && \
    sed -i 's/^plugins=(git)/plugins=(git zsh-autosuggestions)/' /root/.zshrc

# Pre-seed a shell history so a suggestion is already there to accept: type
# "doc" and the full `docker compose up --detach` line appears in gray text.
RUN printf '%s\n' \
    ': 1700000000:0;docker compose up --detach' \
    ': 1700000100:0;docker compose logs --follow' \
    ': 1700000200:0;docker compose down --volumes' \
    > /root/.zsh_history

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
