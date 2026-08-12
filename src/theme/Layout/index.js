/**
 * Wrapping swizzle of `@theme/Layout` (TODO 0084): mounts the command palette and its
 * first-visit hint once per page render.
 *
 * `src/theme/Root.js` looked like the natural place for a "global" component, but
 * `ColorModeProvider` (needed for the palette's `>` mode "toggle theme" action) is mounted
 * by `@theme/Layout/Provider` and only wraps `<Layout>`'s own `children` — not siblings
 * rendered next to `<Layout>` itself, and not anything above it (`Root` included, see
 * `@docusaurus/theme-classic`'s `Layout/index.js` and `Layout/Provider/index.js`). So the
 * palette is injected as extra `children` here, inside `<Layout>`, rather than alongside it.
 * DOM placement doesn't matter — `CommandPalette` portals to `document.body` and the hint is
 * `position: fixed` — only the React context matters.
 */

import PropTypes from "prop-types";
import Layout from "@theme-original/Layout";
import CommandPalette from "@site/src/components/CommandPalette";
import CommandPaletteHint from "@site/src/components/CommandPalette/Hint";

export default function LayoutWrapper(props) {
  return (
    <Layout {...props}>
      {props.children}
      <CommandPalette />
      <CommandPaletteHint />
    </Layout>
  );
}
LayoutWrapper.propTypes = {
  children: PropTypes.node,
};
