/**
 * Pure helpers for BlogGraph — kept separate from the canvas/React code so the filtering,
 * fit-to-viewport and labeling logic can be read (and changed) without wading through event
 * handlers.
 */

// Default view: the corpus is never shown all at once (248 nodes is a hairball) — only the
// top articles by in-degree, unless a mainTag is picked instead. See 0081's "Solution" §2.
export const DEFAULT_TOP_N = 120;

// How many of the most-connected *visible* nodes keep a permanently drawn label — the rest
// only label on hover, per the spec's "pas 248 labels" rule.
export const PERMANENT_LABEL_COUNT = 8;

// A handful of nodes get a meerkat illustration instead of a flat-colored dot — purely for
// personality, reusing the site's own mascot (see /404, ScrollToTopButton). Kept small and
// capped: this is a garnish, not a redesign of how the map reads.
export const MEERKAT_HUB_COUNT = 3;
export const MEERKAT_ORPHAN_COUNT = 5;
// A degree-3 orphan node would otherwise draw at MIN_NODE_RADIUS (a few px) — too small for a
// meerkat face to read. Only special-illustrated nodes get this floor; everything else keeps
// its data-driven size.
export const MEERKAT_MIN_RADIUS = 13;

/** One article, as shipped by `plugins/blog-graph-plugin` (build-time layout already computed). */
export interface BlogGraphNode {
  slug: string;
  title: string;
  permalink: string;
  date: string;
  mainTag: string | null;
  series: string | null;
  readingTime: number;
  inDegree: number;
  radius: number;
  color: string;
  x: number;
  y: number;
}

export type BlogGraphEdgeType = "link" | "series" | "tag";

export interface BlogGraphEdge {
  source: string;
  target: string;
  type: BlogGraphEdgeType;
  weight: number;
}

export interface BlogGraphData {
  width: number;
  height: number;
  nodes: BlogGraphNode[];
  edges: BlogGraphEdge[];
  meta: {
    articleCount: number;
    seriesCount: number;
    linkCount: number;
  };
}

/** Maps the fixed virtual coordinate space onto the actual canvas pixel size. */
export interface Transform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** "docker-compose" -> "Docker Compose" — good enough for a <select> option, no tags.yml fetch. */
export function humanizeTag(tag: string): string {
  return tag
    .split("-")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/**
 * The nodes to draw: either every node under the chosen mainTag, or — by default — the top
 * `topN` articles by in-degree across the whole corpus. Never the full corpus at once.
 */
export function selectVisibleNodes(
  nodes: BlogGraphNode[],
  { mainTag, topN = DEFAULT_TOP_N }: { mainTag?: string | null; topN?: number } = {},
): BlogGraphNode[] {
  if (mainTag) {
    return nodes.filter((node) => node.mainTag === mainTag);
  }
  return [...nodes].sort((a, b) => b.inDegree - a.inDegree).slice(0, topN);
}

/** Edges whose two endpoints are both currently visible. */
export function selectVisibleEdges(
  edges: BlogGraphEdge[],
  visiblePermalinks: Set<string>,
): BlogGraphEdge[] {
  return edges.filter(
    (edge) => visiblePermalinks.has(edge.source) && visiblePermalinks.has(edge.target),
  );
}

/**
 * Maps the (fixed, build-time) virtual coordinate space onto the actual canvas size,
 * fitting the *visible* nodes' bounding box so a single mainTag's cluster — which only
 * occupies a fraction of the full layout — isn't drawn tiny in a mostly-empty canvas.
 */
export function fitTransform(
  nodes: BlogGraphNode[],
  canvasWidth: number,
  canvasHeight: number,
  padding = 40,
): Transform {
  if (nodes.length === 0) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  const availableWidth = Math.max(canvasWidth - padding * 2, 1);
  const availableHeight = Math.max(canvasHeight - padding * 2, 1);
  const scale = Math.min(availableWidth / spanX, availableHeight / spanY, 4);

  const drawnWidth = spanX * scale;
  const drawnHeight = spanY * scale;
  const offsetX = (canvasWidth - drawnWidth) / 2 - minX * scale;
  const offsetY = (canvasHeight - drawnHeight) / 2 - minY * scale;

  return { scale, offsetX, offsetY };
}

/**
 * The height/width ratio of the visible nodes' own bounding box, in the fixed virtual
 * coordinate space (so it's independent of the actual canvas pixel size). `null` when there
 * aren't enough nodes to infer a meaningful shape (0 or 1).
 */
function contentAspectRatio(nodes: BlogGraphNode[]): number | null {
  if (nodes.length < 2) {
    return null;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const node of nodes) {
    minX = Math.min(minX, node.x - node.radius);
    maxX = Math.max(maxX, node.x + node.radius);
    minY = Math.min(minY, node.y - node.radius);
    maxY = Math.max(maxY, node.y + node.radius);
  }

  const spanX = Math.max(maxX - minX, 1);
  const spanY = Math.max(maxY - minY, 1);
  return spanY / spanX;
}

/**
 * The canvas element's own height for the current container width and visible node set.
 * Blends two independent estimates and keeps whichever is *smaller*, because either one
 * alone has a blind spot that reproduces the "gigantic canvas for two elements" bug:
 *
 * - **aspect-ratio** fits the visible nodes' own bounding-box shape — works well when a
 *   filtered mainTag's articles happen to cluster together spatially, but a couple of nodes
 *   that are simply far apart *in the shared, whole-corpus layout* (they don't need to link
 *   to each other to share a mainTag) produce an extreme ratio that clamps right back up to
 *   the default max height, i.e. no visible shrink at all.
 * - **density** scales down purely from how few nodes are visible relative to the default
 *   top-N view — catches exactly that case, but on its own would happily give a tall, tightly
 *   clustered pair of nodes a squashed canvas it didn't need.
 *
 * Taking the minimum means neither blind spot alone can produce an oversized canvas.
 */
export function computeCanvasHeight(
  nodes: BlogGraphNode[],
  containerWidth: number,
  {
    defaultTopN = DEFAULT_TOP_N,
    minHeight = 220,
    maxRatio = 0.62,
    padding = 80,
  }: {
    defaultTopN?: number;
    minHeight?: number;
    maxRatio?: number;
    padding?: number;
  } = {},
): number {
  if (containerWidth <= 0) {
    return 0;
  }

  const maxHeight = Math.round(containerWidth * maxRatio);
  const clamp = (height: number) => Math.min(Math.max(height, minHeight), maxHeight);

  const ratio = contentAspectRatio(nodes) ?? maxRatio;
  const aspectHeight = clamp(Math.round(containerWidth * ratio) + padding);

  const density = Math.min(nodes.length / defaultTopN, 1);
  const densityHeight = clamp(
    Math.round(minHeight + (maxHeight - minHeight) * Math.sqrt(density)),
  );

  return Math.min(aspectHeight, densityHeight);
}

/** Applies a fitTransform to a single point. */
export function toCanvasSpace(
  node: BlogGraphNode,
  transform: Transform,
): { x: number; y: number } {
  return {
    x: node.x * transform.scale + transform.offsetX,
    y: node.y * transform.scale + transform.offsetY,
  };
}

/** Permalinks of a node's direct neighbors, across every visible edge. */
export function neighborsOf(
  permalink: string,
  visibleEdges: BlogGraphEdge[],
): Set<string> {
  const neighbors = new Set<string>();
  for (const edge of visibleEdges) {
    if (edge.source === permalink) neighbors.add(edge.target);
    else if (edge.target === permalink) neighbors.add(edge.source);
  }
  return neighbors;
}

/** Degree (any edge type) of each node, counted only from the currently visible edges. */
export function computeVisibleDegree(
  nodes: BlogGraphNode[],
  edges: BlogGraphEdge[],
): Map<string, number> {
  const degree = new Map(nodes.map((node) => [node.permalink, 0]));
  for (const edge of edges) {
    if (degree.has(edge.source)) degree.set(edge.source, degree.get(edge.source)! + 1);
    if (degree.has(edge.target)) degree.set(edge.target, degree.get(edge.target)! + 1);
  }
  return degree;
}

export interface MeerkatSpot {
  kind: "hub" | "orphan";
  rank: number;
}

/**
 * Which visible nodes get a meerkat instead of a flat color, and which one of several: the
 * busiest hubs (by in-degree) each get their own "success" pose (running, trophy, superhero —
 * see MEERKAT_SOURCES in index.tsx), nodes with no visible connection at all — degree zero in
 * the *currently drawn* edge set — each get their own "nobody's noticed me yet" pose
 * (sleeping, peeking from hiding, curled up, wrapped in a towel, meditating). `rank` is the
 * index into that pose list, so the caller can pick a different image per node instead of
 * repeating the same one.
 */
export function pickMeerkatNodes(
  nodes: BlogGraphNode[],
  edges: BlogGraphEdge[],
): Map<string, MeerkatSpot> {
  const spots = new Map<string, MeerkatSpot>();
  const degree = computeVisibleDegree(nodes, edges);

  const orphans = nodes
    .filter((node) => (degree.get(node.permalink) ?? 0) === 0)
    // Stable, deterministic pick among however many orphans there are — not "most recent" or
    // anything meaningful, just consistent between renders.
    .sort((a, b) => a.permalink.localeCompare(b.permalink))
    .slice(0, MEERKAT_ORPHAN_COUNT);
  orphans.forEach((node, rank) => spots.set(node.permalink, { kind: "orphan", rank }));

  const hubs = [...nodes]
    .filter((node) => node.inDegree > 0)
    .sort((a, b) => b.inDegree - a.inDegree)
    .slice(0, MEERKAT_HUB_COUNT);
  hubs.forEach((node, rank) => spots.set(node.permalink, { kind: "hub", rank }));

  return spots;
}

/** The on-canvas radius for a node, boosted when it's meerkat-illustrated (see MEERKAT_MIN_RADIUS). */
export function displayRadius(
  node: BlogGraphNode,
  transform: Transform,
  isSpecial: boolean,
): number {
  const base = node.radius * transform.scale;
  return isSpecial ? Math.max(base, MEERKAT_MIN_RADIUS) : base;
}

/** Groups posts by mainTag for the no-JS / mobile fallback list, each group sorted by date desc. */
export function groupByMainTag(nodes: BlogGraphNode[]): [string, BlogGraphNode[]][] {
  const groups = new Map<string, BlogGraphNode[]>();

  for (const node of nodes) {
    const key = node.mainTag ?? "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(node);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => b.date.localeCompare(a.date));
  }

  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}
