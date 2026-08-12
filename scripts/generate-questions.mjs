#!/usr/bin/env node
/**
 * "Ask my blog" question generation — see .todos/0083-ask-my-blog-question-index.md.
 *
 * For one article (or, with --all, every published article under blog/), asks a local
 * Ollama model to write 8-12 search questions a developer would actually type into a search
 * bar for the problem this article solves, each mapped to the `##`/`###` heading that answers
 * it. Writes `<article>.questions.json` alongside the article — same convention as the
 * existing `.eli5.json` sidecar files (see scripts/lib/eli5-hash.mjs).
 *
 * The semantic work happens once, at build time, on the author's machine — not in every
 * reader's browser. See the TODO's "Ce qu'on ne fait pas, et pourquoi" section for why
 * client-side embeddings were rejected in favor of this precompute-then-lexical-match design.
 *
 * Usage:
 *   node scripts/generate-questions.mjs <article-file> [--force] [--output <path>]
 *   node scripts/generate-questions.mjs --all [--force] [--dir blog/] [--limit N] [--dry-run]
 *
 * Requires a local Ollama instance — see OLLAMA_URL below. No API key: this never leaves the
 * author's machine (or, in the devcontainer, the host it runs on).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import GithubSlugger from "github-slugger";
import { hashSource } from "./lib/eli5-hash.mjs";
import {
  findPosts,
  parseFrontMatter,
  stripCodeFences,
  toProse,
} from "./lib/blog-corpus.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// The devcontainer reaches the host's Ollama through the Docker bridge gateway — same
// address this project's other host-side tooling (AnythingLLM) already uses. Override with
// OLLAMA_URL when running outside the devcontainer (e.g. `http://localhost:11434`).
const OLLAMA_URL = process.env.OLLAMA_URL || "http://172.17.0.1:11434";
// task-tiny is a 3B instruct model — plenty for extraction, not reasoning (see the TODO's
// rationale), and fast enough to keep a 248-article bulk run to the ~45 min the TODO budgets.
// Larger local models produced no better questions in manual comparison but ran ~10x slower.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "task-tiny:latest";

const MIN_QUESTIONS = 8;
const MAX_QUESTIONS = 12;
// A response can drop a few items to validation (bad index, empty text) without being
// considered malformed. Below this, something is wrong with the prompt/model for this
// article and the whole article must fail rather than ship a thin, low-value entry.
const MIN_VALID_QUESTIONS = 5;

const SYSTEM_PROMPT = `You are helping build a search index for a technical blog. Given an
article's title, description, tags, and section headings, write search questions a developer
would actually type into a search bar when they have the problem this article solves — using
their own vocabulary, which may differ from the article's wording.

Rules:
- 8 to 12 questions, in English.
- Every question must be SPECIFIC to this article's actual content — never generic
  ("What is Docker?", "How does Markdown work?").
- Vary the phrasing style: some short keyword-style queries, some full questions.
- Each question maps to exactly one heading by index. Index 0 means "the article as a whole /
  introduction", not tied to a specific heading.
- Do not invent facts not supported by the material given.
- Every question must be meaningfully different from every other one — no two questions may
  ask the same thing with swapped words (e.g. "convert CSV to Markdown" and "convert Markdown
  to CSV" are different; "how to convert CSV to Markdown" and "convert CSV to Markdown" are
  NOT — pick one).`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      minItems: MIN_QUESTIONS,
      maxItems: MAX_QUESTIONS,
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          headingIndex: { type: "integer" },
        },
        required: ["question", "headingIndex"],
      },
    },
  },
  required: ["questions"],
};

/**
 * Strips the inline formatting a heading may carry before it becomes an anchor/prompt text.
 * Resolves each construct to its inner text (bold/italic/code/link label) rather than
 * dropping it — this must match Docusaurus's own remark-slug algorithm, which keeps a code
 * span's text as part of the heading it slugs. Deliberately NOT toProse() from blog-corpus.mjs:
 * that helper is built for prose/search extraction, where blanking out code spans as "not real
 * prose" is correct — but doing the same here produced anchors Docusaurus never generates
 * (e.g. "## What `ai-test` Does For You" slugged to "what---does-for-you" instead of
 * "what-ai-test-does-for-you"), breaking every link built from it.
 */
function cleanHeadingText(text) {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
}

/**
 * Collects `##`/`###` headings in document order, resolving each to the anchor slug
 * Docusaurus would generate for it (github-slugger — same package Docusaurus's own MDX
 * pipeline uses), honoring an explicit `{#custom-id}` override when present.
 */
function extractHeadings(body) {
  const slugger = new GithubSlugger();
  const headings = [];

  for (const line of stripCodeFences(body)) {
    const match = line.match(/^(#{2,3})\s+(.*?)\s*(?:\{#([a-zA-Z0-9-_]+)\})?$/);
    if (!match) continue;

    const [, hashes, rawText, customId] = match;
    const text = cleanHeadingText(rawText);
    if (!text) continue;

    const anchor = customId || slugger.slug(text);
    headings.push({ level: hashes.length, text, anchor });
  }

  return headings;
}

function buildUserPrompt({ title, description, tags, headings, prose }) {
  const headingsList = [
    "0: (general / introduction — not tied to a specific heading)",
    ...headings.map((h, i) => `${i + 1}: ${h.text}`),
  ].join("\n");

  // Bounding the prose keeps prompts (and generation time) predictable across the corpus —
  // title/description/headings already carry most of the signal a 3B model needs.
  const MAX_PROSE_CHARS = 4000;
  const boundedProse =
    prose.length > MAX_PROSE_CHARS ? prose.slice(0, MAX_PROSE_CHARS) + " […]" : prose;

  return `Title: ${title}
Description: ${description}
Tags: ${tags.join(", ") || "(none)"}

Headings:
${headingsList}

Article body (for context only — do not quote it verbatim):
${boundedProse}

Write the search questions now.`;
}

async function callOllama(userPrompt) {
  let res;
  try {
    res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        format: RESPONSE_SCHEMA,
        options: { temperature: 0.4 },
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

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Ollama returned HTTP ${res.status}: ${body}`);
  }

  const json = await res.json();
  return json.message?.content ?? "";
}

/** Validates and normalizes the model's raw output into `{ question, anchor }` entries. */
function toValidatedQuestions(raw, headings) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Model response is not valid JSON:\n${raw}`);
  }

  if (!parsed || !Array.isArray(parsed.questions)) {
    throw new Error(`Model response is missing a "questions" array:\n${raw}`);
  }

  const seen = new Set();
  const questions = [];

  for (const item of parsed.questions) {
    if (!item || typeof item.question !== "string" || !item.question.trim()) continue;
    if (!Number.isInteger(item.headingIndex)) continue;

    const question = item.question.trim();
    const dedupeKey = question
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    // A small model miscounting the heading list is a wrong index on an otherwise good,
    // specific question — worth keeping by falling back to "general" (anchor "") rather than
    // discarding it outright. Only a genuinely broken shape (missing text, non-integer index)
    // drops the item entirely, per the "malformed must fail, not silently degrade" rule.
    const inRange = item.headingIndex >= 1 && item.headingIndex <= headings.length;
    const anchor = inRange ? headings[item.headingIndex - 1].anchor : "";
    questions.push({ question, anchor });
  }

  if (questions.length < MIN_VALID_QUESTIONS) {
    throw new Error(
      `Only ${questions.length} valid question(s) survived validation (need >= ${MIN_VALID_QUESTIONS}):\n${raw}`,
    );
  }

  return questions;
}

/**
 * Generates (or skips) the `.questions.json` sidecar for one article.
 * `articleFile` is the `index.md`/`index.mdx` path, absolute or repo-relative.
 */
export async function generateQuestions(
  articleFile,
  { force = false, outputPath = null } = {},
) {
  const absSource = path.resolve(articleFile);

  if (!fs.existsSync(absSource)) {
    throw new Error(`Article not found: ${absSource}`);
  }

  const destPath = outputPath || absSource + ".questions.json";

  if (!force && fs.existsSync(destPath)) {
    return { status: "skipped", path: destPath };
  }

  const raw = fs.readFileSync(absSource, "utf-8");
  const { data, body } = parseFrontMatter(raw);

  if (!data.title) {
    throw new Error(`${path.relative(projectRoot, absSource)} has no frontmatter title.`);
  }

  const headings = extractHeadings(body);
  const prose = toProse(body);
  const tags = Array.isArray(data.tags) ? data.tags : [];

  const userPrompt = buildUserPrompt({
    title: data.title,
    description: data.description || "",
    tags,
    headings,
    prose,
  });

  const modelRaw = await callOllama(userPrompt);
  const questions = toValidatedQuestions(modelRaw, headings);

  const result = {
    version: 1,
    model: OLLAMA_MODEL,
    generated: new Date().toISOString(),
    source: path.basename(absSource),
    sourceHash: hashSource(raw),
    questions,
  };

  fs.writeFileSync(destPath, JSON.stringify(result, null, 2) + "\n");
  return { status: "generated", path: destPath, count: questions.length };
}

// ── Bulk mode ────────────────────────────────────────────────────────────────

async function runBulk({ force, dir, limit, dryRun }) {
  // Drafts (blog/ with draft: true, or anything under .unpublished/) aren't public yet — the
  // aggregation plugin already excludes them from the shipped index, but generating sidecars
  // for them here would still burn Ollama time and commit sidecar files for unpublished
  // content. Mirrors the same draft check questions-index-plugin applies at aggregation time.
  const isDraft = (file) => {
    const { data } = parseFrontMatter(fs.readFileSync(file, "utf-8"));
    return data.draft === true || data.draft === "true";
  };
  const posts = findPosts(dir)
    .filter((file) => !isDraft(file))
    .sort();
  const targets = typeof limit === "number" ? posts.slice(0, limit) : posts;

  console.log(
    `🔍 ${targets.length} article(s) under ${path.relative(projectRoot, dir)}${
      typeof limit === "number" ? ` (--limit ${limit})` : ""
    }.`,
  );

  if (dryRun) {
    for (const file of targets) {
      const rel = path.relative(projectRoot, file);
      const exists = fs.existsSync(file + ".questions.json");
      console.log(`  [${exists && !force ? "SKIP" : "GENERATE"}] ${rel}`);
    }
    console.log("\nDry run — nothing written.");
    return;
  }

  let generated = 0,
    skipped = 0,
    errors = 0;

  for (const file of targets) {
    const rel = path.relative(projectRoot, file);
    process.stdout.write(`  📄 ${rel} ... `);
    try {
      const result = await generateQuestions(file, { force });
      if (result.status === "skipped") {
        console.log("⏭  skipped");
        skipped++;
      } else {
        console.log(`✅ ${result.count} questions`);
        generated++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      errors++;
    }
  }

  console.log(`\n──────────────────────────────────────`);
  console.log(`Generated: ${generated}  Skipped: ${skipped}  Errors: ${errors}`);
  if (errors > 0) process.exitCode = 1;
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const { fileURLToPath: _fileURLToPath } = await import("url");
const _isMain = process.argv[1] === _fileURLToPath(import.meta.url);

if (_isMain) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage:
  node scripts/generate-questions.mjs <article-file> [options]
  node scripts/generate-questions.mjs --all [options]

Options:
  --force          Regenerate even if <article>.questions.json already exists
  --output <path>  (single-file mode) write to a custom path
  --all            Process every published article under --dir
  --dir <path>     Directory to scan in --all mode (default: blog/)
  --limit <n>      (--all mode) only process the first n articles — useful for a
                    hand-reviewed pilot batch before a full corpus run
  --dry-run        (--all mode) show what would be generated without calling Ollama
  --help, -h       Show this help

Environment:
  OLLAMA_URL    Ollama endpoint (default: http://172.17.0.1:11434 — the devcontainer's
                bridge to the host)
  OLLAMA_MODEL  Model name (default: task-tiny:latest)
`);
    process.exit(0);
  }

  const force = args.includes("--force");

  if (args.includes("--all")) {
    const dirIdx = args.indexOf("--dir");
    const dir =
      dirIdx !== -1
        ? path.resolve(projectRoot, args[dirIdx + 1])
        : path.resolve(projectRoot, "blog");
    const limitIdx = args.indexOf("--limit");
    const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : undefined;
    const dryRun = args.includes("--dry-run");

    if (!fs.existsSync(dir)) {
      console.error(`Error: directory not found: ${dir}`);
      process.exit(1);
    }

    await runBulk({ force, dir, limit, dryRun });
  } else {
    const outputIdx = args.indexOf("--output");
    const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
    const articleFile = args.find(
      (a, i) => !a.startsWith("--") && !(outputIdx !== -1 && i === outputIdx + 1),
    );

    if (!articleFile) {
      console.error("Error: no article file specified. Run with --help for usage.");
      process.exit(1);
    }

    try {
      const result = await generateQuestions(articleFile, { force, outputPath });
      if (result.status === "skipped") {
        console.log(`⏭  Skipped (already exists): ${path.basename(result.path)}`);
        console.log(`   Use --force to regenerate.`);
      } else {
        console.log(`✅ Written: ${result.path}\n   ${result.count} questions.`);
      }
    } catch (err) {
      console.error("❌ Error:", err.message);
      process.exit(1);
    }
  }
}
