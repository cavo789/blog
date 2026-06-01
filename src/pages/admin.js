import { useEffect, useState } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import styles from "./admin.module.css";

const STORAGE_KEY = "reactions_admin_token";

const TOOLS = [
  {
    icon: "📊",
    title: "Reactions Dashboard",
    description: "Per-article reader feedback — helpful vs. not helpful votes, approval rates.",
    href: "/reactions-dashboard",
    color: "#3cad6e",
  },
];

function ToolCard({ icon, title, description, href, color }) {
  return (
    <a href={href} className={styles.card} style={{ "--card-accent": color }}>
      <div className={styles.cardIcon}>{icon}</div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardDesc}>{description}</p>
      </div>
      <span className={styles.cardArrow}>→</span>
    </a>
  );
}

export default function AdminPage() {
  const { siteConfig } = useDocusaurusContext();
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
            <p className={styles.heroSub}>
              {siteConfig.title} — back-office tools
            </p>
            {savedToken && (
              <span className={styles.tokenBadge}>
                <span className={styles.tokenDot} />
                Authenticated
              </span>
            )}
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

      {/* ── Tools grid ── */}
      <div className={styles.content}>
        <p className={styles.sectionLabel}>Available tools</p>
        <div className={styles.grid}>
          {TOOLS.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>

        <p className={styles.hint}>
          This page is not linked from the navigation. Bookmark it to access it
          quickly.
        </p>
      </div>
    </Layout>
  );
}
