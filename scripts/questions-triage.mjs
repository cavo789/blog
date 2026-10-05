#!/usr/bin/env node
/**
 * Automatic triage of the "Ask my blog" question sidecars — the unattended counterpart of
 * `questions-review.mjs`, for a corpus too large (≈ 2 400 questions) to read by hand.
 *
 * One Ollama call per article: the judge reads the WHOLE article (not the 4 000-char excerpt
 * the generator sees), with the files its <Snippet>/<Terminal> tags display inlined, and
 * returns one verdict per question — is it answered by this article, and under which heading.
 * Headings are named by their anchor from a closed list, never by position: titles such as
 * "4. Create the Dockerfile" made a numbered list send questions to the wrong section.
 *
 * What happens to each question:
 *   - not answered                → moved to `rejected`, with the judge's reason
 *   - adds no search term         → moved to `rejected` ("duplicate of: …"). Decided WITHOUT
 *                                   the model: the site's BM25 search is lexical, so a question
 *                                   whose terms an earlier kept one already has catches nothing
 *                                   new. Asked to the model, this flip-flopped between locales.
 *   - answered under a heading    → the anchor is moved there when it differs. Never demoted
 *                                   to the introduction: a specific anchor is kept over "".
 *
 * Nothing is ever deleted. `rejected` sits in the same sidecar, the site never reads it
 * (questions-index-plugin only reads `questions`), and `--restore <post>` puts it back.
 *
 * AnythingLLM's specificity rank (●◐○ in `questions review`) is deliberately NOT an input:
 * on a short article it ranks a big generic one higher for questions the article answers word
 * for word (2026-09-23, docker-php-run-script-or-website Q5/Q6). Answered-or-not is the test.
 *
 * Idempotence is by construction, not by trusting the model to answer the same twice (it may
 * not — thinking models vary between calls even at temperature 0). Each triaged sidecar gets a
 * `triage` stamp holding the hash of the questions it left and of the article it read; a run
 * skips every sidecar whose stamp still matches, without calling Ollama. The stamp is lost
 * exactly when the verdicts stop being valid: a regeneration rewrites the whole sidecar, and an
 * edited article changes the hash.
 *
 * Safety valve: an article where the judge would reject more than half the questions is not
 * touched — that ratio says more about a confused judge than about the questions. It is stamped
 * `held` (so reruns skip it) and listed at the end, for `questions review <post>`.
 *
 * A human decision wins: an article already `reviewed` in `questions review` is skipped unless
 * --force, and `excluded` ones always are.
 *
 * Usage:
 *   node scripts/questions-triage.mjs [<path>] [--locale fr] [--dry-run] [--force]
 *                                     [--limit N] [--pause <sec>]
 *   node scripts/questions-triage.mjs --restore <post-file-or-folder> [--locale fr]
 *
 * In the devcontainer: `questions triage …` (see .devcontainer/scripts/helpers/ollama.sh).
 */

import { execFileSync } from "child_process";
import { createHash } from "crypto";
import fs from "fs";
import { createRequire } from "module";
import path from "path";
import { fileURLToPath } from "url";
import { hashSource } from "./lib/eli5-hash.mjs";
import { findPosts, parseFrontMatter } from "./lib/blog-corpus.mjs";
import { extractHeadings } from "./generate-questions.mjs";

const require = createRequire(import.meta.url);
const { resolveSourcePath } = require("../plugins/remark-snippet-loader/index.cjs");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const I18N_BLOG_DIR = "docusaurus-plugin-content-blog";
const DEFAULT_LOCALE = "en";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://172.17.0.1:11434";
// Same model as the generator: the one already loaded on the GPU, and the one the 2026-09-23
// bench found best at mapping questions to late headings — which is half of the judge's job.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "code-quality:latest";

// Bump when the prompt or the rules below change meaning: every stamp from an older version
// then stops matching, and the next run re-judges the corpus.
const TRIAGE_VERSION = 1;

// The longest article is ≈ 37 000 chars (≈ 10k tokens), well inside code-quality's 32k context.
// The cap only guards against a future outlier silently truncating the model's input.
const MAX_BODY_CHARS = 80000;

// Above this share of rejections, the article is held rather than triaged — see the header.
const MAX_REJECT_RATIO = 0.5;

const DEFAULT_PAUSE_SECONDS = 30;

// What the judge answers for "the introduction / the article as a whole" — never a real id.
const INTRO = "(intro)";

// One displayed file is inlined up to this size; the rest of a long file adds little to
// "does the article answer this?" and would crowd out the prose.
const MAX_SNIPPET_CHARS = 6000;

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
};

const SYSTEM_PROMPT = `You audit the search questions attached to one article of a technical
blog. A reader who types one of these questions is sent to this article, at the heading given.
You receive the full article — code files it displays are inlined where they appear — its
headings, each with an id, and the numbered questions.

For EVERY question, return one verdict:
- answered: true when the article itself gives the reader what the question asks for — the
  command, the explanation, the fix. The wording may differ ("swap the image tag" answers
  "change the PHP version"). false when the article only mentions the topic in passing, or
  when the answer would have to come from somewhere else — a link to another page is not an
  answer. Judge each question on its own, from the article alone. Many questions sharing one
  answer is normal and never a reason for false.
- heading: the id of the heading whose section answers it best, copied exactly from the list;
  "${INTRO}" when the answer is the article as a whole or its introduction. Heading texts may
  start with their own numbering ("4. Create the Dockerfile"): ignore it, only the id counts.
- reason: at most 15 words, only when answered is false.

Judge the article as written, never general knowledge.`;

/** The schema is built per article: `heading` is an enum of that article's own ids. */
const responseSchema = (headingIds) => ({
  type: "object",
  properties: {
    verdicts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          index: { type: "integer" },
          answered: { type: "boolean" },
          heading: { type: "string", enum: [INTRO, ...headingIds] },
          reason: { type: "string" },
        },
        required: ["index", "answered", "heading", "reason"],
      },
    },
  },
  required: ["verdicts"],
});

// ── Sidecar I/O ──────────────────────────────────────────────────────────────

/** Same key order as questions-review.mjs's writeSidecar, so the two never reshuffle a file. */
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
  for (const [key, value] of Object.entries(sidecar)) {
    if (key !== "questions" && ordered[key] === undefined) ordered[key] = value;
  }
  ordered.questions = sidecar.questions;
  fs.writeFileSync(sidecarPath, JSON.stringify(ordered, null, 2) + "\n");
}

/** The fingerprint a stamp is checked against: what the triage left, text and anchor. */
const hashQuestions = (questions) =>
  createHash("sha256")
    .update(JSON.stringify(questions.map((q) => [q.question, q.anchor ?? ""])))
    .digest("hex")
    .slice(0, 16);

const stampFor = (sidecar, articleHash, extra) => ({
  version: TRIAGE_VERSION,
  model: OLLAMA_MODEL,
  date: new Date().toISOString(),
  articleHash,
  questionsHash: hashQuestions(sidecar.questions),
  ...extra,
});

/** True when the stamp still describes this exact sidecar and article — nothing to redo. */
const isUpToDate = (sidecar, articleHash) =>
  sidecar.triage?.version === TRIAGE_VERSION &&
  sidecar.triage.articleHash === articleHash &&
  sidecar.triage.questionsHash === hashQuestions(sidecar.questions);

// ── Judge ────────────────────────────────────────────────────────────────────

function buildUserPrompt({ title, headings, body, questions }) {
  const headingList = [
    `${INTRO} — (introduction / the article as a whole)`,
    ...headings.map((h) => `${h.anchor} — ${h.text}`),
  ].join("\n");
  const questionList = questions.map((q, i) => `${i}: ${q.question}`).join("\n");
  const boundedBody =
    body.length > MAX_BODY_CHARS ? body.slice(0, MAX_BODY_CHARS) + "\n[…]" : body;

  return `Title: ${title}

Headings (id — text):
${headingList}

Questions:
${questionList}

Article:
${boundedBody}

Return one verdict per question, indices 0 to ${questions.length - 1}.`;
}

async function callJudge(userPrompt, headingIds) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: responseSchema(headingIds),
        // Lowest variance the model offers. It does not make verdicts reproducible — the
        // stamp does — but it keeps a --force rerun close to the first one.
        options: { temperature: 0, seed: 42 },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });
  } catch (err) {
    throw new Error(
      `Could not reach Ollama at ${OLLAMA_URL} (is it running? set OLLAMA_URL to override): ${err.message}`,
      { cause: err },
    );
  }
  if (!res.ok) throw new Error(`Ollama returned HTTP ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return json.message?.content ?? "";
}

/**
 * One verdict per question, or an error. A partial answer is refused outright rather than
 * applied to the questions it happens to cover: a missing verdict is not a "keep".
 */
function toVerdicts(raw, count, headingIds) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`judge response is not valid JSON:\n${raw.slice(0, 500)}`);
  }
  const known = new Set(headingIds);
  const byIndex = new Map();
  for (const v of parsed?.verdicts ?? []) {
    if (!Number.isInteger(v?.index) || v.index < 0 || v.index >= count) continue;
    if (typeof v.answered !== "boolean") continue;
    byIndex.set(v.index, {
      answered: v.answered,
      // The schema's enum already constrains it; an unknown id still falls back to "no move".
      heading: known.has(v.heading) ? v.heading : null,
      reason: typeof v.reason === "string" ? v.reason.trim() : "",
    });
  }
  if (byIndex.size !== count) {
    throw new Error(
      `judge returned ${byIndex.size} usable verdict(s) for ${count} question(s)`,
    );
  }
  return [...Array(count).keys()].map((i) => byIndex.get(i));
}

// ── Duplicates (no model) ────────────────────────────────────────────────────

/**
 * Port of `tokenize()` in src/components/AskMyBlog/utils.ts — the tokenizer the site's BM25
 * search applies to every question. Keep the two identical: a duplicate is defined as "adds no
 * term that search would see", so it must see terms exactly as the search does.
 */
function tokenize(text) {
  const folded = text.normalize("NFD").replace(/\p{M}/gu, "");
  const withBoundaries = folded.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2");
  const split = withBoundaries.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const whole = folded.toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  return [...new Set([...split, ...whole])];
}

// Words that carry no search intent. Ask my blog ranks with BM25, where these get a low IDF
// anyway; removing them here only stops "how to X" and "X" from looking different.
const STOPWORDS = new Set(
  (
    "a an and are as at be by can do does for from how i if in is it my of on or so the " +
    "this to what when where which why with without you your " +
    "au aux avec ce ces comment dans de des du en est et il je la le les l d mes mon ne " +
    "ou par pas pour qu que quel quelle qui sans se sur un une vos votre"
  ).split(" "),
);

/** The terms a question contributes to the search — the site's own tokenizer, minus stopwords. */
const termsOf = (text) =>
  new Set(tokenize(text).filter((token) => !STOPWORDS.has(token)));

/**
 * The earlier kept question this one duplicates, or null. The site matches lexically, so a
 * question earns its place by the terms it adds: one that brings no term the earlier question
 * lacks catches no search that one does not already catch. Rewordings with a new key term
 * ("repli" next to "folding") are kept — reaching readers who use other words is the point.
 */
function duplicateOf(question, kept) {
  const terms = termsOf(question);
  if (terms.size === 0) return null;
  return (
    kept.find((earlier) => {
      const earlierTerms = termsOf(earlier.question);
      return [...terms].every((term) => earlierTerms.has(term));
    }) ?? null
  );
}

/** Applies verdicts in question order, then drops what adds no search term. */
function applyVerdicts(questions, verdicts) {
  const kept = [];
  const rejected = [];
  const moves = []; // { question, from, to } — printed, so a wrong move is visible
  const date = new Date().toISOString().slice(0, 10);

  questions.forEach((q, i) => {
    const v = verdicts[i];
    if (!v.answered) {
      rejected.push({
        ...q,
        reason: `not answered: ${v.reason || "(no reason given)"}`,
        date,
      });
      return;
    }
    const original = duplicateOf(q.question, kept);
    if (original) {
      rejected.push({ ...q, reason: `duplicate of: ${original.question}`, date });
      return;
    }
    const next = { ...q };
    // Never demoted to the introduction: a specific anchor is kept over "".
    if (v.heading && v.heading !== INTRO && v.heading !== (q.anchor ?? "")) {
      moves.push({ question: q.question, from: q.anchor || INTRO, to: v.heading });
      next.anchor = v.heading;
    }
    kept.push(next);
  });

  return { kept, rejected, moves };
}

// ── Corpus ───────────────────────────────────────────────────────────────────

function corpusDir(locale) {
  return locale === DEFAULT_LOCALE
    ? path.join(projectRoot, "blog")
    : path.join(projectRoot, "i18n", locale, I18N_BLOG_DIR);
}

/** A file, a folder (every article below it) or nothing (the whole locale corpus). */
function resolveTargets(target, locale) {
  const abs = target ? path.resolve(projectRoot, target) : corpusDir(locale);
  if (!fs.existsSync(abs)) throw new Error(`not found: ${target}`);
  if (fs.statSync(abs).isFile()) return [abs];
  return findPosts(abs).sort();
}

/**
 * The folder `./files/…` resolves against. A translation's assets are never copied under
 * i18n/ (remark-i18n-assets serves them from the English article), so for a translated
 * article that is its English counterpart's folder.
 */
function assetDirOf(file) {
  const relDir = path.relative(projectRoot, path.dirname(file)).split(path.sep);
  if (relDir[0] === "i18n" && relDir[2] === I18N_BLOG_DIR) {
    return path.join(projectRoot, "blog", ...relDir.slice(3));
  }
  return path.dirname(file);
}

/**
 * Replaces each `<Snippet source>`/`<Terminal source>` tag by the file it displays. The judge
 * otherwise sees a bare tag where the Dockerfile or the command is, and rules "not answered"
 * on exactly the questions the code answers. A file that cannot be read keeps its tag.
 */
function inlineSnippets(body, file) {
  const assetDir = assetDirOf(file);
  return body.replace(/<(Snippet|Terminal)\b([^>]*?)\/?>/gs, (tag, _name, attrs) => {
    const source = attrs.match(/\bsource\s*=\s*"([^"]*)"/)?.[1];
    if (!source) return tag;
    try {
      const content = fs.readFileSync(
        resolveSourcePath(source, assetDir, projectRoot),
        "utf-8",
      );
      const bounded =
        content.length > MAX_SNIPPET_CHARS
          ? content.slice(0, MAX_SNIPPET_CHARS) + "\n[…]"
          : content;
      return `\n[file ${path.basename(source)}]\n\`\`\`\n${bounded}\n\`\`\`\n`;
    } catch {
      return tag;
    }
  });
}

function loadArticle(file) {
  const raw = fs.readFileSync(file, "utf-8");
  const { data, body } = parseFrontMatter(raw);
  const judged = inlineSnippets(body, file);
  return {
    data,
    body: judged,
    headings: extractHeadings(body),
    // What the judge read, displayed files included: editing one of them re-triages too.
    articleHash: hashSource(raw + judged),
  };
}

function readSidecar(sidecarPath) {
  if (!fs.existsSync(sidecarPath)) return null;
  try {
    const parsed = JSON.parse(fs.readFileSync(sidecarPath, "utf-8"));
    return Array.isArray(parsed.questions) ? parsed : null;
  } catch {
    return null;
  }
}

/** The generator rewrites whole sidecars: two writers on one file would lose one's work. */
function generationRunning() {
  try {
    return execFileSync("pgrep", ["-f", "generate-questions\\.mjs"], {
      encoding: "utf-8",
    })
      .trim()
      .split("\n")
      .filter(Boolean)
      .some((pid) => Number(pid) !== process.pid);
  } catch {
    return false; // pgrep exits 1 when nothing matches
  }
}

// ── Run ──────────────────────────────────────────────────────────────────────

const rel = (file) => path.relative(projectRoot, file);
const counterOf = (i, total) =>
  `${String(i + 1).padStart(String(total).length)}/${total}`;
const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

async function triageOne(file, { force, dryRun }) {
  const sidecarPath = `${file}.questions.json`;
  const sidecar = readSidecar(sidecarPath);
  if (!sidecar) return { status: "no-sidecar" };
  if (sidecar.excluded === true) return { status: "excluded" };
  if (sidecar.reviewed && !force) return { status: "reviewed" };
  if (sidecar.questions.length === 0) return { status: "empty" };

  const article = loadArticle(file);
  if (!force && isUpToDate(sidecar, article.articleHash)) return { status: "up-to-date" };

  const headingIds = [...new Set(article.headings.map((h) => h.anchor))];
  const startedAt = Date.now();
  const raw = await callJudge(
    buildUserPrompt({
      title: article.data.title || "",
      headings: article.headings,
      body: article.body,
      questions: sidecar.questions,
    }),
    headingIds,
  );
  const verdicts = toVerdicts(raw, sidecar.questions.length, headingIds);
  const { kept, rejected, moves } = applyVerdicts(sidecar.questions, verdicts);
  const durationMs = Date.now() - startedAt;

  const held = rejected.length > sidecar.questions.length * MAX_REJECT_RATIO;
  if (!dryRun) {
    if (held) {
      // Questions untouched; the stamp only records that this article needs a human.
      sidecar.triage = stampFor(sidecar, article.articleHash, {
        status: "held",
        wouldReject: rejected.length,
      });
    } else {
      sidecar.questions = kept;
      if (rejected.length > 0)
        sidecar.rejected = [...(sidecar.rejected ?? []), ...rejected];
      sidecar.triage = stampFor(sidecar, article.articleHash, {
        status: "applied",
        rejected: rejected.length,
        anchorsMoved: moves.length,
      });
    }
    writeSidecar(sidecarPath, sidecar);
  }
  return {
    status: held ? "held" : "triaged",
    kept: kept.length,
    rejected,
    moves,
    durationMs,
  };
}

async function runTriage({ target, locale, force, dryRun, limit, pause }) {
  if (!dryRun && generationRunning()) {
    console.error(
      `${C.red}A question generation is running${C.reset} (generate-questions.mjs) — it rewrites ` +
        `whole sidecars, so triaging now could lose either side's work. Wait for it to finish, ` +
        `or preview with --dry-run.`,
    );
    process.exit(1);
  }

  const all = resolveTargets(target, locale);
  const files = typeof limit === "number" ? all.slice(0, limit) : all;
  console.log(
    `${C.bold}Ask my blog — triage${C.reset}  ${files.length} article(s)` +
      `${locale === DEFAULT_LOCALE ? "" : ` (${locale})`}, judge ${OLLAMA_MODEL}` +
      `${dryRun ? `  ${C.yellow}DRY RUN — nothing written${C.reset}` : ""}\n`,
  );

  const counts = {};
  const heldFiles = [];
  let rejectedTotal = 0;
  let anchorsTotal = 0;

  for (const [i, file] of files.entries()) {
    process.stdout.write(`  ${counterOf(i, files.length)} ${rel(file)} ... `);
    let calledOllama = false;
    try {
      const result = await triageOne(file, { force, dryRun });
      counts[result.status] = (counts[result.status] ?? 0) + 1;
      if (result.status === "triaged" || result.status === "held") {
        calledOllama = true;
        const secs = Math.round(result.durationMs / 1000);
        if (result.status === "held") {
          heldFiles.push(file);
          console.log(
            `${C.yellow}held${C.reset} — the judge would reject ${result.rejected.length} ` +
              `of ${result.kept + result.rejected.length} ${C.dim}(${secs} s)${C.reset}`,
          );
        } else {
          rejectedTotal += result.rejected.length;
          anchorsTotal += result.moves.length;
          console.log(
            `${C.green}${result.kept} kept${C.reset}` +
              `${result.rejected.length ? ` · ${C.red}${result.rejected.length} rejected${C.reset}` : ""}` +
              `${result.moves.length ? ` · ${result.moves.length} anchor(s) moved` : ""}` +
              ` ${C.dim}(${secs} s)${C.reset}`,
          );
        }
        for (const r of result.rejected) {
          console.log(
            `      ${C.red}✗${C.reset} ${r.question}  ${C.dim}— ${r.reason}${C.reset}`,
          );
        }
        for (const m of result.moves) {
          console.log(
            `      ${C.cyan}↪${C.reset} ${m.question}  ${C.dim}— ${m.from} → ${m.to}${C.reset}`,
          );
        }
      } else {
        console.log(`${C.dim}${result.status}${C.reset}`);
      }
    } catch (err) {
      counts.error = (counts.error ?? 0) + 1;
      console.log(`${C.red}error${C.reset} ${err.message}`);
    }
    if (pause && calledOllama && i < files.length - 1) await sleep(pause);
  }

  console.log(`\n${"─".repeat(78)}`);
  console.log(
    Object.entries(counts)
      .map(([status, n]) => `${status}: ${n}`)
      .join("  "),
  );
  console.log(
    `${dryRun ? "Would reject" : "Rejected"}: ${rejectedTotal} question(s) · ` +
      `anchors moved: ${anchorsTotal}`,
  );
  if (heldFiles.length > 0) {
    console.log(`\n${C.yellow}Held for a human${C.reset} (questions untouched):`);
    for (const file of heldFiles) console.log(`  questions review ${rel(file)}`);
  }
  if (counts.error) process.exitCode = 1;
}

/** Puts every rejected question back, and re-stamps so the next run does not reject them again. */
function restore(target, locale) {
  const [file] = resolveTargets(target, locale);
  if (!file) throw new Error(`no article under ${target}`);
  const sidecarPath = `${file}.questions.json`;
  const sidecar = readSidecar(sidecarPath);
  if (!sidecar?.rejected?.length) {
    console.log(`Nothing to restore in ${rel(sidecarPath)}.`);
    return;
  }
  const back = sidecar.rejected.map(({ question, anchor }) => ({ question, anchor }));
  sidecar.questions = [...sidecar.questions, ...back];
  delete sidecar.rejected;
  sidecar.triage = stampFor(sidecar, loadArticle(file).articleHash, {
    status: "restored",
  });
  writeSidecar(sidecarPath, sidecar);
  console.log(
    `${C.green}Restored ${back.length} question(s)${C.reset} in ${rel(sidecarPath)}.`,
  );
}

// ── CLI ──────────────────────────────────────────────────────────────────────

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage:
  node scripts/questions-triage.mjs [<path>] [options]
  node scripts/questions-triage.mjs --restore <article-or-folder> [--locale <code>]

<path> is an index.md, a folder (every article below it) or nothing (the whole corpus).

Options:
  --dry-run        Call the judge and print its verdicts, write nothing
  --force          Re-judge articles already triaged, and articles marked reviewed
  --limit <n>      Stop after n articles — try it on a few first
  --pause <sec>    Idle between two judged articles (default: ${DEFAULT_PAUSE_SECONDS}), --pause 0 to disable
  --locale <code>  Triage the translated corpus (e.g. fr)
  --restore        Put an article's rejected questions back

A second run skips every article already triaged, without calling Ollama.
`);
    process.exit(0);
  }

  const valueOf = (flag) => {
    const i = args.indexOf(flag);
    return i === -1 ? undefined : args[i + 1];
  };
  const locale = valueOf("--locale") ?? DEFAULT_LOCALE;
  const valued = new Set(["--locale", "--limit", "--pause", "--restore"]);
  const positional = args.find(
    (a, i) => !a.startsWith("--") && !(i > 0 && valued.has(args[i - 1])),
  );

  try {
    if (args.includes("--restore")) {
      const target = valueOf("--restore");
      if (!target) throw new Error("--restore needs an article or folder");
      restore(target, locale);
    } else {
      const limitRaw = valueOf("--limit");
      const pauseRaw = valueOf("--pause");
      const pause = pauseRaw === undefined ? DEFAULT_PAUSE_SECONDS : Number(pauseRaw);
      if (!Number.isFinite(pause) || pause < 0)
        throw new Error(`--pause needs seconds, got "${pauseRaw}"`);
      await runTriage({
        target: positional,
        locale,
        force: args.includes("--force"),
        dryRun: args.includes("--dry-run"),
        limit: limitRaw === undefined ? undefined : parseInt(limitRaw, 10),
        pause,
      });
    }
  } catch (err) {
    console.error(`${C.red}Error:${C.reset} ${err.message}`);
    process.exit(1);
  }
}
