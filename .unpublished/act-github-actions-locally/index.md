---
slug: act-github-actions-locally
title: "act: Run Your GitHub Actions Locally Before You Push"
authors: [christophe, claude]
image: /img/v2/github_tips.webp
mainTag: github
tags: [github, docker, code-quality, tests]
date: 2026-11-07
description: "Stop pushing 'fix CI' commits. act runs your GitHub Actions workflows in local Docker containers, so a formatting or lint failure shows up in seconds, and no commit is needed."
ai_assisted: true
draft: true
---

![act: Run Your GitHub Actions Locally Before You Push](/img/v2/github_tips.webp)

<TLDR>
Testing a GitHub Actions workflow normally means committing, pushing and waiting, then doing it all again for every small mistake. `act` reads your `.github/workflows` files and runs the jobs in local Docker containers, so you get the answer in seconds with nothing pushed. This article uses a Prettier and ESLint workflow in a disposable container, then applies it to your own repository.
</TLDR>

`fix CI`. `fix CI again`. `really fix CI`. `please`. We've all left this kind of history in a branch, each commit followed by a few minutes of watching a spinner, only to learn that a single word in a YAML file was wrong.

By the end of this article, you will run your workflow on your own machine, and you will only push it once it's green.

<!-- truncate -->

## Seeing It in Action with Docker

*Already know act? [Skip to using it on your own repository](#use-it-on-your-own-repository) — this chapter is only a throwaway container to try it risk-free.*

A small project with a real workflow: one job checks the formatting with Prettier, another one runs ESLint. No push and no GitHub account here, just one command:

<Terminal source="./files/terminal_act.txt" />

That's the same message you'd have read in the GitHub interface, minus the commit, the push and the wait. To try it, this image contains `act` and that project:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, build it, and open a shell. `act` starts the job containers through your Docker daemon, hence the socket:

<AlertBox variant="warning" title="The Docker socket gives full control">
Mounting `/var/run/docker.sock` gives this container control over your Docker daemon, and therefore over your machine. `act` itself needs that access wherever it runs. Only run workflows that you trust: a local `run:` step is real code, and it runs on your machine.
</AlertBox>

<Terminal wrap={true}>
$ docker build -t act-demo .
$ docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock act-demo
</Terminal>

See what's available, then run one job, and finally the whole workflow:

<Terminal>
{`/demo # act -l
Stage  Job ID      Job name    Workflow name  Workflow file  Events
0      formatting  formatting  Code quality   quality.yml    push
0      lint        lint        Code quality   quality.yml    push

/demo # act -j formatting
/demo # act`}
</Terminal>

Now fix the code, as you would in your editor, and run it again:

<Terminal>
{`/demo # printf 'const answer = 42;\\nconsole.log("Hello", answer);\\n' > app.js
/demo # act --quiet 2>&1 | grep 'Job '
[Code quality/formatting] 🏁  Job succeeded
[Code quality/lint      ] 🏁  Job succeeded`}
</Terminal>

Two green jobs, and you still haven't committed anything: `act` copies your working folder as it is.

## Why It Feels Like the Real CI

- `act` reads your workflow file itself, so there's nothing to translate: jobs, steps, `uses:` and `needs:` keep their meaning.
- Each job runs in its own container, which is why your local tools and your `PATH` can't hide a missing dependency.
- It's a simulation of the runner, not the runner: the image you choose decides which tools exist, and some GitHub-specific features behave differently or are missing.

If you've read my article on <Link to="/blog/dagger-python">Dagger</Link>, the goal will sound familiar, but the mechanism is different. Dagger has you rewrite the steps as portable code, whereas `act` replays your existing GitHub syntax, unchanged. There's nothing to migrate.

## Use It on Your Own Repository

The easy way is to keep using the image you've built, and mount your project in place of the demo:

<Terminal wrap={true}>
$ docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD":/demo act-demo act -l
</Terminal>

A few options cover most needs:

| You want to | Command |
| --- | --- |
| Run one job | `act -j lint` |
| Simulate a pull request | `act pull_request` |
| See the plan, with no execution | `act -n` |
| Provide secrets from a file | `act --secret-file .secrets` |
| Choose the runner image | `act -P ubuntu-latest=<image>` |

Two points deserve your attention:

- **The runner image.** The demo uses `node:24-bookworm-slim` because it's small, and this workflow only needs Node. If your workflow expects the many tools of a GitHub runner, try `catthehacker/ubuntu:act-latest`, a popular image made for this purpose, and much heavier.
- **Secrets.** Add `.secrets` to your `.gitignore`, and use test values rather than production credentials.

## A Workflow You Can Reuse

The example above is deliberately small, but the pattern scales. Stylelint, shellcheck, or the <Link to="/blog/python-qa">Python quality tools</Link> are simply more jobs in the same file, and each can be run alone with `act -j`. This is especially comfortable while you are writing a new workflow: change a line, run the job, read the result, without a single noise commit in your branch.

It complements a <Link to="/blog/git-precommit">pre-commit hook</Link> rather than replacing it. The hook checks the commit quickly, and `act` tells you if the pipeline itself is right.

## Conclusion

At the beginning of this article, testing a workflow meant four commits and a lot of waiting. With `act`, the feedback now arrives in seconds, and your history only contains the commit that matters. GitHub's run remains the final judge, since a local simulation can't reproduce everything, but it will mostly confirm what you already know. The next time you touch a file in `.github/workflows`, run `act` first; your branch history will thank you.
