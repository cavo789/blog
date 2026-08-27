import BlueskyComments from "./comments";
import BlueskyLikes from "./likes";
import BlueskyPost from "./post";
import BlueskyShare from "./share";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useBlueskyEngagement from "./useBlueskyEngagement";

function engagementHeadline({ blueskyRecordKey, loading, engaged }) {
  if (!blueskyRecordKey) {
    return "🦋 Enjoyed this article? Share it on Bluesky";
  }
  if (loading) {
    return "🦋 Join the conversation on Bluesky";
  }
  if (engaged.length === 0) {
    return "🦋 Be the first to react on Bluesky";
  }
  const count = engaged.length;
  return `🦋 ${count} ${count === 1 ? "person is" : "people are"} already talking about this on Bluesky — join them`;
}

export default function Bluesky({ metadata }) {
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;
  const stats = useBlueskyEngagement(metadata);

  return (
    <div className={styles.blueskyContainer}>
      <span className={styles.blueskyHeadline}>
        {engagementHeadline({
          blueskyRecordKey,
          loading: stats.loading,
          engaged: stats.engaged,
        })}
      </span>

      {/* No blueskyRecordKey in frontmatter: show a share button */}
      <BlueskyShare metadata={metadata} />

      {/* blueskyRecordKey present: show engagement UI */}
      <div className={styles.blueskyEngagementRow}>
        <BlueskyPost metadata={metadata} />
        <BlueskyLikes stats={stats} />
      </div>

      <span className={styles.blueskyAccountNote}>
        Requires a free Bluesky account to like, repost or comment.
      </span>

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
