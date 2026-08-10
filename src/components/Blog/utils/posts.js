/**
 * 🧠 getBlogMetadata
 *
 * Extracts metadata from all MDX blog posts located in the `/blog` directory.
 * Uses Webpack's `require.context` to dynamically load and parse frontmatter
 * from each post, returning a structured array of metadata objects.
 *
 * 🔍 Behavior:
 * - Resolves permalinks based on `slug` or folder structure
 * - Normalizes image paths for static assets
 * - Filters out invalid or missing entries
 *
 * 📦 Returned metadata includes:
 * - `title`: Post title
 * - `description`: Short summary
 * - `image`: Resolved image path
 * - `draft`: Boolean flag for unpublished posts
 * - `unlisted`: Boolean flag for hidden posts
 * - `permalink`: URL path to the post
 * - `tags`: Array of tags
 * - `mainTag`: Primary tag (optional); used by the RelatedBlogPost component
 * - `authors`: Array of author names
 * - `date`: Publication date
 * - `series`: Series name (optional); used by the SeriesBlogPost component
 *
 * 🛠️ Usage:
 * ```js
 * import { getBlogMetadata } from './getBlogMetadata';
 * const posts = getBlogMetadata();
 * const withDrafts = getBlogMetadata({ includeDrafts: true });
 * ```
 *
 * By default, posts flagged `draft` or `unlisted` are excluded so consumers don't have to
 * remember to filter them out themselves. Pass `includeDrafts`/`includeUnlisted` to opt back in
 * (e.g. author-facing counters that need to show "in progress" articles).
 *
 * ⚠️ Note:
 * This function is intended for use in static site generation or client-side rendering
 * where Webpack's `require.context` is available.
 */

// The `!!…!` prefix is load-bearing, do not simplify it away: it bypasses the
// rules configured by @docusaurus/plugin-content-blog and reads the files with
// plugins/frontmatter-loader instead. Without it, Webpack MDX-compiles every
// file under `blog/`, and any article flagged `draft: true` crashes the
// production build with "Blog post not found for filePath=…" — because the blog
// plugin drops drafts from its post list while this context still pulls them in.
// See plugins/frontmatter-loader/index.cjs for the full story.
const posts = require.context(
  "!!../../../../plugins/frontmatter-loader/index.cjs!../../../../blog",
  true,
  /\.mdx?$/
);

export function getBlogMetadata({
  includeDrafts = false,
  includeUnlisted = false,
} = {}) {
  return posts
    .keys()
    .map((key) => {
      const post = posts(key);

      // A Markdown file under `blog/` without a title is not an article
      // (a fragment, a note, a readme…); the blog plugin ignores it, so do we.
      if (!post.frontMatter?.title) {
        return null;
      }

      const dir = key.replace(/\/index\.mdx?$/, "").replace(/^\.\//, "");

      let permalink;
      if (post.frontMatter.slug) {
        permalink = post.frontMatter.slug.startsWith("/")
          ? post.frontMatter.slug
          : `/blog/${post.frontMatter.slug.replace(/^\//, "")}`;
      } else {
        permalink = `/blog/${dir}/`;
      }

      let imageUrl = post.frontMatter.image;
      if (imageUrl && imageUrl.startsWith("./")) {
        imageUrl = `/blog/${dir}/${imageUrl.replace("./", "")}`;
      }

      return {
        authors: post.frontMatter.authors || [],
        blueskyRecordKey: post.frontMatter.blueskyRecordKey || null,
        date: post.frontMatter.date,
        description: post.frontMatter.description,
        draft: post.frontMatter.draft || false,
        image: imageUrl,
        mainTag: post.frontMatter.mainTag || null,
        permalink,
        series: post.frontMatter.series || null,
        tags: post.frontMatter.tags || [],
        title: post.frontMatter.title,
        unlisted: post.frontMatter.unlisted || false,
      };
    })
    .filter(Boolean)
    .filter(
      (post) =>
        (includeDrafts || !post.draft) && (includeUnlisted || !post.unlisted)
    );
}
