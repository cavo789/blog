#!/usr/bin/env node
/**
 * Translate one blog article from English to French.
 *
 * Usage:
 *   node scripts/translate-post.mjs <blog/YYYY/MM/DD/slug/index.md> [--force] [--model <id>]
 *
 * Writes i18n/fr/docusaurus-plugin-content-blog/<rel>/index.md plus a
 * <file>.translation.json sidecar carrying the translatable-content hash and the English source
 * at translation time (the latter is what lets a future run translate only the diff).
 *
 * The translation is structurally validated before being written; a rejected translation is
 * retried once with the problems fed back, then reported and NOT written.
 *
 * Reads ANTHROPIC_API_KEY from process.env or the project .env. See TODO 0119.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "./lib/translate-contract.mjs";
import { validateTranslation } from "./lib/translate-validate.mjs";
import { translatableHash, driftRatio } from "./lib/translate-hash.mjs";
import {
  MAX_PATCH_DRIFT,
  applyEdits,
  buildPatchPrompt,
  buildRepairPrompt,
  parseEdits,
  unifiedDiff,
} from "./lib/translate-patch.mjs";
import { pinEnglishAnchors } from "./lib/translate-anchors.mjs";

const require = createRequire(import.meta.url);
const {
  collectSourceFrontMatter,
} = require("../plugins/translations-manifest-plugin/index.cjs");
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

try {
  require("dotenv").config({ path: path.join(projectRoot, ".env") });
} catch {
  // dotenv unavailable — rely on the ambient environment.
}

/** Overridable with `--locale <code>`: adding a language must not mean editing this file. */
const DEFAULT_TARGET_LOCALE = "fr";
const DEFAULT_MODEL = "claude-opus-5";

function parseArgs(argv) {
  const positional = [];
  let force = false;
  let model = DEFAULT_MODEL;
  let locale = DEFAULT_TARGET_LOCALE;
  let thinking = true;
  let repair = false;

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--force") force = true;
    else if (argv[i] === "--no-thinking") thinking = false;
    else if (argv[i] === "--repair") repair = true;
    else if (argv[i] === "--model") model = argv[++i];
    else if (argv[i] === "--locale") locale = argv[++i];
    else positional.push(argv[i]);
  }
  return { sourcePath: positional[0], force, model, locale, thinking, repair };
}

/** blog/2026/09/14/slug/index.md -> i18n/fr/docusaurus-plugin-content-blog/2026/09/14/slug/index.md */
function targetPathFor(sourcePath, locale) {
  const i18nPluginDir = `i18n/${locale}/docusaurus-plugin-content-blog`;
  const relative = path.relative(
    path.join(projectRoot, "blog"),
    path.resolve(projectRoot, sourcePath),
  );
  return path.join(projectRoot, i18nPluginDir, relative);
}

/**
 * Asks for a list of edits rather than a document. Shares SYSTEM_PROMPT byte-for-byte with
 * requestTranslation() so both modes hit the same ephemeral cache — a different system prompt
 * here would silently pay full price for the contract on every incremental run.
 *
 * `max_tokens` is deliberately far below the full-translation budget: a patch that wants 16k
 * tokens is not a patch, and capping it keeps a runaway generation from costing more than the
 * full retranslation it was meant to avoid.
 */
async function requestEdits(client, model, prompt, thinking) {
  const stream = client.messages.stream({
    model,
    max_tokens: 16000,
    ...(thinking ? { thinking: { type: "adaptive" } } : {}),
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return { text, usage: message.usage, stopReason: message.stop_reason };
}

async function requestTranslation(
  client,
  model,
  source,
  previousProblems,
  thinking = true,
) {
  const retryNote = previousProblems
    ? `\n\nYour previous attempt was REJECTED by the structural validator for these reasons:\n${previousProblems
        .map((p) => `- ${p}`)
        .join(
          "\n",
        )}\n\nFix ONLY those specific problems. Everything else about your previous attempt was correct —
in particular, keep translating the prose and the headings. Do not become conservative and copy
English text through: an over-cautious retry that leaves the article in English is a worse
failure than the problem you are fixing.`
    : "";

  const stream = client.messages.stream({
    model,
    max_tokens: 32000,
    // `--no-thinking` exists, but do not reach for it to save tokens: measured on the Docling
    // article, disabling it made output GROW, 8696 -> 9167. Adaptive thinking spends close to
    // nothing on this task, and the ~8.7k output is simply what the French file weighs (French
    // MDX tokenises at ~2.3 chars/token, not the ~3.6 an English-prose estimate assumes). The
    // saving is in not regenerating the file at all — see requestPatch above.
    ...(thinking ? { thinking: { type: "adaptive" } } : {}),
    system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
    messages: [
      {
        role: "user",
        content: `Translate this article to French. Return only the translated file.${retryNote}\n\n<article>\n${source}\n</article>`,
      },
    ],
  });

  const message = await stream.finalMessage();
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("");

  return { text: text.trim(), usage: message.usage, stopReason: message.stop_reason };
}

async function main() {
  const { sourcePath, force, model, locale, thinking, repair } = parseArgs(
    process.argv.slice(2),
  );

  if (!sourcePath) {
    console.error(
      "Usage: node scripts/translate-post.mjs <blog/.../index.md> [--force] [--model <id>]",
    );
    process.exit(1);
  }

  const absoluteSource = path.resolve(projectRoot, sourcePath);
  if (!fs.existsSync(absoluteSource)) {
    console.error(`Source not found: ${sourcePath}`);
    process.exit(1);
  }

  const target = targetPathFor(sourcePath, locale);
  const sidecar = `${target}.translation.json`;
  const source = fs.readFileSync(absoluteSource, "utf-8");
  const sourceHash = translatableHash(source);

  // Every validation below gets the corpus titles, so check 11 can tell a citation (a link
  // labelled with its target's exact English title, kept in English on purpose) from prose.
  const validationContext = {
    sourceTitles: Object.fromEntries(
      Object.entries(collectSourceFrontMatter(projectRoot)).map(([slug, meta]) => [
        slug,
        meta.title,
      ]),
    ),
  };

  const previous =
    !force && fs.existsSync(sidecar)
      ? JSON.parse(fs.readFileSync(sidecar, "utf-8"))
      : null;

  // --repair addresses the case the hash cannot see: the English never moved, the TRANSLATION is
  // wrong. Nothing upstream changed, so every freshness signal says "up to date" while the file
  // carries, say, fourteen untranslated headings. The validator already knows how to name that;
  // this turns its findings into a work order.
  if (repair) {
    if (!fs.existsSync(target)) {
      console.error(`  ✗ ${sourcePath} — nothing to repair, no translation exists yet`);
      process.exit(1);
    }

    const current = fs.readFileSync(target, "utf-8");
    const found = validateTranslation(source, current, validationContext);

    if (found.length === 0) {
      console.log(
        `✓ ${sourcePath} — translation already passes every check, nothing to repair`,
      );
      return;
    }

    console.log(`  ${path.basename(path.dirname(sourcePath))} — repairing:`);
    found.forEach((problem) => console.log(`      - ${problem}`));
    process.stdout.write("    requesting edits… ");

    const client = new Anthropic();
    const reply = await requestEdits(
      client,
      model,
      buildRepairPrompt(source, current, found),
      thinking,
    );

    const { edits, problems: parseProblems } = parseEdits(reply.text);
    if (!edits) {
      console.log(`unusable reply (${parseProblems[0]})`);
      process.exitCode = 2;
      return;
    }

    const applied = applyEdits(current, edits);
    if (!applied.text) {
      console.log(`${edits.length} edit(s) could not be anchored`);
      applied.problems.forEach((problem) => console.log(`      - ${problem}`));
      process.exitCode = 2;
      return;
    }

    const remaining = validateTranslation(source, applied.text, validationContext);
    const usage = reply.usage;
    console.log(`${edits.length} edit(s) applied`);
    console.log(
      `    tokens: ${usage.input_tokens} in / ${usage.output_tokens} out / ${usage.cache_read_input_tokens ?? 0} cache read / ${usage.cache_creation_input_tokens ?? 0} cache write`,
    );

    if (remaining.length > 0) {
      console.error(`  ✗ ${sourcePath} — NOT written, still failing after repair:`);
      remaining.forEach((problem) => console.error(`      - ${problem}`));
      process.exitCode = 2;
      return;
    }

    // The sidecar's hash and stored source are already correct — the English never changed — so
    // only the file itself is rewritten. Rewriting the sidecar here would move `translatedAt`
    // and claim a translation that did not happen.
    fs.writeFileSync(target, applied.text, "utf-8");
    console.log(`  ✓ ${path.relative(projectRoot, target)} — repaired, validates clean`);
    return;
  }

  if (previous?.sourceHash === sourceHash) {
    console.log(
      `✓ ${sourcePath} — already translated and up to date (use --force to redo)`,
    );
    return;
  }

  const client = new Anthropic();
  const label = path.basename(path.dirname(sourcePath));
  const usages = [];
  let translated = null;

  // ── Incremental path ────────────────────────────────────────────────────────────────
  // Tried first whenever there is something to patch: a previous English source to diff
  // against, and a French file to edit. Every exit from here falls through to the full
  // translation below, so a patch can only ever save money — never cost correctness.
  if (previous?.source && fs.existsSync(target)) {
    const drift = driftRatio(previous.source, source);
    const percent = (drift * 100).toFixed(1);

    if (drift >= MAX_PATCH_DRIFT) {
      console.log(
        `  ${label} — ${percent}% drift, past the ${(MAX_PATCH_DRIFT * 100).toFixed(0)}% patch ceiling; full retranslation`,
      );
    } else {
      process.stdout.write(`  ${label} — patching (${percent}% drift)… `);
      const current = fs.readFileSync(target, "utf-8");
      const diff = unifiedDiff(previous.source, source);
      const reply = await requestEdits(
        client,
        model,
        buildPatchPrompt(diff, current),
        thinking,
      );
      usages.push(reply.usage);

      const { edits, problems: parseProblems } = parseEdits(reply.text);

      if (!edits) {
        console.log(`unusable reply (${parseProblems[0]}); full retranslation`);
      } else if (edits.length === 0) {
        // The model read the diff as touching nothing translatable. Believe it, but still
        // rewrite the sidecar below so the new hash is recorded and the next run is a no-op.
        console.log("no edit needed");
        translated = current;
      } else {
        const applied = applyEdits(current, edits);

        if (!applied.text) {
          console.log(
            `${edits.length} edit(s) could not be anchored; full retranslation`,
          );
          applied.problems.forEach((problem) => console.log(`      - ${problem}`));
        } else {
          // The SAME validator as a full translation. A patch is not trusted more for being
          // small — it faces the identical ten checks before anything is written.
          const patchProblems = validateTranslation(
            source,
            applied.text,
            validationContext,
          );

          if (patchProblems.length === 0) {
            console.log(`${edits.length} edit(s) applied, validated`);
            translated = applied.text;
          } else {
            console.log(`patched but rejected by the validator; full retranslation`);
            patchProblems.forEach((problem) => console.log(`      - ${problem}`));
          }
        }
      }
    }
  }

  // ── Full translation ────────────────────────────────────────────────────────────────
  let problems = [];
  let result = null;

  if (translated === null) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      process.stdout.write(`  ${label} — attempt ${attempt}… `);
      result = await requestTranslation(client, model, source, problems, thinking);
      usages.push(result.usage);

      if (result.stopReason === "refusal") {
        console.log("REFUSED by the model");
        process.exit(1);
      }

      problems = validateTranslation(source, result.text, validationContext);
      if (problems.length === 0) {
        console.log("validated");
        translated = result.text;
        break;
      }
      console.log(`rejected (${problems.length} problem(s))`);
    }
  }

  // Summed across every call this run made — a failed patch followed by a full translation has
  // to report BOTH, or the fallback looks free.
  const totals = usages.reduce(
    (sum, usage) => ({
      input: sum.input + (usage.input_tokens ?? 0),
      output: sum.output + (usage.output_tokens ?? 0),
      cacheRead: sum.cacheRead + (usage.cache_read_input_tokens ?? 0),
      cacheWrite: sum.cacheWrite + (usage.cache_creation_input_tokens ?? 0),
    }),
    { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
  );
  console.log(
    `    tokens: ${totals.input} in / ${totals.output} out / ${totals.cacheRead} cache read / ${totals.cacheWrite} cache write`,
  );

  if (translated === null) {
    console.error(`  ✗ ${sourcePath} — NOT written, structural validation failed:`);
    problems.forEach((p) => console.error(`      - ${p}`));
    fs.mkdirSync(path.join(projectRoot, ".translation-rejected"), { recursive: true });
    const dump = path.join(projectRoot, ".translation-rejected", `${label}.md`);
    fs.writeFileSync(dump, result.text, "utf-8");
    console.error(
      `      rejected output kept at ${path.relative(projectRoot, dump)} for inspection`,
    );
    process.exitCode = 2;
    return;
  }

  // Pin the English heading ids onto the translated headings. Deterministic post-pass rather
  // than a prompt rule: it keeps every inbound `#anchor` link working without touching a single
  // English article. See scripts/lib/translate-anchors.mjs.
  const anchored = pinEnglishAnchors(source, translated);
  if (anchored.skipped) {
    console.log(`    anchors: skipped (${anchored.skipped})`);
  } else {
    console.log(`    anchors: ${anchored.pinned} English id(s) pinned`);
  }

  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${anchored.content}\n`, "utf-8");
  fs.writeFileSync(
    sidecar,
    `${JSON.stringify({ sourceHash, model, translatedAt: new Date().toISOString(), source }, null, 2)}\n`,
    "utf-8",
  );

  console.log(`  ✓ ${path.relative(projectRoot, target)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
