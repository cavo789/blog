/**
 * 🔗 internal-link-opportunities
 *
 * Finds places where an article already talks about a topic covered by another
 * article but does not link to it.
 *
 * Contextual links inside the prose are what actually move readers from one
 * article to the next; the "Related posts" grid at the bottom of a page only
 * catches the few readers who scroll that far. This script reports, per
 * article, which other articles it mentions in its body text without linking
 * to them, so those links can be added where the topic is discussed.
 *
 * A candidate scores on two independent signals:
 * - the source article mentions a term that identifies the target article
 *   (its main tag, or a distinctive word from its title);
 * - both articles share tags, which makes the link topically relevant.
 *
 * Usage (from the devcontainer):
 *   node scripts/internal-link-opportunities.mjs --stats
 *   node scripts/internal-link-opportunities.mjs
 *   node scripts/internal-link-opportunities.mjs --min-score 6 --top 3
 *   node scripts/internal-link-opportunities.mjs --out .todos/internal-links.md
 *
 * `--stats` prints the site-wide internal/external linking audit. Prefer it over
 * an ad hoc grep: see `collectLinks()` for the four ways a naive one gets the
 * numbers wrong.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const BLOG_DIR = "blog";

/** Recursively collects every `index.md` under a directory. */
function findPosts(directory) {
  const found = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      found.push(...findPosts(target));
    } else if (entry.name === "index.md") {
      found.push(target);
    }
  }

  return found;
}

/** Words too generic to identify an article on their own. */
const STOP_WORDS = new Set([
  "the", "and", "for", "with", "your", "you", "from", "into", "how", "what",
  "why", "when", "where", "this", "that", "these", "those", "using", "use",
  "used", "make", "made", "get", "getting", "let", "lets", "run", "running",
  "start", "started", "starting", "new", "own", "one", "two", "more", "most",
  "some", "any", "all", "not", "but", "can", "will", "have", "has", "our",
  "out", "off", "その", "part", "introduction", "intro", "tips", "tricks",
  "guide", "quick", "simple", "easy", "better", "best", "good", "great",
  "about", "just", "very", "also", "then", "than", "them", "they", "there",
  "here", "over", "under", "between", "without", "within", "again", "back",
]);

/** Parses the frontmatter block of a Markdown file. Enough YAML for our shape. */
function parseFrontMatter(raw) {
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
function toProse(body) {
  return body
    .replace(/^\s*(```|~~~)[\s\S]*?^\s*\1\s*$/gm, " ")
    .replace(/`[^`\n]*`/g, " ")
    .replace(/\[[^\]]*\]\([^)]*\)/g, " ")
    // Tag attributes hold slugs and component names that would otherwise read
    // as topic mentions.
    .replace(/<[^>]+>/g, " ");
}

/** File extensions that make a link an asset reference rather than a page link. */
const ASSET_EXTENSION =
  /\.(png|jpe?g|webp|gif|svg|pdf|zip|tar|gz|mp4|txt|ya?ml|sh|json|csv|xlsx?)$/i;

/** Localhost URLs are instructions to the reader, not outbound traffic. */
const LOCALHOST = /\/\/(127\.0\.0\.1|localhost)/;

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
function collectLinks(body) {
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

/** Yields the lines of a body with fenced code blocks removed. */
function stripCodeFences(body) {
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

/** Distinctive terms that identify an article inside someone else's prose. */
function identifyingTerms(post) {
  const terms = new Set();

  if (post.mainTag) {
    terms.add(post.mainTag.replace(/-/g, " "));
  }

  const titleWords = post.title
    .toLowerCase()
    .replace(/[^a-z0-9+#. -]/g, " ")
    .split(/[\s-]+/)
    .filter((word) => word.length > 3 && !STOP_WORDS.has(word));

  for (const word of titleWords) {
    terms.add(word);
  }

  // Adjacent title words carry far more signal than either word alone
  // ("docker compose" identifies an article, "docker" does not).
  for (let i = 0; i < titleWords.length - 1; i += 1) {
    terms.add(`${titleWords[i]} ${titleWords[i + 1]}`);
  }

  return [...terms].filter((term) => term.length > 3);
}

function countMentions(prose, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = prose.match(new RegExp(`\\b${escaped}\\b`, "gi"));

  return matches ? matches.length : 0;
}

function loadPosts() {
  return findPosts(BLOG_DIR)
    .map((file) => {
      const raw = readFileSync(file, "utf8");
      const { data, body } = parseFrontMatter(raw);

      if (!data.title || data.draft === "true") {
        return null;
      }

      const slug =
        data.slug ?? path.basename(path.dirname(file));
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
        prose: toProse(body).toLowerCase(),
        links: linkCounts.internal,
        linkCounts,
      };
    })
    .filter(Boolean);
}

function buildOpportunities(posts, { minScore, top }) {
  const termsByPost = new Map(posts.map((post) => [post.slug, identifyingTerms(post)]));
  const report = [];

  for (const source of posts) {
    const candidates = [];

    for (const target of posts) {
      if (target.slug === source.slug) {
        continue;
      }

      if (source.links.has(target.permalink)) {
        continue;
      }

      let mentions = 0;
      const matched = [];

      for (const term of termsByPost.get(target.slug)) {
        const hits = countMentions(source.prose, term);

        if (hits > 0) {
          mentions += hits * (term.includes(" ") ? 3 : 1);
          matched.push(term);
        }
      }

      if (mentions === 0) {
        continue;
      }

      const sharedTags = target.tags.filter((tag) => source.tags.includes(tag));
      const sameSeries =
        source.series && target.series && source.series === target.series;

      const score =
        mentions +
        sharedTags.length * 2 +
        (source.mainTag && source.mainTag === target.mainTag ? 4 : 0) +
        (sameSeries ? 5 : 0);

      if (score >= minScore) {
        candidates.push({ target, score, matched, sharedTags });
      }
    }

    if (candidates.length === 0) {
      continue;
    }

    candidates.sort((a, b) => b.score - a.score);

    report.push({
      source,
      candidates: candidates.slice(0, top),
      total: candidates.length,
    });
  }

  // Articles that currently link nowhere are the ones worth editing first.
  report.sort((a, b) => {
    const orphanDelta = (a.source.links.size === 0 ? 0 : 1) - (b.source.links.size === 0 ? 0 : 1);

    if (orphanDelta !== 0) {
      return orphanDelta;
    }

    return b.candidates[0].score - a.candidates[0].score;
  });

  return report;
}

function renderMarkdown(report, posts) {
  const orphans = posts.filter((post) => post.links.size === 0).length;
  const lines = [
    "# Internal link opportunities",
    "",
    `Generated by \`scripts/internal-link-opportunities.mjs\` on ${new Date().toISOString().slice(0, 10)}.`,
    "",
    `- Articles scanned: **${posts.length}**`,
    `- Articles with no link to any other article: **${orphans}**`,
    `- Articles with at least one suggestion below: **${report.length}**`,
    "",
    "Each entry lists articles whose topic is already named in the prose but never linked.",
    "Add the link where the term appears, not at the end of the article.",
    "",
  ];

  for (const { source, candidates, total } of report) {
    lines.push(`## ${source.title}`);
    lines.push("");
    lines.push(`\`${source.file}\` — ${source.permalink}`);
    lines.push(
      `Currently links to ${source.links.size} article(s). ${total} candidate(s) found.`,
    );
    lines.push("");

    for (const { target, score, matched, sharedTags } of candidates) {
      lines.push(
        `- **[${target.title}](${target.permalink})** _(score ${score})_`,
      );
      lines.push(`  - mentioned as: ${matched.map((t) => `\`${t}\``).join(", ")}`);

      if (sharedTags.length > 0) {
        lines.push(`  - shared tags: ${sharedTags.join(", ")}`);
      }
    }

    lines.push("");
  }

  return lines.join("\n");
}

/** Prints the site-wide linking audit these suggestions are derived from. */
function renderStats(posts) {
  const sum = (key) =>
    posts.reduce((total, post) => total + post.linkCounts[key], 0);

  const markdown = sum("markdown");
  const jsx = sum("jsx");
  const internal = markdown + jsx;
  const external = sum("external");
  const linked = posts.filter((post) => post.links.size > 0).length;
  const share = (value) => `${((100 * value) / posts.length).toFixed(0)} %`;
  const perPost = (value) => (value / posts.length).toFixed(2);

  return [
    "Internal linking audit",
    "======================",
    `Published articles scanned      : ${posts.length}`,
    "",
    `Internal links, <Link to=...>   : ${jsx}`,
    `Internal links, Markdown syntax : ${markdown}`,
    `Internal links, total           : ${internal}   (${perPost(internal)}/article)`,
    `External links                  : ${external}   (${perPost(external)}/article)`,
    `Localhost links (instructions)  : ${sum("localhost")}   (not outbound)`,
    "",
    `Ratio external : internal       = ${(external / Math.max(internal, 1)).toFixed(2)} : 1`,
    `Articles linking to another one : ${linked} / ${posts.length}   (${share(linked)})`,
    `Articles linking nowhere        : ${posts.length - linked}   (${share(posts.length - linked)})`,
  ].join("\n");
}

function main() {
  const args = process.argv.slice(2);
  const readFlag = (name, fallback) => {
    const index = args.indexOf(name);

    return index === -1 ? fallback : args[index + 1];
  };

  const minScore = Number(readFlag("--min-score", 8));
  const top = Number(readFlag("--top", 3));
  const out = readFlag("--out", null);

  const posts = loadPosts();

  if (args.includes("--stats")) {
    console.log(renderStats(posts));
    return;
  }

  const report = buildOpportunities(posts, { minScore, top });
  const markdown = renderMarkdown(report, posts);

  if (out) {
    writeFileSync(out, markdown, "utf8");
    console.log(`Wrote ${out} (${report.length} articles with suggestions).`);
    return;
  }

  console.log(markdown);
}

main();
