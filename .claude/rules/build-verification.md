---
paths:
  - "plugins/**/*.cjs"
  - "plugins/**/*.mjs"
  - "plugins/**/*.js"
  - "docusaurus.config.js"
  - "scripts/**/*.mjs"
---

# Build verification — always apply

A green build proves the code compiled. It proves **nothing** about what was written. Four
silent failures in one session, all with `exit=0`: an empty RSS feed, zero Markdown mirrors,
English content under French URLs, and pages rendering a stale locale.

- ✅ DO: verify the **artefact**, never the exit code — count the `<item>` in the feed, the files
  on disk, the `<loc>` in the sitemap, and `grep` the rendered HTML for the expected text.
- ✅ DO: write acceptance criteria that name a file and a number ("`build/fr/blog/rss.xml`
  contains exactly N `<item>`"), not "the build passes".
- ✅ DO: run `yarn clear` before concluding anything about a build. `rm -rf .docusaurus build`
  leaves `node_modules/.cache`, which re-serves the previous locale's MDX compilations and makes
  a correct setup look broken. This cost three false diagnoses in one session.
- ❌ DON'T: run two builds concurrently. A `yarn clear` in one wipes the output the other is
  writing — `ENOENT: rename '…/0.pack_'` or `ENOENT: …/build/fr/__server/assets/js/…` — and the
  failure looks exactly like a code bug. **Use `.claude/scripts/safe_build.sh <logfile>`**, which
  refuses to start when a `docusaurus build` is already running. This rule was written after the
  first occurrence and then broken twice more in the same session: on a long session, vigilance
  does not hold and a script that refuses does. Prefer a mechanism over a discipline — the same
  reason the translation validator exists instead of a longer prompt.
- ❌ DON'T: verify anything path-related with `docusaurus build --locale fr` alone. A **single**
  `--locale` flag makes Docusaurus deliberately set `baseUrl=/` instead of `/fr/`
  (`node_modules/@docusaurus/core/lib/commands/build/buildUtils.js`, for multi-domain deploys), so
  every href in the output comes out unprefixed and a correct site looks broken. Pass both:
  `--locale en --locale fr`. Content-only checks (is this string French?) are still valid with one.
- ✅ DO: verify against a running dev server with a **fully isolated** build rather than
  `safe_build.sh`, whose `yarn clear` does `rm -rf .docusaurus-dev` and wipes the cache of the
  server the author's browser is pointed at:
  `DOCUSAURUS_GENERATED_FILES_DIR_NAME=.docusaurus-verify npx docusaurus build --locale en --locale fr --out-dir build-verify`.
  A separate `--out-dir` alone is not enough — the generated-files dir must be separate too.
- ⚠️ NOTE: `safe_build.sh` refuses on `pgrep -f 'node_modules/\.bin/docusaurus build'`, which also
  matches any **shell whose command line contains that string** — including a
  `while pgrep …; do sleep 5; done` wait-loop, which therefore matches itself and never exits. A
  session that leaves such loops behind deadlocks every later build. Before believing the refusal,
  check for a real build: `pgrep -a -f 'node_modules/.bin/docusaurus' | grep -v 'bin/bash -c'`.
- ✅ DO: **instrument before hypothesising.** Print the three values that discriminate (the set
  size, a sample of each side, the computed key). Four successive hypotheses failed on one bug;
  three printed values found it immediately.
- ✅ DO: read the plugin's own data shape before keying on a field. Inspect `Object.keys(obj[0])`
  rather than assuming `slug`, `permalink` or `finalSlug`.
- ❌ DON'T conclude from a **grep that found nothing** in built HTML. The output is minified with
  unquoted attributes in an order you did not write, so a pattern like
  `<link rel=alternate type=application/rss\+xml` silently misses tags that are present. Twice in
  one session that produced a confident, wrong diagnosis — including an invented explanation for
  the absence. Read the live DOM instead: `page.evaluate(() => [...document.querySelectorAll(sel)])`.
  The same holds for a `grep` written into CI: the deploy smoke test first shipped with
  `grep -q 'lang="fr'`, which never matches the real `lang=fr-BE` — it would have failed every
  deploy. Test a CI pattern against a built file before committing it.
- ✅ DO: verify images by `naturalWidth`, not by requesting the URL — and **scroll the page first**.
  `img.complete && img.naturalWidth > 0` is the only check that catches a `200 text/html` SPA
  fallback, but a `loading="lazy"` image below the fold reports exactly the same thing while being
  perfectly fine. Scroll to the bottom, wait for network idle, then measure.
