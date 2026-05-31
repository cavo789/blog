// Injects article-specific Open Graph tags that Docusaurus does not generate.
// Docusaurus sets og:type=website for all pages; this overrides it to "article"
// and adds article:* tags used by Facebook, LinkedIn, and social scrapers.
import Head from "@docusaurus/Head";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";

export default function OpenGraphArticle() {
  const { metadata } = useBlogPost();
  const { date, frontMatter, authors, tags } = metadata;
  const lastUpdated = frontMatter?.lastUpdated || date;

  return (
    <Head>
      <meta property="og:type" content="article" />
      <meta property="article:published_time" content={date} />
      {lastUpdated !== date && (
        <meta property="article:modified_time" content={lastUpdated} />
      )}
      {authors?.map((author) =>
        author.name ? (
          <meta
            key={author.name}
            property="article:author"
            content={author.url ?? author.name}
          />
        ) : null
      )}
      {tags?.map((tag) => (
        <meta key={tag.label} property="article:tag" content={tag.label} />
      ))}
    </Head>
  );
}
