import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

// Bluesky facet indices are UTF-8 byte offsets, not JS string indices.
// TextEncoder/TextDecoder ensures correct slicing for non-ASCII text (emoji, accents…).
function renderPostText(record) {
  const text = record.text;
  const facets = record.facets || [];
  if (facets.length === 0) return text;

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const bytes = encoder.encode(text);

  const parts = [];
  let lastIndex = 0;

  facets.forEach((facet, idx) => {
    const start = facet.index.byteStart;
    const end = facet.index.byteEnd;

    const before = decoder.decode(bytes.slice(lastIndex, start));
    if (before) parts.push(before);

    const linkFeature = facet.features.find(
      (f) => f.$type === "app.bsky.richtext.facet#link"
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
        </a>
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

function renderEmbed(embed) {
  if (!embed) return null;

  if (embed.$type === "app.bsky.embed.external#view") {
    const { uri, title, thumb } = embed.external;

    return (
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.blueskyCommentEmbed}
      >
        {thumb && (
          <img src={thumb} alt="" className={styles.blueskyCommentEmbedThumb} />
        )}
        <div className={styles.blueskyCommentEmbedContent}>
          <strong>{title}</strong>
        </div>
      </a>
    );
  }

  if (embed.$type === "app.bsky.embed.images#view") {
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

function BlueskyComment({ reply }) {
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

      <p className={styles.blueskyCommentText}>
        {renderPostText(reply.post.record)}
      </p>

      {renderEmbed(reply.post.embed)}

      <div className={styles.blueskyCommentFooter}>
        <span className={styles.blueskyCommentLikes}>
          {reply.post.likeCount}
        </span>
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

BlueskyComment.propTypes = {
  reply: PropTypes.shape({
    post: PropTypes.shape({
      uri: PropTypes.string.isRequired,
      indexedAt: PropTypes.string.isRequired,
      likeCount: PropTypes.number.isRequired,
      repostCount: PropTypes.number,
      author: PropTypes.shape({
        handle: PropTypes.string.isRequired,
        displayName: PropTypes.string.isRequired,
        avatar: PropTypes.string.isRequired,
      }).isRequired,
      record: PropTypes.shape({
        text: PropTypes.string.isRequired,
        facets: PropTypes.array,
      }).isRequired,
      embed: PropTypes.object,
    }).isRequired,
    depth: PropTypes.number.isRequired,
  }).isRequired,
};

export default function BlueskyComments({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  const [comments, setComments] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!blueskyRecordKey || !blueSkyConfig?.handle) return;

    async function fetchComments() {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueskyRecordKey}`;
        const url =
          "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=5&uri=" +
          encodeURIComponent(postUri);

        const res = await fetch(url);
        const data = await res.json();

        const allComments = [];
        const flattenReplies = (arr, depth) => {
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
        console.error(err);
        setError(true);
      }
    }
    fetchComments();
  }, [blueskyRecordKey, blueSkyConfig?.handle]);

  if (!blueskyRecordKey) return null;
  if (error) return <p>Error loading comments.</p>;
  if (comments === null) return <p>Loading comments…</p>;

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${blueskyRecordKey}`;

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

BlueskyComments.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string,
    }),
  }).isRequired,
};
