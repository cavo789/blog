import { useState, useEffect, useCallback } from "react";
import Layout from "@theme/Layout";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./reactions-dashboard.module.css";

// ── Data helpers ─────────────────────────────────────────────────────────────

function computeTotals(data) {
  let totalHelpful = 0;
  let totalNot = 0;

  const rows = Object.entries(data)
    .map(([slug, counts]) => {
      const helpful   = counts.helpful    ?? 0;
      const notHelpful = counts.not_helpful ?? 0;
      const total      = helpful + notHelpful;
      const ratio      = total > 0 ? Math.round((helpful / total) * 100) : 0;
      totalHelpful += helpful;
      totalNot     += notHelpful;
      return { slug, helpful, notHelpful, total, ratio };
    })
    .sort((a, b) => b.helpful - a.helpful || b.total - a.total);

  const grandTotal = totalHelpful + totalNot;
  const approval   = grandTotal > 0 ? Math.round((totalHelpful / grandTotal) * 100) : 0;

  return { rows, totalHelpful, totalNot, grandTotal, approval };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SummaryCards({ totalHelpful, totalNot, grandTotal, approval }) {
  return (
    <div className={styles.summary}>
      <div className={styles.card}>
        <div className={styles.cardValue}>{grandTotal}</div>
        <div className={styles.cardLabel}>Total votes</div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardValue}>👍 {totalHelpful}</div>
        <div className={styles.cardLabel}>Helpful</div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardValue}>👎 {totalNot}</div>
        <div className={styles.cardLabel}>Not helpful</div>
      </div>
      <div className={styles.card}>
        <div className={styles.cardValue}>{approval}%</div>
        <div className={styles.cardLabel}>Approval rate</div>
      </div>
    </div>
  );
}

function ApprovalBar({ ratio }) {
  return (
    <div className={styles.barWrap}>
      <div className={styles.bar}>
        <div className={styles.barFill} style={{ width: `${ratio}%` }} />
      </div>
      <span className={styles.barLabel}>{ratio}%</span>
    </div>
  );
}

function ReactionsTable({ rows, siteUrl }) {
  if (rows.length === 0) {
    return <p className={styles.empty}>No reactions recorded yet.</p>;
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th>Article</th>
          <th className={styles.right}>👍</th>
          <th className={styles.right}>👎</th>
          <th className={styles.right}>Total</th>
          <th>Approval</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(({ slug, helpful, notHelpful, total, ratio }) => (
          <tr key={slug}>
            <td>
              <a
                href={`${siteUrl}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.articleLink}
              >
                {slug}
              </a>
            </td>
            <td className={styles.right}>{helpful}</td>
            <td className={styles.right}>{notHelpful}</td>
            <td className={styles.right}>{total}</td>
            <td><ApprovalBar ratio={ratio} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AuthForm({ onSubmit }) {
  const [token, setToken] = useState("");

  return (
    <div className={styles.authWrap}>
      <p>Enter your admin token to view the dashboard.</p>
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

export default function ReactionsDashboard() {
  const { siteConfig } = useDocusaurusContext();
  const apiUrl = `${siteConfig.url}/api/reactions.php`;

  // Token: read from URL hash first (e.g. /reactions-dashboard#mytoken), then from form
  const [token,  setToken]  = useState(() => {
    if (typeof window === "undefined") return "";
    return window.location.hash.slice(1);
  });
  const [data,   setData]   = useState(null);
  const [error,  setError]  = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async (t) => {
    if (!t) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}?admin=${encodeURIComponent(t)}`);
      if (res.status === 403) { setError("Invalid token."); setData(null); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
    } catch (e) {
      setError(`Failed to load data: ${e.message}`);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => { if (token) fetchData(token); }, [token, fetchData]);

  const handleTokenSubmit = (t) => { setToken(t); fetchData(t); };

  const stats = data ? computeTotals(data) : null;

  return (
    <Layout title="Reactions Dashboard" noFooter>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1>Reactions Dashboard</h1>
          <p className={styles.subtitle}>Per-article reader feedback — sorted by helpful count</p>
        </div>

        {!token && <AuthForm onSubmit={handleTokenSubmit} />}

        {token && loading && <p>Loading…</p>}

        {token && error && <p className={styles.error}>{error}</p>}

        {stats && (
          <>
            <SummaryCards {...stats} />
            <ReactionsTable rows={stats.rows} siteUrl={siteConfig.url} />
          </>
        )}
      </div>
    </Layout>
  );
}
