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

# Install zsh-ssh-config-suggestions and enable it in the default plugins=() list
RUN git clone --depth=1 https://github.com/yngc0der/zsh-ssh-config-suggestions.git \
        /root/.oh-my-zsh/custom/plugins/zsh-ssh-config-suggestions && \
    sed -i 's/^plugins=(git)/plugins=(git zsh-ssh-config-suggestions)/' /root/.zshrc

# The exact ~/.ssh/config from this article — no real hosts are ever
# contacted, only the Host aliases are read for completion
RUN mkdir -p /root/.ssh && \
    printf '%s\n' \
    'Host MyAmazingApp_PROD' \
    '    Hostname 1.2.3.4' \
    '    User usr_app_prod' \
    '' \
    'Host MyAmazingApp_TEST' \
    '    Hostname 6.7.8.9' \
    '    User usr_app_test' \
    '' \
    'Host YourAmazingApp' \
    '    Hostname 1.2.3.4' \
    '    User you' \
    '' \
    'Host LegacyApp' \
    '    Hostname 1.2.3.4' \
    '    User legacy' \
    > /root/.ssh/config && \
    chmod 600 /root/.ssh/config

# Signal clearly that this shell runs inside a container
RUN echo "PROMPT='%B%F{yellow}🐳 %F{cyan}%n%f%b %~ %# '" >> /root/.zshrc

CMD ["/bin/zsh", "-i", "-l"]
