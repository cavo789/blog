/**
 * getBlogMetadata
 *
 * Extracts metadata from all MDX blog posts located in the `/blog` directory.
 * Uses Webpack's `require.context` to dynamically load and parse frontmatter
 * from each post, returning a structured array of metadata objects.
 *
 * Behavior:
 * - Resolves permalinks based on `slug` or folder structure
 * - Normalizes image paths for static assets
 * - Filters out invalid or missing entries
 *
 * Returned metadata includes:
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
 * Usage:
 * ```ts
 * import { getBlogMetadata } from './posts';
 * const posts = getBlogMetadata();
 * const withDrafts = getBlogMetadata({ includeDrafts: true });
 * ```
 *
 * By default, posts flagged `draft` or `unlisted` are excluded so consumers don't have to
 * remember to filter them out themselves. Pass `includeDrafts`/`includeUnlisted` to opt back in
 * (e.g. author-facing counters that need to show "in progress" articles).
 *
 * Note:
 * This function is intended for use in static site generation or client-side rendering
 * where Webpack's `require.context` is available.
 */

/**
 * A tag as it reaches these helpers: a plain slug string from front matter, or —
 * defensively, since related.ts and TagArticlesPage both handle it — a
 * Docusaurus-normalised tag object.
 */
export type BlogTag = string | { label: string };

export interface BlogPostMetadata {
  authors: string[];
  blueskyRecordKey: string | null;
  /**
   * ISO date string from front matter, e.g. "2026-08-28". Every article under blog/ carries
   * one (blog authoring convention, and the blog plugin itself refuses a post without a
   * date), so this is not optional.
   *
   * Runtime note: plugins/frontmatter-loader actually hands back a real `Date` instance for
   * a typical unquoted YAML date (see that plugin's own header comment) — not a string.
   * Declaring `string` here anyway matches the pre-existing contract every niveau 1-4 `.tsx`
   * consumer already compiles against (`Post.date?: string`, …); every one of them passes
   * this straight into `new Date(...)`, which accepts a `Date` argument just as well as a
   * string, so nothing behavioral changes. Widening this to the more literally accurate type
   * would ripple into every already-migrated consumer — out of scope here.
   */
  date: string;
  description: string | undefined;
  draft: boolean;
  image: string | undefined;
  mainTag: string | null;
  permalink: string;
  series: string | null;
  tags: BlogTag[];
  title: string;
  unlisted: boolean;
}

interface RawFrontMatter {
  title?: string;
  slug?: string;
  image?: string;
  authors?: string[];
  blueskyRecordKey?: string;
  date?: BlogPostMetadata["date"];
  description?: string;
  draft?: boolean;
  mainTag?: string;
  series?: string;
  tags?: BlogTag[];
  unlisted?: boolean;
}

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
  /\.mdx?$/,
);

export function getBlogMetadata({
  includeDrafts = false,
  includeUnlisted = false,
}: { includeDrafts?: boolean; includeUnlisted?: boolean } = {}): BlogPostMetadata[] {
  return posts
    .keys()
    .map((key): BlogPostMetadata | null => {
      const post = posts(key) as { frontMatter: RawFrontMatter };

      // A Markdown file under `blog/` without a title is not an article
      // (a fragment, a note, a readme…); the blog plugin ignores it, so do we.
      if (!post.frontMatter?.title) {
        return null;
      }

      const dir = key.replace(/\/index\.mdx?$/, "").replace(/^\.\//, "");

      let permalink: string;
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
        date: post.frontMatter.date as BlogPostMetadata["date"],
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
    .filter((post): post is BlogPostMetadata => post !== null)
    .filter(
      (post) => (includeDrafts || !post.draft) && (includeUnlisted || !post.unlisted),
    );
}
