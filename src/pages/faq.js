/**
 * /faq — "Ask My Blog" hub (see .todos/0083-ask-my-blog-question-index.md).
 *
 * Deliberately lightweight: the `AskMyBlog` search box for a reader who already knows their
 * question (searches the full, cross-theme corpus — see AskMyBlog/questionsIndex.js), and a
 * table of contents of topics, sorted alphabetically, for a reader who wants to browse. The
 * actual per-topic question lists live at /faq/<theme> (src/components/FaqThemePage),
 * generated per-route by plugins/questions-index-plugin — see that plugin's header comment
 * for why the corpus is split this way instead of one page listing all ~2000+ questions.
 */

import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import { usePluginData } from "@docusaurus/useGlobalData";
import AskMyBlog from "@site/src/components/AskMyBlog";
import styles from "./faq.module.css";

export default function FaqPage() {
  const { themes, meta } = usePluginData("questions-index-plugin");
  const { withBaseUrl } = useBaseUrlUtils();
  // `<Layout>` (theme-classic) only forwards title/description to PageMetadata, not image —
  // that wiring is MDXPage-only (frontmatter `image:`, see src/pages/map.mdx). A plain .js
  // page has no frontmatter, so the og:image/twitter:image tags are added by hand here,
  // mirroring src/components/StructuredData's same withBaseUrl({absolute: true}) pattern.
  const ogImage = withBaseUrl("/img/faqs.webp", { absolute: true });

  return (
    <Layout
      title="Ask My Blog"
      description="Every question this blog can answer, generated from its own articles and grouped by topic — search it, or browse by theme."
    >
      <Head>
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <main className={styles.page}>
        <img
          className={styles.marginImage}
          src={withBaseUrl("/img/faqs.webp")}
          alt="A meerkat surveying the blog's topics."
          loading="lazy"
        />

        <header className={styles.header}>
          <h1>Ask My Blog</h1>
          <p className={styles.subtitle}>
            {meta.questionCount} question{meta.questionCount === 1 ? "" : "s"}, generated
            from {meta.articleCount} article{meta.articleCount === 1 ? "" : "s"} — phrased
            the way a developer would actually search, not just the article&apos;s own
            title.
          </p>
        </header>

        <AskMyBlog />

        {themes.length === 0 ? (
          <p className={styles.empty}>
            No questions indexed yet — generate some with <code>yarn questions:bulk</code>
            .
          </p>
        ) : (
          <nav aria-label="Browse by topic">
            <h2 className={styles.tocTitle}>Browse by topic</h2>
            <ul className={styles.toc}>
              {themes.map((theme) => (
                <li key={theme.key}>
                  <Link to={theme.permalink}>{theme.label}</Link>
                  <span className={styles.tocCount}>{theme.count}</span>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </main>
    </Layout>
  );
}
