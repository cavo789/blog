import { useState, useEffect, type ReactNode } from "react";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type {
  BlueskyEmbed,
  BlueskyMetadata,
  BlueskyPostRecord,
  BlueskyReplyNode,
  BlueskySiteConfig,
} from "./useBlueskyEngagement";

// Bluesky facet indices are UTF-8 byte offsets, not JS string indices.
// TextEncoder/TextDecoder ensures correct slicing for non-ASCII text (emoji, accents…).
function renderPostText(record: BlueskyPostRecord): ReactNode {
  const text = record.text;
  const facets = record.facets || [];
  if (facets.length === 0) return text;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  const parts: ReactNode[] = [];
  let lastIndex = 0;

  facets.forEach((facet, idx) => {
    const start = facet.index.byteStart;
    const end = facet.index.byteEnd;

    const before = decoder.decode(bytes.slice(lastIndex, start));
    if (before) parts.push(before);

    const linkFeature = facet.features.find(
      (f) => f.$type === "app.bsky.richtext.facet#link",
    );
    if (linkFeature) {
      parts.push(
        <a
          key={`link-${idx}`}
          href={linkFeature.uri}
          target="_blank"
          rel="noopener noreferrer"
        >
          {decoder.decode(bytes.slice(start, end))}
        </a>,
      );
    } else {
      parts.push(decoder.decode(bytes.slice(start, end)));
    }

    lastIndex = end;
  });

  if (lastIndex < bytes.length) {
    parts.push(decoder.decode(bytes.slice(lastIndex)));
  }

  return parts;
}

function renderEmbed(embed: BlueskyEmbed | null | undefined): ReactNode {
  if (!embed) return null;

  // Narrowed by property presence, not by `$type` equality: `BlueskyEmbed`'s catch-all
  // member types `$type` as a plain `string` (any other embed kind the API can return —
  // video, record quote, …), so a literal-equality check can't exclude it and `embed.external`
  // wouldn't narrow.
  if ("external" in embed) {
    const { uri, title, thumb } = embed.external;

    return (
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.blueskyCommentEmbed}
      >
        {thumb && <img src={thumb} alt="" className={styles.blueskyCommentEmbedThumb} />}
        <div className={styles.blueskyCommentEmbedContent}>
          <strong>{title}</strong>
        </div>
      </a>
    );
  }

  if ("images" in embed) {
    return (
      <div className={styles.blueskyCommentImages}>
        {embed.images.map((image, index) => (
          <img
            key={index}
            src={image.fullsize}
            alt={image.alt || "Embedded image"}
            className={styles.blueskyCommentImage}
          />
        ))}
      </div>
    );
  }

  return null;
}

interface FlattenedReply extends BlueskyReplyNode {
  depth: number;
}

function BlueskyComment({ reply }: { reply: FlattenedReply }) {
  const recordKey = reply.post.uri.split("/").pop();
  const profileUrl = `https://bsky.app/profile/${reply.post.author.handle}`;
  const commentUrl = `https://bsky.app/profile/${reply.post.author.handle}/post/${recordKey}`;
  const date = new Date(reply.post.indexedAt).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={styles.blueskyCommentContainer}
      style={{ paddingLeft: `${1.5 + reply.depth * 1.5}rem` }}
    >
      <div className={`${styles.blueskyCommentHeader} mb-2 flex items-center`}>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={reply.post.author.avatar}
            alt={`${reply.post.author.displayName}'s avatar`}
            className={styles.blueskyCommentAvatar}
          />
        </a>
        <div className={styles.blueskyCommentAuthorInfos}>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.blueskyCommentAuthorDisplayName}
          >
            {reply.post.author.displayName}
          </a>
          <span className={styles.blueskyCommentAuthorHandle}>
            @{reply.post.author.handle}
          </span>
        </div>
      </div>

      <span className={styles.blueskyCommentDate}>{date}</span>

      <p className={styles.blueskyCommentText}>{renderPostText(reply.post.record)}</p>

      {renderEmbed(reply.post.embed)}

      <div className={styles.blueskyCommentFooter}>
        <span className={styles.blueskyCommentLikes}>{reply.post.likeCount}</span>
        <span className={styles.blueskyCommentReposts}>
          {reply.post.repostCount || 0}
        </span>
        <a
          className={styles.blueskyCommentLink}
          href={commentUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          View comment
        </a>
      </div>
    </div>
  );
}

interface PostThreadResponse {
  thread: {
    replies?: BlueskyReplyNode[];
  };
}

interface Props {
  metadata: BlueskyMetadata;
}

export default function BlueskyComments({ metadata }: Props) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky as
    BlueskySiteConfig | undefined;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  const [comments, setComments] = useState<FlattenedReply[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!blueskyRecordKey || !blueSkyConfig?.handle) return;

    const fetchComments = async () => {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueskyRecordKey}`;
        const url =
          "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=5&uri=" +
          encodeURIComponent(postUri);

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch post thread");
        const data = (await res.json()) as PostThreadResponse;

        const allComments: FlattenedReply[] = [];
        const flattenReplies = (arr: BlueskyReplyNode[] | undefined, depth: number) => {
          if (!arr) return;
          for (const r of arr) {
            allComments.push({ ...r, depth });
            if (r.replies) flattenReplies(r.replies, depth + 1);
          }
        };

        if (data.thread?.replies) {
          flattenReplies(data.thread.replies, 0);
        }

        setComments(allComments);
      } catch (err) {
        // Offline, blocked by the visitor, or Bluesky unreachable: stay silent
        // rather than surface a raw error — same outcome as no comments to show.
        console.error(err);
        setError(true);
      }
    };
    fetchComments();
  }, [blueskyRecordKey, blueSkyConfig?.handle]);

  if (!blueskyRecordKey || error) return null;
  if (comments === null) return <p>Loading comments…</p>;

  const postUrl = `https://bsky.app/profile/${blueSkyConfig?.handle}/post/${blueskyRecordKey}`;

  if (comments.length === 0)
    return (
      <p className={styles.blueskyNoCommentYet}>
        This post is waiting for its first comment.&nbsp;
        <a
          className={styles.blueskyNoCommentYetCTA}
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share your thoughts!
        </a>
      </p>
    );

  return (
    <div className={styles.blueskyCommentsContainer}>
      <h3>💬 Comments from Bluesky ({comments.length})</h3>
      {comments.map((reply) => (
        <BlueskyComment key={reply.post.uri} reply={reply} />
      ))}
    </div>
  );
}
