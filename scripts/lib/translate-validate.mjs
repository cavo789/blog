/**
 * Structural validation of an EN -> FR translation, run BEFORE the translated file is written.
 *
 * This is the piece that makes the whole thing trustworthy. Prompt discipline alone lands around
 * 90% on a corpus this size; the remaining 10% is what breaks a build or silently changes a URL.
 * Every check here compares the translation against its source and returns a hard failure, never
 * a warning — a rejected translation is retried once, then reported.
 *
 * Deliberately regex-based rather than mdast-based: it must catch damage in files the MDX parser
 * would already refuse. See TODO 0119 for the mdast fallback if this proves too blunt.
 */

import yaml from "js-yaml";

import { BANNED_FRENCH, CONSISTENCY_PAIRS } from "./translate-contract.mjs";

const FRONT_MATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---/;
// `title` and `description` are translated; `language` is rewritten (en -> fr). All three are
// exempt from the byte-for-byte front matter comparison — see translate-contract.mjs rule 4.
const TRANSLATABLE_KEYS = new Set(["title", "description", "language"]);

/** Splits a document into its fenced code blocks and everything else. */
function extractFences(text) {
  const fences = [];
  const lines = text.split(/\r?\n/);
  let open = null;

  for (const line of lines) {
    const match = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (!match) {
      if (open) open.body.push(line);
      continue;
    }
    const [, , marker, rest] = match;
    if (
      open &&
      marker[0] === open.marker[0] &&
      marker.length >= open.marker.length &&
      !rest.trim()
    ) {
      fences.push({ info: open.info, body: open.body.join("\n") });
      open = null;
    } else if (!open) {
      open = { marker, info: rest.trim(), body: [] };
    } else {
      open.body.push(line);
    }
  }
  if (open) fences.push({ info: open.info, body: open.body.join("\n") });
  return fences;
}

/** Removes fenced blocks and inline code so prose-only checks don't trip on code. */
function stripCode(text) {
  return text
    .replace(/^(\s*)(`{3,}|~{3,})[\s\S]*?^\s*\2\s*$/gm, "")
    .replace(/`[^`\n]*`/g, "");
}

function parseFrontMatter(text) {
  const match = text.match(FRONT_MATTER_RE);
  if (!match) return { raw: "", lines: [] };
  return { raw: match[1], lines: match[1].split(/\r?\n/) };
}

function extractComponents(text) {
  return [...stripCode(text).matchAll(/<\/?([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]);
}

function extractTargets(text) {
  const body = stripCode(text);
  const urls = [...body.matchAll(/\]\(([^)\s]+)/g)].map((m) => m[1]);
  const attrs = [
    ...body.matchAll(
      /\b(?:source|href|to|icon|image|id|variant|language)=["']([^"']*)["']/g,
    ),
  ].map((m) => m[1]);
  return [...urls, ...attrs].sort();
}

function countHeadings(text) {
  const counts = {};
  for (const line of stripCode(text).split(/\r?\n/)) {
    const m = line.match(/^(#{1,6})\s/);
    if (m) counts[m[1].length] = (counts[m[1].length] ?? 0) + 1;
  }
  return counts;
}

/**
 * @returns {string[]} one message per violation; empty means the translation is safe to write.
 */
/**
 * @param {string} source       English article
 * @param {string} translation  translated article
 * @param {{ sourceTitles?: Record<string, string> }} [context]
 *   slug -> English title for the whole corpus. Optional: check 11 needs it to tell a citation
 *   (a link labelled with the target's exact title, left in English on purpose) from prose, and
 *   is skipped without it. The validator stays a pure function of its arguments.
 */
export function validateTranslation(source, translation, { sourceTitles } = {}) {
  const problems = [];

  // 1. Fenced code blocks — count, language tag and content must be byte-identical, with one
  // exception: the non-breaking space. Several English articles carry U+00A0 inside their `tree`
  // fences (a paste from a terminal), and the model normalises them to ordinary spaces every
  // time — a difference nothing renders. Comparing on the normalised form keeps the byte-identity
  // guarantee where it matters while removing a rejection no retry could ever clear. Fixing the
  // English sources instead would change their translatable hash and bill a retranslation of
  // articles that are already up to date.
  const unNbsp = (text) => text.replace(/\u00a0/g, " ");
  const srcFences = extractFences(source);
  const trFences = extractFences(translation);
  if (srcFences.length !== trFences.length) {
    problems.push(
      `code blocks: ${srcFences.length} in source, ${trFences.length} in translation`,
    );
  } else {
    srcFences.forEach((fence, i) => {
      if (fence.info !== trFences[i].info) {
        problems.push(
          `code block #${i + 1}: language tag "${fence.info}" became "${trFences[i].info}"`,
        );
      }
      if (unNbsp(fence.body) !== unNbsp(trFences[i].body)) {
        problems.push(
          `code block #${i + 1} (${fence.info || "no lang"}): content was modified`,
        );
      }
    });
  }

  // 2. Front matter — only title and description may change.
  const srcFm = parseFrontMatter(source);
  const trFm = parseFrontMatter(translation);
  if (!trFm.raw) {
    problems.push("front matter: missing in translation");
  } else {
    // French typography puts a space before ":" — an unquoted "ultime : il" is invalid YAML and
    // kills the whole dev server, not just this page. Parse it for real.
    try {
      yaml.load(trFm.raw);
    } catch (error) {
      problems.push(
        `front matter: invalid YAML (${error.reason ?? error.message}) — quote title/description`,
      );
    }
    const trByKey = new Map();
    let currentKey = null;
    for (const line of trFm.lines) {
      const pair = line.match(/^([A-Za-z_][\w-]*):(.*)$/);
      if (pair) {
        currentKey = pair[1];
        trByKey.set(currentKey, [pair[2]]);
      } else if (currentKey) {
        trByKey.get(currentKey).push(line);
      }
    }
    currentKey = null;
    const srcByKey = new Map();
    for (const line of srcFm.lines) {
      const pair = line.match(/^([A-Za-z_][\w-]*):(.*)$/);
      if (pair) {
        currentKey = pair[1];
        srcByKey.set(currentKey, [pair[2]]);
      } else if (currentKey) {
        srcByKey.get(currentKey).push(line);
      }
    }
    for (const [key, value] of srcByKey) {
      if (TRANSLATABLE_KEYS.has(key)) continue;
      if (!trByKey.has(key)) {
        problems.push(`front matter: key "${key}" missing from translation`);
      } else if (trByKey.get(key).join("\n") !== value.join("\n")) {
        problems.push(
          `front matter: key "${key}" was modified (must be copied verbatim)`,
        );
      }
    }
    for (const key of trByKey.keys()) {
      if (!srcByKey.has(key))
        problems.push(`front matter: key "${key}" invented by the translation`);
    }
  }

  // 3. MDX component tags — same names, same order, same arity.
  const srcComponents = extractComponents(source);
  const trComponents = extractComponents(translation);
  if (srcComponents.join(",") !== trComponents.join(",")) {
    problems.push(
      `MDX components: sequence differs (${srcComponents.length} vs ${trComponents.length})`,
    );
  }

  // 4. Link targets and identifier-carrying props.
  const srcTargets = extractTargets(source);
  const trTargets = extractTargets(translation);
  if (srcTargets.join("\n") !== trTargets.join("\n")) {
    const missing = srcTargets.filter((t) => !trTargets.includes(t));
    const added = trTargets.filter((t) => !srcTargets.includes(t));
    problems.push(
      `link/prop targets differ — missing: ${missing.slice(0, 3).join(", ") || "none"}; added: ${
        added.slice(0, 3).join(", ") || "none"
      }`,
    );
  }

  // 5. The truncate marker.
  if (
    source.includes("<!-- truncate -->") &&
    !translation.includes("<!-- truncate -->")
  ) {
    problems.push("the <!-- truncate --> marker is missing");
  }

  // 6. Headings.
  const srcHeadings = countHeadings(source);
  const trHeadings = countHeadings(translation);
  if (JSON.stringify(srcHeadings) !== JSON.stringify(trHeadings)) {
    problems.push(
      `headings differ: ${JSON.stringify(srcHeadings)} vs ${JSON.stringify(trHeadings)}`,
    );
  }

  // 7. Banned over-translations, in prose only.
  //
  // The default matcher is a PREFIX test (`\bword`, no trailing boundary) on purpose: it is what
  // makes "conteneur" catch "conteneurs" without listing every plural. Two entries cannot live
  // with that, because their prefix is also a conjugated form of an unrelated verb — hence the
  // override map below, which replaces the matcher for those terms only.
  const prose = stripCode(translation).toLowerCase();

  // "jetons" is both the plural of "token" (banned) and *jeter* in the first person plural
  // ("jetons un œil au fichier", "nous jetons"), which is ordinary French prose. The noun is
  // what we are after, and the noun always carries a determiner or a count in front of it;
  // the verb never does. "jeton" gets a trailing boundary so it stops matching "jetons" itself.
  const BANNED_OVERRIDES = new Map([
    ["jeton", /\bjeton\b/i],
    [
      "jetons",
      /(?:\b(?:les|des|ces|ses|vos|nos|leurs|mes|tes|quelques|plusieurs|certains|aux|en|de)\s+|\bd'|\d\s*)jetons\b/i,
    ],
  ]);

  const hasWord = (haystack, word) => {
    const override = BANNED_OVERRIDES.get(word);
    if (override) return override.test(haystack);
    return new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i").test(
      haystack,
    );
  };

  for (const word of BANNED_FRENCH) {
    if (hasWord(prose, word)) problems.push(`banned over-translation: "${word}"`);
  }

  // 8. Terminology consistency: neither word of a pair is wrong on its own, but using both in
  // the same article is what makes a translation read as machine output. This is the check a
  // banned-word list structurally cannot do — found by the first real run, where "folding" and
  // "pliage" sat ten lines apart.
  for (const [english, french] of CONSISTENCY_PAIRS) {
    if (hasWord(prose, english) && hasWord(prose, french)) {
      problems.push(`terminology inconsistency: both "${english}" and "${french}" used`);
    }
  }

  // 9. Headings must actually be TRANSLATED, not merely counted. The count check above passes
  // happily on an article whose 18 headings were copied through in English — which is exactly
  // what a retry made the model do once (see translate-post.mjs's retry note). Product names
  // and code identifiers legitimately stay identical, so this only fires when the overwhelming
  // majority is untranslated.
  // The `{#anchor}` suffix has to come off before comparing. pinEnglishAnchors() appends it
  // AFTER validation, so a freshly translated file has none and compares correctly — but any
  // file read back from disk carries them, and then every heading differs from its English
  // counterpart by the suffix alone and this check silently passes. That is the state the
  // incremental path validates in, and the state a re-check of the corpus reads: without this,
  // check 9 only ever protected the very first translation of an article.
  const headingTexts = (raw) =>
    stripCode(raw)
      .split(/\r?\n/)
      .filter((line) => /^#{1,6}\s/.test(line))
      .map((line) =>
        line
          .replace(/^#{1,6}\s+/, "")
          .replace(/\s*\{#[^}]*\}\s*$/, "")
          .trim(),
      );

  const srcHeadingTexts = headingTexts(source);
  const trHeadingTexts = headingTexts(translation);

  if (srcHeadingTexts.length >= 4 && srcHeadingTexts.length === trHeadingTexts.length) {
    const identical = srcHeadingTexts.filter((h, i) => h === trHeadingTexts[i]).length;
    const ratio = identical / srcHeadingTexts.length;
    if (ratio > 0.6) {
      problems.push(
        `headings left in English: ${identical}/${srcHeadingTexts.length} identical to the source`,
      );
    }
  }

  // 10. The `language` key must actually say fr — rule 4 rewrites it rather than copying it.
  if (/^language:\s*en\s*$/m.test(trFm.raw ?? "")) {
    problems.push(
      "front matter: `language: en` left unchanged (must become `language: fr`)",
    );
  }

  // 11. Link labels pointing at another article must be translated — UNLESS the label is that
  // article's exact English title, which the contract keeps in English on purpose (and which
  // remark-i18n-link-titles relabels at build time once the target is translated). The model
  // over-applied that exception: of 21 inter-article links in the first five translations, six
  // were ordinary English prose it had mistaken for titles ("here's how to set it up").
  //
  // "English" is decided by function words only, never by shape. Product and feature names
  // ("FZF", "sticky scroll", "Markitdown") carry none and are correctly left alone. A lone
  // leading "a " counts too: French writes "à", and no French link label starts with a bare "a".
  if (sourceTitles) {
    // "an" is NOT in the alternation below: it is also the French noun for "year", and
    // "la notice signalant un article de plus d'un an" is correct French that the plain
    // \ban\b form rejected. It is matched separately, by the property that defines the English
    // article and that the French noun never has — a vowel-initial word right after it, with no
    // French count word right before ("un an après", "par an et demi").
    const ENGLISH_WORDS =
      /\b(the|with|your|you|about|how|here's|already|earlier|using|this|that|what|why|from|into)\b|^a\s/i;
    const ENGLISH_AN =
      /(?<!\b(?:un|par|chaque|deux|trois|quatre|cinq|quelques|plusieurs)\s)\ban\s+[aeiouyh]/i;
    const linkRe =
      /<Link\s+to="\/blog\/([^"/#?]+)\/?"\s*>([^<]+)<\/Link>|\[([^\]]+)\]\(\/blog\/([^)/#?]+)\/?\)/g;
    const english = [];

    for (const match of stripCode(translation).matchAll(linkRe)) {
      const slug = match[1] ?? match[4];
      const label = (match[2] ?? match[3]).trim();
      if (sourceTitles[slug] && label === sourceTitles[slug].trim()) continue;
      if (ENGLISH_WORDS.test(label) || ENGLISH_AN.test(label)) {
        english.push(`"${label}" (-> /blog/${slug})`);
      }
    }

    if (english.length > 0) {
      problems.push(
        `link labels left in English (translate them; only a target's EXACT English title stays): ${english.join(", ")}`,
      );
    }
  }

  // 12. In-page anchor TARGETS must survive byte for byte. They are identifiers, and
  // translate-anchors.mjs pins the ENGLISH heading ids onto the translated headings — so a
  // translated target can only ever point at a heading that does not exist.
  //
  // Found by a build, not by this file: rule 6 of the contract names `to=` among the props never
  // to translate, and the model read that as the JSX attribute only. Inside
  // `<QuickJump links={[{ label: "…", to: "#the-big-picture" }]} />` the target is an object
  // KEY, `to:`, and it came back as `to: "#vue-densemble"` — two broken anchors that failed the
  // fr locale. Comparing the two multisets catches every spelling of the mistake at once,
  // without needing to know how Docusaurus slugifies a heading.
  const anchorTargets = (text) => {
    const re =
      /\]\(#([^)\s]+)\)|\bto\s*[:=]\s*["'`]#([^"'`]+)["'`]|\bhref\s*=\s*["'`]#([^"'`]+)["'`]/g;
    return [...text.matchAll(re)].map((m) => m[1] ?? m[2] ?? m[3]).sort();
  };
  const srcAnchors = anchorTargets(source);
  const trAnchors = anchorTargets(translation);
  if (JSON.stringify(srcAnchors) !== JSON.stringify(trAnchors)) {
    const invented = trAnchors.filter((a) => !srcAnchors.includes(a));
    const lost = srcAnchors.filter((a) => !trAnchors.includes(a));
    const detail = [
      invented.length
        ? `translated into ${invented.map((a) => `"#${a}"`).join(", ")}`
        : "",
      lost.length ? `lost ${lost.map((a) => `"#${a}"`).join(", ")}` : "",
    ]
      .filter(Boolean)
      .join("; ");
    problems.push(`in-page anchor targets must be copied byte for byte: ${detail}`);
  }

  return problems;
}
