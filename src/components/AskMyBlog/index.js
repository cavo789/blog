/**
 * AskMyBlog — a search-as-you-type box over the build-time "ask my blog" question index
 * (see .todos/0083-ask-my-blog-question-index.md and plugins/questions-index-plugin).
 *
 * Lazy-fetches the full `{ question, anchor, permalink, title, mainTag }` corpus on mount
 * (./questionsIndex.js — a plain static JSON asset, not `usePluginData`; see that module's
 * comment for why) and ranks it against the reader's query with plain BM25 (./utils.js),
 * entirely client-side: the semantic work already happened once at build time, when Ollama
 * phrased each question in a developer's own search vocabulary.
 */

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { buildSearchIndex, search } from "./utils";
import { loadQuestionsIndex } from "./questionsIndex";
import styles from "./styles.module.css";

export default function AskMyBlog({
  placeholder = 'Ask a question, e.g. "how do I reduce my image size?"',
  maxResults = 8,
  showLabel = true,
}) {
  const { withBaseUrl } = useBaseUrlUtils();
  // null = not fetched yet, [] = loaded (possibly empty), only ever read after loading.
  const [questions, setQuestions] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;
    loadQuestionsIndex(withBaseUrl("/questions-index.json"))
      .then((data) => {
        if (!cancelled) setQuestions(data);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [withBaseUrl]);

  const searchIndex = useMemo(() => buildSearchIndex(questions ?? []), [questions]);
  const trimmed = query.trim();

  const results = useMemo(
    () => (trimmed && questions ? search(searchIndex, trimmed, maxResults) : []),
    [searchIndex, trimmed, maxResults, questions],
  );

  const status = !trimmed
    ? null
    : !questions && !loadFailed
      ? "Loading…"
      : loadFailed
        ? "Search is unavailable right now."
        : `${results.length} result${results.length === 1 ? "" : "s"}`;

  return (
    <div className={styles.container}>
      <label
        htmlFor="ask-my-blog-input"
        className={showLabel ? styles.label : styles.srOnly}
      >
        Ask my blog
      </label>
      <input
        id="ask-my-blog-input"
        type="search"
        className={styles.input}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        aria-describedby="ask-my-blog-status"
      />
      <div
        id="ask-my-blog-status"
        className={styles.status}
        role="status"
        aria-live="polite"
      >
        {status}
      </div>
      {results.length > 0 && (
        <ul className={styles.results}>
          {results.map((entry, index) => (
            <li
              key={`${entry.permalink}#${entry.anchor}-${index}`}
              className={styles.resultItem}
            >
              <Link
                to={entry.anchor ? `${entry.permalink}#${entry.anchor}` : entry.permalink}
                className={styles.resultLink}
              >
                {entry.question}
              </Link>
              <span className={styles.resultSource}>{entry.title}</span>
            </li>
          ))}
        </ul>
      )}
      {trimmed && questions && !loadFailed && results.length === 0 && (
        <p className={styles.empty}>No matching article yet — try different words.</p>
      )}
    </div>
  );
}

AskMyBlog.propTypes = {
  placeholder: PropTypes.string,
  maxResults: PropTypes.number,
  showLabel: PropTypes.bool,
};
