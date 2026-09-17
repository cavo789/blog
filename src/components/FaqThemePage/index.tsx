/**
 * /faq/<theme> — one topic's slice of the "Ask My Blog" question index (TODO 0083).
 *
 * Generated per-theme by plugins/questions-index-plugin (`addRoute` + `createData`), so this
 * page only ever receives its own theme's questions as a prop — Docusaurus code-splits per
 * route automatically, so no other page pays for a theme it isn't showing. This is the
 * server-rendered, crawlable counterpart to the client-side, cross-theme AskMyBlog search box
 * on /faq — see plugins/questions-index-plugin/index.cjs's header for the full rationale.
 *
 * Carries FAQPage JSON-LD structured data. Worth noting: Google restricted FAQPage rich
 * results (August 2023) to a narrow set of authoritative government/health sites, so this
 * won't produce the expandable snippet UI for a personal blog — it's still correct,
 * standards-compliant markup, just not a guaranteed visual SERP win.
 */

import type { JSX } from "react";
import Layout from "@theme/Layout";
import Head from "@docusaurus/Head";
import Link from "@docusaurus/Link";
import Translate, { translate } from "@docusaurus/Translate";
import { usePluralForm } from "@docusaurus/theme-common";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";
import styles from "./styles.module.css";

interface QuestionEntry {
  question: string;
  anchor?: string;
  permalink: string;
  title: string;
}

interface Theme {
  key: string;
  label: string;
  items: QuestionEntry[];
}

interface Props {
  theme: Theme;
}

function buildJsonLd(
  theme: Theme,
  withBaseUrl: ReturnType<typeof useBaseUrlUtils>["withBaseUrl"],
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: theme.items.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: `Covered in "${entry.title}".`,
        url: withBaseUrl(
          entry.anchor ? `${entry.permalink}#${entry.anchor}` : entry.permalink,
          {
            absolute: true,
          },
        ),
      },
    })),
  };
}

/**
 * The page's single sentence of prose — it is both the visible subtitle and the
 * `<meta name="description">`.
 *
 * `usePluralForm()` rather than a `count === 1` ternary: the plural rule belongs to the locale
 * being rendered, not to English. Same pattern as src/theme/BlogPostItem/Header/Info.
 */
function useThemeDescription(): (count: number, label: string) => string {
  const { selectMessage } = usePluralForm();

  return (count, label) =>
    selectMessage(
      count,
      translate(
        {
          id: "faq.theme.description.plurals",
          description:
            'Pluralized subtitle of a /faq/<theme> page. Use as many plural forms (separated by "|") as your language supports.',
          message:
            "One question about {label}, generated from this blog's own articles — phrased the way a developer would actually search.|{count} questions about {label}, generated from this blog's own articles — phrased the way a developer would actually search.",
        },
        { count, label },
      ),
    );
}

export default function FaqThemePage({ theme }: Props): JSX.Element {
  const { withBaseUrl } = useBaseUrlUtils();
  const ogImage = withBaseUrl("/img/faqs.webp", { absolute: true });
  const count = theme.items.length;
  const description = useThemeDescription()(count, theme.label);
  const jsonLd = buildJsonLd(theme, withBaseUrl);

  return (
    <Layout
      title={translate(
        { id: "faqThemePage.title", message: "{theme} — Ask My Blog" },
        { theme: theme.label },
      )}
      description={description}
    >
      <Head>
        <meta property="og:image" content={ogImage} />
        <meta name="twitter:image" content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Head>
      <main className={styles.page}>
        <p className={styles.breadcrumb}>
          <Link to="/faq">
            ← <Translate id="faq.theme.allTopics">All topics</Translate>
          </Link>
        </p>
        <header className={styles.header}>
          <h1>{theme.label}</h1>
          <p className={styles.subtitle}>{description}</p>
        </header>
        <ul className={styles.list}>
          {theme.items.map((entry, index) => (
            <li key={`${entry.permalink}#${entry.anchor}-${index}`}>
              <Link
                to={entry.anchor ? `${entry.permalink}#${entry.anchor}` : entry.permalink}
              >
                {entry.question}
              </Link>
              <span className={styles.source}>{entry.title}</span>
            </li>
          ))}
        </ul>
      </main>
    </Layout>
  );
}
