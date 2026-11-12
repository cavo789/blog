# 0144 — devcontainer.json : socket Docker monté deux fois

- **Priority**: Low
- **Batch**: devcontainer-config
- **Depends**: —
- **Files**: `.devcontainer/devcontainer.json`, `.devcontainer/compose.yaml`

## Problème

La feature `docker-outside-of-docker` monte déjà le socket Docker. La ligne `source=/var/run/docker.sock,target=/var/run/docker.sock,type=bind` dans `mounts` fait doublon (et `compose.yaml` le monte peut-être aussi — à vérifier).

## Risque

Aucun bug visible aujourd'hui, mais un doublon de configuration : la feature monte le socket sur un chemin qu'elle relaie (gestion des droits pour l'utilisateur non-root), la ligne manuelle le contourne.

## Solution

Vérifier où la feature monte le socket (`docker inspect` du container), retirer la ligne manuelle de `mounts`, Rebuild Container, puis contrôler que `docker ps` fonctionne en tant que `node` et que `run_ci` passe.
