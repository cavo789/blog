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
 * ```ts
 * import { getBlogMetadata } from './getBlogMetadata';
 * const posts = getBlogMetadata();
 * ```
 *
 * ⚠️ Note:
 * This function is intended for use in static site generation or client-side rendering
 * where Webpack's `require.context` is available.
 */

export interface BlogPostMetadata {
  title: string;
  description?: string;
  image?: string;
  draft: boolean;
  unlisted: boolean;
  permalink: string;
  tags: string[];
  mainTag: string | null;
  authors: string[];
  date?: string;
  series: string | null;
}

const posts = require.context("../../../../blog", true, /\.mdx?$/);

export function getBlogMetadata(): BlogPostMetadata[] {
  return posts
    .keys()
    .map((key): BlogPostMetadata => {
      const post = posts(key) as { frontMatter: Record<string, unknown> };

      const dir = key.replace(/\/index\.mdx?$/, "").replace(/^\.\//, "");

      let permalink: string;
      if (typeof post.frontMatter.slug === "string") {
        permalink = post.frontMatter.slug.startsWith("/")
          ? post.frontMatter.slug
          : `/blog/${post.frontMatter.slug.replace(/^\//, "")}`;
      } else {
        permalink = `/blog/${dir}/`;
      }

      let imageUrl = post.frontMatter.image as string | undefined;
      if (imageUrl && imageUrl.startsWith("./")) {
        imageUrl = `/blog/${dir}/${imageUrl.replace("./", "")}`;
      }

      return {
        title: post.frontMatter.title as string,
        description: post.frontMatter.description as string | undefined,
        image: imageUrl,
        draft: Boolean(post.frontMatter.draft),
        unlisted: Boolean(post.frontMatter.unlisted),
        permalink,
        tags: (post.frontMatter.tags as string[]) || [],
        mainTag: (post.frontMatter.mainTag as string) || null,
        authors: (post.frontMatter.authors as string[]) || [],
        date: post.frontMatter.date as string | undefined,
        series: (post.frontMatter.series as string) || null,
      };
    })
    .filter(Boolean);
}
