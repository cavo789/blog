import { useState, useCallback, useEffect, type JSX } from "react";
import styles from "./styles.module.css";

interface Props {
  metadata: {
    permalink: string;
  };
}

type Status = "idle" | "copying" | "copied" | "error";

/**
 * "Copy as Markdown" / "View raw" — reads the plain-Markdown mirror that
 * plugins/markdown-export-plugin writes next to every post's HTML page
 * (`/blog/<slug>` → `/blog/<slug>.md`, see TODO 0082) and copies its full
 * content to the clipboard. Lets a reader — or an LLM they paste it into —
 * get the article's complete text without React, JSX, or the accordions the
 * HTML page collapses by default.
 *
 * Only meaningful on a real `yarn build` output: the mirror is written in
 * `postBuild`, so on `yarn start` the fetch below 404s and the button
 * reports "Could not copy" — the same graceful-failure path a mirror that's
 * missing for any other reason takes.
 */
export default function CopyAsMarkdown({ metadata }: Props): JSX.Element {
  const [status, setStatus] = useState<Status>("idle");
  const mdUrl = `${metadata.permalink.replace(/\/$/, "")}.md`;

  const handleCopy = useCallback(async () => {
    setStatus("copying");
    try {
      const res = await fetch(mdUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setStatus("copied");
    } catch (err) {
      console.error("CopyAsMarkdown: failed to copy", err);
      setStatus("error");
    }
  }, [mdUrl]);

  useEffect(() => {
    if (status !== "copied" && status !== "error") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.copyBtn}
        onClick={handleCopy}
        disabled={status === "copying"}
      >
        {status === "copied"
          ? "✓ Copied"
          : status === "error"
            ? "Could not copy"
            : "📋 Copy as Markdown"}
      </button>
      <a
        href={mdUrl}
        className={styles.rawLink}
        target="_blank"
        rel="noopener noreferrer"
      >
        View raw
      </a>
    </div>
  );
}
