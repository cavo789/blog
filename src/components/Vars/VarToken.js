import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./styles.module.css";

/**
 * Renders one resolved `%%name=default%%` marker inside a `<Terminal>`/
 * `<Snippet>` block: a permanent dotted underline (the marker is
 * reader-adjustable) plus a brief flash whenever the value actually changes.
 *
 * `inline` (used by `<Var>`, the plain-prose sibling — see readme.md) renders
 * a `<code>` tag instead of a `<span>`: prose usage sits next to ordinary
 * `` `backtick` `` spans, which Infima styles as a rounded pill via its own
 * `code` element selector. A bare `<span>` there breaks that pill visually —
 * the token reads as plain text dropped between two code fragments instead
 * of one continuous command (see TODO 0104 review feedback, screenshot of
 * `docker-joomla` with the "racour"/"8383" test). Using `<code>` inherits
 * Infima's pill for free instead of duplicating it; only the dotted
 * underline + flash are this component's own addition. Terminal/Snippet
 * usage keeps the `<span>` — no adjacent code pills to match there, and the
 * ambient monospace terminal background would make a `<code>` pill's own
 * background/padding look out of place.
 */
export default function VarToken({ children, inline = false }) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(children);

  useEffect(() => {
    if (prevValue.current === children) return undefined;
    prevValue.current = children;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 550);
    return () => clearTimeout(timer);
  }, [children]);

  const Tag = inline ? "code" : "span";
  return (
    <Tag
      className={clsx(
        inline ? styles.tokenInline : styles.token,
        flash && styles.tokenFlash,
      )}
    >
      {children}
    </Tag>
  );
}

VarToken.propTypes = {
  // A plain resolved string — never the marker itself. Deliberately named
  // `children` (not e.g. `value`) so `Terminal`'s `getCopyText`, which
  // recurses into `element.props.children` for any unrecognized element,
  // picks up the live value for free instead of needing a VarToken special
  // case.
  children: PropTypes.string.isRequired,
  // True for `<Var>`'s plain-prose usage — see the doc comment above.
  inline: PropTypes.bool,
};
