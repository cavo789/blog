import { useState, useEffect, useCallback, type JSX } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./styles.module.css";
import Translate, { translate } from "@docusaurus/Translate";

interface Props {
  metadata?: {
    permalink?: string;
  };
}

interface Counts {
  worked: number;
  didnt_work: number;
}

export default function TriedIt({ metadata }: Props): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/tried-it.php`;
  const storageKey = `tried_it_${slug}`;

  const [counts, setCounts] = useState<Counts | null>(null);
  // null until the client-side effect runs — avoids SSR/hydration mismatch (#418).
  const [voted, setVoted] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional SSR/hydration-safe read, see comment on `voted` above
      if (stored) setVoted(stored);
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    if (!slug) return;
    fetch(`${apiUrl}?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setCounts(data);
      })
      .catch(() => {});
  }, [slug, apiUrl]);

  const handleVote = useCallback(
    async (vote: string) => {
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
        try {
          localStorage.setItem(storageKey, vote);
        } catch {}
      } catch {}
    },
    [slug, apiUrl, storageKey],
  );

  if (!slug) return null;

  return (
    <div className={styles.container}>
      {!voted ? (
        <>
          <span className={styles.question}>
            <Translate id="blog.triedIt.question">
              Did you try the steps in this article?
            </Translate>
          </span>
          <div className={styles.buttons}>
            <button
              className={styles.btn}
              onClick={() => handleVote("worked")}
              aria-label={translate({
                id: "blog.triedIt.yes.ariaLabel",
                message: "Yes, I tried this and it worked",
              })}
            >
              ✅ <Translate id="blog.triedIt.yes">It worked!</Translate>
            </button>
            <button
              className={`${styles.btn} ${styles.btnNeutral}`}
              onClick={() => handleVote("didnt_work")}
              aria-label={translate({
                id: "blog.triedIt.no.ariaLabel",
                message: "No, it did not work for me",
              })}
            >
              ❌ <Translate id="blog.triedIt.no">Didn't work for me</Translate>
            </button>
          </div>
        </>
      ) : (
        <div className={styles.thanks}>
          <span className={styles.thanksMsg}>
            {voted === "worked"
              ? translate({
                  id: "triedIt.thanksWorked",
                  message: "Awesome, glad it worked! 🎉",
                })
              : translate({
                  id: "triedIt.thanksDidnt",
                  message: "Thanks for letting us know!",
                })}
          </span>
          {counts && (
            <span className={styles.counts}>
              <span
                title={translate(
                  { id: "triedIt.countWorked", message: "{count} readers had it work" },
                  { count: counts.worked },
                )}
              >
                ✅ {counts.worked}
              </span>
              <span
                title={translate(
                  {
                    id: "triedIt.countDidnt",
                    message: "{count} readers could not reproduce it",
                  },
                  { count: counts.didnt_work },
                )}
              >
                ❌ {counts.didnt_work}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
