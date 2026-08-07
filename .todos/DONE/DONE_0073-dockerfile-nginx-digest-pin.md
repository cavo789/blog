# 0073 — Épingler l'image nginx:stable-alpine par digest dans le stage production

- **Priority**: Medium
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`

## Problème

Le stage `production` utilise `FROM nginx:stable-alpine` sans digest. Le tag `stable-alpine` peut
être réécrit sur le registry à tout moment, rendant les builds non reproductibles et exposant à une
potentielle substitution d'image.

## Risque

Build non reproductible ; image différente selon la date du build sans que rien dans le Dockerfile
ne l'indique.

## Solution

Récupérer le digest actuel du tag :

```bash
docker pull nginx:stable-alpine
docker inspect --format='{{index .RepoDigests 0}}' nginx:stable-alpine
# ou
docker buildx imagetools inspect nginx:stable-alpine | grep Digest
```

Puis épingler dans le Dockerfile :

```dockerfile
FROM nginx:stable-alpine@sha256:<digest> AS production
```

Garder le tag lisible en plus du digest pour la maintenabilité. Mettre à jour périodiquement
(idéalement en CI via Renovate ou Dependabot).
