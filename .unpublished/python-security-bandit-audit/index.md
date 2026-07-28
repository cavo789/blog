---
slug: python-security-bandit-audit
title: "Python Security Tooling in Docker: Bandit + pip-audit"
authors: [christophe, claude]
image: /img/v2/viruses.webp
mainTag: security
tags: [security, python, docker, code-quality]
date: 2026-12-31
description: "A Docker batteries-included setup bundling Bandit (static security analysis) and pip-audit (dependency vulnerability scanning) for any Python project — one command, both reports, the Python-side sibling of my PHP static analysis image."
language: en
ai_assisted: true
draft: true
---

![Python Security Tooling in Docker: Bandit + pip-audit](/img/v2/viruses.webp)

<!-- cspell:ignoreCase bandit hunter2 -->

<TLDR>
This article bundles [Bandit](https://bandit.readthedocs.io/) (static analysis for common security issues) and [pip-audit](https://github.com/pypa/pip-audit) (dependency vulnerability scanning against the PyPI advisory database) into one Docker image and one `py-security-scan` command. It's the Python-side sibling of [my PHP static analysis image](/blog/php-jakzal-phpqa) — and it fills a gap I hadn't noticed until I went looking: [Python code quality tools](/blog/python-qa) already covers `black`/`ruff`/`mypy` on this blog, but nothing that specifically asks "is there a security problem here," on the code or on its dependencies.
</TLDR>

[`php-jakzal-phpqa`](/blog/php-jakzal-phpqa) bundles static analysis tools for PHP in one Docker image, and [`python-qa`](/blog/python-qa) does the formatting/linting/typing equivalent for Python — `black`, `ruff`, `mypy`. Going back through both articles for this one, I noticed something: neither one actually asks a security question. `ruff` catches style and correctness issues; it won't flag a hardcoded password or a `subprocess` call built from unsanitized input. That's a different category of tool entirely, and until now I didn't have one for Python.

<!-- truncate -->

## Two Tools, Two Different Questions

- **[Bandit](https://bandit.readthedocs.io/)** reads your actual code (AST-based, like `ruff`) and flags security-relevant patterns: hardcoded credentials, `shell=True` in `subprocess` calls, weak hashing (`md5`/`sha1` for anything sensitive), unsafe deserialization (`pickle`, `yaml.load` without `Loader=SafeLoader`), and dozens more.
- **[pip-audit](https://github.com/pypa/pip-audit)** doesn't look at your code at all — it looks at `requirements.txt` (or the installed environment) and checks every version against the PyPI Advisory Database / OSV, the same idea as `npm audit` or Composer's `roave/security-advisories`, just for Python.

Together they cover the two places a Python project actually leaks: the code you wrote, and the code you depend on.

## The Docker Image

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={true} />

<Snippet filename="scan.sh" source="./files/scan.sh" defaultOpen={true} />

`scan.sh` deliberately runs both tools unconditionally and reports a combined status at the end — Bandit and pip-audit both exit non-zero on findings, which is correct for a CI gate but unhelpful for "just show me everything" local use if the first tool's failure stops the second from running.

<Snippet filename="compose.yaml" source="./files/compose.yaml" defaultOpen={true} />

<AlertBox variant="note" title="Read-only, deliberately">
The project volume is mounted `:ro` this time — unlike [Markitdown](/blog/markitdown) or [Docling](/blog/docling), which write converted files back, a scanner has no legitimate reason to modify your project. If it tried to, that would be the actual security issue.
</AlertBox>

## The Global Wrapper

<Snippet filename="/usr/local/bin/py-security-scan" source="./files/py-security-scan.sh" />

Make it executable: `sudo chmod +x /usr/local/bin/py-security-scan`. Run it from the root of any Python project.

## Demo

A small script with two real issues, and a `requirements.txt` pinned to old versions:

<Snippet filename="app.py" source="./files/app.py" defaultOpen={false} />
<Snippet filename="requirements.txt" source="./files/requirements.txt" defaultOpen={false} />

<Terminal source="./files/terminal_scan.txt" typewriter />

<AlertBox variant="caution" title="The advisory IDs above are illustrative">
I picked genuinely old package versions to guarantee findings for this demo, but I didn't hand-verify the exact advisory ID against the exact version shown — `pip-audit` will report whatever's actually current against the live database when you run it. Treat the format as accurate, the specific IDs as illustrative.
</AlertBox>

Bandit catches both real issues in six lines of code: a hardcoded password (`B105`) and a `subprocess` call built with an f-string and `shell=True` (`B602`) — the second one is a genuine command-injection risk if `filename` ever comes from user input. pip-audit separately flags both pinned dependencies as outdated enough to have known advisories, with the version that fixes each one.

## Key Takeaways

<StepsCard
  variant="remember"
  title="py-security-scan quick reference"
  steps={[
    { content: "**Two different concerns** — Bandit scans your code, pip-audit scans your dependencies" },
    { content: "**Read-only mount** — a scanner never needs write access to the project" },
    { content: "**Both reports always print** — the wrapper doesn't let Bandit's exit code skip pip-audit" },
    { content: "**Fills a real gap** — neither `python-qa` nor `ruff`/`mypy`/`black` ask a security question" },
    { content: "**Same pattern as `php-jakzal-phpqa`** — one image, one command, no local tool installs" }
  ]}
/>

## Conclusion

[`python-qa`](/blog/python-qa) tells me my code is well-formatted and type-correct; it was never meant to tell me whether it's *safe*, and until writing this article I hadn't actually noticed the gap. Between Bandit catching what's wrong in the code I wrote and pip-audit catching what's wrong in the code I merely depend on, this closes exactly the hole that a formatter and a type checker were never going to close — the Python-side answer to a question [`php-jakzal-phpqa`](/blog/php-jakzal-phpqa) already asks on the PHP side.
