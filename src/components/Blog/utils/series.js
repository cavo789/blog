import { createSlug } from "@site/src/components/Blog/utils/slug";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";

/**
 * 🎭 series.js
 *
 * Utility function to generate structured metadata for blog article series in Docusaurus.
 *
 * It groups blog posts by their `series` field, sorts them chronologically,
 * and returns a list of series objects containing permalink, image, title, and description.
 *
 * @function generateSeriesList
 * @param {string} [permalink] - The URL to the page to use for displaying the list of articvles of a specific series.
 * @param {string} [defaultImage="/img/default.jpg"] - Fallback image used when no image is provided.
 * @returns {Array<Object>} seriesList - Array of series metadata objects.
 *
 * @example
 * const seriesList = generateSeriesList("/series/", "/img/fallback.jpg");
 *
 * Each object in the returned array looks like:
 *   {
 *     seriesName: "Introduction to Docusaurus",
 *     permalink: "/series/introduction-to-docusaurus",
 *     image: "/img/docusaurus-intro.png",
 *     title: "Introduction to Docusaurus",
 *     description: "5 published article(s) • 2 in progress"
 *   }
 */

export function generateSeriesList(
  permalink = "/series/",
  defaultImage = "/img/default.jpg"
) {
  const seriesMap = {};

  // Array of blog post objects
  const posts = getBlogMetadata();

  // Loop all posts, process the ones that are part of a serie and push the post entry in his own series
  posts.forEach((post) => {
    const seriesName = post.series;
    if (seriesName) {
      if (!seriesMap[seriesName]) {
        seriesMap[seriesName] = [];
      }
      seriesMap[seriesName].push(post);
    }
  });

  // Process all series, process all posts and generate an array with the name of the serie, a link
  // to a page where we can access the articles, ... (see the @example in the intro docblock)
  return Object.keys(seriesMap)
    .sort()
    .map((seriesName) => {
      const posts = seriesMap[seriesName];
      const sortedPosts = posts.sort((a, b) => new Date(a.date) - new Date(b.date));

      const publishedCount = posts.filter((post) => !post.draft).length;
      const draftCount = posts.filter((post) => post.draft).length;

      const description =
        `${publishedCount} published article(s)` +
        (draftCount > 0 ? ` • ${draftCount} in progress` : '');

      return {
        seriesName,
        permalink: `${permalink}${createSlug(seriesName)}`,
        image: sortedPosts[0]?.image || defaultImage,
        title: seriesName,
        description,
      };
    });
}
