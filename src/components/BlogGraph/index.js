/**
 * BlogGraph — the interactive corpus map rendered on `/map`.
 *
 * Reads the pre-computed graph (nodes, edges, build-time force layout) from
 * `plugins/blog-graph-plugin` via `usePluginData`, then:
 * - draws it on a `<canvas>` (248 nodes + edges in the DOM would crawl on hover/drag —
 *   see 0081's "Solution" §2), never more than the top ~120 articles by in-degree, or a
 *   single mainTag's subgraph once one is picked from the filter;
 * - degrades to `GroupedList` (an SSR'd, fully indexable plain list) with JavaScript
 *   disabled and on narrow viewports, where a force-directed graph has no room to be
 *   legible.
 *
 * The layout itself is already static (computed once, in Node — see the plugin's header
 * comment) so there is no `prefers-reduced-motion` branch to build here: nothing animates
 * on its own in the first place. The only motion is the hover crossfade, which the
 * stylesheet already turns off under that media query.
 *
 * No client-side simulation, no drag-to-reposition — out of scope per the TODO (only hover
 * and click are specified), and dropping it keeps `d3-force` a build-time-only dependency.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory } from "@docusaurus/router";
import { usePluginData } from "@docusaurus/useGlobalData";
import GroupedList from "./GroupedList";
import {
  DEFAULT_TOP_N,
  PERMANENT_LABEL_COUNT,
  fitTransform,
  humanizeTag,
  neighborsOf,
  selectVisibleEdges,
  selectVisibleNodes,
  toCanvasSpace,
} from "./utils";
import styles from "./styles.module.css";

const MOBILE_BREAKPOINT = 768;
const DIMMED_ALPHA = 0.15;
const HOVER_HIT_PADDING = 3;
const CANVAS_ASPECT_RATIO = 0.62;
const LABEL_FONT =
  "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const EDGE_ALPHA = { link: 0.55, series: 0.4, tag: 0.18 };
const EDGE_WIDTH = { link: 1.4, series: 1, tag: 0.7 };
const LABEL_HEIGHT = 14;
const LABEL_PADDING = 2;

/**
 * Greedily keeps only the labels that don't overlap an already-placed one, in priority
 * order (the caller sorts `candidates` — hovered node first, then its neighbors, then the
 * permanently-labeled hubs). A crowded mainTag filter can otherwise stack a dozen titles on
 * top of each other, which is exactly the "hairball" outcome the spec says must not ship.
 */
function selectNonOverlappingLabels(ctx, candidates) {
  const placed = [];
  const drawnRects = [];

  for (const candidate of candidates) {
    const width = ctx.measureText(candidate.node.title).width;
    const rect = {
      left: candidate.x - LABEL_PADDING,
      right: candidate.x + width + LABEL_PADDING,
      top: candidate.y - LABEL_HEIGHT / 2,
      bottom: candidate.y + LABEL_HEIGHT / 2,
    };
    const overlapsExisting = drawnRects.some(
      (drawn) =>
        rect.left < drawn.right &&
        rect.right > drawn.left &&
        rect.top < drawn.bottom &&
        rect.bottom > drawn.top,
    );

    if (!overlapsExisting) {
      drawnRects.push(rect);
      placed.push(candidate);
    }
  }

  return placed;
}

/** Reads the current theme's own colors so the canvas never hardcodes a hex value. */
function readThemeColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    edge: style.getPropertyValue("--ifm-color-emphasis-500").trim() || "#999999",
    label: style.getPropertyValue("--ifm-font-color-base").trim() || "#1c1e21",
  };
}

export default function BlogGraph() {
  const graph = usePluginData("blog-graph-plugin");
  const history = useHistory();

  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mainTag, setMainTag] = useState("");
  const [hovered, setHovered] = useState(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  // Bumped on theme toggle so the draw effect re-reads the (now different) CSS variables —
  // canvas has no way to react to a CSS variable change on its own.
  const [themeVersion, setThemeVersion] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- SSR-safe mount detection, same pattern as ScrollToTopButton/reactions-dashboard
    setMounted(true);
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();
    mediaQuery.addEventListener("change", updateIsMobile);
    return () => mediaQuery.removeEventListener("change", updateIsMobile);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeVersion((v) => v + 1));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  // Progressive enhancement only: canvas graph once mounted on a wide-enough viewport,
  // the plain grouped list everywhere else (no JS at all, or a narrow screen).
  const showCanvas = mounted && !isMobile;

  useEffect(() => {
    if (!showCanvas || !wrapRef.current) return undefined;
    const el = wrapRef.current;
    const updateSize = () =>
      setCanvasSize({
        width: el.clientWidth,
        height: Math.round(el.clientWidth * CANVAS_ASPECT_RATIO),
      });
    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(el);
    return () => resizeObserver.disconnect();
  }, [showCanvas]);

  const mainTags = useMemo(() => {
    if (!graph) return [];
    return [...new Set(graph.nodes.map((node) => node.mainTag).filter(Boolean))].sort();
  }, [graph]);

  const visibleNodes = useMemo(() => {
    if (!graph) return [];
    return selectVisibleNodes(graph.nodes, {
      mainTag: mainTag || null,
      topN: DEFAULT_TOP_N,
    });
  }, [graph, mainTag]);

  const visiblePermalinks = useMemo(
    () => new Set(visibleNodes.map((node) => node.permalink)),
    [visibleNodes],
  );

  const nodeByPermalink = useMemo(
    () => new Map(visibleNodes.map((node) => [node.permalink, node])),
    [visibleNodes],
  );

  const visibleEdges = useMemo(() => {
    if (!graph) return [];
    return selectVisibleEdges(graph.edges, visiblePermalinks);
  }, [graph, visiblePermalinks]);

  const permanentLabelSet = useMemo(
    () =>
      new Set(
        [...visibleNodes]
          .sort((a, b) => b.inDegree - a.inDegree)
          .slice(0, PERMANENT_LABEL_COUNT)
          .map((node) => node.permalink),
      ),
    [visibleNodes],
  );

  const neighborSet = useMemo(
    () => (hovered ? neighborsOf(hovered, visibleEdges) : null),
    [hovered, visibleEdges],
  );

  const transform = useMemo(
    () => fitTransform(visibleNodes, canvasSize.width || 1, canvasSize.height || 1),
    [visibleNodes, canvasSize],
  );

  // Draws the whole graph. Re-runs on every filter/hover/resize/theme change — cheap enough
  // at this node/edge count (never more than ~120 nodes) to just redraw from scratch.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!showCanvas || !canvas || canvasSize.width === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize.width * dpr;
    canvas.height = canvasSize.height * dpr;
    canvas.style.width = `${canvasSize.width}px`;
    canvas.style.height = `${canvasSize.height}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

    const colors = readThemeColors();

    for (const edge of visibleEdges) {
      const source = nodeByPermalink.get(edge.source);
      const target = nodeByPermalink.get(edge.target);
      if (!source || !target) continue;

      const touchesHovered =
        hovered && (edge.source === hovered || edge.target === hovered);
      const dimmed = Boolean(hovered) && !touchesHovered;
      const p1 = toCanvasSpace(source, transform);
      const p2 = toCanvasSpace(target, transform);

      ctx.globalAlpha = (EDGE_ALPHA[edge.type] ?? 0.2) * (dimmed ? DIMMED_ALPHA : 1);
      ctx.strokeStyle = colors.edge;
      ctx.lineWidth = EDGE_WIDTH[edge.type] ?? 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Pass 1: every visible node's circle — independent of which labels end up drawn.
    for (const node of visibleNodes) {
      const point = toCanvasSpace(node, transform);
      const isHovered = node.permalink === hovered;
      const isNeighbor = neighborSet?.has(node.permalink) ?? false;
      const dimmed = Boolean(hovered) && !isHovered && !isNeighbor;
      const radius = node.radius * transform.scale;

      ctx.globalAlpha = dimmed ? DIMMED_ALPHA : 1;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pass 2: labels, in priority order — hovered node, then its neighbors, then the
    // permanently-labeled hubs — dropping whichever would overlap a higher-priority one
    // already placed. See selectNonOverlappingLabels() for why this is not optional.
    ctx.textBaseline = "middle";
    ctx.font = LABEL_FONT;

    const candidates = [];
    const queued = new Set();
    const queueCandidate = (node) => {
      if (!node || queued.has(node.permalink)) return;
      queued.add(node.permalink);
      const point = toCanvasSpace(node, transform);
      const isHovered = node.permalink === hovered;
      const isNeighbor = neighborSet?.has(node.permalink) ?? false;
      candidates.push({
        node,
        x: point.x + node.radius * transform.scale + 4,
        y: point.y,
        dimmed: Boolean(hovered) && !isHovered && !isNeighbor,
      });
    };

    queueCandidate(hovered ? nodeByPermalink.get(hovered) : null);
    if (neighborSet) {
      for (const permalink of neighborSet) {
        queueCandidate(nodeByPermalink.get(permalink));
      }
    }
    for (const permalink of permanentLabelSet) {
      queueCandidate(nodeByPermalink.get(permalink));
    }

    for (const candidate of selectNonOverlappingLabels(ctx, candidates)) {
      ctx.globalAlpha = candidate.dimmed ? DIMMED_ALPHA : 1;
      ctx.fillStyle = colors.label;
      ctx.fillText(candidate.node.title, candidate.x, candidate.y);
    }

    ctx.globalAlpha = 1;
  }, [
    showCanvas,
    canvasSize,
    visibleNodes,
    visibleEdges,
    nodeByPermalink,
    transform,
    hovered,
    neighborSet,
    permanentLabelSet,
    themeVersion,
  ]);

  const handleMouseMove = useCallback(
    (event) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      let found = null;
      for (const node of visibleNodes) {
        const point = toCanvasSpace(node, transform);
        const hitRadius = node.radius * transform.scale + HOVER_HIT_PADDING;
        if ((x - point.x) ** 2 + (y - point.y) ** 2 <= hitRadius ** 2) {
          found = node.permalink;
          break;
        }
      }

      setHovered(found);
      canvas.style.cursor = found ? "pointer" : "default";
    },
    [visibleNodes, transform],
  );

  const handleMouseLeave = useCallback(() => setHovered(null), []);

  const handleClick = useCallback(() => {
    if (hovered) history.push(hovered);
  }, [hovered, history]);

  if (!graph) return null;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <div className={styles.controls}>
        <label className={styles.selectLabel} htmlFor="blog-graph-maintag">
          Filter by topic
          <select
            id="blog-graph-maintag"
            className={styles.select}
            value={mainTag}
            onChange={(event) => setMainTag(event.target.value)}
          >
            <option value="">{`Top ${DEFAULT_TOP_N} most-linked articles`}</option>
            {mainTags.map((tag) => (
              <option key={tag} value={tag}>
                {humanizeTag(tag)}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.counter}>
          {graph.meta.articleCount} articles · {graph.meta.seriesCount} series ·{" "}
          {graph.meta.linkCount} internal links
        </p>
      </div>

      {showCanvas && (
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label={`Force-directed map of ${visibleNodes.length} articles and ${visibleEdges.length} connections. Hover a node to see its title and neighbors, click to open the article.`}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          Your browser does not support the canvas element — see the list below instead.
        </canvas>
      )}

      {showCanvas ? (
        <details className={styles.listFallback}>
          <summary>View as list instead</summary>
          <GroupedList nodes={graph.nodes} />
        </details>
      ) : (
        <GroupedList nodes={graph.nodes} />
      )}
    </div>
  );
}
