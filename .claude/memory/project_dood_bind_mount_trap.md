---
name: project-dood-bind-mount-trap
description: Depuis le devcontainer, docker run -v utilise des chemins de l'HÔTE, pas du conteneur — tester une image demande un volume nommé
metadata:
  type: project
---

Le devcontainer utilise **docker-outside-of-docker** : `/var/run/docker.sock` est
bind-monté depuis l'hôte, donc `docker` parle au daemon de l'hôte. Conséquence : dans
`docker run -v <source>:<cible>`, `<source>` est résolu **sur l'hôte**, jamais dans le
devcontainer.

Un `-v "$PWD:/workspace"` depuis le scratchpad (`/tmp/claude-.../`) monte donc un
répertoire vide, et le conteneur répond « file does not exist » sans autre indice.

**`/opt/docusaurus` est le piège dans le piège** (vérifié 2026-09-17) : ce chemin existe
*aussi* côté hôte, mais c'est un **autre dossier** — 6 entrées (`blog/`, `build/`, les certs,
`nginx.conf`), pas le dépôt. Un `-v /opt/docusaurus/...` ne casse donc pas bruyamment : il
monte silencieusement le mauvais contenu. Le vrai dépôt est à `${HOST_PROJECT_DIR}`
(`/home/christophe/repositories/blog`), exporté dans `containerEnv` — **toujours** passer par
cette variable pour un `-v`.

**Exception importante — `docker build` n'est PAS concerné.** Le contexte de build est empaqueté
par le *client* (le CLI, dans le devcontainer) puis envoyé au daemon, donc `docker build .` et
`docker compose build docusaurus` fonctionnent normalement depuis `/opt/docusaurus` avec les
fichiers du dépôt. À l'inverse, passer `${HOST_PROJECT_DIR}` comme contexte échoue
(`path not found`) : c'est l'exact miroir de la règle des `-v`.

**Comment tester une image** : créer un volume nommé et l'alimenter par stdin.

```bash
docker volume create t
docker run -i --rm -v t:/ws -u root --entrypoint sh <image> -c 'cat > /ws/f.pdf; chmod 777 /ws' < f.pdf
docker run --rm -v t:/workspace <image> <commande>
```

Corollaire : ce qu'un conteneur `--rm` écrit dans la couche image (ex. `/opt/docling-models`)
est perdu à la sortie — télécharger puis utiliser doit tenir dans **un seul** `docker run`.

Autre corollaire utile : le daemon étant celui de l'hôte, `docker images` montre les images
construites par Christophe. Vérifier leur taille/date permet de diagnostiquer un « ça ne
marche pas » sans lui faire copier un traceback. Voir [[project-devcontainer-structure]].
