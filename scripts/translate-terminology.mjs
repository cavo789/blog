#!/usr/bin/env node
/**
 * Cross-article terminology audit of the French corpus — see .todos/0135.
 *
 * `translate-validate.mjs` already enforces the translation contract, but both of its
 * terminology checks are **intra-article by design**: CONSISTENCY_PAIRS fires only when one
 * article contains an English term AND its French over-translation. If article A writes
 * "le hook" and article B writes "le crochet", each article is internally consistent and
 * nothing ever fires. That blind spot is structural, and this script is what looks into it.
 *
 * It answers two questions the validator cannot:
 *
 *   1. LEAKS — which translated articles use a discouraged French form (BANNED_FRENCH, or the
 *      French side of a CONSISTENCY_PAIRS entry)? A leak is normal: the lists grew over time,
 *      and an article translated before a word was banned was never re-checked against it.
 *   2. CANDIDATES — which English technical terms are *usually* kept in French but occasionally
 *      translated? A term kept in 41 blocks and translated in 2 is exactly the shape of a
 *      missing GLOSSARY entry, and it names the 2 articles to repair.
 *
 * Purely lexical: no Ollama, no Anthropic client, no network. A full corpus run is seconds.
 * The original TODO framed this as a by-product of the (now refused) semantic judge of 0134
 * and assumed a local model would be needed to decide whether two French wordings denote the
 * same English term. They are not: retention of the English term itself is measurable directly,
 * and it is a sharper signal than asking a 3B model to compare synonyms.
 *
 * Alignment is free and exact. Measured across the whole corpus on 2026-09-25: the 258 EN/FR
 * pairs split into the same number of prose blocks, every time, 0 divergence — the structure
 * clause of the translation contract holds. So block N of the English is block N of the French,
 * and a term's fate can be tracked block by block rather than article by article.
 *
 * Usage:
 *   node scripts/translate-terminology.mjs                 # full report
 *   node scripts/translate-terminology.mjs --leaks         # only the leak section
 *   node scripts/translate-terminology.mjs --candidates    # only the candidate section
 *   node scripts/translate-terminology.mjs --min-occurrences 15
 *   node scripts/translate-terminology.mjs --json          # machine-readable
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findPosts, parseFrontMatter } from "./lib/blog-corpus.mjs";
import { localizedBlogPath } from "./lib/i18n-eligibility.mjs";
import { blankOutCodeSpans } from "./lib/snippet-scan.mjs";
import { BANNED_FRENCH, CONSISTENCY_PAIRS, GLOSSARY } from "./lib/translate-contract.mjs";
// The banned-word matcher is imported, never re-derived: it carries overrides for terms whose
// prefix is also a French verb form. A naive `\bword` copy here reported "Jetons un œil au
// fichier" (the verb *jeter*) as a banned "jetons" — a false positive on correct prose, and the
// same class of mistake the 2026-09-17 CONSISTENCY_PAIRS cleanup was about.
import { hasBannedWord } from "./lib/translate-validate.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// A term seen fewer times than this says nothing about consistency: one block kept and one
// translated is a coin toss, not a pattern. 10 is where the corpus starts producing terms whose
// dominant form is unambiguous.
const DEFAULT_MIN_OCCURRENCES = 10;

// Retention = share of blocks where the English term survives verbatim into the French. The
// interesting band is "mostly kept, occasionally not":
//   ~1.00 — the term is pinned, nothing to do;
//   < 0.5 — an ordinary English word that simply has a French equivalent ("file" -> "fichier"),
//           reporting it would bury the signal under vocabulary.
const RETENTION_FLOOR = 0.5;
const RETENTION_CEILING = 0.999;

// Ranking by retention alone puts the noise on top: French/English cognates ("installation",
// "interface", "message") score 99% because they are the same word in both languages, not
// because anyone made a terminology decision. What deserves attention is the absolute number of
// exceptions to a dominant form — "host" kept 186/231 is a real question, "images" kept 881/882
// is one rephrased sentence. So candidates are ranked by miss count and must clear this floor.
const MIN_MISSES_FOR_CANDIDATE = 3;

/** Prose blocks, code removed. Mirrors the splitting used to verify EN/FR alignment. */
function proseBlocks(raw) {
  const { body } = parseFrontMatter(raw);
  // Fenced blocks and inline code spans are copied verbatim by contract, so counting terms
  // inside them would score a perfect retention that says nothing about the prose. This is the
  // trap `lib/snippet-scan.mjs` documents for `<Snippet>` references, and the same helper
  // solves it here rather than being hand-rolled a second time.
  const text = blankOutCodeSpans(body);
  const out = [];
  let current = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) {
      if (current.length) out.push(current.join("\n"));
      current = [];
      continue;
    }
    current.push(line);
  }
  if (current.length) out.push(current.join("\n"));

  return out.filter((block) => block.trim().length > 0);
}

/**
 * Whether the French block kept the English term.
 *
 * Plural agreement is not a terminology choice: an English "container" rendered as "containers"
 * in a French sentence is the term surviving, not being translated away. Matching the exact
 * token only would score those as losses and bury the real signal — measured on this corpus,
 * that alone accounted for most of the apparent slippage of `script`, `image` and `log`.
 */
function keptInFrench(frenchWords, term) {
  if (frenchWords.has(term)) return true;
  if (frenchWords.has(`${term}s`)) return true;
  return term.endsWith("s") && frenchWords.has(term.slice(0, -1));
}

/** Lowercased word tokens, accents preserved (`schéma` must not collapse onto `schema`). */
function words(text) {
  const found = text.toLowerCase().match(/[\p{L}][\p{L}\p{N}-]*/gu);
  return new Set(found ?? []);
}

/** The individual English terms a GLOSSARY left-hand side declares (`log / logs` is two). */
function glossaryTerms() {
  const terms = new Set();
  for (const [en] of GLOSSARY) {
    for (const part of en.split("/")) {
      const term = part.trim().toLowerCase();
      if (term) terms.add(term);
    }
  }
  return terms;
}

/** Every French form the contract discourages, with the English term it should have stayed as. */
function discouragedForms() {
  const forms = new Map();
  for (const word of BANNED_FRENCH) {
    forms.set(word.toLowerCase(), { french: word, english: null });
  }
  for (const [en, fr] of CONSISTENCY_PAIRS) {
    forms.set(fr.toLowerCase(), { french: fr, english: en });
  }
  return forms;
}

/** Loads every EN/FR pair the corpus can align, with the English as it was actually translated. */
function loadPairs() {
  const pairs = [];
  const skipped = [];

  for (const post of findPosts(path.join(projectRoot, "blog"))) {
    const translated = localizedBlogPath(projectRoot, post, "fr");
    if (!fs.existsSync(translated)) continue;

    const article = path.relative(projectRoot, post);
    const sidecar = `${translated}.translation.json`;
    if (!fs.existsSync(sidecar)) {
      skipped.push({ article, reason: "no .translation.json sidecar" });
      continue;
    }

    // The sidecar's `source` is the English *at translation time*. Comparing against the
    // current English instead would report every later edit as a terminology problem.
    let source;
    try {
      source = JSON.parse(fs.readFileSync(sidecar, "utf8")).source;
    } catch (err) {
      skipped.push({ article, reason: `unreadable sidecar: ${err.message}` });
      continue;
    }
    if (!source) {
      skipped.push({ article, reason: "sidecar carries no `source` key" });
      continue;
    }

    const english = proseBlocks(source);
    const french = proseBlocks(fs.readFileSync(translated, "utf8"));

    // Blind index-alignment on diverging counts would compare unrelated paragraphs and invent
    // leaks. Refuse and report, exactly as 0122 concluded for its own pairing problem.
    if (english.length !== french.length) {
      skipped.push({
        article,
        reason: `block count differs (EN ${english.length}, FR ${french.length})`,
      });
      continue;
    }

    pairs.push({ article, translated, english, french });
  }

  return { pairs, skipped };
}

/** Articles using a discouraged French form, with the line that carries it. */
function findLeaks(pairs) {
  const forms = discouragedForms();
  const leaks = new Map();

  for (const { article, french } of pairs) {
    for (const block of french) {
      const haystack = block.toLowerCase();

      for (const [needle, meta] of forms) {
        if (!hasBannedWord(haystack, needle)) continue;

        if (!leaks.has(needle)) leaks.set(needle, { ...meta, hits: [] });
        leaks.get(needle).hits.push({
          article,
          line:
            block
              .split(/\r?\n/)
              .find((l) => hasBannedWord(l.toLowerCase(), needle))
              ?.trim() ?? "",
        });
      }
    }
  }

  return leaks;
}

/** Per-term retention of the English form across aligned blocks. */
function measureRetention(pairs, minOccurrences) {
  const stats = new Map();

  for (const { article, english, french } of pairs) {
    for (let i = 0; i < english.length; i++) {
      const enWords = words(english[i]);
      const frWords = words(french[i]);

      for (const term of enWords) {
        if (term.length < 4) continue;

        if (!stats.has(term)) stats.set(term, { total: 0, kept: 0, translatedIn: [] });
        const stat = stats.get(term);
        stat.total++;

        if (keptInFrench(frWords, term)) {
          stat.kept++;
        } else if (stat.translatedIn.length < 6) {
          stat.translatedIn.push({ article, english: english[i], french: french[i] });
        }
      }
    }
  }

  for (const [term, stat] of stats) {
    if (stat.total < minOccurrences) stats.delete(term);
    else stat.retention = stat.kept / stat.total;
  }

  return stats;
}

function main() {
  const argv = process.argv.slice(2);
  const wants = (flag) => argv.includes(flag);
  const minOccurrences = argv.includes("--min-occurrences")
    ? Number(argv[argv.indexOf("--min-occurrences") + 1])
    : DEFAULT_MIN_OCCURRENCES;

  if (!Number.isFinite(minOccurrences) || minOccurrences < 1) {
    console.error("--min-occurrences expects a positive number");
    process.exit(1);
  }

  const showAll = !wants("--leaks") && !wants("--candidates");
  const { pairs, skipped } = loadPairs();
  const glossary = glossaryTerms();
  const leaks = findLeaks(pairs);
  const stats = measureRetention(pairs, minOccurrences);

  const inconsistent = [...stats.entries()]
    .filter(([, s]) => s.retention >= RETENTION_FLOOR && s.retention <= RETENTION_CEILING)
    .sort((a, b) => b[1].total - b[1].kept - (a[1].total - a[1].kept));

  // A GLOSSARY term that still slips is a leak in a rule that already exists; anything else is
  // a proposal for a rule that does not. Separating them matters: acceptance criterion 2 of the
  // TODO forbids padding the report with the 46 entries that are behaving.
  const glossaryLeaks = inconsistent.filter(([term]) => glossary.has(term));
  const candidates = inconsistent.filter(
    ([term, s]) => !glossary.has(term) && s.total - s.kept >= MIN_MISSES_FOR_CANDIDATE,
  );

  if (wants("--json")) {
    console.log(
      JSON.stringify(
        {
          pairs: pairs.length,
          skipped,
          leaks: [...leaks.entries()].map(([form, v]) => ({ form, ...v })),
          glossaryLeaks: glossaryLeaks.map(([term, s]) => ({ term, ...s })),
          candidates: candidates.map(([term, s]) => ({ term, ...s })),
        },
        null,
        2,
      ),
    );
    return;
  }

  console.log(`Corpus: ${pairs.length} aligned EN/FR pairs, ${skipped.length} skipped.`);
  for (const s of skipped) console.log(`  skipped ${s.article} — ${s.reason}`);
  console.log();

  if (showAll || wants("--leaks")) {
    console.log("== Discouraged French forms found in translations ==");
    if (leaks.size === 0) {
      console.log(
        "  none — BANNED_FRENCH and CONSISTENCY_PAIRS are clean across the corpus.\n",
      );
    } else {
      for (const [, v] of [...leaks.entries()].sort(
        (a, b) => a[1].hits.length - b[1].hits.length,
      )) {
        const origin = v.english ? ` (should stay "${v.english}")` : " (BANNED_FRENCH)";
        console.log(`\n  "${v.french}"${origin} — ${v.hits.length} hit(s)`);
        for (const hit of v.hits) {
          console.log(`    ${hit.article}`);
          console.log(`      ${hit.line.slice(0, 160)}`);
        }
      }
      console.log();
    }
  }

  if (showAll || wants("--candidates")) {
    console.log(`== GLOSSARY terms that still slip (>= ${minOccurrences} blocks) ==`);
    if (glossaryLeaks.length === 0) {
      console.log("  none — every glossary term is kept in every block that uses it.\n");
    } else {
      for (const [term, s] of glossaryLeaks) {
        console.log(
          `\n  ${term} — kept ${s.kept}/${s.total} (${(s.retention * 100).toFixed(1)}%)`,
        );
        for (const miss of s.translatedIn) console.log(`    ${miss.article}`);
      }
      console.log();
    }

    console.log(
      `== Candidates for GLOSSARY / BANNED_FRENCH (>= ${minOccurrences} blocks) ==`,
    );
    if (candidates.length === 0) {
      console.log("  none.");
    } else {
      for (const [term, s] of candidates) {
        console.log(
          `\n  ${term} — kept ${s.kept}/${s.total} (${(s.retention * 100).toFixed(1)}%), ` +
            `translated in ${s.total - s.kept}`,
        );
        for (const miss of s.translatedIn.slice(0, 2)) console.log(`    ${miss.article}`);
      }
    }
  }
}

main();
