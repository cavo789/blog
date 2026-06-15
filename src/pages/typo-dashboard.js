import { useState, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./typo-dashboard.module.css";

const STORAGE_KEY = "reactions_admin_token"; // reuse same token as reactions

const TYPE_LABELS = {
  typo:       { icon: "🔤", label: "Typo" },
  incorrect:  { icon: "❌", label: "Incorrect" },
  outdated:   { icon: "⏰", label: "Outdated" },
  suggestion: { icon: "💡", label: "Suggestion" },
};

// ── Sub-components ───────────────────────────────────────────────────────────

function TypeBadge({ type }) {
  const info = TYPE_LABELS[type] ?? { icon: "❓", label: type ?? "unknown" };
  return (
    <span className={`${styles.typeBadge} ${styles[`type_${type}`] ?? ""}`}>
      {info.icon} {info.label}
    </span>
  );
}

function ReportCard({ report, slug, siteUrl }) {
  const date = new Date(report.ts * 1000).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div className={styles.reportCard}>
      <div className={styles.reportHeader}>
        <TypeBadge type={report.type} />
        <span className={styles.reportDate}>{date}</span>
        <a
          href={`${siteUrl}/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.slugLink}
        >
          {slug} ↗
        </a>
      </div>
      <blockquote className={styles.reportText}>"{report.text}"</blockquote>
      {report.context && (
        <p className={styles.reportContext}>
          …{report.context}…
        </p>
      )}
      {report.comment && (
        <p className={styles.reportComment}>
          <strong>Note:</strong> {report.comment}
        </p>
      )}
    </div>
  );
}

function AuthForm({ onSubmit }) {
  const [token, setToken] = useState("");

  return (
    <div className={styles.authWrap}>
      <p>Enter your admin token to view the typo reports.</p>
      <form
        className={styles.authForm}
        onSubmit={(e) => { e.preventDefault(); onSubmit(token.trim()); }}
      >
        <input
          className={styles.authInput}
          type="password"
          placeholder="Admin token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          autoFocus
        />
        <button className={styles.authBtn} type="submit">View</button>
      </form>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function TypoDashboard() {
  const { siteConfig } = useDocusaurusContext();
  const apiUrl = `${siteConfig.url}/api/typo.php`;

  const [token,   setToken]   = useState("");
  const [data,    setData]    = useState(null);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const initial =
      window.location.hash.slice(1) ||
      localStorage.getItem(STORAGE_KEY) ||
      "";
    if (initial) setToken(initial);
  }, []);

  const fetchData = useCallback(async (tk) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}?admin=${encodeURIComponent(tk)}`);
      if (res.status === 403) {
        setError("Invalid token.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError("API error.");
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
      setToken(tk);
      try { localStorage.setItem(STORAGE_KEY, tk); } catch {}
    } catch {
      setError("Network error.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    if (token) fetchData(token);
  }, [token, fetchData]);

  // Flatten all reports sorted newest-first.
  const allReports = data
    ? Object.entries(data)
        .flatMap(([slug, reports]) => reports.map((r) => ({ ...r, slug })))
        .sort((a, b) => b.ts - a.ts)
    : [];

  const countByType = allReports.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Layout title="Typo Reports" noFooter>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Feedback Reports</h1>
          <a href="/admin" className={styles.backLink}>← Admin</a>
        </div>

        {!data && !loading && (
          <AuthForm onSubmit={fetchData} />
        )}

        {loading && <p className={styles.dim}>Loading…</p>}

        {error && <p className={styles.err}>{error}</p>}

        {data && (
          <>
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <div className={styles.summaryValue}>{allReports.length}</div>
                <div className={styles.summaryLabel}>Total reports</div>
              </div>
              {Object.entries(TYPE_LABELS).map(([id, { icon, label }]) => (
                <div key={id} className={styles.summaryCard}>
                  <div className={styles.summaryValue}>{countByType[id] ?? 0}</div>
                  <div className={styles.summaryLabel}>{icon} {label}</div>
                </div>
              ))}
            </div>

            {allReports.length === 0 ? (
              <p className={styles.dim}>No reports yet.</p>
            ) : (
              <div className={styles.reportList}>
                {allReports.map((r) => (
                  <ReportCard key={r.id} report={r} slug={r.slug} siteUrl={siteConfig.url} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
