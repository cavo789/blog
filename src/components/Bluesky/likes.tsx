import styles from "./styles.module.css";
import { translate } from "@docusaurus/Translate";
import type {
  EngagedPerson,
  EngagementAction,
  EngagementStats,
} from "./useBlueskyEngagement";

const MAX_AVATARS = 10;

// Bluesky facets are keyed by "liked", "reposted", "commented" — a person can carry more than one.
function describeActions(actions: Set<EngagementAction>): string {
  // Each verb is translated on its own and the list is joined here. That holds in French too
  // ("a aimé, a repartagé et a commenté"), which is cheaper than translating all seven
  // combinations as whole sentences.
  const verbs: string[] = [];
  if (actions.has("liked")) {
    verbs.push(translate({ id: "bluesky.likes.verbLiked", message: "liked" }));
  }
  if (actions.has("reposted")) {
    verbs.push(translate({ id: "bluesky.likes.verbReposted", message: "reposted" }));
  }
  if (actions.has("commented")) {
    verbs.push(translate({ id: "bluesky.likes.verbCommented", message: "commented on" }));
  }

  if (verbs.length === 1) return verbs[0];
  const and = translate({ id: "bluesky.likes.and", message: "and" });
  return `${verbs.slice(0, -1).join(", ")} ${and} ${verbs[verbs.length - 1]}`;
}

interface Props {
  stats: EngagementStats;
}

export default function BlueskyLikes({ stats }: Props) {
  if (stats.loading || stats.likes === null) {
    return null;
  }

  const shown: EngagedPerson[] = stats.engaged.slice(0, MAX_AVATARS);
  const extraEngaged = stats.engaged.length - shown.length;

  return (
    <span className={styles.blueskyPostLikes}>
      <span
        className={styles.blueskyCommentLikes}
        title={translate(
          {
            id: "bluesky.likes.likesTitle",
            message: "The original post has {count} likes on Bluesky",
          },
          { count: stats.likes },
        )}
      >
        {stats.likes}
      </span>
      <span
        className={styles.blueskyCommentReposts}
        title={translate(
          {
            id: "bluesky.likes.repostsTitle",
            message: "The original post has been shared {count} times on Bluesky",
          },
          // Only `likes` is narrowed by the guard above; `reposts` can still be null here.
          { count: stats.reposts ?? 0 },
        )}
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
              title={translate(
                {
                  id: "bluesky.likes.personTitle",
                  message: "{name} (@{handle}) {actions} this post",
                },
                {
                  name: person.displayName,
                  handle: person.handle,
                  actions: describeActions(person.actions),
                },
              )}
            >
              <img
                src={person.avatar}
                alt={translate(
                  { id: "bluesky.avatarAlt", message: "{name}'s avatar" },
                  { name: person.displayName },
                )}
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
