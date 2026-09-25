/**
 * Volatile normalisation of a published snippet before a linter ever sees it.
 *
 * The 1000 files under `blog/**‍/files/` are authored to be *read inside an article*, not to be
 * run standalone, and two authoring conventions make them invalid as-is for every linter:
 *
 *   - Docusaurus highlight directives (`# highlight-next-line`, `highlight-start`/`-end`) are
 *     instructions to the renderer, not to the interpreter;
 *   - the `Vars` component's `%%name=value%%` placeholders are substituted at render time, so
 *     the file on disk carries `%%port=1521%%` where a shell expects `1521`;
 *   - an **elision marker** — a line holding nothing but `[...]`, `// [...]` or `// ...` — stands
 *     for "the rest of the file, omitted here". TODO 0132 did not list this one; it surfaced on
 *     the first run as 12 YAML "syntax error" reports against `compose.yaml` files that are
 *     perfectly valid once the marker line is dropped. 33 files use it, in 3 spellings.
 *
 * Both are mechanically reducible — no guessing — which is precisely why linting this corpus is
 * possible at all. `normalizeSnippet()` returns the reduced text; **the file on disk is never
 * touched** (acceptance criterion 6 of TODO 0132).
 *
 * Line numbers are preserved on purpose, the same discipline `blankOutCodeSpans` follows in
 * snippet-scan.mjs: a directive line is blanked, never deleted, so every diagnostic a linter
 * reports still points at the right line of the file the author will open. Placeholder
 * substitution changes column offsets within a line, which no consumer here depends on.
 */

// `# highlight-next-line`, `// highlight-start`, `<!-- highlight-end -->`, `-- highlight-…`.
// Anchored to a whole line: a line that merely *contains* the word is left alone.
const HIGHLIGHT_LINE_RE =
  /^[ \t]*(?:#|\/\/|;|--|<!--|\/\*|%|')?[ \t]*highlight-(?:next-line|start|end)[ \t]*(?:-->|\*\/)?[ \t]*$/;

// A line that is only an elision marker: `[...]`, or a commented `// [...]` / `# ...`. Blanked
// like a directive, so the surrounding document parses and the line numbering still holds.
const ELISION_BRACKET_RE = /^[ \t]*(?:(?:#|\/\/|;|--)[ \t]*)?\[\.\.\.\][ \t]*$/;
const ELISION_COMMENT_RE = /^[ \t]*(?:#|\/\/|;|--)[ \t]*\.\.\.[ \t]*$/;

// `%%name=default%%` — the placeholder carries the value the article renders by default.
const PLACEHOLDER_WITH_DEFAULT_RE = /%%([A-Za-z_][A-Za-z0-9_]*)=([^%]*)%%/g;

// `%%name%%` — the bare form, used by 4 placeholders in this corpus (`%%port%%`, `%%cdb%%`,
// `%%pdb%%`, `%%variable%%`). TODO 0132 assumed every placeholder carried its own default;
// these do not, so the name itself is substituted. It is a bare word in every position where
// the corpus uses it, which keeps the result parseable — the point is to stop the linter
// choking on `%%`, not to produce a runnable file.
const PLACEHOLDER_BARE_RE = /%%([A-Za-z_][A-Za-z0-9_]*)%%/g;

/**
 * @param {string} content raw file content, exactly as stored in the repository.
 * @returns {{text: string, strippedDirectives: number, strippedElisions: number,
 *   substitutedPlaceholders: number}}
 */
export function normalizeSnippet(content) {
  let strippedDirectives = 0;
  let strippedElisions = 0;
  let substitutedPlaceholders = 0;

  const lines = content.split("\n").map((line) => {
    if (HIGHLIGHT_LINE_RE.test(line)) {
      strippedDirectives += 1;
      return "";
    }
    if (ELISION_BRACKET_RE.test(line) || ELISION_COMMENT_RE.test(line)) {
      strippedElisions += 1;
      return "";
    }
    return line;
  });

  const text = lines
    .join("\n")
    .replace(PLACEHOLDER_WITH_DEFAULT_RE, (_m, _name, value) => {
      substitutedPlaceholders += 1;
      return value;
    })
    .replace(PLACEHOLDER_BARE_RE, (_m, name) => {
      substitutedPlaceholders += 1;
      return name;
    });

  return { text, strippedDirectives, strippedElisions, substitutedPlaceholders };
}
