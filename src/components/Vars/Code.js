import { Children, cloneElement, isValidElement } from "react";
import PropTypes from "prop-types";
import Var from "./Var";

/**
 * Wraps literal text and one or more `<Var>`s in a single `<code>` element,
 * instead of the backtick-close/`<Var>`/backtick-reopen pattern this
 * component exists to replace.
 *
 * That pattern is unavoidable in plain prose — a single-backtick span is
 * literal text in Markdown, so `<Var>` can never sit *inside* one — but it
 * produces three separate sibling `<code>` tags, each carrying Infima's own
 * padding/border-radius. Three pills sitting next to each other read as
 * "three fragments," not "one command": a visible gap shows between them
 * (see TODO 0104 review feedback, docker-volume screenshot with `9898`).
 *
 * `<Code>` sidesteps the constraint the other way around: MDX children of a
 * *component* (as opposed to a backtick span) are ordinary JSX, so mixing
 * plain text and `<Var>` inside `<Code>...</Code>` is just normal children —
 * no markers, no escaping. Every `<Var>` found among the children is cloned
 * with `bare` set, so it renders as a plain inline token (dotted underline,
 * no pill of its own — see VarToken.js) instead of nesting a second `<code>`
 * inside this one, which would both be invalid HTML and reintroduce the same
 * gap this component exists to remove.
 *
 * Usage: `<Code>http://127.0.0.1:<Var name="port">81</Var>/</Code>`
 */
export default function Code({ children }) {
  const processed = Children.map(children, (child) =>
    isValidElement(child) && child.type === Var
      ? cloneElement(child, { bare: true })
      : child,
  );
  return <code>{processed}</code>;
}

Code.propTypes = {
  children: PropTypes.node.isRequired,
};
