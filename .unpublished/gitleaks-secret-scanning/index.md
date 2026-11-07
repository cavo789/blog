---
slug: gitleaks-secret-scanning
title: "Gitleaks: That Token You Deleted Is Still in Your Git History"
authors: [christophe, claude]
image: /img/v2/secrets.webp
mainTag: git
tags: [git, security, docker, github, gitlab, code-quality]
date: 2026-11-07
description: "Deleting a leaked token in a new commit doesn't remove it from Git. Gitleaks finds secrets across your whole history and blocks new ones before the commit, with a single docker run."
ai_assisted: true
draft: true
---

![Gitleaks: That Token You Deleted Is Still in Your Git History](/img/v2/secrets.webp)

<TLDR>
Removing a secret in a new commit leaves it in the history, readable by anyone who can clone the repository. Gitleaks scans every commit with a set of detection rules and tells you which file, line, commit and author are involved. It runs from its Docker image with nothing to install, and the same tool can block a secret before it is committed or stop it in your CI.
</TLDR>

You paste an API token into a config file to test something quickly. You commit, you push, and ten seconds later you see it. Aaaargh. No panic: you delete the line, commit "remove token", push again, and the file is clean. Problem solved?

No. The token is still one `git log -p` away. By the end of this article, you will be able to find these forgotten secrets in any repository and stop new ones from getting in.

<!-- truncate -->

## Seeing It in Action with Docker

*Already know Gitleaks? [Skip to scanning your own repository](#scan-your-own-repository) — this chapter is only a throwaway container to try it risk-free.*

This is the story above, replayed in a small demo repository. The current folder holds a single harmless file, yet Gitleaks finds the token in a commit from the past:

<Terminal>
{`$ ls
app.py

$ git log --oneline
a51c22e Oops, remove the token
51c8fb0 Add API configuration
1f6810e Initial commit

$ gitleaks git . --no-banner --redact
Finding:     REDACTED
Secret:      REDACTED
RuleID:      github-pat
Entropy:     5.121928
File:        config.py
Line:        1
Commit:      51c8fb04a701d271b71585fce0993eb2b0db9476
Author:      Demo
Email:       demo@example.com
Date:        2026-11-07T08:09:08Z
Fingerprint: 51c8fb04a701d271b71585fce0993eb2b0db9476:config.py:github-pat:1

8:09AM WRN leaks found: 1`}
</Terminal>

It's a GitHub personal access token, in `config.py`, line 1, in commit `51c8fb0`. To reproduce this yourself, this image contains Gitleaks and that exact repository (with a fake token):

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, then:

<Terminal>
$ docker build -t gitleaks-demo .
$ docker run --rm -it gitleaks-demo
/demo # gitleaks git . --no-banner -v
</Terminal>

Compare with a scan of the files alone, which only looks at what is on disk today:

<Terminal>
{`/demo # gitleaks dir . --no-banner
8:09AM INF no leaks found`}
</Terminal>

This is the difference that matters: **`dir` looks at your folder, `git` looks at everything your repository remembers**.

## Why It Catches What a Quick grep Misses

- Its default rules know the shape of hundreds of credentials (GitHub, AWS, Stripe, Slack, private keys…), and you don't have to think of a search term.
- It reads the patch of every commit, including lines that no longer exist in your files.
- It needs no account, no external service and no AI model: the scan is local, and your secrets never leave your machine.

## Scan Your Own Repository

From the root of any repository:

<Terminal wrap={true}>
$ docker run --rm -v "$PWD":/repo zricethezav/gitleaks:v8.30.1 git --no-banner --redact /repo
</Terminal>

`--redact` hides the secret in the output, which is what you want if your terminal output ends up in a log or a screenshot. The command returns `1` when it finds something and `0` when it doesn't, and this is what makes everything below possible.

<AlertBox variant="danger" title="A leaked secret must be revoked">
If a real secret shows up, **revoke it first** at its provider and create a new one. Rewriting the history comes afterward, if at all: forks, clones and caches may already have the old commits.
</AlertBox>

Some findings are harmless, like a fake key in a test. Put a `.gitleaks.toml` at the root of the repository to keep the default rules and exclude what you've checked:

```toml title=".gitleaks.toml"
[extend]
useDefault = true

[allowlist]
paths = ['''tests/fixtures/.*''']
```

## Stop It Before the Commit

Finding an old leak is good; never creating one is better. `--staged` only looks at what you are about to commit, so it's fast enough for a Git hook:

```bash title=".git/hooks/pre-commit"
#!/usr/bin/env bash
docker run --rm -v "$PWD":/repo zricethezav/gitleaks:v8.30.1 \
  git --staged --no-banner --redact /repo
```

Make it executable with `chmod +x .git/hooks/pre-commit`. From now on, a commit containing a token is refused, and you can fix it while it's still private. If you already use the `pre-commit` framework, <Link to="/blog/git-precommit">Gitleaks is available there as a hook too</Link>.

Rules see the known shapes, and that's their strength and their limit. For a password that looks like ordinary text, <Link to="/blog/ollama-git-precommit">a local LLM check before each commit</Link> is a good complement: one is fast and predictable, while the other understands context.

## The Safety Net in CI

A hook lives on one machine and can be skipped, so also run the scan on the server. The job only needs to clone the whole history, and to fail when the command fails.

On GitHub Actions, `fetch-depth: 0` is the important line, since a shallow clone would hide the older commits:

```yaml title=".github/workflows/gitleaks.yml"
name: Secret scan
on: [push, pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0
      - run: |
          docker run --rm -v "$PWD":/repo zricethezav/gitleaks:v8.30.1 \
            git --no-banner --redact /repo
```

On GitLab CI, the image can be used directly:

```yaml title=".gitlab-ci.yml"
gitleaks:
  image:
    name: zricethezav/gitleaks:v8.30.1
    entrypoint: [""]
  variables:
    GIT_DEPTH: "0"
  script:
    - gitleaks git --no-banner --redact .
```

## Conclusion

At the beginning of this article, deleting a line felt like the end of the problem. Now you know that Git remembers, and you can ask it in one command what it remembers about your secrets. Run the scan once on your oldest repository, because it's the one most likely to surprise you. Then add the hook so that you never have to run that scan with a knot in your stomach again.
