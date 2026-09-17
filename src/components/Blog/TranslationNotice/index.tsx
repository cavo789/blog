/**
 * The line shown at the top of an article about its other language version.
 *
 * Rendered by the swizzled `BlogPostItem`, **never written into the translated Markdown file**.
 * Two reasons, and the second is the important one:
 *
 *   1. the wording can be changed everywhere at once instead of drifting across N files;
 *   2. the translator can never mangle it — it is not part of what gets sent to the model.
 *
 * Three states:
 *
 *   - DEFAULT locale, a translation exists -> a light offer line, "Cet article existe aussi en
 *     français". Written in French on the English page on purpose: it addresses the reader who
 *     can act on it, and a sentence is read where a flag has to be decoded. Nothing is shown
 *     when no translation exists — an offer that leads to English prose is a broken promise.
 *   - FRENCH URL, the article IS translated -> warn that it is machine-made, point at the
 *     English original.
 *   - FRENCH URL, the article is NOT translated -> say so plainly; the page below is English.
 *     (Docusaurus falls back to the English source, so both French cases live under the same
 *     `/fr/blog/<slug>/` URL — which is exactly why the two states must be told apart.)
 *
 * The offer sentence is deliberately NOT run through `<Translate>`: it is not a UI string in the
 * page's language, it is a message addressed to speakers of the other one. Adding a third locale
 * means adding its own sentence here, not translating this one.
 *
 * The links out use a plain `<a>`, never `<Link>`: `<Link to="/blog/x/">` rendered from the
 * `fr` locale is prefixed with the locale baseUrl and resolves to `/fr/blog/x/` — the very page
 * the reader is already on. A "read the English original" link that loops back on itself is
 * worse than no link at all.
 *
 * See TODO 0119.
 */

import type { JSX } from "react";
import Translate, { translate } from "@docusaurus/Translate";
import AlertBox from "@site/src/components/Blog/AlertBox";
import { useTranslationState, slugFromPermalink } from "@site/src/components/Blog/utils/translations";
import styles from "./styles.module.css";

/**
 * One offer component per locale the blog can be read in — the line shown on the DEFAULT-locale
 * page telling a reader that this article exists in their language.
 *
 * A map rather than a condition, because this is not "a string translated into N languages" but
 * **one sentence per available target locale**: with `nl` and `es` added, an English page would
 * show a French line, a Dutch one and a Spanish one, each written in its own language. Adding a
 * locale means adding a ROW here plus its two keys in `code.json` — no condition to edit, no
 * other file to touch.
 *
 * The `<Translate>` default messages below are deliberately NOT English: they only ever render on
 * the default locale, where the whole point is to address a reader of that other language.
 */
const OFFER_BY_LOCALE: Record<string, (props: { slug: string }) => JSX.Element> = {
  fr: ({ slug }) => (
    <div className={styles.offer}>
      <span className={styles.flag} aria-hidden="true">
        🇫🇷
      </span>
      <span>
        <Translate id="blog.translationNotice.alsoInFrench">
          Cet article existe aussi en français —
        </Translate>{" "}
        <a href={`/fr/blog/${slug}/`} hrefLang="fr">
          <Translate id="blog.translationNotice.alsoInFrench.link">
            lire la version française
          </Translate>
        </a>
        .
      </span>
    </div>
  ),
};

interface Props {
  /** The article's permalink in the current locale, e.g. `/fr/blog/my-post/`. */
  permalink: string;
}

export default function TranslationNotice({ permalink }: Props): JSX.Element | null {
  const { isDefaultLocale, isTranslated, otherLocalesWith } = useTranslationState();

  const slug = slugFromPermalink(permalink);
  if (!slug) return null;

  // `/blog/<slug>/` with no locale segment is the default-locale URL.
  const originalUrl = `/blog/${slug}/`;

  // On the English site the article is the original, so there is no warning to give — but a
  // French-speaking reader who landed here should be told a translation exists.
  //
  // The default message of this <Translate> is FRENCH, which looks like a mistake and is not:
  // the sentence only ever renders on the default (English) locale, where it offers the French
  // version to a French-speaking reader. It is not "a string to translate" but "one sentence per
  // available target locale" — with a third locale, this branch would render a French line AND a
  // German one, each in its own language. It still lives in code.json like every other string:
  // the per-target-locale shape justifies a key per locale, never hardcoding the text.
  if (isDefaultLocale) {
    const offers = otherLocalesWith(slug).filter((locale) => locale in OFFER_BY_LOCALE);
    if (offers.length === 0) return null;

    return (
      <>
        {offers.map((locale) => {
          const Offer = OFFER_BY_LOCALE[locale];
          return <Offer key={locale} slug={slug} />;
        })}
      </>
    );
  }

  // Mirror of the invitation above, on the translated page — and a NORMAL UI string, unlike it:
  // this sentence is in the page's own language, so it belongs in code.json like every other
  // label. It was briefly hardcoded in French here, by carrying over the reasoning that applies
  // to the OFFERS map but not to this. Author caught it, 2026-09-16.
  if (isTranslated(slug)) {
    return (
      <>
        <div className={styles.offer}>
          <span className={styles.flag} aria-hidden="true">
            🇬🇧
          </span>
          <span>
            <Translate id="blog.translationNotice.alsoInEnglish">
              This article is also available in English —
            </Translate>{" "}
            <a href={originalUrl} hrefLang="en">
              <Translate id="blog.translationNotice.alsoInEnglish.link">
                read the original version
              </Translate>
            </a>
            .
          </span>
        </div>
        <AlertBox
          variant="caution"
          title={translate({
            id: "blog.translationNotice.machine.title",
            message: "Machine translation",
            description: "Banner title on an AI-translated article",
          })}
        >
          <Translate id="blog.translationNotice.machine.body">
            This translation was produced by an AI. It may contain mistranslations or clumsy
            wording, especially on technical terms. When in doubt,
          </Translate>{" "}
          <a href={originalUrl}>
            <Translate id="blog.translationNotice.machine.link">
              refer to the English article
            </Translate>
          </a>{" "}
          <Translate id="blog.translationNotice.machine.tail">
            — it is the authoritative version.
          </Translate>
        </AlertBox>
      </>
    );
  }

  // Remaining case: a French URL whose article has no translation — Docusaurus served the
  // English source underneath. Say so plainly rather than let the reader wonder.
  return (
    <AlertBox
      variant="caution"
      title={translate({
        id: "blog.translationNotice.untranslated.title",
        message: "Not translated yet",
        description: "Banner title on a localized URL with no real translation",
      })}
    >
      <Translate id="blog.translationNotice.untranslated.body">
        This article has no translation yet. The text below is the English original.
      </Translate>{" "}
      <a href={originalUrl}>
        <Translate id="blog.translationNotice.untranslated.link">
          Open the English version
        </Translate>
      </a>
      .
    </AlertBox>
  );
}
