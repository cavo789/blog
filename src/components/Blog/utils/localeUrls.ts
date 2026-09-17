import { useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import { useBaseUrlUtils } from "@docusaurus/useBaseUrl";

/**
 * localeUrls.ts
 *
 * Resolves a site path in the **source** language, from a page rendered in another one.
 *
 * Needed by every surface that hands the reader a static file rather than a route: the feeds
 * (`/blog/rss.xml`, `/blog/tags/<t>/rss.xml`, `/series/<s>/rss.xml`) and the three whole-blog
 * formats on `/follow`. Those files are written per locale into that locale's build output, and
 * their paths are assembled by hand here — so they carry no locale prefix at all, and
 * `useBaseUrl()` only ever gives the CURRENT one.
 *
 * A bilingual reader wants both: the French feed for what is translated, the English one for
 * everything else. That is the author's call, 2026-09-17 — offered as a secondary line, never
 * in place of the current locale's own.
 *
 * The source-language base is derived by removing the segment Docusaurus appended to `baseUrl`,
 * not by hardcoding `"/"`, so it still holds if the site is ever served from a sub-path.
 */
export interface SourceLocaleUrls {
  /** True while rendering the source language, where the two resolutions are identical. */
  isDefaultLocale: boolean;
  /** The source language's own name for itself, e.g. `English` — for "also available in …". */
  sourceLabel: string;
  /** Its BCP-47 code, e.g. `en` — what `hreflang` takes; never the display label. */
  sourceLocale: string;
  /** `/blog/rss.xml` -> `/blog/rss.xml`, from a `/fr/` page. Site-relative. */
  sourceUrl: (path: string) => string;
  /** Same, absolute — hosted readers fetch server-side and need a full URL. */
  sourceAbsoluteUrl: (path: string) => string;
  /** The current locale's resolution, absolute. `/blog/rss.xml` -> `…/fr/blog/rss.xml`. */
  currentAbsoluteUrl: (path: string) => string;
}

export function useSourceLocaleUrls(): SourceLocaleUrls {
  const { siteConfig, i18n } = useDocusaurusContext();
  const { withBaseUrl } = useBaseUrlUtils();

  const { currentLocale, defaultLocale } = i18n;
  const isDefaultLocale = currentLocale === defaultLocale;
  const origin = siteConfig.url.replace(/\/$/, "");

  const sourceBase = isDefaultLocale
    ? siteConfig.baseUrl
    : siteConfig.baseUrl.replace(new RegExp(`${currentLocale}/$`), "");

  const sourceUrl = useCallback(
    (path: string) => `${sourceBase}${path.replace(/^\//, "")}`,
    [sourceBase],
  );

  return {
    isDefaultLocale,
    sourceLabel: i18n.localeConfigs?.[defaultLocale]?.label ?? defaultLocale,
    sourceLocale: defaultLocale,
    sourceUrl,
    sourceAbsoluteUrl: (path: string) => `${origin}${sourceUrl(path)}`,
    currentAbsoluteUrl: (path: string) => `${origin}${withBaseUrl(path)}`,
  };
}
