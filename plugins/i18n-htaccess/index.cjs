/**
 * @fileoverview
 * Docusaurus Plugin — i18n-htaccess
 *
 * Gives each non-default locale an `.htaccess` that points at ITS OWN pages.
 *
 * # The problem
 *
 * Docusaurus copies `static/` into every locale's output, so `build/fr/.htaccess` is a
 * byte-for-byte copy of `build/.htaccess`. Apache applies the nearest one, which means every
 * request under `/fr/` is governed by rules written for the English root:
 *
 *   - `ErrorDocument 404 /404.html` — a French reader who mistypes a URL gets the ENGLISH 404,
 *     although Docusaurus builds a French one at `build/fr/404.html`;
 *   - `RewriteRule ^(series|blog/tags)/[^/]+/?$ /index.html` — the SPA safety net for generated
 *     routes loads the ENGLISH app shell for a missing `/fr/series/<slug>`, whose router then
 *     runs with the wrong `baseUrl`. (A subdirectory `.htaccess` replaces its parent's rewrite
 *     rules, so the root's copy never gets a say.)
 *
 * # The fix
 *
 * In `postBuild`, for a non-default locale, rewrite those two targets to the locale's
 * `baseUrl`. `static/.htaccess` stays the single source of truth; the English build is untouched.
 *
 * The rewrite is checked, not hoped for: if either target is not found — someone reworded the
 * directive in `static/.htaccess` — the build FAILS. A silent miss would put the English 404
 * back in front of French readers with no signal at all, which is exactly how this bug lived
 * unnoticed in the first place.
 *
 * See TODO 0119.
 */

const fs = require("fs");
const path = require("path");

/** Each rewrite: what the root file says, and how to point it at the locale. */
const REWRITES = [
  {
    label: "ErrorDocument 404",
    pattern: /^(ErrorDocument[ \t]+404[ \t]+)\/404\.html[ \t]*$/m,
    replace: (base) => `$1${base}404.html`,
  },
  {
    label: "series/tags SPA fallback",
    pattern: /^([ \t]*RewriteRule[ \t]+\S+[ \t]+)\/index\.html([ \t]+\[L\])[ \t]*$/m,
    replace: (base) => `$1${base}index.html$2`,
  },
];

module.exports = function i18nHtaccess() {
  return {
    name: "i18n-htaccess",

    async postBuild({ outDir, siteConfig, i18n }) {
      if (i18n.currentLocale === i18n.defaultLocale) return;

      const file = path.join(outDir, ".htaccess");
      if (!fs.existsSync(file)) {
        throw new Error(
          `[i18n-htaccess] ${file} does not exist — static/.htaccess is expected to be copied into every locale.`,
        );
      }

      // `baseUrl` already carries the locale here ("/fr/"): Docusaurus sets it per locale build.
      const base = siteConfig.baseUrl;
      let content = fs.readFileSync(file, "utf-8");

      for (const { label, pattern, replace } of REWRITES) {
        if (!pattern.test(content)) {
          throw new Error(
            `[i18n-htaccess] "${label}" not found in ${file}. static/.htaccess changed shape; ` +
              "update plugins/i18n-htaccess/index.cjs so the /" +
              `${i18n.currentLocale}/ locale keeps its own error page and SPA fallback.`,
          );
        }
        content = content.replace(pattern, replace(base));
      }

      fs.writeFileSync(file, content, "utf-8");
      console.log(
        `[i18n-htaccess] ${path.relative(process.cwd(), file)} now targets ${base}`,
      );
    },
  };
};
