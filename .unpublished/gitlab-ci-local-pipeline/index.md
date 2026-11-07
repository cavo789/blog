---
slug: gitlab-ci-local-pipeline
title: "gitlab-ci-local: Run Your GitLab Pipeline Before You Push"
authors: [christophe, claude]
image: /img/v2/gitlab.webp
mainTag: gitlab
tags: [gitlab, docker, code-quality, php, python, bash]
date: 2026-11-07
description: "Replay your real .gitlab-ci.yml on your machine with gitlab-ci-local: shellcheck, shfmt, php-cs-fixer, phpcs, ruff and mypy, each in its own Docker image, with no push and no waiting."
ai_assisted: true
draft: true
---

![gitlab-ci-local: Run Your GitLab Pipeline Before You Push](/img/v2/gitlab.webp)

<TLDR>
Pushing to find out whether a GitLab pipeline passes is slow, and `gitlab-runner exec` is no longer an option. `gitlab-ci-local` reads your existing `.gitlab-ci.yml` and runs its stages and jobs in local Docker containers, with the same images. This article replays a quality pipeline mixing Bash, PHP and Python, from a single job up to the whole pipeline, in a disposable container.
</TLDR>

You push. You switch to the pipeline page. You wait for a free runner, then for the image, then for the job, and four minutes later: `php-cs-fixer` is unhappy about one space. You fix it, push again and wait again. On a pipeline with many jobs, this ritual can eat a whole morning.

By the end of this article, you'll run those same jobs on your machine from your real `.gitlab-ci.yml`, and only push when they're green.

<!-- truncate -->

## Seeing It in Action with Docker

*Already know the tool? [Skip to using it on your own repository](#use-it-on-your-own-repository) — this chapter is only a throwaway container to try it risk-free.*

Let's begin with the simplest possible case, a single job. Without any push, it runs `shellcheck` from its official image and finds an unquoted variable in a Bash script:

<Terminal>
{`$ gitlab-ci-local shell-lint
shell-lint starting koalaman/shellcheck-alpine:stable (lint)
shell-lint copied to docker volumes in 441 ms
shell-lint $ shellcheck scripts/*.sh
shell-lint >
shell-lint > In scripts/backup.sh line 4:
shell-lint > cp -r data $target
shell-lint >            ^-----^ SC2086 (info): Double quote to prevent globbing and word splitting.
shell-lint >
shell-lint > Did you mean:
shell-lint > cp -r data "$target"
shell-lint finished in 7.85 s  FAIL 1`}
</Terminal>

And here's the entire pipeline once the code is fixed:

<Terminal>
{`$ gitlab-ci-local
 PASS  shell-format
 PASS  php-style
 PASS  shell-lint
 PASS  python-quality
pipeline finished in 7.86 s`}
</Terminal>

Four jobs and three languages in under eight seconds, once the images are downloaded. To try it, this image contains `gitlab-ci-local`, the pipeline and a small project with mistakes in it:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder and build it. `gitlab-ci-local` starts the job containers through your Docker daemon, which is why the socket is mounted:

<AlertBox variant="warning" title="The Docker socket gives full control">
Mounting `/var/run/docker.sock` gives this container control over your Docker daemon, and therefore over your machine. `gitlab-ci-local` needs that access wherever it runs. The scripts in a pipeline really run on your machine, so only replay the ones you trust.
</AlertBox>

<Terminal wrap={true}>
$ docker build -t gcl-demo .
$ docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock gcl-demo
</Terminal>

Then see which jobs exist, and run the first one:

<Terminal>
{`$ gitlab-ci-local --list
name            description  stage   when        allow_failure  environment  needs
shell-format                 format  on_success  false
php-style                    format  on_success  false
shell-lint                   lint    on_success  false
python-quality               lint    on_success  false

$ gitlab-ci-local shell-lint`}
</Terminal>

## Why It Behaves Like Your Pipeline

- It reads your `.gitlab-ci.yml` as it is: stages, jobs, images and variables, without any translation into another format.
- Each job gets its own container, from the image the job declares, so the versions are those of your CI and not those of your laptop.
- Your working copy is copied into each job, so you can test a change before you've even committed it.

The stage order is respected too: in the full pipeline, if a `format` job fails, the `lint` jobs don't start. Exactly the behavior you know from GitLab.

The goal may remind you of <Link to="/blog/dagger-python">Dagger</Link>, but the mechanism is different: Dagger redefines your steps as portable code, whereas `gitlab-ci-local` replays the YAML you already have. And it complements the <Link to="/blog/git-precommit">pre-commit hooks</Link>, which check one commit, while this replays the whole pipeline.

## A Tour of a Real Quality Pipeline

Here is the pipeline from the demo, one family of tools at a time. Run each job and read its message; this is where you'll recognize your own.

### Bash: shfmt, Then shellcheck

`shfmt` shows the formatting it expects as a diff. The image declares its own entrypoint, which is why the job empties it (`entrypoint: [""]`):

<Terminal>
{`$ gitlab-ci-local shell-format
shell-format $ shfmt --diff scripts/
shell-format > @@ -1,4 +1,4 @@
shell-format >  #!/usr/bin/env bash
shell-format >  target=$1
shell-format > -   echo "Saving to $target"
shell-format > +echo "Saving to $target"
shell-format >  cp -r data $target
shell-format finished in 2.8 s  FAIL 1`}
</Terminal>

### PHP: One Ready-Made Image for Everything

There's no need to create an image for your PHP tools. <Link to="/blog/php-jakzal-phpqa">`jakzal/phpqa`</Link> already contains them, and it's the only line that the job needs to declare. `php-cs-fixer` shows what it would change:

<Terminal>
{`$ gitlab-ci-local php-style
php-style $ php-cs-fixer check --rules=@PSR12 --diff src/
php-style > -class Greeter {
php-style > -  function hello( $name ) { return "Hello ".$name; }
php-style > +class Greeter
php-style > +{
php-style > +    public function hello($name)
php-style > +    {
php-style > +        return "Hello ".$name;
php-style > +    }
php-style >  }
php-style > Found 1 of 1 files that can be fixed in 0.006 seconds, 9.58 MB memory used
php-style finished in 994 ms  FAIL 8`}
</Terminal>

To apply these corrections on your side, the same image also includes `php-cs-fixer fix` and `phpcbf`. Once the style is right, `phpcs` still has a remark that no automatic fixer solves: PSR-12 expects a namespace. That's why both tools have their place in the job.

### Python: ruff, Then mypy

Here both tools run in one job, one after the other. These are the same <Link to="/blog/python-qa">Python quality tools</Link> you might already use, and each catches something the other one doesn't. `ruff` first complains about an unused import, then, once this is removed, `mypy` finds a real bug:

<Terminal>
{`$ gitlab-ci-local python-quality
python-quality $ ruff check app/
python-quality > F401 [*] \`os\` imported but unused

(remove the import, run it again)

python-quality $ mypy app/
python-quality > app/main.py:7: error: Argument 1 to "add" has incompatible type "str"; expected "int"  [arg-type]
python-quality finished in 6.01 s  FAIL 1`}
</Terminal>

### The Whole Pipeline

To see the green run shown earlier, copy the corrected files provided in the image over the project, and launch everything:

<Terminal>
{`$ cp -r /fixed/. .
$ gitlab-ci-local`}
</Terminal>

## Use It on Your Own Repository

Keep using the image you've built, and mount your repository in place of the demo:

<Terminal wrap={true}>
$ docker run --rm -it -v /var/run/docker.sock:/var/run/docker.sock -v "$PWD":/demo gcl-demo gitlab-ci-local --list
</Terminal>

It writes logs and state in a `.gitlab-ci-local/` folder, so add it to your `.gitignore`. Then, a few things to know:

| You want to | Command or file |
| --- | --- |
| Run one job | `gitlab-ci-local my-job` |
| Run a job and those it `needs` | `gitlab-ci-local --needs my-job` |
| Provide one variable | `gitlab-ci-local --variable KEY=value` |
| Keep variables in a file | `.gitlab-ci-local-variables.yml` (never commit it) |

CI/CD variables stored in your GitLab project aren't available on your machine, so use test values in that file for the jobs that need them. Runner-side features such as protected environments obviously stay on the server, and that's why quality jobs are the best place to start: they only need your code and an image.

## Conclusion

At the beginning of this article, one space in a PHP file cost you four minutes and a useless commit. With `gitlab-ci-local`, the same answer comes in a few seconds, from your real pipeline file, and there's nothing to rewrite. GitLab remains the final judge, but its verdict is rarely a surprise any more. Start with the job that most often fails on your project: it's where you'll get those minutes back first.
