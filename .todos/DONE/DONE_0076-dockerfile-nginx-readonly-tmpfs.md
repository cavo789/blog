# 0076 — Préparer le stage production nginx pour docker run --read-only

- **Priority**: Low
- **Batch**: docker
- **Depends**: 0072
- **Files**: `Dockerfile`

## Problème

Le stage `production` utilise `nginx:stable-alpine`, qui écrit dans plusieurs chemins au runtime.
Aucun `VOLUME` ni instruction tmpfs n'est déclaré — le conteneur échouerait sous
`docker run --read-only`.

## Chemins identifiés et recommandation

| Chemin | Nature | Recommandation skill |
|--------|--------|----------------------|
| `/var/cache/nginx` | Cache nginx (scratch) | `--tmpfs /var/cache/nginx` |
| `/var/run` | PID file nginx (scratch) | `--tmpfs /var/run` |

Ces deux chemins sont des espaces temporaires — **pas d'état persistant à préserver** → `--tmpfs`
est le bon choix (pas de `VOLUME`).

## Question ouverte (à vérifier en runtime)

Le nginx de ce projet sert un site statique depuis `/usr/share/nginx/html`. La configuration
(`nginx.conf`) doit être inspectée pour confirmer qu'aucun chemin d'écriture supplémentaire n'est
configuré (logs custom, proxy_cache hors `/var/cache/nginx`, etc.). Lancer le test définitif :

```bash
docker run --read-only \
  --tmpfs /var/cache/nginx \
  --tmpfs /var/run \
  -p 8080:80 \
  blog-docusaurus:production
curl -I http://localhost:8080/
```

Si nginx démarre et répond 200, les seuls tmpfs nécessaires sont les deux listés ci-dessus.

## Solution

Documenter la commande `docker run` recommandée dans le `README.md` ou le `makefile`. Ne pas
ajouter de `VOLUME` (les chemins sont du scratch, pas de l'état).
Optionnellement, ajouter dans `compose.yaml` :
```yaml
read_only: true
tmpfs:
  - /var/cache/nginx
  - /var/run
```
