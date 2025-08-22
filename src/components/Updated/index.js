/**
 * UpdateAt Component
 *
 * Displays a timeline of updates in a styled vertical layout.
 * Each update includes a date and content block. An optional title
 * is displayed above the timeline.
 *
 * Features:
 * - Customizable title (defaults to "Last updates at")
 * - Styled timeline layout using CSS modules
 * - Flexible content rendering for each update
 *
 * Props:
 * @param {Array<{ date: string, content: React.ReactNode }>} updates - List of updates to display.
 * @param {string} [title="Last updates at"] - Optional title displayed above the timeline.
 *
 * Example usage:
 * <UpdateAt
 *   title="Recent Changes"
 *   updates={[
 *     { date: "2025-08-20", content: "Added new feature to dashboard" },
 *     { date: "2025-08-18", content: <strong>Improved performance</strong> },
 *   ]}
 * />
 */
import PropTypes from "prop-types";
import styles from './styles.module.css';

/** Basic Markdown parser: **bold**, *italic*, `inline code`, [link](url) */
function parseMarkdown(text) {
  if (!text) return '';

  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')         // bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>')                     // italic
    .replace(/`(.*?)`/g, '<code>$1</code>')                   // inline code
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>'); // links
}

export default function UpdateAt({ updates, title="Last updates at" }) {
  // Reverse updates to show the newest first
  const sortedUpdates = [...updates].reverse();

  return (
    <div className={styles.timeline_wrapper}>
      {title && <div className={styles.timeline_title}>{title}</div>}

      <div className={styles.timeline_container}>
        {sortedUpdates.map((update, index) => (
          <div key={index} className={styles.timeline_item}>
            <div className={styles.timeline_date}>{update.date}</div>
            <div
              className={styles.timeline_content}
              dangerouslySetInnerHTML={{
                __html: typeof update.content === 'string'
                  ? parseMarkdown(update.content)
                  : update.content
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

UpdateAt.propTypes = {
  updates: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired
    })
  ).isRequired,
  title: PropTypes.string
};
