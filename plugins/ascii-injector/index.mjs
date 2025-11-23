/**
 * Docusaurus Plugin: ascii-injector
 *
 * Purpose:
 * This plugin will prepend an ASCII art banner (from a specified text file)
 * in all generated HTML files as an HTML comment.
 *
 * Usage:
 * - Save this plugin as `plugins/ascii-injector/index.mjs`
 * - Create the file containing the ASCII art in `src/data/banner.txt`.
 * - Add the plugin to `docusaurus.config.js` plugins array.
 *
 * Please see readme.md for more details
 */

import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Recursively collect all HTML files in a given directory.
 */
async function collectHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.resolve(dir, entry.name);
      if (entry.isDirectory()) return collectHtmlFiles(fullPath);
      if (entry.isFile() && entry.name.endsWith(".html")) return [fullPath];
      return [];
    })
  );
  return files.flat();
}

/**
 * Docusaurus plugin that injects an ASCII art banner into all generated HTML files.
 *
 * @param {object} context - Docusaurus plugin context (unused).
 * @param {object} options - Plugin configuration options.
 * @param {string} options.bannerPath - Relative path (from siteDir) to the ASCII banner file.
 */
export default function asciiInjectorPlugin(context, options) {
  if (!options || typeof options.bannerPath !== "string") {
    throw new Error(
      "[ascii-injector] Missing required option: bannerPath (string)"
    );
  }

  return {
    name: "ascii-injector-plugin",

    async postBuild({ outDir, siteDir }) {
      const bannerPath = path.resolve(siteDir, options.bannerPath);

      let rawBanner;
      try {
        rawBanner = await fs.readFile(bannerPath, "utf8");
      } catch (err) {
        console.error(`[ascii-injector] Banner file missing: ${err.message}`);
        return;
      }

      const commentBanner = `<!--\n${rawBanner}\n-->\n\n`;

      const htmlFiles = await collectHtmlFiles(outDir);
      console.log(
        `[ascii-injector] Preparing to inject banner into ${htmlFiles.length} HTML files...`
      );

      const results = await Promise.allSettled(
        htmlFiles.map(async (filePath) => {
          try {
            const html = await fs.readFile(filePath, "utf8");

            // proceed to inject; files are always regenerated during build

            let updated;

            // Default: insert comment after <!doctype ...>
            const doctype = /<!doctype[^>]*>/i;
            if (doctype.test(html)) {
              updated = html.replace(doctype, (m) => `${m}\n${commentBanner}`);
            } else {
              // fallback to prepending comment
              updated = commentBanner + html;
            }

            await fs.writeFile(filePath, updated, "utf8");
            return { status: "ok", filePath };
          } catch (err) {
            return { status: "error", filePath, error: err };
          }
        })
      );

      const ok = results.filter(
        (r) => r.status === "fulfilled" && r.value && r.value.status === "ok"
      ).length;
      const skipped = results.filter(
        (r) =>
          r.status === "fulfilled" && r.value && r.value.status === "skipped"
      ).length;
      const failed =
        results.filter(
          (r) =>
            r.status === "fulfilled" && r.value && r.value.status === "error"
        ).length + results.filter((r) => r.status === "rejected").length;

      console.log(
        `[ascii-injector] Injection complete — ok: ${ok}, skipped: ${skipped}, failed: ${failed}`
      );
    },
  };
}
