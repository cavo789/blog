/**
 * 📚 blog-corpus
 *
 * Shared corpus loading — frontmatter parsing and internal-link detection — factored out
 * of `internal-link-opportunities.mjs` so that script and `plugins/blog-graph-plugin` read
 * the *same* corpus instead of duplicating this logic and silently drifting apart.
 *
 * Pure Node (`readdirSync`/`readFileSync`), no Webpack: this runs both from the CLI script
 * and from inside the blog-graph-plugin's `loadContent()` hook during `yarn start`/`build`.
 *
 * `collectLinks()` is the one function worth reading before touching this file — see its
 * own comment for the four ways a naive internal-link grep gets the numbers wrong.
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const BLOG_DIR = "blog";

/** Recursively collects every article file under a directory. */
export function findPosts(directory) {
  const found = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      found.push(...findPosts(target));
      // A handful of posts embed components heavily and use `index.mdx`; they
      // are articles like any other and must be part of the corpus.
    } else if (entry.name === "index.md" || entry.name === "index.mdx") {
      found.push(target);
    }
  }

  return found;
}

/** Parses the frontmatter block of a Markdown file. Enough YAML for our shape. */
export function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { data: {}, body: raw };
  }

  const data = {};
  let currentListKey = null;

  for (const line of match[1].split(/\r?\n/)) {
    const listItem = line.match(/^\s*-\s+(.*)$/);

    if (listItem && currentListKey) {
      data[currentListKey].push(listItem[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    const pair = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);

    if (!pair) {
      continue;
    }

    const [, key, rawValue] = pair;
    const value = rawValue.trim();

    if (value === "") {
      currentListKey = key;
      data[key] = [];
      continue;
    }

    currentListKey = null;

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
      continue;
    }

    data[key] = value.replace(/^["']|["']$/g, "");
  }

  return { data, body: raw.slice(match[0].length) };
}

/** Removes fenced code blocks, inline code, links and JSX tags so only prose remains. */
export function toProse(body) {
  return (
    body
      .replace(/^\s*(```|~~~)[\s\S]*?^\s*\1\s*$/gm, " ")
      .replace(/`[^`\n]*`/g, " ")
      .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
      // Tag attributes hold slugs and component names that would otherwise read
      // as topic mentions.
      .replace(/<[^>]+>/g, " ")
  );
}

/** File extensions that make a link an asset reference rather than a page link. */
const ASSET_EXTENSION =
  /\.(png|jpe?g|webp|gif|svg|pdf|zip|tar|gz|mp4|txt|ya?ml|sh|json|csv|xlsx?)$/i;

/** Localhost URLs are instructions to the reader, not outbound traffic. */
const LOCALHOST = /\/\/(127\.0\.0\.1|localhost)/;

/** Blog routes that are listing pages rather than articles. */
export const SECTION_ROUTE = /^\/blog\/(tags|archive|authors|page)(\/|$)/;

/**
 * The articles a post links to. A link to a tag or archive page is internal but
 * does not send the reader to another article, so it never makes a post
 * "linked" for the purpose of this report.
 */
export function articleLinks(post) {
  return [...post.links].filter((link) => !SECTION_ROUTE.test(link));
}

/** Yields the lines of a body with fenced code blocks removed. */
export function stripCodeFences(body) {
  const lines = [];
  let inFence = false;

  for (const line of body.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }

    if (!inFence) {
      lines.push(line);
    }
  }

  return lines;
}

/**
 * Collects every link an article makes, split by destination.
 *
 * Four traps make a naive audit wrong, each in the direction of undercounting
 * internal links:
 *
 * 1. Posts cross-link mostly with the `<Link to="/blog/x">` component, not with
 *    the Markdown `[label](/blog/x)` syntax. Matching only Markdown misses the
 *    large majority of them and makes well linked articles look orphaned.
 * 2. `\[[^\]]*\]\(` also matches the image syntax `![alt](./images/x.webp)`, so
 *    images get counted as links. The `(?<!!)` lookbehind rejects them.
 * 3. Links inside fenced code blocks are sample output, not navigation.
 * 4. Absolute `https://www.avonture.be/blog/...` URLs are internal links too.
 */
export function collectLinks(body) {
  const internal = new Set();
  let markdown = 0;
  let jsx = 0;
  let external = 0;
  let localhost = 0;

  const sources = [
    { pattern: /(?<!!)\[[^\]]*\]\(([^)\s]+)/g, form: "markdown" },
    { pattern: /<(?:Link|a)\s[^>]*?(?:to|href)=["']([^"']+)["']/gi, form: "jsx" },
  ];

  for (const line of stripCodeFences(body)) {
    for (const { pattern, form } of sources) {
      pattern.lastIndex = 0;

      let match;

      while ((match = pattern.exec(line)) !== null) {
        const raw = match[1].trim();
        const url = raw.replace(/^https?:\/\/(www\.)?avonture\.be/, "");

        if (url.startsWith("/blog/") && !ASSET_EXTENSION.test(url)) {
          internal.add(url.replace(/\/$/, ""));

          if (form === "markdown") {
            markdown += 1;
          } else {
            jsx += 1;
          }

          continue;
        }

        if (!/^https?:\/\//.test(raw) || raw.includes("avonture.be")) {
          continue;
        }

        if (LOCALHOST.test(raw)) {
          localhost += 1;
        } else {
          external += 1;
        }
      }
    }
  }

  return { internal, markdown, jsx, external, localhost };
}

/**
 * Reads one article into the shape the rest of the tooling works with.
 *
 * `skipDrafts` is what keeps the corpus limited to published content; a
 * single-article check turns it off, because a draft that links nowhere
 * becomes an orphan the day it is published.
 */
export function readPost(file, { skipDrafts = true } = {}) {
  const raw = readFileSync(file, "utf8");
  const { data, body } = parseFrontMatter(raw);

  if (!data.title || (skipDrafts && data.draft === "true")) {
    return null;
  }

  const slug = data.slug ?? path.basename(path.dirname(file));
  const linkCounts = collectLinks(body);

  return {
    file,
    title: data.title,
    slug,
    permalink: `/blog/${slug.replace(/^\//, "")}`,
    mainTag: data.mainTag ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    date: data.date ?? "",
    series: data.series ?? null,
    image: data.image ?? null,
    draft: data.draft === "true",
    prose: toProse(body).toLowerCase(),
    links: linkCounts.internal,
    linkCounts,
  };
}

/** Loads every published post under `blog/`. */
export function loadPosts() {
  return findPosts(BLOG_DIR)
    .map((file) => readPost(file))
    .filter(Boolean);
}
