import { useState, useEffect, useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

export default function TriedIt({ metadata }) {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/tried-it.php`;
  const storageKey = `tried_it_${slug}`;

  const [counts, setCounts] = useState(null);
  // null until the client-side effect runs — avoids SSR/hydration mismatch (#418).
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
          <span className={styles.question}>Did you try the steps in this article?</span>
          <div className={styles.buttons}>
            <button
              className={styles.btn}
              onClick={() => handleVote("worked")}
              aria-label="Yes, I tried this and it worked"
            >
              ✅ It worked!
            </button>
            <button
              className={`${styles.btn} ${styles.btnNeutral}`}
              onClick={() => handleVote("didnt_work")}
              aria-label="No, it didn't work for me"
            >
              ❌ Didn't work for me
            </button>
          </div>
        </>
      ) : (
        <div className={styles.thanks}>
          <span className={styles.thanksMsg}>
            {voted === "worked" ? "Awesome, glad it worked! 🎉" : "Thanks for letting us know!"}
          </span>
          {counts && (
            <span className={styles.counts}>
              <span title={`${counts.worked} readers had it work`}>
                ✅ {counts.worked}
              </span>
              <span title={`${counts.didnt_work} readers could not reproduce it`}>
                ❌ {counts.didnt_work}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

TriedIt.propTypes = {
  metadata: PropTypes.shape({
    permalink: PropTypes.string,
  }).isRequired,
};
