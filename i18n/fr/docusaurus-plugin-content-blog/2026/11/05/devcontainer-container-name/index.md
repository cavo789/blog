---
slug: devcontainer-container-name
title: "Devcontainer - Nommez votre container et regroupez-le dans Docker Desktop"
description: Fini les noms de containers aléatoires comme serene_ganguly dans les devcontainers VS Code ; utilisez runArgs pour imposer un nom et regrouper vos containers dans Docker Desktop.
authors: [christophe]
image: /img/v2/devcontainer.webp
mainTag: devcontainer
tags: [devcontainer, docker, vscode]
date: 2026-11-05
ai_assisted: true
---

![Devcontainer - Nommez votre container et regroupez-le dans Docker Desktop](/img/v2/devcontainer.webp)

<!-- cspell:ignore ganguly -->

<TLDR>
Quand VS Code construit un devcontainer à partir d'un `Dockerfile`, Docker lui colle un nom aléatoire du genre `serene_ganguly` et le container atterrit, tout seul, quelque part dans la liste de Docker Desktop. Deux lignes dans la clé `runArgs` de `devcontainer.json` règlent les deux problèmes : `--name=docusaurus` donne un nom stable au container, et `--label=com.docker.compose.project=blog` fait que Docker Desktop le regroupe avec les autres containers, exactement comme la clé `name:` d'un fichier `compose.yaml`.
</TLDR>

Ouvrez la liste des containers de Docker Desktop après quelques jours de travail en devcontainer et vous obtenez quelque chose comme `serene_ganguly`, `objective_hopper`, `vigilant_tesla`... Lequel est mon blog ? Lequel est mon projet PHP ?

Un nom aléatoire est aussi un vrai problème dès que vous voulez être générique : un script, un alias ou une commande `docker exec` ne peut pas viser un container dont le nom change à chaque rebuild.

Avec un fichier `compose.yaml`, vous définiriez simplement `container_name:` pour le container et la clé `name:` de premier niveau pour regrouper les services — voyez <Link to="/blog/docker-name-property">Docker - How to group containers together</Link>. Un devcontainer construit à partir d'un simple `Dockerfile` n'a aucune de ces deux clés.

Il a mieux : `runArgs`.

<!-- truncate -->

## Les deux lignes {#the-two-lines}

`runArgs` est un tableau d'arguments supplémentaires que VS Code passe à `docker run` quand il crée le container. N'importe quel flag de `docker run` y fonctionne, donc :

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

Reconstruisez le container (**Dev Containers: Rebuild Container** depuis la palette de commandes) et regardez à nouveau Docker Desktop.

## `--name` : un nom de container stable {#--name-a-stable-container-name}

`--name=docusaurus` est l'équivalent `docker run` de `container_name:` dans un fichier compose. Le container s'appelle désormais toujours `docusaurus`, donc ceci fonctionne depuis n'importe quel terminal, à chaque rebuild :

```bash
docker exec -it docusaurus bash
docker logs --follow docusaurus
```

<AlertBox variant="caution" title="Un nom, un container">
Un nom de container est unique sur l'host Docker. Ouvrez deux fois le même projet (deux clones, un git worktree, ...) et le second `docker run` échoue avec *Conflict. The container name "/docusaurus" is already in use*. Utilisez un nom par checkout, par exemple `--name=docusaurus-${localWorkspaceFolderBasename}`.
</AlertBox>

## `--label` : le regroupement dans Docker Desktop {#--label-grouping-in-docker-desktop}

Docker Desktop ne regroupe pas les containers par magie : il lit le label `com.docker.compose.project` que Docker Compose pose sur chaque container qu'il crée. La clé `name:` d'un fichier `compose.yaml` n'est rien d'autre que la valeur de ce label.

Rien ne vous empêche de poser ce label vous-même. Avec `--label=com.docker.compose.project=blog`, le devcontainer rejoint le groupe `blog` dans Docker Desktop, à côté de tout container géré par compose partageant le même nom de projet — et peut être arrêté en même temps qu'eux.

Choisissez la même valeur pour tout ce qui va ensemble : `tools` pour vos outils quotidiens, `blog` pour le blog et ses containers annexes, le nom du client pour un projet professionnel, ...

<AlertBox variant="info" title="Une fonctionnalité de Docker Desktop">
Comme la clé `name:`, le regroupement n'est visible que dans Docker Desktop. `docker ps` affiche toujours une liste à plat ; filtrez-la avec `docker ps --filter label=com.docker.compose.project=blog`.
</AlertBox>

<AlertBox variant="caution" title="Le label n'est pas un vrai projet compose">
Le container *ressemble* à un morceau de projet compose, mais il n'a pas été créé par `docker compose`. Ne lancez pas `docker compose -p blog down` en espérant un résultat propre : Compose trouvera un container portant son label sans le reste des métadonnées qu'il attend. Gérez le devcontainer via VS Code, comme avant.
</AlertBox>

## Et si mon devcontainer utilise compose.yaml ? {#and-if-my-devcontainer-uses-composeyaml}

Alors vous n'avez pas besoin de `runArgs` du tout (VS Code l'ignore dans ce mode de toute façon) : définissez `container_name:` sur le service et la clé `name:` de premier niveau dans le fichier compose, comme expliqué dans <Link to="/blog/docker-name-property">Docker - How to group containers together</Link>.

`runArgs` est la réponse pour le cas le plus courant : un `devcontainer.json` qui pointe vers une `image` ou un `Dockerfile`, comme dans <Link to="/blog/vscode-devcontainer">PHP development in a devcontainer with preinstalled code quality tools</Link>.

## Conclusion {#conclusion}

Deux lignes dans `devcontainer.json`, et le `serene_ganguly` aléatoire devient `docusaurus`, bien rangé sous `blog` dans Docker Desktop. Je les ajoute maintenant à chaque nouveau devcontainer, juste après la clé `name`.
