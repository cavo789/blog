FROM ubuntu:latest

RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y lubuntu-desktop lightdm && \
    rm -rf /var/lib/apt/lists/*

RUN rm -f /run/reboot-required*
RUN echo "/usr/sbin/lightdm" > /etc/X11/default-display-manager
RUN printf '%s\n' \
    '[LightDM]' \
    '[Seat:*]' \
    'type=xremote' \
    'xserver-hostname=host.docker.internal' \
    'xserver-display-number=0' \
    'autologin-user=root' \
    'autologin-user-timeout=0' \
    'autologin-session=Lubuntu' \
    > /etc/lightdm/lightdm.conf.d/lightdm.conf

ENV DISPLAY=host.docker.internal:0.0

CMD service dbus start ; service lightdm start
