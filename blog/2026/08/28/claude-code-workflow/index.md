---
slug: claude-code-workflow
title: "Claude Code - From Slash Commands to a Layered Workflow"
description: "How this blog's .claude/ folder grew from a handful of slash commands into commands, hooks, skills, agents and rules working together — a practical learning path, including where a deterministic script beats asking the AI."
authors: [christophe]
image: /img/v2/vibe_coding_claude.webp
mainTag: ai
tags: [ai]
date: 2026-08-28
ai_assisted: true
language: en
---

![Claude Code - From Slash Commands to a Layered Workflow](/img/v2/vibe_coding_claude.webp)

<!-- cspell:ignore shellcheck shfmt nounset errexit pipefail mypy -->

<TLDR>
This blog's `.claude/` folder grew, over several months, from a handful of slash commands into a
five-layer system: commands you type, hooks that block or auto-approve deterministically, skills
that encode what "good" means, agents that check it in an isolated context, and rules that enforce
the short version automatically. This article walks through the order it was actually built in,
what each layer is for, a real example of each, and why a plain Bash script — with zero AI involved
— is sometimes the best possible building block.
</TLDR>

Like every beginner, my first Claude Code sessions with this blog started the same way, day after
day: I re-explained, in the chat, what a good Bash script looks like here, what a Dockerfile must
never do, or how to number a new TODO file without colliding with an existing one. Claude did the
work, but I was the one carrying the rulebook — typed out again, session after session.

My `.claude/` folder looks nothing like it did back then. Today it holds 15 slash commands, 4
read-only reviewer agents, 10 skills, 3 always-on rules, and a few plain Bash scripts that never
touch the AI at all. None of it arrived at once — each layer showed up to solve a problem the
previous one couldn't.

<!-- truncate -->

## What Five Layers Look Like In Practice

Five ingredients make this possible, and each gets its own section further down — this is just the
short version so the demo below doesn't read like alphabet soup: a **command** is what you type
yourself (`/something`); a **skill** is a checklist Claude reads on its own, without being asked; an
**agent** runs that checklist in its own separate, restricted window, away from your main
conversation; a **rule** loads itself automatically the moment a matching file is open; and a
**hook** can block an action outright, no negotiation possible. Keep those five words in mind — here's
what a critical read of a blog post looks like today, once all five are in place, before it ever gets
published:

> */reader_review git-precommit*

Claude doesn't need to be told, again, what "good" means for one of this blog's articles — the
`reader-first-docs` skill already spells it out, and `/reader_review` applies it directly: what
share of the article sits between `<!-- truncate -->` and the first real proof — actual command
output, not just an install step?

> `git-precommit` — real output ten lines after `<!-- truncate -->`, about 7% of the article's
> body. Comfortably under the 15% green threshold, nothing installed or explained first.
> Verdict: OK, nothing to restructure.

That checklist — front-load the value, mark deep-dives as optional, keep installation out of the
first half — never had to be retyped, months after it was first written down.

And one detail worth noting before anything else: not every command in this workflow relies on
Claude at all. `/todo-add`, the command that files a new backlog entry, needs the next free ID
first — a pure counting problem, so instead of asking the model to scan `.todos/` and count, it
calls a plain script:

<Terminal source="./files/terminal_todo_next_id.txt" />

<AlertBox variant="tip" title="Best practice: a script beats a prompt">
Whenever a step is pure logic — count files, increment an ID, parse a date, check a lock — write it
as a plain script and have the command call it. It is deterministic (the same input always gives
the same output), it costs zero tokens, and it can be tested on its own, without a model in the
loop. Keep the AI for the steps that actually need judgment.
</AlertBox>

## Why a Layered Setup Works

- **Only one layer is something you type.** Slash commands are the sole self-discoverable piece —
  autocomplete finds them. Skills, rules, agents and hooks are invisible until something triggers
  them; they shape *how* Claude works without adding to what you have to remember to invoke.
- **Each layer answers a different question.** A skill decides *what* good looks like. An agent
  decides *who* checks it, and in what isolation. A rule decides *when* the short version applies
  automatically. A hook decides *what is simply not allowed* — no judgment call, no way to argue
  the model out of it.
- **Read-only agents keep review noise out of the conversation that matters.** That's a token
  saving that comes from architecture, not from prompting discipline — a nice complement to the
  session-management tricks in <Link to="/blog/claude-ia-spare-tokens">an earlier round of
  token-saving tips</Link>, which focused on `/clear`, `/compact`, and `CLAUDE.md` size.
- **A rule is deliberately not a full explanation.** It's a compressed DO/DON'T extract of its
  sibling skill, loaded only when a matching file is actually open — full rationale stays one click
  away, not in every context window.
- **The cheapest layer of all doesn't call the model.** A plain script, as above, is the floor
  everything else builds on.

## Start Here: Your First Slash Command

Slash commands were the easy entry point, and they still are — a Markdown file with a short
frontmatter header, discovered automatically the moment it lands in `.claude/commands/`. For instance, simply create the file `.claude/commands/pr-description.md` in your project with this content:

<Snippet filename=".claude/commands/pr-description.md" source="./files/pr-description.txt" />

Now type `/pr-description` in a Claude Code session, and that prompt runs with the current diff
already in view — nothing to remember, nothing to re-explain. Two details in the file above matter
more than they look:

- **`argument-hint`** is what autocomplete shows before you commit to typing the command — cheap
  documentation for future-you.
- **`allowed-tools`** restricts the blast radius before the command ever runs. This one can read
  Git history and files, and nothing else — it cannot edit anything, even by mistake.

Three real commands from this blog's own `.claude/commands/` show the same shape at different
sizes. `/bash-review` is barely more than a pointer to the agent covered later in this article:

<Snippet filename=".claude/commands/bash-review.md" source=".claude/commands/bash-review.md" />

`/links` maintains this blog's own internal-linking convention — 2 to 4 inline links per article,
plus a reciprocal link in the older post it points to:

<Snippet filename=".claude/commands/links.md" source=".claude/commands/links.md" defaultOpen={false} />

And `/todo-add` is the command standing behind the `todo_next_id.sh` script from earlier — its
`allowed-tools` line names the script explicitly, so the command can call it but nothing else:

<Snippet filename=".claude/commands/todo-add.md" source=".claude/commands/todo-add.md" defaultOpen={false} />

## Draw a Hard Line: Hooks

A slash command's prompt is still an instruction Claude reads and can, in a long enough session,
quietly drift from — the same way a person forgets an instruction given an hour and many messages
ago. A **hook** works differently: it's a shell command that the Claude Code harness (the program
running the session, separate from Claude itself) executes automatically at a fixed point — before
Claude reads a file or runs a command (what Claude Code calls a *tool call*), right after one, or
when the session ends — and its exit code decides what happens next. Claude has no say in that
decision. It's the same idea as a Git
`pre-commit` hook in <Link to="/blog/git-precommit">an earlier article</Link>, one layer down: that
one intercepts a commit, this one intercepts a single tool call.

This blog's own `.claude/settings.json` doesn't have any yet — it only carries a `permissions.allow`
list. Hooks earned their place on a different, Python project of mine that runs `ruff` and `pytest`
constantly during a session. Simplified to the bare mechanics:

<Snippet
  filename=".claude/settings.json (illustrative — Python/Bash project)"
  source="./files/settings-hooks-example.json"
/>

Four ideas worth carrying over, whatever language a project is in:

- **`permissions.deny`** blocks `Read` on secrets outright — a hook doesn't even get involved,
  the tool call never happens.
- **`PreToolUse`** here auto-approves `pytest` specifically, so a long, careful session doesn't
  stop for a confirmation prompt every single time the test suite runs.
- **`PostToolUse`** reacts the instant a Python file is written or edited: it runs `ruff check` on
  that one file, right then, instead of waiting for the reader — or a CI job — to notice later.
- **`Stop`** fires once, when Claude considers a task finished and is about to end its turn — the
  last checkpoint, not a per-edit one. Here it runs the full test suite one more time; if `pytest`
  fails, the hook's non-zero exit tells Claude the turn isn't actually over, and why. It's the only
  hook that can override "I'm done."

<AlertBox variant="note" title="A hook is a floor, not a substitute">
A hook only fires on the tool-call shape it's matched against — it doesn't understand intent the
way a skill-following model does. Use it for the handful of rules that must never be negotiable
(secrets, a required lint or test run); leave everything that needs judgment to a skill.
</AlertBox>

## Encode Your Standards: Skills, Checked by Agents

A **skill** is where "good Bash" or "good Dockerfile" actually gets written down — once, as the
single source of truth, instead of retyped into chat every session. Here's this blog's real
`bash-best-practices` skill in full — it opens with a `description` field and a
`disable-model-invocation` flag, then the actual conventions:

<Snippet
  filename=".claude/skills/bash-best-practices/SKILL.md"
  source=".claude/skills/bash-best-practices/SKILL.md"
  defaultOpen={false}
/>

The `description` field does double duty: it's what a human reads to know what the skill covers,
and it's what Claude matches against the current task to decide whether to load it *without being
asked*. One flag controls that: `disable-model-invocation: false` keeps auto-loading switched on;
set it to `true` and the skill only loads when a command explicitly calls it.

A skill alone is just a stricter memory. What turned it into an actual audit was a matching
**agent** — a subagent with a name, a fixed, narrow toolset, and one job:

<Snippet
  filename=".claude/agents/bash-best-practices-reviewer.md"
  source=".claude/agents/bash-best-practices-reviewer.md"
  defaultOpen={false}
/>

Two design choices carry more weight than the file's length suggests:

- **`tools: Read, Grep, Glob, Bash`** — no `Edit`, no `Write`. This agent physically cannot change a
  file, which means a review can never accidentally turn into a rewrite, and a hostile string
  buried in a reviewed file can't talk it into one either.
- **An agent is reachable only through a matching slash command** — `/bash-review` is the sole
  door in. There's no autocomplete entry for the agent itself; discoverability lives entirely at
  the command layer, review logic lives entirely at the agent layer.

The same pattern repeats for `python-best-practices` (paired with `python-best-practices-reviewer`,
most valuable on the parts <Link to="/blog/python-qa">`ruff` and `mypy` don't already catch</Link>)
and for `dockerfile-best-practices`. One skill, one narrow agent, one command — a shape that scales
to any language a project adds next.

### A Concrete Case: This Blog's Own Time-to-Value Check

Every pairing so far reviews code. On this blog, before I publish an article, I run
`/reader_review` — it loads the `reader-first-docs` skill and checks a post's structure. One of the
criteria it measures is Time-to-Value: within roughly the first 30 seconds of reading, a reader
should already understand what the article covers and whether it's worth their time to keep going.
A *high* TTV score means the opposite happened — the reader had to wade through too much text
before reaching that "oh, *this* is what the article is about" moment. Here's the skill in full:

<Snippet
  filename=".claude/skills/reader-first-docs/SKILL.md"
  source=".claude/skills/reader-first-docs/SKILL.md"
  defaultOpen={false}
/>

The core metric, Time-to-Value, is mechanical, not a feeling: find `T`, the line of
`<!-- truncate -->`; find the first real *proof* after it — actual command output, never just an
install step; compute `TTV = (proof_line − T) / BODY`, where `BODY` is everything past `T`. That's
exactly the arithmetic behind the opening demo: on <Link to="/blog/git-precommit">the pre-commit
article</Link>, real output lands ten lines after `<!-- truncate -->`, `BODY` is 148 lines, so
`TTV ≈ 7%` — comfortably under the skill's own 15% green threshold.

Three tiers turn that percentage into a verdict: 🟢 `OK` under 15%, 🟠 `MINOR` under 30% (a journal
note, deliberately never a TODO — a 40-article sweep would otherwise bury real findings under
one-liners for every post with a merely flat ending), 🔴 `RESTRUCTURE` at 30% or beyond, which is
the only tier that files a TODO.

<AlertBox variant="note" title="Not every skill pairs with an agent">
`/reader_review` doesn't dispatch to an isolated agent the way `/bash-review` does — it needs
`Write` access to log progress across a whole batch to `.todos/0000-reader-review-journal.md`, so
it runs inline instead, same skill, no isolation layer. A `reader-first-docs-reviewer` agent does
exist in this project, but it audits a different scope (long-form docs like a README, not blog
posts) and isn't wired to any command yet. The shape from the previous section is common, not
universal.
</AlertBox>

## Always-On, No Invocation Needed: Rules

Skills and agents both wait to be triggered — by a matching task, or by typing a command. A **rule**
doesn't wait for anything: it loads the instant a matching file is opened or edited, glob-matched
against `paths`, no invocation at all.

Here's the real file — its first line already points back to where the reasoning actually lives:

<Snippet filename=".claude/rules/bash.md" source=".claude/rules/bash.md" />

A rule doesn't repeat the skill's reasoning, it extracts the bare DO/DON'T pairs a model needs
while it's mid-edit, and points back for the *why*. The same shape covers Markdown, keeping bold as
`**asterisks**` never `__underscores__` the way
<Link to="/blog/markdown-lint">a linter left disabled on purpose</Link> would otherwise silently
allow either.

I wrote rules last and half-wondered afterward whether they should have come first — a rule looks
like the more "basic" layer. Mechanically, it isn't: a rule is *defined* as a short extract of its
sibling skill, so the skill has to exist before there's anything to extract. Writing skills and
agents before rules, even by accident, turned out to be the order that actually works.

## Wiring It All Together

Once a few languages had the same skill → agent → command shape, the map became the documentation:

| Command          | Agent                                | Skill                       |
| ---------------- | ------------------------------------ | --------------------------- |
| `/bash-review`   | `bash-best-practices-reviewer`       | `bash-best-practices`       |
| `/python-review` | `python-best-practices-reviewer`     | `python-best-practices`     |
| `/docker-review` | `dockerfile-best-practices-reviewer` | `dockerfile-best-practices` |

Each row is independent and addable on its own — a fourth row for a new language costs one skill
file, one agent file, and one command file, none of which touch the other three.

## Under the Hood (skip this if you just want to use it)

### Why the reviewer agents can't edit

`Read, Grep, Glob, Bash` and nothing else isn't caution for its own sake. A review agent's whole
job is to read files it didn't write and judge them — the moment it can also `Edit`, "detection
only" stops being a guarantee enforced by the tool list and becomes a guideline the prompt merely
asks for. Keeping the two apart means a reviewer's report can be trusted to be exactly that: a
report, not a diff already applied without a second look.

### The zero-token script, one more time

`todo_next_id.sh` earns a second look because it generalizes past TODO numbering:

<Snippet filename=".claude/scripts/todo_next_id.sh" source=".claude/scripts/todo_next_id.sh" />

Two lines of `find`/`sed`/`sort` answer "what's the next free ID" with total certainty — no
hallucination risk, because there's no model in the path at all. Its sibling `todo_lock.sh` does the
same for a harder problem, concurrency: two Claude Code sessions racing to grab the same TODO number
resolve it with `mkdir` (atomic — it fails if the directory already exists), not by asking either
session to "check first." Any time a step reduces to *count, parse, lock, hash, diff* — reach for a
script before reaching for a prompt.

## Conclusion

The order that actually worked here was commands, then hooks, then skills paired with agents, then
rules — and with hindsight, that's not an accident to fix: a rule is mechanically an extract of a
skill, so skills-before-rules was the only order that could have worked. What changed isn't that
Claude got smarter session to session — it's that the rulebook stopped living in the chat and moved
into the layer built to hold it: a hard line in a hook, a standard in a skill, an isolated check in
an agent, a reflex in a rule, and, wherever the task was pure logic, a script that never asked the
model at all.

Once a setup like this exists, the next question is what it costs to run — which is exactly where
<Link to="/blog/claude-ia-spare-tokens">the token-saving tips from an earlier article</Link> pick
up.
