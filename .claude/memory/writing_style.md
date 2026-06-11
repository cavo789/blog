---
name: writing-style
description: "Christophe's blog writing style — openings, phrases, TLDR, sections, AlertBox, Conclusion, transitions"
metadata: 
  node_type: memory
  type: project
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
---

## Opening Patterns

Articles always start with a **relatable problem, frustration, or personal anecdote** — never a dry "In this article we will…" cold open.

| Pattern | Example |
|---|---|
| Personal frustration | "Damn, it happened again: I was working on a major project..." |
| Casual self-reference | "Like you know me well enough now, you know I care a lot about performance." |
| Scene-setting | "On my machine, I've accumulated more and more hosts..." |
| Broader challenge | "Building APIs is easy, but building *compliant* APIs is an entirely different challenge." |
| Relatable mess | "We've all been there: your `~/.zshrc` starts as a 10-line file and ends up as a 1,500-line monster." |

## Recurring Phrases (signature expressions)

- **"Like you know me…"** / **"Like always"** — self-referential opener
- **"You know me very well now; I like to containerize things"** — when Docker appears
- **"Damn"** / **"Aaaargh"** — emotional exclamations (casual voice, not polished)
- **"So cool no?"** — French-influenced casual affirmation (≈ "isn't it?")
- **"For sure"** — concession ("But, for sure, that command is complex to remember")
- **"Now, every single time I…"** — closing reflection after implementing a solution
- **Em-dashes** — heavy use for dramatic pauses, digressions, reversals
- **"Let's dive into…"** / **"Let's explore…"** — section transition openers
- Callbacks to the opening: **"At the beginning of this article, I mentioned…"**

## TLDR Block

Format: **one dense paragraph, 2–4 sentences**. Never bullet points. Never hype.

Structure: problem/context → solution approach → outcome/benefit

Tone: matter-of-fact, technical, present tense. Not a teaser — a real summary.

## Section Titles

- Major sections: `## Descriptive Title` (no heavy numbering by default)
- When sequential: `## Step 1: Title` (colon, not em-dash) or `## Step 1 — Title`
- Subsections: `### More specific detail`
- Always ends with `## Conclusion`
- Evocative titles welcome: "## The Secret Sauce", "## The Problem with the Monolith"

## AlertBox Usage

Variants (urgency order): `info` < `note` < `tip` < `important` < `warning`

Title style: concise, often imperative or descriptive ("WSL2 & Windows users", "Installation Requirement", "What we demonstrated").  
Content: 2–4 sentences max. Use bullets if listing multiple points. Self-closing (`/>`) when the title alone conveys enough.

## Conclusion

**Length**: 3–6 sentences, one paragraph.  
**Formula**: restate the value → tie back to opening problem → broader lesson or call-to-action → optional aspirational close.  
**Tone**: reflective, motivational, forward-looking. Occasional poetic close ("It's a living, breathing reflection of the code.").

## Code & Terminal

- **`<Snippet>`** always has `filename=`, `source=`, `defaultOpen={false}` (true only for key examples)
- **`<Terminal>`**: includes full output, not just the command. Uses `$` prefix. `wrap={true}` for long single-line commands.
- Code blocks in prose: use `title="path/to/file"` attribute and optional line highlights `{1,5,12}`

## Transitions Between Sections

Causal language ("Because", "Since", "So"), direct imperatives ("Now, we need to…"), or rhetorical questions ("How can we avoid such situations?"). Smooth and conversational — never jarring headers-only navigation.

## Prerequisites

Lightweight. Links to prior posts rather than re-explaining. Uses `<AlertBox variant="tip" title="Installation Requirement">` for optional tools. Inline text for required tools. Assumes reader competence — no "install Node.js" type hand-holding.

**Why:** Deep internalization of this style is what makes a written post sound like Christophe's voice, not a generic tutorial.

**How to apply:** Before writing any blog post, re-read this memory. Start with a relatable hook. Use casual first-person. Keep TLDR dense and honest. Use em-dashes freely. End conclusions with a motivational reframe.
