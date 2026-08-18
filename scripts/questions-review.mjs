#!/usr/bin/env node
/**
 * Post-by-post review of the "Ask my blog" question sidecars — see
 * .todos/PARTIAL/PARTIAL_0083-ask-my-blog-question-index.md.
 *
 * `generate-questions.mjs` writes a first draft from a small local model; those questions
 * become public content (the `/faq` pages, the search box), so every article's set is meant
 * to be read by a human once before it is trusted. This script is that pass: it walks the
 * corpus one article at a time, shows that article's questions, and lets you keep / delete /
 * edit / add / regenerate / exclude — then remembers where you stopped so the next session
 * resumes there.
 *
 * Where the progress lives: **in the sidecar itself**, not in a separate journal.
 *   "reviewed": "<ISO date>"   — a human validated this article's questions
 *   "excluded": true           — this article must never carry questions at all
 * Both travel with the file in git, so a `git checkout` of an old sidecar restores its review
 * state with it, and there is no second file to drift out of sync with the corpus.
 *
 * "Excluded" is the answer to articles that have nothing searchable to say — a new-year post,
 * a changelog, a personal note. An empty question list alone would not hold: the next
 * `yarn questions:bulk --force` would refill it. The `excluded` flag is what makes the
 * decision durable — `generate-questions.mjs` and `check-questions-freshness.mjs` both honor
 * it, and `questions-index-plugin` already contributes nothing for an empty list.
 *
 * Usage:
 *   node scripts/questions-review.mjs                 # resume the review where it stopped
 *   node scripts/questions-review.mjs <post>          # review one article (path or slug)
 *   node scripts/questions-review.mjs --list <post>   # just print its questions, no prompt
 *   node scripts/questions-review.mjs --status        # progress report, no prompt
 *
 * In the devcontainer: `questions review`, `questions list <post>`, `questions status`
 * (see .devcontainer/scripts/interactive.sh).
 */

import fs from "fs";
import path from "path";
import readline from "readline/promises";
import { fileURLToPath } from "url";
import { hashSource } from "./lib/eli5-hash.mjs";
import { findPosts, parseFrontMatter } from "./lib/blog-corpus.mjs";
import { extractHeadings, generateQuestions } from "./generate-questions.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const BLOG_DIR = path.join(projectRoot, "blog");

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[1;31m",
  green: "\x1b[1;32m",
  yellow: "\x1b[1;33m",
  blue: "\x1b[1;34m",
  cyan: "\x1b[1;36m",
};

const RULE = "─".repeat(78);

// ── Corpus ───────────────────────────────────────────────────────────────────

function readSidecar(sidecarPath) {
  if (!fs.existsSync(sidecarPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
    if (!Array.isArray(parsed.questions)) parsed.questions = [];
    return parsed;
  } catch {
    return { unreadable: true, questions: [] };
  }
}

/**
 * Writes a sidecar with a stable key order. Hand-editing and reviewing both rewrite these
 * files repeatedly; a fixed order keeps `git diff` limited to what actually changed instead
 * of reshuffling the whole object.
 */
function writeSidecar(sidecarPath, sidecar) {
  const ordered = {};
  for (const key of [
    "version",
    "model",
    "generated",
    "source",
    "sourceHash",
    "reviewed",
    "excluded",
    "excludedReason",
  ]) {
    if (sidecar[key] !== undefined) ordered[key] = sidecar[key];
  }
  // Anything a future version of the pipeline adds is preserved rather than dropped.
  for (const [key, value] of Object.entries(sidecar)) {
    if (key !== "questions" && ordered[key] === undefined && key !== "unreadable") {
      ordered[key] = value;
    }
  }
  ordered.questions = sidecar.questions;

  fs.writeFileSync(sidecarPath, JSON.stringify(ordered, null, 2) + "\n");
}

/** Every published article, in chronological (path) order, with its sidecar state. */
function loadCorpus() {
  const posts = [];

  for (const file of findPosts(BLOG_DIR).sort()) {
    const raw = fs.readFileSync(file, "utf-8");
    const { data, body } = parseFrontMatter(raw);

    // Same gate as generate-questions.mjs and questions-index-plugin: an article without a
    // title isn't one, and a draft isn't public yet.
    if (!data.title) continue;
    if (data.draft === true || data.draft === "true") continue;

    const sidecarPath = `${file}.questions.json`;
    const sidecar = readSidecar(sidecarPath);

    posts.push({
      file,
      rel: path.relative(projectRoot, file),
      slug: data.slug || path.basename(path.dirname(file)),
      title: data.title,
      description: data.description || "",
      mainTag: data.mainTag || null,
      headings: extractHeadings(body),
      currentHash: hashSource(raw),
      sidecarPath,
      sidecar,
    });
  }

  return posts;
}

const isReviewed = (post) => Boolean(post.sidecar?.reviewed);
const isExcluded = (post) => post.sidecar?.excluded === true;
const isStale = (post) =>
  Boolean(post.sidecar) &&
  !isExcluded(post) &&
  post.sidecar.sourceHash !== undefined &&
  post.sidecar.sourceHash !== post.currentHash;

/**
 * Resolves a user-typed article reference: a path to index.md(x), a directory under blog/,
 * or just the slug ("new-year-2024" → blog/2023/12/31/new-year-2024/index.md).
 */
function resolvePost(reference, posts) {
  const needle = reference.replace(/^\.\//, "").replace(/\/+$/, "");
  const asPath = path.resolve(projectRoot, needle);

  const exact = posts.filter(
    (post) => post.file === asPath || path.dirname(post.file) === asPath,
  );
  if (exact.length === 1) return exact[0];

  const bySlug = posts.filter(
    (post) => post.slug === needle || path.basename(path.dirname(post.file)) === needle,
  );
  if (bySlug.length === 1) return bySlug[0];

  const fuzzy = posts.filter(
    (post) => post.rel.includes(needle) || post.slug.includes(needle),
  );
  if (fuzzy.length === 1) return fuzzy[0];

  if (fuzzy.length > 1) {
    console.error(`Ambiguous — "${reference}" matches ${fuzzy.length} articles:`);
    for (const post of fuzzy.slice(0, 10)) console.error(`  ${post.rel}`);
    if (fuzzy.length > 10) console.error(`  … and ${fuzzy.length - 10} more.`);
    return null;
  }

  console.error(`No published article matches "${reference}".`);
  return null;
}

// ── Rendering ────────────────────────────────────────────────────────────────

function renderQuestions(post) {
  const questions = post.sidecar?.questions ?? [];

  if (!post.sidecar) {
    console.log(
      `  ${C.dim}(no sidecar yet — nothing generated for this article)${C.reset}`,
    );
    return;
  }
  if (post.sidecar.unreadable) {
    console.log(`  ${C.red}(sidecar is not valid JSON — fix or regenerate it)${C.reset}`);
    return;
  }
  if (questions.length === 0) {
    console.log(`  ${C.dim}(no questions)${C.reset}`);
    return;
  }

  questions.forEach((q, i) => {
    const known = q.anchor && post.headings.some((h) => h.anchor === q.anchor);
    const anchor = q.anchor
      ? ` ${known ? C.dim : C.red}→ #${q.anchor}${known ? "" : " (unknown heading!)"}${C.reset}`
      : ` ${C.dim}→ (intro)${C.reset}`;
    console.log(`  ${C.bold}[${i}]${C.reset} ${q.question}${anchor}`);
  });
}

function renderHeader(post, position) {
  const flags = [];
  if (isExcluded(post)) flags.push(`${C.yellow}EXCLUDED${C.reset}`);
  if (isReviewed(post))
    flags.push(`${C.green}reviewed ${post.sidecar.reviewed.slice(0, 10)}${C.reset}`);
  if (isStale(post))
    flags.push(`${C.red}STALE (article edited since generation)${C.reset}`);

  console.log(`\n${C.dim}${RULE}${C.reset}`);
  console.log(`${C.dim}${position}${C.reset}  ${C.cyan}${post.rel}${C.reset}`);
  console.log(
    `${C.bold}${post.title}${C.reset}${post.mainTag ? ` ${C.dim}#${post.mainTag}${C.reset}` : ""}`,
  );
  if (post.description) console.log(`${C.dim}${post.description}${C.reset}`);

  if (post.sidecar && !post.sidecar.unreadable) {
    const meta = [
      `${post.sidecar.questions.length} question(s)`,
      post.sidecar.model ? `model ${post.sidecar.model}` : null,
      post.sidecar.generated ? `generated ${post.sidecar.generated.slice(0, 10)}` : null,
    ].filter(Boolean);
    console.log(`${C.dim}${meta.join(" · ")}${C.reset}`);
  }

  if (flags.length > 0) console.log(flags.join("  "));
  console.log(`${C.dim}${RULE}${C.reset}`);
  renderQuestions(post);
}

const HELP = `
  ${C.bold}Enter${C.reset} / ${C.bold}k${C.reset}   keep as-is and mark this article reviewed
  ${C.bold}1 3 7${C.reset}       delete question(s) by number (space-separated)
  ${C.bold}a${C.reset}           add a question by hand
  ${C.bold}e N${C.reset}         edit question N (text, then the heading it answers)
  ${C.bold}h N${C.reset}         change only the heading question N points to
  ${C.bold}r${C.reset}           regenerate this article's questions with Ollama (replaces all)
  ${C.bold}x${C.reset}           exclude this article — no questions, never regenerated
  ${C.bold}i${C.reset}           re-include a previously excluded article
  ${C.bold}o${C.reset}           show the article's headings (to pick anchors from)
  ${C.bold}s${C.reset}           skip — leave it unreviewed, come back later
  ${C.bold}q${C.reset}           quit (everything done so far is already saved)
`;

function renderHeadings(post) {
  console.log(
    `\n  ${C.bold}0${C.reset} ${C.dim}(intro / the article as a whole)${C.reset}`,
  );
  post.headings.forEach((h, i) => {
    const indent = "  ".repeat(h.level - 1);
    console.log(
      `  ${C.bold}${i + 1}${C.reset} ${indent}${h.text} ${C.dim}→ #${h.anchor}${C.reset}`,
    );
  });
  if (post.headings.length === 0) {
    console.log(`  ${C.dim}(this article has no ## / ### heading)${C.reset}`);
  }
  console.log("");
}

// ── Interactive review of one article ────────────────────────────────────────

/** Prompts for a heading number and returns the matching anchor ("" for the intro). */
async function askAnchor(rl, post, currentAnchor) {
  renderHeadings(post);
  const current = post.headings.findIndex((h) => h.anchor === currentAnchor);
  const suggested = currentAnchor && current !== -1 ? current + 1 : 0;
  const answer = (await rl.question(`  Heading number [${suggested}]: `)).trim();

  const index = answer === "" ? suggested : Number(answer);
  if (!Number.isInteger(index) || index < 0 || index > post.headings.length) {
    console.log(
      `  ${C.yellow}Not a valid heading number — keeping the intro anchor.${C.reset}`,
    );
    return "";
  }
  return index === 0 ? "" : post.headings[index - 1].anchor;
}

/** Asks a question with `preset` pre-typed in the input line, so it can be edited in place. */
async function askWithPreset(rl, prompt, preset) {
  const answer = rl.question(prompt);
  rl.write(preset);
  return (await answer).trim();
}

/**
 * Ensures the article has a sidecar object to mutate. An article that was never generated
 * still needs one the moment it is excluded or given a hand-written question.
 */
function ensureSidecar(post) {
  if (!post.sidecar || post.sidecar.unreadable) {
    post.sidecar = {
      version: 1,
      source: path.basename(post.file),
      sourceHash: post.currentHash,
      questions: [],
    };
  }
  return post.sidecar;
}

const save = (post) => writeSidecar(post.sidecarPath, post.sidecar);

/**
 * Reviews one article. Returns "next" (move on), "skip" (move on, still unreviewed) or
 * "quit". Every mutation is written to disk immediately: quitting mid-review must never
 * lose the deletions already made on this article.
 */
async function reviewPost(rl, post, position) {
  renderHeader(post, position);

  for (;;) {
    const questions = post.sidecar?.questions ?? [];
    const answer = (
      await rl.question(
        `\n${C.blue}Enter${C.reset}=keep  ${C.blue}N…${C.reset}=delete  ${C.blue}a${C.reset}dd  ${C.blue}e${C.reset}dit  ${C.blue}r${C.reset}egenerate  e${C.blue}x${C.reset}clude  ${C.blue}s${C.reset}kip  ${C.blue}?${C.reset}  ${C.blue}q${C.reset}uit > `,
      )
    ).trim();

    const [verb, ...rest] = answer.split(/\s+/);
    const command = verb.toLowerCase();

    // Keep — the only path that stamps the review date.
    if (answer === "" || command === "k") {
      ensureSidecar(post).reviewed = new Date().toISOString();
      save(post);
      const count = post.sidecar.questions.length;
      console.log(`  ${C.green}✅ Reviewed${C.reset} — ${count} question(s) kept.`);
      if (count === 0 && !isExcluded(post)) {
        console.log(
          `  ${C.yellow}Note:${C.reset} 0 question but not excluded — a future ${C.bold}questions:bulk --force${C.reset} would refill it. Use ${C.bold}x${C.reset} to make it durable.`,
        );
      }
      return "next";
    }

    if (command === "q") return "quit";
    if (command === "s") {
      console.log(`  ${C.dim}Skipped — still on the list for next time.${C.reset}`);
      return "skip";
    }
    if (command === "?" || command === "help") {
      console.log(HELP);
      continue;
    }
    if (command === "o") {
      renderHeadings(post);
      continue;
    }

    if (command === "x") {
      const reason = (
        await rl.question("  Why exclude it? (optional, Enter to skip): ")
      ).trim();
      const sidecar = ensureSidecar(post);
      sidecar.excluded = true;
      if (reason) sidecar.excludedReason = reason;
      sidecar.questions = [];
      sidecar.reviewed = new Date().toISOString();
      save(post);
      console.log(
        `  ${C.yellow}🚫 Excluded${C.reset} — no questions, and generation will skip it from now on.`,
      );
      return "next";
    }

    if (command === "i") {
      if (!isExcluded(post)) {
        console.log(`  ${C.dim}This article isn't excluded.${C.reset}`);
        continue;
      }
      delete post.sidecar.excluded;
      delete post.sidecar.excludedReason;
      save(post);
      console.log(
        `  ${C.green}Re-included${C.reset} — press ${C.bold}r${C.reset} to generate questions.`,
      );
      renderHeader(post, position);
      continue;
    }

    if (command === "r") {
      console.log(`  ${C.dim}Asking Ollama…${C.reset}`);
      try {
        const result = await generateQuestions(post.file, { force: true });
        post.sidecar = readSidecar(post.sidecarPath);
        post.currentHash = hashSource(fs.readFileSync(post.file, "utf-8"));
        console.log(
          `  ${C.green}✅ Regenerated${C.reset} — ${result.count} question(s).`,
        );
      } catch (err) {
        console.log(`  ${C.red}❌ ${err.message}${C.reset}`);
      }
      renderHeader(post, position);
      continue;
    }

    if (command === "a") {
      const text = (await rl.question("  New question: ")).trim();
      if (!text) {
        console.log(`  ${C.dim}(nothing added)${C.reset}`);
        continue;
      }
      const anchor = await askAnchor(rl, post, "");
      ensureSidecar(post).questions.push({ question: text, anchor });
      save(post);
      renderHeader(post, position);
      continue;
    }

    if (command === "e" || command === "h") {
      const index = Number(rest[0]);
      if (!Number.isInteger(index) || index < 0 || index >= questions.length) {
        console.log(
          `  ${C.yellow}Usage: ${command} <number>  (0-${Math.max(questions.length - 1, 0)})${C.reset}`,
        );
        continue;
      }

      const target = questions[index];
      if (command === "e") {
        const text = await askWithPreset(rl, "  Question: ", target.question);
        if (!text) {
          console.log(`  ${C.dim}(unchanged)${C.reset}`);
          continue;
        }
        target.question = text;
      }
      target.anchor = await askAnchor(rl, post, target.anchor);
      save(post);
      renderHeader(post, position);
      continue;
    }

    // Bare numbers — delete those entries. Highest index first, so the earlier splices
    // don't shift the later ones out from under us (same rule as scripts/faq-edit.mjs).
    const indices = [...new Set(answer.split(/\s+/).filter(Boolean).map(Number))]
      .filter((n) => Number.isInteger(n) && n >= 0 && n < questions.length)
      .sort((a, b) => b - a);

    if (indices.length === 0) {
      console.log(
        `  ${C.yellow}Unknown command "${answer}" — press ? for the list.${C.reset}`,
      );
      continue;
    }

    for (const index of indices) questions.splice(index, 1);
    save(post);
    console.log(
      `  ${C.green}Removed ${indices.length} question(s)${C.reset}, ${questions.length} left.`,
    );
    renderHeader(post, position);
  }
}

// ── Modes ────────────────────────────────────────────────────────────────────

function printStatus(posts) {
  const withSidecar = posts.filter((post) => post.sidecar && !post.sidecar.unreadable);
  const reviewed = posts.filter(isReviewed);
  const excluded = posts.filter(isExcluded);
  const stale = posts.filter(isStale);
  const missing = posts.filter((post) => !post.sidecar);
  const unreadable = posts.filter((post) => post.sidecar?.unreadable);
  const questionCount = withSidecar.reduce(
    (sum, post) => sum + post.sidecar.questions.length,
    0,
  );
  const left = posts.filter((post) => !isReviewed(post)).length;
  const percent =
    posts.length === 0 ? 0 : Math.round((reviewed.length / posts.length) * 100);

  console.log(`\n${C.bold}Ask my blog — review status${C.reset}`);
  console.log(`${C.dim}${RULE}${C.reset}`);
  console.log(`  ${String(posts.length).padStart(4)} published article(s)`);
  console.log(
    `  ${String(withSidecar.length).padStart(4)} with a sidecar (${questionCount} questions)`,
  );
  console.log(`  ${String(missing.length).padStart(4)} with no sidecar yet`);
  console.log(
    `  ${String(reviewed.length).padStart(4)} reviewed  ${C.dim}(${percent}%)${C.reset}`,
  );
  console.log(`  ${String(excluded.length).padStart(4)} excluded`);
  console.log(
    `  ${String(stale.length).padStart(4)} stale — article edited since generation`,
  );
  if (unreadable.length > 0) {
    console.log(
      `  ${C.red}${String(unreadable.length).padStart(4)} unreadable sidecar(s)${C.reset}`,
    );
  }
  console.log(`${C.dim}${RULE}${C.reset}`);
  console.log(
    `  ${C.bold}${left}${C.reset} left to review — run ${C.bold}questions review${C.reset} to continue.\n`,
  );
}

async function runReview(rl, queue, total, reviewedBefore) {
  let done = 0;

  for (const [index, post] of queue.entries()) {
    const position = `[${index + 1}/${queue.length} in this run · ${reviewedBefore + done}/${total} reviewed overall]`;
    const outcome = await reviewPost(rl, post, position);

    if (outcome === "quit") break;
    if (outcome === "next") done += 1;
  }

  const left = total - reviewedBefore - done;
  console.log(`\n${C.dim}${RULE}${C.reset}`);
  console.log(
    `${C.green}${done}${C.reset} article(s) reviewed this session — ${C.bold}${left}${C.reset} left.`,
  );
  console.log(
    `${C.dim}Resume any time with ${C.reset}${C.bold}questions review${C.reset}${C.dim}.${C.reset}\n`,
  );
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage:
  node scripts/questions-review.mjs [options] [<post>]

  <post>  an article: path (blog/2023/12/31/new-year-2024/index.md), its directory,
          or just its slug (new-year-2024). Reviews that one article, reviewed or not.

Options:
  --status          Progress report only — no prompts
  --list <post>     Print one article's questions and exit — no prompts
  --all             Include already-reviewed articles in the queue (re-review everything)
  --stale           Only articles edited since their questions were generated
  --unreviewed      Default — only articles not reviewed yet
  --tag <mainTag>   Only articles with this mainTag
  --limit <n>       Stop the queue after n articles
  --help, -h        Show this help

Review state lives in each <article>.questions.json ("reviewed", "excluded"), so it is
versioned in git and survives across sessions and machines.
`);
  process.exit(0);
}

const posts = loadCorpus();

const listIdx = args.indexOf("--list");
if (listIdx !== -1) {
  const reference = args[listIdx + 1];
  if (!reference) {
    console.error("Error: --list needs an article (path or slug).");
    process.exit(1);
  }
  const post = resolvePost(reference, posts);
  if (!post) process.exit(1);
  renderHeader(post, "");
  console.log("");
  process.exit(0);
}

if (args.includes("--status")) {
  printStatus(posts);
  process.exit(0);
}

if (!process.stdin.isTTY) {
  console.error(
    "This review is interactive and needs a terminal. Use --status or --list <post> instead.",
  );
  process.exit(1);
}

const flagValue = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

const target = args.find((arg, i) => {
  if (arg.startsWith("--")) return false;
  // Skip a value that belongs to a preceding option.
  const previous = args[i - 1];
  return previous !== "--tag" && previous !== "--limit";
});

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const total = posts.length;
const reviewedBefore = posts.filter(isReviewed).length;

const stopped = () =>
  console.log(
    `\n${C.dim}Stopped — everything reviewed so far is already saved.${C.reset}\n`,
  );

// Ctrl+C must end the session the same way `q` does, not leave a half-drawn prompt: every
// mutation is written as it happens, so there is nothing to flush here.
rl.on("SIGINT", () => {
  stopped();
  rl.close();
  process.exit(0);
});

try {
  if (target) {
    const post = resolvePost(target, posts);
    if (!post) process.exit(1);
    await reviewPost(rl, post, "[single article]");
  } else {
    const tag = flagValue("--tag");
    const limitRaw = flagValue("--limit");
    const limit = limitRaw ? parseInt(limitRaw, 10) : null;

    let queue = posts;
    if (args.includes("--stale")) {
      queue = queue.filter(isStale);
    } else if (!args.includes("--all")) {
      queue = queue.filter((post) => !isReviewed(post));
    }
    if (tag) queue = queue.filter((post) => post.mainTag === tag);
    if (limit) queue = queue.slice(0, limit);

    if (queue.length === 0) {
      console.log(
        `\n${C.green}Nothing left to review.${C.reset} Everything matching is done.\n`,
      );
      printStatus(posts);
    } else {
      console.log(
        `\n${C.bold}Ask my blog — review${C.reset}  ${C.dim}(${queue.length} article(s) queued, ${reviewedBefore}/${total} already reviewed)${C.reset}`,
      );
      console.log(`${C.dim}Press ? at any prompt for the list of actions.${C.reset}`);
      await runReview(rl, queue, total, reviewedBefore);
    }
  }
} catch (err) {
  // Ctrl+D at a prompt closes stdin; readline surfaces that as an abort, which is a normal
  // way to end a review — not a crash worth a stack trace.
  if (err?.code === "ABORT_ERR") {
    stopped();
  } else {
    throw err;
  }
} finally {
  rl.close();
}
