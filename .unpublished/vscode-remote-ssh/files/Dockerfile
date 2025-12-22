# cspell:ignore ssword

FROM ubuntu:latest

# Install the SSH server so we can use the `ssh` command to connect to the container
# Also create the required `/var/run/sshd` directory
RUN apt-get update \
    && apt-get install -y openssh-server \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /var/run/sshd

# Create our test user (christophe) and assign him a password (p@ssword)
RUN useradd -rm -d /home/christophe -s /bin/bash christophe \
    && echo 'christophe:p@ssword' | chpasswd

# Do some changes to the ssh configuration like disabling authentication with the `root` user
RUN sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config \
    && sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication yes/' /etc/ssh/sshd_config \
    && sed -i 's/^#ChallengeResponseAuthentication.*/ChallengeResponseAuthentication no/' /etc/ssh/sshd_config \
    && sed -i 's/^UsePAM.*/UsePAM no/' /etc/ssh/sshd_config \
    && sed -i 's/^#ListenAddress.*/ListenAddress 0.0.0.0/' /etc/ssh/sshd_config \
    && sed -i 's/^#Port.*/Port 22/' /etc/ssh/sshd_config

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]
