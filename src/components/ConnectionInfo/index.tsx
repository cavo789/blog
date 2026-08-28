import React, { type JSX } from "react";
import clsx from "clsx";
import styles from "./styles.module.css";

interface ConnectionItem {
  label: string;
  value: string;
}

interface Props {
  items: ConnectionItem[];
  title?: string;
}

export default function ConnectionInfo({ items = [], title }: Props): JSX.Element | null {
  if (!items || items.length === 0) return null;

  return (
    <div className={clsx(styles.wrapper, "card", "shadow--md")}>
      {title && (
        <div className="card__header">
          <h3 className={styles.title}>{title}</h3>
        </div>
      )}
      <div className="card__body">
        <dl className={styles.grid}>
          {items.map(({ label, value }, index) => (
            <React.Fragment key={index}>
              <dt className={styles.label}>{label}</dt>
              <dd className={styles.value}>
                <code>{value}</code>
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </div>
    </div>
  );
}
