import PropTypes from "prop-types";
import styles from "./styles.module.css";

const MAX_AVATARS = 10;

// Bluesky facets are keyed by "liked", "reposted", "commented" — a person can carry more than one.
function describeActions(actions) {
  const verbs = [];
  if (actions.has("liked")) verbs.push("liked");
  if (actions.has("reposted")) verbs.push("reposted");
  if (actions.has("commented")) verbs.push("commented on");

  if (verbs.length === 1) return verbs[0];
  return `${verbs.slice(0, -1).join(", ")} and ${verbs[verbs.length - 1]}`;
}

export default function BlueskyLikes({ stats }) {
  if (stats.loading || stats.likes === null) {
    return null;
  }

  const shown = stats.engaged.slice(0, MAX_AVATARS);
  const extraEngaged = stats.engaged.length - shown.length;

  return (
    <span className={styles.blueskyPostLikes}>
      <span
        className={styles.blueskyCommentLikes}
        title={`The original post has ${stats.likes} likes on Bluesky`}
      >
        {stats.likes}
      </span>
      <span
        className={styles.blueskyCommentReposts}
        title={`The original post has been shared ${stats.reposts} times on Bluesky`}
      >
        {stats.reposts}
      </span>
      {shown.length > 0 && (
        <span className={styles.blueskyLikersAvatars}>
          {shown.map((person, index) => (
            <a
              key={person.did}
              href={`https://bsky.app/profile/${person.handle}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.blueskyLikersAvatarLink}
              style={{ zIndex: shown.length - index }}
              title={`${person.displayName} (@${person.handle}) ${describeActions(
                person.actions,
              )} this post`}
            >
              <img
                src={person.avatar}
                alt={`${person.displayName}'s avatar`}
                className={styles.blueskyLikersAvatar}
              />
            </a>
          ))}
          {extraEngaged > 0 && (
            <span className={styles.blueskyLikersAvatarMore}>+{extraEngaged}</span>
          )}
        </span>
      )}
    </span>
  );
}

BlueskyLikes.propTypes = {
  stats: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    likes: PropTypes.number,
    reposts: PropTypes.number,
    engaged: PropTypes.arrayOf(
      PropTypes.shape({
        did: PropTypes.string.isRequired,
        handle: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        avatar: PropTypes.string,
        actions: PropTypes.instanceOf(Set).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};
