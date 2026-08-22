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

# Install zsh-syntax-highlighting and enable it in the default plugins=() list
RUN git clone --depth=1 https://github.com/zsh-users/zsh-syntax-highlighting \
        /root/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting && \
    sed -i 's/^plugins=(git)/plugins=(git zsh-syntax-highlighting)/' /root/.zshrc

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
