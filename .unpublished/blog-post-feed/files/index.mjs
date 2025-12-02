// plugins/blog-feed-plugin/index.mjs (FINAL VERSION: Full Content in RSS)

import { Feed } from "feed";
import fs from "fs-extra";
import path from "path";
import frontMatter from "front-matter";
import * as glob from "glob"; // Fixed import for ESM

/**
 * Determines the MIME type based on the file extension.
 * @param {string} url - The URL or path of the image.
 * @returns {string} The corresponding MIME type.
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
    default:
      return "application/octet-stream"; // Fallback
  }
}

/**
 * Custom Docusaurus Plugin to generate a custom RSS feed with dynamic <enclosure>
 * and full article content, by reading blog content directly from the file system.
 */
export default function customBlogFeedPlugin(context, options) {
  return {
    name: "blog-feed-plugin",

    async postBuild({ siteConfig, outDir, siteDir }) {
      // Assuming the blog source directory is 'blog/'
      const blogDir = path.join(siteDir, "blog");
      const blogBasePath = siteConfig.baseUrl + "blog";

      if (!fs.existsSync(blogDir)) {
        console.error(
          `[BlogFeedPlugin] Blog source directory not found: ${blogDir}`
        );
        return;
      }

      // 1. Load Blog Posts Metadata and Full Content Directly
      const postFiles = glob.sync("**/*.{md,mdx}", {
        cwd: blogDir,
        ignore: ["**/_archived/**"],
      });

      const feedItems = await Promise.all(
        postFiles.map(async (relativeFilePath) => {
          const fullPath = path.join(blogDir, relativeFilePath);
          const fileContent = await fs.readFile(fullPath, "utf8");
          const contentData = frontMatter(fileContent);

          // CRITICAL: Ensure 'body' (the full content) is destructured
          const { attributes: frontMatterAttributes, body } = contentData;
          const date =
            frontMatterAttributes.date || fs.statSync(fullPath).birthtime;

          const slug = relativeFilePath
            .replace(/\.(md|mdx)$/i, "")
            .replace(/[\/\\]/g, "/");
          const permalink = path.join(blogBasePath, slug);

          return {
            title: frontMatterAttributes.title || slug,
            description: frontMatterAttributes.description || "No description",
            date: date,
            permalink: permalink,
            frontMatter: frontMatterAttributes,
            fullContentBody: body, // Store the full content body as requested
          };
        })
      );

      // Filter unpublished and sort
      const publishedFeedItems = feedItems
        .filter((item) => item.frontMatter.published !== false)
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      if (publishedFeedItems.length === 0) {
        console.log(
          `[BlogFeedPlugin] No published posts found to generate feed.`
        );
        return;
      }

      // 2. Initialize the Feed Generator
      const feed = new Feed({
        title: siteConfig.title,
        description: siteConfig.tagline || "Personal blog feed",
        id: siteConfig.url,
        link: siteConfig.url + blogBasePath,
        language: siteConfig.i18n.defaultLocale || "en",
        updated: new Date(),
      });

      // 3. Add blog items with dynamic <enclosure> and full content
      publishedFeedItems.forEach((item) => {
        const postImageUrl = item.frontMatter?.image;
        const absoluteImageUrl = postImageUrl
          ? siteConfig.url + postImageUrl
          : null;

        let mimeType = null;
        if (absoluteImageUrl) {
          mimeType = getMimeTypeFromUrl(absoluteImageUrl);
        }

        // Injecting the image tag into the description for compatibility
        let descriptionWithImage = item.description;
        if (absoluteImageUrl) {
          descriptionWithImage =
            `<img src="${absoluteImageUrl}" alt="${item.title}" style="display:block; max-width:100%; height:auto;">` +
            item.description;
        }

        feed.addItem({
          title: item.title,
          id: item.permalink,
          link: siteConfig.url + item.permalink,
          description: descriptionWithImage,

          // FIX: Use the full raw content body for content:encoded
          content: item.fullContentBody,

          date: new Date(item.date),

          // Injection of the standard <enclosure> tag with dynamic MIME type
          ...(absoluteImageUrl &&
            mimeType && {
              enclosure: {
                url: absoluteImageUrl,
                type: mimeType,
                length: 0,
              },
            }),
        });
      });

      // 4. Write the RSS file
      const rssPath = path.join(outDir, "blog", "rss.xml");
      await fs.ensureDir(path.dirname(rssPath));
      await fs.writeFile(rssPath, feed.rss2());

      console.log(
        `[BlogFeedPlugin] Custom RSS feed successfully written to ${rssPath} (${publishedFeedItems.length} items).`
      );
    },
  };
}
