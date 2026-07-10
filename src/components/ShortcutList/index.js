import React from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function ShortcutList({ items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <ul className={styles.list}>
      {items.map(({ keys, desc }, i) => (
        <li key={i} className={styles.row}>
          <span className={styles.keys}>
            {keys.map((k, j) => (
              <React.Fragment key={j}>
                {j > 0 && <span className={styles.plus}>+</span>}
                <kbd>{k}</kbd>
              </React.Fragment>
            ))}
          </span>
          <span className={styles.desc}>{desc}</span>
        </li>
      ))}
    </ul>
  );
}

ShortcutList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      keys: PropTypes.arrayOf(PropTypes.string).isRequired,
      desc: PropTypes.node.isRequired,
    }),
  ).isRequired,
};
