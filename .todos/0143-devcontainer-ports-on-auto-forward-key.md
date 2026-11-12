# 0143 — devcontainer.json : clé `onAutoForwardAction` probablement invalide

- **Priority**: Medium
- **Batch**: devcontainer-config
- **Depends**: —
- **Files**: `.devcontainer/devcontainer.json`

## Problème

`portsAttributes` des ports 3000 et 3001 utilise `onAutoForwardAction`. Le nom documenté par la spec devcontainer est `onAutoForward`. Les valeurs `openBrowser` (3000) et `silent` (3001) sont donc vraisemblablement ignorées.

## Risque

Le navigateur ne s'ouvre pas tout seul sur le blog, et le port 3001 notifie au lieu de rester silencieux. Faible impact, mais le fichier sert de modèle à l'article `.unpublished/devcontainer-tips` (astuce 13).

## Solution

Vérifier d'abord : Rebuild Container et observer si le navigateur s'ouvre sur 3000. Si non, renommer en `onAutoForward` dans les deux entrées et revérifier.
