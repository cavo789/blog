---
slug: linux-yq
title: "yq — The YAML Processor You Already Know How to Use"
description: "yq is to YAML what jq is to JSON. Query and edit your Docker Compose files, CI configs, and any YAML document from the command line — no installation required beyond Docker."
authors: [christophe, claude]
image: /img/v2/linux-yq.webp
mainTag: linux
draft: true
tags: [bash, docker, linux]
date: 2026-08-04
ai_assisted: true
---

![yq — The YAML Processor You Already Know How to Use](/img/v2/linux-yq.webp)

<TLDR>
`yq` is a command-line YAML processor with the same syntax as `jq`. If you already use `jq` for JSON, you already know how to use `yq`. Run it without installing anything using a one-line Docker alias, then query and edit your `compose.yaml`, CI pipelines, and any YAML file directly from the terminal.
</TLDR>

You have a `compose.yaml` with ten services. You want to know what image the `db` service uses without opening an editor. You want to bump a version number across a CI file without a sed one-liner that you'll never remember. You want to extract all service names into a list.

These are `jq` problems. But your files are YAML, not JSON.

Meet `yq`.

<!-- truncate -->

## What yq is — and which one

There are two tools named `yq`. This article covers [Mike Farah's `yq`](https://github.com/mikefarah/yq) (Go, Docker image `mikefarah/yq`), which has native YAML support and a `jq`-compatible syntax. The other one (`kislyuk/yq`) wraps `jq` after converting YAML to JSON — similar idea, different behavior for YAML-specific features like comments and multi-document files.

If you have the Go version installed locally (`yq --version` returns something like `yq (https://github.com/mikefarah/yq/) version v4.x`), you're all set. Otherwise, the Docker approach below requires nothing extra.

## Install — or just alias

The simplest approach requires no installation at all. Add this alias to your `~/.zshrc` or `~/.bashrc`:

<Terminal>
echo 'alias yq="docker run --rm -i -v \"${PWD}\":/workdir mikefarah/yq"' >> ~/.zshrc
source ~/.zshrc
</Terminal>

That alias mounts your current directory into the container and runs `yq` transparently. Every `yq` command below works with it exactly as written.

If you prefer a local binary, the [releases page](https://github.com/mikefarah/yq/releases) provides static binaries for Linux, macOS, and Windows — no runtime dependencies.

## Reading values

Let's work with a typical `compose.yaml`:

<Snippet source="./files/compose.yaml" language="yaml" />

Read a single value:

<Terminal>
yq '.services.web.image' compose.yaml
</Terminal>

```
nginx:1.25
```

Read a nested value:

<Terminal>
yq '.services.db.environment.POSTGRES_DB' compose.yaml
</Terminal>

```
myapp_db
```

List all service names:

<Terminal>
yq '.services | keys' compose.yaml
</Terminal>

```
- db
- web
```

Get all images across services:

<Terminal>
yq '.services.*.image' compose.yaml
</Terminal>

```
nginx:1.25
postgres:16
```

## Filtering and selecting

Get only services that have a `ports` key defined:

<Terminal>
yq '.services | with_entries(select(.value | has("ports")))' compose.yaml
</Terminal>

```yaml
web:
  image: nginx:1.25
  ports:
    - 8080:80
  ...
```

List all environment variable names for the `web` service:

<Terminal>
yq '.services.web.environment | keys' compose.yaml
</Terminal>

```
- APP_ENV
- LOG_LEVEL
```

## Editing in place

Update the `web` image version. The `-i` flag edits the file in place, just like `sed -i`:

<Terminal>
yq -i '.services.web.image = "nginx:1.27"' compose.yaml
</Terminal>

Add a new environment variable:

<Terminal>
yq -i '.services.web.environment.DEBUG = "false"' compose.yaml
</Terminal>

Delete a key:

<Terminal>
yq -i 'del(.services.db.environment.POSTGRES_PASSWORD)' compose.yaml
</Terminal>

<AlertBox type="warning" title="yq modifies comments">
Unlike JSON, YAML files often contain comments. `yq -i` preserves most comments, but reformats the file. Check the diff after editing if your file has important inline comments.
</AlertBox>

## Reading from stdin and piping

`yq` reads from stdin when no file is given, making it easy to chain with other commands:

<Terminal>
cat compose.yaml | yq '.services | keys'
</Terminal>

Combine with `curl` to parse YAML APIs or configs downloaded on the fly:

<Terminal>
curl -s https://example.com/config.yaml | yq '.database.host'
</Terminal>

## Practical use cases

### Extract all port mappings

<Terminal>
yq '.services.*.ports[]' compose.yaml
</Terminal>

```
8080:80
```

### Check if a key exists before using it

<Terminal>
yq '.services | has("redis")' compose.yaml
</Terminal>

```
false
```

### Update a version across a CI file

Given a `.gitlab-ci.yml` that references an image version in multiple places:

<Terminal>
yq -i '(.[] | select(. == "node:20")).image = "node:22"' .gitlab-ci.yml
</Terminal>

### Merge two YAML files

<Terminal>
yq '. *= load("overrides.yaml")' base.yaml
</Terminal>

This deep-merges `overrides.yaml` into `base.yaml` and prints the result — the source files are unchanged unless you add `-i`.

### Convert YAML to JSON

When you need to pass YAML data to a tool that only accepts JSON:

<Terminal>
yq -o json '.services.web' compose.yaml
</Terminal>

```json
{
  "image": "nginx:1.25",
  "ports": ["8080:80"],
  "environment": {
    "APP_ENV": "production",
    "LOG_LEVEL": "info"
  }
}
```

You can then pipe that output directly to `jq` for further processing.

## The jq crossover

If you already use <Link to="/blog/linux-jq">`jq`</Link> for JSON, the `yq` syntax will feel immediately familiar. Most `jq` expressions work as-is:

| Task | jq (JSON) | yq (YAML) |
| ------ | ----------- | ----------- |
| Read key | `jq '.key'` | `yq '.key'` |
| Filter array | `jq '.[] \| select(.active)'` | `yq '.[] \| select(.active)'` |
| Get keys | `jq 'keys'` | `yq 'keys'` |
| Edit in place | — | `yq -i '.key = "value"'` |
| Convert format | — | `yq -o json '.'` |

The main differences: `yq` adds `-i` for in-place edits and `-o` for output format, and handles YAML-native features like anchors and multi-document files (`---` separators).

## Conclusion

`yq` fills the gap that every `jq` user eventually feels: the same tool, but for YAML. With a Docker alias, there's nothing to install, and the syntax transfers directly from everything you already know. If your workflow involves `compose.yaml`, GitLab CI, GitHub Actions, or Kubernetes manifests, `yq` belongs in your toolkit alongside <Link to="/blog/linux-jq">`jq`</Link>.

The next time you reach for a text editor to check an image version or update a config key, reach for `yq` instead.
