import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata, type BlogPostMetadata } from "@site/src/components/Blog/utils/posts";

/**
 * series.ts
 *
 * Utility function to generate structured metadata for blog article series in Docusaurus.
 *
 * It groups blog posts by their `series` field, sorts them chronologically,
 * and returns a list of series objects containing permalink, image, title, and description.
 *
 * @example
 * const seriesList = generateSeriesList("/series/", "/img/default.webp");
 *
 * Each object in the returned array looks like:
 *   {
 *     seriesName: "Introduction to Docusaurus",
 *     permalink: "/series/introduction-to-docusaurus",
 *     image: "/img/docusaurus-intro.png",
 *     title: "Introduction to Docusaurus",
 *     counter: "5 published article(s) • 2 in progress"
 *   }
 */

export interface SeriesListEntry {
  seriesName: string;
  permalink: string;
  image: string;
  title: string;
  /** Human-readable count, e.g. "5 published article(s) • 2 in progress". */
  counter: string;
}

export function generateSeriesList(
  permalink = "/series/",
  defaultImage = "/img/default.webp",
): SeriesListEntry[] {
  const seriesMap = new Map<string, BlogPostMetadata[]>();

  // Array of blog post objects; drafts are needed here to compute the "in progress" counter
  const posts = getBlogMetadata({ includeDrafts: true });

  // Loop all posts, process the ones that are part of a serie and push the post entry in his own series
  posts.forEach((post) => {
    const seriesName = post.series;
    if (seriesName) {
      if (!seriesMap.has(seriesName)) {
        seriesMap.set(seriesName, []);
      }
      seriesMap.get(seriesName)!.push(post);
    }
  });

  // Process all series, process all posts and generate an array with the name of the serie, a link
  // to a page where we can access the articles, ... (see the @example in the intro docblock)
  return [...seriesMap.keys()].sort().map((seriesName) => {
    const posts = seriesMap.get(seriesName)!;
    const sortedPosts = [...posts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const publishedCount = posts.filter((post) => !post.draft).length;
    const draftCount = posts.filter((post) => post.draft).length;

    const counter =
      `${publishedCount} published article(s)` +
      (draftCount > 0 ? ` • ${draftCount} in progress` : "");

    return {
      seriesName,
      permalink: `${permalink}${createSlug(seriesName)}`,
      image: sortedPosts[0]?.image || defaultImage,
      title: seriesName,
      counter,
    };
  });
}
