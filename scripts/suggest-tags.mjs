#!/usr/bin/env node
/**
 * Suggests `tags.yml` entries for one article, via a local Ollama model.
 *
 * Reads the article's frontmatter (title, description, tags already set) and the full
 * `blog/tags.yml` catalogue, asks Ollama which existing tags fit, and prints a report to
 * the terminal: tags already present get confirmed, up to 5 missing-but-relevant tags get
 * suggested with a one-line reason. Suggestion only — this never writes to the article.
 *
 * Usage:
 *   node scripts/suggest-tags.mjs <article-file>
 *
 * Requires a local Ollama instance — see OLLAMA_URL below. No API key: this never leaves
 * the author's machine (or, in the devcontainer, the host it runs on).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { parseFrontMatter, toProse } from "./lib/blog-corpus.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Same devcontainer-to-host bridge as scripts/generate-questions.mjs.
const OLLAMA_URL = process.env.OLLAMA_URL || "http://172.17.0.1:11434";
// Deciding "does this article substantively cover topic X" against a ~40-tag catalogue is a
// classification/reasoning task, not the light extraction generate-questions.mjs uses
// task-tiny (3B) for — verified manually: task-tiny and qwen2.5-coder:3b both anchor on the
// tags already set and almost never surface a real gap (e.g. missed "python"/"docker" on an
// article with a Dockerfile, compose.yaml and two .py scripts in it). qwen3-coder:30b catches
// those at ~5s/run, which is fine for a single on-demand article, not a corpus-wide bulk job.
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3-coder:30b";

const MAX_SUGGESTIONS = 5;
// Bounding the prose keeps the prompt small and fast — title/description/existing tags
// already carry most of the signal a 3B model needs to classify against a fixed tag list.
const MAX_PROSE_CHARS = 4000;

// Kept deliberately simple: a nested {slug, reason} schema and a bulleted "slug: label —
// description" catalogue made the local 3B model return an empty array more often than not
// (verified manually against Ollama). A flat string array plus a plain "slug: description"
// catalogue is what actually gets reliable, non-empty results out of task-tiny.
const SYSTEM_PROMPT = `You are tagging a technical blog article for a static site.`;

const RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    tags: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["tags"],
};

function loadTagCatalogue() {
  const raw = fs.readFileSync(path.join(projectRoot, "blog", "tags.yml"), "utf-8");
  return yaml.load(raw);
}

function buildUserPrompt({ title, description, existingTags, prose, catalogue }) {
  const catalogueList = Object.entries(catalogue)
    .map(([slug, meta]) => `${slug}: ${meta.description}`)
    .join("\n");

  const boundedProse =
    prose.length > MAX_PROSE_CHARS ? prose.slice(0, MAX_PROSE_CHARS) + " […]" : prose;

  return `Article title: ${title}
Article description: ${description}
Tags already set by the author: ${existingTags.join(", ") || "(none)"}

Tag catalogue (slug: description):
${catalogueList}

Article body excerpt:
${boundedProse}

Return the slugs of every tag from the catalogue above that this article substantively
covers, whether or not the author already set it. Prefer precision over recall: when
unsure, leave the tag out.`;
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
        options: { temperature: 0.2 },
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

function toValidatedTags(raw, catalogue) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error(`Model response is not valid JSON:\n${raw}`);
  }

  if (!parsed || !Array.isArray(parsed.tags)) {
    throw new Error(`Model response is missing a "tags" array:\n${raw}`);
  }

  const seen = new Set();
  const tags = [];

  for (const rawSlug of parsed.tags) {
    if (typeof rawSlug !== "string") continue;
    const slug = rawSlug.trim().toLowerCase();
    // A model hallucinating a slug outside the catalogue is a malformed item, not a
    // suggestion — silently keeping it would recommend a tag that doesn't exist.
    if (!catalogue[slug] || seen.has(slug)) continue;
    seen.add(slug);
    // The reason shown to the user is the catalogue's own human-authored description,
    // not model-generated text — reliable, and one field the schema doesn't need to carry.
    tags.push({ slug, reason: catalogue[slug].description });
  }

  return tags;
}

export async function suggestTags(articleFile) {
  const absSource = path.resolve(articleFile);

  if (!fs.existsSync(absSource)) {
    throw new Error(`Article not found: ${absSource}`);
  }

  const raw = fs.readFileSync(absSource, "utf-8");
  const { data, body } = parseFrontMatter(raw);

  if (!data.title) {
    throw new Error(`${path.relative(projectRoot, absSource)} has no frontmatter title.`);
  }

  const catalogue = loadTagCatalogue();
  const existingTags = Array.isArray(data.tags) ? data.tags : [];
  const prose = toProse(body);

  const userPrompt = buildUserPrompt({
    title: data.title,
    description: data.description || "",
    existingTags,
    prose,
    catalogue,
  });

  const modelRaw = await callOllama(userPrompt);
  const applicable = toValidatedTags(modelRaw, catalogue);

  const confirmed = applicable.filter((t) => existingTags.includes(t.slug));
  const missing = applicable
    .filter((t) => !existingTags.includes(t.slug))
    .slice(0, MAX_SUGGESTIONS);
  const unrecognized = existingTags.filter(
    (slug) => !applicable.some((t) => t.slug === slug),
  );

  return { existingTags, confirmed, missing, unrecognized };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

const _isMain = process.argv[1] === fileURLToPath(import.meta.url);

if (_isMain) {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: node scripts/suggest-tags.mjs <article-file>

Suggestion only — never writes to the article. Prints:
  - tags already set that the model confirms as relevant
  - up to ${MAX_SUGGESTIONS} relevant tags missing from the frontmatter
  - tags already set that the model did not find supported by the content

Environment:
  OLLAMA_URL    Ollama endpoint (default: http://172.17.0.1:11434 — the devcontainer's
                bridge to the host)
  OLLAMA_MODEL  Model name (default: task-tiny:latest)
`);
    process.exit(0);
  }

  const articleFile = args[0];

  suggestTags(articleFile)
    .then(({ existingTags, confirmed, missing, unrecognized }) => {
      console.log(
        `\n🏷️  Tag suggestions for ${path.relative(projectRoot, articleFile)}\n`,
      );

      console.log(`Existing tags: ${existingTags.join(", ") || "(none)"}`);

      if (confirmed.length > 0) {
        console.log(`\n✅ Confirmed:`);
        for (const t of confirmed) console.log(`   - ${t.slug} — ${t.reason}`);
      }

      if (missing.length > 0) {
        console.log(`\n➕ Suggested additions:`);
        for (const t of missing) console.log(`   - ${t.slug} — ${t.reason}`);
      } else {
        console.log(`\n➕ Suggested additions: none.`);
      }

      if (unrecognized.length > 0) {
        console.log(`\n⚠️  Set but not supported by the content (review manually):`);
        for (const slug of unrecognized) console.log(`   - ${slug}`);
      }

      console.log("");
    })
    .catch((err) => {
      console.error("❌ Error:", err.message);
      process.exit(1);
    });
}
