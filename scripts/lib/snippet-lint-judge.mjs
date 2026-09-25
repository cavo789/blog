/**
 * Pass 2 of the snippet lint (TODO 0137): the obsolescence judge.
 *
 * Pass 1 answers "is this file syntactically valid?". It cannot answer the question that
 * actually hurts a reader, because the answer is *yes* in every case that matters: a
 * `docker-compose up` invocation, an `apt-key add`, a `MAINTAINER` line and a `:latest` tag in
 * an article that claims to pin are all perfectly valid files. They are simply out of date, and
 * they are what the reader copy-pastes into a shell that no longer has the command.
 *
 * No deterministic linter reports that class, which is why this pass is a model. `code-quality`
 * through Ollama directly — there is no vector search here, so AnythingLLM has nothing to add.
 *
 * ## A verdict is a proposal, never a failure
 *
 * Everything this module returns carries `severity: "suggestion"`. Pass 2 never contributes to
 * the exit code and is never wired into `--ci`. The reason is measured, not cautious: TODO 0132's
 * first pass-1 run produced 139 diagnostics of which **133 were artefacts of the file being an
 * extract**, and the triage cost more than writing the linter. A model asked the same question
 * over the same corpus will do at least as badly unless the prompt carries the context the file
 * itself cannot.
 *
 * ## What the prompt has to buy
 *
 * The system prompt below spends most of its words on what NOT to report. That is the whole
 * design: these files are article extracts, deliberately incomplete — 81 carry a `.partN`
 * suffix, 152 carry placeholders, dozens are shell functions meant to be sourced. An
 * undefined variable, a missing import, an absent shebang are all *correct* here, and a judge
 * that reports them reproduces the 133-false-positive run in a form nobody can grep away.
 *
 * The output is grammar-constrained by `JUDGE_SCHEMA` rather than merely requested in prose,
 * the same mechanism `generate-questions.mjs` relies on: the model cannot return malformed JSON,
 * so there is no repair path to maintain.
 */

// Same endpoint and override as generate-questions.mjs: 172.17.0.1 is the Docker bridge, i.e.
// the host running Ollama as seen from inside the devcontainer.
export const OLLAMA_URL = process.env.OLLAMA_URL || "http://172.17.0.1:11434";

// `code-quality` (qwen3.8:27b), the model the 2026-09-23 blind bench picked for this repo's
// other Ollama consumer. Thinking stays ON here, unlike the ELI5 backend: this pass asks for a
// judgement about versions and deprecations, not a description, and that is where the bench
// found thinking actually pays.
//
// Measured on the 20-file calibration sample (TODO 0137): median 9 s per snippet, 4.4 s to 32 s,
// extrapolating to ~1.4 h over the 447 lintable files — not the ~4 h the TODO budgeted. The
// 30-36 s it started from came from `generate-questions.mjs`, which feeds whole ARTICLES to this
// model; a snippet is an order of magnitude shorter. Slowest: shell and Dockerfile (11-25 s).
export const JUDGE_MODEL = process.env.SNIPPET_JUDGE_MODEL || "code-quality:latest";

/**
 * Bumped whenever the prompt below changes in a way that would change a verdict.
 *
 * This is what makes the two passes independent, which acceptance criterion 2 of TODO 0137 asks
 * for: a stored verdict is re-run when the file hash changes **or** when this version moves, and
 * neither of those invalidates pass 1's linter diagnostics. Editing the prompt therefore costs a
 * judge re-run, never a 447-file container sweep — and fixing a linter adapter costs the reverse.
 */
// v2: the prompt gained the "one line, no code block" instruction after the first end-to-end run
// returned an 884-character fenced block as a "replacement". Bumping this is what re-judges the
// corpus without touching a single linter verdict.
export const JUDGE_PROMPT_VERSION = 2;

/** Nothing longer than this is sent: a 600-line file is not what this pass is for. */
const MAX_CHARS = 6000;

/**
 * One diagnostic, one line — the report puts these next to pass 1's linter output, which is
 * strictly `file:line [CODE] message`.
 *
 * Enforced here rather than merely requested in the prompt because the first end-to-end run
 * proved the request is not enough: asked for a replacement, the model returned an 884-character
 * answer containing a fenced ```dockerfile block and a closing paragraph of advice. Good content,
 * unreadable in a list of 200 findings. The prompt now asks for one line AND this collapses
 * whatever comes back, because only one of those two is a guarantee.
 */
const MAX_MESSAGE_CHARS = 180;

function oneLine(text) {
  const flat = text
    .replace(/```[a-z]*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return flat.length > MAX_MESSAGE_CHARS
    ? `${flat.slice(0, MAX_MESSAGE_CHARS - 1).trimEnd()}…`
    : flat;
}

const SYSTEM_PROMPT = `You review code snippets published in technical blog articles, looking for
ONE thing: content that has become WRONG since it was written.

This file is an EXTRACT from an article. It may be partial, out of context, and depend on code
shown elsewhere in the article. That is normal and is never a finding.

REPORT ONLY these, and only when you are confident:
- A tool, command or subcommand that is deprecated or has been removed
  (e.g. "docker-compose" v1 instead of "docker compose", "apt-key add", "MAINTAINER" in a
  Dockerfile, "docker build" flags that no longer exist).
- Syntax belonging to a dead version of a format (e.g. a Compose file "version:" key that the
  spec has dropped, Python 2 print statements).
- A command that would now fail or silently do the wrong thing on a current system.

NEVER report any of the following. They are properties of an extract, not defects:
- An undefined or unassigned variable, a missing import, a missing shebang.
- A missing file, directory, dependency or service the snippet refers to.
- Code style, formatting, indentation, naming, quoting or shell best practices.
- A missing error check, missing cleanup, or a suggestion to "add validation".
- A hardcoded value, a placeholder, an example password, a sample hostname.
- Anything about security hardening, image size, layer count or performance.
- An unpinned version. A published tutorial deliberately does not pin: a pinned
  "apt-get install pkg=1.2.3" disappears from the mirror within months and then fails.
- Anything you are merely unsure about. Silence is the correct answer for a clean file.

For each finding: "what" names the problem in one short sentence, "replacement" gives the
corrected form in ONE line. Never write a code block, never explain at length, never use
markdown. "docker-compose up" -> "docker compose up" is the right level of detail.

Most files are clean. Returning an empty list is the expected outcome, not a failure.`;

/**
 * `findings` is an array rather than a keyed object: a judge may report two things about one
 * line, and an object keyed by line number silently loses one of them.
 */
export const JUDGE_SCHEMA = {
  type: "object",
  properties: {
    findings: {
      type: "array",
      items: {
        type: "object",
        properties: {
          line: { type: "integer" },
          what: { type: "string" },
          replacement: { type: "string" },
        },
        required: ["line", "what", "replacement"],
      },
    },
  },
  required: ["findings"],
};

/**
 * Is the judge usable at all?
 *
 * Mirrors `lib/anythingllm.mjs`'s `connect()` contract, for the same reason: every optional
 * local-model consumer in this repo must degrade to "as if it did not exist" rather than fail
 * the run. Under CI there is no Ollama and no GPU, so the answer is always no.
 */
export function judgeDisabled() {
  if (process.env.CI) return "CI";
  if (process.env.OLLAMA_DISABLE === "1") return "OLLAMA_DISABLE=1";
  return null;
}

/** Whether the daemon is actually answering. Cheap, and cached for the run. */
let reachable = null;
export async function judgeReachable() {
  if (reachable !== null) return reachable;
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    reachable = res.ok;
  } catch {
    reachable = false;
  }
  return reachable;
}

/**
 * Judge one snippet. Returns `{ findings, durationMs }`, findings already shaped like pass 1's
 * diagnostics so `lint-snippets.mjs` can merge both lists without a second reporting path.
 *
 * Never throws for a model-side problem: a judge that dies mid-corpus after three hours would
 * lose every verdict already computed. A failed file simply returns no findings and says so.
 */
export async function judgeSnippet({ rel, text, language, timeoutMs = 180000 }) {
  const started = Date.now();
  const truncated = text.length > MAX_CHARS;
  const body = truncated ? `${text.slice(0, MAX_CHARS)}\n[... truncated ...]` : text;
  const numbered = body
    .split("\n")
    .map((l, i) => `${i + 1}: ${l}`)
    .join("\n");

  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: JUDGE_MODEL,
        stream: false,
        format: JUDGE_SCHEMA,
        options: { temperature: 0.1 },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `File: ${rel}\nType: ${language}\n\n${numbered}\n\nReport only what has become wrong since publication.`,
          },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (err) {
    return { findings: [], error: `unreachable: ${err.message}`, durationMs: 0 };
  }

  if (!res.ok) {
    return {
      findings: [],
      error: `HTTP ${res.status}`,
      durationMs: Date.now() - started,
    };
  }

  let parsed;
  try {
    parsed = JSON.parse((await res.json()).message?.content ?? "{}");
  } catch (err) {
    // The schema makes this close to impossible; it is still not an excuse to crash a 4-hour run.
    return {
      findings: [],
      error: `unparseable: ${err.message}`,
      durationMs: Date.now() - started,
    };
  }

  const lineCount = body.split("\n").length;
  const findings = [];
  // The model repeats itself: the very first calibration file (an `apt-key add` in a Dockerfile)
  // came back with the same finding listed twice, identical down to the replacement string. A
  // grammar can enforce the shape of the array, not the distinctness of its members, so the
  // de-duplication belongs here. Keyed on line + text, because the same deprecation genuinely
  // can occur on two different lines of one file.
  const seen = new Set();
  for (const f of parsed.findings ?? []) {
    if (typeof f?.what !== "string" || !f.what.trim()) continue;
    // A line number outside the file is the one malformation the grammar cannot prevent, and it
    // would point a reader at nothing. Clamp into range rather than drop the finding: the text
    // is the useful part, and line 0 reads as "somewhere in this file".
    const line =
      Number.isInteger(f.line) && f.line >= 1 && f.line <= lineCount ? f.line : 0;
    const what = oneLine(f.what);
    const replacement = typeof f.replacement === "string" ? oneLine(f.replacement) : "";
    const message = replacement ? oneLine(`${what} → ${replacement}`) : what;
    const key = `${line}\u0000${message.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    findings.push({ severity: "suggestion", code: "JUDGE", line, message });
  }

  return { findings, truncated, durationMs: Date.now() - started };
}
