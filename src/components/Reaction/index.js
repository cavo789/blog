import { useState, useEffect, useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function Reaction({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/reactions.php`;
  const storageKey = `reaction_${slug}`;

  const [counts, setCounts] = useState(null);
  // null until the client-side effect runs — avoids SSR/hydration mismatch (#418).
  // If voted were read in useState(), SSR would produce null (no localStorage)
  // while the client would produce "helpful", causing a React tree mismatch.
  const [voted, setVoted] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) setVoted(stored);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!slug) return;
    fetch(`${apiUrl}?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data) setCounts(data); })
      .catch(() => {});
  }, [slug, apiUrl]);

  const handleVote = useCallback(async (vote) => {
    try {
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, vote }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setCounts(data);
      setVoted(vote);
      try { localStorage.setItem(storageKey, vote); } catch {}
    } catch {}
  }, [slug, apiUrl, storageKey]);

  if (!slug) return null;

  return (
    <div className={styles.container}>
      {!voted ? (
        <>
          <span className={styles.question}>Was this article helpful?</span>
          <div className={styles.buttons}>
            <button
              className={styles.btn}
              onClick={() => handleVote("helpful")}
              aria-label="Yes, this was helpful"
            >
              👍 Helpful
            </button>
            <button
              className={`${styles.btn} ${styles.btnNeutral}`}
              onClick={() => handleVote("not_helpful")}
              aria-label="No, this was not helpful"
            >
              👎 Not really
            </button>
          </div>
        </>
      ) : (
        <div className={styles.thanks}>
          <span className={styles.thanksMsg}>
            {voted === "helpful" ? "Glad it helped! 🙌" : "Thanks for the feedback!"}
          </span>
          {counts && (
            <span className={styles.counts}>
              <span title={`${counts.helpful} found this helpful`}>
                👍 {counts.helpful}
              </span>
              <span title={`${counts.not_helpful} did not find this helpful`}>
                👎 {counts.not_helpful}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

Reaction.propTypes = {
  metadata: PropTypes.shape({
    permalink: PropTypes.string,
  }).isRequired,
};
