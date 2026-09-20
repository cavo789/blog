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
 * The nodes themselves are drawn as this blog's own meerkat mascot rather than as flat dots —
 * one sticker per mainTag, so a topic reads as a family at a glance. See ./meerkats for the
 * mapping, and MEERKAT_MIN_DRAWN_RADIUS in ./utils for the size below which a face stops being
 * legible and the node falls back to the colored dot it always was.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useHistory } from "@docusaurus/router";
import { usePluginData } from "@docusaurus/useGlobalData";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useTagLabel } from "@site/src/components/Blog/utils/tagsI18n";
import GroupedList from "./GroupedList";
import {
  DEFAULT_TOP_N,
  MEERKAT_MIN_DRAWN_RADIUS,
  PERMANENT_LABEL_COUNT,
  computeCanvasHeight,
  displayRadius,
  fitTransform,
  neighborsOf,
  pickOrphanNodes,
  selectVisibleEdges,
  selectVisibleNodes,
  toCanvasSpace,
  type BlogGraphData,
  type BlogGraphNode,
  type Transform,
} from "./utils";
import { meerkatPathFor } from "./meerkats";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

/**
 * Sticker path (as `meerkatPathFor` returns it, before `withBaseUrl`) -> the decoded image, for
 * the stickers the current view actually needs.
 */
type MeerkatImages = Record<string, HTMLImageElement>;

interface LabelCandidate {
  node: BlogGraphNode;
  x: number;
  y: number;
  dimmed: boolean;
}

const MOBILE_BREAKPOINT = 768;
const DIMMED_ALPHA = 0.15;
const HOVER_HIT_PADDING = 3;
const LABEL_FONT =
  "12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const EDGE_ALPHA: Record<string, number> = { link: 0.55, series: 0.4, tag: 0.18 };
const EDGE_WIDTH: Record<string, number> = { link: 1.4, series: 1, tag: 0.7 };
const LABEL_HEIGHT = 14;
const LABEL_PADDING = 2;

/**
 * Greedily keeps only the labels that don't overlap an already-placed one, in priority
 * order (the caller sorts `candidates` — hovered node first, then its neighbors, then the
 * permanently-labeled hubs). A crowded mainTag filter can otherwise stack a dozen titles on
 * top of each other, which is exactly the "hairball" outcome the spec says must not ship.
 */
function selectNonOverlappingLabels(
  ctx: CanvasRenderingContext2D,
  candidates: LabelCandidate[],
): LabelCandidate[] {
  const placed: LabelCandidate[] = [];
  const drawnRects: { left: number; right: number; top: number; bottom: number }[] = [];

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
function readThemeColors(): { edge: string; label: string } {
  const style = getComputedStyle(document.documentElement);
  return {
    edge: style.getPropertyValue("--ifm-color-emphasis-500").trim() || "#a2917a",
    label: style.getPropertyValue("--ifm-font-color-base").trim() || "#1c1e21",
  };
}

/**
 * The sticker to draw inside a node, or null when it shouldn't wear one: too small for a face
 * to read (see MEERKAT_MIN_DRAWN_RADIUS), or simply not downloaded yet — in both cases the
 * caller falls back to the flat colored dot.
 */
function resolveMeerkatImage(
  node: BlogGraphNode,
  radius: number,
  images: MeerkatImages,
): HTMLImageElement | null {
  if (radius < MEERKAT_MIN_DRAWN_RADIUS) return null;
  const path = meerkatPathFor(node);
  return (path && images[path]) || null;
}

/** Draws `image` centered on (cx, cy), scaled to cover a `size` × `size` box (crop, not stretch). */
function drawImageCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  cx: number,
  cy: number,
  size: number,
) {
  const naturalWidth = image.naturalWidth || image.width;
  const naturalHeight = image.naturalHeight || image.height;
  const scale = Math.max(size / naturalWidth, size / naturalHeight);
  const drawWidth = naturalWidth * scale;
  const drawHeight = naturalHeight * scale;
  ctx.drawImage(image, cx - drawWidth / 2, cy - drawHeight / 2, drawWidth, drawHeight);
}

export default function BlogGraph() {
  const graph = usePluginData("blog-graph-plugin") as BlogGraphData | undefined;
  const history = useHistory();
  const { withBaseUrl } = useBaseUrlUtils();
  const { i18n } = useDocusaurusContext();
  const tagLabel = useTagLabel();

  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mainTag, setMainTag] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  // Bumped on theme toggle so the draw effect re-reads the (now different) CSS variables —
  // canvas has no way to react to a CSS variable change on its own.
  const [themeVersion, setThemeVersion] = useState(0);
  // Starts empty, so the draw effect just falls back to a flat color until (and unless) an
  // image is ready.
  const [meerkatImages, setMeerkatImages] = useState<MeerkatImages>({});
  // Every URL a load has already been started for — including the ones that failed, which are
  // deliberately never retried: a node that can't get its sticker keeps its colored dot, and a
  // broken asset must not turn into one request per redraw.
  const requestedRef = useRef(new Set<string>());

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
    const keys = [
      ...new Set(graph.nodes.map((node) => node.mainTag).filter(Boolean)),
    ] as string[];

    // Sorted on the DISPLAYED label, not on the key: under `fr`, "ai" reads "Intelligence
    // artificielle (IA)" and sorting by key would order the dropdown by invisible values.
    // `currentLocale` is passed explicitly — the runtime default differs between the Node
    // render and the browser, which would reorder the list at hydration.
    return keys.sort((a, b) =>
      tagLabel(a).localeCompare(tagLabel(b), i18n.currentLocale),
    );
  }, [graph, tagLabel, i18n.currentLocale]);

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

  const orphanNodes = useMemo(
    () => pickOrphanNodes(visibleNodes, visibleEdges),
    [visibleNodes, visibleEdges],
  );

  // Only the stickers this view needs, not all 68: the default view uses one per mainTag among
  // its 120 nodes, and a filtered view exactly one. `.sort().join()` keeps the dependency a
  // stable string, so switching filters back and forth doesn't re-run the effect for a set
  // that is already loaded.
  const meerkatPaths = useMemo(() => {
    const paths = new Set<string>();
    for (const node of visibleNodes) {
      const path = meerkatPathFor(node);
      if (path) paths.add(path);
    }
    return [...paths].sort().join(" ");
  }, [visibleNodes]);

  useEffect(() => {
    const missing = meerkatPaths
      .split(" ")
      .filter((path) => path && !requestedRef.current.has(path));
    if (missing.length === 0) return undefined;
    for (const path of missing) requestedRef.current.add(path);

    let cancelled = false;
    const load = (path: string) =>
      new Promise<[string, HTMLImageElement | null]>((resolve) => {
        const image = new Image();
        image.onload = () => resolve([path, image]);
        // A failed load (offline, blocked asset, a sticker renamed since the last build) just
        // means that node keeps its flat color — never a reason to break the graph.
        image.onerror = () => resolve([path, null]);
        // The images live in `static/`, which each locale build copies under its own prefix:
        // without withBaseUrl, /fr/map/ would request /img/... and get the SPA fallback.
        image.src = withBaseUrl(path);
      });

    Promise.all(missing.map(load)).then((entries) => {
      if (cancelled) return;
      const loaded: MeerkatImages = {};
      for (const [path, image] of entries) {
        if (image) loaded[path] = image;
      }
      if (Object.keys(loaded).length > 0) {
        setMeerkatImages((previous) => ({ ...previous, ...loaded }));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [meerkatPaths, withBaseUrl]);

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

  const transform: Transform = useMemo(
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
    if (!ctx) return;
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

    // Pass 1: every visible node's circle — independent of which labels end up drawn. Each
    // wears its mainTag's meerkat sticker, clipped to the circle, with a thin ring in the
    // node's own color so the mainTag/series signal isn't lost; nodes too small for a face to
    // read keep the flat dot.
    for (const node of visibleNodes) {
      const point = toCanvasSpace(node, transform);
      const isHovered = node.permalink === hovered;
      const isNeighbor = neighborSet?.has(node.permalink) ?? false;
      const dimmed = Boolean(hovered) && !isHovered && !isNeighbor;
      const radius = displayRadius(node, transform, orphanNodes.has(node.permalink));
      const image = resolveMeerkatImage(node, radius, meerkatImages);

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

    const candidates: LabelCandidate[] = [];
    const queued = new Set<string>();
    const queueCandidate = (node: BlogGraphNode | undefined | null) => {
      if (!node || queued.has(node.permalink)) return;
      queued.add(node.permalink);
      const point = toCanvasSpace(node, transform);
      const isHovered = node.permalink === hovered;
      const isNeighbor = neighborSet?.has(node.permalink) ?? false;
      const radius = displayRadius(node, transform, orphanNodes.has(node.permalink));
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
    orphanNodes,
    meerkatImages,
    themeVersion,
  ]);

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      let found: string | null = null;
      for (const node of visibleNodes) {
        const point = toCanvasSpace(node, transform);
        const radius = displayRadius(node, transform, orphanNodes.has(node.permalink));
        const hitRadius = radius + HOVER_HIT_PADDING;
        if ((x - point.x) ** 2 + (y - point.y) ** 2 <= hitRadius ** 2) {
          found = node.permalink;
          break;
        }
      }

      setHovered(found);
      canvas.style.cursor = found ? "pointer" : "default";
    },
    [visibleNodes, transform, orphanNodes],
  );

  const handleMouseLeave = useCallback(() => setHovered(null), []);

  // `withBaseUrl` because `history.push` does not add the locale prefix the way `<Link>` does —
  // and the graph's nodes carry bare, locale-agnostic permalinks (`/blog/x`, built by
  // `scripts/lib/blog-corpus.mjs`). Under `fr` a click pushed `/blog/x`, which is not a route in
  // the French build at all, so every bubble landed on the 404 — the `<GroupedList>` fallback
  // below was never affected because `<Link>` prefixes on its own. Idempotent, so an already
  // prefixed path is left alone. See .claude/rules/i18n-locale-safety.md.
  const handleClick = useCallback(() => {
    if (hovered) history.push(withBaseUrl(hovered));
  }, [hovered, history, withBaseUrl]);

  if (!graph) return null;

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <p className={clsx(styles.intro, "text--center")}>
        {showCanvas
          ? translate({
              id: "blog.graph.intro.canvas",
              message:
                "Every published article, plotted by how it links to, shares a series with, or shares tags with the rest of the corpus. Hover a dot to see its neighbors, click to open the article.",
            })
          : translate({
              id: "blog.graph.intro.list",
              message:
                "Every published article, grouped by topic below. Tap a title to open it.",
            })}
      </p>

      <div className={styles.controls}>
        <label className={styles.selectLabel} htmlFor="blog-graph-maintag">
          <Translate id="blog.graph.filterByTopic">Filter by topic</Translate>
          <select
            id="blog-graph-maintag"
            className={styles.select}
            value={mainTag}
            onChange={(event) => setMainTag(event.target.value)}
          >
            <option value="">
              {translate(
                { id: "blog.graph.topN", message: "Top {count} most-linked articles" },
                // The real number of nodes this option draws, not the ceiling. `DEFAULT_TOP_N` is
                // a cap; `meta.articleCount` is the corpus AFTER the plugin's locale filter, so
                // /fr/map/ was advertising "Top 120" over a canvas holding 4.
                { count: Math.min(DEFAULT_TOP_N, graph.meta.articleCount) },
              )}
            </option>
            {mainTags.map((tag) => (
              <option key={tag} value={tag}>
                {tagLabel(tag)}
              </option>
            ))}
          </select>
        </label>
        <p className={styles.counter}>
          <Translate
            id="blog.graph.stats"
            values={{
              articles: graph.meta.articleCount,
              series: graph.meta.seriesCount,
              links: graph.meta.linkCount,
            }}
          >
            {"{articles} articles · {series} series · {links} internal links"}
          </Translate>
        </p>
      </div>

      {showCanvas && (
        <canvas
          ref={canvasRef}
          className={styles.canvas}
          role="img"
          aria-label={translate(
            {
              id: "blog.graph.canvas.ariaLabel",
              message:
                "Force-directed map of {nodes} articles and {edges} connections. Hover a node to see its title and neighbors, click to open the article.",
            },
            { nodes: visibleNodes.length, edges: visibleEdges.length },
          )}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        >
          <Translate id="blog.graph.canvas.fallback">
            Your browser does not support the canvas element — see the list below instead.
          </Translate>
        </canvas>
      )}

      {showCanvas ? (
        <details className={styles.listFallback}>
          <summary>
            <Translate id="blog.graph.viewAsList">View as list instead</Translate>
          </summary>
          <GroupedList nodes={listNodes} />
        </details>
      ) : (
        <GroupedList nodes={listNodes} />
      )}
    </div>
  );
}
