---
name: blog-post-structure
description: >
  Reader-first structure for every new blog post or .unpublished draft. Load BEFORE writing
  the first line of an article, and when drafting, outlining, restructuring or reordering a
  post under blog/ or .unpublished/. Enforces: show the result before asking for any
  installation, keep implementation code out of the first half, mark deep-dives as optional.
  Triggers on: write an article, new blog post, new draft, outline a post, restructure an
  article, rédiger un article, nouveau post, nouvel article, restructurer un article.
---

# Reader-first article structure

A reader arrives with **one minute**. They decide to stay or leave before they have scrolled
twice. The article must prove its value in that minute — not after the prerequisites, not
after the source code, not at 73% of the page.

This skill defines the **canonical section order** for this blog. It is the single source of
truth: `/reader_review` audits against it, `AGENTS.md` points at it. Do not restate the
structure elsewhere — link here.

It does **not** replace the writing conventions in `AGENTS.md` → *Blog Content Guidelines*
(American English, `YYYY/MM/DD/slug/index.md`, co-located `./files/`, `<Snippet>` instead of
inline code blocks, 2 to 4 inline `<Link>` internal links, `<TLDR>` after the banner). Those
still apply. This is about **order**, not about voice.

## The stop rule

**If movement 2 is not written, movement 4 must not be written.**

The single most common failure on this blog is writing the installation section first,
because it is the easiest to write. Write the payoff first, even as a placeholder, or the
article will end up install-first again.

## The seven movements

### 1. Hook — the pain

One or two paragraphs, first person, a real frustration. Already the blog's habit, do not
change it — see the *Writing Style* memory (never "In this article we will…").

End it with the promise in **one sentence**: what the reader will be able to do.

Then `<!-- truncate -->`.

**Optional, right after `<!-- truncate -->`:** `<QuickJump links={[...]} />` when the article has
two or more distinct destinations a reader might want without reading linearly — most often an
article built around `<ProjectSetup>`, where "give me the files" and "show me it working" are
different intents. It is scaffolding, not proof: `reader-first-docs` moves `T` past it before
measuring TTV, so it never counts as the result and never delays it. Skip it on a short,
single-thread article — it shouldn't compete with the `<TLDR>` for the reader's first glance.

### 2. The result — before any effort is asked

The command, and its **real output**. Nothing has been installed yet. Nothing has been
explained yet.

**Target: visible in the first screen after `<!-- truncate -->` — roughly 40 lines, 250
words.** That is the whole point of this skill.

Typical shape, 15 to 25 lines:

```markdown
## What `<tool>` Does For You

<One or two sentences: the command, and what comes back.>

<Terminal source="./files/terminal_demo.txt" typewriter />

<One sentence naming what just happened, and the transition to "how".>
```

Pick the visual by climbing **down** this ladder — take the first rung that tells the story,
never reach for the fanciest one:

| Rung | Use | How |
| --- | --- | --- |
| 1. **Real terminal output** | Default. Almost always already available. | `<Terminal source="./files/…" />` |
| 2. **Words and arrows** | A flow with several actors or files | A `plaintext` fenced block + a "file → role" table. See the "The Big Picture" section of `blog/2026/07/27/reactions/index.md` |
| 3. **A screenshot** | There is a UI to see | `![alt](./images/….webp)` — **if it shows a web page (a web UI, an admin panel, a dashboard, an API response viewed in a browser), wrap it in `<BrowserWindow url="…">`** with the exact address named in the prose. Never for desktop apps (VS Code, Docker Desktop, a terminal, Excel, a file explorer) — those stay plain. Full rule: `AGENTS.md` → *Blog Content Guidelines*. |
| 4. **Mermaid** | Genuinely non-linear: branches, loops, several parties | ` ```mermaid ` fence (the theme is enabled site-wide) |

A linear pipeline does **not** need Mermaid. A terminal output beats every diagram, because
it is proof rather than a drawing.

### 3. Why it works — the big ideas, no code

Three to five bullets. **Zero code, zero file path.** This answers *"is this credible?"*, not
*"how is it implemented?"*. The reader is deciding whether to spend twenty minutes on the
install; give them the shape of the thing, not its guts.

Anything that needs a code block belongs in movement 6.

### 4. Installation — the shortest path to something that runs

Only now. Prerequisites go **here**, not at the top of the article.

- Required tools: `<Prerequisite name= install= check= />`, compact.
- Optional tools: inside `<Details label="…">` or an `<AlertBox variant="tip">`, so the
  reader can see at a glance what they may skip.
- **Creating several complete files in a folder → `<ProjectSetup folderName="…">`** wrapping
  `<Snippet filename= source=>` children. Example: `blog/2025/11/11/running-docusaurus-using-docker/index.md`.
- **Injecting lines into an existing file** (`~/.zshrc`, `~/.gitconfig`, `compose.yaml`) →
  a plain fenced code block with `title="~/.zshrc"`. `ProjectSetup` cannot express this — it
  creates files, it does not patch them.
- Long implementation files stay collapsed: `<Snippet … defaultOpen={false} />`. The reader
  needs them present, not unfolded in their face.
- **A value the reader will change** (a host port, a container name, a version) **repeated
  across two or more commands** → declare it once with `<Vars port="8080" name="mysite" />`
  right before the first command that uses it, then mark every occurrence with
  `%%name=default%%` instead of typing the literal value (e.g. `-p %%port=8080%%:80`). Catch
  this while writing movement 4/5, not after: retrofitting a finished article into markers is
  much more work than writing them the first time. See `src/components/Vars/readme.md` for the
  full contract, `blog/2024/08/17/docker-localhost-ssl/index.md` for a worked example.

### 5. More demos — proof it works on *their* machine

The toy example of movement 2 proved the idea. This proves the range: a real file, a second
language, the second run, the edge case. Whatever is the strongest argument goes first.

### 6. Under the hood — explicitly optional

Design decisions, gotchas, the arcane bits, the "why this and not that". Everything that
answers *"how does it work internally?"*.

**Mark the section as skippable in its own title**, so a reader knows they have already got
what they came for:

```markdown
## Under the Hood (skip this if you just want to use it)
```

This is where a loader's alphabetical ordering, a prompt's exact wording, or a `docker run`
flag belongs — never before movement 5.

### 7. The landing

`## Conclusion` (blog convention, mandatory): what was learned, tied back to the opening
frustration, plus one link to where the reader goes next.

A `<StepsCard variant="remember">` block **only when it is a genuine quick reference** — paths,
flags, environment variables, things a returning reader looks up. A card whose bullets restate
the narrative in shorter words is the single most common piece of dead weight on this blog:
cut it and let the Conclusion do the landing.

## Say it once

Movements 2, 3, 6 and 7 are the four places where the same fact tends to get told four times:
once as a promise, once as a claim, once as an explanation, once as a summary. That is how an
article ends up 20% longer than it needs to be without gaining a single reader.

The rule: **each paragraph must carry at least one fact stated nowhere else in the article.**
Not a new angle on a known fact — a new fact. If it does not, cut it, do not reword it.

How each movement earns its keep on the same idea:

| Movement | What it may say about idea X | What it must not do |
| --- | --- | --- |
| 2. The result | *show* X happening | explain how X works |
| 3. Why it works | the one non-obvious mechanism behind X | repeat the section title in a full sentence |
| 5. Demos | X on a harder case | re-state the mechanism |
| 6. Under the hood | why X was built that way, the trade-off, the failure mode | re-list what X does |
| 7. Landing | what to remember *when you come back later* | recap the article |

Concrete traps, all observed in real posts here:

- **A bullet list that repeats the headings above it.** "It detects the language. It runs in
  Docker." — those are titles, not information. A bullet earns its place by carrying a clause
  the reader could not have guessed.
- **An intro sentence restating its own heading.** `## Under the Hood (skip this…)` followed by
  "Everything below is the why, you can skip it" — say it once, in the heading.
- **A step-by-step list inside the section that then explains each step in depth.** The list
  becomes a table of contents for the three subsections under it. Keep the list only for the
  steps that get no subsection.
- **Two `AlertBox` carrying the same warning** in different sections — a frequent side effect of
  moving sections around. After any restructuring, grep for the warning's key phrase.
- **A takeaways card mirroring the body** one-for-one.

The cheapest way to check: pick the 4 or 5 core claims of the article, grep each one, and count
where it lands. Above three occurrences for the same fact, something is dead weight.

## Optional: a zero-install sandbox

Between movements 2 and 4, when — and only when — it genuinely works: a `Dockerfile` plus a
copy-pasteable `docker run` so the reader can try the thing and close the container with a
clean machine.

Be honest about the limits, or skip it. If the tool needs a reachable service (a local LLM, a
database, a Docker socket), a sandbox that silently fails is worse than no sandbox. Say what
the container cannot do, or do not offer one.

## Anti-patterns

Each of these was measured on a real article of this blog:

| Anti-pattern | Why it kills the read |
| --- | --- |
| `## Prerequisites` / `apt install` before any proof | You ask for effort before showing a reason. The reader has nothing invested yet. |
| Dumping the implementation source before the demo | "Why am I reading 300 lines of zsh?" — the reader cannot judge the code because they do not yet know what it does. |
| Explaining a file before showing its effect | Explanation only lands once curiosity exists. Show, then explain. |
| Internals ("here is why the loader sorts alphabetically") in the first half | Interesting to the author, noise to the newcomer. Movement 6. |
| A demo hidden at 70% of the article | The payoff exists but nobody reaches it — the worst failure, because the material is already written and merely misplaced. |
| Ending on the last technical detail | No recap, no next step. Movement 7 is not optional. |
| The same fact told in the TLDR, a bullet, a section and a takeaways card | Four occurrences, one piece of information. See *Say it once*. |

## Self-check before saving

1. Is there a **real output** — terminal, screenshot, diagram — within the first 40 lines
   after `<!-- truncate -->`?
2. Does any `apt install` / `<Prerequisite>` appear **before** it? (Must be no.)
3. Does any implementation `<Snippet>` appear **before** it? (Must be no.)
4. Are the deep-dive sections marked as skippable?
5. Do the last three paragraphs recap and point somewhere next?
6. Are the 2 to 4 internal `<Link>` still inline in the prose (`yarn links:check <path>`)?
7. Does the same port/name/version repeat across 2+ commands, hardcoded instead of a `<Vars>`
   marker? (See movement 4.)
8. Does any screenshot show a web page (browser, web UI, dashboard) **without** being wrapped
   in `<BrowserWindow url="…">`? (Must be no — see movement 2, rung 3.)

`/reader_review <path>` runs the same checks and puts a number on question 1.
