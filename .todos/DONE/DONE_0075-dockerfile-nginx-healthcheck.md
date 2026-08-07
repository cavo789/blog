# 0075 — Ajouter un HEALTHCHECK au stage production (nginx)

- **Priority**: Low
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`

## Problème

Le stage `production` expose les ports 80 et 443 mais ne déclare pas de `HEALTHCHECK`. Docker et
les orchestrateurs (Compose, Kubernetes) ne peuvent pas distinguer un nginx démarré d'un nginx
fonctionnel.

## Risque

Un conteneur en état "unhealthy" (nginx planté mais processus encore présent) est traité comme
"running" — aucun redémarrage automatique ne se déclenche.

## Solution

Ajouter un HEALTHCHECK HTTP contre la page d'accueil (qui renvoie 200 pour le site statique) :

```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -qO- http://localhost/ || exit 1
```

`wget` est disponible dans `nginx:stable-alpine`. Adapter l'intervalle selon les SLO du
déploiement. Si HTTPS uniquement, utiliser `https://localhost/` et ajouter `--no-check-certificate`
(certificat auto-signé local).

Vérifier après ajout :
```bash
docker inspect --format='{{json .State.Health}}' <container_id>
```
