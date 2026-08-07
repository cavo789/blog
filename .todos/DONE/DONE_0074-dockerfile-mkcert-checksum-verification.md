# 0074 — Vérifier le checksum du binaire mkcert dans le stage devcontainer

- **Priority**: Medium
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`

## Problème

Le stage `devcontainer` télécharge mkcert via curl sans vérification d'intégrité :

```dockerfile
curl -sSL "https://dl.filippo.io/mkcert/latest?for=linux/${ARCH}" -o /usr/local/bin/mkcert
```

Aucune vérification de checksum ou de signature n'est effectuée avant de rendre le binaire
exécutable. Une attaque MITM ou une compromission du serveur de distribution passerait inaperçue.
*(Note : la version flottante `latest` relève de l'exception devcontainer et n'est pas le sujet
de ce TODO — c'est exclusivement l'absence de vérification cryptographique qui est signalée.)*

## Risque

Exécution d'un binaire non vérifié dans le devcontainer ; la chaîne de confiance est rompue entre
le téléchargement et l'exécution.

## Solution

mkcert publie ses checksums sur la même page GitHub Releases. Ajouter une vérification après le
téléchargement :

```dockerfile
ARG MKCERT_SHA256_AMD64="<sha256 du binaire linux/amd64>"
ARG MKCERT_SHA256_ARM64="<sha256 du binaire linux/arm64>"
RUN ARCH=$(dpkg --print-architecture) && \
    curl -sSL "https://dl.filippo.io/mkcert/latest?for=linux/${ARCH}" -o /usr/local/bin/mkcert && \
    case "${ARCH}" in \
      amd64) echo "${MKCERT_SHA256_AMD64}  /usr/local/bin/mkcert" | sha256sum -c ;; \
      arm64) echo "${MKCERT_SHA256_ARM64}  /usr/local/bin/mkcert" | sha256sum -c ;; \
    esac && \
    chmod +x /usr/local/bin/mkcert
```

Récupérer les SHA256 depuis la page GitHub Releases de mkcert. Mettre à jour les ARG à chaque
bump de version.
