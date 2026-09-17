/**
 * Tells a French reader how much of the blog exists in their language, and where the rest is.
 *
 * Shown on the French blog listing and at the top of the French homepage, both of which
 * deliberately hide untranslated articles. Without this the listing is a silent lie by omission:
 * a bilingual reader who switches to French sees a handful of posts, concludes the blog is thin,
 * and leaves — having missed 98% of it.
 *
 * Stating the ratio turns the limitation into navigation. The reader decides knowingly instead of
 * hitting a wall, and the English corpus is one click away. Author's call, 2026-09-16.
 *
 * Visual contract: this sits directly under the hero on the homepage, where every other block is
 * a bordered card on a centred grid. A full-bleed rule of small text read as a lint warning, so
 * it is now built from the same vocabulary as `HomeCards` — surface, 1px emphasis-200 border,
 * card radius, the same 0 2px 8px shadow — and the ratio it used to spell out in prose is also
 * drawn, as a progress bar. The prose is unchanged: a screen reader still gets the whole message
 * without the bar, which is why the bar is `aria-hidden`.
 *
 * Renders nothing on the default locale — there is no shortfall to report there — nor once the
 * locale is fully translated, which is the whole point: the block is self-retiring.
 */

import type { CSSProperties, JSX } from "react";
import clsx from "clsx";
import Translate from "@docusaurus/Translate";
import { useTranslationState } from "@site/src/components/Blog/utils/translations";
import { getBlogMetadata } from "@site/src/components/Blog/utils/posts";
import styles from "./styles.module.css";

interface Props {
  /**
   * `page` (default) centres the card on the 1100px content grid — what the homepage needs, so it
   * lines up with `HomeCards` and `MainTags` right below it. `listing` lets it span the container,
   * which is what the blog listing's own post grid does.
   */
  variant?: "page" | "listing";
}

export default function TranslationCoverage({ variant = "page" }: Props): JSX.Element | null {
  const { isDefaultLocale, translatedCount } = useTranslationState();

  if (isDefaultLocale) return null;

  // The FULL corpus, deliberately unfiltered: `useBlogMetadata()` would return only what this
  // locale can show, which is the very number we are comparing against.
  const total = getBlogMetadata().length;
  if (total === 0 || translatedCount === 0) return null;

  // Nothing left to warn about once the locale has caught up. Without this the banner would
  // read "257 of 257 articles are translated. The full blog is in English." — the ratio turns
  // meaningless and the second sentence actively sends a French reader away from a French blog
  // for no reason. The component is meant to disappear on the day it becomes redundant.
  if (translatedCount >= total) return null;

  // Rounded: this lands in the HTML as an inline custom property, and the raw ratio serialises
  // as `1.556420233463035%` — 16 digits of noise on every French page, for a 5px-tall bar.
  const percent = Math.round((translatedCount / total) * 10000) / 100;

  return (
    <section
      className={clsx(styles.coverage, variant === "listing" && styles.listing)}
      style={{ "--coverage-percent": `${percent}%` } as CSSProperties}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3c2.5 2.4 3.75 5.4 3.75 9S14.5 18.6 12 21c-2.5-2.4-3.75-5.4-3.75-9S9.5 5.4 12 3Z" />
      </svg>

      <div className={styles.body}>
        <p className={styles.title}>
          <Translate id="blog.translationCoverage.title">Translation in progress</Translate>
        </p>

        {/* Decoration only — the sentence below already carries both numbers. */}
        <div className={styles.track} aria-hidden="true">
          <span className={styles.fill} />
        </div>

        <p className={styles.text}>
          <Translate
            id="blog.translationCoverage.summary"
            values={{
              translated: <strong className={styles.count}>{translatedCount}</strong>,
              total,
            }}
          >
            {"{translated} of {total} articles are translated. The full blog is in English."}
          </Translate>
        </p>
      </div>

      {/*
        A plain <a>, not <Link>: this crosses locales on purpose. <Link to="/blog/"> rendered
        under `fr` resolves to /fr/blog/ — the very listing the reader is already looking at.
      */}
      <a
        className={clsx("button button--outline button--primary", styles.cta)}
        href="/blog/"
        hrefLang="en"
      >
        <Translate id="blog.translationCoverage.link" values={{ total }}>
          {"See all {total} articles"}
        </Translate>
        <span aria-hidden="true"> →</span>
      </a>
    </section>
  );
}
