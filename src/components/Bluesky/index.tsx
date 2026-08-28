import BlueskyComments from "./comments";
import BlueskyLikes from "./likes";
import BlueskyPost from "./post";
import BlueskyShare from "./share";
import styles from "./styles.module.css";
import useBlueskyEngagement, { useBlueskyRecordKey } from "./useBlueskyEngagement";
import type { BlueskyMetadata, EngagedPerson } from "./useBlueskyEngagement";

function engagementHeadline({
  blueskyRecordKey,
  loading,
  unavailable,
  engaged,
}: {
  blueskyRecordKey: string | null;
  loading: boolean;
  unavailable: boolean;
  engaged: EngagedPerson[];
}): string {
  if (!blueskyRecordKey) {
    return "🦋 Enjoyed this article? Share it on Bluesky";
  }
  if (loading || unavailable) {
    // Same neutral copy for "still fetching" and "couldn't fetch" — never claim
    // "no one reacted yet" when the truth is just "couldn't check".
    return "🦋 Join the conversation on Bluesky";
  }
  if (engaged.length === 0) {
    return "🦋 Be the first to react on Bluesky";
  }
  const count = engaged.length;
  return `🦋 ${count} ${count === 1 ? "person is" : "people are"} already talking about this on Bluesky — join them`;
}

interface Props {
  metadata: BlueskyMetadata;
}

export default function Bluesky({ metadata }: Props) {
  // The frontmatter key always wins (manual override); otherwise it's looked up
  // from the account's own Bluesky post history, matched against this article's
  // URL — see useBlueskyRecordKey for why and how.
  const { recordKey, resolving } = useBlueskyRecordKey(metadata);
  const effectiveMetadata: BlueskyMetadata = {
    ...metadata,
    frontMatter: { ...metadata.frontMatter, blueskyRecordKey: recordKey ?? undefined },
  };
  const stats = useBlueskyEngagement(effectiveMetadata);

  // Still checking whether this article was already promoted — skip the frame
  // rather than flash a "Share on Bluesky" button that may disappear a moment
  // later once a match is found.
  if (resolving) return null;

  return (
    <div className={styles.blueskyContainer}>
      <span className={styles.blueskyHeadline}>
        {engagementHeadline({
          blueskyRecordKey: recordKey,
          loading: stats.loading,
          unavailable: stats.unavailable,
          engaged: stats.engaged,
        })}
      </span>

      {/* No Bluesky post found for this article: show a share button */}
      <BlueskyShare metadata={effectiveMetadata} />

      {/* A Bluesky post was found and its data actually loaded: show engagement UI.
          Hiding BlueskyPost too when unavailable — a resolved key can point to a
          post that was since deleted, and a link straight to a 404 is worse than
          no link. */}
      {!stats.unavailable && (
        <div className={styles.blueskyEngagementRow}>
          <BlueskyPost metadata={effectiveMetadata} />
          <BlueskyLikes stats={stats} />
        </div>
      )}

      <span className={styles.blueskyAccountNote}>
        Requires a free Bluesky account to like, repost or comment. This block talks to
        Bluesky&apos;s public API directly from your browser (no cookies, no sign-in) —
        that means your IP address reaches Bluesky&apos;s servers just by this section
        loading.
      </span>

      <BlueskyComments metadata={effectiveMetadata} />
    </div>
  );
}
