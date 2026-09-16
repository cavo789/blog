# syntax=docker/dockerfile:1

FROM python:3.12-slim

RUN pip install --no-cache-dir matplotlib==3.11.2

# An unprivileged user, as any image shipped to production should have
RUN useradd --create-home --uid 1000 --shell /usr/sbin/nologin plotter && \
    mkdir /out && chown plotter /out

COPY plot.py /app/plot.py

USER plotter

ENTRYPOINT ["python", "/app/plot.py"]
