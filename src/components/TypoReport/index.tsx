import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
  type JSX,
} from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";
import {
  slugFromPermalink,
  useTranslationState,
} from "@site/src/components/Blog/utils/translations";

// ── LocalStorage helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = "typo_reports"; // [{ts, hash}]
const MAX_PER_HOUR = 5;

const FEEDBACK_TYPES = [
  { id: "typo", icon: "🔤", label: "Typo" },
  { id: "incorrect", icon: "❌", label: "Incorrect" },
  { id: "outdated", icon: "⏰", label: "Outdated" },
  { id: "suggestion", icon: "💡", label: "Suggestion" },
  // Only offered on a real translation — see `canFlagTranslation` below.
  { id: "translation", icon: "🌐", label: "Doubtful translation" },
];

interface StoredReport {
  ts: number;
  hash: string;
}

// FNV-1a 32-bit hash (no crypto needed for client-side dedup)
function fnv1a(str: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function getStored(): StoredReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function isLocalRateLimited() {
  const now = Date.now();
  return getStored().filter((r) => r.ts > now - 3_600_000).length >= MAX_PER_HOUR;
}

function isLocalDuplicate(slug: string, text: string) {
  const hash = fnv1a(slug + "|" + text.toLowerCase());
  return getStored().some((r) => r.hash === hash);
}

function recordLocalSubmission(slug: string, text: string) {
  const now = Date.now();
  const hash = fnv1a(slug + "|" + text.toLowerCase());
  const pruned = getStored().filter((r) => r.ts > now - 86_400_000);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...pruned, { ts: now, hash }]));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  metadata?: {
    permalink?: string;
  };
}

type Phase = "idle" | "selecting" | "confirming" | "submitting" | "done" | "error";

/**
 * Localized label for a feedback type.
 *
 * FEEDBACK_TYPES lives at module scope, where `translate()` would run once at import time and
 * freeze the default locale for the whole bundle. Resolving here — inside the render tree —
 * is what makes the four buttons follow the page's locale.
 */
function labelFor(id: string, fallback: string): string {
  switch (id) {
    case "typo":
      return translate({ id: "blog.typoReport.type.typo", message: "Typo" });
    case "incorrect":
      return translate({ id: "blog.typoReport.type.incorrect", message: "Incorrect" });
    case "outdated":
      return translate({ id: "blog.typoReport.type.outdated", message: "Outdated" });
    case "suggestion":
      return translate({ id: "blog.typoReport.type.suggestion", message: "Suggestion" });
    case "translation":
      return translate({
        id: "blog.typoReport.type.translation",
        message: "Doubtful translation",
      });
    default:
      return fallback;
  }
}

export default function TypoReport({ metadata }: Props): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/typo.php`;

  // A French URL existing proves nothing: Docusaurus falls back to the English source when no
  // translation exists. `isTranslated` alone is not enough either — it is always true on the
  // default locale, where the article is the original.
  const { isDefaultLocale, isTranslated } = useTranslationState();
  const canFlagTranslation =
    !isDefaultLocale && isTranslated(slugFromPermalink(metadata?.permalink ?? ""));
  const feedbackTypes = FEEDBACK_TYPES.filter(
    (t) => t.id !== "translation" || canFlagTranslation,
  );

  // State machine: idle → selecting → confirming → submitting → done | error
  const [phase, setPhase] = useState<Phase>("idle");
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [feedbackType, setFeedbackType] = useState("");
  const [comment, setComment] = useState("");

  const nonceRef = useRef<string | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef(""); // ±100 chars around selection

  // Fetch nonce + wire up DOM listeners on mount.
  useEffect(() => {
    if (!slug) return;

    fetch(`${apiUrl}?nonce`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.nonce) nonceRef.current = data.nonce;
      })
      .catch(() => {});

    const article =
      document.querySelector<HTMLElement>("article") ||
      document.querySelector<HTMLElement>(".theme-doc-markdown");
    if (!article) return;
    articleRef.current = article;

    // Arrow-assigned, not a `function` declaration: that lets TS carry the
    // `if (!article) return` narrowing above into this closure, so `article` is
    // non-null on lines 120/122 without a `!` assertion.
    const handleSelection = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString().trim();
      if (text.length < 3) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      if (!article.contains(range.commonAncestorContainer)) return;

      const fullText = article.innerText || "";
      const idx = fullText.indexOf(text);
      contextRef.current =
        idx !== -1 ? fullText.slice(Math.max(0, idx - 100), idx + text.length + 100) : "";

      const top = window.scrollY + rect.bottom + 8;
      const left = Math.min(window.scrollX + rect.left, window.innerWidth - 296);

      setSelectedText(text);
      setTooltipPos({ top, left });
      setPhase("selecting");
    };

    function handleMouseDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setPhase("idle");
      }
    }

    article.addEventListener("mouseup", handleSelection);
    article.addEventListener("touchend", handleSelection);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      article.removeEventListener("mouseup", handleSelection);
      article.removeEventListener("touchend", handleSelection);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [slug, apiUrl]);

  const handleTypeSelect = useCallback(
    (type: string) => {
      if (isLocalRateLimited()) {
        setPhase("error");
        return;
      }
      if (isLocalDuplicate(slug, selectedText)) {
        setPhase("done");
        return;
      }
      setFeedbackType(type);
      setComment("");
      setPhase("confirming");
    },
    [slug, selectedText],
  );

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setPhase("submitting");

      let nonce = nonceRef.current;
      if (!nonce) {
        try {
          const r = await fetch(`${apiUrl}?nonce`);
          const d = r.ok ? await r.json() : null;
          nonce = d?.nonce ?? null;
          nonceRef.current = nonce;
        } catch {}
      }

      const honeypot =
        (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)
          ?.value ?? "";

      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            text: selectedText,
            type: feedbackType,
            comment,
            context: contextRef.current,
            website: honeypot,
            nonce: nonce ?? "",
          }),
        });
        if (!res.ok) {
          setPhase("error");
          return;
        }
        recordLocalSubmission(slug, selectedText);
        setPhase("done");
      } catch {
        setPhase("error");
      }
    },
    [slug, selectedText, feedbackType, comment, apiUrl],
  );

  const handleBack = useCallback(() => setPhase("selecting"), []);
  const handleCancel = useCallback(() => setPhase("idle"), []);
  const handleDismiss = useCallback(() => setPhase("idle"), []);

  // SSR-safe: render nothing when idle.
  if (phase === "idle") return null;

  const typeInfo = FEEDBACK_TYPES.find((t) => t.id === feedbackType);

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ top: tooltipPos.top, left: tooltipPos.left }}
    >
      {phase === "selecting" && (
        <div className={styles.typeCard}>
          <p className={styles.typePrompt}>
            <Translate id="blog.typoReport.prompt">What kind of issue?</Translate>
          </p>
          <div className={styles.typeGrid}>
            {feedbackTypes.map(({ id, icon, label }) => (
              <button
                key={id}
                className={
                  // Fifth button: spans the two-column grid instead of sitting alone.
                  id === "translation"
                    ? `${styles.typeBtn} ${styles.typeBtnWide}`
                    : styles.typeBtn
                }
                onClick={() => handleTypeSelect(id)}
              >
                <span className={styles.typeIcon}>{icon}</span>
                <span>{labelFor(id, label)}</span>
              </button>
            ))}
          </div>
          <button className={styles.cancelSmall} onClick={handleCancel}>
            <Translate id="blog.typoReport.cancel">Cancel</Translate>
          </button>
        </div>
      )}

      {phase === "confirming" && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.selectedPreview}>
            &quot;
            {selectedText.length > 80 ? selectedText.slice(0, 80) + "…" : selectedText}
            &quot;
          </div>
          {typeInfo && (
            <div className={styles.typeBadge}>
              {typeInfo.icon} {labelFor(typeInfo.id, typeInfo.label)}
              <button type="button" className={styles.changeTypeBtn} onClick={handleBack}>
                <Translate id="blog.typoReport.change">change</Translate>
              </button>
            </div>
          )}
          <textarea
            className={styles.commentInput}
            placeholder={translate({
              id: "blog.typoReport.placeholder",
              message: "Optional details (max 300 chars)",
            })}
            maxLength={300}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {/* Honeypot — bots fill this, humans don't see it */}
          <input
            name="website"
            className={styles.honeypot}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary}>
              <Translate id="blog.typoReport.send">Send</Translate>
            </button>
            <button type="button" className={styles.btnSecondary} onClick={handleCancel}>
              <Translate id="blog.typoReport.cancel">Cancel</Translate>
            </button>
          </div>
          <p className={styles.disclaimer}>
            <Translate id="blog.typoReport.disclaimer">
              One-way signal — no reply will be sent.
            </Translate>
          </p>
        </form>
      )}

      {phase === "submitting" && (
        <div className={styles.status}>
          <Translate id="blog.typoReport.sending">Sending…</Translate>
        </div>
      )}

      {phase === "done" && (
        <div className={styles.status}>
          <Translate id="blog.typoReport.thanks">Thanks for the feedback! ✓</Translate>
          <button
            className={styles.dismissBtn}
            onClick={handleDismiss}
            aria-label={translate({ id: "blog.typoReport.dismiss", message: "Dismiss" })}
          >
            ✕
          </button>
        </div>
      )}

      {phase === "error" && (
        <div className={styles.statusError}>
          <Translate id="blog.typoReport.sendError">Could not send.</Translate>
          <button
            className={styles.dismissBtn}
            onClick={handleDismiss}
            aria-label={translate({ id: "blog.typoReport.dismiss", message: "Dismiss" })}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
