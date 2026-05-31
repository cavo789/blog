import BlueskyComments from "./comments";
import BlueskyLikes from "./likes";
import BlueskyPost from "./post";
import BlueskyShare from "./share";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function Bluesky({ metadata }) {
  return (
    <div className={styles.blueskyContainer}>
      {/* No blueskyRecordKey in frontmatter: show a share button */}
      <BlueskyShare metadata={metadata} />

      {/* blueskyRecordKey present: show engagement UI */}
      <BlueskyPost metadata={metadata} />
      <BlueskyLikes metadata={metadata} />
      <BlueskyComments metadata={metadata} />
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
