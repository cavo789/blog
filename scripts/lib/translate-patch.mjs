/**
 * Incremental re-translation — update an existing French file instead of regenerating it.
 *
 * Why this exists: a full translation of a typical article costs ~6.3k input and ~8.7k output
 * tokens, and output is the expensive half. Until now ANY change to the translatable content —
 * one reworded sentence, an added <Snippet> line, a corrected description — paid that full price
 * again. Measured on the Docling article, a 1.2% drift cost exactly as much as the first
 * translation.
 *
 * The saving has two halves. What the model RETURNS: asking for the whole file back means ~8.7k
 * output tokens no matter how small the change, asking for a list of replacements means a few
 * hundred. And what it READS: the old English never leaves this machine — it exists only to
 * compute a diff, which is a local operation. The model sees that diff and the current French,
 * and returns edits — never a document.
 *
 * Every edit is verified against the French file before anything is written: `before` must occur
 * EXACTLY once. A string that is missing, or that appears twice, is not applied — it is reported,
 * and the caller falls back to a full translation. That is what makes a patch safe to trust: it
 * cannot silently land in the wrong place, and the worst case costs what the old behaviour cost
 * unconditionally.
 *
 * See TODO 0119.
 */

/**
 * Above this drift, a patch is the wrong tool: too many edits to verify, and the model is better
 * off retranslating from scratch than threading dozens of replacements. Matches the MINOR/STALE
 * split in check-translation-freshness.mjs — an article it calls STALE is retranslated whole.
 */
export const MAX_PATCH_DRIFT = 0.15;

/**
 * Line-based unified diff, context lines included.
 *
 * The old English is not sent to the model: it exists only to work out what moved, and that is a
 * local computation. Sending both full versions cost 21254 input tokens on the Docling article
 * against 8696 for a full translation — the patch saved output and gave most of it back on input.
 * A diff with context carries the same information in a fraction of the tokens.
 *
 * Plain LCS, O(n*m) over lines. An article is a few hundred lines, so the quadratic table is
 * nothing; the readability is worth more than the cleverness of a Myers implementation.
 */
export function unifiedDiff(oldText, newText, context = 6) {
  const a = oldText.split("\n");
  const b = newText.split("\n");

  // lcs[i][j] = length of the longest common subsequence of a[i..] and b[j..]
  const lcs = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i -= 1) {
    for (let j = b.length - 1; j >= 0; j -= 1) {
      lcs[i][j] =
        a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const ops = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      ops.push({ kind: " ", line: a[i] });
      i += 1;
      j += 1;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      ops.push({ kind: "-", line: a[i] });
      i += 1;
    } else {
      ops.push({ kind: "+", line: b[j] });
      j += 1;
    }
  }
  while (i < a.length) ops.push({ kind: "-", line: a[i++] });
  while (j < b.length) ops.push({ kind: "+", line: b[j++] });

  // Keep only changed lines and `context` unchanged lines around each of them.
  const keep = new Set();
  ops.forEach((op, index) => {
    if (op.kind === " ") return;
    for (let k = index - context; k <= index + context; k += 1) {
      if (k >= 0 && k < ops.length) keep.add(k);
    }
  });

  const out = [];
  let skipping = false;
  ops.forEach((op, index) => {
    if (keep.has(index)) {
      out.push(op.kind + op.line);
      skipping = false;
    } else if (!skipping) {
      out.push("@@ …unchanged… @@");
      skipping = true;
    }
  });

  return out.join("\n");
}

/**
 * The output contract both prompts share. One copy, because two drifting copies is how a patch
 * prompt and a repair prompt end up disagreeing about what "before" means.
 */
const EDIT_CONTRACT = `Return ONLY a JSON array, no prose, no markdown fence, in this exact shape:

[{"before": "<exact text from the CURRENT FRENCH FILE>", "after": "<replacement>"}]

Rules, all of them mandatory:
- "before" must be copied VERBATIM from the current French file, and must be long enough to occur
  exactly ONCE in it. If a sentence is short or repeated, include surrounding text until unique.
- To INSERT new content (a new paragraph, a new <Snippet ... /> line), use an existing unique
  neighbouring line as "before" and repeat it inside "after" along with the new content.
- To DELETE content, give an "after" that omits it.
- Translate any new English prose to French, following every rule in the system prompt above.
- Copy identifiers through untouched: slug, tags, dates, file paths, source=, filename=, url=,
  href=, code, and the content of code fences.
- A heading's {#anchor} suffix is an identifier: translate the heading TEXT and leave the
  {#anchor} exactly as it is. It pins inbound links and must not follow the translation.
- Return [] if nothing needs to change.`;

/**
 * The instruction sent alongside the shared SYSTEM_PROMPT. Kept separate from the contract
 * itself so the system prompt stays byte-identical between full and incremental runs — it is
 * cached (`cache_control: ephemeral`), and a differing system prompt would miss that cache.
 */
export function buildPatchPrompt(diff, currentTranslation) {
  return `The English article below was TRANSLATED to French earlier. It has since been edited.

Your task is NOT to translate the article again. It is to work out what changed between the two
English versions, and return the minimal set of edits that brings the existing French file in
line with the new English.

${EDIT_CONTRACT}

The diff below is the change to the ENGLISH article, in unified form: lines starting with "-"
were removed, "+" were added, " " are unchanged context, and "@@ …unchanged… @@" marks a stretch
of the article that did not change at all.

<english-diff>
${diff}
</english-diff>

<current-french>
${currentTranslation}
</current-french>`;
}

/**
 * Pulls the JSON array out of a model reply. Tolerates a ```json fence because that is the one
 * deviation worth absorbing rather than failing over — everything else is a hard parse error,
 * which the caller turns into a full retranslation.
 */
export function parseEdits(text) {
  const unfenced = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "");

  let parsed;
  try {
    parsed = JSON.parse(unfenced);
  } catch (error) {
    return { edits: null, problems: [`reply is not valid JSON: ${error.message}`] };
  }

  if (!Array.isArray(parsed))
    return { edits: null, problems: ["reply is not a JSON array"] };

  const problems = [];
  parsed.forEach((edit, index) => {
    if (typeof edit?.before !== "string" || typeof edit?.after !== "string") {
      problems.push(`edit ${index + 1}: missing a string "before" or "after"`);
    } else if (edit.before === "") {
      problems.push(`edit ${index + 1}: "before" is empty`);
    }
  });

  return problems.length > 0
    ? { edits: null, problems }
    : { edits: parsed, problems: [] };
}

/**
 * Applies verified edits to the French file.
 *
 * Each `before` is checked against the text as it stands AT THAT POINT, not against the original:
 * an earlier edit may legitimately have changed what a later one anchors to. Uniqueness is
 * re-checked each time for the same reason.
 *
 * Returns `{ text: null, problems: [...] }` when any edit cannot be applied safely. Partial
 * application is never returned — a half-patched file is worse than an unpatched one.
 */
export function applyEdits(translation, edits) {
  let text = translation;
  const problems = [];

  edits.forEach((edit, index) => {
    const occurrences = text.split(edit.before).length - 1;

    if (occurrences === 0) {
      problems.push(
        `edit ${index + 1}: "before" not found in the French file (${preview(edit.before)})`,
      );
      return;
    }
    if (occurrences > 1) {
      problems.push(
        `edit ${index + 1}: "before" occurs ${occurrences} times, not once (${preview(edit.before)})`,
      );
      return;
    }
    text = text.replace(edit.before, () => edit.after);
  });

  return problems.length > 0 ? { text: null, problems } : { text, problems: [] };
}

function preview(value) {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > 60 ? `${flat.slice(0, 60)}…` : flat;
}

/**
 * Repairs a translation that is wrong on its own terms — no English change involved.
 *
 * The English source has not moved; the French file simply fails the validator, most commonly
 * with headings copied through untranslated. A full retranslation would fix it and throw away a
 * correct translation of everything else, at full price. Feeding the validator's own findings
 * back as the task description is both cheaper and more precise: the model is told exactly what
 * is wrong, in the validator's words, and touches nothing else.
 */
export function buildRepairPrompt(source, translation, problems) {
  return `The French file below is a translation of the English article below it. A structural
validator has REJECTED it for the problems listed. Return the minimal set of edits that fixes
EXACTLY those problems and nothing else — the rest of this translation is correct and must not
be rewritten, reworded or "improved".

Validator findings:
${problems.map((problem) => `- ${problem}`).join("\n")}

${EDIT_CONTRACT}

<english-source>
${source}
</english-source>

<current-french>
${translation}
</current-french>`;
}
