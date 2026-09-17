import { useEffect } from "react";
import type { JSX } from "react";
import LocaleDropdownNavbarItem from "@theme-original/NavbarItem/LocaleDropdownNavbarItem";
import type LocaleDropdownNavbarItemType from "@theme/NavbarItem/LocaleDropdownNavbarItem";
import type { WrapperProps } from "@docusaurus/types";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

type Props = WrapperProps<typeof LocaleDropdownNavbarItemType>;

/**
 * Remembers an explicit language choice, so `static/.htaccess` stops redirecting.
 *
 * # Why this exists
 *
 * A francophone browser is sent from `/blog/x` to `/fr/blog/x` by a rewrite rule in
 * `static/.htaccess` (TODO 0124). Without a way to say "no, English please", that rule wins every
 * time: a reader who switches to English lands on `/blog/x`, clicks anything, and is bounced back
 * to `/fr/` — with the back button pushing them forward again. This cookie is the override the
 * rule looks for; the switch then costs one click, once.
 *
 * # What it must record — and what it must NOT
 *
 * A **choice**, never a state. Writing the rendered locale (from `src/theme/Root.js`, say) would
 * have the very first visit to `/` store `en` before the reader has decided anything, and the
 * redirect would never fire again for anyone. So the cookie is written here and only here: on a
 * click that leaves the current locale.
 *
 * # Why a document listener rather than a wrapping element
 *
 * The obvious `<span onClickCapture>` around the original component would insert a box into the
 * navbar's flex row, where the item styling (`navbar__item`, `dropdown`) sits on the child — and
 * the navbar's horizontal space is already saturated between 997px and 1260px. This wrapper
 * therefore renders the original untouched and listens on the document instead.
 *
 * The filter is narrow on purpose: inside `.navbar` (so the dropdown, in both its desktop and its
 * mobile-sidebar form), and only when the link actually leaves the current locale — which no other
 * navbar link does. Capture phase and a synchronous write, because the click that follows is a
 * full page load: these items are plain anchors, not router links.
 */

const COOKIE_NAME = "locale";
// A year. The point is that the reader states their preference once, not once a session.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

/** The locale a site-relative path belongs to — the default one when it carries no prefix. */
function localeOfPath(
  pathname: string,
  locales: string[],
  defaultLocale: string,
): string {
  const [firstSegment] = pathname.replace(/^\//, "").split("/");
  return locales.includes(firstSegment) ? firstSegment : defaultLocale;
}

export default function LocaleDropdownNavbarItemWrapper(props: Props): JSX.Element {
  const {
    i18n: { currentLocale, defaultLocale, locales },
  } = useDocusaurusContext();

  useEffect(() => {
    const rememberChoice = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest("a[href]");
      if (!link || !link.closest(".navbar")) return;

      // Same-origin only: an absolute URL to another site tells us nothing about a language
      // preference here, and `new URL` needs the base to resolve the relative ones anyway.
      const url = new URL(link.getAttribute("href") ?? "", window.location.href);
      if (url.origin !== window.location.origin) return;

      const chosen = localeOfPath(url.pathname, locales, defaultLocale);
      if (chosen === currentLocale) return;

      document.cookie = `${COOKIE_NAME}=${chosen}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    };

    document.addEventListener("click", rememberChoice, true);
    return () => document.removeEventListener("click", rememberChoice, true);
  }, [currentLocale, defaultLocale, locales]);

  return <LocaleDropdownNavbarItem {...props} />;
}
