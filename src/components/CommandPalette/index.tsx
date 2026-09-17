/**
 * CommandPalette — the `Ctrl+K` / `Cmd+K` shell for the whole site (TODO 0084).
 *
 * One input, six modes selected by a typed prefix (see MODES below): no prefix is a fuzzy
 * jump across every article/series/tag/page from the build-time nav index
 * (`plugins/command-palette-plugin`); `/` is Pagefind full text; `?` is the "ask my blog"
 * question index (`src/components/AskMyBlog`, TODO 0083); `#` jumps to a tag; `:` jumps to a
 * heading on the current page; `>` runs a site action (copy as Markdown, edit on GitHub,
 * toggle theme, ...).
 *
 * Mounted once per page from `src/theme/Layout` (not `Root` — see that file's comment for why
 * `useColorMode` below requires it) — it registers itself on `paletteBus` so the navbar
 * SearchBar, the 404 page and the first-visit hint (independent React trees) can all open
 * this one instance, and owns its own `Ctrl+K`/`Cmd+K`/`?` document-level listeners so its
 * mount point only needs to render it.
 *
 * A source that has nothing to show (no Pagefind index on `yarn start`, zero questions
 * generated yet, no article on the current page) degrades to an empty-results message
 * rather than a dead entry — see TODO 0084's "Activation progressive" section.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { useHistory, useLocation } from "@docusaurus/router";
import { usePluginData } from "@docusaurus/useGlobalData";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { useColorMode } from "@docusaurus/theme-common";
import ShortcutList from "@site/src/components/ShortcutList";
import {
  buildSearchIndex as buildQuestionIndex,
  search as searchQuestions,
  type QuestionEntry,
} from "@site/src/components/AskMyBlog/utils";
import { loadQuestionsIndex } from "@site/src/components/AskMyBlog/questionsIndex";
import { registerPalette, setActiveOverlay } from "./paletteBus";
import {
  buildEntries,
  getContinueSeries,
  getPageHeadings,
  getRecentlyViewed,
  recordRecentlyViewed,
  searchEntries,
  searchPagefind,
  type EntrySection,
  type NavArticle,
  type NavIndex,
  type PagefindResult,
} from "./utils";
import styles from "./styles.module.css";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Translate, { translate } from "@docusaurus/Translate";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";

const GITHUB_EDIT_BASE = "https://github.com/cavo789/blog/edit/main/";

type ModeKey = "fuzzy" | "fulltext" | "ask" | "tags" | "headings" | "actions";

interface ModeDef {
  prefix: string;
  key: ModeKey;
  label: string;
}

// Module scope is safe for `translate()`: each locale is its own build, so code.json is already
// resolved by the time this array is evaluated.
const MODES: ModeDef[] = [
  {
    prefix: "",
    key: "fuzzy",
    label: translate({
      id: "palette.mode.fuzzy",
      message: "Jump to article, series, tag or page",
    }),
  },
  {
    prefix: "/",
    key: "fulltext",
    label: translate({
      id: "palette.mode.fulltext",
      message: "Full-text search (Pagefind)",
    }),
  },
  {
    prefix: "?",
    key: "ask",
    label: translate({ id: "palette.mode.ask", message: "Ask my blog a question" }),
  },
  {
    prefix: "#",
    key: "tags",
    label: translate({ id: "palette.mode.tags", message: "Jump to a tag" }),
  },
  {
    prefix: ":",
    key: "headings",
    label: translate({
      id: "palette.mode.headings",
      message: "Jump to a heading on this page",
    }),
  },
  {
    prefix: ">",
    key: "actions",
    label: translate({ id: "palette.mode.actions", message: "Run an action" }),
  },
];

interface QuestionsIndexData {
  meta: { articleCount?: number; questionCount: number };
  themes?: { key: string; label: string; permalink: string; count: number }[];
}

type View = "palette" | "shortcuts" | null;

interface ResultItem {
  id: string;
  kind: "navigate" | "heading" | "action";
  title: string;
  subtitle?: string;
  permalink?: string;
  preview?: NavArticle | null;
}

interface Group {
  key: string;
  label: string;
  items: ResultItem[];
  loading?: boolean;
  unavailable?: boolean;
  hint?: string;
}

interface ActionItem {
  id: string;
  label: string;
}

interface PagefindState {
  term: string | null;
  loading: boolean;
  results: PagefindResult[] | null;
}

/**
 * Strips the trailing slash so two spellings of the same route compare equal.
 *
 * `baseUrl` matters: `location.pathname` carries the locale prefix (`/fr/blog/x/`) while the
 * permalinks in the nav index are bare site paths built from `blog/` (`/blog/x`). Without
 * removing it, the two never matched under `fr` and the "recently viewed" list silently stayed
 * empty on the whole French site. See .claude/rules/i18n-locale-safety.md.
 */
function normalizePath(pathname: string, baseUrl = "/"): string {
  const withoutLocale =
    baseUrl !== "/" && pathname.startsWith(baseUrl)
      ? pathname.slice(baseUrl.length - 1)
      : pathname;

  return withoutLocale.replace(/\/$/, "") || "/";
}

function parseModeAndTerm(raw: string): { mode: ModeKey; term: string } {
  const found = MODES.find((m) => m.prefix && raw.startsWith(m.prefix));
  if (found) return { mode: found.key, term: raw.slice(found.prefix.length).trimStart() };
  return { mode: "fuzzy", term: raw };
}

function isTypingTarget(el: Element | null): boolean {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || (el as HTMLElement).isContentEditable;
}

export default function CommandPalette() {
  const navIndex = usePluginData("command-palette-plugin") as NavIndex | undefined;
  // Small summary only (theme labels/counts) — the full corpus is fetched lazily below, only
  // once the reader actually switches into "?" mode. See
  // src/components/AskMyBlog/questionsIndex.ts for why: this component is mounted on every
  // page (src/theme/Layout), so a `usePluginData` reference to the full ~470 KB corpus here
  // would have shipped it in every page's JS.
  const { meta: questionsMeta } = (usePluginData("questions-index-plugin") as
    QuestionsIndexData | undefined) ?? { meta: { questionCount: 0 } };
  const { withBaseUrl } = useBaseUrlUtils();
  const [questions, setQuestions] = useState<QuestionEntry[] | "unavailable" | null>(
    null,
  );
  const { colorMode, setColorMode } = useColorMode();
  const history = useHistory();
  const location = useLocation();
  const { siteConfig } = useDocusaurusContext();

  const [view, setView] = useState<View>(null);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  // `term` tags which query the results/loading flag belong to, so a stale in-flight search
  // for a previous term is simply ignored instead of needing to be reset out-of-band.
  const [pagefind, setPagefind] = useState<PagefindState>({
    term: null,
    loading: false,
    results: null,
  });
  const [toast, setToast] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const clearOverlayRef = useRef<(() => void) | null>(null);

  const entries = useMemo(() => buildEntries(navIndex), [navIndex]);
  // `questions` is null (not loaded yet), "unavailable" (fetch failed — e.g. offline, see
  // TODO 0095), or the loaded array.
  const questionIndex = useMemo(
    () => buildQuestionIndex(Array.isArray(questions) ? questions : []),
    [questions],
  );
  const { mode, term } = useMemo(() => parseModeAndTerm(query), [query]);

  // Cross-locale escape hatch. Under `fr` the Pagefind index holds only the translated
  // articles (i18n-seo-guard marks the rest `data-pagefind-ignore`), so a reader searching
  // "docker" gets nothing while the blog carries dozens. The dead end is the empty result
  // list, not the search box — that is where the way out belongs.
  const { isDefaultLocale } = useTranslationState();
  // `term` is what the reader typed AFTER a mode prefix; in fuzzy mode there is no prefix, so the
  // whole query is the term. `term || query` looked equivalent but is not: typing just "/" leaves
  // term empty and falls back to the query, so the bare prefix counted as a search and the exit
  // below offered to look up "/" in the English blog before a single word had been typed.
  const searchTerm = (mode === "fuzzy" ? query : term).trim();
  const crossLocale =
    isDefaultLocale || !searchTerm
      ? null
      : // A plain string href, not <Link>: this crosses locales on purpose, and <Link> under
        // `fr` would resolve /blog/ back to /fr/blog/ — the very corpus that just came up empty.
        {
          href: `/blog/?q=${encodeURIComponent(searchTerm)}`,
          total: getBlogMetadata().length,
        };

  // Fetch the full question corpus the first time the reader opens "?" mode — not on mount,
  // so browsing the site normally never pays for it.
  useEffect(() => {
    if (mode !== "ask" || questions !== null) return;
    let cancelled = false;
    loadQuestionsIndex(withBaseUrl("/questions-index.json"))
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch(() => {
        // Without this, a network failure (e.g. offline reader, no service-worker cache for
        // this corpus — see TODO 0095) left `questions` stuck at `null` forever, and "?" mode
        // rendered the generic "No results" copy as if the reader's query just didn't match
        // anything, instead of saying the index itself never loaded.
        if (!cancelled) setQuestions("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, [mode, questions, withBaseUrl]);

  // ── Open / close, from either the document shortcut or the shared bus ──────────────────

  const close = useCallback(() => {
    setView(null);
    setQuery("");
    setActiveIndex(0);
    setPagefind({ term: null, loading: false, results: null });
    clearOverlayRef.current?.();
    if (previouslyFocused.current) previouslyFocused.current.focus?.();
  }, []);

  const open = useCallback(
    (initialQuery = "") => {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      setView("palette");
      setQuery(initialQuery);
      setActiveIndex(0);
      clearOverlayRef.current = setActiveOverlay(close);
    },
    [close],
  );

  useEffect(() => registerPalette(open), [open]);

  // Deep link: `/blog/?q=docker` opens the palette already filled in. This exists for the
  // cross-locale escape hatch below — a French reader whose search found nothing is handed to
  // the English site carrying their own words, instead of being dropped on a listing and asked
  // to type them again. The parameter is consumed once and stripped from the URL, so a reload
  // or a shared link does not keep reopening the palette.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (!initial) return;

    // Deferred by a microtask rather than called straight from the effect body: `open()` sets
    // four pieces of state at once, and doing that synchronously inside an effect is the
    // cascading-render pattern react-hooks flags. The URL is cleaned up immediately either way,
    // so a reader who hits Escape before the microtask runs still leaves a clean address bar.
    queueMicrotask(() => open(initial));

    params.delete("q");
    const rest = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (rest ? `?${rest}` : "") + window.location.hash,
    );
  }, [open]);

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const isMod = event.metaKey || event.ctrlKey;
      const typingElsewhere =
        isTypingTarget(document.activeElement) &&
        document.activeElement !== inputRef.current;

      if (isMod && event.key.toLowerCase() === "k") {
        // Don't hijack Ctrl/Cmd+K while the reader is typing in some other field on the page
        // (a comment box, the typo-report form, ...) — only while the palette's own input (or
        // nothing) has focus.
        if (typingElsewhere) return;
        event.preventDefault();
        if (view) {
          close();
        } else {
          open();
        }
        return;
      }

      if (view) {
        if (event.key === "Escape") {
          event.preventDefault();
          close();
        }
        return;
      }

      if (event.key === "?" && !isTypingTarget(document.activeElement)) {
        event.preventDefault();
        previouslyFocused.current = document.activeElement as HTMLElement | null;
        setView("shortcuts");
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [view, open, close]);

  // Focus the input as soon as the palette opens.
  useEffect(() => {
    if (view === "palette") inputRef.current?.focus();
  }, [view]);

  // Basic focus trap while any overlay is open.
  useEffect(() => {
    if (!view) return undefined;

    function onTab(event: globalThis.KeyboardEvent) {
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onTab);
    return () => document.removeEventListener("keydown", onTab);
  }, [view]);

  // Record the current article as "recently viewed" on every navigation, whether or not the
  // palette is open — it's what feeds the empty state next time it opens.
  useEffect(() => {
    if (!navIndex) return;
    const here = normalizePath(location.pathname, siteConfig.baseUrl);
    const match = navIndex.articles.find((a) => normalizePath(a.permalink) === here);
    if (match) recordRecentlyViewed(match.permalink);
  }, [location.pathname, navIndex, siteConfig.baseUrl]);

  // ── Pagefind (async, debounced) ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (mode !== "fulltext" || !term.trim()) return undefined;

    let cancelled = false;
    const timer = setTimeout(() => {
      setPagefind((s) => ({ ...s, loading: true }));
      searchPagefind(term).then((results) => {
        if (!cancelled) setPagefind({ term, loading: false, results });
      });
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mode, term]);

  // ── Current article (drives the ">" mode's article-only actions) ───────────────────────

  const currentArticle = useMemo(() => {
    if (!navIndex) return null;
    const here = normalizePath(location.pathname, siteConfig.baseUrl);
    return navIndex.articles.find((a) => normalizePath(a.permalink) === here) ?? null;
  }, [navIndex, location.pathname, siteConfig.baseUrl]);

  const runAction = useCallback(
    (id: string) => {
      switch (id) {
        case "copy-markdown": {
          const mdUrl = `${currentArticle!.permalink.replace(/\/$/, "")}.md`;
          fetch(mdUrl)
            .then((res) =>
              res.ok ? res.text() : Promise.reject(new Error(String(res.status))),
            )
            .then((text) => navigator.clipboard.writeText(text))
            .then(() =>
              setToast(
                translate({
                  id: "palette.toast.copiedMarkdown",
                  message: "Copied article as Markdown",
                }),
              ),
            )
            .catch(() =>
              setToast(
                translate({
                  id: "palette.toast.copyFailed",
                  message: "Could not copy — is this a production build?",
                }),
              ),
            );
          break;
        }
        case "view-markdown":
          window.open(
            `${currentArticle!.permalink.replace(/\/$/, "")}.md`,
            "_blank",
            "noopener,noreferrer",
          );
          break;
        case "report-typo":
          document.querySelector("article")?.scrollIntoView({ behavior: "smooth" });
          setToast(
            translate({
              id: "palette.toast.selectText",
              message: "Select the text you want to report on the article",
            }),
          );
          break;
        case "edit-github":
          window.open(
            `${GITHUB_EDIT_BASE}${currentArticle!.file}`,
            "_blank",
            "noopener,noreferrer",
          );
          break;
        case "show-map":
          history.push(withBaseUrl("/map"));
          break;
        case "copy-permalink":
          navigator.clipboard
            .writeText(window.location.href)
            .then(() =>
              setToast(
                translate({ id: "palette.toast.permalink", message: "Permalink copied" }),
              ),
            );
          break;
        case "toggle-theme":
          setColorMode(colorMode === "dark" ? "light" : "dark");
          break;
        case "shortcuts":
          setView("shortcuts");
          return; // keep the trap active, don't close below
        default:
          break;
      }
      close();
    },
    [currentArticle, colorMode, setColorMode, history, close, withBaseUrl],
  );

  const actions = useMemo<ActionItem[]>(() => {
    const onArticle = Boolean(currentArticle);
    return [
      onArticle && {
        id: "copy-markdown",
        label: translate({
          id: "palette.action.copyMarkdown",
          message: "Copy this article as Markdown",
        }),
      },
      onArticle && {
        id: "view-markdown",
        label: translate({ id: "palette.action.viewRaw", message: "View raw .md" }),
      },
      onArticle && {
        id: "report-typo",
        label: translate({ id: "palette.action.reportTypo", message: "Report a typo" }),
      },
      onArticle &&
        currentArticle?.file && {
          id: "edit-github",
          label: translate({
            id: "palette.action.editGithub",
            message: "Edit on GitHub",
          }),
        },
      {
        id: "show-map",
        label: translate({ id: "palette.action.showMap", message: "Show on the map" }),
      },
      {
        id: "copy-permalink",
        label: translate({
          id: "palette.action.copyPermalink",
          message: "Copy permalink",
        }),
      },
      {
        id: "toggle-theme",
        label:
          colorMode === "dark"
            ? translate({
                id: "palette.action.themeLight",
                message: "Switch to light theme",
              })
            : translate({
                id: "palette.action.themeDark",
                message: "Switch to dark theme",
              }),
      },
      {
        id: "shortcuts",
        label: translate({
          id: "palette.shortcuts.title",
          message: "Keyboard shortcuts",
        }),
      },
    ].filter((a): a is ActionItem => Boolean(a));
  }, [currentArticle, colorMode]);

  // ── Results per mode ─────────────────────────────────────────────────────────────────

  const groups = useMemo<Group[]>(() => {
    if (!navIndex) return [];

    if (!query.trim()) return []; // empty state handled separately

    if (mode === "fulltext") {
      if (!term.trim()) {
        return [
          {
            key: "fulltext",
            label: translate({ id: "palette.group.fulltext", message: "Full text" }),
            items: [],
            hint: translate({
              id: "palette.hint.fulltext",
              message: "Type your search terms after /",
            }),
          },
        ];
      }
      if (pagefind.term !== term || pagefind.loading) {
        return [
          {
            key: "fulltext",
            label: translate({ id: "palette.group.fulltext", message: "Full text" }),
            items: [],
            loading: true,
          },
        ];
      }
      if (!pagefind.results) {
        return [
          {
            key: "fulltext",
            label: translate({ id: "palette.group.fulltext", message: "Full text" }),
            items: [],
            unavailable: true,
          },
        ];
      }
      return [
        {
          key: "fulltext",
          label: translate({ id: "palette.group.fulltext", message: "Full text" }),
          items: pagefind.results.map((r) => ({
            id: r.permalink,
            kind: "navigate" as const,
            title: r.title,
            subtitle: r.excerpt,
            permalink: r.permalink,
          })),
        },
      ];
    }

    if (mode === "ask") {
      if (!term.trim()) {
        return [
          {
            key: "ask",
            label: translate({ id: "palette.group.ask", message: "Ask my blog" }),
            items: [],
            hint: translate({
              id: "palette.hint.ask",
              message: 'Type a question after ? — e.g. "how do I reduce my image size?"',
            }),
          },
        ];
      }
      if (questions === "unavailable") {
        return [
          {
            key: "ask",
            label: translate({ id: "palette.group.ask", message: "Ask my blog" }),
            items: [],
            unavailable: true,
          },
        ];
      }
      const results = searchQuestions(questionIndex, term, 8);
      return [
        {
          key: "ask",
          label: translate({ id: "palette.group.ask", message: "Ask my blog" }),
          items: results.map((r) => ({
            id: `${r.permalink}#${r.anchor}`,
            kind: "navigate" as const,
            title: r.question,
            subtitle: r.title,
            permalink: r.anchor ? `${r.permalink}#${r.anchor}` : r.permalink,
          })),
        },
      ];
    }

    if (mode === "tags") {
      const pool = navIndex.tags.map((t) => ({
        id: t.permalink,
        kind: "navigate" as const,
        title: t.label,
        subtitle: `${t.count} article${t.count === 1 ? "" : "s"}`,
        permalink: t.permalink,
        searchText: `${t.label} ${t.key}`,
      }));
      const items = term.trim()
        ? pool.filter((item) =>
            item.searchText.toLowerCase().includes(term.toLowerCase()),
          )
        : pool;
      return [
        {
          key: "tags",
          label: translate({ id: "palette.group.tags", message: "Tags" }),
          items,
        },
      ];
    }

    if (mode === "headings") {
      const pool = getPageHeadings().map((h) => ({
        id: h.id,
        kind: "heading" as const,
        title: h.text,
        subtitle: `h${h.level}`,
      }));
      const items = term.trim()
        ? pool.filter((item) => item.title.toLowerCase().includes(term.toLowerCase()))
        : pool;
      return [
        {
          key: "headings",
          label: translate({ id: "palette.group.headings", message: "On this page" }),
          items,
        },
      ];
    }

    if (mode === "actions") {
      const pool = actions.map((a) => ({
        id: a.id,
        kind: "action" as const,
        title: a.label,
      }));
      const items = term.trim()
        ? pool.filter((item) => item.title.toLowerCase().includes(term.toLowerCase()))
        : pool;
      return [
        {
          key: "actions",
          label: translate({ id: "palette.group.actions", message: "Actions" }),
          items,
        },
      ];
    }

    // Default fuzzy mode, grouped by section.
    const matched = searchEntries(entries, term || query, 40);
    const bySection: Record<EntrySection, Group> = {
      articles: {
        key: "articles",
        label: translate({ id: "palette.group.articles", message: "Articles" }),
        items: [],
      },
      series: {
        key: "series",
        label: translate({ id: "palette.group.series", message: "Series" }),
        items: [],
      },
      tags: {
        key: "tags",
        label: translate({ id: "palette.group.tags", message: "Tags" }),
        items: [],
      },
      pages: {
        key: "pages",
        label: translate({ id: "palette.group.pages", message: "Pages" }),
        items: [],
      },
    };
    for (const entry of matched) {
      if (bySection[entry.section].items.length >= 6) continue;
      bySection[entry.section].items.push({
        id: entry.id,
        kind: "navigate",
        title: entry.title,
        subtitle: entry.subtitle,
        permalink: entry.permalink,
        preview: entry.section === "articles" ? (entry.data as NavArticle) : null,
      });
    }
    return Object.values(bySection).filter((g) => g.items.length > 0);
  }, [navIndex, query, mode, term, pagefind, questions, questionIndex, actions, entries]);

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);

  // Reset the highlighted result whenever the query changes — done during render (React's
  // documented pattern for "adjusting state when a prop changes") rather than in an effect,
  // so it takes effect the same render instead of one tick later.
  const [lastQuery, setLastQuery] = useState(query);
  if (lastQuery !== query) {
    setLastQuery(query);
    if (activeIndex !== 0) setActiveIndex(0);
  }

  const activeItem = flatItems[activeIndex] ?? null;

  const selectItem = useCallback(
    (item: ResultItem | null) => {
      if (!item) return;
      if (item.kind === "navigate") {
        close();
        // `withBaseUrl` because `history.push` does not add the locale prefix the way `<Link>`
        // does: the palette's static pages and the question index carry bare paths (`/faq`,
        // `/blog/x`), so under `fr` they opened the English page. Idempotent, so a permalink
        // Docusaurus already prefixed is left alone. See .claude/rules/i18n-locale-safety.md.
        history.push(withBaseUrl(item.permalink!));
      } else if (item.kind === "heading") {
        close();
        window.location.hash = item.id;
      } else if (item.kind === "action") {
        runAction(item.id);
      }
    },
    [close, history, runAction, withBaseUrl],
  );

  const onInputKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, Math.max(flatItems.length - 1, 0)));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        selectItem(activeItem);
      }
    },
    [flatItems.length, activeItem, selectItem],
  );

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (typeof document === "undefined" || !view) return null;

  const recentlyViewed = navIndex && !query.trim() ? getRecentlyViewed(navIndex, 5) : [];
  const continueSeries = navIndex && !query.trim() ? getContinueSeries(navIndex) : null;
  const hasQuestions = (questionsMeta?.questionCount ?? 0) > 0;

  return createPortal(
    <div className={styles.backdrop} onMouseDown={close}>
      <div
        ref={dialogRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-label={
          view === "shortcuts"
            ? translate({ id: "palette.shortcuts.title", message: "Keyboard shortcuts" })
            : translate({ id: "palette.ariaLabel", message: "Command palette" })
        }
        onMouseDown={(event) => event.stopPropagation()}
      >
        {view === "shortcuts" ? (
          <div className={styles.shortcutsPanel}>
            <h2 className={styles.shortcutsTitle}>
              <Translate id="palette.shortcuts.title">Keyboard shortcuts</Translate>
            </h2>
            <ShortcutList
              items={[
                {
                  keys: ["Ctrl", "K"],
                  desc: translate({
                    id: "palette.shortcuts.open",
                    message: "Open the command palette (⌘K on macOS)",
                  }),
                },
                {
                  keys: ["/"],
                  desc: translate({
                    id: "palette.shortcuts.fulltext",
                    message: "Full-text search, inside the palette",
                  }),
                },
                {
                  keys: ["?"],
                  desc: translate({
                    id: "palette.shortcuts.ask",
                    message: "Ask my blog a question, inside the palette",
                  }),
                },
                {
                  keys: ["#"],
                  desc: translate({
                    id: "palette.shortcuts.tags",
                    message: "Jump to a tag, inside the palette",
                  }),
                },
                {
                  keys: [":"],
                  desc: translate({
                    id: "palette.shortcuts.headings",
                    message: "Jump to a heading on this page, inside the palette",
                  }),
                },
                {
                  keys: [">"],
                  desc: translate({
                    id: "palette.shortcuts.actions",
                    message: "Run an action, inside the palette",
                  }),
                },
                {
                  keys: ["Esc"],
                  desc: translate({ id: "palette.shortcuts.close", message: "Close" }),
                },
              ]}
            />
            <button type="button" className={styles.closeShortcuts} onClick={close}>
              <Translate id="palette.close">Close</Translate>
            </button>
          </div>
        ) : (
          <>
            <input
              ref={inputRef}
              type="text"
              className={styles.input}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={translate({
                id: "palette.placeholder",
                message: "Search, or try / ? # : >",
              })}
              aria-label={translate({
                id: "palette.ariaLabel",
                message: "Command palette",
              })}
              aria-activedescendant={activeItem ? `cmdk-${activeItem.id}` : undefined}
              aria-controls="cmdk-listbox"
              aria-expanded="true"
              role="combobox"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            <div className={styles.body}>
              <div
                id="cmdk-listbox"
                role="listbox"
                aria-label={translate({ id: "palette.resultsLabel", message: "Results" })}
                className={styles.results}
              >
                {!query.trim() ? (
                  <EmptyState
                    recentlyViewed={recentlyViewed}
                    continueSeries={continueSeries}
                    hasQuestions={hasQuestions}
                    onSelect={(permalink) => {
                      close();
                      history.push(withBaseUrl(permalink));
                    }}
                  />
                ) : (
                  <ResultGroups
                    groups={groups}
                    flatItems={flatItems}
                    activeIndex={activeIndex}
                    onHover={setActiveIndex}
                    onSelect={selectItem}
                    crossLocale={crossLocale}
                  />
                )}
              </div>
              {activeItem?.preview ? <PreviewPanel article={activeItem.preview} /> : null}
            </div>
            <div className={styles.statusRow} role="status" aria-live="polite">
              {query.trim() ? (
                <span>
                  {flatItems.length === 1 ? (
                    <Translate id="palette.resultCount.one">1 result</Translate>
                  ) : (
                    <Translate
                      id="palette.resultCount.other"
                      values={{ count: flatItems.length }}
                    >
                      {"{count} results"}
                    </Translate>
                  )}

                  {/*
                    The discreet, always-available half of the cross-locale exit. The prominent
                    one lives in the empty state, but zero results is not the only way this
                    locale comes up short: a French reader searching "docker" gets two hits from
                    a blog that has dozens, and two hits look like a complete answer. Shown only
                    when there ARE results, so the two never appear at once.
                  */}
                  {crossLocale && flatItems.length > 0 ? (
                    <>
                      {" · "}
                      <a
                        className={styles.crossLocale}
                        href={crossLocale.href}
                        hrefLang="en"
                      >
                        <Translate
                          id="palette.crossLocaleStatus"
                          values={{ total: crossLocale.total }}
                        >
                          {"search the {total} English articles →"}
                        </Translate>
                      </a>
                    </>
                  ) : null}
                </span>
              ) : null}
              {toast ? <span className={styles.toast}>{toast}</span> : null}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

interface ResultGroupsProps {
  groups: Group[];
  flatItems: ResultItem[];
  activeIndex: number;
  onHover: (index: number) => void;
  onSelect: (item: ResultItem) => void;
  /** Where to retry this same search in the default locale, or `null` when already there. */
  crossLocale: { href: string; total: number } | null;
}

function ResultGroups({
  groups,
  flatItems,
  activeIndex,
  onHover,
  onSelect,
  crossLocale,
}: ResultGroupsProps) {
  if (groups.every((g) => g.items.length === 0)) {
    if (groups[0]?.loading) {
      return (
        <p className={styles.empty}>
          <Translate id="palette.searching">Searching…</Translate>
        </p>
      );
    }

    if (groups[0]?.unavailable) {
      // Generic across every mode that can fail to load its backing index (fulltext:
      // Pagefind absent on `yarn start`; ask: the question corpus fetch rejected, e.g. an
      // offline reader — see TODO 0095). Keyed off the group's own label so the wording
      // never claims a mode-specific cause it can't actually distinguish.
      //
      // No cross-locale offer here on purpose: the corpus is not what came up short, the index
      // never loaded. Pointing at the English blog would blame the wrong thing.
      return (
        <p className={styles.empty}>
          <Translate id="palette.unavailable" values={{ label: groups[0].label }}>
            {"{label} isn't available right now."}
          </Translate>
        </p>
      );
    }

    return (
      <>
        {groups[0]?.hint ? (
          <p className={styles.empty}>{groups[0].hint}</p>
        ) : (
          <p className={styles.empty}>
            <Translate id="palette.noResults">
              No results — try different words.
            </Translate>
          </p>
        )}
        {crossLocale ? (
          <p className={styles.crossLocaleRow}>
            <a className={styles.crossLocale} href={crossLocale.href} hrefLang="en">
              <Translate
                id="palette.crossLocaleFallback"
                values={{ total: crossLocale.total }}
              >
                {"Search the {total} English articles instead →"}
              </Translate>
            </a>
          </p>
        ) : null}
      </>
    );
  }

  const indexByItem = new Map(flatItems.map((item, index) => [item, index]));

  return groups.map((group) => (
    <div key={group.key} className={styles.group}>
      {group.items.length > 0 && <div className={styles.groupLabel}>{group.label}</div>}
      <ul className={styles.groupList}>
        {group.items.map((item) => {
          const index = indexByItem.get(item) ?? -1;
          const isActive = index === activeIndex;
          return (
            <li
              key={`${group.key}-${item.id}`}
              id={`cmdk-${item.id}`}
              role="option"
              aria-selected={isActive}
              className={isActive ? `${styles.item} ${styles.itemActive}` : styles.item}
              onMouseEnter={() => onHover(index)}
              onClick={() => onSelect(flatItems[index])}
            >
              <span className={styles.itemTitle}>{item.title}</span>
              {item.subtitle ? (
                <span className={styles.itemSubtitle}>{item.subtitle}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  ));
}

interface EmptyStateProps {
  recentlyViewed: NavArticle[];
  continueSeries: NavArticle | null;
  hasQuestions: boolean;
  onSelect: (permalink: string) => void;
}

function EmptyState({
  recentlyViewed,
  continueSeries,
  hasQuestions,
  onSelect,
}: EmptyStateProps) {
  // Deliberately shorter and lower-case than the MODES labels above: this row is a reminder
  // strip under an empty palette, not a menu.
  const prefixHints = [
    {
      prefix: "/",
      label: translate({
        id: "palette.prefixHint.fulltext",
        message: "full-text search",
      }),
    },
    hasQuestions && {
      prefix: "?",
      label: translate({ id: "palette.prefixHint.ask", message: "ask my blog" }),
    },
    {
      prefix: "#",
      label: translate({ id: "palette.prefixHint.tags", message: "jump to a tag" }),
    },
    {
      prefix: ":",
      label: translate({
        id: "palette.prefixHint.headings",
        message: "jump to a heading",
      }),
    },
    {
      prefix: ">",
      label: translate({ id: "palette.prefixHint.actions", message: "run an action" }),
    },
  ].filter((h): h is { prefix: string; label: string } => Boolean(h));

  return (
    <div className={styles.emptyState}>
      {continueSeries ? (
        <div className={styles.group}>
          <div className={styles.groupLabel}>
            <Translate id="palette.continueSeries">Continue this series</Translate>
          </div>
          <ul className={styles.groupList}>
            <li
              className={styles.item}
              onClick={() => onSelect(continueSeries.permalink)}
            >
              <span className={styles.itemTitle}>{continueSeries.title}</span>
            </li>
          </ul>
        </div>
      ) : null}
      {recentlyViewed.length > 0 ? (
        <div className={styles.group}>
          <div className={styles.groupLabel}>
            <Translate id="palette.recentlyViewed">Recently viewed</Translate>
          </div>
          <ul className={styles.groupList}>
            {recentlyViewed.map((article) => (
              <li
                key={article.permalink}
                className={styles.item}
                onClick={() => onSelect(article.permalink)}
              >
                <span className={styles.itemTitle}>{article.title}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className={styles.hints}>
        {prefixHints.map(({ prefix, label }) => (
          <span key={prefix} className={styles.hint}>
            <kbd>{prefix}</kbd> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function PreviewPanel({ article }: { article: NavArticle }) {
  return (
    <div className={styles.preview}>
      <h3 className={styles.previewTitle}>{article.title}</h3>
      {article.description ? (
        <p className={styles.previewDescription}>{article.description}</p>
      ) : null}
      <div className={styles.previewMeta}>
        {article.date ? <span>{article.date}</span> : null}
        {article.series ? <span>{article.series}</span> : null}
      </div>
      {article.tags.length > 0 ? (
        <div className={styles.previewTags}>
          {article.tags.map((tag) => (
            <span key={tag} className={styles.previewTag}>
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
