---
slug: typos-languagetool-spellcheck
title: "Catch Spelling Mistakes Before You Commit, in Code and in Prose"
authors: [christophe, claude]
image: /img/v2/docusaurus_typos.webp
mainTag: code-quality
tags: [code-quality, docker, git, markdown]
date: 2026-11-07
description: "typos finds misspellings in your code and docs in milliseconds and fixes them with one flag. LanguageTool handles the grammar. Run both from Docker, in a pre-commit hook or in CI."
ai_assisted: true
draft: true
---

![Catch Spelling Mistakes Before You Commit, in Code and in Prose](/img/v2/docusaurus_typos.webp)

<TLDR>
Spelling mistakes end up in function names, documentation and even public APIs, and classic spell checkers drown you in false alarms on code. `typos` is built for source code: it only reports known misspellings, and can fix them with one flag. LanguageTool adds what it can't see, the grammar of your prose. Both run from Docker and fit in a pre-commit hook or CI job.
</TLDR>

You've reviewed a pull request three times, the tests pass, it's merged, and then someone notices it: `recieve_config()`. And it's already called from eleven places. Damn. Nobody writes such a thing on purpose, and no linter I use cares about it.

By the end of this article, this kind of mistake will be caught, and even corrected, before it reaches a commit.

<!-- truncate -->

## Seeing It in Action with Docker

*Already use typos? [Skip to the daily setup](#use-it-on-your-own-projects) — this chapter is only a throwaway container to try it risk-free.*

A small Python file and a README, with some very ordinary mistakes. One command:

<Terminal>
{`$ typos --format brief
./deploy.py:1:5: error: \`recieve\` should be \`receive\`
./deploy.py:2:17: error: \`configuraton\` should be \`configuration\`
./deploy.py:3:5: error: \`enviroment\` should be \`environment\`
./deploy.py:4:12: error: \`enviroment\` should be \`environment\`
./README.md:3:26: error: \`acheive\` should be \`achieve\`
./README.md:3:36: error: \`succesful\` should be \`successful\`
./README.md:4:5: error: \`occured\` should be \`occurred\``}
</Terminal>

Note the first line: it found the mistake *inside* the identifier `recieve_config`. A second command repairs everything:

<Terminal>
{`$ typos -w
$ cat deploy.py
def receive_config(path):
    """Load the configuration file."""
    environment = open(path).read()
    return environment`}
</Terminal>

To try it, this image contains `typos` and these two files:

<Snippet filename="Dockerfile" source="./files/Dockerfile" defaultOpen={false} />

Save it in an empty folder, build it, and open a shell:

<Terminal>
$ docker build -t typos-demo .
$ docker run --rm -it typos-demo
</Terminal>

Then type the two commands above.

## Why It Stays Quiet on Code

- `typos` compares your words with a list of **known misspellings**, not with a dictionary. A variable called `kubectl_cfg` isn't a mistake for it, so there's almost nothing to silence.
- It splits identifiers such as `snake_case` and `camelCase` into words, which is how it can see inside `recieve_config`.
- It's fast enough to run on each commit, on a whole repository, without you noticing.

The trade-off is simple: a misspelling that's not on its list goes through, and a correct word used wrongly is invisible to it. That's the job of the second tool.

## Use It on Your Own Projects

The image you've just built does the job on any folder. Mount your project over the demo folder:

<Terminal wrap={true}>
$ docker run --rm -u "$(id -u):$(id -g)" -v "$PWD":/demo typos-demo typos
</Terminal>

The exit code is `2` when it finds something and `0` otherwise. With `-u`, files repaired by `typos -w` keep their owner.

Some project words will be wrong for `typos`, such as a brand name. Declare them once in a `_typos.toml` at the root, mapping the word to itself:

```toml title="_typos.toml"
[default.extend-words]
recieve = "recieve" # Yes, our legacy API really spells it this way

[files]
extend-exclude = ["vendor/", "*.min.js"]
```

To run it before each commit, use a Git hook:

```bash title=".git/hooks/pre-commit"
#!/usr/bin/env bash
docker run --rm -v "$PWD":/demo typos-demo typos
```

Make it executable with `chmod +x .git/hooks/pre-commit`. It takes its place beside the other checks of a <Link to="/blog/git-precommit">pre-commit setup</Link>, and pairs well with <Link to="/blog/markdown-lint">Markdown linting</Link>, which looks at the form of your documents and not at the words.

## Add the Grammar with LanguageTool

Here is a sentence whose worst problems are not misspellings at all:

> Their is two container running, and the logs was writen to the the disk.

[LanguageTool](https://languagetool.org/) understands sentences. The community image `erikvl87/languagetool` runs a complete server on your machine, so your text never leaves it. Start it with this `compose.yaml`:

<Snippet filename="compose.yaml" source="./files/compose.yaml" />

<Terminal>
$ docker compose up -d
</Terminal>

The image is about 750 MB, and the server needs a few seconds to start. Then ask it what it thinks, using <Link to="/blog/linux-jq">`jq`</Link> to keep the answer readable:

<Terminal wrap={true}>
{`$ curl -s http://localhost:8010/v2/check -d language=en-US --data-urlencode "text=Their is two container running, and the logs was writen to the the disk." | jq -r '.matches[] | "\\(.context.text[.context.offset:.context.offset+.context.length]) -> \\(.replacements[0].value): \\(.message)"'
Their -> There: Did you mean “there”?
writen -> written: Possible spelling mistake found.
the the -> the: Possible typo: you repeated a word.`}
</Terminal>

It also speaks French, for those of us writing in two languages. Pass `language=fr`:

<Terminal>
{`Ils a -> Il a: Vérifiez l’accord entre le pronom « Ils » et le verbe « a ».
les conteneur -> le conteneur: Le déterminant s’accorde avec le nom « conteneur ».`}
</Terminal>

It's not perfect: in the English sentence above, "is two container" went through unreported. Treat it as a careful proofreader that you consult, and keep it out of your blocking checks. If you'd rather have it as you type, the <Link to="/blog/running-docusaurus-with-docker">Docusaurus devcontainer</Link> connects this same image to VS Code.

## Which One Where

| | `typos` | LanguageTool |
| --- | --- | --- |
| Reads | Code and prose | Prose |
| Finds | Known misspellings | Spelling, grammar, style |
| Cost | Almost nothing | A server and about 1 GB of RAM |
| Best place | Pre-commit and CI, blocking | While writing, as advice |

For CI, the blocking part is a single step, whichever platform you use. In GitHub Actions, the project's own action does it. It is pinned to a commit SHA rather than a tag, because a tag can be moved:

```yaml title=".github/workflows/typos.yml"
name: Spelling
on: [push, pull_request]

jobs:
  typos:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5
      - uses: crate-ci/typos@4c8b7f51ca60df14e3c5ca82770dfbbe6c3dae85 # v1.52.0
```

## Conclusion

At the beginning of this article, `recieve_config()` was already in eleven places. With `typos` in your hook, it wouldn't have got past the first commit, and fixing it would have cost one flag. Start there, because it's the cheap and quiet part, then start LanguageTool when you write something that people will really read. Run `typos` once on your biggest repository today: I'd be surprised if it came back empty.
