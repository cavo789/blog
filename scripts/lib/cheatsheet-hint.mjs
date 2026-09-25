// Print the command the author actually types, not the yarn script underneath it.
//
// Every day-to-day task of this repo has a shell function in .devcontainer/scripts/helpers/*.sh
// — the startup cheatsheet: `questions`, `translate`, `links`, `eli5`, `faq`. The yarn scripts
// still exist (the functions call them), but a hint that says `yarn questions --locale fr --all`
// points at the lower-level entry point and skips everything the function adds around it: the
// cost prompt in `translate`, the sub-actions and inline help in `questions`, the stats/one-post
// switch in `links`.
//
// `cmd()` takes the yarn script name and gives back the cheatsheet wording whenever an exactly
// equivalent function exists, and `yarn <script> …` otherwise. Availability is read from the
// helper modules' own `# @cmd` annotations — the same annotations the cheatsheet renders — so
// renaming or deleting a function silently restores the yarn wording instead of advertising a
// command that no longer exists.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");
const helpersDir = path.join(projectRoot, ".devcontainer", "scripts", "helpers");

// Drop `--flag value` from an argument list: the cheatsheet function takes that value
// positionally where the yarn script wants a named option.
const dropOption = (flag) => (args) => {
  const out = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === flag) {
      if (args[i + 1] !== undefined) out.push(args[i + 1]);
      i++;
      continue;
    }
    out.push(args[i]);
  }
  return out;
};

// yarn script → cheatsheet function. `args` rewrites the argument list when the two entry
// points do not spell the same thing the same way; returning null means "these arguments have
// no faithful equivalent", and the yarn form is printed instead.
//
// Only exact equivalences belong here. `yarn questions:check` and `yarn translate:check`, for
// instance, are deliberately absent: no function covers them, and `questions status` (review
// progress) answers a different question.
const EQUIVALENTS = new Map([
  ["questions", { fn: "questions" }],
  // `eli5` routes on its argument: a file goes to generate-eli5.mjs, a folder to bulk-eli5.mjs.
  ["eli5", { fn: "eli5" }],
  ["questions:bulk", { fn: "questions", args: (a) => ["--all", ...a] }],
  ["questions:review", { fn: "questions", args: (a) => ["review", ...a] }],
  ["questions:list", { fn: "questions", args: (a) => ["list", ...a] }],
  ["questions:status", { fn: "questions", args: (a) => ["status", ...a] }],
  ["questions:triage", { fn: "questions", args: (a) => ["triage", ...a] }],
  ["questions:edit", { fn: "faq" }],
  // `eli5` with no target prints its help (TODO 0131) — a corpus-wide run must be spelled
  // `eli5 --all`. Without this, `cmd("eli5:bulk", "--force")` would advertise `eli5 --force`,
  // which now refuses instead of running.
  [
    "eli5:bulk",
    {
      fn: "eli5",
      args: (a) => {
        const mapped = dropOption("--dir")(a);
        return mapped.some((arg) => !arg.startsWith("--"))
          ? mapped
          : ["--all", ...mapped];
      },
    },
  ],
  ["translate", { fn: "translate" }],
  // `terms` forwards every flag untouched, so the equivalence is exact for any invocation.
  ["translate:terms", { fn: "terms" }],
  // `links` with no argument is --stats; with one, it is --post. Anything else stays yarn.
  ["links:audit", { fn: "links", args: (a) => (a.length === 0 ? [] : null) }],
  ["links:check", { fn: "links", args: dropOption("--post") }],
  // `snippets` with no argument is a full incremental run; with a path it is --only, and
  // `stats` is the coverage table. Anything else has no faithful function form.
  ["snippets:lint", { fn: "snippets", args: (a) => (a.length === 0 ? [] : null) }],
  [
    "snippets:stats",
    { fn: "snippets", args: (a) => (a.length === 0 ? ["stats"] : null) },
  ],
  // `snippets judge` is `--judge-only`; any other judge invocation has no function form.
  [
    "snippets:judge",
    { fn: "snippets", args: (a) => (a.length === 0 ? ["judge"] : ["judge", ...a]) },
  ],
  ["build", { fn: "build" }],
  ["format", { fn: "format" }],
]);

let availableCommands = null;

// helpers/ is part of the repository, so it is just as present in a CI checkout as in the
// devcontainer — but nothing sources it there, and a log line telling a runner to type
// `questions --locale fr --all` names a command that shell does not have. Presence of the files
// therefore is not enough: a hint is only rewritten where a human shell could have loaded them.
// `CI` is set unconditionally by GitHub Actions (and by every other runner worth naming); the
// devcontainer does not set it, and neither does `run_ci`, which is deliberate — that one is the
// author reproducing the pipeline at their own keyboard, cheatsheet functions and all.
function inCi() {
  const flag = process.env.CI;
  return Boolean(flag) && flag !== "0" && flag.toLowerCase() !== "false";
}

// The set of `# @cmd <name>` annotations declared by the helper modules. Read once, and
// tolerant of the directory being absent (the scripts also run outside the devcontainer).
function available() {
  if (availableCommands) return availableCommands;
  availableCommands = new Set();
  if (inCi()) return availableCommands;
  try {
    for (const entry of fs.readdirSync(helpersDir)) {
      if (!entry.endsWith(".sh")) continue;
      const content = fs.readFileSync(path.join(helpersDir, entry), "utf-8");
      for (const match of content.matchAll(/^[ \t]*#[ \t]*@cmd[ \t]+(\S+)/gm)) {
        availableCommands.add(match[1]);
      }
    }
  } catch {
    // No helpers/ here — every hint falls back to its yarn form.
  }
  return availableCommands;
}

/**
 * Render a command for a human to copy/paste, preferring the cheatsheet function.
 *
 *   cmd("questions", "--force", "blog/…/index.md")  → questions --force blog/…/index.md
 *   cmd("questions:bulk")                           → questions --all
 *   cmd("eli5", "file.sh", "--force")               → yarn eli5 file.sh --force   (no equivalent)
 *
 * Under CI, every call returns its yarn form — see inCi().
 *
 * @param {string} script yarn script name, as written in package.json
 * @param {...string} args arguments, already shell-quoted if they need to be
 * @returns {string}
 */
export function cmd(script, ...args) {
  const entry = EQUIVALENTS.get(script);
  if (entry && available().has(entry.fn)) {
    const mapped = entry.args ? entry.args(args) : args;
    if (mapped !== null) return [entry.fn, ...mapped].join(" ");
  }
  return ["yarn", script, ...args].join(" ");
}
