/**
 * Lazy-loads the full "Ask my blog" question corpus (see plugins/questions-index-plugin) as a
 * plain HTTP fetch against a static JSON asset, instead of `usePluginData` — that corpus is
 * ~470 KB uncompressed / ~60 KB gzip once the whole blog is covered, and `AskMyBlog` /
 * `CommandPalette`'s `?` mode are the only two places that need the *full*, cross-theme
 * corpus. `CommandPalette` in particular is mounted on every page (`src/theme/Layout`), so a
 * `usePluginData` reference there would have shipped that whole corpus in every page's JS —
 * see the plugin's own header comment for the measured impact.
 *
 * Fetched once and cached at module scope (shared between `AskMyBlog` and `CommandPalette`,
 * whichever opens search first) — same "fetch a static build-time asset" bridge
 * `CommandPalette/utils.ts` already uses for Pagefind.
 */

import type { QuestionEntry } from "./utils";

let inFlight: Promise<QuestionEntry[]> | null = null;

/** `questionsIndexUrl` should be the baseUrl-aware absolute path (see `useBaseUrl`/
 * `useBaseUrlUtils` — this module can't call that hook itself, it isn't a component). */
export function loadQuestionsIndex(questionsIndexUrl: string): Promise<QuestionEntry[]> {
  if (!inFlight) {
    inFlight = fetch(questionsIndexUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<QuestionEntry[]>;
      })
      .catch((err) => {
        // Let the next caller retry instead of caching a permanent failure — e.g. a reader
        // opening search before the dev server has finished its first build.
        inFlight = null;
        throw err;
      });
  }
  return inFlight;
}
