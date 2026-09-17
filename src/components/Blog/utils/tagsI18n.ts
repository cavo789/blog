import { useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import EN_TAGS from "@site/blog/tags.yml";
import FR_TAGS from "@site/i18n/fr/docusaurus-plugin-content-blog/tags.yml";

/**
 * tagsI18n.ts
 *
 * The one place that answers "how is this tag called, here?".
 *
 * A tag key is a **functional identifier**, not a label: `docker` is what an article's front
 * matter carries and what `/blog/tags/docker` is built from. Only the *displayed* text is
 * swapped per locale — the key travels untranslated. Same split as
 * `src/components/Blog/utils/seriesI18n.ts`, and the same reason: translating the identifier
 * would break the URL.
 *
 * The French labels are read straight from `i18n/fr/docusaurus-plugin-content-blog/tags.yml`
 * rather than from a sibling `tags.fr.js`, because that file already exists and Docusaurus
 * itself renders `/fr/blog/tags/` from it. A second table would be a copy free to drift from
 * the one the reader actually lands on.
 *
 * This replaces two older answers, both wrong:
 *
 *   - `getTagLabel()` in `src/data/tags.js` reads only the English `blog/tags.yml`, so a French
 *     page's breadcrumb and JSON-LD both read "Component / UI";
 *   - `humanizeTag()` in `src/components/BlogGraph/utils.ts` (now deleted) ignored `tags.yml`
 *     entirely and just title-cased the key, which was wrong in **both** locales — "Ai" for
 *     "Artificial Intelligence (AI)", "Api" for "API", "Github" for "GitHub", "Fzf" for "fzf".
 *     31 of the 49 tags did not survive the round trip.
 *
 * Adding a locale means adding a row to `LOCALIZED_TAGS`, never editing a component.
 *
 * See TODO 0119.
 */

interface TagDefinition {
  label?: string;
  permalink?: string;
  description?: string;
}

type TagTable = Record<string, TagDefinition | undefined>;

/** The source of truth for every tag key, and the fallback for every locale. */
const DEFAULT_TAGS = EN_TAGS as TagTable;

/** Keyed by locale. The default locale is never listed — it *is* `DEFAULT_TAGS`. */
const LOCALIZED_TAGS: Record<string, TagTable | undefined> = {
  fr: FR_TAGS as TagTable,
};

/**
 * A tag's displayed label in an explicit locale.
 *
 * Resolution order — the localized label first, the English one second, the raw key last. The
 * English table is deliberately the fallback and never the override: an enrichment step that
 * overwrites an already-localized value is what published English series descriptions on
 * `/fr/series/` (see `.claude/rules/i18n-locale-safety.md`).
 *
 * @example getTagLabelIn("ai", "fr", "en") // "Intelligence artificielle (IA)"
 * @example getTagLabelIn("ai", "en", "en") // "Artificial Intelligence (AI)"
 */
export function getTagLabelIn(
  tagKey: string,
  currentLocale: string,
  defaultLocale: string,
): string {
  const localized =
    currentLocale === defaultLocale
      ? undefined
      : LOCALIZED_TAGS[currentLocale]?.[tagKey]?.label;

  return localized || DEFAULT_TAGS[tagKey]?.label || tagKey;
}

/**
 * Hook flavour of {@link getTagLabelIn}, bound to the locale being rendered.
 *
 * @example
 * const tagLabel = useTagLabel();
 * <span>{tagLabel(post.mainTag)}</span>
 */
export function useTagLabel(): (tagKey: string) => string {
  const {
    i18n: { currentLocale, defaultLocale },
  } = useDocusaurusContext();

  // Referentially stable, like `useSeriesLocalizer()`: callers pass it into `useMemo`/`useCallback`
  // dependency arrays, where a fresh closure per render would defeat the memo.
  return useCallback(
    (tagKey: string) => getTagLabelIn(tagKey, currentLocale, defaultLocale),
    [currentLocale, defaultLocale],
  );
}
