#!/usr/bin/env node
/**
 * Generate "Explain Like I'm Five" annotations for a source file.
 *
 * Usage:
 *   node scripts/generate-eli5.mjs <source-file> [--force] [--output <path>] [--locale <code>]
 *   node scripts/generate-eli5.mjs --locale fr --articles <article-path>... [--dry-run]
 *
 * Reads ANTHROPIC_API_KEY from process.env or a .env file at the project root.
 * Writes <source-file>.eli5.json alongside the source file (or to --output path).
 *
 * With --locale (TODO 0121), the output language changes but THE INPUT DOES NOT: an ELI5
 * describes code, and the code is identical in every locale. There is no "generate from the
 * translated article" here — that is the shape of the sibling question index (TODO 0120),
 * which describes prose. The localized sidecar is written next to the code it explains, as
 * `<source>.eli5.<locale>.json`, because `files/` is never duplicated under `i18n/`
 * (plugins/remark-i18n-assets).
 *
 * --articles is the batch `translate` calls once an article is translated: it asks
 * `scripts/lib/i18n-eligibility.mjs` which of that article's snippets are eligible, and never
 * re-derives the three conditions itself. With --dry-run it constructs no client and spends
 * nothing, which is what makes the cost quotable before the confirmation prompt.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import { hashSource } from "./lib/eli5-hash.mjs";
import { cmd } from "./lib/cheatsheet-hint.mjs";
import {
  ELI5_COST_PER_FILE,
  articleKeyOf,
  eli5Candidates,
} from "./lib/i18n-eligibility.mjs";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env from project root (best-effort)
try {
  const dotenv = require("dotenv");
  // quiet: dotenv's banner goes to stdout, which would corrupt the single "<count>\t<cost>"
  // line that --porcelain promises to the shell.
  dotenv.config({ path: path.join(projectRoot, ".env"), quiet: true });
} catch {
  // dotenv not available — rely on environment variables already set
}

/**
 * Escapes the backslashes that do not start a valid JSON escape sequence.
 *
 * A snippet whose CODE contains a regex makes the model quote that regex back inside its
 * explanation, and `~* \.(?:css|js)$` carries a `\.` — a perfectly good regex, an invalid JSON
 * escape, "Bad escaped character in JSON". It cost the nginx.conf annotation of
 * `running-docusaurus-with-docker` two full runs before the cause was clear, because the
 * fenced-response fallback looks like it should already have handled a malformed answer.
 *
 * Safe to run over the whole document: in JSON a backslash may only ever appear inside a string,
 * so any backslash that is not part of `\" \\ \/ \b \f \n \r \t \uXXXX` is a literal the model
 * failed to escape. Valid escapes are matched first and handed back untouched, `\u` included —
 * doubling those would corrupt the text this is meant to save.
 */
function repairLoneBackslashes(text) {
  return text.replace(/\\(u[0-9a-fA-F]{4}|["\\/bfnrt])|\\/g, (whole, valid) =>
    valid ? whole : "\\\\",
  );
}

// Language detection — mirrors the mapping in remark-snippet-loader
const EXT_TO_LANG = {
  js: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  php: "php",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  css: "css",
  html: "html",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  mdx: "markdown",
  dockerfile: "docker",
  ini: "ini",
  sql: "sql",
  xml: "xml",
  toml: "toml",
  env: "bash",
  txt: "plaintext",
  ps1: "powershell",
  bat: "batch",
  cmd: "batch",
};

const BASE_NAME_TO_LANG = {
  dockerfile: "docker",
  ".env": "bash",
  ".gitignore": "plaintext",
  ".dockerignore": "plaintext",
  makefile: "makefile",
};

function detectLang(filePath) {
  const baseName = path.basename(filePath).toLowerCase();
  if (BASE_NAME_TO_LANG[baseName]) return BASE_NAME_TO_LANG[baseName];
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return EXT_TO_LANG[ext] || ext || "plaintext";
}

// Output language per locale. `en` carries no extra instruction — it is what the prompt below
// already asks for, and 798 existing sidecars were generated without one.
const LANGUAGES = {
  en: { name: "English", extra: "" },
  fr: {
    name: "French",
    extra: `

Write the "summary" and every value in "explanations" in FRENCH. Keep code
identifiers, file names, commands, flags and option names exactly as they appear
in the source — translate the prose around them, never the code itself. Use the
vouvoiement-free, direct technical register of French developer documentation.`,
  },
};

const systemPromptFor = (
  locale,
) => `You are a patient senior developer explaining code to a junior colleague.
Given a source file with numbered lines, produce two things:

1. "summary": two to four plain sentences narrating what this snippet does
   as a whole and why, the way you'd explain it out loud to someone reading over
   your shoulder — not a recap of individual lines. No jargon unless immediately
   defined.
2. "explanations": for each line a junior developer might find confusing, one or
   two plain sentences. Think "explain like I'm five but I'm also a
   developer". Skip blank lines, closing braces/brackets, import lines that are
   self-evident, comments that already explain themselves, trivially obvious
   assignments.

Return ONLY a valid JSON object shaped exactly like:
{"summary": "...", "explanations": {"3": "...", "7": "..."}}
Keys in "explanations" are line numbers as strings. Omit lines that need no
explanation. No markdown, no code fences.${LANGUAGES[locale].extra}`;

/** Where a locale's sidecar lives. `en` keeps the historical unsuffixed name. */
function sidecarPath(absSource, locale) {
  return locale === "en" ? `${absSource}.eli5.json` : `${absSource}.eli5.${locale}.json`;
}

async function generateEli5(
  sourceFile,
  { force = false, outputPath = null, locale = "en" } = {},
) {
  if (!LANGUAGES[locale]) {
    throw new Error(
      `Unsupported locale "${locale}" (known: ${Object.keys(LANGUAGES).join(", ")}).`,
    );
  }

  const absSource = path.resolve(sourceFile);

  if (!fs.existsSync(absSource)) {
    throw new Error(`Source file not found: ${absSource}`);
  }

  if (fs.statSync(absSource).isDirectory()) {
    throw new Error(
      `"${sourceFile}" is a directory.\n` +
        `  To process an entire directory, use the bulk script instead:\n` +
        `    ${cmd("eli5:bulk", "--dir", sourceFile)}`,
    );
  }

  const destPath = outputPath || sidecarPath(absSource, locale);

  if (!force && fs.existsSync(destPath)) {
    console.log(`⏭  Skipped (already exists): ${path.basename(destPath)}`);
    console.log(`   Use --force to regenerate.`);
    return { skipped: true };
  }

  const code = fs.readFileSync(absSource, "utf-8");
  const lang = detectLang(absSource);
  const lines = code.split("\n");

  // Number the lines for the prompt
  const numberedCode = lines.map((line, i) => `${i + 1}: ${line}`).join("\n");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to your .env file or export it before running this script.",
    );
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const maxTokens = lines.length > 50 ? 2048 : 1024;

  console.log(
    `🤖 Calling Claude for ${path.basename(absSource)} (${lines.length} lines, lang: ${lang}` +
      `${locale === "en" ? "" : `, text: ${locale}`})...`,
  );

  let raw;
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: systemPromptFor(locale),
      messages: [
        {
          role: "user",
          content: `Language: ${lang}\n\n${numberedCode}`,
        },
      ],
    });
    raw = message.content[0].text.trim();
  } catch (err) {
    throw new Error(`Claude API error: ${err.message}`, { cause: err });
  }

  // Parse JSON — strip markdown fences if Claude wrapped it anyway, then repair the one
  // malformation the model produces on its own (see repairLoneBackslashes).
  const candidates = [raw];
  const fenced = raw.match(/\{[\s\S]*\}/);
  if (fenced) candidates.push(fenced[0]);
  candidates.push(...candidates.map(repairLoneBackslashes));

  let parsed;
  for (const candidate of candidates) {
    try {
      parsed = JSON.parse(candidate);
      break;
    } catch {
      // Try the next shape; the throw below reports the original text, never the repaired one.
    }
  }

  if (!parsed) {
    throw new Error(`Could not parse Claude's response as JSON:\n${raw}`);
  }

  const summary =
    typeof parsed.summary === "string" && parsed.summary.trim()
      ? parsed.summary.trim()
      : null;

  // Validate: only keep string values with string-number keys
  const explanations =
    parsed.explanations && typeof parsed.explanations === "object"
      ? parsed.explanations
      : {};
  const cleaned = {};
  for (const [k, v] of Object.entries(explanations)) {
    if (/^\d+$/.test(k) && typeof v === "string" && v.trim()) {
      const lineIdx = parseInt(k, 10) - 1;
      if (lineIdx >= 0 && lineIdx < lines.length) {
        cleaned[k] = v.trim();
      }
    }
  }

  const result = {
    version: 1,
    model: "claude-haiku-4-5-20251001",
    generated: new Date().toISOString(),
    source: path.basename(absSource),
    sourceHash: hashSource(code),
    lang,
    // `lang` is the language of the CODE (yaml, bash); `textLang` the language of the prose.
    // Reusing one key for both senses is the contresens TODO 0121 called out up front.
    textLang: locale,
    summary,
    explanations: cleaned,
  };

  fs.writeFileSync(destPath, JSON.stringify(result, null, 2) + "\n");
  console.log(
    `✅ Written: ${destPath}\n   ${Object.keys(cleaned).length} annotations on ${lines.length} lines, summary: ${summary ? "yes" : "no"}.`,
  );

  return { skipped: false, destPath, count: Object.keys(cleaned).length };
}

/**
 * Generate the localized sidecars of one or more ARTICLES' snippets.
 *
 * What is eligible is decided entirely by `scripts/lib/i18n-eligibility.mjs` — article really
 * translated, English sidecar present, localized one missing or stale. Nothing here re-tests
 * any of that, which is why `--force` has no meaning in this mode: a file the module returned
 * is one that needs writing, and a file it withheld must not be paid for again. That is what
 * makes `translate <path> --force` free of ELI5 charges when the code did not change.
 */
async function runArticleBatch({
  locale,
  articlePaths,
  dryRun,
  porcelain,
  assumeTranslated,
}) {
  if (articlePaths.length === 0) {
    throw new Error("--articles needs at least one article path.");
  }

  const articleKeys = [];
  for (const candidate of articlePaths) {
    const key = articleKeyOf(projectRoot, candidate);
    if (!key) {
      // Not fatal: `translate` may legitimately hand over a path outside blog/ (a page, say),
      // and refusing the whole batch over it would block the articles that are fine.
      if (!porcelain) {
        console.warn(`⚠  Not inside an article folder, ignored: ${candidate}`);
      }
      continue;
    }
    articleKeys.push(key);
  }

  const { eligible } = eli5Candidates(projectRoot, locale, {
    articleKeys,
    assumeTranslated,
  });
  const cost = eligible.length * ELI5_COST_PER_FILE;

  if (porcelain) {
    // One line, two fields — the contract translation.sh reads.
    console.log(`${eligible.length}\t${cost.toFixed(4)}`);
    return;
  }

  if (eligible.length === 0) {
    console.log(`✅ No ELI5 to generate for ${locale} — every snippet is up to date.`);
    return;
  }

  if (dryRun) {
    console.log(
      `🔍 ${eligible.length} ELI5 sidecar(s) would be generated for "${locale}" ≈ $${cost.toFixed(2)}:`,
    );
    eligible.forEach((f) => console.log(`   ${path.relative(projectRoot, f)}`));
    console.log("\nDry run — nothing written, no API call made.");
    return;
  }

  let ok = 0;
  let failed = 0;
  for (const [index, source] of eligible.entries()) {
    const relative = path.relative(projectRoot, source);
    // A plain line, not a trailing `... ` write: generateEli5 logs lines of its own, which
    // would otherwise land mid-sentence.
    console.log(`  [${index + 1}/${eligible.length}] ${relative}`);
    try {
      // force: the eligibility module already decided; a stale localized sidecar must be
      // overwritten, and generateEli5's own "file exists" guard would otherwise skip it.
      await generateEli5(source, { locale, force: true });
      ok++;
    } catch (err) {
      // Soft-fail, like the plugin's own ELI5 handling: a missing annotation degrades to the
      // English one, it never costs the reader the article.
      console.log(`❌ ${err.message}`);
      failed++;
    }
  }

  console.log(`\n🧠 ELI5 ${locale}: ${ok} generated, ${failed} failed.`);
  if (failed > 0) {
    console.log(
      `   Those snippets keep showing their English annotation until regenerated.`,
    );
  }
}

// ── CLI ──────────────────────────────────────────────────────────────────────

// Guard: only run CLI logic when this file is the entry point, not when imported.
const { fileURLToPath: _fileURLToPath } = await import("url");
const _isMain = process.argv[1] === _fileURLToPath(import.meta.url);
if (!_isMain) {
  /* exported as module — skip CLI */
} else {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: node scripts/generate-eli5.mjs <source-file> [options]
       node scripts/generate-eli5.mjs --locale fr --articles <article-path>... [options]

Options:
  --force          Regenerate even if the sidecar already exists
  --locale <code>  Write the explanations in that language, to
                   <source-file>.eli5.<code>.json (known: ${Object.keys(LANGUAGES).join(", ")})
  --articles       Treat the positional arguments as ARTICLES, and generate every
                   eligible snippet sidecar under them (requires --locale)
  --output <path>  Write to a custom path instead of the default sidecar name
  --dry-run        With --articles: report what would be generated, and its cost,
                   without constructing the API client — spends nothing
  --porcelain      With --articles: print "<count>\\t<cost>" only, for scripts
  --assume-translated
                   With --articles: count the snippets of articles that are ABOUT to be
                   translated, for quoting a price before the translation runs
  --help, -h       Show this help

Examples:
  node scripts/generate-eli5.mjs blog/2026-01-01-my-post/Dockerfile
  node scripts/generate-eli5.mjs blog/2026-01-01-my-post/compose.yaml --force
  node scripts/generate-eli5.mjs src/my-file.sh --output docs/my-file.sh.eli5.json
  node scripts/generate-eli5.mjs --locale fr --articles blog/2026/09/17/docling --dry-run

Requires ANTHROPIC_API_KEY in your environment or in a .env file at the project root
(except for --dry-run, which never calls the API).
`);
    process.exit(0);
  }

  const force = args.includes("--force");
  const dryRun = args.includes("--dry-run");
  const porcelain = args.includes("--porcelain");
  const outputIdx = args.indexOf("--output");
  const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
  const localeIdx = args.indexOf("--locale");
  const locale = localeIdx !== -1 ? args[localeIdx + 1] : "en";

  if (localeIdx !== -1 && !LANGUAGES[locale]) {
    console.error(
      `Error: unsupported --locale "${locale}" (known: ${Object.keys(LANGUAGES).join(", ")}).`,
    );
    process.exit(1);
  }

  // Values consumed by a preceding flag are not positional arguments.
  const valueIndexes = new Set(
    [outputIdx, localeIdx].filter((i) => i !== -1).map((i) => i + 1),
  );
  const positionals = args.filter((a, i) => !a.startsWith("--") && !valueIndexes.has(i));

  if (args.includes("--articles")) {
    if (locale === "en") {
      console.error("Error: --articles requires --locale (e.g. --locale fr).");
      console.error("  The English sidecars are generated by the bulk script instead:");
      console.error(`    ${cmd("eli5:bulk")}`);
      process.exit(1);
    }
    runArticleBatch({
      locale,
      articlePaths: positionals,
      dryRun,
      porcelain,
      assumeTranslated: args.includes("--assume-translated"),
    }).catch((err) => {
      console.error("❌ Error:", err.message);
      process.exit(1);
    });
  } else {
    const sourceFile = positionals[0];

    if (!sourceFile) {
      console.error("Error: no source file specified.");
      console.error("Run with --help for usage.");
      process.exit(1);
    }

    generateEli5(sourceFile, { force, outputPath, locale }).catch((err) => {
      console.error("❌ Error:", err.message);
      process.exit(1);
    });
  }
} // end isMain guard
