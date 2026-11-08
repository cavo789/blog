---
slug: devcontainer-container-name
title: "Devcontainer - Name Your Container and Group It in Docker Desktop"
description: Stop getting random container names like serene_ganguly from VS Code devcontainers; use runArgs to force a name and group containers in Docker Desktop.
authors: [christophe]
image: /img/v2/devcontainer.webp
mainTag: devcontainer
tags: [devcontainer, docker, vscode]
date: 2026-11-05
ai_assisted: true
updates:
  - date: 2026-11-08
    note: Add a `-devcontainer` suffix to the container name and the group label
---

![Devcontainer - Name Your Container and Group It in Docker Desktop](/img/v2/devcontainer.webp)

<!-- cspell:ignore ganguly -->

<TLDR>
When VS Code builds a devcontainer from a `Dockerfile`, Docker picks a random name like `serene_ganguly` and the container lands, alone, somewhere in the Docker Desktop list. Two lines in the `runArgs` key of `devcontainer.json` fix both problems: `--name=docusaurus-devcontainer` gives the container a stable name, and `--label=com.docker.compose.project=blog-devcontainer` makes Docker Desktop group it, exactly like the `name:` key of a `compose.yaml` file. The `-devcontainer` suffix keeps development environments apart from the containers that run services.
</TLDR>

Open the container list of Docker Desktop after a few days of devcontainer work and you get something like `serene_ganguly`, `objective_hopper`, `vigilant_tesla`... Which one is my blog? Which one is my PHP project?

A random name is also a real problem as soon as you want to be generic: a script, an alias or a `docker exec` command can't target a container whose name changes at every rebuild.

With a `compose.yaml` file, you'd simply set `container_name:` for the container and the top-level `name:` key to group services — see <Link to="/blog/docker-name-property">Docker - How to group containers together</Link>. A devcontainer built from a plain `Dockerfile` has neither of these keys.

It has something better: `runArgs`.

<!-- truncate -->

## The two lines

`runArgs` is an array of extra arguments VS Code passes to `docker run` when it creates the container. Any `docker run` flag works there, so:

<Snippet filename=".devcontainer/devcontainer.json" source="./files/devcontainer.json" />

Rebuild the container (**Dev Containers: Rebuild Container** from the command palette) and look at Docker Desktop again.

## `--name`: a stable container name

`--name=docusaurus-devcontainer` is the `docker run` equivalent of `container_name:` in a compose file. The container is now always called `docusaurus-devcontainer`, so this works from any terminal, on every rebuild:

```bash
docker exec -it docusaurus-devcontainer bash
docker logs --follow docusaurus-devcontainer
```

<AlertBox variant="caution" title="One name, one container">
A container name is unique on the Docker host. Open the same project twice (two clones, a git worktree, ...) and the second `docker run` fails with *Conflict. The container name "/docusaurus-devcontainer" is already in use*. Use one name per checkout, for instance `--name=${localWorkspaceFolderBasename}-devcontainer`.
</AlertBox>

## `--label`: grouping in Docker Desktop

Docker Desktop doesn't group containers by magic: it reads the `com.docker.compose.project` label that Docker Compose sets on every container it creates. The `name:` key of a `compose.yaml` file is nothing more than the value of that label.

Nothing stops you from setting the label yourself. With `--label=com.docker.compose.project=blog-devcontainer`, the devcontainer joins the `blog-devcontainer` group in Docker Desktop — and can be stopped together with any other container carrying the same label.

Pick the same value for everything that belongs together, and keep the `-devcontainer` suffix: on a real project, the `blog` group holds the containers that run services (a database, a reverse proxy, ...) while `blog-devcontainer` holds the environments you code in. One glance at Docker Desktop tells you which is which, and stopping one group never stops the other.

<AlertBox variant="info" title="A Docker Desktop feature">
Like the `name:` key, the grouping is only visible in Docker Desktop. `docker ps` still shows a flat list; filter it with `docker ps --filter label=com.docker.compose.project=blog-devcontainer`.
</AlertBox>

<AlertBox variant="caution" title="The label is not a real compose project">
The container *looks* like part of a compose project, but it wasn't created by `docker compose`. Don't run `docker compose -p blog-devcontainer down` expecting a clean result: Compose will find a container carrying its label without the rest of the metadata it expects. Manage the devcontainer through VS Code, as before.
</AlertBox>

## And if my devcontainer uses compose.yaml?

Then you don't need `runArgs` at all (VS Code ignores it in that mode anyway): set `container_name:` on the service and the top-level `name:` key in the compose file, as explained in <Link to="/blog/docker-name-property">Docker - How to group containers together</Link>.

`runArgs` is the answer for the most common setup: a `devcontainer.json` pointing to an `image` or a `Dockerfile`, as in <Link to="/blog/vscode-devcontainer">PHP development in a devcontainer with preinstalled code quality tools</Link>.

## Conclusion

Two lines in `devcontainer.json`, and the random `serene_ganguly` becomes `docusaurus-devcontainer`, neatly filed under `blog-devcontainer` in Docker Desktop. I now add them to every new devcontainer, right after the `name` key.
