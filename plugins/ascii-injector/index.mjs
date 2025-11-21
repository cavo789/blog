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

      let asciiContent;
      try {
        const raw = await fs.readFile(bannerPath, "utf8");
        asciiContent = `<!--\n${raw}\n-->\n\n`;
      } catch (err) {
        console.error(`[ascii-injector] Banner file missing: ${err.message}`);
        return;
      }

      const htmlFiles = await collectHtmlFiles(outDir);
      console.log(
        `[ascii-injector] Injecting banner into ${htmlFiles.length} HTML files...`
      );

      await Promise.allSettled(
        htmlFiles.map(async (filePath) => {
          const html = await fs.readFile(filePath, "utf8");
          if (html.trimStart().startsWith("<!--")) return;
          await fs.writeFile(filePath, asciiContent + html, "utf8");
        })
      );

      console.log("[ascii-injector] Injection complete ✅");
    },
  };
}
