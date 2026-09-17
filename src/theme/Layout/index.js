/**
 * Wrapping swizzle of `@theme/Layout` (TODO 0084): mounts the command palette and its
 * first-visit hint once per page render, plus the floating "Ask my blog" chat bubble
 * (AskMyBlogWidget) — a third entry point into the same question index, alongside Ctrl+K → `?`
 * and the standalone /faq page — and the PWA install hint (TODO 0090 follow-up), the only
 * visible sign a visitor has that the site is installable at all.
 *
 * ScrollToTopButton lives here too: when each page mounted it itself, it was forgotten on
 * every page that didn't opt in (/blog, /faq, /follow, the series and tag article lists). It
 * stays hidden until the reader scrolls past 300px, so short pages never show it.
 *
 * `src/theme/Root.js` looked like the natural place for "global" components, but
 * `ColorModeProvider` (needed for the palette's `>` mode "toggle theme" action) is mounted
 * by `@theme/Layout/Provider` and only wraps `<Layout>`'s own `children` — not siblings
 * rendered next to `<Layout>` itself, and not anything above it (`Root` included, see
 * `@docusaurus/theme-classic`'s `Layout/index.js` and `Layout/Provider/index.js`). So these are
 * injected as extra `children` here, inside `<Layout>`, rather than alongside it. DOM placement
 * doesn't matter — all five are `position: fixed` or portal to `document.body` — only the
 * React context matters, and only the palette actually needs it.
 */

import PropTypes from "prop-types";
import Layout from "@theme-original/Layout";
import CommandPalette from "@site/src/components/CommandPalette";
import CommandPaletteHint from "@site/src/components/CommandPalette/Hint";
import AskMyBlogWidget from "@site/src/components/AskMyBlogWidget";
import InstallPwaHint from "@site/src/components/InstallPwaHint";
import ScrollToTopButton from "@site/src/components/ScrollToTopButton";

export default function LayoutWrapper(props) {
  return (
    <Layout {...props}>
      {props.children}
      <CommandPalette />
      <CommandPaletteHint />
      <AskMyBlogWidget />
      <InstallPwaHint />
      <ScrollToTopButton />
    </Layout>
  );
}
LayoutWrapper.propTypes = {
  children: PropTypes.node,
};
