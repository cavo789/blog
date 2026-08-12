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
 *
 * A handful of nodes are drawn as a small illustration instead of a flat dot, purely for
 * personality — this blog's own meerkat mascot (see /404, ScrollToTopButton). See
 * `pickMeerkatNodes()` in ./utils for which nodes and why.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useHistory } from "@docusaurus/router";
import { usePluginData } from "@docusaurus/useGlobalData";
import GroupedList from "./GroupedList";
import {
  DEFAULT_TOP_N,
  PERMANENT_LABEL_COUNT,
  computeCanvasHeight,
  displayRadius,
  fitTransform,
  humanizeTag,
  neighborsOf,
  pickMeerkatNodes,
  selectVisibleEdges,
  selectVisibleNodes,
  toCanvasSpace,
} from "./utils";
import styles from "./styles.module.css";
import meerkatHubRunning from "@site/static/img/meerkat/suricate_running.webp";
import meerkatHubTrophy from "@site/static/img/meerkat/suricate_trophy.webp";
import meerkatHubSuperhero from "@site/static/img/meerkat/suricate_superhero.webp";
import meerkatOrphanSleeping from "@site/static/img/meerkat/sleeping.webp";
import meerkatOrphanPeeking from "@site/static/img/meerkat/suricate_peeking.webp";
import meerkatOrphanLying from "@site/static/img/meerkat/suricate_sleeping_lying.webp";
import meerkatOrphanTowel from "@site/static/img/meerkat/suricate_towel.webp";
import meerkatOrphanMeditating from "@site/static/img/meerkat/suricate_meditating.webp";

// One pose per rank, not one flat image per kind — see pickMeerkatNodes() in ./utils. Most of
// these are individual poses cropped out of the site's own
// static/img/meerkat/suricate_positions_*.webp sprite sheets (each a 3×3 grid of poses) and
// background-removed; suricate_running.webp and sleeping.webp were already standalone.
const MEERKAT_SOURCES = {
  hub: [meerkatHubRunning, meerkatHubTrophy, meerkatHubSuperhero],
  orphan: [
    meerkatOrphanSleeping,
    meerkatOrphanPeeking,
    meerkatOrphanLying,
    meerkatOrphanTowel,
    meerkatOrphanMeditating,
  ],
};

const MOBILE_BREAKPOINT = 768;
const DIMMED_ALPHA = 0.15;
const HOVER_HIT_PADDING = 3;
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

/** The preloaded image for a pickMeerkatNodes() spot, or null if unassigned/not loaded yet. */
function resolveMeerkatImage(spot, images) {
  if (!spot) return null;
  return images[spot.kind]?.[spot.rank] ?? null;
}

/** Draws `image` centered on (cx, cy), scaled to cover a `size` × `size` box (crop, not stretch). */
function drawImageCover(ctx, image, cx, cy, size) {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.max(size / naturalWidth, size / naturalHeight);
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  ctx.drawImage(image, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);
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
  const [containerWidth, setContainerWidth] = useState(0);
  // Bumped on theme toggle so the draw effect re-reads the (now different) CSS variables —
  // canvas has no way to react to a CSS variable change on its own.
  const [themeVersion, setThemeVersion] = useState(0);
  // { hub: [HTMLImageElement, …], orphan: [HTMLImageElement, …] }, same shape and rank order
  // as MEERKAT_SOURCES, filled in as each image loads. Starts empty, so the draw effect just
  // falls back to a flat color until (and unless) an image is ready.
  const [meerkatImages, setMeerkatImages] = useState({});

  useEffect(() => {
    let cancelled = false;
    const load = (kind, rank, src) =>
      new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve([kind, rank, image]);
        // A failed load (offline, blocked asset) just means that node keeps its flat color —
        // never a reason to break the graph.
        image.onerror = () => resolve([kind, rank, null]);
        image.src = src;
      });

    const loads = Object.entries(MEERKAT_SOURCES).flatMap(([kind, sources]) =>
      sources.map((src, rank) => load(kind, rank, src)),
    );

    Promise.all(loads).then((entries) => {
      if (cancelled) return;
      const loaded = {};
      for (const [kind, rank, image] of entries) {
        if (!image) continue;
        if (!loaded[kind]) loaded[kind] = [];
        loaded[kind][rank] = image;
      }
      setMeerkatImages(loaded);
    });

    return () => {
      cancelled = true;
    };
  }, []);

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
    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
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

  // Height fits the *currently visible* nodes, not a constant tuned for the full 120-node
  // view — see computeCanvasHeight() for why a two-node mainTag filter needs two independent
  // signals (shape *and* count) to reliably get a short canvas instead of inheriting the
  // default view's height with almost everything empty.
  const canvasSize = useMemo(
    () => ({
      width: containerWidth,
      height: computeCanvasHeight(visibleNodes, containerWidth),
    }),
    [containerWidth, visibleNodes],
  );

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

  const specialNodeKinds = useMemo(
    () => pickMeerkatNodes(visibleNodes, visibleEdges),
    [visibleNodes, visibleEdges],
  );

  // The list fallback (mobile, no JS, or the "View as list" disclosure) ignores the top-N
  // cutoff — a plain list has no legibility ceiling the way a canvas does — but must still
  // respect the mainTag filter: otherwise picking a topic from the <select> does nothing
  // visible whenever the canvas itself isn't shown (mobile), which reads as a broken control.
  const listNodes = useMemo(() => {
    if (!graph) return [];
    return mainTag ? graph.nodes.filter((node) => node.mainTag === mainTag) : graph.nodes;
  }, [graph, mainTag]);

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

    // Pass 1: every visible node's circle — independent of which labels end up drawn. A
    // handful (see pickMeerkatNodes) get a meerkat illustration, clipped to the circle, with
    // a thin ring in the node's own color so the mainTag/series signal isn't lost.
    for (const node of visibleNodes) {
      const point = toCanvasSpace(node, transform);
      const isHovered = node.permalink === hovered;
      const isNeighbor = neighborSet?.has(node.permalink) ?? false;
      const dimmed = Boolean(hovered) && !isHovered && !isNeighbor;
      const spot = specialNodeKinds.get(node.permalink);
      const image = resolveMeerkatImage(spot, meerkatImages);
      const radius = displayRadius(node, transform, Boolean(image));

      ctx.globalAlpha = dimmed ? DIMMED_ALPHA : 1;

      if (image) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.clip();
        drawImageCover(ctx, image, point.x, point.y, radius * 2);
        ctx.restore();

        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = node.color;
        ctx.stroke();
      } else {
        ctx.fillStyle = node.color;
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
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
      const spot = specialNodeKinds.get(node.permalink);
      const radius = displayRadius(
        node,
        transform,
        Boolean(resolveMeerkatImage(spot, meerkatImages)),
      );
      candidates.push({
        node,
        x: point.x + radius + 4,
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
    specialNodeKinds,
    meerkatImages,
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
        const spot = specialNodeKinds.get(node.permalink);
        const radius = displayRadius(
          node,
          transform,
          Boolean(resolveMeerkatImage(spot, meerkatImages)),
        );
        const hitRadius = radius + HOVER_HIT_PADDING;
        if ((x - point.x) ** 2 + (y - point.y) ** 2 <= hitRadius ** 2) {
          found = node.permalink;
          break;
        }
      }

      setHovered(found);
      canvas.style.cursor = found ? "pointer" : "default";
    },
    [visibleNodes, transform, specialNodeKinds, meerkatImages],
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
          <GroupedList nodes={listNodes} />
        </details>
      ) : (
        <GroupedList nodes={listNodes} />
      )}
    </div>
  );
}
