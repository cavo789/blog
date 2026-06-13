#!/usr/bin/env node
/**
 * Batch "Explain Like I'm Five" generator.
 *
 * Scans all MDX/MD files under --dir (default: blog/) for <Snippet source="..."> usages,
 * resolves each source file, and generates a .eli5.json annotation file alongside it.
 * Already-existing .eli5.json files are skipped unless --force is passed.
 *
 * Usage:
 *   node scripts/bulk-eli5.mjs [--force] [--dir blog/] [--dry-run]
 *
 * Requires ANTHROPIC_API_KEY in your environment or in a .env file at the project root.
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
  // rely on environment variables already set
}

// --- Language detection (same as generate-eli5.mjs) ---
const EXT_TO_LANG = {
  js: "javascript", mjs: "javascript", cjs: "javascript",
  jsx: "jsx", ts: "typescript", tsx: "typescript",
  py: "python", php: "php", sh: "bash", bash: "bash", zsh: "bash",
  css: "css", html: "html", json: "json", yml: "yaml", yaml: "yaml",
  md: "markdown", mdx: "markdown", dockerfile: "docker",
  ini: "ini", sql: "sql", xml: "xml", toml: "toml",
  env: "bash", txt: "plaintext", ps1: "powershell", bat: "batch", cmd: "batch",
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

async function generateForFile(absSource, { force = false } = {}) {
  const destPath = absSource + ".eli5.json";

  if (!force && fs.existsSync(destPath)) {
    return { status: "skipped", path: destPath };
  }

  const code = fs.readFileSync(absSource, "utf-8");
  const lang = detectLang(absSource);
  const lines = code.split("\n");
  const numberedCode = lines.map((l, i) => `${i + 1}: ${l}`).join("\n");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not set");

  const { default: Anthropic } = await import("@anthropic-ai/sdk");
  const client = new Anthropic({ apiKey });

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: lines.length > 50 ? 2048 : 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: `Language: ${lang}\n\n${numberedCode}` }],
  });

  const raw = message.content[0].text.trim();
  let explanations;

  try {
    explanations = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) explanations = JSON.parse(match[0]);
    else throw new Error(`Invalid JSON from Claude for ${path.basename(absSource)}`);
  }

  // Validate
  const cleaned = {};
  for (const [k, v] of Object.entries(explanations)) {
    if (/^\d+$/.test(k) && typeof v === "string" && v.trim()) {
      const idx = parseInt(k, 10) - 1;
      if (idx >= 0 && idx < lines.length) cleaned[k] = v.trim();
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
  return { status: "generated", path: destPath, count: Object.keys(cleaned).length };
}

// --- Find all MDX/MD files recursively ---
function findMarkdownFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMarkdownFiles(full));
    } else if (entry.isFile() && /\.(mdx?|md)$/.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

// --- Extract source paths from <Snippet source="..."> usages ---
const SNIPPET_SOURCE_RE = /<Snippet[^>]*\ssource="([^"]+)"/g;

function extractSourcePaths(mdxFile) {
  const content = fs.readFileSync(mdxFile, "utf-8");
  const dir = path.dirname(mdxFile);
  const sources = [];
  let match;
  while ((match = SNIPPET_SOURCE_RE.exec(content)) !== null) {
    const srcAttr = match[1];
    let absPath;
    if (srcAttr.startsWith("./") || srcAttr.startsWith("../")) {
      absPath = path.resolve(dir, srcAttr);
    } else {
      absPath = path.resolve(projectRoot, srcAttr);
    }
    sources.push(absPath);
  }
  return sources;
}

// --- CLI ---
const args = process.argv.slice(2);

if (args.includes("--help") || args.includes("-h")) {
  console.log(`
Usage: node scripts/bulk-eli5.mjs [options]

Options:
  --force          Regenerate even if .eli5.json already exists
  --dir <path>     Directory to scan (default: blog/)
  --dry-run        Show what would be generated without calling the API
  --help, -h       Show this help

Examples:
  node scripts/bulk-eli5.mjs
  node scripts/bulk-eli5.mjs --force
  node scripts/bulk-eli5.mjs --dir blog/2026 --dry-run

Requires ANTHROPIC_API_KEY in your environment or in a .env file at the project root.
`);
  process.exit(0);
}

const force = args.includes("--force");
const dryRun = args.includes("--dry-run");
const dirIdx = args.indexOf("--dir");
const scanDir = dirIdx !== -1
  ? path.resolve(projectRoot, args[dirIdx + 1])
  : path.resolve(projectRoot, "blog");

if (!fs.existsSync(scanDir)) {
  console.error(`Error: directory not found: ${scanDir}`);
  process.exit(1);
}

console.log(`🔍 Scanning ${path.relative(projectRoot, scanDir)} for Snippet usages...`);

const mdxFiles = findMarkdownFiles(scanDir);
const sourceMap = new Map(); // absPath → Set of mdx files referencing it

for (const mdxFile of mdxFiles) {
  for (const src of extractSourcePaths(mdxFile)) {
    if (!sourceMap.has(src)) sourceMap.set(src, new Set());
    sourceMap.get(src).add(path.relative(projectRoot, mdxFile));
  }
}

if (sourceMap.size === 0) {
  console.log("No <Snippet source=\"...\"> usages found.");
  process.exit(0);
}

console.log(`Found ${sourceMap.size} unique source file(s) across ${mdxFiles.length} posts.\n`);

if (dryRun) {
  for (const [src, refs] of sourceMap) {
    const relSrc = path.relative(projectRoot, src);
    const exists = fs.existsSync(src + ".eli5.json");
    const action = exists && !force ? "SKIP" : "GENERATE";
    console.log(`  [${action}] ${relSrc}`);
    for (const ref of refs) console.log(`         ← ${ref}`);
  }
  console.log("\nDry run — nothing written.");
  process.exit(0);
}

let generated = 0, skipped = 0, errors = 0;

for (const [src, refs] of sourceMap) {
  const relSrc = path.relative(projectRoot, src);

  if (!fs.existsSync(src)) {
    console.warn(`  ⚠  Source not found, skipping: ${relSrc}`);
    errors++;
    continue;
  }

  process.stdout.write(`  📄 ${relSrc} ... `);

  try {
    const result = await generateForFile(src, { force });
    if (result.status === "skipped") {
      console.log("⏭  skipped");
      skipped++;
    } else {
      console.log(`✅ ${result.count} annotations`);
      generated++;
    }
  } catch (err) {
    console.log(`❌ ${err.message}`);
    errors++;
  }
}

console.log(`\n──────────────────────────────────────`);
console.log(`Generated: ${generated}  Skipped: ${skipped}  Errors: ${errors}`);

if (errors > 0) process.exit(1);
