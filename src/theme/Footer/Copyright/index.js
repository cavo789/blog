/**
 * Wraps the theme's footer copyright to resolve a `{year}` token.
 *
 * The copyright is raw HTML set in `docusaurus.config.js`, but under a non-default locale it comes
 * from `i18n/<locale>/docusaurus-theme-classic/footer.json` instead — a file generated once by
 * `yarn write-translations` and never recomputed. A literal year in it stayed at the year the
 * translation was written while the English footer moved on. Both sources now carry `{year}`,
 * resolved here from `customFields.buildYear`: a build-time value, so the prerendered HTML and
 * the hydrated page cannot disagree.
 */
import React from "react";
import PropTypes from "prop-types";
import OriginalCopyright from "@theme-original/Footer/Copyright";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export default function FooterCopyright({ copyright, ...props }) {
  const { siteConfig } = useDocusaurusContext();
  const year = String(siteConfig.customFields?.buildYear ?? "");
  return (
    <OriginalCopyright
      {...props}
      copyright={
        typeof copyright === "string" ? copyright.replaceAll("{year}", year) : copyright
      }
    />
  );
}

FooterCopyright.propTypes = {
  copyright: PropTypes.string,
};
