// Semantic lookups against the local AnythingLLM workspaces — vector search only, no LLM call.
//
// `ai-index` / `ai-index-fr` (.scripts/anythingllm-index.sh) embed every published article into
// one workspace per locale. `/api/v1/workspace/<slug>/vector-search` then answers "which
// articles are closest in meaning to this text?" in about 0.1 s, without waking a chat model:
// it only embeds the query. That is what the tooling here needs — a ranking, not a prose answer.
//
// Everything built on this is an optional hint. The instance runs on the author's host, so it is
// absent in CI and whenever the container is stopped; `connect()` then returns null and every
// caller must keep working exactly as it did before this module existed.
//
// Results come back per chunk (an article is split into ~400-token pieces), so they are folded
// here into one entry per article, keeping its best chunk's score. `docSource` is the
// repo-relative path the indexer uploaded with each file (blog/…/index.md, or the i18n/ mirror
// for a translated workspace), which is what lets a hit be matched back to a file on disk.

import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { stripCodeFences, toProse } from "./blog-corpus.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..");

const DEFAULT_LOCALE = "en";
const PING_TIMEOUT_MS = 1500;
// The first query after a while also loads the embedding model into Ollama — measured at
// ~14 s cold, ~0.1 s warm. The timeout has to cover the cold case.
const SEARCH_TIMEOUT_MS = 30000;
// Chunks, not articles: a long article can fill the top of the list on its own, so ask for
// enough chunks that folding them still leaves a useful number of distinct articles.
const CHUNKS_PER_QUERY = 40;

/** Same resolution order as the shell scripts: the environment first, then the gitignored .env. */
function readConfig() {
  let url = process.env.ANYTHINGLLM_URL || "";
  let apiKey = process.env.ANYTHINGLLM_API_KEY || "";

  const envFile = path.join(projectRoot, ".env");
  if ((!url || !apiKey) && fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
      const match = line.match(/^(ANYTHINGLLM_URL|ANYTHINGLLM_API_KEY)=(.*)$/);
      if (!match) continue;
      const value = match[2].trim().replace(/^["']|["']$/g, "");
      if (match[1] === "ANYTHINGLLM_URL" && !url) url = value;
      if (match[1] === "ANYTHINGLLM_API_KEY" && !apiKey) apiKey = value;
    }
  }

  return { url: url.replace(/\/+$/, ""), apiKey };
}

/** One workspace per locale — mixing two languages in one vector space degrades both. */
export function workspaceFor(locale = DEFAULT_LOCALE) {
  return locale === DEFAULT_LOCALE ? "blog" : `blog-${locale}`;
}

function stateFileFor(locale = DEFAULT_LOCALE) {
  return path.join(
    projectRoot,
    locale === DEFAULT_LOCALE ? ".anythingllm-indexed" : `.anythingllm-indexed-${locale}`,
  );
}

async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** The indexer's state file as `[hash, path, location]` rows ([] when never indexed). */
function readState(locale) {
  const stateFile = stateFileFor(locale);
  if (!fs.existsSync(stateFile)) return [];
  return fs
    .readFileSync(stateFile, "utf-8")
    .split("\n")
    .filter(Boolean)
    .map((line) => line.split("\t"));
}

/**
 * Tells, for one article, whether the workspace holds its current text: "fresh", "stale"
 * (edited since `ai-index` last ran) or "missing" (never indexed). Read from the indexer's own
 * state file, so it costs no request. A missing article matters: every question about it would
 * otherwise look "generic", since its own document can never rank first.
 */
export function indexStatus(file, locale = DEFAULT_LOCALE) {
  const rel = path.relative(projectRoot, path.resolve(projectRoot, file));
  const row = readState(locale).find(([, source]) => source === rel);
  if (!row) return "missing";

  const hash = createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  return row[0] === hash ? "fresh" : "stale";
}

/**
 * Returns a client bound to one locale's workspace, or null when AnythingLLM is not usable
 * (no key, not running, CI). `reason` explains a null, for a caller that wants to say why.
 *
 * `ANYTHINGLLM_DISABLE=1` forces null — handy to compare a tool's output with and without.
 */
export async function connect({ locale = DEFAULT_LOCALE } = {}) {
  if (process.env.CI || process.env.ANYTHINGLLM_DISABLE === "1") {
    return { client: null, reason: "disabled" };
  }

  const { url, apiKey } = readConfig();
  if (!url || !apiKey) {
    return { client: null, reason: "ANYTHINGLLM_URL / ANYTHINGLLM_API_KEY not set" };
  }

  try {
    const res = await fetchWithTimeout(`${url}/api/ping`, {}, PING_TIMEOUT_MS);
    if (!res.ok) return { client: null, reason: `ping returned HTTP ${res.status}` };
  } catch {
    return { client: null, reason: `no AnythingLLM answering at ${url}` };
  }

  const workspace = workspaceFor(locale);

  // Some documents carry no `docSource` (the API returns "a text file uploaded by the user."
  // instead — seen on 2 of 257 English articles). Their upload filename is still the slug, and
  // the state file's document location starts with it: `custom-documents/<slug>.md-<uuid>.json`.
  const pathBySlug = new Map(
    readState(locale).map(([, source, location = ""]) => [
      path.basename(location).replace(/\.mdx?-[^/]*$/, ""),
      source,
    ]),
  );

  /**
   * The articles closest in meaning to `query`, best first, one entry per article:
   * `{ source, slug, title, score }` — `source` is the repo-relative path, `score` a cosine
   * similarity (higher is closer; on this corpus ~0.55 is noise, ~0.75+ a clear match).
   */
  async function search(query, { top = 10 } = {}) {
    const res = await fetchWithTimeout(
      `${url}/api/v1/workspace/${workspace}/vector-search`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, topN: CHUNKS_PER_QUERY }),
      },
      SEARCH_TIMEOUT_MS,
    );
    if (!res.ok) {
      throw new Error(`AnythingLLM vector-search returned HTTP ${res.status}`);
    }

    const { results = [] } = await res.json();
    const byArticle = new Map();
    for (const hit of results) {
      const meta = hit.metadata ?? {};
      const slug = path.basename(meta.url || "", ".md");
      const source = /\.mdx?$/.test(meta.docSource ?? "")
        ? meta.docSource
        : pathBySlug.get(slug);
      if (!source || byArticle.has(source)) continue; // results are sorted: first is best
      byArticle.set(source, {
        source,
        slug,
        title: (meta.title || "").replace(/ \(published [^)]*\)$/, ""),
        score: hit.score,
      });
    }
    return [...byArticle.values()].slice(0, top);
  }

  return { client: { workspace, search }, reason: null };
}

// How much of each section goes into its query. The embedder's context is ~400 tokens, and a
// heading plus its opening paragraph is what says what the section is about.
const SECTION_QUERY_CHARS = 600;
const MAX_SECTION_QUERIES = 15;

/**
 * An article cut into the texts to search with: its title + description, then one query per
 * `##`/`###` section (heading + the start of its prose). Searching section by section is what
 * finds a target that only one part of the article relates to — and names that part, which is
 * where a link to it belongs.
 */
function articleQueries({ title, description = "", body = "" }) {
  const queries = [{ section: null, text: `${title}. ${description}`.trim() }];

  let current = null;
  const flush = () => {
    if (!current) return;
    const prose = toProse(current.lines.join("\n")).replace(/\s+/g, " ").trim();
    queries.push({
      section: current.heading,
      text: `${current.heading}. ${prose}`.slice(0, SECTION_QUERY_CHARS),
    });
  };
  for (const line of stripCodeFences(body)) {
    const heading = line.match(/^#{2,3}\s+(.*?)\s*(?:\{#[^}]*\})?$/);
    if (heading) {
      flush();
      current = { heading: heading[1], lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  flush();

  return queries.slice(0, MAX_SECTION_QUERIES + 1);
}

// A target an article's query does not return at all still has some similarity to it, just
// below what the search reported. Counting it as 0 would let one absent section sink an
// otherwise close article; this is roughly the score of an unrelated article on this corpus.
const NOISE_FLOOR = 0.55;

/**
 * Articles close in meaning to a whole article, best first:
 * `{ source, slug, title, score, section }`.
 *
 * `score` is the MEAN similarity over every query (title + each section), not the best one:
 * measured on 4 articles (2026-09-23), the best-single-query ranking was flooded by articles
 * that shared one boilerplate section ("Step 1 - Adding the default action" pulled in five
 * unrelated Docker posts for makefile-help), while the mean kept the real neighbours on top.
 * On this corpus ≥ 0.65 is a genuine neighbour and ~0.58-0.60 is noise.
 *
 * `section` is the heading whose query came closest to the target (null: the article as a
 * whole) — the natural place for a link to it. `exclude` holds repo-relative paths to leave
 * out, the article itself first of all.
 */
export async function relatedToArticle(client, article, { top = 10, exclude = [] } = {}) {
  const skip = new Set(exclude);
  const queries = articleQueries(article);
  const results = await Promise.all(
    queries.map((query) => client.search(query.text, { top: 20 })),
  );

  const byTarget = new Map();
  results.forEach((hits, i) => {
    for (const hit of hits) {
      if (skip.has(hit.source)) continue;
      const entry = byTarget.get(hit.source) ?? {
        ...hit,
        scores: Array(queries.length).fill(NOISE_FLOOR),
      };
      entry.scores[i] = hit.score;
      byTarget.set(hit.source, entry);
    }
  });

  return [...byTarget.values()]
    .map(({ scores, ...hit }) => {
      const best = scores.indexOf(Math.max(...scores));
      return {
        ...hit,
        score: scores.reduce((sum, value) => sum + value, 0) / scores.length,
        section: queries[best].section,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, top);
}
