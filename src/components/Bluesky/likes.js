import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueskyLikes({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  const [postStats, setPostStats] = useState({
    likes: null,
    reposts: null,
    loading: true,
  });

  useEffect(() => {
    if (!blueskyRecordKey || !blueSkyConfig?.handle) {
      setPostStats({ likes: null, reposts: null, loading: false });
      return;
    }

    const fetchData = async () => {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueskyRecordKey}`;
        const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(
          postUri
        )}&depth=0`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch post data");

        const data = await res.json();
        const { likeCount, repostCount } = data.thread.post;

        setPostStats({
          likes: likeCount,
          reposts: repostCount,
          loading: false,
        });
      } catch (e) {
        console.error("Error fetching Bluesky stats:", e);
        setPostStats({ likes: null, reposts: null, loading: false });
      }
    };

    fetchData();
  }, [blueskyRecordKey, blueSkyConfig?.handle]);

  if (postStats.loading || postStats.likes === null) {
    return null;
  }

  return (
    <span className={styles.blueskyPostLikes}>
      <span
        className={styles.blueskyCommentLikes}
        title={`The original post has ${postStats.likes} likes on Bluesky`}
      >
        {postStats.likes}
      </span>
      <span
        className={styles.blueskyCommentReposts}
        title={`The original post has been shared ${postStats.reposts} times on Bluesky`}
      >
        {postStats.reposts}
      </span>
    </span>
  );
}

BlueskyLikes.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueskyRecordKey: PropTypes.string,
    }),
  }).isRequired,
};
