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
 *   node scripts/internal-link-opportunities.mjs --post blog/2026/07/28/my-slug
 *
 * `--stats` prints the site-wide internal/external linking audit. Prefer it over
 * an ad hoc grep: see `collectLinks()` in `scripts/lib/blog-corpus.mjs` for the
 * four ways a naive one gets the numbers wrong.
 *
 * `--post` checks a single article — the one just written — and exits 1 when it
 * carries fewer than `--min-links` internal links (default 1), so it can run in
 * CI or in a pre-commit hook. It accepts the article directory or its
 * `index.md`, inside `blog/` or in `.unpublished/`.
 */

import { existsSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { SECTION_ROUTE, articleLinks, loadPosts, readPost } from "./lib/blog-corpus.mjs";

/** Words too generic to identify an article on their own. */
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "your",
  "you",
  "from",
  "into",
  "how",
  "what",
  "why",
  "when",
  "where",
  "this",
  "that",
  "these",
  "those",
  "using",
  "use",
  "used",
  "make",
  "made",
  "get",
  "getting",
  "let",
  "lets",
  "run",
  "running",
  "start",
  "started",
  "starting",
  "new",
  "own",
  "one",
  "two",
  "more",
  "most",
  "some",
  "any",
  "all",
  "not",
  "but",
  "can",
  "will",
  "have",
  "has",
  "our",
  "out",
  "off",
  "その",
  "part",
  "introduction",
  "intro",
  "tips",
  "tricks",
  "guide",
  "quick",
  "simple",
  "easy",
  "better",
  "best",
  "good",
  "great",
  "about",
  "just",
  "very",
  "also",
  "then",
  "than",
  "them",
  "they",
  "there",
  "here",
  "over",
  "under",
  "between",
  "without",
  "within",
  "again",
  "back",
]);

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

/** Ranks the articles `source` talks about but never links to. */
function scoreCandidates(source, targets, termsByPost, { minScore }) {
  const candidates = [];

  for (const target of targets) {
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
    const sameSeries = source.series && target.series && source.series === target.series;

    const score =
      mentions +
      sharedTags.length * 2 +
      (source.mainTag && source.mainTag === target.mainTag ? 4 : 0) +
      (sameSeries ? 5 : 0);

    if (score >= minScore) {
      candidates.push({ target, score, matched, sharedTags });
    }
  }

  candidates.sort((a, b) => b.score - a.score);

  return candidates;
}

function buildOpportunities(posts, { minScore, top }) {
  const termsByPost = new Map(posts.map((post) => [post.slug, identifyingTerms(post)]));
  const report = [];

  for (const source of posts) {
    const candidates = scoreCandidates(source, posts, termsByPost, { minScore });

    if (candidates.length === 0) {
      continue;
    }

    report.push({
      source,
      candidates: candidates.slice(0, top),
      total: candidates.length,
    });
  }

  // Articles that currently link nowhere are the ones worth editing first.
  report.sort((a, b) => {
    const orphanDelta =
      (articleLinks(a.source).length === 0 ? 0 : 1) -
      (articleLinks(b.source).length === 0 ? 0 : 1);

    if (orphanDelta !== 0) {
      return orphanDelta;
    }

    return b.candidates[0].score - a.candidates[0].score;
  });

  return report;
}

function renderMarkdown(report, posts) {
  const orphans = posts.filter((post) => articleLinks(post).length === 0).length;
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
      `Currently links to ${articleLinks(source).length} article(s). ${total} candidate(s) found.`,
    );
    lines.push("");

    for (const { target, score, matched, sharedTags } of candidates) {
      lines.push(`- **[${target.title}](${target.permalink})** _(score ${score})_`);
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
  const sum = (key) => posts.reduce((total, post) => total + post.linkCounts[key], 0);

  const markdown = sum("markdown");
  const jsx = sum("jsx");
  const internal = markdown + jsx;
  const external = sum("external");
  const linked = posts.filter((post) => articleLinks(post).length > 0).length;
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

/** Accepts either the article folder or its `index.md` / `index.mdx`. */
function resolvePostPath(input) {
  const target = input.replace(/\/+$/, "");

  if (existsSync(target) && statSync(target).isDirectory()) {
    const mdx = path.join(target, "index.mdx");

    return existsSync(mdx) ? mdx : path.join(target, "index.md");
  }

  return target;
}

/**
 * Checks a single article — the one being written — instead of the whole blog.
 *
 * Returns the report and whether the article carries enough internal links, so
 * the caller can turn it into an exit code for CI or a pre-commit hook.
 */
function checkPost(file, posts, { minScore, top, minLinks }) {
  if (!existsSync(file)) {
    return { ok: false, text: `${file}: no such article.` };
  }

  const post = readPost(file, { skipDrafts: false });

  if (!post) {
    return { ok: false, text: `${file}: no frontmatter title, not an article.` };
  }

  const corpus = posts.filter((other) => other.slug !== post.slug);
  const termsByPost = new Map(
    corpus.map((other) => [other.slug, identifyingTerms(other)]),
  );
  const candidates = scoreCandidates(post, corpus, termsByPost, { minScore });
  const known = new Set(posts.map((other) => other.permalink));
  // Tag, archive and author pages are internal links, but they are not the
  // article-to-article links this check is about, and they resolve to no post.
  const linked = [...post.links].filter((link) => !SECTION_ROUTE.test(link));
  const sections = [...post.links].filter((link) => SECTION_ROUTE.test(link));
  const unknown = linked.filter((link) => !known.has(link));
  const ok = linked.length >= minLinks;

  const lines = [
    `${post.title}${post.draft ? " (draft)" : ""}`,
    `${file}`,
    "",
    `Links to other articles : ${linked.length}   (minimum expected: ${minLinks})`,
    `Links to blog sections  : ${sections.length}   (tag/archive pages, not counted)`,
    `External links          : ${post.linkCounts.external}`,
  ];

  if (linked.length > 0) {
    lines.push("");

    for (const link of linked) {
      lines.push(`  ${known.has(link) ? "->" : "!!"} ${link}`);
    }
  }

  if (unknown.length > 0) {
    lines.push("");
    lines.push(
      `!! ${unknown.length} link(s) point to no published article — check the slug.`,
    );
  }

  if (!ok) {
    lines.push("");
    lines.push(
      `FAIL: this article links to ${linked.length} other article(s). Add links inline, where the topic is named in the prose.`,
    );
  }

  if (candidates.length > 0) {
    lines.push("");
    lines.push(
      `Suggestions — topics named in the prose but not linked (top ${Math.min(top, candidates.length)} of ${candidates.length}):`,
    );

    for (const { target, score, matched, sharedTags } of candidates.slice(0, top)) {
      lines.push(`  - ${target.title} — ${target.permalink} (score ${score})`);
      lines.push(`    mentioned as: ${matched.map((term) => `"${term}"`).join(", ")}`);

      if (sharedTags.length > 0) {
        lines.push(`    shared tags: ${sharedTags.join(", ")}`);
      }
    }

    lines.push("");
    lines.push("Candidates are hints, not a spec: link what the prose actually names.");
  } else if (!ok) {
    lines.push("");
    lines.push("No candidate found automatically — pick related articles by hand.");
  }

  return { ok, text: lines.join("\n") };
}

function main() {
  const args = process.argv.slice(2);
  const readFlag = (name, fallback) => {
    const index = args.indexOf(name);

    return index === -1 ? fallback : args[index + 1];
  };

  const out = readFlag("--out", null);
  const post = readFlag("--post", null);
  const minLinks = Number(readFlag("--min-links", 1));
  const minScore = Number(readFlag("--min-score", 8));
  // A single article gets a couple more suggestions than the site-wide report,
  // where three per article was already a long file.
  const top = Number(readFlag("--top", post ? 5 : 3));

  const posts = loadPosts();

  if (args.includes("--stats")) {
    console.log(renderStats(posts));
    return;
  }

  if (post) {
    const result = checkPost(resolvePostPath(post), posts, {
      minScore,
      top,
      minLinks,
    });

    console.log(result.text);

    if (!result.ok) {
      process.exitCode = 1;
    }

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
