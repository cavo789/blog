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
import TranslationCoverage from "@site/src/components/Blog/TranslationCoverage";
import styles from "./faq.module.css";
import Translate, { translate } from "@docusaurus/Translate";

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
      title={translate({
        id: "faq.page.metaTitle",
        message: "Ask My Blog",
        description: "The /faq page <title> and og:title",
      })}
      description="Every question this blog can answer, generated from its own articles and grouped by topic — search it, or browse by theme."
    >
      <Head>
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:image" content={ogImage} />
      </Head>
      <div className={styles.pageWrapper}>
        <img
          className={styles.marginImage}
          src={withBaseUrl("/img/faqs.webp")}
          alt={translate({
            id: "faq.page.imageAlt",
            message: "A meerkat surveying the blog's topics.",
          })}
          loading="lazy"
        />
        <main className={styles.page}>
          <header className={styles.header}>
            <h1>
              <Translate id="faq.page.title">Ask My Blog</Translate>
            </h1>
            <p className={styles.subtitle}>
              <Translate
                id="faq.page.subtitle"
                values={{
                  questions: meta.questionCount,
                  articles: meta.articleCount,
                }}
              >
                {
                  "{questions} questions, generated from {articles} articles — phrased the way a developer would actually search, not just the article's own title."
                }
              </Translate>
            </p>
          </header>

          {/* Renders nothing on `en`. `questions-index-plugin` is not locale-aware: the counts
              above, and the questions themselves, are the English corpus served under a French
              URL. So the figure misleads in BOTH directions — today it promises 2157 questions a
              French reader cannot read, and once TODO 0120 generates them per locale it will drop
              to the ~40 drawn from four translated articles. Either way the reader needs the
              ratio. */}
          <TranslationCoverage />

          <AskMyBlog />

          {themes.length === 0 ? (
            <p className={styles.empty}>
              <Translate
                id="faq.page.empty"
                values={{ command: <code>yarn questions:bulk</code> }}
              >
                {"No questions indexed yet — generate some with {command}."}
              </Translate>
            </p>
          ) : (
            <nav
              aria-label={translate({
                id: "faq.page.browseByTopic.ariaLabel",
                message: "Browse by topic",
              })}
            >
              <h2 className={styles.tocTitle}>
                <Translate id="faq.page.browseByTopic">Browse by topic</Translate>
              </h2>
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
      </div>
    </Layout>
  );
}
