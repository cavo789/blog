import { useCallback } from "react";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import SERIES_FR_DATA from "@site/src/data/series.fr.js";

/**
 * seriesI18n.ts
 *
 * The one place that answers "how is this series called, here?".
 *
 * A series name is a **functional key**, not a label: `createSlug(name)` builds `/series/<slug>`,
 * and every article's front matter references the series by that exact English string. So the
 * English name is what travels through the code, and only the *displayed* text is swapped —
 * per locale, from a sibling data file keyed by that same English name (see `src/data/series.fr.js`).
 *
 * Adding a locale means adding a row to `LOCALIZED_SERIES`, never editing a component.
 *
 * Why a module and not `code.json`: these are content rows keyed by a domain identifier, exactly
 * like `tags.yml`, not UI chrome extracted by `yarn write-translations`.
 *
 * See TODO 0119.
 */

export interface SeriesLocalization {
  /** Displayed series name. */
  label: string;
  /** Displayed series description (series list cards + series page hero). */
  description: string;
}

type SeriesLocalizationTable = Record<string, SeriesLocalization | undefined>;

/** Keyed by locale, then by the series' ENGLISH name. The default locale is never listed. */
const LOCALIZED_SERIES: Record<string, SeriesLocalizationTable | undefined> = {
  fr: SERIES_FR_DATA as SeriesLocalizationTable,
};

/**
 * Resolve a series' displayed label/description for an explicit locale.
 *
 * Returns `undefined` on the default locale and for any series with no row in that locale's
 * table — callers fall back to the English `SERIES_DATA`, which is the source of truth.
 */
export function getSeriesLocalization(
  seriesName: string,
  currentLocale: string,
  defaultLocale: string,
): SeriesLocalization | undefined {
  if (currentLocale === defaultLocale) return undefined;
  return LOCALIZED_SERIES[currentLocale]?.[seriesName];
}

/**
 * Hook flavour of {@link getSeriesLocalization}, bound to the locale being rendered.
 *
 * @example
 * const localize = useSeriesLocalizer();
 * const label = localize("Discovering Docusaurus")?.label ?? "Discovering Docusaurus";
 */
export function useSeriesLocalizer(): (seriesName: string) => SeriesLocalization | undefined {
  const {
    i18n: { currentLocale, defaultLocale },
  } = useDocusaurusContext();

  // Referentially stable: callers pass it into `useMemo` dependency arrays (StructuredData,
  // SeriesCards), where a fresh closure per render would defeat the memo.
  return useCallback(
    (seriesName: string) => getSeriesLocalization(seriesName, currentLocale, defaultLocale),
    [currentLocale, defaultLocale],
  );
}
