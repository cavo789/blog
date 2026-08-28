import { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

const MAX_ACTORS_PER_ENDPOINT = 20;
const FEED_CACHE_PREFIX = "bluesky-feed-cache:";
const FEED_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_FEED_PAGES = 5;

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

function normalizeUrl(url) {
  if (!url) return null;
  return url.split("?")[0].replace(/\/+$/, "");
}

function readFeedCache(handle) {
  try {
    const raw = sessionStorage.getItem(FEED_CACHE_PREFIX + handle);
    if (!raw) return null;
    const { timestamp, urlToRecordKey } = JSON.parse(raw);
    if (Date.now() - timestamp > FEED_CACHE_TTL_MS) return null;
    return urlToRecordKey;
  } catch {
    return null;
  }
}

function writeFeedCache(handle, urlToRecordKey) {
  try {
    sessionStorage.setItem(
      FEED_CACHE_PREFIX + handle,
      JSON.stringify({ timestamp: Date.now(), urlToRecordKey }),
    );
  } catch {
    // Private browsing / storage disabled — resolution still works, just uncached.
  }
}

// Builds a { normalizedArticleUrl: recordKey } map from the account's own post
// history, matching on the "external" link-card embed Bluesky attaches when a
// post links out (the same card the Share button in this component produces).
// Cached per tab session so browsing several un-tagged articles doesn't re-fetch
// the whole feed each time.
async function buildFeedIndex(handle) {
  const cached = readFeedCache(handle);
  if (cached) return cached;

  const urlToRecordKey = {};
  let cursor;

  for (let page = 0; page < MAX_FEED_PAGES; page += 1) {
    const params = new URLSearchParams({
      actor: handle,
      limit: "100",
      filter: "posts_no_replies",
    });
    if (cursor) params.set("cursor", cursor);

    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed?${params}`,
    );
    if (!res.ok) throw new Error("Failed to fetch author feed");
    const data = await res.json();

    for (const item of data.feed || []) {
      const embed = item.post?.record?.embed;
      const externalUri =
        embed?.$type === "app.bsky.embed.external" ? embed.external.uri : null;
      const normalized = normalizeUrl(externalUri);
      if (normalized) urlToRecordKey[normalized] = item.post.uri.split("/").pop();
    }

    cursor = data.cursor;
    if (!cursor || !data.feed?.length) break;
  }

  writeFeedCache(handle, urlToRecordKey);
  return urlToRecordKey;
}

// Resolves the Bluesky record key for the current article. The frontmatter value
// always wins — it's the manual override needed after a slug rename, or to
// disambiguate an article re-promoted with a second post. Otherwise the key is
// looked up from the account's own post history. Never throws: any failure here
// (offline, blocked, no match found) just means no engagement UI is shown, the
// same as an article that was never promoted at all.
export function useBlueskyRecordKey(metadata) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky;
  const frontMatterKey = metadata?.frontMatter?.blueskyRecordKey;

  const [state, setState] = useState({
    recordKey: frontMatterKey || null,
    resolving: !frontMatterKey,
  });

  useEffect(() => {
    if (frontMatterKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors a prop change (article navigation), not derivable at render time
      setState({ recordKey: frontMatterKey, resolving: false });
      return;
    }
    if (!blueSkyConfig?.handle || !metadata?.permalink) {
      setState({ recordKey: null, resolving: false });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const articleUrl = normalizeUrl(`${siteConfig.url}${metadata.permalink}`);
        const index = await buildFeedIndex(blueSkyConfig.handle);
        if (!cancelled)
          setState({ recordKey: index[articleUrl] || null, resolving: false });
      } catch (e) {
        console.error("Bluesky record key lookup failed:", e);
        if (!cancelled) setState({ recordKey: null, resolving: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [frontMatterKey, blueSkyConfig?.handle, metadata?.permalink, siteConfig?.url]);

  return state;
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
    unavailable: false,
  });

  useEffect(() => {
    if (!blueskyRecordKey || !blueSkyConfig?.handle) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets stats when the post/config identity changes; the effect also fetches below, it's not derivable at render time
      setStats({
        likes: null,
        reposts: null,
        engaged: [],
        loading: false,
        unavailable: false,
      });
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
          unavailable: false,
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
        // Offline, blocked by the visitor (ad-blocker, DNS filtering), or Bluesky
        // itself down — never surface this as a JS error, just mark the data as
        // unavailable so the UI doesn't claim "no one reacted yet" instead.
        console.error("Error fetching Bluesky stats:", e);
        setStats({
          likes: null,
          reposts: null,
          engaged: [],
          loading: false,
          unavailable: true,
        });
      }
    };

    fetchData();
  }, [blueskyRecordKey, blueSkyConfig?.handle]);

  return stats;
}
