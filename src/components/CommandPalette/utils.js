/**
 * Non-React logic for the command palette: fuzzy matching over the build-time nav index
 * (from `plugins/command-palette-plugin`), the Pagefind full-text bridge for the `/` mode,
 * "recently viewed" / "continue this series" localStorage helpers for the empty state, and
 * heading extraction for the `:` mode. Kept separate from `index.js` so the scoring logic is
 * unit-testable in isolation and the component file stays about rendering.
 */

const RECENT_KEY = "cmdk_recently_viewed";
const MAX_RECENT = 8;

// ── Fuzzy matching ──────────────────────────────────────────────────────────────────────

/**
 * Subsequence fuzzy match, VS Code-command-palette style: every character of `query` must
 * appear in `target`, in order, but not necessarily contiguous. Returns `null` on no match,
 * else a score where higher is a better match — consecutive runs and word-start hits are
 * rewarded so "cmdk" ranks "Command Palette" above a coincidental scatter match.
 */
export function fuzzyScore(query, target) {
  if (!query) return 0;

  const q = query.toLowerCase();
  const t = target.toLowerCase();

  let score = 0;
  let tIndex = 0;
  let consecutive = 0;

  for (let qIndex = 0; qIndex < q.length; qIndex += 1) {
    const char = q[qIndex];
    const found = t.indexOf(char, tIndex);
    if (found === -1) return null;

    const atWordStart = found === 0 || /[\s/_-]/.test(t[found - 1]);
    consecutive = found === tIndex ? consecutive + 1 : 0;

    score += 1 + consecutive * 2 + (atWordStart ? 3 : 0);
    tIndex = found + 1;
  }

  // Shorter targets win ties — a query matching "Docker" beats it matching inside a long
  // sentence-length description equally well character-for-character.
  return score - t.length * 0.01;
}

/** Flattens the nav index into one searchable list, tagged by section for grouped display. */
export function buildEntries(navIndex) {
  if (!navIndex) return [];

  const articles = navIndex.articles.map((article) => ({
    section: "articles",
    id: article.permalink,
    title: article.title,
    subtitle: article.mainTag ?? "",
    searchText: [article.title, article.description, article.mainTag, ...article.tags]
      .filter(Boolean)
      .join(" "),
    permalink: article.permalink,
    data: article,
  }));

  const series = navIndex.series.map((entry) => ({
    section: "series",
    id: entry.permalink,
    title: entry.name,
    subtitle: `${entry.count} article${entry.count === 1 ? "" : "s"}`,
    searchText: entry.name,
    permalink: entry.permalink,
    data: entry,
  }));

  const tags = navIndex.tags.map((tag) => ({
    section: "tags",
    id: tag.permalink,
    title: tag.label,
    subtitle: `${tag.count} article${tag.count === 1 ? "" : "s"}`,
    searchText: `${tag.label} ${tag.key}`,
    permalink: tag.permalink,
    data: tag,
  }));

  const pages = navIndex.pages.map((page) => ({
    section: "pages",
    id: page.permalink,
    title: page.title,
    subtitle: "",
    searchText: `${page.title} ${page.keywords}`,
    permalink: page.permalink,
    data: page,
  }));

  return [...articles, ...series, ...tags, ...pages];
}

/** Scores `entries` against `query`, sorted best-first, capped at `limit`. */
export function searchEntries(entries, query, limit = 40) {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const scored = [];
  for (const entry of entries) {
    const score = fuzzyScore(trimmed, entry.searchText);
    if (score !== null) scored.push({ entry, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.entry);
}

// ── Pagefind bridge (`/` mode) ──────────────────────────────────────────────────────────

/**
 * Loads the build-time Pagefind index and runs a full-text search. Returns `null` when the
 * index isn't available — `yarn start` never generates it (it's written in `postBuild`), so
 * this is the same graceful-degradation path `CopyAsMarkdown` takes for its own build-only
 * artifact. The literal import string matters: `docusaurus-plugin-pagefind`'s own
 * `configureWebpack` externals rule matches on this exact request to substitute the real,
 * baseUrl-aware runtime URL — see that plugin's `dist/theme/SearchBar/PagefindClient.js`.
 *
 * The probe below exists because a missing file behind that externals rule fails as a native
 * browser `import()` 404 ("Failed to fetch dynamically imported module"), which webpack's dev
 * overlay reports as an uncaught runtime error even though the `try`/`catch` around it does
 * catch the rejection — the overlay listens for the fetch failure itself, not just unhandled
 * rejections. A plain `!response.ok` check isn't enough on `yarn start`: webpack-dev-server's
 * SPA history fallback answers the missing path with a *200* `index.html` (not a 404), which
 * `import()` then fails to parse as a module — so the probe also checks the content type is
 * actually JavaScript, not the HTML shell.
 */
export async function searchPagefind(query, limit = 8) {
  if (!query.trim()) return null;

  try {
    const probe = await fetch("/pagefind/pagefind.js", { method: "HEAD" });
    const contentType = probe.headers.get("content-type") ?? "";
    if (!probe.ok || !contentType.includes("javascript")) return null;
  } catch {
    return null;
  }

  let pf;
  try {
    pf = await import("/pagefind/pagefind.js");
  } catch {
    return null;
  }
  if (!pf?.search) return null;

  const result = await pf.search(query);
  const sliced = result.results.slice(0, limit);
  const data = await Promise.all(sliced.map((r) => r.data()));

  return data.map((entry) => ({
    title: entry.meta?.title ?? entry.url,
    excerpt: entry.excerpt.replace(/<\/?mark>/gi, ""),
    permalink: entry.url,
  }));
}

// ── Recently viewed (empty state) ───────────────────────────────────────────────────────

export function recordRecentlyViewed(permalink) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const next = [permalink, ...stored.filter((p) => p !== permalink)].slice(
      0,
      MAX_RECENT,
    );
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable (private browsing, quota) — recently-viewed is a nicety, not
    // worth surfacing an error for.
  }
}

/** Resolves stored permalinks back to full article entries, dropping any that no longer exist. */
export function getRecentlyViewed(navIndex, limit = 5) {
  try {
    const stored = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    const byPermalink = new Map(navIndex.articles.map((a) => [a.permalink, a]));
    return stored
      .map((permalink) => byPermalink.get(permalink))
      .filter(Boolean)
      .slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * The next post (by date) in the same series as the most recently viewed article — series
 * order is date-based throughout this codebase, see `plugins/blog-graph-plugin`'s "series"
 * edge type for the same convention.
 */
export function getContinueSeries(navIndex) {
  const recent = getRecentlyViewed(navIndex, 1)[0];
  if (!recent?.series) return null;

  const sameSeries = navIndex.articles
    .filter((a) => a.series === recent.series)
    .sort((a, b) => a.date.localeCompare(b.date));

  const currentIndex = sameSeries.findIndex((a) => a.permalink === recent.permalink);
  if (currentIndex === -1) return null;

  return sameSeries[currentIndex + 1] ?? null;
}

// ── Page headings (`:` mode) ────────────────────────────────────────────────────────────

/** Reads the current page's `<h2>`-`<h6>` headings straight from the DOM for in-page jumps. */
export function getPageHeadings() {
  const main = document.querySelector("article") ?? document.querySelector("main");
  if (!main) return [];

  return Array.from(main.querySelectorAll("h2, h3, h4, h5, h6"))
    .filter((heading) => heading.id)
    .map((heading) => ({
      id: heading.id,
      text: heading.innerText,
      level: Number(heading.tagName[1]),
    }));
}
