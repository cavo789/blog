// Points crawlers/tools that scan <link rel="alternate"> at this exact
// article's plain-Markdown mirror (written by plugins/markdown-export-plugin,
// see src/components/CopyAsMarkdown for the human-facing equivalent). Same
// discovery pattern as RSS's <link rel="alternate" type="application/rss+xml">,
// scoped to a single page instead of the whole site — the site-wide
// counterpart (pointing at /llms.txt) lives in docusaurus.config.js's
// headTags, since that one applies to every page, not just blog posts.
import Head from "@docusaurus/Head";
import { useBlogPost } from "@docusaurus/plugin-content-blog/client";

export default function MarkdownAlternate() {
  const { metadata } = useBlogPost();

  return (
    <Head>
      <link
        rel="alternate"
        type="text/markdown"
        href={`${metadata.permalink}.md`}
        title="Plain-Markdown mirror of this article"
      />
    </Head>
  );
}
