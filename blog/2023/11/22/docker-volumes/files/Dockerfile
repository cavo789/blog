FROM alpine:3.14

COPY counter.sh counter.sh

RUN chmod +x counter.sh

ENTRYPOINT ["tail", "-f", "/dev/null"]
