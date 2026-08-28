// Sidecar type declaration for the plain-data module series.js.
//
// `title` and `counter` are optional per-series display overrides: SeriesCards
// reads them as `SERIES_DATA_entry?.title ?? generatedValue`. No entry sets them
// today, but the consuming code is written to honour them, so they stay in the
// contract. Delete this file if series.js is ever renamed to series.ts.

export interface SeriesDataEntry {
  name: string;
  description: string;
  image: string;
  /** Accent colour as a hex string, e.g. "#38bdf8". */
  color: string;
  title?: string;
  counter?: string;
}

declare const SERIES_DATA: SeriesDataEntry[];
export default SERIES_DATA;
