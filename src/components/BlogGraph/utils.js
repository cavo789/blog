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

/** "docker-compose" -> "Docker Compose" — good enough for a <select> option, no tags.yml fetch. */
export function humanizeTag(tag) {
  return tag
    .split("-")
    .map((word) => (word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/**
 * The nodes to draw: either every node under the chosen mainTag, or — by default — the top
 * `topN` articles by in-degree across the whole corpus. Never the full corpus at once.
 */
export function selectVisibleNodes(nodes, { mainTag, topN = DEFAULT_TOP_N } = {}) {
  if (mainTag) {
    return nodes.filter((node) => node.mainTag === mainTag);
  }
  return [...nodes].sort((a, b) => b.inDegree - a.inDegree).slice(0, topN);
}

/** Edges whose two endpoints are both currently visible. */
export function selectVisibleEdges(edges, visiblePermalinks) {
  return edges.filter(
    (edge) => visiblePermalinks.has(edge.source) && visiblePermalinks.has(edge.target),
  );
}

/**
 * Maps the (fixed, build-time) virtual coordinate space onto the actual canvas size,
 * fitting the *visible* nodes' bounding box so a single mainTag's cluster — which only
 * occupies a fraction of the full layout — isn't drawn tiny in a mostly-empty canvas.
 */
export function fitTransform(nodes, canvasWidth, canvasHeight, padding = 40) {
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

/** Applies a fitTransform to a single point. */
export function toCanvasSpace(node, transform) {
  return {
    x: node.x * transform.scale + transform.offsetX,
    y: node.y * transform.scale + transform.offsetY,
  };
}

/** Permalinks of a node's direct neighbors, across every visible edge. */
export function neighborsOf(permalink, visibleEdges) {
  const neighbors = new Set();
  for (const edge of visibleEdges) {
    if (edge.source === permalink) neighbors.add(edge.target);
    else if (edge.target === permalink) neighbors.add(edge.source);
  }
  return neighbors;
}

/** Groups posts by mainTag for the no-JS / mobile fallback list, each group sorted by date desc. */
export function groupByMainTag(nodes) {
  const groups = new Map();

  for (const node of nodes) {
    const key = node.mainTag ?? "other";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(node);
  }

  for (const group of groups.values()) {
    group.sort((a, b) => b.date.localeCompare(a.date));
  }

  return [...groups.entries()].sort((a, b) => b[1].length - a[1].length);
}
