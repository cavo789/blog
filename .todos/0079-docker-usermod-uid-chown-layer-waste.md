# 0079 — Docker : gaspillage de couche dû au usermod quand OS_USERID ≠ 1000

- **Priority**: Low
- **Batch**: docker
- **Depends**: —
- **Files**: `Dockerfile`

## Problème

Quand le UID de l'hôte est différent de 1000 (ex. 1003), la couche 20 du stage `base` exécute
`usermod -u 1003 -g 1003 node`, ce qui provoque un re-chown interne de tous les fichiers de
`/home/node` détenus par l'ancien UID. Cela génère ~21 Mo de couche overlay FS qui duplique les
métadonnées de ~1 410 fichiers (cache npm, oh-my-zsh, .git pack…).

Résultat visible dans dive :
- `/home/node/.oh-my-zsh/.git/objects/pack/…` count=2, 10,5 Mo
- `/home/node/.npm/_cacache/…` — dizaines de fichiers count=2, ~25 Mo cumulés

## Risque

Purement d'espace disque. Fonctionnellement correct : le usermod est nécessaire pour éviter des
conflits de permissions entre le conteneur et l'hôte. Le re-chown interne de `usermod` est un
comportement noyau normal, non contournable sans changer l'architecture.

## Solution envisagée

Deux voies possibles :

1. **Builder une image de base avec le bon UID dès le départ** (ex. `ARG OS_USERID=1003` dans une
   étape séparée qui crée l'utilisateur avec le bon UID directement, sans usermod ultérieur).
   Supprime la couche 20 (~21 Mo) mais complexifie le build multi-arch / multi-UID.

2. **Accepter ce gaspillage** comme coût structurel inévitable du pattern devcontainer avec
   UID-mapping dynamique.

Dépend de la décision sur B1 (remplacement de l'image de base) : avec une base slim construite
from scratch, on peut émettre le bon UID dès le `useradd`.
