/**
 * Docusaurus Plugin: blog-graph
 *
 * Purpose:
 * Builds the corpus-wide node/edge graph (link, series and tag relationships between every
 * published article) that powers the `/map` page's `BlogGraph` component — see
 * `.todos/DONE/DONE_0081-blog-knowledge-graph-map-page.md` for the full spec.
 *
 * Why the force-directed layout is computed *here*, at build time, instead of in the
 * browser:
 * `/map`'s non-negotiable constraints (works with JS disabled, static rendering under
 * `prefers-reduced-motion`, indexable without hydration) all fall out for free once the
 * *positions* are already final by the time the page reaches the browser — so the
 * simulation runs once, in Node, and only the converged `(x, y)` per node ships to the
 * client. Nothing in the spec asks for live drag-to-reposition, so the client never needs
 * `d3-force` at all: the ~20 Ko dependency stays a build-time-only cost, out of the browser
 * bundle entirely.
 *
 * Data flow:
 * - `loadContent()` runs on every `yarn start` reload and once for `yarn build`. It reads
 *   the same corpus `scripts/internal-link-opportunities.mjs` uses
 *   (`scripts/lib/blog-corpus.mjs`, extracted for exactly this reason — see that file's
 *   header), builds nodes/edges, colors each node, then runs a deterministic `d3-force`
 *   simulation to converge `(x, y)`.
 * - `contentLoaded()` exposes the result as global plugin data via `setGlobalData`, so
 *   `src/pages/map.js` reads it with `usePluginData("blog-graph-plugin")` — available
 *   during SSR (baked into the static HTML) and during hydration, no client-side fetch.
 *
 * Node color — *not* an invented palette:
 * A post's node reuses whichever accent color the site already assigns it elsewhere: the
 * hand-picked `series.color` (`src/data/series.js`) for posts that belong to a series —
 * the same color `SeriesArticlesPage` themes its hero with — else the post's own
 * auto-extracted banner accent (`src/data/postColors.generated.js`, keyed by the post's
 * `image` frontmatter), the same color `BlogPostItem/Content` themes its hero with. See
 * `src/components/Blog/utils/color.md`. A post with neither falls back to a neutral gray.
 *
 * Edge types:
 * - "link"   — a real inline link from one post's prose to another (heaviest pull).
 * - "series" — two consecutive posts (by date) within the same series.
 * - "tag"    — shared tags between two posts. Only pairs sharing >= 2 tags are emitted at
 *   all: at this corpus size almost every pair of posts shares at least one tag, so a
 *   weight-1 threshold would connect everything to everything and defeat both the layout
 *   and the "don't draw the weak edges" rule from the spec. There is no separate
 *   simulate-but-don't-draw step — dropping weight-1 pairs before the layout runs is a
 *   simplification of the spec's threshold, made possible by the layout itself running
 *   once at build time rather than live in the browser.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
} from "d3-force";
import { loadPosts } from "../../scripts/lib/blog-corpus.mjs";
import SERIES_DATA from "../../src/data/series.js";
import POST_COLORS from "../../src/data/postColors.generated.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Virtual coordinate space the layout is computed in. The client normalizes/scales this to
// whatever the actual canvas size is, so these are arbitrary but must stay fixed for the
// simulation's forces (distance, center) to make sense relative to one another.
const WIDTH = 1600;
const HEIGHT = 1000;

const MIN_NODE_RADIUS = 3;
const MAX_NODE_RADIUS = 20;

// Below this many shared tags, a pair of posts is not connected at all — see the "tag" bullet
// in the module comment above.
const MIN_SHARED_TAGS = 2;

// The layout (computeLayout, below) uses every edge down to MIN_SHARED_TAGS for spatial
// pull, but the client never runs a simulation and only ever draws a "tag" edge above a
// stricter threshold — shipping the weight-2 pairs (the large majority: ~1150 of ~1350 tag
// edges in this corpus) would triple the payload for edges nothing ever renders. This is the
// build-time equivalent of the spec's "simulate but don't draw below a threshold" rule.
const SHIP_MIN_SHARED_TAGS = 3;

const FALLBACK_COLOR = "#94a3b8"; // Neutral slate — only used when a post has neither a
// series color nor a banner accent (no image, or an image `generate-post-colors.mjs`
// couldn't extract a vivid color from).

const AVERAGE_READING_WPM = 200;

/** Approximate reading time from the already-prose-stripped body text. */
function readingTimeMinutes(prose) {
  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / AVERAGE_READING_WPM));
}

/** Builds the "link" / "series" / "tag" edges between posts. */
function buildEdges(posts) {
  const known = new Set(posts.map((post) => post.permalink));
  const edges = [];

  // "link" — real inline links, the strongest signal of relatedness.
  for (const post of posts) {
    for (const target of post.links) {
      if (target !== post.permalink && known.has(target)) {
        edges.push({ source: post.permalink, target, type: "link", weight: 3 });
      }
    }
  }

  // "series" — consecutive posts (by date) within the same series.
  const bySeries = new Map();
  for (const post of posts) {
    if (!post.series) continue;
    if (!bySeries.has(post.series)) bySeries.set(post.series, []);
    bySeries.get(post.series).push(post);
  }
  for (const seriesPosts of bySeries.values()) {
    seriesPosts.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < seriesPosts.length - 1; i += 1) {
      edges.push({
        source: seriesPosts[i].permalink,
        target: seriesPosts[i + 1].permalink,
        type: "series",
        weight: 2,
      });
    }
  }

  // "tag" — shared tags, weight = number of shared tags. See MIN_SHARED_TAGS above.
  for (let i = 0; i < posts.length; i += 1) {
    for (let j = i + 1; j < posts.length; j += 1) {
      const shared = posts[i].tags.filter((tag) => posts[j].tags.includes(tag));
      if (shared.length >= MIN_SHARED_TAGS) {
        edges.push({
          source: posts[i].permalink,
          target: posts[j].permalink,
          type: "tag",
          weight: shared.length,
        });
      }
    }
  }

  return edges;
}

/** In-degree (how many *other* articles link to this one) per permalink, from "link" edges only. */
function computeInDegree(posts, edges) {
  const inDegree = new Map(posts.map((post) => [post.permalink, 0]));
  for (const edge of edges) {
    if (edge.type === "link" && inDegree.has(edge.target)) {
      inDegree.set(edge.target, inDegree.get(edge.target) + 1);
    }
  }
  return inDegree;
}

/** Reuses the site's own already-established accent colors — never an invented palette. */
function buildColorPicker() {
  const seriesColorByName = new Map(
    SERIES_DATA.map((series) => [series.name, series.color]),
  );

  return (post) => {
    if (post.series && seriesColorByName.has(post.series)) {
      return seriesColorByName.get(post.series);
    }
    if (post.image && POST_COLORS[post.image]) {
      return POST_COLORS[post.image];
    }
    return FALLBACK_COLOR;
  };
}

/** Radius grows with the square root of in-degree — linear would let hubs swallow the map. */
function buildRadiusScale(maxInDegree) {
  const safeMax = Math.max(maxInDegree, 1);
  return (inDegree) =>
    MIN_NODE_RADIUS + (MAX_NODE_RADIUS - MIN_NODE_RADIUS) * Math.sqrt(inDegree / safeMax);
}

const EDGE_TUNING = {
  link: { distance: 55, strength: 0.85 },
  series: { distance: 70, strength: 0.5 },
  tag: { distance: 110, strength: 0.08 }, // scaled further by weight below
};

/**
 * Runs the force simulation to convergence and returns `{ permalink, x, y }` for every node.
 * Deterministic: node order is sorted before the simulation starts (d3-force's default
 * initial placement is a function of array index, not `Math.random()`), so re-running the
 * build without any corpus change reproduces the same layout.
 */
function computeLayout(nodes, edges) {
  const sortedNodes = [...nodes].sort((a, b) => a.permalink.localeCompare(b.permalink));
  const radiusByPermalink = new Map(
    sortedNodes.map((node) => [node.permalink, node.radius]),
  );

  const simNodes = sortedNodes.map((node) => ({ id: node.permalink }));
  const simLinks = edges.map((edge) => ({ ...edge }));

  const simulation = forceSimulation(simNodes)
    .force(
      "link",
      forceLink(simLinks)
        .id((d) => d.id)
        .distance((edge) => EDGE_TUNING[edge.type].distance)
        .strength((edge) => {
          const { strength } = EDGE_TUNING[edge.type];
          return edge.type === "tag" ? Math.min(strength * edge.weight, 0.6) : strength;
        }),
    )
    .force("charge", forceManyBody().strength(-45))
    .force("center", forceCenter(WIDTH / 2, HEIGHT / 2))
    .force(
      "collide",
      forceCollide((d) => radiusByPermalink.get(d.id) + 2),
    )
    .stop();

  // Pre-converge synchronously instead of animating in the browser — this is the "simulation
  // pré-convergée au build" the reduced-motion/no-JS requirements depend on.
  const TICKS = 300;
  for (let i = 0; i < TICKS; i += 1) {
    simulation.tick();
  }

  return new Map(simNodes.map((node) => [node.id, { x: node.x, y: node.y }]));
}

/** Builds the full graph — nodes, edges, layout and corpus-wide counters. */
function buildGraph() {
  const posts = loadPosts();
  const edges = buildEdges(posts);
  const inDegreeByPermalink = computeInDegree(posts, edges);
  const maxInDegree = Math.max(0, ...inDegreeByPermalink.values());
  const radiusScale = buildRadiusScale(maxInDegree);
  const colorForPost = buildColorPicker();

  const nodes = posts.map((post) => {
    const inDegree = inDegreeByPermalink.get(post.permalink) ?? 0;
    return {
      slug: post.slug,
      title: post.title,
      permalink: post.permalink,
      date: post.date,
      mainTag: post.mainTag,
      series: post.series,
      readingTime: readingTimeMinutes(post.prose),
      inDegree,
      radius: radiusScale(inDegree),
      color: colorForPost(post),
    };
  });

  const layout = computeLayout(nodes, edges);
  for (const node of nodes) {
    const position = layout.get(node.permalink);
    node.x = position.x;
    node.y = position.y;
  }

  const seriesCount = new Set(posts.map((post) => post.series).filter(Boolean)).size;
  const linkEdgeCount = edges.filter((edge) => edge.type === "link").length;

  // See SHIP_MIN_SHARED_TAGS above: the layout already used the full tag-edge set, this only
  // trims what ships to the browser.
  const shippedEdges = edges.filter(
    (edge) => edge.type !== "tag" || edge.weight >= SHIP_MIN_SHARED_TAGS,
  );

  return {
    generatedAt: new Date().toISOString(),
    width: WIDTH,
    height: HEIGHT,
    nodes,
    edges: shippedEdges,
    meta: {
      articleCount: posts.length,
      seriesCount,
      linkCount: linkEdgeCount,
    },
  };
}

export default function blogGraphPlugin() {
  return {
    name: "blog-graph-plugin",

    async loadContent() {
      return buildGraph();
    },

    async contentLoaded({ content, actions }) {
      actions.setGlobalData(content);
    },

    getPathsToWatch() {
      // Rebuild the graph in `yarn start` whenever an article's frontmatter/body or the
      // corpus-loading lib itself changes — not just on a hard restart.
      return [
        path.join(__dirname, "../../blog/**/index.{md,mdx}"),
        path.join(__dirname, "../../scripts/lib/blog-corpus.mjs"),
        path.join(__dirname, "../../src/data/series.js"),
        path.join(__dirname, "../../src/data/postColors.generated.js"),
      ];
    },
  };
}
