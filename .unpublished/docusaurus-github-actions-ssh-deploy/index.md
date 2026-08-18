---
slug: docusaurus-github-actions-ssh-deploy
title: "Publish Your Docusaurus Blog With a Single git push"
authors: [christophe, claude]
image: /img/v2/publishing_blog.webp
mainTag: github
tags: [github, docusaurus, ssh]
date: 2026-08-24
description: My blog goes live because I typed `git push` and then did something else. GitHub Actions builds the site, refuses to deploy it if a link is broken, and rsyncs only the files that actually changed to my SSH hosting. The same setup lets me publish a finished article from my phone by deleting one line.
language: en
ai_assisted: true
draft: true
---

![Publish Your Docusaurus Blog With a Single git push](/img/v2/publishing_blog.webp)

<!-- cspell:ignore keyscan itemize chmod rsync christophe -->

<TLDR>
I write my blog locally, then `git add`, `git commit`, `git push` — and that is the whole publishing procedure. GitHub Actions checks out the repository, runs `yarn build`, refuses to go any further if the build failed or produced a malformed sitemap, then sends only the changed files to my hosting with `rsync` over SSH. The transfer takes seconds rather than minutes, because it sends the difference rather than the site. As a bonus, an article can sit in the repository fully written with `draft: true` in its front matter; deleting that single line from GitHub's web editor — from a phone, from anywhere — publishes it.
</TLDR>

For a long time, publishing an article meant opening WinSCP, dragging the contents of my `build` folder onto the remote pane, and watching a progress bar. It worked, in the sense that a bicycle works for a commute. The problems were never dramatic, just constant: I was never quite sure the upload had finished, whether I had dropped the folder at the right level, or whether the file I had renamed still had an orphan twin sitting on the server. And publishing was tied to one machine — the one with the source, the credentials and the build tooling.

The part that finally bothered me was subtler. A deployment is a *decision*, and I was making it with my mouse. There was no step in the middle that could look at what I was about to publish and tell me "no".

Here is the setup that replaced all of it: I push to `main`, and the site updates itself.

<!-- truncate -->

## What Publishing Looks Like Now

This is the whole thing, on my machine:

<Terminal typewriter wrap={true} source="./files/git-push.txt" />

And this is what happens next, without me:

```plaintext title="One push, three actors"
my PC                    GitHub Actions                        my hosting
─────                    ──────────────                        ──────────

git push ──────────────▶ checkout (full history)
                         yarn install + yarn build
                         │
                         ├─ build fails?           ✗  stop — nothing is deployed
                         ├─ empty sitemap or RSS?  ✗  stop — nothing is deployed
                         ├─ malformed XML?         ✗  stop — nothing is deployed
                         │
                         └─ rsync over SSH ──────────────────▶  live site
                            (only the changed files,              │
                             in three passes)                     │
                                                                  │
                         smoke test  ◀────────────────────────────┘
                         (home page, sitemap, RSS answer 200?)
```

That last arrow is the part worth looking at. Here is what `rsync` reports when I publish an edit to a single article:

<Terminal source="./files/rsync-stats.txt" />

Read the last three lines together, because they are the whole point. Editing one article changed 413 HTML pages — my site-wide navigation index is bundled into `main.js`, so touching any article changes that bundle's content hash, which every page references. On paper that is 43 MB of updated files. In practice 287 KB crossed the network, because `rsync` recognised 42.64 MB of blocks already sitting on the server and sent only the fragments that genuinely differ.

A deploy that changes no content at all moves about 1.76 MB — the search index, which re-chunks itself on every build. I close the terminal at the `git push`, and the rest is somebody else's problem, a "somebody else" that is free for public repositories.

## Why It Works

- **The build happens on GitHub, not on my PC.** My laptop no longer needs to be the machine with the credentials — it only needs `git`. Nothing about the deployment depends on my local `node_modules` being in a good mood.
- **A failing build is a deployment that never starts.** Docusaurus refuses to build on an MDX syntax error, a broken heading anchor or a duplicate route, and the workflow adds its own checks on top — an empty or malformed `sitemap.xml` or RSS feed stops everything. Because all of it runs *before* the transfer, the broken version cannot reach readers.
- **Only what changed crosses the wire** — and "what changed" is measured in blocks, not files. On a site of about 3000 files and 165 MB, publishing an article costs a few hundred kilobytes.
- **The credentials never leave GitHub.** The private key and the server details live as repository secrets. They are injected into a throwaway virtual machine that is destroyed minutes later, and they never appear in the logs.
- **The site is a function of the repository.** There is exactly one path to production, and it starts with a commit. No file can be live without existing in git — which also means no file can be live that I cannot find again.

## Setting It Up

Three things are needed on the hosting side. If your host gives you SSH access — most do, even on shared plans — you almost certainly have all three already.

<Prerequisite
  name="SSH access to your hosting"
  install="Enable SSH in your hosting control panel"
  check="ssh -p <port> <user>@<host> 'echo OK'"
  checkOutput="OK"
/>

<Prerequisite
  name="rsync, installed server-side"
  install="Usually pre-installed; ask your host otherwise"
  check="ssh -p <port> <user>@<host> 'rsync --version | head -1'"
  checkOutput="rsync  version 3.1.3  protocol version 31"
/>

If you have never connected to your host over SSH, I wrote a walkthrough for exactly that in <Link to="/blog/connect-using-ssh-to-your-hosting-server">how to connect to your hosting server using SSH</Link>. The third requirement is the absolute path of your web root — the folder that contains `index.html` — which you get by connecting and running `pwd` in it. Mine is `/home/christophe/www`; note that it is *not* the folder SSH drops you into, and pointing a deployment at the wrong level is the one mistake worth being paranoid about.

### A key that only deploys

Do not reuse your personal SSH key. Generate one whose only job is this deployment, so that revoking it later costs you nothing:

```bash title="On your PC"
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/blog_deploy -N ""
ssh-copy-id -i ~/.ssh/blog_deploy.pub -p <port> <user>@<host>
```

Then confirm the new key works on its own, before GitHub depends on it:

```bash
ssh -i ~/.ssh/blog_deploy -p <port> <user>@<host> 'pwd'
```

This is the same mechanism as connecting your GitHub account over SSH, which I covered in <Link to="/blog/github-connect-using-ssh">connect your account using SSH</Link> — a key pair, the public half on the far end, the private half staying home.

### Five secrets

In your repository, under *Settings* → *Secrets and variables* → *Actions*, create:

| Secret | Value |
| --- | --- |
| `SSH_HOST` | Your server's hostname |
| `SSH_USER` | Your SSH username |
| `SSH_PORT` | The SSH port (often 22) |
| `REMOTE_PATH` | Absolute path of the web root, e.g. `/home/user/www` |
| `SSH_KEY` | The full contents of `~/.ssh/blog_deploy` |

<AlertBox variant="caution">
`SSH_KEY` is the **private** key — the file without `.pub`. Copy it whole, including the `-----BEGIN OPENSSH PRIVATE KEY-----` and `-----END OPENSSH PRIVATE KEY-----` lines. Those are delimiters, not decoration: without them the key cannot be parsed.
</AlertBox>

### The workflow

One file, `.github/workflows/deploy.yml`, and you are done:

<Snippet filename=".github/workflows/deploy.yml" source="./files/deploy.yml" defaultOpen={false} />

Push it, and the next commit to `main` deploys itself.

<AlertBox variant="note">
Expect the **first** run to transfer almost everything. `rsync` has no idea what is already on the
server until it has compared the two sides once, and whatever is up there right now came from a
different tool and a different build. Mine moved 52 MB on the first pass and 1.76 MB on the next
one. Judge the setup on the second run, not the first.
</AlertBox>

The file is my real one, so two things in it are mine rather than yours: the URLs in the final
smoke test, and the `--exclude` list protecting the folders on my server that no build produces.
Change both before the first run.

<AlertBox variant="tip">
Run it once manually first. The workflow exposes a `dry_run` input: from the *Actions* tab, *Run workflow*, set `dry_run` to `true`, and `rsync` will list every file it *would* send without writing anything on the server. Check two things in that output — that the destination path is your web root and not the parent folder, and that the reported total is a few megabytes rather than your whole site.
</AlertBox>

## Publishing From a Phone

This is the part I did not expect to use as much as I do.

Docusaurus honours a `draft: true` front matter key: the article is visible when I run `yarn start` locally, and absent from the production build, from the listings, from the RSS feed and from the sitemap. So a finished article can live in the repository, in its final location, committed and pushed, and still be invisible to readers:

```markdown title="blog/2026/08/17/anythingllm-chat-with-your-docs/index.md"
---
slug: anythingllm-chat-with-your-docs
title: "AnythingLLM: Chat With All Your Scattered Documentation"
date: 2026-08-17
draft: true
---
```

Publishing it is then a matter of deleting one line. And since the repository is on GitHub, that line can be deleted from the web interface — the pencil icon on the file view — which works perfectly well on a phone. I commit from the browser, the workflow fires, and a minute later the article is live. No laptop, no build tooling, no VPN.

The trick is that this is not a special "scheduling" feature bolted on: it is the ordinary deployment pipeline reacting to an ordinary commit. Whatever makes a push safe makes this safe too — the build runs, the checks run, and if that three-week-old article no longer compiles because a component it uses has changed since, the deployment stops and the site stays as it was.

## The Catch: Your Build Must Be Reproducible

Everything above rests on an assumption worth making explicit, because nothing warns you when it
fails: **two builds of unchanged sources must produce byte-identical files.**

If they do not, `--checksum` has nothing to skip. Every deploy ships the whole site, and the four
seconds become ten minutes. The usual culprit is a build timestamp — a plugin, a theme or a feed
generator writing `new Date()` into its output. One such value inside the JavaScript bundle is
enough to change the bundle's content hash, which renames the file, which changes every HTML page
that references it. One line of code, the entire site re-uploaded.

Checking takes two minutes and no tooling:

```bash title="Build twice, compare"
yarn build && find build -type f -exec md5sum {} + | sort -k2 > /tmp/a.txt
yarn build && find build -type f -exec md5sum {} + | sort -k2 > /tmp/b.txt
diff /tmp/a.txt /tmp/b.txt | grep '^[<>]' | wc -l
```

Zero is what you want. A large number means something in your pipeline is stamping the clock into
its output; `grep -rn "new Date()" plugins/` usually finds it in one shot. The fix is to derive the
value from the content instead of the clock — an RSS feed's `lastBuildDate`, for instance, is more
honestly the date of its most recent entry — or to drop the field when nothing reads it.

<AlertBox variant="note">
Compare **cold** builds if you can (delete `.docusaurus` and `node_modules/.cache` first). A warm
incremental rebuild can renumber chunks in ways a CI runner, which always starts from an empty
cache, never will.
</AlertBox>

## Under the Hood (skip this if you just want to use it)

A few decisions in that workflow are not obvious, and each one is there for a reason.

**`--checksum` is what keeps the transfer small.** By default `rsync` decides a file has changed by comparing size and modification time. That is useless here: Docusaurus rewrites every file on every build, so all 3000 timestamps always look brand new, and `rsync` would ship the entire site each time. Comparing content hashes instead means an unchanged file is skipped even though it was just regenerated. It costs a little CPU on both ends and saves nearly everything. The delta algorithm then shrinks what is left a second time, which is how 43 MB of changed files became 287 KB on the wire above.

**`--delete`, but only where it cannot hurt.** `rsync` can mirror the source exactly, removing anything on the far end the build no longer produces. Pointed at the whole web root that would be reckless: mine also holds a small PHP API with live reader data and its `.env`, plus `.well-known/` — the ACME challenge folder my SSL renewal needs, and the `atproto-did` file backing my Bluesky domain handle. None of it exists in the repository, so none of it could be restored.

So the transfer runs in three passes instead of one. The first sends the site with no `--delete` at all. The other two target `assets/` and `pagefind/`, which are 100% generated output with content-hashed filenames — anything there the build stopped producing is dead weight by definition. Restricting the source and destination paths to those two folders bounds the damage by construction: the command cannot reach outside them, however wrong my reasoning about their contents might be.

Pagefind is the reason this is worth doing at all. It re-chunks its search index on every single build, even when no article changed, so each deploy would otherwise leave around sixty orphan files behind forever.

What this deliberately does *not* clean up is the page of an article I delete or send back to `draft: true`. That lives under `blog/`, outside the two swept folders, and stays online until I remove it by hand. `rsync -rn --delete` lists the candidates without touching anything, which makes it a periodic chore rather than a risk.

**`filter: blob:none` on the checkout.** The blog plugin's `showLastUpdateTime` needs the full commit history to know when each post was last touched, so a shallow clone will not do. But it needs commit *metadata*, not content — and asking for the whole history normally means downloading every past version of every file, which for a blog full of committed screenshots is hundreds of megabytes. A blobless partial clone fetches the history without the old file contents.

**The deploy queues instead of cancelling.** Most CI workflows cancel a run when a newer commit arrives, which is right for tests and wrong here: a transfer killed halfway leaves the site with a half-updated set of files. The `concurrency` block therefore uses `cancel-in-progress: false`, so two quick pushes deploy one after the other.

**Only the yarn download cache is cached.** The tempting move is to cache `node_modules`, but on this project that directory is measured in gigabytes, and archiving and restoring something that large costs more time than the build it saves. Caching what `yarn` downloaded is cheap and does the useful part.

**Commits starting with `wip` do not deploy.** A one-line condition on the job. Handy for pushing work in progress, and indispensable the first time you push the workflow itself — the file has to reach `main` before the manual `dry_run` button exists at all. Worth knowing that GitHub honours `[skip ci]` in a commit message natively, and that this is stronger: the run is never created, rather than created and skipped. That keyword list is fixed and cannot be extended, which is exactly why the `wip` condition exists alongside it.

## Conclusion

The mouse-and-progress-bar era ended for me the day the pipeline got a step that could say "no". Everything else — the smaller transfers, the phone publishing, the fact that my laptop no longer holds any deployment credential — followed from moving the build off my machine and giving it one single path to production.

If you are earlier in the journey, this whole setup assumes a Docusaurus blog living in git; <Link to="/blog/docusaurus-docker-own-blog">running your own blog with Docusaurus and Docker</Link> covers getting there. And if your hosting only speaks FTP, the same idea works with an FTP action instead of `rsync` — that was my <Link to="/blog/github-action">earlier version of this workflow</Link>, and it is a perfectly reasonable place to start.
