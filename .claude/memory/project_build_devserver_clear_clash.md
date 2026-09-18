---
name: project-build-devserver-clear-clash
description: "safe_build.sh et la fonction start commencent tous deux par yarn clear, qui efface .docusaurus/ ET .docusaurus-dev/ — chacun tue le travail de l'autre"
metadata:
  node_type: memory
  type: project
  originSessionId: 2831be86-f031-44cb-999e-2dd1a5feac50
  modified: 2026-09-18T16:08:28.162Z
---

`yarn clear` efface **les deux** dossiers de codegen : `.docusaurus/` (les builds) et
`.docusaurus-dev/` (le serveur de dev toujours actif). Or `.claude/scripts/safe_build.sh` et la
fonction `start` de `.devcontainer/scripts/helpers/server.sh` commencent chacun par un `yarn clear`.

Conséquences vérifiées le 2026-09-18 :

- lancer `safe_build.sh` pendant que le serveur de dev tourne **tue le serveur** (plus rien sur le
  port 3000) — la séparation `.docusaurus-dev/` protège d'un build concurrent, pas du `clear` ;
- lancer `start` pendant qu'un build tourne effacerait le `.docusaurus/` de ce build ;
- `safe_build.sh` refuse de démarrer si un autre build tourne (`REFUS : un build tourne déjà`), mais
  rien ne protège le serveur de dev.

**Why:** les deux symptômes ressemblent à un bug de code (« site ne répond plus », erreurs ENOENT en
plein build) alors que c'est une collision de `yarn clear`.

**How to apply:** ordre imposé — build d'abord, relance du serveur ensuite. Prévenir les sessions
voisines avant (voir [[feedback-dev-server-restart]]) ; en multi-session, attendre la fin du build du
voisin avant tout `clear`. Ne jamais tester `pgrep -f "docusaurus build"` dans une boucle d'attente
sans filtrer : le shell qui attend porte le motif dans sa propre ligne de commande et se voit
lui-même — c'est le piège déjà documenté en tête de `safe_build.sh`. Voir aussi
[[project-devcontainer-structure]].
