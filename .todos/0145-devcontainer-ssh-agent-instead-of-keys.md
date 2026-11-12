# 0145 — devcontainer.json : tout ~/.ssh monté et clé privée référencée par GIT_SSH_COMMAND

- **Priority**: Medium
- **Batch**: devcontainer-config
- **Depends**: —
- **Files**: `.devcontainer/devcontainer.json`

## Problème

`mounts` monte tout `${localEnv:HOME}/.ssh` (lecture seule) et `containerEnv.GIT_SSH_COMMAND` force `ssh -i /home/node/.ssh/id_ed25519_yahoo`. Les clés privées sont donc lisibles par chaque extension et chaque script du container (Claude Code, Copilot, hooks pre-commit, dépendances npm…). Le projet contredit l'astuce 6 de l'article `.unpublished/devcontainer-tips`.

## Risque

Exfiltration possible d'une clé privée par n'importe quel code tiers exécuté dans le container (supply chain npm notamment).

## Solution

Passer par le transfert d'agent SSH de VS Code : ne monter que `~/.ssh/config` (et éventuellement `known_hosts`) en lecture seule, retirer `GIT_SSH_COMMAND` et sélectionner la clé via `IdentityFile` + `IdentitiesOnly` dans `~/.ssh/config` côté hôte, avec la clé chargée dans l'agent. Vérifier `git push` et `ssh-add -l` dans le container, ainsi que le déploiement (`docusaurus-github-actions-ssh-deploy` n'est pas concerné, il tourne en CI).
