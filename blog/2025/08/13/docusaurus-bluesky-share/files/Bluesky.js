import BlueskyShare from "./share";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function Bluesky({ metadata }) {
  return (
    <div className={styles.blueskyContainer}>
      <BlueskyShare metadata={metadata} />
    </div>
  );
}

Bluesky.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string,
    }),
  }).isRequired,
};
