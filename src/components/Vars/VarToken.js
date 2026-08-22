import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./styles.module.css";

/**
 * Renders one resolved `%%name=default%%` marker inside a `<Terminal>`/
 * `<Snippet>` block: a permanent dotted underline (the marker is
 * reader-adjustable) plus a brief flash whenever the value actually changes.
 */
export default function VarToken({ children }) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(children);

  useEffect(() => {
    if (prevValue.current === children) return undefined;
    prevValue.current = children;
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 550);
    return () => clearTimeout(timer);
  }, [children]);

  return (
    <span className={clsx(styles.token, flash && styles.tokenFlash)}>{children}</span>
  );
}

VarToken.propTypes = {
  // A plain resolved string — never the marker itself. Deliberately named
  // `children` (not e.g. `value`) so `Terminal`'s `getCopyText`, which
  // recurses into `element.props.children` for any unrecognized element,
  // picks up the live value for free instead of needing a VarToken special
  // case.
  children: PropTypes.string.isRequired,
};
