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

const GITHUB_EDIT_BASE = "https://github.com/cavo789/blog/edit/main/";

type ModeKey = "fuzzy" | "fulltext" | "ask" | "tags" | "headings" | "actions";

interface ModeDef {
  prefix: string;
  key: ModeKey;
  label: string;
}

const MODES: ModeDef[] = [
  { prefix: "", key: "fuzzy", label: "Jump to article, series, tag or page" },
  { prefix: "/", key: "fulltext", label: "Full-text search (Pagefind)" },
  { prefix: "?", key: "ask", label: "Ask my blog a question" },
  { prefix: "#", key: "tags", label: "Jump to a tag" },
  { prefix: ":", key: "headings", label: "Jump to a heading on this page" },
  { prefix: ">", key: "actions", label: "Run an action" },
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

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
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
    const here = normalizePath(location.pathname);
    const match = navIndex.articles.find((a) => normalizePath(a.permalink) === here);
    if (match) recordRecentlyViewed(match.permalink);
  }, [location.pathname, navIndex]);

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
    const here = normalizePath(location.pathname);
    return navIndex.articles.find((a) => normalizePath(a.permalink) === here) ?? null;
  }, [navIndex, location.pathname]);

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
            .then(() => setToast("Copied article as Markdown"))
            .catch(() => setToast("Could not copy — is this a production build?"));
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
          setToast("Select the text you want to report on the article");
          break;
        case "edit-github":
          window.open(
            `${GITHUB_EDIT_BASE}${currentArticle!.file}`,
            "_blank",
            "noopener,noreferrer",
          );
          break;
        case "show-map":
          history.push("/map");
          break;
        case "copy-permalink":
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => setToast("Permalink copied"));
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
    [currentArticle, colorMode, setColorMode, history, close],
  );

  const actions = useMemo<ActionItem[]>(() => {
    const onArticle = Boolean(currentArticle);
    return [
      onArticle && { id: "copy-markdown", label: "Copy this article as Markdown" },
      onArticle && { id: "view-markdown", label: "View raw .md" },
      onArticle && { id: "report-typo", label: "Report a typo" },
      onArticle && currentArticle?.file && { id: "edit-github", label: "Edit on GitHub" },
      { id: "show-map", label: "Show on the map" },
      { id: "copy-permalink", label: "Copy permalink" },
      {
        id: "toggle-theme",
        label: `Switch to ${colorMode === "dark" ? "light" : "dark"} theme`,
      },
      { id: "shortcuts", label: "Keyboard shortcuts" },
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
            label: "Full text",
            items: [],
            hint: "Type your search terms after /",
          },
        ];
      }
      if (pagefind.term !== term || pagefind.loading) {
        return [{ key: "fulltext", label: "Full text", items: [], loading: true }];
      }
      if (!pagefind.results) {
        return [{ key: "fulltext", label: "Full text", items: [], unavailable: true }];
      }
      return [
        {
          key: "fulltext",
          label: "Full text",
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
            label: "Ask my blog",
            items: [],
            hint: 'Type a question after ? — e.g. "how do I reduce my image size?"',
          },
        ];
      }
      if (questions === "unavailable") {
        return [{ key: "ask", label: "Ask my blog", items: [], unavailable: true }];
      }
      const results = searchQuestions(questionIndex, term, 8);
      return [
        {
          key: "ask",
          label: "Ask my blog",
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
      return [{ key: "tags", label: "Tags", items }];
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
      return [{ key: "headings", label: "On this page", items }];
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
      return [{ key: "actions", label: "Actions", items }];
    }

    // Default fuzzy mode, grouped by section.
    const matched = searchEntries(entries, term || query, 40);
    const bySection: Record<EntrySection, Group> = {
      articles: { key: "articles", label: "Articles", items: [] },
      series: { key: "series", label: "Series", items: [] },
      tags: { key: "tags", label: "Tags", items: [] },
      pages: { key: "pages", label: "Pages", items: [] },
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
        history.push(item.permalink!);
      } else if (item.kind === "heading") {
        close();
        window.location.hash = item.id;
      } else if (item.kind === "action") {
        runAction(item.id);
      }
    },
    [close, history, runAction],
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
        aria-label={view === "shortcuts" ? "Keyboard shortcuts" : "Command palette"}
        onMouseDown={(event) => event.stopPropagation()}
      >
        {view === "shortcuts" ? (
          <div className={styles.shortcutsPanel}>
            <h2 className={styles.shortcutsTitle}>Keyboard shortcuts</h2>
            <ShortcutList
              items={[
                { keys: ["Ctrl", "K"], desc: "Open the command palette (⌘K on macOS)" },
                { keys: ["/"], desc: "Full-text search, inside the palette" },
                { keys: ["?"], desc: "Ask my blog a question, inside the palette" },
                { keys: ["#"], desc: "Jump to a tag, inside the palette" },
                {
                  keys: [":"],
                  desc: "Jump to a heading on this page, inside the palette",
                },
                { keys: [">"], desc: "Run an action, inside the palette" },
                { keys: ["Esc"], desc: "Close" },
              ]}
            />
            <button type="button" className={styles.closeShortcuts} onClick={close}>
              Close
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
              placeholder="Search, or try / ? # : >"
              aria-label="Command palette"
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
                aria-label="Results"
                className={styles.results}
              >
                {!query.trim() ? (
                  <EmptyState
                    recentlyViewed={recentlyViewed}
                    continueSeries={continueSeries}
                    hasQuestions={hasQuestions}
                    onSelect={(permalink) => {
                      close();
                      history.push(permalink);
                    }}
                  />
                ) : (
                  <ResultGroups
                    groups={groups}
                    flatItems={flatItems}
                    activeIndex={activeIndex}
                    onHover={setActiveIndex}
                    onSelect={selectItem}
                  />
                )}
              </div>
              {activeItem?.preview ? <PreviewPanel article={activeItem.preview} /> : null}
            </div>
            <div className={styles.statusRow} role="status" aria-live="polite">
              {query.trim()
                ? `${flatItems.length} result${flatItems.length === 1 ? "" : "s"}`
                : null}
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
}

function ResultGroups({
  groups,
  flatItems,
  activeIndex,
  onHover,
  onSelect,
}: ResultGroupsProps) {
  if (groups.every((g) => g.items.length === 0)) {
    return groups[0]?.loading ? (
      <p className={styles.empty}>Searching…</p>
    ) : groups[0]?.unavailable ? (
      // Generic across every mode that can fail to load its backing index (fulltext:
      // Pagefind absent on `yarn start`; ask: the question corpus fetch rejected, e.g. an
      // offline reader — see TODO 0095). Keyed off the group's own label so the wording
      // never claims a mode-specific cause it can't actually distinguish.
      <p className={styles.empty}>{groups[0].label} isn&apos;t available right now.</p>
    ) : groups[0]?.hint ? (
      <p className={styles.empty}>{groups[0].hint}</p>
    ) : (
      <p className={styles.empty}>No results — try different words.</p>
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
  const prefixHints = [
    { prefix: "/", label: "full-text search" },
    hasQuestions && { prefix: "?", label: "ask my blog" },
    { prefix: "#", label: "jump to a tag" },
    { prefix: ":", label: "jump to a heading" },
    { prefix: ">", label: "run an action" },
  ].filter((h): h is { prefix: string; label: string } => Boolean(h));

  return (
    <div className={styles.emptyState}>
      {continueSeries ? (
        <div className={styles.group}>
          <div className={styles.groupLabel}>Continue this series</div>
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
          <div className={styles.groupLabel}>Recently viewed</div>
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
