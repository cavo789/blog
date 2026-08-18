import React from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import styles from "./styles.module.css";

export default function ConnectionInfo({ items = [], title }) {
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

ConnectionInfo.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  title: PropTypes.string,
};
