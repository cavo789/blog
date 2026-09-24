import { useState, useEffect } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useSourceLocaleUrls } from "@site/src/components/Blog/utils/localeUrls";

const MAX_ACTORS_PER_ENDPOINT = 20;
const FEED_CACHE_PREFIX = "bluesky-feed-cache:";
const FEED_CACHE_TTL_MS = 5 * 60 * 1000;
const MAX_FEED_PAGES = 5;
const BLOCKED_LIST_CACHE_PREFIX = "bluesky-blocked-list-cache:";
const BLOCKED_LIST_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — list changes rarely

/** `docusaurus.config.js`'s `customFields.bluesky` — a custom field, typed `unknown` by
 * Docusaurus itself, so every reader casts against this shape. */
export interface BlueskySiteConfig {
  handle?: string;
  /**
   * AT URI of a Bluesky moderation list whose members are hidden from comments and the facepile.
   * Fetched at runtime from the public API (no auth required) and cached 1 h in sessionStorage —
   * adding a handle to the list takes effect on the next page load with no deploy needed.
   * Create a list at bsky.app → Lists, then copy its URI (at://did:plc:…/app.bsky.graph.list/…).
   */
  blockedList?: string;
  /** Compile-time override: handles blocked regardless of the Bluesky list (e.g. during deploy). */
  blockedHandles?: string[];
}

/** The subset of a blog post's `useBlogPost().metadata` every Bluesky file actually reads. */
export interface BlueskyMetadata {
  title?: string;
  permalink?: string;
  frontMatter?: {
    blueskyRecordKey?: string;
  };
}

export type EngagementAction = "liked" | "reposted" | "commented";

export interface EngagedPerson {
  did: string;
  handle: string;
  displayName: string;
  avatar?: string;
  actions: Set<EngagementAction>;
}

export interface EngagementStats {
  likes: number | null;
  reposts: number | null;
  engaged: EngagedPerson[];
  loading: boolean;
  unavailable: boolean;
}

export interface RecordKeyState {
  recordKey: string | null;
  resolving: boolean;
}

export interface BlueskyActor {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

export interface BlueskyFacetFeature {
  $type: string;
  uri?: string;
}

export interface BlueskyFacet {
  index: { byteStart: number; byteEnd: number };
  features: BlueskyFacetFeature[];
}

export interface BlueskyPostRecord {
  text: string;
  facets?: BlueskyFacet[];
}

export interface BlueskyEmbedExternal {
  $type: "app.bsky.embed.external#view";
  external: { uri: string; title: string; thumb?: string };
}

export interface BlueskyEmbedImages {
  $type: "app.bsky.embed.images#view";
  images: { fullsize: string; alt?: string }[];
}

export type BlueskyEmbed = BlueskyEmbedExternal | BlueskyEmbedImages | { $type: string };

export interface BlueskyPostView {
  uri: string;
  indexedAt: string;
  likeCount: number;
  repostCount?: number;
  author: BlueskyActor & { displayName: string };
  record: BlueskyPostRecord;
  embed?: BlueskyEmbed | null;
}

export interface BlueskyReplyNode {
  post: BlueskyPostView;
  replies?: BlueskyReplyNode[];
}

function flattenReplyAuthors(replies: BlueskyReplyNode[] | undefined): BlueskyActor[] {
  const authors: BlueskyActor[] = [];
  const walk = (arr: BlueskyReplyNode[] | undefined) => {
    if (!arr) return;
    for (const reply of arr) {
      authors.push(reply.post.author);
      walk(reply.replies);
    }
  };
  walk(replies);
  return authors;
}

function mergeEngagement(
  {
    likers = [],
    reposters = [],
    commenters = [],
  }: { likers?: BlueskyActor[]; reposters?: BlueskyActor[]; commenters?: BlueskyActor[] },
  ownerHandle: string | undefined,
  blockedHandles: Set<string> = new Set(),
): EngagedPerson[] {
  const byDid = new Map<string, EngagedPerson>();

  const record = (actor: BlueskyActor | undefined, action: EngagementAction) => {
    // Replying to your own readers isn't reader engagement — exclude the blog's own account.
    // Also exclude any handle explicitly blocked in the site config (e.g. spammers).
    if (!actor?.did || actor.handle === ownerHandle || blockedHandles.has(actor.handle))
      return;
    const entry = byDid.get(actor.did) || {
      did: actor.did,
      handle: actor.handle,
      displayName: actor.displayName || actor.handle,
      avatar: actor.avatar,
      actions: new Set<EngagementAction>(),
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

function normalizeUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.split("?")[0].replace(/\/+$/, "");
}

interface BlockedListResponse {
  items?: { subject?: { handle?: string } }[];
  cursor?: string;
}

// Fetches every handle in a Bluesky moderation list (pagination-aware) and caches
// the result in sessionStorage for 1 hour so browsing many articles doesn't re-fetch.
// Exported so BlueskyComments can share the same cache without a duplicate request.
export async function fetchBlockedList(listUri: string): Promise<Set<string>> {
  const cacheKey = BLOCKED_LIST_CACHE_PREFIX + listUri;
  try {
    const raw = sessionStorage.getItem(cacheKey);
    if (raw) {
      const { timestamp, handles } = JSON.parse(raw) as {
        timestamp: number;
        handles: string[];
      };
      if (Date.now() - timestamp <= BLOCKED_LIST_CACHE_TTL_MS) return new Set(handles);
    }
  } catch {
    /* private browsing or corrupt entry — just refetch */
  }

  const handles: string[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({ list: listUri, limit: "100" });
    if (cursor) params.set("cursor", cursor);
    const res = await fetch(
      `https://public.api.bsky.app/xrpc/app.bsky.graph.getList?${params}`,
    );
    if (!res.ok) break;
    const data = (await res.json()) as BlockedListResponse;
    for (const item of data.items ?? []) {
      if (item.subject?.handle) handles.push(item.subject.handle);
    }
    cursor = data.cursor;
    if (!cursor) break;
  }

  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), handles }));
  } catch {
    /* private browsing — cache miss next time, that's fine */
  }

  return new Set(handles);
}

type FeedIndex = Record<string, string>;

function readFeedCache(handle: string): FeedIndex | null {
  try {
    const raw = sessionStorage.getItem(FEED_CACHE_PREFIX + handle);
    if (!raw) return null;
    const { timestamp, urlToRecordKey } = JSON.parse(raw) as {
      timestamp: number;
      urlToRecordKey: FeedIndex;
    };
    if (Date.now() - timestamp > FEED_CACHE_TTL_MS) return null;
    return urlToRecordKey;
  } catch {
    return null;
  }
}

function writeFeedCache(handle: string, urlToRecordKey: FeedIndex): void {
  try {
    sessionStorage.setItem(
      FEED_CACHE_PREFIX + handle,
      JSON.stringify({ timestamp: Date.now(), urlToRecordKey }),
    );
  } catch {
    // Private browsing / storage disabled — resolution still works, just uncached.
  }
}

interface AuthorFeedItem {
  post: {
    uri: string;
    record?: {
      embed?: {
        $type?: string;
        external?: { uri?: string };
      };
    };
  };
}

interface AuthorFeedResponse {
  feed?: AuthorFeedItem[];
  cursor?: string;
}

// Builds a { normalizedArticleUrl: recordKey } map from the account's own post
// history, matching on the "external" link-card embed Bluesky attaches when a
// post links out (the same card the Share button in this component produces).
// Cached per tab session so browsing several un-tagged articles doesn't re-fetch
// the whole feed each time.
async function buildFeedIndex(handle: string): Promise<FeedIndex> {
  const cached = readFeedCache(handle);
  if (cached) return cached;

  const urlToRecordKey: FeedIndex = {};
  let cursor: string | undefined;

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
    const data = (await res.json()) as AuthorFeedResponse;

    for (const item of data.feed || []) {
      const embed = item.post?.record?.embed;
      const externalUri =
        embed?.$type === "app.bsky.embed.external" ? (embed.external?.uri ?? null) : null;
      const normalized = normalizeUrl(externalUri);
      if (normalized) urlToRecordKey[normalized] = item.post.uri.split("/").pop()!;
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
// looked up from the account's own post history. In a translated locale the
// article's own URL (`/fr/blog/x/`) is tried first, then the source-language one
// (`/blog/x/`): the author usually promotes only the English article, and French
// readers should join that conversation rather than see a "Share" button. A
// dedicated French post, if one exists, still wins. Never throws: any failure here
// (offline, blocked, no match found) just means no engagement UI is shown, the
// same as an article that was never promoted at all.
export function useBlueskyRecordKey(
  metadata: BlueskyMetadata | undefined,
): RecordKeyState {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky as
    BlueskySiteConfig | undefined;
  const frontMatterKey = metadata?.frontMatter?.blueskyRecordKey;
  const { isDefaultLocale, sourceAbsoluteUrl } = useSourceLocaleUrls();

  // `permalink` comes from Docusaurus and already carries the locale's baseUrl
  // (`/fr/blog/x/`) — so `siteConfig.url + permalink` is correct as is and must
  // NOT be prefixed again. The source URL is the reverse: strip that baseUrl,
  // then resolve the rest against the source locale. Slugs are never translated,
  // so the remainder is the same in both locales.
  const permalink = metadata?.permalink;
  const currentUrl = permalink ? normalizeUrl(`${siteConfig.url}${permalink}`) : null;
  const sourceUrl =
    permalink && !isDefaultLocale && permalink.startsWith(siteConfig.baseUrl)
      ? normalizeUrl(sourceAbsoluteUrl(permalink.slice(siteConfig.baseUrl.length)))
      : null;

  const [state, setState] = useState<RecordKeyState>({
    recordKey: frontMatterKey || null,
    resolving: !frontMatterKey,
  });

  useEffect(() => {
    if (frontMatterKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mirrors a prop change (article navigation), not derivable at render time
      setState({ recordKey: frontMatterKey, resolving: false });
      return;
    }
    if (!blueSkyConfig?.handle || !currentUrl) {
      setState({ recordKey: null, resolving: false });
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const index = await buildFeedIndex(blueSkyConfig.handle!);
        if (!cancelled)
          setState({
            recordKey: index[currentUrl] || (sourceUrl && index[sourceUrl]) || null,
            resolving: false,
          });
      } catch (e) {
        console.error("Bluesky record key lookup failed:", e);
        if (!cancelled) setState({ recordKey: null, resolving: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [frontMatterKey, blueSkyConfig?.handle, currentUrl, sourceUrl]);

  return state;
}

interface LikesResponse {
  likes: { actor: BlueskyActor }[];
}

interface RepostedByResponse {
  repostedBy: BlueskyActor[];
}

async function fetchActors(
  endpoint: "getLikes" | "getRepostedBy",
  uri: string,
  listKey: "likes" | "repostedBy",
): Promise<BlueskyActor[]> {
  const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.${endpoint}?uri=${encodeURIComponent(
    uri,
  )}&limit=${MAX_ACTORS_PER_ENDPOINT}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);

  const data = (await res.json()) as LikesResponse | RepostedByResponse;
  return listKey === "likes"
    ? (data as LikesResponse).likes.map(({ actor }) => actor)
    : (data as RepostedByResponse).repostedBy;
}

interface PostThreadResponse {
  thread: {
    post: { likeCount: number; repostCount: number; uri: string };
    replies?: BlueskyReplyNode[];
  };
}

// Shared by index.tsx (headline copy) and likes.tsx (counts + facepile) so the
// thread/likes/reposts fetches happen once per post, not once per consumer.
export default function useBlueskyEngagement(
  metadata: BlueskyMetadata | undefined,
): EngagementStats {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.bluesky as
    BlueskySiteConfig | undefined;
  const blueskyRecordKey = metadata?.frontMatter?.blueskyRecordKey;

  const [stats, setStats] = useState<EngagementStats>({
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
      const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueskyRecordKey}`;
      const threadUrl = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(
        postUri,
      )}&depth=5`;

      // Fetch the thread and the moderation list in parallel — neither depends on the other.
      // The list is cached 1 h in sessionStorage, so after the first load it resolves instantly.
      try {
        const [threadRes, listBlocked] = await Promise.all([
          fetch(threadUrl),
          blueSkyConfig.blockedList
            ? fetchBlockedList(blueSkyConfig.blockedList).catch(() => new Set<string>())
            : Promise.resolve(new Set<string>()),
        ]);
        const blockedHandles = new Set([
          ...(blueSkyConfig.blockedHandles ?? []),
          ...listBlocked,
        ]);

        const res = threadRes;
        if (!res.ok) throw new Error("Failed to fetch post data");

        const data = (await res.json()) as PostThreadResponse;
        const { likeCount, repostCount, uri: resolvedUri } = data.thread.post;
        const commenters = flattenReplyAuthors(data.thread.replies);

        setStats({
          likes: likeCount,
          reposts: repostCount,
          engaged: mergeEngagement({ commenters }, blueSkyConfig.handle, blockedHandles),
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
            blockedHandles,
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
  }, [
    blueskyRecordKey,
    blueSkyConfig?.handle,
    blueSkyConfig?.blockedHandles,
    blueSkyConfig?.blockedList,
  ]);

  return stats;
}
