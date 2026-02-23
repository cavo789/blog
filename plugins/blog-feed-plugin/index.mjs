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
 * import blogFeedPlugin from "./plugins/blog-feed-plugin/index.mjs";
 *
 * export default {
 *    // ...
 *    plugins: [
 *       [blogFeedPlugin, {
 *          maxItems: 20,
 *          includeContent: true,
 *          includeImages: true,
 *          stripSelectors: [
 *             ".custom-ads",
 *             ".share-buttons"
 *          ],
 *       }],
 *    ],
 * };
 *
 * Output:
 * - The RSS file is written to: <outDir>/blog/rss.xml (served at /blog/rss.xml).
 *
 * @license MIT — free to use, modify, and contribute.
 */

import { createRequire } from "module";
const require = createRequire(import.meta.url);

import yaml from "js-yaml";
import fs from "fs-extra";
import path from "path";
import frontMatter from "front-matter";
import * as glob from "glob";
import * as cheerio from "cheerio";

const { Feed } = require("feed");

// --- Utilities ---------------------------------------------------------------

/**
 * Join URL segments with POSIX semantics and ensure leading slash consistency.
 * @param {string[]} parts
 * @returns {string}
 */
function posixJoin(...parts) {
  const joined = path.posix.join(...parts);
  return joined.startsWith("/") ? joined : `/${joined}`;
}

/**
 * Resolve an absolute URL from site config components.
 * @param {string} siteUrl
 * @param {string} baseUrl
 * @param {string} relPath
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
    case ".avif":
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
  return (
    String(s)
      .replace(/\u00a0/g, " ")
      .replace(/\u200b/g, "")
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .trim()
  );
}

// --- Strip selectors ---------------------------------------------------------

const CRITICAL_STRIP_SELECTORS = ["header", "svg"];

const DEFAULT_STRIP_SELECTORS = [
  'h3:contains("Related posts")',
  "div.row:has(div.col.col--4)",
  "footer.docusaurus-mt-lg",
  ".blueSkyContainer",
  'p:contains("Loading comments")',
  ".scrollBtn_Pv66",
];

function getStripSelectors(userSelectors = []) {
  return [
    ...CRITICAL_STRIP_SELECTORS,
    ...DEFAULT_STRIP_SELECTORS,
    ...userSelectors,
  ];
}

// --- Article extraction ------------------------------------------------------

async function getArticleHtml(permalink, outDir, stripSelectors = []) {
  const htmlFilePath = path.join(outDir, permalink, "index.html");
  if (!fs.existsSync(htmlFilePath)) {
    console.warn(
      `[BlogFeedPlugin] HTML file not found for ${permalink} at: ${htmlFilePath}`,
    );
    return null;
  }

  const htmlContent = await fs.readFile(htmlFilePath, "utf8");
  const $ = cheerio.load(htmlContent);

  // Attempt to find the main article container using multiple fallbacks
  let articleContainer = $("article").first();
  if (!articleContainer.length) {
    articleContainer = $(".theme-doc-content, .theme-doc-markdown").first();
  }
  if (!articleContainer.length) {
    console.warn(
      `[BlogFeedPlugin] Could not find article container for ${permalink}.`,
    );
    return null;
  }

  // Remove elements based on strip selectors
  const selectorsToRemove = getStripSelectors(stripSelectors);
  selectorsToRemove.forEach((sel) => {
    articleContainer.find(sel).remove();
  });

  // Handle Docusaurus code snippet wrapper cleanup for cleaner RSS content
  articleContainer.find(".snippet_block_pySp").each((_, element) => {
    const $snippet = $(element);
    const $codeBlock = $snippet.find(".codeBlockContainer_Ckt0").first();
    if ($codeBlock.length) {
      $snippet.replaceWith($codeBlock);
    } else {
      $snippet.remove();
    }
  });

  const contentHtml = articleContainer.html();
  if (!contentHtml) return null;
  return cleanProblemChars(contentHtml);
}

// --- Slug computation --------------------------------------------------------

function computeSlug(attributes, relativeFilePath) {
  if (attributes.slug) {
    const normalized = String(attributes.slug).replace(/^\/|\/$/g, "");
    return normalized || null;
  }

  const slugWithDate = relativeFilePath.replace(/\.(md|mdx)$/i, "");
  const parts = slugWithDate.split(path.sep);
  let finalSlug;
  // Handle index file inside a folder (e.g., folder/index.md)
  if (parts[parts.length - 1].toLowerCase() === "index" && parts.length > 1) {
    finalSlug = parts[parts.length - 2];
  } else {
    finalSlug = parts[parts.length - 1];
  }
  if (!finalSlug) return null;

  // Normalize slug to lowercase and use hyphens
  return finalSlug.toLowerCase().replace(/_/g, "-");
}

// --- Plugin ------------------------------------------------------------------

export default function blogFeedPlugin(context, options = {}) {
  const {
    maxItems = 20,
    includeContent = true,
    includeImages = true,
    stripSelectors = [],
    ignorePatterns = ["**/_archived/**"],
  } = options;

  return {
    name: "blog-feed-plugin",

    async postBuild({ siteConfig, outDir, siteDir }) {
      try {
        console.log(`[BlogFeedPlugin] 🚀 Generating RSS feed...`);

        const blogDir = path.join(siteDir, "blog");
        const baseUrl = siteConfig.baseUrl || "/";
        const siteUrl = siteConfig.url?.replace(/\/+$/g, "") || "";
        const blogBasePath = posixJoin(baseUrl, "blog");

        if (!siteUrl) {
          console.error(
            `[BlogFeedPlugin] siteConfig.url is missing. Please set it to your site's origin.`,
          );
          return;
        }

        if (!fs.existsSync(blogDir)) {
          console.error(
            `[BlogFeedPlugin] Blog source directory not found: ${blogDir}`,
          );
          return;
        }

        // --- Load Authors ---
        const authorsFile = path.join(siteDir, "blog", "authors.yml");
        let authorsData = {};
        if (fs.existsSync(authorsFile)) {
          authorsData = yaml.load(fs.readFileSync(authorsFile, "utf8"));
          console.log(`[BlogFeedPlugin] Loaded authors from ${authorsFile}`);
        }

        const postFiles = glob.sync("**/*.{md,mdx}", {
          cwd: blogDir,
          ignore: ignorePatterns,
        });

        // Collect raw metadata from blog files
        const rawMetadataItems = await Promise.all(
          postFiles.map(async (relativeFilePath) => {
            const fullPath = path.join(blogDir, relativeFilePath);
            const fileContent = await fs.readFile(fullPath, "utf8");
            const contentData = frontMatter(fileContent);
            const { attributes } = contentData;

            const date = attributes.date || fs.statSync(fullPath).birthtime;
            const finalSlug = computeSlug(attributes, relativeFilePath);
            // Ignore files that map to "index" or have no slug
            if (!finalSlug || finalSlug === "index") return null;

            const permalink = posixJoin(blogBasePath, finalSlug);

            return {
              title: attributes.title || finalSlug,
              description: attributes.description || "No description",
              date,
              permalink,
              frontMatter: attributes,
              finalSlug,
            };
          }),
        );

        const metadataItems = rawMetadataItems.filter(Boolean);
        if (!metadataItems.length) {
          console.log(`[BlogFeedPlugin] No blog posts found.`);
          return;
        }

        // Collect full HTML content for each post (required for RSS body)
        const feedItemsWithContent = await Promise.all(
          metadataItems.map(async (item) => {
            const fullContentBody = await getArticleHtml(
              item.permalink,
              outDir,
              stripSelectors,
            );
            return { ...item, fullContentBody };
          }),
        );

        // Filter out drafts (published: false) and articles with no content body
        const publishedFeedItems = feedItemsWithContent
          .filter(
            (item) =>
              item.frontMatter.published !== false && item.fullContentBody,
          )
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        // Apply maxItems limit
        const finalFeedItems = publishedFeedItems.slice(
          0,
          Math.max(1, Number(maxItems)),
        );

        const feed = new Feed({
          title: siteConfig.title,
          description: siteConfig.tagline || "Personal blog feed",
          id: siteUrl,
          link: absoluteUrl(siteUrl, baseUrl, "blog"),
          language: siteConfig.i18n?.defaultLocale || "en-US",
          updated: new Date(),
        });

        // Loop items to populate feed
        finalFeedItems.forEach((item) => {
          // Resolve authors
          const authorKeys = Array.isArray(item.frontMatter.authors)
            ? item.frontMatter.authors
            : item.frontMatter.authors
              ? [item.frontMatter.authors]
              : [];

          const rssAuthors = authorKeys
            .map((key) => authorsData[key])
            .filter(Boolean)
            .map((a) => ({ name: a.name }));

          // Create the custom dc:creator XML string for later injection
          const creatorCDataString = rssAuthors
            .map(
              (a) =>
                `<dc:creator><![CDATA[${cleanProblemChars(
                  a.name,
                )}]]></dc:creator>`,
            )
            .join("");

          // Log to confirm data is ready
          if (rssAuthors.length > 0) {
            console.log(
              `[BlogFeedPlugin] ✍️ Post "${
                item.title
              }" - Found authors: ${rssAuthors.map((a) => a.name).join(", ")}`,
            );
          }

          // Handle enclosure image and description injection
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
                item.title,
              )}" style="display:block;max-width:100%;height:auto;">` +
              descriptionWithImage;
          }

          const itemLink = absoluteUrl(siteUrl, baseUrl, item.permalink);

          feed.addItem({
            title: cleanProblemChars(item.title),
            id: item.permalink,
            link: itemLink,
            category: Array.isArray(item.frontMatter.tags)
              ? item.frontMatter.tags.map((t) => ({ name: t }))
              : item.frontMatter.tags
                ? [{ name: item.frontMatter.tags }]
                : undefined,
            description: descriptionWithImage,
            content: includeContent
              ? cleanProblemChars(item.fullContentBody || "")
              : undefined,
            date: new Date(item.date),
            author: rssAuthors,
            // Add enclosure tag if image is present
            ...(includeImages &&
              absoluteImageUrl &&
              mimeType && {
                enclosure: {
                  url: absoluteImageUrl,
                  type: mimeType,
                  length: 0, // Length is often 0 for dynamically generated feeds
                },
              }),
            // Store the custom dc:creator XML string for manual injection later
            customRssData: {
              creatorCData: creatorCDataString,
            },
          });
        });

        const rssPath = path.join(outDir, "blog", "rss.xml");
        await fs.ensureDir(path.dirname(rssPath));

        let rssContent = feed.rss2();

        // --- CUSTOM XML MANIPULATION (Cheerio) ---
        // The 'feed' library does not natively support dc:creator with CData,
        // so we use Cheerio for post-generation injection.

        // 1. Load the content
        const $ = cheerio.load(rssContent, { xmlMode: true });

        // 2. Inject the namespace cleanly into the root <rss> element
        $("rss").attr("xmlns:dc", "http://purl.org/dc/elements/1.1/");

        // 3. Get ALL generated XML items
        // In XML mode, the path is typically rss > channel > item
        const xmlItems = $("channel > item");

        console.log(
          `[BlogFeedPlugin] 🔧 Injecting DC tags into ${xmlItems.length} items...`,
        );

        // 4. Iterate through our source array (finalFeedItems) by INDEX
        // Since 'feed' generates the XML in the same order, index 0 of the array = item 0 of the XML.
        finalFeedItems.forEach((sourceItem, index) => {
          // Get the corresponding XML element by its index
          const $xmlItem = xmlItems.eq(index);

          if ($xmlItem.length === 0) {
            console.error(
              `[BlogFeedPlugin] ❌ Error: XML Item index ${index} not found!`,
            );
            return;
          }

          const creatorData = sourceItem.customRssData?.creatorCData;

          if (creatorData) {
            // DEBUG LOG: Confirm the injection
            console.log(
              `[BlogFeedPlugin] 💉 Injecting for "${sourceItem.title}": ${creatorData}`,
            );

            // Injection
            $xmlItem.append(creatorData);
          }
        });

        // 5. Get the final XML content
        rssContent = $.xml();
        // -----------------------------------------

        // Apply a custom XML declaration and stylesheet reference for better browser rendering
        rssContent = rssContent.replace(
          /^<\?xml[^>]+\?>/,
          '<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="rss.xsl"?>',
        );

        await fs.writeFile(rssPath, rssContent);

        console.log(
          `[BlogFeedPlugin] ✅ RSS feed written to ${rssPath} (${finalFeedItems.length} items).`,
        );
      } catch (err) {
        console.error(`[BlogFeedPlugin] RSS feed generation failed:`, err);
      }
    },
  };
}
