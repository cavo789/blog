#!/usr/bin/env node
/**
 * Generate "Explain Like I'm Five" annotations for a source file.
 *
 * Usage:
 *   node scripts/generate-eli5.mjs <source-file> [--force] [--output <path>]
 *
 * Reads ANTHROPIC_API_KEY from process.env or a .env file at the project root.
 * Writes <source-file>.eli5.json alongside the source file (or to --output path).
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env from project root (best-effort)
try {
  const dotenv = require("dotenv");
  dotenv.config({ path: path.join(projectRoot, ".env") });
} catch {
  // dotenv not available — rely on environment variables already set
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

const SYSTEM_PROMPT = `You are a patient senior developer explaining code to a junior colleague.
Given a source file with numbered lines, identify only the lines that a junior
developer might find confusing. For each such line, write exactly one or two
plain-English sentences — friendly, concrete, no jargon unless you immediately
define it. Think "explain like I'm five but I'm also a developer".

Skip: blank lines, closing braces/brackets, import lines that are self-evident,
comments that already explain themselves, trivially obvious assignments.

Return ONLY a valid JSON object. Keys are line numbers as strings. Values are
explanation strings. Omit lines that need no explanation. No markdown, no code fences.`;

async function generateEli5(sourceFile, { force = false, outputPath = null } = {}) {
  const absSource = path.resolve(sourceFile);

  if (!fs.existsSync(absSource)) {
    throw new Error(`Source file not found: ${absSource}`);
  }

  if (fs.statSync(absSource).isDirectory()) {
    throw new Error(
      `"${sourceFile}" is a directory.\n` +
      `  To process an entire directory, use the bulk script instead:\n` +
      `    yarn eli5:bulk --dir ${sourceFile}`
    );
  }

  const destPath = outputPath || absSource + ".eli5.json";

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
      "ANTHROPIC_API_KEY is not set. Add it to your .env file or export it before running this script."
    );
  }

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const maxTokens = lines.length > 50 ? 2048 : 1024;

  console.log(`🤖 Calling Claude for ${path.basename(absSource)} (${lines.length} lines, lang: ${lang})...`);

  let raw;
  try {
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Language: ${lang}\n\n${numberedCode}`,
        },
      ],
    });
    raw = message.content[0].text.trim();
  } catch (err) {
    throw new Error(`Claude API error: ${err.message}`);
  }

  // Parse JSON — strip markdown fences if Claude wrapped it anyway
  let explanations;
  try {
    explanations = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        explanations = JSON.parse(match[0]);
      } catch {
        throw new Error(`Could not parse Claude's response as JSON:\n${raw}`);
      }
    } else {
      throw new Error(`Could not parse Claude's response as JSON:\n${raw}`);
    }
  }

  // Validate: only keep string values with string-number keys
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
    lang,
    explanations: cleaned,
  };

  fs.writeFileSync(destPath, JSON.stringify(result, null, 2) + "\n");
  console.log(
    `✅ Written: ${destPath}\n   ${Object.keys(cleaned).length} annotations on ${lines.length} lines.`
  );

  return { skipped: false, destPath, count: Object.keys(cleaned).length };
}

// ── CLI ──────────────────────────────────────────────────────────────────────

// Guard: only run CLI logic when this file is the entry point, not when imported.
const { fileURLToPath: _fileURLToPath } = await import("url");
const _isMain = process.argv[1] === _fileURLToPath(import.meta.url);
if (!_isMain) { /* exported as module — skip CLI */ }
else {

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: node scripts/generate-eli5.mjs <source-file> [options]

Options:
  --force          Regenerate even if .eli5.json already exists
  --output <path>  Write to a custom path instead of <source-file>.eli5.json
  --help, -h       Show this help

Examples:
  node scripts/generate-eli5.mjs blog/2026-01-01-my-post/Dockerfile
  node scripts/generate-eli5.mjs blog/2026-01-01-my-post/compose.yaml --force
  node scripts/generate-eli5.mjs src/my-file.sh --output docs/my-file.sh.eli5.json

Requires ANTHROPIC_API_KEY in your environment or in a .env file at the project root.
`);
  process.exit(0);
}

const force = args.includes("--force");
const outputIdx = args.indexOf("--output");
const outputPath = outputIdx !== -1 ? args[outputIdx + 1] : null;
const sourceFile = args.find(
  (a, i) => !a.startsWith("--") && !(outputIdx !== -1 && i === outputIdx + 1)
);

if (!sourceFile) {
  console.error("Error: no source file specified.");
  console.error("Run with --help for usage.");
  process.exit(1);
}

generateEli5(sourceFile, { force, outputPath }).catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});

} // end isMain guard
