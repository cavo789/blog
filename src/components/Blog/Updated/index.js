import PropTypes from "prop-types";
import clsx from "clsx";

import styles from "./styles.module.css";

/**
 * Updated component displays a changelog with a list of updates.
 *
 * Each update contains a date and a note. Dates are formatted
 * in `YYYY-MM-DD` format.
 *
 * @example
 * Just add something like this in your YAML front matter:
 *
 * ---
 * updates:
 * - date: 2025-01-12
 *   note: "Fixed login issue"
 * - date: 2025-01-12
 *   note: ""Improved onboarding flow"
 * ---
 *
 * @param {Object[]} updates - List of updates to display
 * @param {string} updates[].date - ISO date string of the update
 * @param {string} updates[].note - Description of the update
 */

/** Basic Markdown parser: **bold**, *italic*, `inline code`, [link](url) */
function parseMarkdown(text) {
  if (!text) return "";

  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // bold
    .replace(/\*(.*?)\*/g, "<em>$1</em>") // italic
    .replace(/`(.*?)`/g, "<code>$1</code>") // inline code
    .replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    ); // links
}

const Updated = ({ updates }) => {
  if (!updates || updates.length === 0) return null;

  return (
    <div
      className={clsx(
        styles.revisionHistoryContainer,
        "card",
        "shadow--md",
        "margin-top--lg"
      )}
    >
      <div className="card__header">
        <h3 className={styles.revisionHistoryTitle}>
          <span role="img" aria-label="Changelog">
            📜
          </span>{" "}
          Changelog
        </h3>
      </div>
      <div className="card__body">
        <ul className={styles.revisionList}>
          {updates.map((update, i) => (
            <li key={i} className={styles.revisionItem}>
              <div className={styles.revisionDate}>
                <time dateTime={update.date}>{formatDate(update.date)}</time>
              </div>
              <div
                className={styles.revisionDescription}
                dangerouslySetInnerHTML={{
                  __html: parseMarkdown(update.note),
                }}
              />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Utility function to format date strings
const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch (e) {
    console.error("Date formatting error:", e);
    return dateString;
  }
};

Updated.propTypes = {
  updates: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      note: PropTypes.string.isRequired,
    })
  ),
};

export default Updated;
