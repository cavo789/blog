# syntax=docker/dockerfile:1

# A toolbox with kind and kubectl. The cluster itself runs as Docker containers.
# Bump the versions during a /freshness pass.
FROM alpine:3.23

ARG KIND_VERSION=v0.33.0
ARG KUBECTL_VERSION=v1.37.2
ARG TARGETARCH=amd64

RUN apk add --no-cache bash docker-cli curl && \
    curl -fsSLo /usr/local/bin/kind \
      "https://kind.sigs.k8s.io/dl/${KIND_VERSION}/kind-linux-${TARGETARCH}" && \
    curl -fsSLo /usr/local/bin/kubectl \
      "https://dl.k8s.io/release/${KUBECTL_VERSION}/bin/linux/${TARGETARCH}/kubectl" && \
    chmod +x /usr/local/bin/kind /usr/local/bin/kubectl

COPY <<'YAML' /lab/cluster.yaml
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
  - role: control-plane
  - role: worker
  - role: worker
YAML

COPY <<'YAML' /lab/hello.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello
spec:
  replicas: 3
  selector:
    matchLabels:
      app: hello
  template:
    metadata:
      labels:
        app: hello
    spec:
      containers:
        - name: web
          image: nginx:1.29-alpine
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: hello
spec:
  selector:
    app: hello
  ports:
    - port: 80
YAML

COPY --chmod=755 <<'SH' /usr/local/bin/lab-up
#!/usr/bin/env bash
set -euo pipefail
kind create cluster --name lab --config /lab/cluster.yaml
# This shell runs in a container on the "kind" network: use the internal address
kind export kubeconfig --name lab --internal
kubectl get nodes
SH

COPY --chmod=755 <<'SH' /usr/local/bin/lab-down
#!/usr/bin/env bash
kind delete cluster --name lab
SH

WORKDIR /lab
CMD ["/bin/bash"]
