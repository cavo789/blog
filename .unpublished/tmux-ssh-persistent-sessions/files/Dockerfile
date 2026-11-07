# syntax=docker/dockerfile:1

# A pretend remote server: SSH, tmux, and a slow "deployment" to protect.
# For local experiments only: the login is demo / demo.
FROM ubuntu:24.04

RUN apt-get update && \
    apt-get install -y --no-install-recommends openssh-server tmux && \
    rm -rf /var/lib/apt/lists/* && \
    mkdir -p /run/sshd && \
    useradd --create-home --shell /bin/bash demo && \
    echo 'demo:demo' | chpasswd

COPY --chmod=755 <<'SCRIPT' /usr/local/bin/long-deploy
#!/usr/bin/env bash
for step in $(seq 1 300); do
  echo "[$(date +%T)] Deploying... step ${step}/300"
  sleep 2
done
echo "Deployment finished"
SCRIPT

EXPOSE 22
CMD ["/usr/sbin/sshd", "-D", "-e"]
