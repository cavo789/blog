---
slug: trivy-docker-image-scan
title: "Trivy: Find the Vulnerabilities Hiding in Your Docker Images"
authors: [christophe, claude]
image: /img/v2/docker_secrets.webp
mainTag: docker
tags: [docker, security, code-quality]
date: 2026-11-07
description: "Scan any Docker image, Python dependency file or Dockerfile for known CVEs, leaked secrets and risky settings with Trivy, in one docker run and with nothing to install."
ai_assisted: true
draft: true
---

![Trivy: Find the Vulnerabilities Hiding in Your Docker Images](/img/v2/docker_secrets.webp)

<TLDR>
A base image you picked two years ago keeps collecting known vulnerabilities, and nothing warns you. Trivy reads an image, a project folder or a Dockerfile and lists the CVEs, leaked secrets and risky settings it finds, along with the version that fixes each one. It runs from its official Docker image, so one `docker run` is enough to get a report, and one extra flag turns it into a CI gate.
</TLDR>

`FROM python:3.8-slim`. You wrote that line years ago, the image builds, the tests are green, and nobody has looked at it since. So how many known vulnerabilities are you shipping today? Like me, you probably have no idea, and that is exactly what bothers me: a green build says nothing about it.

By the end of this article, you will get the answer for any image in one command and make your CI refuse the worst cases.

<!-- truncate -->

## One Command, One Answer

*Already know Trivy, or just want it in your daily workflow? [Skip to the alias](#use-it-on-your-own-projects) — this chapter only uses throwaway containers.*

If Docker is running, you can paste this right now. Trivy pulls the image from the registry itself and counts its critical vulnerabilities:

<Terminal source="./files/terminal_first.txt" />

Is that a lot? Compare it with other tags. Here is the number of **high and critical** vulnerabilities per image, measured with the same version of Trivy on November 7, 2026:

| Image | High + critical |
| --- | --- |
| `node:16` | 412 |
| `nginx:1.25` | 202 |
| `python:3.8-slim` | 116 |
| `nginx:1.29-alpine` | 55 |
| `python:3.14-slim` | 54 |
| `python:3.14-alpine` | 5 |

Same languages, very different exposure. An end-of-life tag gets no fixes, and every extra package in an image is one more thing that can appear in a security advisory. These numbers move every day as new CVEs are published, so run the command again before trusting them.

## Seeing It on a Real Project with Docker

An image is only half of the story. Your own project also has dependencies, perhaps a forgotten token, and a Dockerfile written in a hurry. This small image contains Trivy and a demo project with one problem of each kind (the token is fake):

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, then build it and open a shell:

<Terminal>
$ docker build -t trivy-demo .
$ docker run --rm -it trivy-demo
</Terminal>

First, the dependencies. Trivy reads `requirements.txt` and tells you which version solves each problem:

<Terminal source="./files/terminal_vuln.txt" />

Then the kind of mistake that ruins a Friday afternoon, a token left in the code:

<Terminal source="./files/terminal_secret.txt" />

Finally, the Dockerfile itself:

<Terminal source="./files/terminal_config.txt" />

Type `exit` and the container disappears with everything in it.

## Why You Can Trust the Report

- Trivy compares the exact package versions it finds against public advisory data, so a finding names a real CVE and you can read its details at the link it prints.
- The vulnerability database is downloaded when you scan and refreshed regularly, which means that an image untouched for months can get a worse report tomorrow.
- A finding means that a vulnerable version is present, not that your application can be attacked through it. Severity tells you where to look first; only you can judge whether your code reaches the vulnerable part.

## Use It on Your Own Projects

Add one alias to your `~/.zshrc` or `~/.bashrc`. It mounts the current folder and keeps the vulnerability database in a named volume, so that only the first scan pays for the download:

```bash title="~/.zshrc"
alias trivy='docker run --rm -v trivy-cache:/root/.cache -v "$PWD":/work -w /work aquasec/trivy:0.76.2'
```

Now, from the root of any project, check everything at once:

<Terminal>
$ trivy fs --scanners vuln,secret,misconfig .
</Terminal>

A public image needs nothing more:

<Terminal>
$ trivy image --severity HIGH,CRITICAL nginx:1.25
</Terminal>

The image you have just built exists only in your local Docker, so Trivy must reach the Docker daemon to read it:

<AlertBox variant="warning" title="The Docker socket is powerful">
Mounting `/var/run/docker.sock` gives the container control over your Docker daemon, even with `:ro`, and therefore over your machine. Do it only with an image you trust, pinned to a precise tag.
</AlertBox>

<Terminal wrap={true}>
$ docker run --rm -v /var/run/docker.sock:/var/run/docker.sock:ro -v trivy-cache:/root/.cache aquasec/trivy:0.76.2 image --severity HIGH,CRITICAL myapp:latest
</Terminal>

<AlertBox variant="tip" title="Prefer a native binary?">
Homebrew packages it for macOS and Linux with `brew install trivy`. Every command in this article then works the same way, without the alias.
</AlertBox>

## From Report to Fix

Back to the demo. Replace the three old pins with current versions and scan again, and the report is empty:

<Terminal>
{`$ printf 'flask==3.1.2\nrequests==2.32.5\npyyaml==6.0.3\n' > requirements.txt
$ trivy fs -q --scanners vuln --severity HIGH,CRITICAL . | grep requirements
│ requirements.txt │ pip  │        0        │`}
</Terminal>

Sometimes you cannot upgrade yet, or you have checked that a CVE does not affect you. List it in a `.trivyignore` file at the root of the project, one identifier per line, and commit it with a comment explaining why. Your decision is then visible in code review:

```text title=".trivyignore"
# PyYAML: we only call safe_load(). Remove once the upgrade lands.
CVE-2020-14343
```

For a base image, two flags cut the noise. `--ignore-unfixed` hides what no update can solve today, and `--severity` keeps the levels you are ready to act on.

## Make Your CI Say No

`--exit-code 1` is all it takes: Trivy returns an error when it finds something that matches your filters, and the pipeline stops. Start with `CRITICAL` only, so the gate is adopted before it becomes annoying:

```yaml title=".github/workflows/trivy.yml"
name: Image scan
on: [push]

jobs:
  trivy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - run: docker build -t myapp:ci .
      - name: Refuse critical vulnerabilities
        run: |
          docker run --rm \
            -v /var/run/docker.sock:/var/run/docker.sock:ro \
            aquasec/trivy:0.76.2 image \
            --severity CRITICAL --ignore-unfixed --exit-code 1 myapp:ci
```

The same `docker run` works unchanged in GitLab CI or any other runner that can reach a Docker daemon. If you would rather catch a token before it even leaves your machine, the same scan fits in a <Link to="/blog/git-precommit">pre-commit hook</Link>.

<AlertBox variant="important" title="Pin your security tools too">
In March 2026, attackers published a malicious Trivy `0.69.4` and rewrote the tags of `aquasecurity/trivy-action` ([CVE-2026-33634](https://github.com/aquasecurity/trivy/security/advisories/GHSA-69fq-xp46-6x23)). A scanner sees your code and your CI secrets, so use a precise, reviewed version rather than `latest`, and pin third-party GitHub Actions to a full commit SHA.
</AlertBox>

## Conclusion

At the beginning of this article, `FROM python:3.8-slim` was just a line nobody looked at. It is now a number you can measure in one command, compare with another tag, and keep under control with a CI gate. Trivy tells you what is vulnerable, while <Link to="/blog/docker-dive">Dive shows you what is wasting space</Link>; run both on your images, because a package you remove saves space and shrinks the report. Pick your oldest Dockerfile, scan it today, and see what comes back. And since a clean image is only part of the job, <Link to="/blog/docker-prod-devcontainer">keeping production and development images properly separated</Link> is a good next step, so your dev tools never reach production.
