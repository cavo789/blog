import PropTypes from "prop-types";
import { useVarResolver } from "./store";
import VarToken from "./VarToken";

/**
 * Inline sibling of the `%%name=default%%` marker `<Terminal>`/`<Snippet>`
 * resolve internally (see substitute.js) — for plain prose instead. MDX text
 * nodes are never routed through `substituteChildren`, so typing a marker
 * directly into a paragraph would render as literal, unresolved `%%...%%`
 * text. `<Var>` is a real component instead, reading from the same store, so
 * a sentence can reference the reader's value without hiding it inside a
 * command block.
 *
 * Usage: `<Var name="name">kingsbridge</Var>` — children is the default,
 * exactly the `=default` half of a marker. Keep it identical to the value a
 * sibling `<Vars>` declares for that name, the same way a marker's own
 * embedded default should match.
 *
 * Standalone, `<Var>` renders its own `<code>` pill (matching the backtick
 * spans it usually sits next to). Nested inside `<Code>` — the way to keep a
 * whole command in one code span instead of three, see Code.js — pass
 * `bare`: `Code` sets it automatically on every `<Var>` it finds among its
 * children, never set it by hand outside that context.
 */
export default function Var({ name, children, bare = false }) {
  const resolve = useVarResolver();
  return <VarToken inline={!bare}>{resolve(name, children)}</VarToken>;
}

Var.propTypes = {
  name: PropTypes.string.isRequired,
  // A plain default string, e.g. `<Var name="port">8080</Var>` — not a
  // `%%port=8080%%` marker, there is nothing here to parse.
  children: PropTypes.string.isRequired,
  // Internal — set by `<Code>`, never by hand. True renders a plain inline
  // token (no `<code>` of its own) so it nests inside `Code`'s single
  // `<code>` instead of producing invalid nested `<code>` tags.
  bare: PropTypes.bool,
};
