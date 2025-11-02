/**
 * @fileoverview A Docusaurus Remark plugin that transforms fenced code blocks with the
 * language identifier `tree` into an MDX component structure (<Trees> / <Folder> / <File>).
 * It supports attributes like `expanded`, `showJSX`, `debug`, and `title`.
 */

const { visit } = require("unist-util-visit");

/**
 * @typedef {Object} Node
 * @property {string} label - The file or folder name.
 * @property {'file'|'folder'} type - The type of the node.
 * @property {Node[]} children - Array of child nodes.
 */

/**
 * @typedef {Object} Settings
 * @property {boolean} expanded - Whether the root folder should be expanded by default.
 * @property {boolean} showJSX - Whether to display the generated JSX code block.
 * @property {boolean} debug - Whether to display the parsed settings as a JSON block.
 * @property {string} title - The project title displayed above the tree.
 */

/**
 * @typedef {Object} MdxJsxAttribute
 * @property {'mdxJsxAttribute'} type
 * @property {string} name
 * @property {string | boolean} value
 */

/**
 * @typedef {Object} MdxJsxFlowElement
 * @property {'mdxJsxFlowElement'} type
 * @property {'Trees'|'Folder'|'File'} name
 * @property {MdxJsxAttribute[]} attributes
 * @property {MdxJsxFlowElement[]} children
 */

/**
 * @type {Object<string, string>} Mapping from file extension/name to a variant key for icon selection.
 */
const mapLangToVariant = {
  apacheconf: "apacheconf",
  asm: "asm",
  bas: "vb",
  bash: "bash",
  bashrc: "bash",
  bat: "batch",
  batch: "batch",
  cjs: "js",
  cmd: "batch",
  css: "css",
  csv: "csv",
  diff: "diff",
  docker: "docker",
  gherkin: "gherkin",
  html: "html",
  ignore: "ignore",
  ini: "ini",
  java: "java",
  javascript: "js",
  js: "js",
  jsx: "js",
  json: "json",
  log: "log",
  makefile: "makefile",
  md: "md",
  mdx: "md",
  none: "none",
  pascal: "pascal",
  php: "php",
  powershell: "powershell",
  py: "python",
  python: "python",
  sh: "bash",
  sql: "sql",
  svg: "svg",
  toml: "toml",
  txt: "txt",
  vb: "vb",
  vbnet: "vbnet",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
};

/**
 * @type {Object<string, string>} Mapping from variant key to the actual icon identifier (e.g., Lucide icon, or custom).
 */
const variantIcons = {
  apacheconf: "logos:apache",
  asm: "vscode-icons:file-type-assembly",
  bash: "devicon:bash",
  batch: "file-icons:ms-dos",
  css: "ph:file-css",
  csv: "ph:file-csv",
  diff: "ph:git-diff",
  docker: "uil:docker",
  docusaurus: "logos:docusaurus",
  folder: "flat-color-icons:folder",
  gherkin: "skill-icons:gherkin-light",
  html: "ph:file-html",
  ignore: "codicon:sync-ignored",
  ini: "ph:file-ini",
  java: "vscode-icons:file-type-java",
  js: "logos:javascript",
  json: "ix:json-document",
  log: "ix:log",
  makefile: "vscode-icons:file-type-makefile",
  md: "ph:markdown-logo",
  none: "ph:empty",
  pascal: "file-icons:pascal",
  php: "bi:filetype-php",
  png: "ph:file-png-light",
  powershell: "file-icons:powershell",
  python: "devicon:python",
  sql: "ph:file-sql",
  svg: "ph:file-svg",
  toml: "tabler:toml",
  tsx: "ph:file-tsx-light",
  txt: "ph:file-txt",
  vb: "fluent:document-vb-16-regular",
  vbnet: "fluent:document-vb-16-regular",
  xml: "hugeicons:xml-01",
  yaml: "devicon-plain:yaml",
};

/**
 * Determines the variant key for icon selection based on filename and type.
 * @param {string} filename - The name of the file or folder.
 * @param {'file'|'folder'} [type='file'] - The type of node.
 * @returns {string} The variant key for icon lookup.
 */
function getVariantKey(filename, type = "file") {
  if (type === "folder") return "folder";
  if (!filename) return "none";

  const lower = filename.toLowerCase();
  const base = lower.split("/").pop();

  if (base === "docusaurus.config.js") return "docusaurus";

  // Specific handling for Docker files
  if (
    base === "dockerfile" ||
    base === "docker" ||
    base.endsWith(".docker") ||
    base.endsWith(".dockerfile") ||
    base.endsWith(".dockerignore") ||
    base.endsWith("compose.yaml") ||
    base.endsWith("compose.yml") ||
    base.endsWith("docker-compose.yaml")
  )
    return "docker";

  const ext = base.includes(".") ? base.split(".").pop() : "";
  return mapLangToVariant[ext] || "none";
}

/**
 * Parses the raw tree structure text into a hierarchical array of Node objects.
 * @param {string} treeText - The raw text content of the code block.
 * @returns {Node[]} The array of root-level Node objects.
 */
function parseTree(treeText) {
  const lines = treeText
    .split("\n")
    .map((l) => l.replace(/\r$/, "")) // Clean Windows line endings
    .filter((l) => l.trim().length > 0 && !l.startsWith(".")); // Filter out empty lines and hidden root

  /** @type {Node[]} */
  const root = [];
  /** @type {Array<{depth: number, children: Node[]}>} */
  const stack = [{ depth: -1, children: root }]; // Stack for tracking parent folders

  for (const line of lines) {
    // Match indentation and node name, ignoring tree characters (│, ├──, └──)
    const match = line.match(/^(\s*[\│\s]*)?(?:├── |└── )?(.+)$/);
    if (!match) continue;

    const [, indentChars = "", nameRaw] = match;

    // Normalize all tree drawing characters (like │) in the indentation to spaces for consistent depth calculation
    const normalizedIndent = indentChars
      .replace(/[\│\─\├\└]/g, " ")
      .replace(/[^\S\r\n]/g, " ");

    // Calculate depth based on 4 spaces per level
    const depth = Math.floor(normalizedIndent.length / 4);

    const name = nameRaw.replace(/[\│\├\└\─]+/g, "").trim();

    /** @type {Node} */
    const node = {
      label: name,
      type: name.includes(".") ? "file" : "folder",
      children: [],
    };

    // Traverse up the stack to find the correct parent based on depth
    while (stack.length > 1 && depth <= stack[stack.length - 1].depth) {
      stack.pop();
    }

    // Add node to the current parent's children
    stack[stack.length - 1].children.push(node);

    // If it's a folder, push it onto the stack to become the next parent
    if (node.type === "folder") {
      stack.push({ depth, children: node.children });
    }
  }

  return root;
}

/**
 * Recursively converts a parsed Node into an MDAST MDX JSX Element structure.
 * @param {Node} node - The parsed tree node (file or folder).
 * @param {Settings} [settings={}] - The configuration settings from the code block header.
 * @returns {MdxJsxFlowElement} The MDAST representation of the component.
 */
function nodeToMdxElement(node, settings = {}) {
  const variantKey = getVariantKey(node.label, node.type);
  const icon = variantIcons[variantKey] || variantIcons.none;

  if (node.type === "folder") {
    /** @type {MdxJsxAttribute[]} */
    const attributes = [
      { type: "mdxJsxAttribute", name: "label", value: node.label },
      { type: "mdxJsxAttribute", name: "icon", value: icon },
    ];

    // Only include the 'expanded' prop if it is explicitly set to true.
    if (settings.expanded === true) {
      attributes.push({
        type: "mdxJsxAttribute",
        name: "expanded",
        value: true,
      });
    }

    return {
      type: "mdxJsxFlowElement",
      name: "Folder",
      attributes: attributes,
      children: node.children.map((child) => nodeToMdxElement(child, settings)),
    };
  } else {
    return {
      type: "mdxJsxFlowElement",
      name: "File",
      attributes: [
        { type: "mdxJsxAttribute", name: "label", value: node.label },
        { type: "mdxJsxAttribute", name: "icon", value: icon },
      ],
      children: [],
    };
  }
}

/**
 * Custom recursive function to convert an MDX JSX element (MDAST node)
 * back into a formatted, indented JSX string for display.
 * @param {MdxJsxFlowElement} node - The MDAST node representing the component element.
 * @param {number} [indent=0] - Current indentation level (in spaces, 2 per level).
 * @returns {string} The formatted JSX string.
 */
function nodeToJsxString(node, indent = 0) {
  if (node.type !== "mdxJsxFlowElement") return "";

  // Use two standard spaces for indentation
  const indentStr = "   ".repeat(indent);

  // Process attributes into a string
  const attributes = node.attributes
    .map((attr) => {
      if (attr.type === "mdxJsxAttribute") {
        let value;
        // Values that are strings need quotes in the JSX string
        if (typeof attr.value === "string") {
          value = `"${attr.value}"`;
        } else if (typeof attr.value === "boolean") {
          // Boolean values need braces
          value = `{${attr.value}}`;
        } else {
          value = attr.value;
        }
        return `${attr.name}=${value}`;
      }
      return "";
    })
    .filter(Boolean)
    .join(" ");

  let startTag = `<${node.name}${attributes ? ` ${attributes}` : ""}`;

  if (node.children && node.children.length > 0) {
    startTag += ">";

    // Recursively process children with increased indentation
    const childrenStrings = node.children
      .map((child) => nodeToJsxString(child, indent + 1))
      .join("\n");

    const endTag = `${indentStr}</${node.name}>`;

    // Combine and format the multi-line tag structure
    return [indentStr + startTag, childrenStrings, endTag].join("\n");
  } else {
    // Self-closing tag for <File /> elements
    return `${indentStr}${startTag} />`;
  }
}

/**
 * The main Remark plugin function. It visits all code blocks and replaces those
 * with the `tree` language identifier with an MDX component structure.
 * @returns {function(import('unist').Node, import('unist').VFile): void} The Unist Transformer function.
 */
function remarkTreeToComponent() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      // Combine node.lang ("tree") and node.meta (attributes) for full header parsing
      const lang = node.lang || "";
      const meta = node.meta || "";
      const fullHeader = [lang, meta].filter(Boolean).join(" ").trim();

      // Skip if it's not a 'tree' block
      if (!fullHeader.startsWith("tree")) return;

      /** @type {Settings} */
      const settings = {
        expanded: false,
        showJSX: false,
        debug: false,
        title: "",
      };

      // Regex to robustly extract key=value pairs, handling both unquoted and quoted values (with spaces)
      // Group 1: key, Group 3: quoted value, Group 4: unquoted value
      const attributeRegex = /\s*([a-zA-Z0-9]+)=("([^"]*)"|([^\s"]+))/g;
      let match;

      // Start parsing after the "tree" keyword
      const attributeString = fullHeader
        .substring(fullHeader.indexOf("tree") + 4)
        .trim();

      while ((match = attributeRegex.exec(attributeString)) !== null) {
        const key = match[1];
        const value = match[3] !== undefined ? match[3] : match[4];

        // console.log(`Remark Plugin: Evaluating param: ${key}=${value}`);

        if (key === "expanded") settings.expanded = value === "true";
        if (key === "showJSX") settings.showJSX = value === "true";
        if (key === "debug") settings.debug = value === "true";
        if (key === "title") settings.title = value;
      }

      //  console.log("Remark Plugin Settings (Final):", settings);

      // Parse the raw tree structure text
      const parsed = parseTree(node.value);

      // Convert parsed structure into an MDX AST structure
      const childrenMdx = parsed.map((child) =>
        nodeToMdxElement(child, settings)
      );

      // Prepare attributes for the root <Trees> component
      /** @type {MdxJsxAttribute[]} */
      const treesAttributes = [];

      // Add the title attribute if provided
      if (settings.title) {
        treesAttributes.push({
          type: "mdxJsxAttribute",
          name: "title",
          value: settings.title,
        });
      }

      // 1. Create the <Trees> component MDAST node
      /** @type {MdxJsxFlowElement} */
      const treesNode = {
        type: "mdxJsxFlowElement",
        name: "Trees",
        attributes: treesAttributes,
        children: childrenMdx,
      };

      /** @type {import('unist').Node[]} */
      let nodesToInsert = [treesNode];

      // 2. Generate and insert the JSX code block if showJSX is true
      if (settings.showJSX) {
        // Convert the MDX children AST back to a raw, indented JSX string
        const rawJsxChildren = childrenMdx
          .map((child) => nodeToJsxString(child, 1))
          .join("\n");

        // Build the root tag string with the quoted title attribute
        const treesTitleAttr = settings.title
          ? ` title="${settings.title}"`
          : "";
        const finalJsxString = `<Trees${treesTitleAttr}>\n${rawJsxChildren}\n</Trees>`;

        // Create an MDX code block node for the generated JSX
        const jsxCodeBlock = {
          type: "code",
          lang: "jsx",
          value: finalJsxString.trim(),
        };

        // Insert the JSX code block before the component output
        nodesToInsert.unshift(jsxCodeBlock);
      }

      // 3. Insert debug output first if debug is true
      if (settings.debug) {
        const debugBlock = {
          type: "code",
          lang: "json",
          value: JSON.stringify(settings, null, 2),
        };

        // Insert the debug block at the very start of the replacement array
        nodesToInsert.unshift(debugBlock);
      }

      // 4. Replace the original code block with the new set of nodes
      parent.children.splice(index, 1, ...nodesToInsert);
    });
  };
}

module.exports = remarkTreeToComponent;
