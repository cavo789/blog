/**
 * 📬 BlueSkyComments Component
 *
 * Displays a threaded list of comments associated with a specific BlueSky post.
 * This component is conditionally rendered based on the presence of a `blueSkyRecordKey`
 * in the YAML frontmatter of a Docusaurus document.
 *
 * 🔍 Behavior:
 * - If `blueSkyRecordKey` is missing or empty: the component returns `null` and nothing is rendered.
 * - If present: it fetches the comment thread from the BlueSky public API and displays:
 *   - Author info (avatar, handle, display name)
 *   - Timestamp
 *   - Rich text with clickable links
 *   - Embedded media (images or external previews)
 *   - Like and repost counts
 *   - A link to view the comment on BlueSky
 *
 * 🧠 Notes:
 * - Comments are fetched recursively to support nested replies.
 * - Indentation is dynamically calculated based on reply depth.
 * - If no comments exist, a call-to-action is shown to encourage engagement.
 * - Requires the author's BlueSky handle to be defined in `docusaurus.config.js` under `customFields.blueSky.handle`.
 *
 * 🛠️ Example frontmatter:
 * ---
 * title: "My Post"
 * blueSkyRecordKey: 3lun2qjuxc22r
 * ---
 *
 * 🧾 Props:
 * @param {object} props
 * @param {object} props.metadata - Docusaurus document metadata
 * @param {object} [props.metadata.frontMatter] - Frontmatter object
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - Unique identifier for the BlueSky post
 *
 * 📦 Dependencies:
 * - React (useState, useEffect)
 * - Docusaurus context (`useDocusaurusContext`)
 * - Custom subcomponent: `BlueSkyComment`
 * - CSS module styles
 */

import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

/**
 * Render post text with clickable links
 *
 * @param {*} record
 * @returns
 */
function renderPostText(record) {
  const text = record.text;
  const facets = record.facets || [];
  if (facets.length === 0) return text;

  const parts = [];
  let lastIndex = 0;

  facets.forEach((facet, idx) => {
    const start = facet.index.byteStart;
    const end = facet.index.byteEnd;
    const before = text.slice(lastIndex, start);
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
          {text.slice(start, end)}
        </a>
      );
    } else {
      parts.push(text.slice(start, end));
    }

    lastIndex = end;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/**
 * Render embedded external link preview
 *
 * @param {*} embed
 * @returns
 */
function renderEmbed(embed) {
  if (!embed) return null;

  // Handle external link preview
  if (embed.$type === "app.bsky.embed.external#view") {
    const { uri, title, description, thumb } = embed.external;

    return (
      <a
        href={uri}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.blueSkyCommentEmbed}
      >
        {thumb && (
          <img src={thumb} alt="" className={styles.blueSkyCommentEmbedThumb} />
        )}
        <div className={styles.blueSkyCommentEmbedContent}>
          <strong>{title}</strong>
        </div>
      </a>
    );
  }

  // ✅ Handle image embeds
  if (embed.$type === "app.bsky.embed.images#view") {
    return (
      <div className={styles.blueSkyCommentImages}>
        {embed.images.map((image, index) => (
          <img
            key={index}
            src={image.fullsize}
            alt={image.alt || "Embedded image"}
            className={styles.blueSkyCommentImage}
          />
        ))}
      </div>
    );
  }

  // Optional: handle more embed types later (e.g. recordWithMedia)

  return null;
}

/**
 * Process a single comment/reply
 *
 * @param {Object} props
 * @param {string} props.reply - Unique record from the frontmatter
 */
function BlueSkyComment({ reply }) {
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
    // The style here is required for the correct indentation based on the deepness of the comment/reply
    <div
      className={styles.blueSkyCommentContainer}
      style={{ paddingLeft: `${1.5 + reply.depth * 1.5}rem` }}
    >
      {/* Author */}
      <div className={`${styles.blueSkyCommentHeader} mb-2 flex items-center`}>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={reply.post.author.avatar}
            alt={`${reply.post.author.displayName}'s avatar`}
            className={styles.blueSkyCommentAvatar}
          />
        </a>
        <div className={styles.blueSkyCommentAuthorInfos}>
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.blueSkyCommentAuthorDisplayName}
          >
            {reply.post.author.displayName}
          </a>
          <span className={styles.blueSkyCommentAuthorHandle}>
            @{reply.post.author.handle}
          </span>
        </div>
      </div>

      {/* Date */}
      <span className={styles.blueSkyCommentDate}>{date}</span>

      {/* Text */}
      <p className={styles.blueSkyCommentText}>
        {renderPostText(reply.post.record)}
      </p>

      {/* Embed */}
      {renderEmbed(reply.post.embed)}

      {/* Footer */}
      <div className={styles.blueSkyCommentFooter}>
        <span className={styles.blueSkyCommentLikes}>
          {reply.post.likeCount}
        </span>
        <span className={styles.blueSkyCommentReposts}>
          {reply.post.repostCount || 0}
        </span>
        <a
          className={styles.blueSkyCommentLink}
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

BlueSkyComment.propTypes = {
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

/**
 * This is the main component
 *
 * We will process any comment (replies) posted on BlueSky
 *
 * @param {object} props
 * @param {object} props.metadata - The Docusaurus document metadata, including the frontmatter.
 * @param {object} [props.metadata.frontMatter] - The frontmatter object.
 * @param {string} [props.metadata.frontMatter.blueSkyRecordKey] - The unique key of the
 * corresponding BlueSky post. Its presence determines the component's behavior.
 */
export default function BlueSkyComments({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  const [comments, setComments] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!blueSkyRecordKey) return;

    async function fetchComments() {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueSkyRecordKey}`;
        const url =
          "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=5&uri=" +
          encodeURIComponent(postUri);

        const res = await fetch(url);
        const data = await res.json();

        const allComments = [];
        const flattenReplies = (arr, depth) => {
          // No comment so just return
          if (!arr) return;

          // Recursive loop, process all replies (whatever the deep)
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
  }, [blueSkyRecordKey]);

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${blueSkyRecordKey}`;

  if (!blueSkyRecordKey) return null;
  if (error) return <p>Error loading comments.</p>;
  if (comments === null) return <p>Loading comments…</p>;
  if (comments.length === 0)
    return (
      <p className={styles.blueSkyNoCommentYet}>
        This post is waiting for its first comment.&nbsp;
        <a
          className={styles.blueSkyNoCommentYetCTA}
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share your thoughts!
        </a>
      </p>
    );

  return (
    <div className={styles.blueSkyCommentsContainer}>
      <h3>💬 Comments from BlueSky ({comments.length})</h3>
      {comments.map((reply, i) => (
        <BlueSkyComment key={i} reply={reply} />
      ))}
    </div>
  );
}

BlueSkyComments.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string, // Optional
    }),
  }).isRequired,
};
