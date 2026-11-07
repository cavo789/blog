# syntax=docker/dockerfile:1

# Miller, awk and jq, plus the CSV file used throughout the article.
FROM debian:trixie-slim

RUN apt-get update && \
    apt-get install -y --no-install-recommends miller jq && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /demo

COPY <<'CSV' orders.csv
id,date,region,product,amount
1001,2026-10-01,Europe,Keyboard,89.90
1002,2026-10-01,Asia,Monitor,249.00
1003,2026-10-02,Europe,Monitor,239.00
1004,2026-10-03,America,Mouse,29.50
1005,2026-10-03,Europe,Mouse,31.00
1006,2026-10-04,Asia,Keyboard,79.90
1007,2026-10-05,America,Monitor,259.00
1008,2026-10-05,Europe,Keyboard,92.50
CSV

COPY <<'CSV' managers.csv
region,manager
Europe,Alice
Asia,Bob
America,Carol
CSV

CMD ["/bin/bash"]
