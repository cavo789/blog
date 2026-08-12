#!/usr/bin/env node
/**
 * Find and interactively prune low-quality generated questions from the "Ask my blog"
 * .questions.json sidecars — see .todos/PARTIAL/PARTIAL_0083-ask-my-blog-question-index.md.
 *
 * Generation is a first draft from a small local model: most entries are fine, but some read
 * like a joke line lifted verbatim from an article's prose ("How can I play with a green
 * dinosaur?") rather than a real search query. Sidecars are meant to be hand-edited — deleting
 * a question here never touches the source article file, so it never trips
 * check-questions-freshness.mjs (that script only compares the *source*'s hash, not the
 * sidecar's own content).
 *
 * Usage:
 *   node scripts/faq-edit.mjs <search term>
 *   faq <search term>                 # devcontainer shell (see .devcontainer/scripts/interactive.sh)
 *
 * For every sidecar with a question matching <search term> (case-insensitive substring),
 * prints all of that article's questions, numbered, and prompts for which numbers to delete.
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

function findSidecars(dir) {
  const found = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...findSidecars(target));
    } else if (entry.name.endsWith(".questions.json")) {
      found.push(target);
    }
  }
  return found;
}

async function main() {
  const term = process.argv.slice(2).join(" ").trim();

  if (!term) {
    console.error("Usage: node scripts/faq-edit.mjs <search term>");
    console.error(
      "  Finds every .questions.json sidecar with a matching question, lists all of that",
    );
    console.error("  article's questions, and lets you delete entries by number.");
    process.exitCode = 1;
    return;
  }

  const needle = term.toLowerCase();
  const files = findSidecars(path.join(projectRoot, "blog")).sort();
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

  let matchCount = 0;

  for (const file of files) {
    const rel = path.relative(projectRoot, file);

    let sidecar;
    try {
      sidecar = JSON.parse(fs.readFileSync(file, "utf-8"));
    } catch {
      continue;
    }

    if (!Array.isArray(sidecar.questions)) continue;

    const hasMatch = sidecar.questions.some((q) =>
      q.question.toLowerCase().includes(needle),
    );
    if (!hasMatch) continue;

    matchCount += 1;
    console.log(`\n\x1b[1;36m${rel}\x1b[0m`);
    sidecar.questions.forEach((q, i) => {
      const anchor = q.anchor ? ` \x1b[2m→ #${q.anchor}\x1b[0m` : "";
      console.log(`  [${i}] ${q.question}${anchor}`);
    });

    // One file at a time, on purpose: the reader needs to see this file's list before
    // deciding, so a serial await here is required, not an accidental perf trap.
    const answer = await ask(
      "Delete which number(s)? (space-separated, Enter to skip): ",
    );

    const indices = [
      ...new Set(
        answer
          .split(/\s+/)
          .filter(Boolean)
          .map((s) => Number(s)),
      ),
    ]
      .filter((n) => Number.isInteger(n) && n >= 0 && n < sidecar.questions.length)
      // Highest index first — deleting low-to-high would shift every later index out from
      // under the next splice().
      .sort((a, b) => b - a);

    if (indices.length === 0) {
      console.log("  (skipped)");
      continue;
    }

    for (const index of indices) {
      sidecar.questions.splice(index, 1);
    }

    fs.writeFileSync(file, JSON.stringify(sidecar, null, 2) + "\n");
    console.log(
      `  ✅ Removed ${indices.length} question(s), ${sidecar.questions.length} left.`,
    );
  }

  rl.close();

  if (matchCount === 0) {
    console.log(`No question matched "${term}".`);
  }
}

main();
