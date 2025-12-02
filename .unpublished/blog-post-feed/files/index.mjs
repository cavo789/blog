/**
 * @fileoverview Docusaurus Blog Feed Plugin (RSS 2.0)
 *
 * Generates an optimized RSS feed (blog/rss.xml) from the final HTML in the Docusaurus build output.
 * Extracts and cleans article content to avoid leaking UI elements, respects front matter metadata,
 * and includes optional <enclosure> image support with MIME type detection.
 *
 * Key features:
 * - Robust article extraction with selector fallbacks.
 * - Critical selectors always stripped (header, svg).
 * - Configurable cleaning via options.stripSelectors (user-defined).
 * - Properly normalized slugs and POSIX-safe permalinks.
 * - Absolute URLs for links and images (siteConfig.url + baseUrl + paths).
 * - Optional image injection to descriptions and enclosure tags.
 * - Safe character cleanup to prevent invalid XML characters.
 *
 * Options:
 * - maxItems?: number (default: 10)
 * - includeContent?: boolean (default: true)
 * - includeImages?: boolean (default: true)
 * - stripSelectors?: string[] (default: curated list, merged with critical)
 * - ignorePatterns?: string[]
 *
 * Usage:
 *   import blogFeedPlugin from "./plugins/blog-feed-plugin/index.mjs";
 *
 *   export default {
 *     // ...
 *     plugins: [
 *       [blogFeedPlugin, {
 *         maxItems: 20,
 *         includeContent: true,
 *         includeImages: true,
 *         stripSelectors: [
 *           ".custom-ads",
 *           ".share-buttons"
 *         ],
 *       }],
 *     ],
 *   };
 *
 * Output:
 * - The RSS file is written to: <outDir>/blog/rss.xml (served at /blog/rss.xml).
 *
 * @license MIT — free to use, modify, and contribute.
 */

import { Feed } from "feed";
import fs from "fs-extra";
import path from "path";
import frontMatter from "front-matter";
import * as glob from "glob";
import * as cheerio from "cheerio";

// --- Utilities ---------------------------------------------------------------

/**
 * Join URL segments with POSIX semantics and ensure leading slash consistency.
 * Avoids Windows backslashes and double slashes.
 * @param {string[]} parts
 * @returns {string}
 */
function posixJoin(...parts) {
  const joined = path.posix.join(...parts);
  return joined.startsWith("/") ? joined : `/${joined}`;
}

/**
 * Resolve an absolute URL from site config components.
 * @param {string} siteUrl - e.g., https://example.com
 * @param {string} baseUrl - e.g., /docs/ (may be "/")
 * @param {string} relPath - e.g., /blog/my-post
 * @returns {string}
 */
function absoluteUrl(siteUrl, baseUrl, relPath) {
  const base = baseUrl || "/";
  const rel = relPath || "/";
  const fullPath = posixJoin(base, rel);
  return `${siteUrl.replace(/\/+$/g, "")}${fullPath}`;
}

/**
 * Determine the MIME type from an image URL.
 * @param {string} url
 * @returns {string}
 */
function getMimeTypeFromUrl(url) {
  const ext = path.extname(url).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

/**
 * Remove control/non-printable characters that can break XML parsers.
 * @param {string} s
 * @returns {string}
 */
function cleanProblemChars(s) {
  return String(s)
    .replace(/\u00a0/g, " ")
    .replace(/\u200b/g, "")
    .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

// --- Strip selectors ---------------------------------------------------------

// Always-strip selectors (universal and safe to remove)
const CRITICAL_STRIP_SELECTORS = ["header", "svg"];

// Default optional selectors (safe baseline, can be overridden/extended)
const DEFAULT_STRIP_SELECTORS = [
  'h3:contains("Related posts")',
  "div.row:has(div.col.col--4)",
  "footer.docusaurus-mt-lg",
  ".blueSkyContainer",
  'p:contains("Loading comments")',
  ".scrollBtn_Pv66",
];

/**
 * Merge critical, default, and user-provided selectors.
 * @param {string[]} userSelectors
 * @returns {string[]}
 */
function getStripSelectors(userSelectors = []) {
  return [
    ...CRITICAL_STRIP_SELECTORS,
    ...DEFAULT_STRIP_SELECTORS,
    ...userSelectors,
  ];
}

// --- Article extraction ------------------------------------------------------

/**
 * Extract and clean the article HTML from the built page.
 * @param {string} permalink - site-relative permalink (e.g., /blog/my-post)
 * @param {string} outDir - Docusaurus build directory
 * @param {string[]} stripSelectors - selectors to remove (merged list)
 * @returns {Promise<string|null>}
 */
async function getArticleHtml(permalink, outDir, stripSelectors = []) {
  const htmlFilePath = path.join(outDir, permalink, "index.html");
  if (!fs.existsSync(htmlFilePath)) {
    console.warn(
      `[BlogFeedPlugin] HTML file not found for ${permalink} at: ${htmlFilePath}`
    );
    return null;
  }

  const htmlContent = await fs.readFile(htmlFilePath, "utf8");
  const $ = cheerio.load(htmlContent);

  // Try common article containers
  let articleContainer = $("article").first();
  if (!articleContainer.length) {
    articleContainer = $(".theme-doc-content, .theme-doc-markdown").first();
  }
  if (!articleContainer.length) {
    console.warn(
      `[BlogFeedPlugin] Could not find article container for ${permalink}.`
    );
    return null;
  }

  // Remove unwanted UI elements
  const selectorsToRemove = getStripSelectors(stripSelectors);
  selectorsToRemove.forEach((sel) => {
    articleContainer.find(sel).remove();
  });

  // Simplify snippet blocks: keep only code content
  articleContainer.find(".snippet_block_pySp").each((_, element) => {
    const $snippet = $(element);
    const $codeBlock = $snippet.find(".codeBlockContainer_Ckt0").first();
    if ($codeBlock.length) {
      $snippet.replaceWith($codeBlock);
    } else {
      $snippet.remove();
    }
  });

  // Extract and clean
  const contentHtml = articleContainer.html();
  if (!contentHtml) return null;
  return cleanProblemChars(contentHtml);
}

// --- Slug computation --------------------------------------------------------

/**
 * Build a normalized slug from front matter or file path.
 * Ensures lowercase and hyphenated if inferred.
 * @param {Record<string, any>} attributes
 * @param {string} relativeFilePath
 * @returns {string|null}
 */
function computeSlug(attributes, relativeFilePath) {
  if (attributes.slug) {
    const normalized = String(attributes.slug).replace(/^\/|\/$/g, "");
    return normalized || null;
  }

  const slugWithDate = relativeFilePath.replace(/\.(md|mdx)$/i, "");
  const parts = slugWithDate.split(path.sep);
  let finalSlug;
  if (parts[parts.length - 1].toLowerCase() === "index" && parts.length > 1) {
    finalSlug = parts[parts.length - 2];
  } else {
    finalSlug = parts[parts.length - 1];
  }
  if (!finalSlug) return null;

  // Normalize only when inferred
  return finalSlug.toLowerCase().replace(/_/g, "-");
}

// --- Plugin ------------------------------------------------------------------

export default function blogFeedPlugin(context, options = {}) {
  const {
    maxItems = 10,
    includeContent = true,
    includeImages = true,
    stripSelectors = [],
    ignorePatterns = ["**/_archived/**"],
  } = options;

  return {
    name: "blog-feed-plugin",

    async postBuild({ siteConfig, outDir, siteDir }) {
      try {
        console.log(`[BlogFeedPlugin] 🚀 Generating RSS feed…`);

        const blogDir = path.join(siteDir, "blog");
        const baseUrl = siteConfig.baseUrl || "/";
        const siteUrl = siteConfig.url?.replace(/\/+$/g, "") || "";
        const blogBasePath = posixJoin(baseUrl, "blog");

        if (!siteUrl) {
          console.error(
            `[BlogFeedPlugin] siteConfig.url is missing. Please set it to your site's origin (e.g., https://example.com).`
          );
          return;
        }

        if (!fs.existsSync(blogDir)) {
          console.error(
            `[BlogFeedPlugin] Blog source directory not found: ${blogDir}`
          );
          return;
        }

        const postFiles = glob.sync("**/*.{md,mdx}", {
          cwd: blogDir,
          ignore: ignorePatterns,
        });

        const rawMetadataItems = await Promise.all(
          postFiles.map(async (relativeFilePath) => {
            const fullPath = path.join(blogDir, relativeFilePath);
            const fileContent = await fs.readFile(fullPath, "utf8");
            const contentData = frontMatter(fileContent);
            const { attributes } = contentData;

            const date = attributes.date || fs.statSync(fullPath).birthtime;
            const finalSlug = computeSlug(attributes, relativeFilePath);
            if (!finalSlug || finalSlug === "index") return null;

            const permalink = posixJoin(blogBasePath, finalSlug);

            return {
              title: attributes.title || finalSlug,
              description: attributes.description || "No description",
              date,
              permalink, // site-relative path
              frontMatter: attributes,
              finalSlug,
            };
          })
        );

        const metadataItems = rawMetadataItems.filter(Boolean);
        if (!metadataItems.length) {
          console.log(`[BlogFeedPlugin] No blog posts found.`);
          return;
        }

        const feedItemsWithContent = await Promise.all(
          metadataItems.map(async (item) => {
            const fullContentBody = await getArticleHtml(
              item.permalink,
              outDir,
              stripSelectors
            );
            return { ...item, fullContentBody };
          })
        );

        const publishedFeedItems = feedItemsWithContent
          .filter(
            (item) =>
              item.frontMatter.published !== false && item.fullContentBody
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (!publishedFeedItems.length) {
          console.log(
            `[BlogFeedPlugin] No published posts with content found.`
          );
          return;
        }

        const finalFeedItems = publishedFeedItems.slice(
          0,
          Math.max(1, Number(maxItems))
        );

        const feed = new Feed({
          title: siteConfig.title,
          description: siteConfig.tagline || "Personal blog feed",
          id: siteUrl, // unique ID for the feed itself
          link: absoluteUrl(siteUrl, baseUrl, "blog"),
          language: siteConfig.i18n?.defaultLocale || "en-US",
          updated: new Date(),
        });

        finalFeedItems.forEach((item) => {
          const postImageUrl = item.frontMatter?.image;
          const absoluteImageUrl = postImageUrl
            ? absoluteUrl(siteUrl, baseUrl, postImageUrl)
            : null;
          const mimeType = absoluteImageUrl
            ? getMimeTypeFromUrl(absoluteImageUrl)
            : null;

          let descriptionWithImage = cleanProblemChars(item.description || "");
          if (includeImages && absoluteImageUrl) {
            descriptionWithImage =
              `<img src="${absoluteImageUrl}" alt="${cleanProblemChars(
                item.title
              )}" style="display:block;max-width:100%;height:auto;">` +
              descriptionWithImage;
          }

          const itemLink = absoluteUrl(siteUrl, baseUrl, item.permalink);

          feed.addItem({
            title: cleanProblemChars(item.title),
            id: item.permalink,
            link: itemLink,
            description: descriptionWithImage,
            content: includeContent
              ? cleanProblemChars(item.fullContentBody || "")
              : undefined,
            date: new Date(item.date),
            ...(includeImages &&
              absoluteImageUrl &&
              mimeType && {
                enclosure: {
                  url: absoluteImageUrl,
                  type: mimeType,
                  length: 0,
                },
              }),
          });
        });

        const rssPath = path.join(outDir, "blog", "rss.xml");
        await fs.ensureDir(path.dirname(rssPath));
        await fs.writeFile(rssPath, feed.rss2());

        console.log(
          `[BlogFeedPlugin] ✅ RSS feed written to ${rssPath} (${finalFeedItems.length} items).`
        );
      } catch (err) {
        console.error(`[BlogFeedPlugin] RSS feed generation failed:`, err);
      }
    },
  };
}
