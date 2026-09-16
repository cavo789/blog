---
slug: docker-diff-read-only
title: docker diff - Stop Guessing Which Folders Your Read-Only Container Needs
authors: [christophe, claude]
image: /img/v2/docker_tips.webp
mainTag: docker
draft: true
tags: [docker, security, linux]
date: 2026-09-28
description: 'Running a container with read_only:true turns every hidden write into a crash — one at a time, each one hiding the next. docker diff lists all of them in a single command, including the ones no hardening checklist would have told you about.'
language: en
ai_assisted: true
---

![docker diff - Stop Guessing Which Folders Your Read-Only Container Needs](/img/v2/docker_tips.webp)

<!-- cspell:ignoreCase fontlist matplotlib nginx tmpfs upperdir -->

<TLDR>
`docker diff` lists every file a running container has written to its own filesystem. That list *is* the set of paths you have to hand back as a `tmpfs` or a volume before the container can run with `read_only: true`. One command, the complete inventory — instead of a crash, a fix, another crash, another fix.
</TLDR>

Adding `read_only: true` to a service takes four seconds. Getting the container to start again takes the rest of the afternoon: it dies on a path, you mount a `tmpfs` over it, it dies on the next one, and nothing tells you how many are left. The standard advice — "just add `/tmp`, `/run` and `/var/log`" — is a guess that happens to be right often enough to be dangerous.

There is no need to guess. Docker has shipped the answer since day one, and almost nobody uses it.

<!-- truncate -->

## What Your Container Actually Writes

Two commands. The first one is the failure everybody knows; the second one is the answer nobody runs:

<Terminal source="./files/terminal-1.txt" typewriter wrap={false} />

The error message named **one** path. `docker diff` named all of them — and one of those is `/etc/nginx/conf.d/default.conf`, because the official image *rewrites its own configuration file* at every boot. No hardening checklist in the world has that path on it, and no amount of experience lets you deduce it: the only way to know is to look at what the container actually did.

## Why That List Is the Right List

- A container's filesystem is a stack of read-only image layers with **one writable layer on top**. Every file the container creates or modifies lands in that layer, and nowhere else.
- `docker diff` prints that layer. `A` is a file or folder the container added, `C` one it changed, `D` one it deleted. A folder shows up as `C` when something appeared inside it.
- It is an observation, not a prediction. It reports what *your* image did with *your* configuration — including everything the entrypoint did before your own process even started.
- Which is also its limit: a path that is already a volume or a `tmpfs` never shows up, because those are not the writable layer. Neither do `/proc` and `/sys`, which live in memory.
- So the container has to do real work first. `docker run my-image --help` writes almost nothing; the inventory is only complete once the actual workload has run once.

## Nothing to Install, One Rule to Remember

`docker diff` has been part of Docker since the beginning — there is nothing to add to your machine. It takes a container, running or stopped:

```bash
docker diff <container-name-or-id>
```

The one rule: **don't use `--rm` while investigating**. The writable layer is deleted with the container, and with it the only copy of the evidence. Run the probe container with `--name`, read the diff, then remove it by hand.

## Case 1 — nginx Refuses To Start

The shortest possible reproduction. A `compose.yaml` with nothing in it but the hardening flag:

<Snippet filename="compose.yaml" source="./files/compose-broken.yaml" />

<Terminal title="docker compose up" source="./files/terminal-nginx-crash.txt" />

Two different messages, two different severities, and that matters. The `[emerg]` line is fatal and points at `/var/cache/nginx`. The `info` line above it is *not* fatal — it is the entrypoint failing to patch `/etc/nginx/conf.d/default.conf` and shrugging it off.

Feed the diff back into the file and the service starts:

<Snippet filename="compose.yaml" source="./files/compose-nginx.yaml" />

<Terminal source="./files/terminal-nginx-fixed.txt" />

nginx serves, exit code 0, everything looks healthy — and that `info` line is still there, on every single boot. The container works with one of its startup behaviours silently disabled. That is the part `docker diff` buys you that no crash ever will: **the writes that fail without failing the container**.

Deciding what to do with it is a separate question. A `tmpfs` over `/etc/nginx/conf.d` would let the entrypoint do its job, at the price of losing whatever the image ships in that folder — see <Link to="/blog/docker-volumes">Docker volumes</Link> for the difference between a `tmpfs`, a named volume and a bind mount, because the three are not interchangeable here.

## Case 2 — Your Own Image, Failing One Path At A Time

nginx crashes politely, on its first try. A Python image is worse: it fails, you fix, it fails somewhere else. Here is a minimal one that draws a chart — an unprivileged user, an output folder, nothing exotic:

<Snippet filename="Dockerfile" source="./files/Dockerfile" />

<Snippet filename="plot.py" source="./files/plot.py" />

Run it read-only and watch the cascade:

<Terminal title="Two runs, two different failures" source="./files/terminal-plot-cascade.txt" wrap={false} />

The first error is generous — it names the environment variable that fixes it. The second one is not: the library was only the *first* thing that needed to write. Keep going like this and every fix earns you one more round.

One probe container, and the whole list arrives at once:

<Terminal source="./files/terminal-plot-diff.txt" />

Three things to write, not one: the font cache, the config folder, and the chart itself. And the fix is not three `tmpfs` mounts. **A path that the program will let you move does not need a mount at all** — `MPLCONFIGDIR` relocates both matplotlib folders into the `/tmp` you already have, and `/out` is a bind mount because the whole point is that the file survives the container:

<Snippet filename="compose.yaml" source="./files/compose-plot.yaml" />

<Terminal source="./files/terminal-plot-fixed.txt" />

That is the reflex worth keeping: read the diff, then, for each line, ask whether the tool lets you *redirect* the write before you decide to *host* it. An environment variable beats a mount every time — nothing to keep in sync, and the hardening stays honest.

I used the same trick in <Link to="/blog/docling">my Docling image</Link>: the models are baked in at build time and `DOCLING_ARTIFACTS_PATH` points at them, so a read-only container with no network never has anything to download.

## Under the Hood (skip this if you just want the recipe)

The writable layer is a real directory on your host — the `upperdir` of an OverlayFS mount. `docker diff` walks it and compares what it finds against the image below, which is why the output costs nothing to produce: nothing is scanned, the kernel already did the bookkeeping.

That mechanism explains the three surprises people hit with it:

- **Folders you never touched appear as `C`.** Creating `/var/cache/nginx/client_temp` means OverlayFS had to materialise `/var`, `/var/cache` and `/var/cache/nginx` in the writable layer first. Only the `A` lines are real writes; the `C` lines above them are the path being built.
- **A file you only read can show up.** Any change to its metadata — a timestamp, a permission bit — is a change, and copies the whole file up into the writable layer.
- **`D` on something that still exists.** The container deleted the file *in its own view*; the copy in the image layer underneath is untouched, and a fresh container still sees it.

The counterpart is that `docker diff` is blind to anything mounted over: volumes, bind mounts, `tmpfs`, and the kernel filesystems. When a write goes somewhere you have already mounted, the diff stays silent about it — which is exactly right, since that write is not a problem any more.

## Conclusion

`read_only: true` is one of the cheapest hardening flags Docker offers, and the one people abandon fastest, because the feedback it gives is a single path at a time with no idea how many remain. `docker diff` turns that loop into a list: run the container once without hardening, do the real work, read the inventory, decide mount-by-mount — and, whenever the program allows it, redirect the write instead of mounting anything at all.

The same probe answers a question that has nothing to do with hardening, by the way: *what did this container actually change?* Point it at a container that has been running for a week and you will learn things about your own image. I keep it in the same drawer as <Link to="/blog/markitdown">the small converter images</Link> I build for everything — one command, no installation, and it tells the truth.
