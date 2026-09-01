/**
 * @fileoverview plugins/markdown-export-plugin/degrade.cjs
 *
 * Turns a raw blog-post source (the .md/.mdx file exactly as the author typed it —
 * NOT the rendered HTML) into a plain, self-contained Markdown document: no React,
 * no JSX, no collapsed accordions. Used by plugins/markdown-export-plugin/index.cjs
 * to write the `/blog/<slug>.md` mirrors and the `/llms*.txt` indexes.
 *
 * THE ONE RULE THAT MUST NEVER BE BROKEN
 * ----------------------------------------------------------------------------
 * An unrecognised component never fails the export. Its wrapper is discarded and
 * its (already-degraded) children take its place in the tree. The component's
 * name is recorded in `unknownComponents` so the caller can warn once per build —
 * that warning, not this table, is what keeps the export at 100% coverage as new
 * components get added. See COMPONENT_RULES below for the components this file
 * currently understands explicitly.
 *
 * WHY require() WORKS HERE FOR ESM-ONLY PACKAGES
 * ----------------------------------------------------------------------------
 * `unified`/`remark-*` ship ESM-only. This file stays CommonJS (matching every
 * other plugin in plugins/) because Node 20.19+ (this project's own image is
 * node:20-bookworm-slim — see Dockerfile) resolves `require("esm-package")`
 * synchronously; each import below reads `.default` (or the package's own named
 * export, for `unified` itself) exactly as that interop exposes it. Verified
 * against the actual devcontainer runtime before writing this file.
 */

const fs = require("fs");
const path = require("path");
const { unified } = require("unified");
// createProcessor with format:"mdx" — NOT format:"md" — is load-bearing, and not
// the obvious choice. @mdx-js/mdx's own core.js only attaches remark-mdx (the JSX/
// expression tokenizer) when format !== "md"; under format:"md" a `<Snippet …/>`
// parses as an inert `html` text node instead of a component node, which is *exactly*
// what Docusaurus wants for its own hast-level raw-HTML passthrough, but is useless
// here — nothing would ever reach COMPONENT_RULES. format:"mdx" gives real
// mdxJsxFlowElement/mdxJsxTextElement nodes for every file regardless of its .md/.mdx
// extension (verified against this corpus's few .md files that even have top-level
// `import` statements — they still parse fine). Confirmed empirically while writing
// this file.
const { createProcessor } = require("@mdx-js/mdx");
// Used only by the small standalone `inlineParser` below (parseInlineMarkdown) —
// the main parser gets its own parsing from createProcessor, which attaches
// remark-parse internally.
const remarkParse = require("remark-parse").default;
const remarkStringify = require("remark-stringify").default;
const remarkFrontmatter = require("remark-frontmatter").default;
const remarkGfm = require("remark-gfm").default;
const remarkDirective = require("remark-directive").default;
// Docusaurus enables MDX-1-compat raw HTML comments by default (markdown.mdx1Compat.comments),
// which is what lets `<!-- truncate -->` (and any other `<!-- … -->`) live inside MDX content
// without a syntax error — plain remark-mdx does not parse that syntax at all. Same package
// @docusaurus/mdx-loader itself uses (see its processor.js), so this mirrors the real pipeline.
const remarkComment = require("@slorber/remark-comment").default;
// Both public @docusaurus/utils exports, applied as raw-text preprocessing on the
// source BEFORE parsing — exactly mirroring @docusaurus/mdx-loader's own
// preprocessContent() (see its preprocessor.js). Skipping either would reintroduce
// a crash format:"mdx" would otherwise hit on real corpus content:
// escapeMarkdownHeadingIds turns `## Title {#id}` into an escaped `\{#id}` so
// remark-mdx's expression tokenizer never tries (and fails) to parse `#id` as JS;
// admonitionTitleToDirectiveLabel turns Docusaurus's `:::tip Free text title`
// shorthand into remark-directive's `:::tip[Free text title]` label syntax.
const {
  escapeMarkdownHeadingIds,
  admonitionTitleToDirectiveLabel,
} = require("@docusaurus/utils");
const { resolveSourcePath } = require("../remark-snippet-loader/index.cjs");

// `:::tip Title text` (Docusaurus's own admonition syntax — 7 articles use it)
// needs one more thing standard remark-directive doesn't provide on its own: an AST
// pass that reads the bracket label (produced by admonitionTitleToDirectiveLabel
// above) back off into `data.hProperties` (Docusaurus's own admonitions plugin — an
// *internal* path, not published API, so this is wrapped defensively: if it ever
// moves in a future @docusaurus/core bump, admonitions degrade through the generic
// "unknown directive" fallback below instead of crashing the build).
let admonitionsPlugin = null;
try {
  admonitionsPlugin = require("@docusaurus/mdx-loader/lib/remark/admonitions").default;
} catch {
  admonitionsPlugin = null;
}
const ADMONITION_KEYWORDS = [
  "secondary",
  "info",
  "success",
  "danger",
  "note",
  "tip",
  "warning",
  "important",
  "caution",
];

// Small, deliberately narrower sibling of remark-snippet-loader's own table:
// only used to label fenced code blocks, so an unmapped extension merely means
// "no syntax highlighting" instead of a broken export.
const EXTENSION_TO_LANG = {
  js: "javascript",
  jsx: "jsx",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  php: "php",
  sh: "bash",
  bash: "bash",
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
};

function langForFilename(filename) {
  if (!filename) return "";
  // Some `filename=` attrs carry a human annotation after the real name, e.g.
  // "InvoiceProcessor.php (staged diff)" — kept verbatim in the displayed
  // title, but path.extname() on the raw string would return ".php (staged
  // diff)" (everything after the *last* dot), which then leaks a space into
  // the fenced code block's language info-string. Strip the annotation first.
  const withoutAnnotation = filename.replace(/\s*\(.*\)\s*$/, "").trim();
  const base = path.basename(withoutAnnotation).toLowerCase();
  if (base === "dockerfile") return "docker";
  const ext = path.extname(base).slice(1);
  return EXTENSION_TO_LANG[ext] || EXTENSION_TO_LANG[base] || ext || "";
}

// ---------------------------------------------------------------------------
// Reading a `source="…"` file — mirrors remark-snippet-loader's own fallback:
// never throw, always return text (an error comment at worst).
// ---------------------------------------------------------------------------

function readSourceFile(sourcePath, ctx) {
  const absolutePath = resolveSourcePath(sourcePath, ctx.currentFileDir, ctx.projectRoot);
  try {
    return fs.readFileSync(absolutePath, "utf-8");
  } catch (err) {
    return `Error loading source file: ${sourcePath} (${err.code || err.message})`;
  }
}

// ---------------------------------------------------------------------------
// Safe literal evaluation of JSX expression attributes (`prop={…}`).
//
// MDX attaches a full acorn/acorn-jsx estree to `mdxJsxAttributeValueExpression`
// attributes. We walk it for the shapes that actually appear in this corpus —
// string/number/boolean/array/object literals, template literals with no
// interpolation, `require("./x").default` (StepsCard, ShortcutList, Image,
// DownloadButton), and small JSX fragments (ShortcutList's `desc`). Anything
// else (a variable reference, a function call we don't recognise) resolves to
// `undefined` rather than guessing — callers must treat that as "no value".
// ---------------------------------------------------------------------------

function literalFromEstree(node) {
  if (!node) return undefined;

  switch (node.type) {
    case "Literal":
      return node.value;

    case "TemplateLiteral":
      // Only static templates (no ${…}) can be read without a real JS
      // evaluator — exactly the `installOutput={`\nfoo\n`}` pattern used by
      // <Prerequisite>.
      if (node.expressions.length === 0) {
        return node.quasis.map((q) => q.value.cooked).join("");
      }
      return undefined;

    case "ArrayExpression":
      return node.elements.map((el) => (el ? literalFromEstree(el) : undefined));

    case "ObjectExpression": {
      const obj = {};
      for (const prop of node.properties) {
        if (prop.type !== "Property") continue;
        const key = prop.key.type === "Identifier" ? prop.key.name : prop.key.value;
        obj[key] = literalFromEstree(prop.value);
      }
      return obj;
    }

    case "UnaryExpression":
      if (node.operator === "-") {
        const value = literalFromEstree(node.argument);
        return typeof value === "number" ? -value : undefined;
      }
      return undefined;

    // require("./file.ext") or require("./file.ext").default — the pattern
    // used to pass a webpack-imported asset (Image, DownloadButton). We can't
    // know the final fingerprinted build URL from source alone, so we surface
    // the raw relative path and let the caller decide how to degrade it.
    case "CallExpression":
      if (node.callee?.type === "Identifier" && node.callee.name === "require") {
        const arg = node.arguments[0];
        if (arg?.type === "Literal" && typeof arg.value === "string") {
          return { __requirePath: arg.value };
        }
      }
      return undefined;

    case "MemberExpression": {
      const objectValue = literalFromEstree(node.object);
      if (
        objectValue &&
        typeof objectValue === "object" &&
        "__requirePath" in objectValue
      ) {
        // `.default` (or any property) on a require() result — the path is
        // the only part we can use, so keep it as-is.
        return objectValue;
      }
      return undefined;
    }

    case "JSXFragment":
    case "JSXElement":
      return { __jsxText: jsxToText(node) };

    default:
      return undefined;
  }
}

// Best-effort flattening of small JSX fragments embedded in an expression
// attribute (e.g. ShortcutList's `desc: <>Press <kbd>Enter</kbd></>`). This is
// NOT the mdast pipeline — it walks acorn-jsx estree nodes, a different shape.
// Deliberately returns *plain* text, with formatting tags unwrapped rather than
// translated to Markdown syntax (`` `…` ``/`**…**`): the result lands in a
// single mdast `text` node (see shortcutDescToText), and remark-stringify would
// correctly escape any literal backtick/asterisk it contains right back into
// `\`…\`` — i.e. synthesizing Markdown syntax here just to have it escaped away
// a moment later. Losing kbd/bold emphasis in this one nested-JSX-in-attribute
// shape (a single ShortcutList article, at the time of writing) is an accepted,
// minor simplification — the words themselves are never lost.
function jsxToText(node) {
  if (!node) return "";
  switch (node.type) {
    case "JSXFragment":
      return node.children.map(jsxToText).join("");
    case "JSXElement": {
      const tag = (node.openingElement?.name?.name || "").toLowerCase();
      const inner = node.children.map(jsxToText).join("");
      if (tag === "br") return "\n";
      return inner;
    }
    case "JSXText":
      return node.value;
    case "JSXExpressionContainer": {
      const value = literalFromEstree(node.expression);
      return typeof value === "string" ? value : "";
    }
    default:
      return "";
  }
}

function degradeAttrValue(attr) {
  if (attr.value === null) return true; // boolean shorthand: `typewriter`
  if (typeof attr.value === "string") return attr.value;
  if (attr.value && attr.value.type === "mdxJsxAttributeValueExpression") {
    const program = attr.value.data?.estree?.body?.[0];
    if (program?.type === "ExpressionStatement") {
      return literalFromEstree(program.expression);
    }
  }
  return undefined;
}

function getAttrs(node) {
  const attrs = {};
  for (const attr of node.attributes || []) {
    if (attr.type !== "mdxJsxAttribute") continue; // skips {...spread} attrs
    attrs[attr.name] = degradeAttrValue(attr);
  }
  return attrs;
}

// ---------------------------------------------------------------------------
// mdast → plain text (used only where a component needs flat text: Terminal's
// children, Prerequisite already gets its text from attrs). Block siblings
// (paragraphs) join on "\n"; a node's own children concatenate directly —
// good enough for the prose/terminal-output shapes this corpus actually uses.
// ---------------------------------------------------------------------------

function mdastToText(node) {
  if (node == null) return "";
  if (Array.isArray(node)) return node.map(mdastToText).join("\n");
  if (node.type === "break") return "\n";
  if (typeof node.value === "string") return node.value;
  if (node.children) return node.children.map(mdastToText).join("");
  return "";
}

// ---------------------------------------------------------------------------
// Reader-adjustable values — `%%name=default%%`, written
// directly inside `<Terminal>`/`<Snippet>` text by the author (`%%`, not
// `{{`, because a bare `{` inside literal MDX children opens a JS expression
// — see src/components/Vars/substitute.js for the full rationale; this is
// that same live-component contract, resolved at export time instead of
// render time). `=`, not `:`, separates the name from its default: this
// file's own `remarkDirective` (below, for `:::tip` admonitions) treats any
// bare `word:word` text as a false-positive inline directive — confirmed
// empirically, a colon-separated marker logged a spurious "unknown
// directive" warning for every occurrence. The default lives in the marker
// itself, so resolving it here needs no lookup against a `<Vars>` node
// elsewhere in the tree: a plain regex swap. Without this, the exported
// `.md`/`llms.txt` would show the literal marker — invalid input for a
// reader or an LLM to copy-paste.
// ---------------------------------------------------------------------------

const VAR_MARKER_RE = /%%(\w+)=([^%]*)%%/g;

function resolveVarMarkers(text) {
  if (typeof text !== "string") return text;
  return text.replace(VAR_MARKER_RE, (_match, _name, defaultValue) => defaultValue);
}

// ---------------------------------------------------------------------------
// String attributes that carry their own inline Markdown, not literal text —
// AlertBox/Details `title`/`label` routinely embed `` `code` `` (over 30 uses
// across this corpus), and StepsCard's `steps[].content` is markdown by
// contract (the live component runs it through its own parseMarkdown()).
// Wrapping such a string in a single text node, as everything else in this
// file does for genuinely literal text, makes remark-stringify escape the
// author's `` ` ``/`*` right back into `\`…\`` — this parses the string as its
// own tiny Markdown document and lifts out the real inline nodes instead.
// ---------------------------------------------------------------------------

const inlineParser = unified().use(remarkParse).use(remarkGfm);

function parseInlineMarkdown(text) {
  if (typeof text !== "string" || text === "") return [textNode("")];
  const tree = inlineParser.parse(text);
  const paragraphs = (tree.children || []).filter((node) => node.type === "paragraph");
  if (paragraphs.length === 0) return [textNode(text)];
  return paragraphs.flatMap((p) => p.children);
}

// ---------------------------------------------------------------------------
// Custom-component degradation table.
// Each handler receives the JSX node (children already recursively degraded
// into plain mdast) and the shared ctx, and returns an array of mdast nodes.
// ---------------------------------------------------------------------------

const ALERT_LABELS = {
  info: "Information",
  note: "Note",
  tip: "Tip",
  caution: "Caution",
  important: "Important",
  highlyImportant: "Highly Important",
  coreConcept: "Core Concept",
  danger: "Danger",
};

function textNode(value) {
  return { type: "text", value };
}
function paragraph(children) {
  return { type: "paragraph", children };
}
function strongText(value) {
  return { type: "strong", children: [textNode(value)] };
}
// Same as strongText, but for an author-written string that may itself
// contain Markdown syntax (AlertBox/Details title & label, StepsCard title) —
// see parseInlineMarkdown's doc comment.
function strongParsed(value) {
  return { type: "strong", children: parseInlineMarkdown(value) };
}
function codeBlock(value, lang) {
  return { type: "code", lang: lang || null, value: value.replace(/\n$/, "") };
}

const COMPONENT_RULES = {
  // --- Content-bearing leaves --------------------------------------------
  Link(node) {
    const attrs = getAttrs(node);
    const url = typeof attrs.to === "string" ? attrs.to : attrs.href || "";
    return [{ type: "link", url, children: node.children || [] }];
  },

  ConnectionInfo(node) {
    const attrs = getAttrs(node);
    const items = Array.isArray(attrs.items) ? attrs.items : [];
    if (items.length === 0) return [];
    const out = [];
    if (typeof attrs.title === "string") out.push(paragraph([strongParsed(attrs.title)]));
    out.push({
      type: "table",
      align: [null, null],
      children: [
        tableRow(["Label", "Value"]),
        ...items.map((item) =>
          tableRow([
            item?.label || "",
            [{ type: "inlineCode", value: item?.value || "" }],
          ]),
        ),
      ],
    });
    return out;
  },

  // Props-only (no children) — a small "Quick Jump: A | B" line, links resolved
  // against the same in-page anchors the headings below stringify to, so they
  // stay meaningful in the flat mirror.
  QuickJump(node) {
    const attrs = getAttrs(node);
    const links = Array.isArray(attrs.links) ? attrs.links : [];
    if (links.length === 0) return [];
    const title = typeof attrs.title === "string" ? attrs.title : "Quick Jump";
    const linkNodes = links.flatMap((link, index) => {
      const item = {
        type: "link",
        url: typeof link?.to === "string" ? link.to : "",
        children: [textNode(typeof link?.label === "string" ? link.label : "")],
      };
      return index === 0 ? [item] : [textNode(" | "), item];
    });
    return [paragraph([strongText(`${title}:`), textNode(" "), ...linkNodes])];
  },

  Snippet(node, ctx) {
    const attrs = getAttrs(node);
    let code;
    let lang;
    if (typeof attrs.source === "string") {
      code = readSourceFile(attrs.source, ctx);
      lang = langForFilename(attrs.filename || attrs.source);
    } else if (typeof attrs.code === "string") {
      code = attrs.code;
      lang = langForFilename(attrs.filename) || attrs.lang || "";
    } else {
      code = mdastToText(node.children);
      lang = langForFilename(attrs.filename) || "";
    }
    const title =
      typeof attrs.filename === "string" ? [paragraph([strongText(attrs.filename)])] : [];
    return [...title, codeBlock(resolveVarMarkers(code), lang)];
  },

  Terminal(node, ctx) {
    const attrs = getAttrs(node);
    const code =
      typeof attrs.source === "string"
        ? readSourceFile(attrs.source, ctx)
        : mdastToText(node.children);
    return [codeBlock(resolveVarMarkers(code), "bash")];
  },

  // Reader-values bar — UI only, nothing for the plain-Markdown
  // mirror to show. The values it declares are already the same defaults
  // baked into every `%%name=default%%` marker (resolveVarMarkers above), so
  // dropping this node loses no information.
  Vars() {
    return [];
  },

  // Inline prose sibling of the marker (see the VAR_MARKER_RE comment above):
  // `<Var name="…">default</Var>` inside a paragraph. children is already
  // the literal default text — keep it, drop the wrapper.
  Var(node) {
    return node.children || [];
  },

  // `<Code>text<Var name="…">default</Var>text</Code>` (see Code.js) — one
  // code span mixing literal text and a `<Var>`. The tree walk is bottom-up
  // (see transformChildren below), so `node.children` here already has each
  // nested `<Var>` resolved to its plain default text; flatten it into one
  // `inlineCode`, same as a literal `<code>`/`<kbd>` HTML tag two rules up.
  Code(node) {
    return [{ type: "inlineCode", value: mdastToText(node.children) }];
  },

  // --- Wrappers whose children already carry the content ------------------
  TLDR(node) {
    return [paragraph([strongText("TL;DR")]), ...(node.children || [])];
  },

  AlertBox(node) {
    const attrs = getAttrs(node);
    // attrs.title is author-written and routinely embeds `` `code` `` (30+
    // uses in this corpus) — parse it, then append the literal ":" as its own
    // trailing text node rather than folding it into a string first.
    const labelNodes =
      typeof attrs.title === "string"
        ? [...parseInlineMarkdown(attrs.title), textNode(":")]
        : [textNode(`${ALERT_LABELS[attrs.variant] || ALERT_LABELS.info}:`)];
    return [
      {
        type: "blockquote",
        children: [
          paragraph([{ type: "strong", children: labelNodes }]),
          ...(node.children || []),
        ],
      },
    ];
  },

  Details(node) {
    const attrs = getAttrs(node);
    const summary = typeof attrs.label === "string" ? attrs.label : "Details";
    return [paragraph([strongParsed(summary)]), ...(node.children || [])];
  },

  Prerequisite(node) {
    const attrs = getAttrs(node);
    const lines = [paragraph([textNode(`Prerequisite: ${attrs.name || ""}`)])];
    if (attrs.install) {
      const installText = `$ ${attrs.install}${attrs.installOutput ? `\n${attrs.installOutput}` : ""}`;
      lines.push(codeBlock(installText, "bash"));
    }
    if (attrs.check) {
      const checkText = `$ ${attrs.check}${attrs.checkOutput ? `\n${attrs.checkOutput}` : ""}`;
      lines.push(paragraph([textNode("Verify:")]));
      lines.push(codeBlock(checkText, "bash"));
    }
    return lines;
  },

  BrowserWindow(node) {
    const attrs = getAttrs(node);
    const caption =
      typeof attrs.url === "string"
        ? `Screenshot — ${resolveVarMarkers(attrs.url)}`
        : "Screenshot";
    return [
      {
        type: "blockquote",
        children: [paragraph([textNode(caption)]), ...(node.children || [])],
      },
    ];
  },

  StepsCard(node) {
    const attrs = getAttrs(node);
    const out = [];
    if (typeof attrs.title === "string") out.push(paragraph([strongParsed(attrs.title)]));
    const steps = Array.isArray(attrs.steps) ? attrs.steps : [];
    if (steps.length > 0) {
      out.push({
        type: "list",
        ordered: attrs.variant !== "remember",
        children: steps.map((step) => stepToListItem(step)),
      });
    }
    return out;
  },

  ShortcutList(node) {
    const attrs = getAttrs(node);
    const items = Array.isArray(attrs.items) ? attrs.items : [];
    if (items.length === 0) return [];
    return [
      {
        type: "table",
        align: [null, null],
        children: [
          tableRow(["Shortcut", "Description"]),
          ...items.map((item) =>
            tableRow([keysToInlineNodes(item.keys), shortcutDescToText(item.desc)]),
          ),
        ],
      },
    ];
  },

  ProjectSetup(node) {
    const attrs = getAttrs(node);
    const out = [paragraph([strongText(`Project: ${attrs.folderName || "my-project"}`)])];
    for (const child of node.children || []) {
      out.push(child);
    }
    return out;
  },
  // <Guideline>/<EmptyFolder> render null in React (ProjectSetup reads them as
  // configuration, not layout) — degrade to the same instructional text a
  // reader of the live page would see.
  Guideline(node) {
    // node.children are already-degraded block nodes (typically one or more
    // paragraphs) — they must be siblings inside the blockquote, never spliced
    // into the "Note:" paragraph's own inline children (a block node nested
    // inside a paragraph is invalid mdast; remark-stringify does not reject it,
    // it just emits garbled HTML-entity-escaped text — verified on this corpus).
    return [
      {
        type: "blockquote",
        children: [paragraph([strongText("Note:")]), ...(node.children || [])],
      },
    ];
  },
  EmptyFolder(node) {
    const attrs = getAttrs(node);
    return [paragraph([textNode(`(create empty directory: ${attrs.name || "?"})`)])];
  },

  // --- Cards ----------------------------------------------------------------
  Card(node) {
    return node.children || [];
  },
  CardHeader(node) {
    return [{ type: "heading", depth: 4, children: inlineOnly(node.children) }];
  },
  CardBody(node) {
    return node.children || [];
  },
  CardFooter(node) {
    return node.children || [];
  },
  CardImage(node) {
    const attrs = getAttrs(node);
    const src = resolveDisplayableImageSrc(attrs.src);
    return src ? [paragraph([{ type: "image", url: src, alt: attrs.alt || "" }])] : [];
  },

  // --- Simple layout / leaf components --------------------------------------
  Columns(node) {
    return node.children || [];
  },
  Column(node) {
    return node.children || [];
  },
  Highlight(node) {
    return [{ type: "strong", children: node.children || [] }];
  },
  Image(node) {
    const attrs = getAttrs(node);
    const src = resolveDisplayableImageSrc(attrs.src);
    return src
      ? [paragraph([{ type: "image", url: src, alt: attrs.alt || attrs.title || "" }])]
      : [paragraph([textNode(`(image: ${attrs.alt || attrs.title || "untitled"})`)])];
  },
  DownloadButton(node) {
    const attrs = getAttrs(node);
    const requirePath =
      attrs.file && typeof attrs.file === "object" ? attrs.file.__requirePath : null;
    const label = attrs.label || "Download";
    // The final build asset URL is fingerprinted by webpack and unknowable
    // from source alone (see literalFromEstree's CallExpression case) — link
    // text names the file instead of guessing a URL that could 404.
    return [
      paragraph([
        textNode(`${label}: `),
        { type: "inlineCode", value: requirePath || "?" },
      ]),
    ];
  },

  // --- Pure interface widgets: no textual content, drop entirely -----------
  Reaction: () => [],
  ScrollToTopButton: () => [],
  KonamiEasterEgg: () => [],
  RelatedPosts: () => [],
  SeriesPosts: () => [],
  PostCard: () => [],
  Bluesky: () => [],
  AIIcon: () => [],
  TriedIt: () => [],
  TypoReport: () => [],

  // Trees/Folder/File need NO rule at all: they only exist after
  // remark-tree-to-component rewrites a fenced ```tree block, and this file
  // degrades the raw source *before* that plugin ever runs — so the fenced
  // block is still a plain `code` node here, already valid Markdown.
};

function inlineOnly(nodes) {
  // Best-effort: unwrap paragraphs into their inline children, for contexts
  // (headings) that cannot contain block content.
  const out = [];
  for (const node of nodes || []) {
    if (node.type === "paragraph") out.push(...node.children);
    else out.push(node);
  }
  return out;
}

function resolveDisplayableImageSrc(src) {
  // Absolute paths (`/img/…`) and full URLs resolve identically whether the
  // reader is on the HTML page or on the flat `/blog/<slug>.md` mirror, so
  // they survive as real image links. A relative `require("./x.webp")` result
  // is fingerprinted by webpack into a hashed build URL this script has no
  // way to predict — see [[0082]]'s "Ce qui est garanti" — so it is dropped
  // rather than emitting a link that would 404.
  if (typeof src === "string" && (src.startsWith("/") || /^https?:\/\//.test(src))) {
    return src;
  }
  return null;
}

// StepsCard's `steps[].content`/`steps[].substeps[]` strings are Markdown by
// contract — the live component runs each through its own parseMarkdown() —
// hence parseInlineMarkdown() rather than a literal textNode() here.
function stepToListItem(step) {
  if (typeof step === "string") {
    return { type: "listItem", children: [paragraph(parseInlineMarkdown(step))] };
  }
  const content = typeof step?.content === "string" ? step.content : "";
  const children = [paragraph(parseInlineMarkdown(content))];
  if (Array.isArray(step?.substeps) && step.substeps.length > 0) {
    children.push({
      type: "list",
      ordered: false,
      children: step.substeps.map((s) => ({
        type: "listItem",
        children: [paragraph(parseInlineMarkdown(typeof s === "string" ? s : ""))],
      })),
    });
  }
  return { type: "listItem", children };
}

function shortcutDescToText(desc) {
  if (typeof desc === "string") return desc;
  if (desc && typeof desc === "object" && "__jsxText" in desc) return desc.__jsxText;
  return "";
}

// `cells`: each entry is either a plain string (wrapped in a single text node)
// or a pre-built array of inline mdast nodes (e.g. an `inlineCode` node) — the
// latter for any cell that needs real Markdown formatting rather than escaped
// literal characters. mdast-gfm needs no header flag on the row itself: by
// convention the *first* row of a `table` node's children is the header row.
function tableRow(cells) {
  return {
    type: "tableRow",
    children: cells.map((cell) => ({
      type: "tableCell",
      children: Array.isArray(cell) ? cell : [textNode(cell)],
    })),
  };
}

function keysToInlineNodes(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return [textNode("")];
  const nodes = [];
  keys.forEach((key, index) => {
    if (index > 0) nodes.push(textNode("+"));
    nodes.push({ type: "inlineCode", value: key });
  });
  return nodes;
}

// ---------------------------------------------------------------------------
// Plain HTML tags authored directly in MDX (Table B) — `<div className="…">`,
// `<h4>`, `<strong>`, `<em>`, `<code>`, `<a href>`… These are NOT custom
// components: remark-mdx parses every JSX tag, lowercase or not, into the same
// mdxJsxFlowElement/mdxJsxTextElement node types, so without this table they
// would fall through to the generic "unknown → unwrap" rule and silently lose
// their formatting (bold/italic/inline-code/heading level).
// ---------------------------------------------------------------------------

const HTML_HEADING_DEPTH = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };

function degradeHtmlTag(node) {
  const name = node.name.toLowerCase();
  const children = node.children || [];

  if (HTML_HEADING_DEPTH[name]) {
    return [
      {
        type: "heading",
        depth: HTML_HEADING_DEPTH[name],
        children: inlineOnly(children),
      },
    ];
  }
  if (name === "p") return [paragraph(children)];
  if (name === "blockquote") return [{ type: "blockquote", children }];
  if (name === "strong" || name === "b") return [{ type: "strong", children }];
  if (name === "em" || name === "i") return [{ type: "emphasis", children }];
  if (name === "del" || name === "s") return [{ type: "delete", children }];
  if (name === "code" || name === "kbd")
    return [{ type: "inlineCode", value: mdastToText(children) }];
  if (name === "a") {
    const attrs = getAttrs(node);
    return [{ type: "link", url: attrs.href || "", children }];
  }
  if (name === "img") {
    const attrs = getAttrs(node);
    const src = resolveDisplayableImageSrc(attrs.src);
    if (src) return [{ type: "image", url: src, alt: attrs.alt || "" }];
    // Relative/require()'d src can't be resolved to a real URL (see
    // resolveDisplayableImageSrc) — keep the alt text rather than vanish
    // entirely, since a bare <img> has no children to fall back to.
    return attrs.alt ? [textNode(attrs.alt)] : [];
  }
  if (name === "br") return [{ type: "break" }];
  if (name === "hr") return [{ type: "thematicBreak" }];

  // div, span, section, article, and any other purely structural tag: unwrap.
  return children;
}

// ---------------------------------------------------------------------------
// Tree walk: bottom-up so a nested custom component is already resolved
// before its parent inspects `node.children`.
// ---------------------------------------------------------------------------

function transformChildren(children, ctx) {
  const out = [];
  for (const child of children || []) {
    out.push(...transformNode(child, ctx));
  }
  return out;
}

function transformNode(node, ctx) {
  if (node.children) {
    node.children = transformChildren(node.children, ctx);
  }

  if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") {
    return degradeComponent(node, ctx);
  }
  if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") {
    // A bare {expression} in prose, outside any attribute. None exist in this
    // corpus outside of code fences (verified) — best-effort fallback rather
    // than a crash if one ever appears.
    return typeof node.value === "string" && node.value.trim()
      ? [textNode(node.value)]
      : [];
  }
  if (node.type === "mdxjsEsm") {
    return []; // import/export statements — not content.
  }
  if (node.type === "yaml") {
    return []; // frontmatter — the caller writes its own header instead.
  }
  if (node.type === "comment") {
    return []; // `<!-- truncate -->` and any other raw HTML comment — not content.
  }
  if (node.type === "containerDirective" || node.type === "leafDirective") {
    return degradeDirective(node);
  }
  if (node.type === "textDirective") {
    // remark-directive's inline `:name` syntax has no word-boundary check, so
    // ordinary prose like "user_id:group_id", "github.com:company/x.git" or
    // "nginx:latest" tokenizes as a textDirective too — and every occurrence
    // ever found in this corpus has been exactly that, never a real directive
    // (this blog's own `:::tip`-style directives go through containerDirective/
    // leafDirective above, not here). Not worth a per-build warning: reconstruct
    // the exact original characters from the source, silently. Unlike
    // containerDirective, a directive with no `[label]` has *no children at
    // all* to fall back to, so keeping `node.children` here would silently
    // delete the word after the colon instead.
    if (node.position && typeof ctx.rawSource === "string") {
      return [
        textNode(
          ctx.rawSource.slice(node.position.start.offset, node.position.end.offset),
        ),
      ];
    }
    return node.children || [];
  }

  return [node];
}

function degradeDirective(node) {
  // Docusaurus's admonitions plugin (when available — see the try/catch at the
  // top of this file) annotates the directive with the resolved type/title
  // instead of changing its node type, so `node.type` is still "containerDirective"
  // here even for a fully recognised `:::tip[…]`.
  const type = node.data?.hProperties?.type || node.name;
  const title = node.data?.hProperties?.title;
  const label =
    title ||
    ALERT_LABELS[type] ||
    (type ? type[0].toUpperCase() + type.slice(1) : "Note");
  return [
    {
      type: "blockquote",
      children: [paragraph([strongText(`${label}:`)]), ...(node.children || [])],
    },
  ];
}

function degradeComponent(node, ctx) {
  const name = node.name;

  if (!name) {
    // React fragment <>…</>
    return node.children || [];
  }

  const isHtmlTag = name[0] === name[0].toLowerCase();
  if (isHtmlTag) {
    return degradeHtmlTag(node);
  }

  const handler = COMPONENT_RULES[name];
  if (handler) {
    return handler(node, ctx) || [];
  }

  // The one rule that can never be skipped: keep the content, drop the
  // wrapper, and tell the caller so it can warn about the gap.
  ctx.unknownComponents.add(name);
  return node.children || [];
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

// Parse-only processor, always format:"mdx" regardless of the file's own .md/.mdx
// extension — see the createProcessor import comment above for why. Never call
// `.run()`/`.compile()`/`.process()` on this one: createProcessor bakes in the
// full remark→rehype→recma→JS-estree compile chain, and `.parse()` is the only
// method that stops cleanly at the mdast stage this file actually wants.
function buildParser() {
  return createProcessor({ format: "mdx" })
    .use(remarkFrontmatter)
    .use(remarkGfm)
    .use(remarkComment)
    .use(remarkDirective);
}

// Separate, bare processor: `.run()`-only, used solely to apply Docusaurus's
// own admonitions AST transform (`:::tip[…]` → data.hProperties) to the tree
// `buildParser` produced. Kept off the parser above because a bare unified()
// has no recma/JS-compile stage to accidentally trigger.
const directiveTransformer = admonitionsPlugin
  ? unified().use(admonitionsPlugin, true)
  : null;

const stringifier = unified().use(remarkStringify).use(remarkGfm);

/**
 * @param {string} rawSource - the full .md/.mdx file content, frontmatter included.
 * @param {object} opts
 * @param {string} opts.currentFileDir - absolute directory of the article (for
 *   resolving relative `source="./…"` attributes).
 * @param {string} [opts.projectRoot] - defaults to process.cwd().
 * @returns {Promise<{ markdown: string, unknownComponents: string[] }>}
 */
async function mdxToMarkdown(rawSource, { currentFileDir, projectRoot = process.cwd() }) {
  let preprocessed = escapeMarkdownHeadingIds(rawSource);
  if (admonitionsPlugin) {
    preprocessed = admonitionTitleToDirectiveLabel(preprocessed, ADMONITION_KEYWORDS);
  }

  const tree = buildParser().parse(preprocessed);

  if (directiveTransformer) {
    await directiveTransformer.run(tree);
  }

  const ctx = {
    currentFileDir,
    projectRoot,
    rawSource: preprocessed,
    unknownComponents: new Set(),
  };
  tree.children = transformChildren(tree.children, ctx);

  const markdown = stringifier.stringify(tree);

  return { markdown, unknownComponents: [...ctx.unknownComponents].sort() };
}

module.exports = { mdxToMarkdown };
