/**
 * Retrieve the list of comments posted on BlueSky and display them on the page
 *
 * See comments in BlueSky.js component for the list of requirements
 *
 * @param {Object} props
 * @param {string} props.recordKey - Unique record from the frontmatter
 */

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyComments({ recordKey }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;

  if (!recordKey) {
    console.warn("<BlueSkyComments> Missing required property", { recordKey });

    return null;
  }

  const [comments, setComments] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${recordKey}`;

        const url =
          "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=10&" +
          "uri=" +
          encodeURIComponent(postUri);

        const res = await fetch(url);
        const data = await res.json();

        const allComments = [];

        const flattenReplies = (repliesArray, depth) => {
          if (!repliesArray) return;
          for (const reply of repliesArray) {
            allComments.push({ ...reply, depth: depth });
            if (reply.replies) {
              flattenReplies(reply.replies, depth + 1);
            }
          }
        };

        if (data.thread && data.thread.replies) {
          flattenReplies(data.thread.replies, 0); // Start with depth 0
        }

        setComments(allComments);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    fetchComments();
  }, [recordKey]);

  if (error) return <p>Error loading comments.</p>;
  if (comments === null) return <p>Loading comments…</p>;
  if (comments.length === 0) return <p>No comments yet on BlueSky.</p>;

  return (
    <div className="blueSkyCommentsContainer">
      <h3>💬 Comments from BlueSky ({comments.length})</h3>
      {comments.map((reply, i) => (
        <div
          key={i}
          className="blueSkyCommentContainer"
          style={{
            paddingLeft: `${1.5 + reply.depth * 1.5}rem`, // Apply dynamic indentation
          }}
        >
          <p className="blueSkyCommentAuthor">@{reply.post.author.handle}</p>
          <p className="blueSkyCommentText">{reply.post.record.text}</p>
        </div>
      ))}
    </div>
  );
}

BlueSkyComments.propTypes = {
  recordKey: PropTypes.string.isRequired,
};
