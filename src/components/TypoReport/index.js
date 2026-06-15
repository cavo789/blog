import { useState, useEffect, useRef, useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

// ── LocalStorage helpers ───────────────────────────────────────────────────────

const STORAGE_KEY = "typo_reports"; // [{ts, hash}]
const MAX_PER_HOUR = 5;

// FNV-1a 32-bit hash (no crypto needed for client-side dedup)
function fnv1a(str) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

function getStored() {
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

function isLocalDuplicate(slug, text) {
  const hash = fnv1a(slug + "|" + text.toLowerCase());
  return getStored().some((r) => r.hash === hash);
}

function recordLocalSubmission(slug, text) {
  const now = Date.now();
  const hash = fnv1a(slug + "|" + text.toLowerCase());
  const pruned = getStored().filter((r) => r.ts > now - 86_400_000);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...pruned, { ts: now, hash }]));
  } catch {}
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function TypoReport({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/typo.php`;

  // State machine: idle → selected → confirming → submitting → done | error
  const [phase, setPhase] = useState("idle");
  const [selectedText, setSelectedText] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [comment, setComment] = useState("");

  const nonceRef    = useRef(null);
  const articleRef  = useRef(null);
  const wrapperRef  = useRef(null);
  const contextRef  = useRef("");  // ±100 chars around selection

  // Fetch nonce + wire up DOM listeners on mount.
  useEffect(() => {
    if (!slug) return;

    // Fetch nonce eagerly.
    fetch(`${apiUrl}?nonce`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.nonce) nonceRef.current = data.nonce; })
      .catch(() => {});

    const article = document.querySelector("article") || document.querySelector(".theme-doc-markdown");
    if (!article) return;
    articleRef.current = article;

    function handleMouseUp() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) return;

      const text = sel.toString().trim();
      if (text.length < 3) return;

      const range = sel.getRangeAt(0);
      const rect  = range.getBoundingClientRect();

      // Ensure selection is inside the article.
      if (!article.contains(range.commonAncestorContainer)) return;

      // Capture ±100-char context from the article's plain text.
      const fullText = article.innerText || "";
      const idx = fullText.indexOf(text);
      if (idx !== -1) {
        contextRef.current = fullText.slice(Math.max(0, idx - 100), idx + text.length + 100);
      } else {
        contextRef.current = "";
      }

      const top  = window.scrollY + rect.bottom + 8;
      const left = Math.min(window.scrollX + rect.left, window.innerWidth - 296);

      setSelectedText(text);
      setTooltipPos({ top, left });
      setPhase("selected");
    }

    function handleMouseDown(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setPhase("idle");
      }
    }

    article.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      article.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [slug, apiUrl]);

  const handleOpen = useCallback(() => {
    if (isLocalRateLimited()) {
      setPhase("error");
      return;
    }
    if (isLocalDuplicate(slug, selectedText)) {
      setPhase("done");
      return;
    }
    setComment("");
    setPhase("confirming");
  }, [slug, selectedText]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setPhase("submitting");

    // Refresh nonce if missing (e.g. expired tab).
    let nonce = nonceRef.current;
    if (!nonce) {
      try {
        const r = await fetch(`${apiUrl}?nonce`);
        const d = r.ok ? await r.json() : null;
        nonce = d?.nonce ?? null;
        nonceRef.current = nonce;
      } catch {}
    }

    const honeypot = e.target.elements["website"]?.value ?? "";

    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          text:    selectedText,
          comment,
          context: contextRef.current,
          website: honeypot,
          nonce:   nonce ?? "",
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
  }, [slug, selectedText, comment, apiUrl]);

  const handleCancel = useCallback(() => {
    setPhase("idle");
  }, []);

  const handleDismiss = useCallback(() => {
    setPhase("idle");
  }, []);

  // SSR-safe: render nothing when idle.
  if (phase === "idle") return null;

  return (
    <div
      ref={wrapperRef}
      className={styles.wrapper}
      style={{ top: tooltipPos.top, left: tooltipPos.left }}
    >
      {phase === "selected" && (
        <button className={styles.triggerBtn} onClick={handleOpen}>
          ✏️ Report typo?
        </button>
      )}

      {phase === "confirming" && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.selectedPreview}>
            "{selectedText.length > 80 ? selectedText.slice(0, 80) + "…" : selectedText}"
          </div>
          <textarea
            className={styles.commentInput}
            placeholder="Optional comment (max 300 chars)"
            maxLength={300}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          {/* Honeypot — bots fill this, humans don't see it */}
          <input name="website" className={styles.honeypot} tabIndex={-1} autoComplete="off" defaultValue="" />
          <div className={styles.actions}>
            <button type="submit" className={styles.btnPrimary}>Send</button>
            <button type="button" className={styles.btnSecondary} onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      )}

      {phase === "submitting" && (
        <div className={styles.status}>Sending…</div>
      )}

      {phase === "done" && (
        <div className={styles.status}>
          Thanks! ✓
          <button className={styles.dismissBtn} onClick={handleDismiss} aria-label="Dismiss">✕</button>
        </div>
      )}

      {phase === "error" && (
        <div className={styles.statusError}>
          Could not send.
          <button className={styles.dismissBtn} onClick={handleDismiss} aria-label="Dismiss">✕</button>
        </div>
      )}
    </div>
  );
}

TypoReport.propTypes = {
  metadata: PropTypes.shape({
    permalink: PropTypes.string,
  }).isRequired,
};
