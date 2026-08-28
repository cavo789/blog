import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type JSX,
  type SVGProps,
} from "react";
import { createPortal } from "react-dom";
import { useLocation } from "@docusaurus/router";
import clsx from "clsx";
import {
  getSnapshot,
  getServerSnapshot,
  resetOverrides,
  setOverride,
  subscribe,
} from "./store";
import styles from "./styles.module.css";

// "phpVersion" -> "Php version", "port" -> "Port"
function humanize(name: string): string {
  const spaced = name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const CheckIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
    />
  </svg>
);

// Sliders/tune icon — the pinned trigger's main visual identifier. A plain
// dot (the first version) blended into the page and into the site's other
// bottom-corner widgets (chat bubble, meerkat easter egg); this reads as
// "adjustable settings" at a glance, the same shorthand a control panel uses.
const SlidersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M3,17V19H9V17H3M3,5V7H13V5H3M13,21V19H21V17H13V15H11V21H13M7,9V11H3V13H7V15H9V9H7M21,13V11H11V13H21M15,9H17V7H21V5H17V3H15V9Z"
    />
  </svg>
);

/**
 * One field, rendered twice (inline bar + pinned panel) with the same props
 * so both stay visually and behaviorally identical — see readme.md.
 */
interface VarFieldProps {
  id: string;
  name: string;
  label: string;
  defaultValue: string;
  value: string;
  onChange: (name: string, value: string) => void;
}

function VarField({
  id,
  name,
  label,
  defaultValue,
  value,
  onChange,
}: VarFieldProps): JSX.Element {
  const isNumeric = /^\d+$/.test(defaultValue);
  return (
    <div className={clsx(styles.field, value !== defaultValue && styles.isEdited)}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          className={styles.mono}
          type="text"
          inputMode={isNumeric ? "numeric" : "text"}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
        />
        {value === defaultValue && <span className={styles.badgeDefault}>default</span>}
      </div>
    </div>
  );
}

interface Props {
  /** Human-friendly override for a var's input label, keyed by var name. */
  labels?: Record<string, string>;
  /** Any other prop is a `name="defaultValue"` var declaration. */
  [key: string]: unknown;
}

export default function Vars({ labels, ...rest }: Props): JSX.Element | null {
  const defaults = rest as Record<string, string>;
  const varNames = useMemo(() => Object.keys(defaults), [defaults]);
  const overrides = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const { pathname } = useLocation();
  const inlineRef = useRef<HTMLDivElement | null>(null);
  const [fabOpen, setFabOpen] = useState(false);
  const [fabVisible, setFabVisible] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const hintShown = useRef(false);
  const [mounted, setMounted] = useState(false);
  const uid = useId();

  const storageKey = `docusaurus:vars:${pathname}`;

  // Reset the shared store when this article's <Vars> unmounts (route
  // change) so the next article never inherits a stale override. `mounted`
  // gates the pinned-trigger portal below (document.body doesn't exist
  // during SSR) — same intentional mount-flag pattern as Snippet's
  // Eli5CodeBlock.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount flag, see comment above
    setMounted(true);
    return () => resetOverrides();
  }, []);

  // Apply a reader's saved values *after* mount, never during render — this
  // is what keeps the first paint identical to SSR (see store.ts).
  useEffect(() => {
    let saved: Record<string, string>;
    try {
      saved = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
    } catch {
      saved = {};
    }
    varNames.forEach((name) => {
      if (typeof saved[name] === "string" && saved[name] !== defaults[name]) {
        setOverride(name, saved[name]);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- storageKey changes only on route change, alongside the remount that already resets everything
  }, [storageKey]);

  const handleChange = useCallback(
    (name: string, value: string) => {
      setOverride(name, value);
      try {
        const current = JSON.parse(window.localStorage.getItem(storageKey) || "{}");
        window.localStorage.setItem(
          storageKey,
          JSON.stringify({ ...current, [name]: value }),
        );
      } catch {
        // Reader values just won't survive a reload — the page itself still works.
      }
    },
    [storageKey],
  );

  const handleReset = useCallback(() => {
    varNames.forEach((name) => setOverride(name, defaults[name]));
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Nothing to clean up client-side then.
    }
  }, [varNames, defaults, storageKey]);

  // The pinned trigger only makes sense once the inline bar has scrolled out
  // of view — never show both at once. See TODO 0088 discussion: a full-width
  // sticky bar was rejected because it fights Docusaurus's own sticky navbar
  // and table of contents, and permanently eats reading height.
  useEffect(() => {
    const el = inlineRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const scrolledPast = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        setFabVisible(scrolledPast);
        if (!scrolledPast) {
          setFabOpen(false);
        } else if (!hintShown.current) {
          // First time this page-view the trigger appears: a first-timer has
          // no reason to know what a small port/name pill means, or that
          // it's clickable — a plain dot tested badly (see TODO 0088 review
          // feedback). Teach it once, then get out of the way.
          hintShown.current = true;
          setShowHint(true);
        }
      },
      { threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!showHint) return undefined;
    const timer = setTimeout(() => setShowHint(false), 5000);
    return () => clearTimeout(timer);
  }, [showHint]);

  useEffect(() => {
    if (!fabOpen) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFabOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [fabOpen]);

  const summary = varNames.map((name) => overrides[name] ?? defaults[name]).join(" · ");
  const explainer = "Used in every command on this page — edit to rewrite them all.";

  const fields = (idPrefix: string) =>
    varNames.map((name) => (
      <VarField
        key={name}
        id={`${idPrefix}-${uid}-${name}`}
        name={name}
        label={labels?.[name] || humanize(name)}
        defaultValue={defaults[name]}
        value={overrides[name] ?? defaults[name]}
        onChange={handleChange}
      />
    ));

  if (varNames.length === 0) return null;

  return (
    <>
      <div className={styles.varsbar} ref={inlineRef}>
        <div className={styles.varsbarHead}>
          <span className={styles.varsbarTitle}>
            <span className={styles.dot} />
            Your values for this page
          </span>
          <button className={styles.resetLink} type="button" onClick={handleReset}>
            Reset to defaults
          </button>
        </div>
        <div className={styles.varsbarFields}>{fields("vars")}</div>
        <div className={styles.varsbarFoot}>
          <span>Applies to the commands on this page</span>
          <span>Saved on this device only</span>
        </div>
      </div>

      {mounted &&
        createPortal(
          <div
            className={clsx(
              styles.fab,
              fabVisible && styles.fabVisible,
              fabOpen && styles.fabOpen,
            )}
          >
            {showHint && !fabOpen && (
              <div className={styles.fabHint} role="status">
                <SlidersIcon className={styles.fabHintIcon} />
                <span>{explainer}</span>
                <button
                  className={styles.fabHintClose}
                  type="button"
                  aria-label="Dismiss"
                  onClick={() => setShowHint(false)}
                >
                  ×
                </button>
              </div>
            )}

            <div className={styles.fabPanel}>
              <div className={styles.varsbarHead}>
                <span className={styles.varsbarTitleSmall}>
                  <SlidersIcon className={styles.fabPanelIcon} />
                  Your values
                </span>
                <button className={styles.resetLink} type="button" onClick={handleReset}>
                  Reset
                </button>
              </div>
              <p className={styles.fabExplainer}>{explainer}</p>
              <div className={styles.fabFields}>{fields("fab")}</div>
            </div>
            <button
              className={styles.fabToggle}
              type="button"
              aria-expanded={fabOpen}
              aria-label={`Your values for this page: ${summary}. Click to edit.`}
              onClick={() => {
                setFabOpen((v) => !v);
                setShowHint(false);
              }}
            >
              <SlidersIcon className={styles.fabIcon} />
              <span className={styles.fabLabel}>Values:</span>
              <span className={styles.mono}>{summary}</span>
              {Object.keys(overrides).length > 0 && (
                <CheckIcon className={styles.fabCheck} />
              )}
              <span className={clsx(styles.chevron, fabOpen && styles.chevronOpen)}>
                ▾
              </span>
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
