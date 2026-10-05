#!/usr/bin/env node
/**
 * Which published articles are closest in MEANING to a piece of text, or to an article?
 *
 *   node scripts/ai-related.mjs "trivy docker image vulnerability scan"
 *   node scripts/ai-related.mjs --post blog/2024/10/12/linux_history
 *   node scripts/ai-related.mjs --locale fr "scanner une image docker"
 *
 * In the devcontainer: `ai-related …` (helpers/anythingllm.sh).
 *
 * A vector search against the local AnythingLLM workspace (scripts/lib/anythingllm.mjs) — no
 * chat model, no API cost, well under a second once the embedder is loaded. Where `ai-search`
 * asks a model to *answer* from the blog, this only *ranks* it, which is what "have I already
 * written about this?" needs: `/suggestions-add` runs it on every new idea before recording
 * it, next to its keyword grep, because a grep only finds the words the idea happens to use.
 *
 * Text is compared chunk by chunk (best chunk wins); an article is compared section by section
 * and averaged (see `relatedToArticle`) — the two scores are on different scales, so each mode
 * has its own verdict thresholds.
 */

import fs from "fs";
import path from "path";
import { parseFrontMatter } from "./lib/blog-corpus.mjs";
import { connect, relatedToArticle } from "./lib/anythingllm.mjs";

// Free text, best chunk: calibrated on known cases (2026-09-23). Topics already written score
// 0.80-0.84 against their article (makefile help screen, fzf, csv → markdown); pending ideas
// from the suggestions backlog top out at 0.66-0.75, and the ones above 0.70 are real overlaps
// (Gitleaks → the ai-secrets pre-commit check, 0.71; Dozzle → lazydocker, 0.75).
const TEXT_COVERED = 0.78;
const TEXT_RELATED = 0.7;
// Whole article, mean over sections: true neighbours 0.68-0.77, noise 0.58-0.60.
const ARTICLE_RELATED = 0.65;

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage:
  ai-related "<text>"            articles closest in meaning to a topic or an idea
  ai-related --post <article>    articles closest in meaning to one article (path or folder)

Options:
  --top <n>        how many to list (default 8)
  --locale <code>  search the translated workspace (blog-<code>) instead of blog
  --json           machine-readable output

Needs the local AnythingLLM instance and an up-to-date index (ai-index / ai-index-fr).
`);
  process.exit(args.length === 0 ? 1 : 0);
}

const VALUE_FLAGS = new Set(["--top", "--locale", "--post"]);
const flag = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};
const top = Number(flag("--top") ?? 8);
const locale = flag("--locale") ?? "en";
const postArg = flag("--post");
const text = args
  .filter((arg, i) => !arg.startsWith("--") && !VALUE_FLAGS.has(args[i - 1]))
  .join(" ")
  .trim();

if (!postArg && !text) {
  console.error("Error: give a text to search for, or --post <article>.");
  process.exit(1);
}

const { client, reason } = await connect({ locale });
if (!client) {
  console.error(`AnythingLLM is not available: ${reason}.`);
  process.exit(2);
}

let hits;
let verdict;
if (postArg) {
  let file = postArg.replace(/\/+$/, "");
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = fs.existsSync(path.join(file, "index.mdx"))
      ? path.join(file, "index.mdx")
      : path.join(file, "index.md");
  }
  if (!fs.existsSync(file)) {
    console.error(`Error: no such article: ${file}`);
    process.exit(1);
  }
  const { data, body } = parseFrontMatter(fs.readFileSync(file, "utf-8"));
  hits = await relatedToArticle(
    client,
    { title: data.title ?? "", description: data.description ?? "", body },
    { top, exclude: [path.relative(process.cwd(), path.resolve(file))] },
  );
  verdict = (score) => (score >= ARTICLE_RELATED ? "related" : "");
} else {
  hits = await client.search(text, { top });
  verdict = (score) =>
    score >= TEXT_COVERED ? "COVERED?" : score >= TEXT_RELATED ? "related" : "";
}

if (args.includes("--json")) {
  console.log(
    JSON.stringify(hits.map((hit) => ({ ...hit, verdict: verdict(hit.score) }))),
  );
  process.exit(0);
}

const C = { reset: "\x1b[0m", dim: "\x1b[2m", red: "\x1b[1;31m", yellow: "\x1b[1;33m" };
console.log(
  `\n${C.dim}Closest in meaning to ${postArg ? postArg : `"${text}"`} — AnythingLLM '${client.workspace}'${C.reset}\n`,
);
for (const hit of hits) {
  const label = verdict(hit.score);
  const color = label === "COVERED?" ? C.red : label ? C.yellow : C.dim;
  console.log(
    `  ${color}${hit.score.toFixed(2)} ${label.padEnd(8)}${C.reset} ${hit.title}\n` +
      `  ${C.dim}              ${hit.source}${hit.section ? ` · closest part: "${hit.section}"` : ""}${C.reset}`,
  );
}
console.log(
  `\n${C.dim}${
    postArg
      ? `related: mean similarity ≥ ${ARTICLE_RELATED}`
      : `COVERED?: ≥ ${TEXT_COVERED}, likely already written · related: ≥ ${TEXT_RELATED}, overlaps`
  } — a hint, read the article before deciding.${C.reset}\n`,
);
