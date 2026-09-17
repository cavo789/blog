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
  helpful: number;
  not_helpful: number;
}

export default function Reaction({ metadata }: Props): JSX.Element | null {
  const { siteConfig } = useDocusaurusContext();
  const slug = metadata?.permalink?.replace(/^\/|\/$/g, "") ?? "";
  const apiUrl = `${siteConfig.url}/api/reactions.php`;
  const storageKey = `reaction_${slug}`;

  const [counts, setCounts] = useState<Counts | null>(null);
  // null until the client-side effect runs — avoids SSR/hydration mismatch (#418).
  // If voted were read in useState(), SSR would produce null (no localStorage)
  // while the client would produce "helpful", causing a React tree mismatch.
  const [voted, setVoted] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState(false);

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
      setSubmitError(false);
      try {
        const res = await fetch(apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, vote }),
        });
        if (!res.ok) {
          setSubmitError(true);
          return;
        }
        const data = await res.json();
        setCounts(data);
        setVoted(vote);
        try {
          localStorage.setItem(storageKey, vote);
        } catch {}
      } catch {
        setSubmitError(true);
      }
    },
    [slug, apiUrl, storageKey],
  );

  if (!slug) return null;

  return (
    <div className={styles.container}>
      {!voted ? (
        <>
          <span className={styles.question}>
            <Translate id="blog.reaction.question">Was this article helpful?</Translate>
          </span>
          <div className={styles.buttons}>
            <button
              className={styles.btn}
              onClick={() => handleVote("helpful")}
              aria-label={translate({
                id: "blog.reaction.yes.ariaLabel",
                message: "Yes, this was helpful",
              })}
            >
              👍 <Translate id="blog.reaction.yes">Helpful</Translate>
            </button>
            <button
              className={`${styles.btn} ${styles.btnNeutral}`}
              onClick={() => handleVote("not_helpful")}
              aria-label={translate({
                id: "blog.reaction.no.ariaLabel",
                message: "No, this was not helpful",
              })}
            >
              👎 <Translate id="blog.reaction.no">Not really</Translate>
            </button>
          </div>
          {submitError && (
            <span className={styles.submitError}>
              <Translate id="reaction.saveError">
                Could not save your vote — please try again.
              </Translate>
            </span>
          )}
        </>
      ) : (
        <div className={styles.thanks}>
          <span className={styles.thanksMsg}>
            {voted === "helpful"
              ? translate({ id: "reaction.thanksHelpful", message: "Glad it helped! 🙌" })
              : translate({
                  id: "reaction.thanksNotHelpful",
                  message: "Thanks for the feedback!",
                })}
          </span>
          {counts && (
            <span className={styles.counts}>
              <span
                title={translate(
                  { id: "reaction.countHelpful", message: "{count} found this helpful" },
                  { count: counts.helpful },
                )}
              >
                👍 {counts.helpful}
              </span>
              <span
                title={translate(
                  {
                    id: "reaction.countNotHelpful",
                    message: "{count} did not find this helpful",
                  },
                  { count: counts.not_helpful },
                )}
              >
                👎 {counts.not_helpful}
              </span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
