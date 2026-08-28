import React, { type JSX, type ReactNode } from "react";
import styles from "./styles.module.css";

interface ShortcutItem {
  keys: string[];
  desc: ReactNode;
}

interface Props {
  items: ShortcutItem[];
}

export default function ShortcutList({ items = [] }: Props): JSX.Element | null {
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
