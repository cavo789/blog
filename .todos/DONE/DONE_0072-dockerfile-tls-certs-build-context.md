# 0072 — Repenser la gestion des certificats TLS dans le contexte de build

- **Priority**: High
- **Batch**: docker
- **Depends**: 0071
- **Files**: `Dockerfile`, `.dockerignore`

## Problème

`localhost.pem` et `localhost-key.pem` sont présents à la racine du dépôt et doivent rester dans
le contexte de build car le stage `production` les copie explicitement :

```dockerfile
COPY localhost.pem /etc/nginx/certs/
COPY localhost-key.pem /etc/nginx/certs/
```

Ces fichiers ne peuvent donc pas être exclus du `.dockerignore`. Or, si le stage `build` conserve
un `COPY . .` (voir 0071), ces clés privées seraient inutilement baked dans une couche intermédiaire.
De plus, des clés auto-signées locales n'ont pas leur place dans une image de production publiée.

## Risque

- Fuite de clés privées dans les couches Docker intermédiaires (visible via `docker history`).
- Image de production contenant des certificats locaux non adaptés à un déploiement réel.

## Solution

Deux approches possibles — choisir selon l'usage cible de l'image `production` :

**Option A — Certificats fournis au runtime (recommandé pour la prod)**
Supprimer les `COPY localhost*.pem` du Dockerfile. Monter les certificats via un volume ou un
secret au démarrage du conteneur :
```bash
docker run -v /path/to/real/certs:/etc/nginx/certs:ro blog-docusaurus:production
```
Adapter `nginx.conf` pour que les chemins soient génériques (`/etc/nginx/certs/fullchain.pem`, etc.).

**Option B — Certificats fournis via `--secret` à la construction**
Utiliser `RUN --mount=type=secret,id=tls_cert` pour accéder aux fichiers sans les bake dans une
couche. Nécessite de passer les secrets au `docker build` avec `--secret`.

Dans les deux cas, ajouter `localhost.pem` et `localhost-key.pem` au `.dockerignore` une fois les
COPY supprimés du Dockerfile.

Tester avec `docker run --read-only` après la modification (voir aussi 0076).
