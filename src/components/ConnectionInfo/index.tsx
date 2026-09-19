import React, { type JSX } from "react";
import styles from "./styles.module.css";

interface ConnectionItem {
  label: string;
  value: string;
}

interface Props {
  items: ConnectionItem[];
  title?: string;
}

/**
 * ConnectionInfo renders a label/value table of connection settings.
 *
 * Markup notes (design harmonisation): Infima's "card" / "shadow--md" /
 * "card__header" / "card__body" classes are gone. "shadow--md" was a fifth
 * elevation value in the site, and the card wrappers forced this component's
 * own stylesheet to fight them with !important on two properties. The surface
 * now comes from the shared tokens, and the title is an eyebrow rather than an
 * <h3> that sat in the article's outline.
 */
export default function ConnectionInfo({ items = [], title }: Props): JSX.Element | null {
  if (!items || items.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      {title && <p className={styles.title}>{title}</p>}
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
  );
}
