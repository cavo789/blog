---
slug: docusaurus-bluesky-comments
title: Show BlueSky comments on Docusaurus and, too, number of likes/reposts
authors: [christophe]
image: /img/docusaurus_tips_social_media.jpg
tags: [bluesky, component, docusaurus, markdown, react, swizzle]
enableComments: true
draft: true
---
<!-- cspell:ignore reposts,packagist -->
![Show BlueSky comments on Docusaurus and, too, number of likes/reposts](/img/docusaurus_tips_banner.jpg)

In a [previous article](/blog/docusaurus-bluesky-share), we've seen how we can, simply said, provide a "Share the article on BlueSky".

This is not really interactive right? Let's see in this article how to make the link between a Docusaurus blog post and BlueSky.

The workflow will be:

1. You publish your article on your blog,
2. You share the article on BlueSky (by using the "Share the article" feature of course),
3. You retrieve the **BlueSky Record key** i.e. the very last part of BlueSky post URL (something like `3lun2qjuxc22r`),
4. You edit back your Docusaurus article and you add a key in your YAML front matter (the YAML block at the top of your article). The key to add is `blueSkyRecordKey: xxxx` where `xxxx` is your **BlueSky Record key**.
5. You publish your updated article on your blog again.

So, from now, you've clearly make the link between your article and your BlueSky post.

Thanks to this link, we can:

1. Display a button "Like, share or comment on BlueSky": the visitor can then jump to your BlueSky post and like, share or comment your article,
2. Display the number of likes and reposts below your article and,
3. Display the list of comments you've received on your BlueSky post and, if none, display a *Call to action* area to encourage your reader to share his thoughts

In the previous article (see [Create our own Docusaurus React component and provide a "Share on BlueSky" button](/blog/docusaurus-bluesky-share)), we've created the `src/theme/BlogPostItem/BlueSky/index.js` file. Please edit that file and use this new content:

<details>

<summary>src/theme/BlogPostItem/BlueSky/index.js</summary>

```javascript
// highlight-next-line
import BlueSkyComments from "./comments";
// highlight-next-line
import BlueSkyLikes from "./likes";
// highlight-next-line
import BlueSkyPost from "./post";
import BlueSkyShare from "./share";
import PropTypes from "prop-types";

export default function BlueSky({ metadata }) {
  return (
    <div className="blueSkyContainer">
      <BlueSkyShare metadata={metadata} />
      // highlight-next-line
      <BlueSkyPost metadata={metadata} />
      // highlight-next-line
      <BlueSkyLikes metadata={metadata} />
      // highlight-next-line
      <BlueSkyComments metadata={metadata} />
    </div>
  );
}

BlueSky.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string, // Optional
    }),
  }).isRequired,
};


```

</details>

:::info
The highlighted lines are the new ones compared of the previous version of the file if you've already followed the first tutorial.
:::

As you can see, this time, we'll foresee four components:

1. A Share button,
2. A Post button (to jump to your post on BlueSky),
3. A likes area (to show the number of likes and reposts of your post on BlueSky) and
4. An area for displaying comments you've on BlueSky

## The Like, share or comment button



<details>

<summary>src/theme/BlogPostItem/BlueSky/post.js</summary>

```javascript
import clsx from "clsx";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyPost({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  if (!blueSkyConfig?.handle || !blueSkyRecordKey) {
    return null;
  }

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${blueSkyRecordKey}`;

  return (
    <a href={postUrl} target="_blank" rel="noopener noreferrer" className={clsx("blueSkyButton", "button")} aria-label="See the post on BlueSky">
      <img src="/img/bluesky.svg" alt="Bluesky Icon" width="16" height="16" />
      Like, share or comment on BlueSky
    </a>
  );
}

BlueSkyPost.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string // Optional
    })
  }).isRequired
};

```

</details>

## Getting the number of likes and reposts

<!-- cspell:disable -->
<details>

<summary>src/theme/BlogPostItem/BlueSky/likes.js</summary>

```javascript
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function BlueSkyLikes({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const blueSkyConfig = siteConfig?.customFields?.blueSky;
  const blueSkyRecordKey = metadata?.frontMatter?.blueSkyRecordKey;

  const [postStats, setPostStats] = useState({ likes: null, reposts: null, loading: true });

  useEffect(() => {
    if (!blueSkyRecordKey) {
      setPostStats({ likes: null, reposts: null, loading: false });
      return;
    }

    const fetchData = async () => {
      try {
        const postUri = `at://${blueSkyConfig.handle}/app.bsky.feed.post/${blueSkyRecordKey}`;
        const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=0`;

        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch post data");

        const data = await res.json();
        const { likeCount, repostCount } = data.thread.post;

        setPostStats({ likes: likeCount, reposts: repostCount, loading: false });
      } catch (e) {
        console.error("Error fetching BlueSky stats:", e);
        setPostStats({ likes: null, reposts: null, loading: false });
      }
    };

    fetchData();
  }, [blueSkyRecordKey, blueSkyConfig.handle]);

  if (postStats.loading) {
    return null;
  }

  if (postStats.likes === null) {
    return null;
  }

  return (
    <span className="blueSkyPostLikes">
      <span className="blueSkyCommentLikes" title={`The original post has ${postStats.likes} likes on BlueSky`}>{postStats.likes}</span>
      <span className="blueSkyCommentReposts" title={`The original post has been shared ${postStats.reposts} times on BlueSky`}>{postStats.reposts}</span>
    </span>
  );
}

BlueSkyLikes.propTypes = {
  metadata: PropTypes.shape({
    frontMatter: PropTypes.shape({
      blueSkyRecordKey: PropTypes.string
    })
  }).isRequired
};

```

</details>

<!-- cspell:enable -->

## Retrieving all comments

<!-- cspell:disable -->
<details>

<summary>src/theme/BlogPostItem/BlueSky/comments.js</summary>

```javascript
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

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

    const linkFeature = facet.features.find(f => f.$type === "app.bsky.richtext.facet#link");
    if (linkFeature) {
      parts.push(
        <a key={`link-${idx}`} href={linkFeature.uri} target="_blank" rel="noopener noreferrer">
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

function renderEmbed(embed) {
  if (!embed || embed.$type !== "app.bsky.embed.external#view") return null;

  const { uri, title, description, thumb } = embed.external;

  return (
    <a href={uri} target="_blank" rel="noopener noreferrer" className="blueSkyCommentEmbed">
      {thumb && <img src={thumb} alt="" className="blueSkyCommentEmbedThumb" />}
      <div className="blueSkyCommentEmbedContent">
        <strong>{title}</strong>
      </div>
    </a>
  );
}

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
    <div className="blueSkyCommentContainer" style={{ paddingLeft: `${1.5 + reply.depth * 1.5}rem` }}>
      <div className="blueSkyCommentHeader mb-2 flex items-center">
        <a href={profileUrl} target="_blank" rel="noopener noreferrer">
          <img
            src={reply.post.author.avatar}
            alt={`${reply.post.author.displayName}'s avatar`}
            className="blueSkyCommentAvatar"
          />
        </a>
        <div className="blueSkyCommentAuthorInfos">
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="blueSkyCommentAuthorDisplayName">
            {reply.post.author.displayName}
          </a>
          <span className="blueSkyCommentAuthorHandle">@{reply.post.author.handle}</span>
        </div>
      </div>
      <span className="blueSkyCommentDate">{date}</span>
      <p className="blueSkyCommentText">{renderPostText(reply.post.record)}</p>
      {renderEmbed(reply.post.embed)}
      <div className="blueSkyCommentFooter">
        <span className="blueSkyCommentLikes">{reply.post.likeCount}</span>
        <span className="blueSkyCommentReposts">{reply.post.repostCount || 0}</span>
        <a className="blueSkyCommentLink" href={commentUrl} target="_blank" rel="noopener noreferrer">
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
        const url = "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?depth=5&uri=" + encodeURIComponent(postUri);

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
  }, [blueSkyRecordKey]);

  const postUrl = `https://bsky.app/profile/${blueSkyConfig.handle}/post/${blueSkyRecordKey}`;

  if (!blueSkyRecordKey) return null;
  if (error) return <p>Error loading comments.</p>;
  if (comments === null) return <p>Loading comments…</p>;
  if (comments.length === 0) return (
    <p className="blueSkyNoCommentYet">This post is waiting for its first comment.&nbsp;
      <a className="blueSkyNoCommentYetCTA" href={ postUrl } target="_blank" rel="noopener noreferrer">
        Share your thoughts!
      </a>
    </p>
  );

  return (
    <div className="blueSkyCommentsContainer">
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
      blueSkyRecordKey: PropTypes.string
    })
  }).isRequired
};

```

</details>
<!-- cspell:enable -->

## Retrieve the final Docusaurus component on Packagist


