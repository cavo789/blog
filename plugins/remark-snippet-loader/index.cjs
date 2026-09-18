const fs = require("fs");
const path = require("path");
const { visit } = require("unist-util-visit");

const extensionToLang = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  php: "php",
  sh: "bash",
  bash: "bash",
  // Prism has no "zsh" grammar: without these, a .zsh/.zshrc/.bashrc snippet
  // gets language-zsh / language-.zshrc and renders with zero highlighting.
  zsh: "bash",
  ".zshrc": "bash",
  ".bashrc": "bash",
  css: "css",
  html: "html",
  json: "json",
  yml: "yaml",
  yaml: "yaml",
  md: "markdown",
  dockerfile: "docker",
  ini: "ini",
  sql: "sql",
  xml: "xml",
  // Add more as needed
};

// Resolves a `source="…"` attribute the same way for every consumer: a
// `./`/`../`-prefixed path is relative to the file that carries the
// attribute, anything else is relative to the project root. Exported so the
// Markdown-export plugin (plugins/markdown-export-plugin/degrade.cjs) can
// inline the very same files without re-deriving this rule.
function resolveSourcePath(sourcePath, currentFileDir, projectRoot = process.cwd()) {
  if (sourcePath.startsWith("./") || sourcePath.startsWith("../")) {
    return path.resolve(currentFileDir, sourcePath);
  }
  return path.resolve(projectRoot, sourcePath);
}

// i18n/<locale>/docusaurus-plugin-content-<kind>/… — the locale of the file being compiled.
// It has to come from the file's own path and not from the `source` attribute, because
// remark-i18n-assets runs FIRST and has already rewritten that attribute to point back at the
// English article's folder. The vfile path is the only thing left that still says "fr".
const I18N_LOCALE_RE =
  /(^|[/\\])i18n[/\\]([^/\\]+)[/\\]docusaurus-plugin-content-(?:blog|pages)(?:[/\\]|$)/;

/** The locale a file is compiled for, or null for the English sources. */
function localeOf(filePath) {
  const match = String(filePath ?? "").match(I18N_LOCALE_RE);
  return match ? match[2] : null;
}

/**
 * The ELI5 sidecar to read for this locale, preferring the localized one.
 *
 * Falling back to the English sidecar is deliberate (TODO 0121): a reader of a technical blog
 * reads English, and showing nothing would cost them information for the sake of visual
 * uniformity. The fallback only fires on a gap — a failed generation, or a snippet added to the
 * article after it was translated.
 */
function eli5PathFor(absolutePath, locale) {
  if (locale) {
    const localized = `${absolutePath}.eli5.${locale}.json`;
    if (fs.existsSync(localized)) return localized;
  }
  const english = `${absolutePath}.eli5.json`;
  return fs.existsSync(english) ? english : null;
}

function snippetLoader() {
  return (tree, vfile) => {
    // The absolute path of the currently processed .mdx/blog/doc file
    const blogPostPath = vfile.path;
    // Which locale this compilation is for — drives ELI5 sidecar selection below.
    const locale = localeOf(blogPostPath);
    // The directory of the .mdx/blog/doc file
    const currentFileDir = path.dirname(blogPostPath);
    // The Docusaurus project root (where docusaurus.config.js is located)
    const projectRoot = process.cwd();

    visit(tree, "mdxJsxFlowElement", (node) => {
      if (node.name !== "Snippet" && node.name !== "Terminal") return;

      const sourceAttr = node.attributes.find((attr) => attr.name === "source");
      if (!sourceAttr || typeof sourceAttr.value !== "string") return;

      const sourcePath = sourceAttr.value;
      const absolutePath = resolveSourcePath(sourcePath, currentFileDir, projectRoot);

      // Terminal: inject the file content as a text child of the node.
      // This reproduces exactly what <Terminal>...inline content...</Terminal> does,
      // avoiding any issues with JSX attribute serialisation of multi-line strings.
      if (node.name === "Terminal") {
        // Intentionally not caught: a missing/unreadable source must fail the
        // build loudly, not degrade to a placeholder string that gets published.
        // See .todos/0106-migration-composants-js-vers-typescript.md — this is
        // exactly what silently broke 4 articles during the TS migration.
        let rawContent;
        try {
          rawContent = fs.readFileSync(absolutePath, "utf-8");
        } catch (err) {
          throw new Error(
            `<Terminal source="${sourcePath}"> in ${blogPostPath} could not read ${absolutePath}: ${err.message}`,
            { cause: err },
          );
        }
        // Replace self-closing node with one that has a single child holding the
        // file content. It must be an *expression* child, not a text child: MDX
        // applies JSX whitespace rules to text children, which trims the leading
        // spaces of every line and destroys the indentation of the terminal
        // output. An expression carrying a plain string literal is emitted
        // verbatim, so indentation survives.
        node.children = [
          {
            type: "mdxFlowExpression",
            value: JSON.stringify(rawContent),
            data: {
              estree: {
                type: "Program",
                sourceType: "module",
                comments: [],
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: { type: "Literal", value: rawContent },
                  },
                ],
              },
            },
          },
        ];
        return;
      }

      // Snippet: language detection, code injection, eli5.
      const filenameAttr = node.attributes.find((attr) => attr.name === "filename");

      // Reading the source itself is not caught: a missing/unreadable file must
      // fail the build loudly, not degrade to a "// Error loading..." comment
      // that gets published as if it were real code. See
      // .todos/0106-migration-composants-js-vers-typescript.md — this is
      // exactly what silently broke 4 articles during the TS migration.
      let code;
      try {
        code = fs.readFileSync(absolutePath, "utf-8");
      } catch (err) {
        throw new Error(
          `<Snippet source="${sourcePath}"> in ${blogPostPath} could not read ${absolutePath}: ${err.message}`,
          { cause: err },
        );
      }

      const pathForLang =
        filenameAttr && typeof filenameAttr.value === "string"
          ? filenameAttr.value
          : sourcePath;

      // Determine extension for language detection
      const ext =
        path.extname(pathForLang).slice(1).toLowerCase() ||
        path.basename(pathForLang).toLowerCase();

      let lang = extensionToLang[ext];
      if (!lang) {
        // Try to detect language based on the base file name (useful for Dockerfile, compose.yaml)
        const baseName = path.basename(pathForLang).toLowerCase();
        if (baseName === "dockerfile") {
          lang = "docker";
        } else if (baseName.includes("compose.yaml") || baseName.includes(".yml")) {
          lang = "yaml";
        } else {
          lang = ext; // Use the extension or base name as fallback
        }
      }

      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "code",
        value: code,
      });

      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "lang",
        value: lang,
      });

      // Auto-inject ELI5 explanations if a <source>.eli5.json file exists alongside the
      // source. This one stays a soft-fail: a missing/broken ELI5 cache is a content
      // nicety, not the code sample itself — losing it shouldn't fail the build.
      const eli5Path = eli5PathFor(absolutePath, locale);
      if (eli5Path) {
        try {
          const eli5Raw = fs.readFileSync(eli5Path, "utf-8");
          const eli5Data = JSON.parse(eli5Raw);
          if (eli5Data.explanations && typeof eli5Data.explanations === "object") {
            node.attributes.push({
              type: "mdxJsxAttribute",
              name: "eli5json",
              value: JSON.stringify(eli5Data.explanations),
            });
          }
          if (typeof eli5Data.summary === "string" && eli5Data.summary.trim()) {
            node.attributes.push({
              type: "mdxJsxAttribute",
              name: "eli5summary",
              value: eli5Data.summary.trim(),
            });
          }
        } catch (e) {
          console.warn(
            `Snippet plugin: could not parse ELI5 file ${eli5Path}:`,
            e.message,
          );
        }
      }
    });
  };
}

// Attached (not a named export) so the default-import used by
// docusaurus.config.js (`beforeDefaultRemarkPlugins: [remarkSnippetLoader, …]`)
// keeps seeing a plain callable plugin factory.
snippetLoader.resolveSourcePath = resolveSourcePath;

module.exports = snippetLoader;
