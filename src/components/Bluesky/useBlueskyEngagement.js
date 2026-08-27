import { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const MAX_ACTORS_PER_ENDPOINT = 20;

function flattenReplyAuthors(replies) {
  const authors = [];
  const walk = (arr) => {
    if (!arr) return;
    for (const reply of arr) {
      authors.push(reply.post.author);
      walk(reply.replies);
    }
  };
  walk(replies);
  return authors;
}

function mergeEngagement({ likers = [], reposters = [], commenters = [] }, ownerHandle) {
  const byDid = new Map();

  const record = (actor, action) => {
    // Replying to your own readers isn't reader engagement — exclude the blog's own account.
    if (!actor?.did || actor.handle === ownerHandle) return;
    const entry = byDid.get(actor.did) || {
      did: actor.did,
      handle: actor.handle,
      displayName: actor.displayName || actor.handle,
      avatar: actor.avatar,
      actions: new Set(),
    };
    entry.actions.add(action);
    byDid.set(actor.did, entry);
  };

  likers.forEach((actor) => record(actor, "liked"));
  reposters.forEach((actor) => record(actor, "reposted"));
  commenters.forEach((actor) => record(actor, "commented"));

  // People engaged in more than one way surface first — they're the strongest social proof.
  return [...byDid.values()].sort((a, b) => b.actions.size - a.actions.size);
}

async function fetchActors(endpoint, uri, listKey) {
  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.${endpoint}?uri=${encodeURIComponent(
    uri,
  )}&limit=${MAX_ACTORS_PER_ENDPOINT}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);

  const data = await res.json();
  return listKey === "likes" ? data.likes.map(({ actor }) => actor) : data[listKey];
}

// Shared by index.js (headline copy) and likes.js (counts + facepile) so the
// thread/likes/reposts fetches happen once per post, not once per consumer.
export default function useBlueskyEngagement(metadata) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  const [stats, setStats] = useState({
    likes: null,
    reposts: null,
    engaged: [],
    loading: true,
  });

  useEffect(() => {
    if (!blueskyRecordKey || !blueSkyConfig?.handle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets stats when the post/config identity changes; the effect also fetches below, it's not derivable at render time
      setStats({ likes: null, reposts: null, engaged: [], loading: false });
      return;
    }

    const fetchData = async () => {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueskyRecordKey}`;
        const threadUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(
          postUri,
        )}&depth=5`;

        const res = await fetch(threadUrl);
        if (!res.ok) throw new Error("Failed to fetch post data");

        const data = await res.json();
        const { likeCount, repostCount, uri: resolvedUri } = data.thread.post;
        const commenters = flattenReplyAuthors(data.thread.replies);

        setStats({
          likes: likeCount,
          reposts: repostCount,
          engaged: mergeEngagement({ commenters }, blueSkyConfig.handle),
          loading: false,
        });

        // resolvedUri carries the post's DID (getLikes/getRepostedBy return nothing for a handle-based URI)
        const [likers, reposters] = await Promise.all([
          likeCount > 0 ? fetchActors("getLikes", resolvedUri, "likes") : [],
          repostCount > 0 ? fetchActors("getRepostedBy", resolvedUri, "repostedBy") : [],
        ]);

        setStats((prev) => ({
          ...prev,
          engaged: mergeEngagement(
            { likers, reposters, commenters },
            blueSkyConfig.handle,
          ),
        }));
      } catch (e) {
        console.error("Error fetching Bluesky stats:", e);
        setStats({ likes: null, reposts: null, engaged: [], loading: false });
      }
    };

    fetchData();
  }, [blueskyRecordKey, blueSkyConfig?.handle]);

  return stats;
}
