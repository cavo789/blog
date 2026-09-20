import { useState, useCallback, useEffect, type JSX } from "react";
import styles from "./styles.module.css";
import { translate } from "@docusaurus/Translate";

interface Props {
  title: string;
  url: string;
}

type Status = "idle" | "copied" | "error";

/**
 * "Share" — the OS share sheet where the browser exposes one (every mobile
 * browser and this site's PWA), clipboard copy everywhere else.
 *
 * Exists because the article URL is not visible in the PWA or on a phone
 * browser with the address bar collapsed, so a reader has no other way to
 * hand the page to someone else.
 */
export default function ShareArticle({ title, url }: Props): JSX.Element {
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (status === "idle") return;
    const timer = setTimeout(() => setStatus("idle"), 2000);
    return () => clearTimeout(timer);
  }, [status]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        // The reader closed the share sheet without picking anything — not a failure.
        if ((err as DOMException)?.name !== "AbortError") {
          console.error("ShareArticle: failed to share", err);
        }
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch (err) {
      console.error("ShareArticle: failed to copy link", err);
      setStatus("error");
    }
  }, [title, url]);

  return (
    <button type="button" className={styles.shareBtn} onClick={handleShare}>
      {status === "copied"
        ? translate({ id: "blog.shareArticle.copied", message: "✓ Link copied" })
        : status === "error"
          ? translate({ id: "blog.shareArticle.error", message: "Could not copy link" })
          : translate({ id: "blog.shareArticle.label", message: "Share" })}
    </button>
  );
}
