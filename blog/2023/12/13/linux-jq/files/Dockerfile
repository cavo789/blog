FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
        jq \
        curl \
        ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# A static snapshot of the randomuser.me response used throughout this
# article, so the demo works even without network access. The live API is
# still reachable from inside the container if you want to try it for real.
RUN mkdir -p /root/demo && \
    printf '%s' '{"results":[{"gender":"female","name":{"title":"Mademoiselle","first":"Salomé","last":"Roy"},"location":{"street":{"number":2361,"name":"Rue Dumenge"},"city":"Dierikon","state":"Basel-Stadt","country":"Switzerland","postcode":5075,"coordinates":{"latitude":"-58.3405","longitude":"134.0131"},"timezone":{"offset":"+4:30","description":"Kabul"}},"email":"salome.roy@example.com","dob":{"date":"1960-05-12T07:27:42.104Z","age":63},"registered":{"date":"2021-05-02T04:18:14.996Z","age":2},"phone":"077 228 21 12","cell":"078 051 38 48","picture":{"large":"https://randomuser.me/api/portraits/women/74.jpg"},"nat":"CH"}],"info":{"seed":"b7ef95d3b252edca","results":1,"page":1,"version":"1.4"}}' \
        > /root/demo/sample.json

WORKDIR /root/demo

# Signal clearly that this shell runs inside a container
RUN echo "PS1='\n\e[0;33m🐳 \e[0;36m\$(whoami)\e[0m \w # '" >> /root/.bashrc

CMD ["/bin/bash", "-i"]
