import { useEffect, useState, useCallback } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./admin.module.css";

const STORAGE_KEY = "reactions_admin_token";

// ── Admin tools ───────────────────────────────────────────────────────────────

const TOOLS = [
  {
    icon: "📊",
    title: "Reactions Dashboard",
    description: "Per-article reader feedback — helpful vs. not helpful votes and approval rates.",
    href: "/reactions-dashboard",
    accent: "#3cad6e",
  },
];

const SITE_RESOURCES = [
  { label: "sitemap.xml",   href: "/sitemap.xml",   icon: "🗺️" },
  { label: "rss.xml",       href: "/blog/rss.xml",  icon: "📡" },
  { label: "robots.txt",    href: "/robots.txt",    icon: "🤖" },
];

const GITHUB_LINKS = [
  { label: "Repository",    href: "https://github.com/cavo789/blog",         icon: "📦" },
  { label: "Actions (CI)",  href: "https://github.com/cavo789/blog/actions", icon: "⚙️" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function ToolCard({ icon, title, description, href, accent }) {
  return (
    <a href={href} className={styles.toolCard} style={{ "--accent": accent }}>
      <div className={styles.toolIcon}>{icon}</div>
      <div className={styles.toolBody}>
        <h3 className={styles.toolTitle}>{title}</h3>
        <p className={styles.toolDesc}>{description}</p>
      </div>
      <span className={styles.toolArrow}>→</span>
    </a>
  );
}

function ApiStatus({ apiUrl }) {
  const [status, setStatus] = useState("checking"); // checking | ok | error

  useEffect(() => {
    let cancelled = false;
    fetch(`${apiUrl}?slug=admin-healthcheck`)
      .then((r) => { if (!cancelled) setStatus(r.ok ? "ok" : "error"); })
      .catch(() => { if (!cancelled) setStatus("error"); });
    return () => { cancelled = true; };
  }, [apiUrl]);

  const map = {
    checking: { dot: styles.dotChecking, label: "Checking…" },
    ok:       { dot: styles.dotOk,       label: "API reachable" },
    error:    { dot: styles.dotError,    label: "API unreachable" },
  };
  const { dot, label } = map[status];

  return (
    <div className={styles.apiStatus}>
      <span className={`${styles.dot} ${dot}`} />
      <span className={styles.apiLabel}>reactions.php — {label}</span>
    </div>
  );
}

function ResourceLinks({ items }) {
  return (
    <ul className={styles.linkList}>
      {items.map(({ icon, label, href }) => (
        <li key={href}>
          <a href={href} target="_blank" rel="noopener noreferrer" className={styles.resourceLink}>
            <span className={styles.resourceIcon}>{icon}</span>
            {label}
            <span className={styles.externalArrow}>↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

function DraftsList({ siteUrl }) {
  const [drafts,  setDrafts]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/admin-data/drafts.json")
      .then((r) => r.json())
      .then((d) => setDrafts(d))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.dimText}>Loading…</p>;

  if (!drafts || drafts.length === 0) {
    return (
      <div className={styles.emptyDrafts}>
        <span className={styles.emptyIcon}>✅</span>
        <span>No pending drafts — all articles are published.</span>
      </div>
    );
  }

  return (
    <ul className={styles.draftList}>
      {drafts.map((d) => (
        <li key={d.slug} className={styles.draftItem}>
          <div className={styles.draftMeta}>
            <span className={`${styles.statusBadge} ${d.status === "draft" ? styles.badgeDraft : styles.badgeUnlisted}`}>
              {d.status}
            </span>
            {d.date && <span className={styles.draftDate}>{d.date}</span>}
          </div>
          <span className={styles.draftTitle}>{d.title}</span>
          {d.tags.length > 0 && (
            <div className={styles.draftTags}>
              {d.tags.map((t) => <span key={t} className={styles.draftTag}>{t}</span>)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { siteConfig } = useDocusaurusContext();
  const apiUrl     = `${siteConfig.url}/api/reactions.php`;
  const [savedToken, setSavedToken] = useState(false);

  useEffect(() => {
    setSavedToken(!!localStorage.getItem(STORAGE_KEY));
  }, []);

  return (
    <Layout title="Admin" noFooter>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.heroText}>
            <div className={styles.heroBadge}>Private area</div>
            <h1 className={styles.heroTitle}>Admin Zone</h1>
            <p className={styles.heroSub}>{siteConfig.title} — back-office tools</p>
            <div className={styles.heroStatus}>
              {savedToken && (
                <span className={styles.tokenBadge}>
                  <span className={styles.tokenDot} />
                  Authenticated
                </span>
              )}
              <ApiStatus apiUrl={apiUrl} />
            </div>
          </div>
          <div className={styles.heroMeerkat}>
            <img
              src="/img/meerkat/suricate_no_background.webp"
              alt="Meerkat guardian"
              className={styles.meerkatImg}
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className={styles.content}>

        {/* Admin tools */}
        <p className={styles.sectionLabel}>Admin tools</p>
        <div className={styles.toolGrid}>
          {TOOLS.map((t) => <ToolCard key={t.href} {...t} />)}
        </div>

        {/* Two-column row: site resources + GitHub */}
        <div className={styles.twoCol}>
          <div className={styles.panel}>
            <p className={styles.sectionLabel}>Site resources</p>
            <ResourceLinks items={SITE_RESOURCES} />
          </div>
          <div className={styles.panel}>
            <p className={styles.sectionLabel}>GitHub</p>
            <ResourceLinks items={GITHUB_LINKS} />
          </div>
        </div>

        {/* Drafts */}
        <p className={styles.sectionLabel}>Pending drafts</p>
        <DraftsList siteUrl={siteConfig.url} />

        <p className={styles.hint}>
          This page is not linked from the navigation. Bookmark it for quick access.
        </p>
      </div>
    </Layout>
  );
}
