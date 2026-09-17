/**
 * Translation awareness — the one place every component asks "does this article exist in the
 * current locale?".
 *
 * The data comes from `plugins/translations-manifest-plugin`, which scans `i18n/<locale>/` at
 * build time. It has to be asked, never inferred: Docusaurus's i18n falls back to the English
 * source when a translation is missing, so a `/fr/blog/<slug>/` route existing proves nothing
 * about whether anyone translated it.
 *
 * Two consumers, with opposite needs:
 *
 *   - `<TranslationNotice>` / `<TranslationSwitch>` ask about ONE article;
 *   - the ~12 listing surfaces filter MANY posts, and must not show a French reader an entry
 *     that opens on English prose.
 *
 * See TODO 0119.
 */

import { usePluginData } from "@docusaurus/useGlobalData";

interface TranslationsManifest {
  /** locale -> slugs of the articles actually translated into it. */
  translations: Record<string, string[]>;
  currentLocale: string;
  defaultLocale: string;
  /**
   * slug -> reading time in minutes, measured on the translated file. Empty on the default
   * locale, where Docusaurus supplies the value itself. Optional: older global data lacks it.
   */
  readingTimes?: Record<string, number>;
}

export interface LocaleTranslationState {
  /** The locale this page is being rendered in. */
  currentLocale: string;
  /** The site's source-of-truth locale — articles always exist in it. */
  defaultLocale: string;
  /** True when rendering the default locale, where every article is "translated" by definition. */
  isDefaultLocale: boolean;
  /**
   * Whether the article is readable **here**, in the locale being rendered. Always true on the
   * default locale, where the article is the original.
   *
   * This answers "should this listing show it?", NOT "does a translation exist?" — see
   * `hasTranslationIn` for that. Conflating the two put a French flag on all 257 English
   * articles, pointing at pages that do not exist.
   */
  isTranslated: (slug: string) => boolean;
  /**
   * Whether a real translation of this article exists in a **specific** locale, independently
   * of the one being rendered. This is the question a language switcher asks.
   */
  hasTranslationIn: (locale: string, slug: string) => boolean;
  /**
   * Every non-default locale that really has this article, in declaration order.
   *
   * This is what lets a component offer the article in each available language without naming
   * one: adding `nl` means adding a row to `code.json`, not editing a condition.
   */
  otherLocalesWith: (slug: string) => string[];
  /** Keeps only the posts readable in the current locale. Identity on the default locale. */
  filterTranslated: <T>(posts: readonly T[], slugOf: (post: T) => string) => T[];
  /** How many articles are translated into the current locale. 0 on the default locale. */
  translatedCount: number;
  /**
   * Reading time, in minutes, of the translated article in the current locale — or undefined
   * when there is none (always undefined on the default locale: use Docusaurus's own value).
   */
  readingTimeOf: (slug: string) => number | undefined;
}

const EMPTY: TranslationsManifest = {
  translations: {},
  currentLocale: "en",
  defaultLocale: "en",
};

/** The slug part of a blog permalink — `/fr/blog/my-post/` -> `my-post`. */
export function slugFromPermalink(permalink: string): string {
  const match = permalink.match(/\/blog\/([^/]+)\/?$/);
  return match ? match[1] : "";
}

export function useTranslationState(): LocaleTranslationState {
  const data = (usePluginData("translations-manifest-plugin") as TranslationsManifest) ?? EMPTY;
  const { translations, currentLocale, defaultLocale, readingTimes = {} } = data;
  const isDefaultLocale = currentLocale === defaultLocale;
  const translated = new Set(translations[currentLocale] ?? []);

  // On the default locale every article is readable, so both helpers are no-ops. Keeping that
  // branch here rather than at each call site is what stops twelve components from each
  // reinventing it — and forgetting it once would hide the whole English blog.
  const isTranslated = (slug: string) => isDefaultLocale || translated.has(slug);

  function filterTranslated<T>(posts: readonly T[], slugOf: (post: T) => string): T[] {
    if (isDefaultLocale) return [...posts];
    return posts.filter((post) => translated.has(slugOf(post)));
  }

  const hasTranslationIn = (locale: string, slug: string) =>
    (translations[locale] ?? []).includes(slug);

  const otherLocalesWith = (slug: string) =>
    Object.keys(translations)
      .filter((locale) => locale !== defaultLocale)
      .filter((locale) => hasTranslationIn(locale, slug));

  return {
    currentLocale,
    defaultLocale,
    isDefaultLocale,
    isTranslated,
    hasTranslationIn,
    otherLocalesWith,
    filterTranslated,
    translatedCount: isDefaultLocale ? 0 : translated.size,
    readingTimeOf: (slug: string) => readingTimes[slug],
  };
}
