/**
 * Marker parsing shared by `<Vars>`'s consumers (`Terminal`, `Snippet`).
 *
 * Syntax: `%%name=default%%` — e.g. `%%port=8080%%`. Two things it
 * deliberately avoids:
 * - `{{…}}`: a `<Terminal>`/`<Snippet>` used with literal inline MDX children
 *   (the common case — no `source=`) has its content parsed as MDX, and a
 *   bare `{` there opens a JS expression, not literal text — `{{port:80}}`
 *   would either fail to compile (`port:80` isn't a valid expression) or
 *   silently mean something else entirely;
 * - a bare colon (`%%port:8080%%`): `plugins/markdown-export-plugin/degrade.cjs`
 *   parses the raw article source with `remark-directive` (for `:::tip`
 *   admonitions), and that plugin's inline `:name` syntax false-positives on
 *   any `word:word` text — exactly what a colon-separated marker looks like
 *   — logging a spurious "unknown directive" warning for every occurrence.
 *   Confirmed empirically while building TODO 0088.
 *
 * `%` carries no meaning in Markdown/MDX/YAML and `=` doesn't trigger
 * remark-directive, so `%%name=default%%` is safe both inline and loaded
 * from a `source=` file, and silent in the export tool.
 *
 * The default is embedded in the marker itself, not looked up from the
 * `<Vars>` declaration:
 * - it's what makes SSR/no-JS output correct without any coordination
 *   between components (a `<Terminal>` never has to know whether a `<Vars>`
 *   block exists earlier in the same article, or ran first);
 * - it's what `plugins/markdown-export-plugin/degrade.cjs` resolves too, so
 *   the exported `.md` mirror and `llms.txt` show real values, never markers
 *   — see that file's own copy of this regex;
 * - it keeps a mistyped or missing `<Vars>` declaration harmless: the command
 *   still renders correctly, just not reader-adjustable.
 *
 * `<Vars port="8080" .../>`'s own prop values are the source of truth for
 * what the bar *displays and resets to* — keep them equal to the matching
 * marker defaults in the article's prose, or the bar and the commands will
 * disagree about "default".
 */

import {
  Fragment,
  isValidElement,
  cloneElement,
  createElement,
  type ReactElement,
  type ReactNode,
} from "react";
import type { VarResolver } from "./store";

export const VAR_MARKER_RE = /%%(\w+)=([^%]*)%%/g;

type RenderToken = (name: string, value: string, key: string) => ReactNode;

export function substitutePlainText(text: string, resolve: VarResolver): string {
  return text.replace(VAR_MARKER_RE, (_match, name, defaultValue) =>
    resolve(name, defaultValue),
  );
}

/**
 * Same substitution, but for a React children tree (Terminal's / Snippet's
 * MDX `children`, as opposed to a plain string). Marker occurrences become
 * `<span>` tokens (via `renderToken`) so the reader gets a visible "this
 * value is yours" affordance and the copy button — which walks
 * `children.props.children`, see Terminal's `getCopyText` — still copies the
 * live text, since that's exactly what the span's own children are.
 *
 */
export function substituteChildren(
  children: ReactNode,
  resolve: VarResolver,
  renderToken: RenderToken,
): ReactNode {
  let keySeed = 0;

  function walk(node: ReactNode): ReactNode {
    if (typeof node === "string") {
      if (!node.includes("%%")) return node;
      const parts: ReactNode[] = [];
      let lastIndex = 0;
      for (const match of node.matchAll(VAR_MARKER_RE)) {
        const [full, name, defaultValue] = match;
        const matchIndex = match.index ?? 0;
        if (matchIndex > lastIndex) {
          parts.push(node.slice(lastIndex, matchIndex));
        }
        const value = resolve(name, defaultValue);
        parts.push(renderToken(name, value, `var-${keySeed++}`));
        lastIndex = matchIndex + full.length;
      }
      if (lastIndex < node.length) parts.push(node.slice(lastIndex));
      if (parts.length === 1) return parts[0];
      // Wrapped in a Fragment, not a bare array: Terminal's getCopyText joins
      // *array* siblings with "\n" (that's how it reassembles a Terminal's
      // separate source lines — see its own comment), which is exactly wrong
      // for fragments of a single line split by substitution. getCopyText
      // special-cases Fragment to join its children with "" instead — keep
      // both in sync if either changes.
      return createElement(Fragment, { key: `var-frag-${keySeed++}` }, parts);
    }
    if (Array.isArray(node)) {
      // A genuine JS array of children (as opposed to compile-time JSX
      // children, which never need keys) — React requires a `key` on every
      // element once it's rendered from an array. The original array may
      // have been keyed already by MDX (rare) or not at all (the common
      // case for a Terminal's multi-line literal content); either way,
      // `walk()` can produce a *new* array via `.map()`, so every entry
      // needs an explicit, stable key regardless of what it had before.
      return node.map((child, index) => {
        const walked = walk(child);
        if (typeof walked === "string" || typeof walked === "number") return walked;
        if (isValidElement(walked)) {
          const seedKey = walked.key ?? `var-child-${index}`;
          return cloneElement(walked, { key: seedKey });
        }
        return walked;
      });
    }
    if (
      isValidElement(node) &&
      node.props != null &&
      typeof node.props === "object" &&
      "children" in node.props
    ) {
      return cloneElement(
        node as ReactElement<{ children?: ReactNode }>,
        {},
        walk((node.props as { children?: ReactNode }).children),
      );
    }
    return node;
  }

  return walk(children);
}
