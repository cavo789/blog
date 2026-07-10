/**
 * Docusaurus Plugin: sitemap-easter-egg
 *
 * Purpose:
 * Slips a small, valid XML comment right after the <urlset> opening tag of the
 * generated sitemap.xml, for the rare visitor who reads sitemaps for fun.
 *
 * A comment placed as the first child of <urlset> is valid XML and is ignored
 * by every sitemap parser/crawler, so it can't break indexing.
 *
 * Usage:
 * - Save this plugin as `plugins/sitemap-easter-egg/index.mjs`
 * - Add it to `docusaurus.config.js` plugins array.
 *
 * Note: Docusaurus runs every plugin's postBuild hook concurrently, so the
 * official sitemap plugin may not have written sitemap.xml yet when this
 * hook starts. We poll briefly for the file before giving up.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

const POLL_ATTEMPTS = 15;
const POLL_INTERVAL_MS = 300;

async function readWhenReady(filePath) {
  for (let attempt = 0; attempt < POLL_ATTEMPTS; attempt += 1) {
    try {
      return await fs.readFile(filePath, "utf8");
    } catch (err) {
      if (err.code !== "ENOENT" || attempt === POLL_ATTEMPTS - 1) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    }
  }
  return undefined;
}

export default function sitemapEasterEggPlugin() {
  return {
    name: "sitemap-easter-egg-plugin",

    async postBuild({ outDir, siteConfig }) {
      const sitemapPath = path.resolve(
        outDir,
        siteConfig?.presets?.[0]?.[1]?.sitemap?.filename || "sitemap.xml",
      );

      let xml;
      try {
        xml = await readWhenReady(sitemapPath);
      } catch (err) {
        console.warn(`[sitemap-easter-egg] sitemap.xml not found, skipping: ${err.message}`);
        return;
      }

      const comment =
        "<!-- Hi there! A meerkat sentry reviewed every URL in this sitemap. -->";

      if (xml.includes(comment)) {
        return;
      }

      const urlsetTag = /<urlset[^>]*>/i;
      if (!urlsetTag.test(xml)) {
        console.warn("[sitemap-easter-egg] <urlset> tag not found, skipping.");
        return;
      }

      const updated = xml.replace(urlsetTag, (m) => `${m}${comment}`);
      await fs.writeFile(sitemapPath, updated, "utf8");
      console.log("[sitemap-easter-egg] Comment injected into sitemap.xml");
    },
  };
}
