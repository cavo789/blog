#!/usr/bin/env node
/**
 * Generates src/components/Blog/LogoIcon/iconBundle.generated.js, a static bundle of the
 * exact Iconify icons used by LogoIcon consumers (Snippet, about.mdx). Bundling avoids the
 * runtime API fetch that causes React hydration mismatches (SSR renders a placeholder <span>
 * while the client, once the fetch resolves, renders the real SVG).
 *
 * Run with `yarn icons:bundle` whenever an icon is added to/removed from Snippet's VARIANTS
 * map or another LogoIcon consumer.
 */
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { getIcons } from "@iconify/utils";

// Every "prefix:name" currently passed to <LogoIcon name="..." /> across the codebase
// (src/components/Snippet/index.tsx VARIANTS map + src/pages/about.mdx).
const ICON_NAMES = [
  "bi:filetype-php",
  "codicon:sync-ignored",
  "devicon-plain:yaml",
  "devicon:bash",
  "devicon:python",
  "file-icons:ms-dos",
  "file-icons:pascal",
  "file-icons:powershell",
  "fluent:document-vb-16-regular",
  "hugeicons:xml-01",
  "ix:json-document",
  "ix:log",
  "logos:apache",
  "logos:bluesky",
  "logos:docusaurus",
  "logos:github",
  "logos:javascript",
  "logos:mattermost",
  "logos:typescript-icon",
  "ph:empty",
  "ph:file-css",
  "ph:file-csv",
  "ph:file-html",
  "ph:file-ini",
  "ph:file-sql",
  "ph:file-svg",
  "ph:file-txt",
  "ph:git-diff",
  "ph:markdown-logo",
  "skill-icons:gherkin-light",
  "tabler:toml",
  "uil:docker",
  "vscode-icons:file-type-assembly",
  "vscode-icons:file-type-java",
  "vscode-icons:file-type-makefile",
];

// Group icon names by their Iconify collection prefix.
const namesByPrefix = new Map();
for (const iconName of ICON_NAMES) {
  const [prefix, name] = iconName.split(":");
  if (!namesByPrefix.has(prefix)) {
    namesByPrefix.set(prefix, []);
  }
  namesByPrefix.get(prefix).push(name);
}

const collections = {};
for (const [prefix, names] of namesByPrefix) {
  const { default: iconSet } = await import(`@iconify-json/${prefix}/icons.json`, {
    with: { type: "json" },
  });
  const subset = getIcons(iconSet, names);
  if (!subset) {
    throw new Error(
      `Could not extract icons ${names.join(", ")} from icon set "${prefix}"`,
    );
  }
  collections[prefix] = subset;
}

const outputPath = fileURLToPath(
  new URL("../src/components/Blog/LogoIcon/iconBundle.generated.js", import.meta.url),
);

const banner = `// GENERATED FILE — do not edit by hand.
// Regenerate with \`yarn icons:bundle\` after changing scripts/generate-icon-bundle.mjs.
`;

await writeFile(
  outputPath,
  `${banner}\nexport const iconCollections = ${JSON.stringify(collections)};\n`,
);

console.log(
  `Wrote ${ICON_NAMES.length} icons across ${namesByPrefix.size} collections to ${outputPath}`,
);
