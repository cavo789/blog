import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import CodeBlock from "@theme/CodeBlock";
import LogoIcon from "@site/src/components/Blog/LogoIcon";
import PropTypes from "prop-types";
import styles from "./styles.module.css";

// Extract language from <code className="language-xyz"> inside children
const getLanguageFromChildren = (children) => {
  const findLang = (node) => {
    if (
      React.isValidElement(node) &&
      node.props &&
      typeof node.props.className === "string"
    ) {
      const match = node.props.className.match(/language-(\w+)/);
      if (match) return match[1].toLowerCase();
    }
    if (React.isValidElement(node) && node.props?.children) {
      const nested = node.props.children;
      if (Array.isArray(nested)) {
        for (const child of nested) {
          const lang = findLang(child);
          if (lang) return lang;
        }
      } else {
        return findLang(nested);
      }
    }
    return null;
  };
  return findLang(children);
};

// Maps code language to styling variant
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
  markdown: "md",
  markdownlint_ignore: "json",
  md: "md",
  mdx: "md",
  mjs: "js",
  none: "none",
  pascal: "pascal",
  php: "php",
  plaintext: "txt",
  powershell: "powershell",
  ps1: "powershell",
  py: "python",
  python: "python",
  qmd: "md",
  sh: "bash",
  sql: "sql",
  svg: "svg",
  toml: "toml",
  txt: "txt",
  vb: "vb",
  vba: "vb",
  vbnet: "vbnet",
  vbs: "vb",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  zsh: "bash",
};

// Map variant keys to their icon components and CSS classes
// For retrieving the value for the iconify key, just go to "https://icon-sets.iconify.design/?query=python"
// and, in the top right search area, type the name of the language.
// When found, click on the desired icon and retrieve the "icon name" as displayed in the bottom part.
const variantIcons = {
  apacheconf: {
    iconClassName: styles.apacheconf_icon,
    iconify: "logos:apache",
    ariaLabel: "ApacheConf Logo",
  },
  asm: {
    iconClassName: styles.asm_icon,
    iconify: "vscode-icons:file-type-assembly",
    ariaLabel: "Asm Logo",
  },
  bash: {
    iconClassName: styles.bash_icon,
    iconify: "devicon:bash",
    ariaLabel: "Bash Logo",
  },
  batch: {
    iconClassName: styles.batch_icon,
    iconify: "file-icons:ms-dos",
    ariaLabel: "Batch Logo",
  },
  css: {
    iconClassName: styles.css_icon,
    iconify: "ph:file-css",
    ariaLabel: "CSS Logo",
  },
  csv: {
    iconClassName: styles.csv_icon,
    iconify: "ph:file-csv",
    ariaLabel: "CSV Logo",
  },
  diff: {
    iconClassName: styles.diff_icon,
    iconify: "ph:git-diff",
    ariaLabel: "Diff Logo",
  },
  docker: {
    iconClassName: styles.docker_icon,
    iconify: "uil:docker",
    ariaLabel: "Docker Logo",
  },
  docusaurus: {
    iconClassName: styles.docker_docusaurus,
    iconify: "logos:docusaurus",
    ariaLabel: "Docusaurus Logo",
  },
  gherkin: {
    iconClassName: styles.gherkin_icon,
    iconify: "skill-icons:gherkin-light",
    ariaLabel: "Gherkin Logo",
  },
  html: {
    iconClassName: styles.html_icon,
    iconify: "ph:file-html",
    ariaLabel: "HTML Logo",
  },
  ignore: {
    iconClassName: styles.ignore_icon,
    iconify: "codicon:sync-ignored",
    ariaLabel: "Ignore Logo",
  },
  ini: {
    iconClassName: styles.ini_icon,
    iconify: "ph:file-ini",
    ariaLabel: "INI Logo",
  },
  java: {
    iconClassName: styles.java_icon,
    iconify: "vscode-icons:file-type-java",
    ariaLabel: "Java Logo",
  },
  js: {
    iconClassName: styles.js_icon,
    iconify: "logos:javascript",
    ariaLabel: "JS Logo",
  },
  json: {
    iconClassName: styles.json_icon,
    iconify: "ix:json-document",
    ariaLabel: "JSON Logo",
  },
  log: {
    iconClassName: styles.log_icon,
    iconify: "ix:log",
    ariaLabel: "Log Logo",
  },
  makefile: {
    iconClassName: styles.makefile_icon,
    iconify: "vscode-icons:file-type-makefile",
    ariaLabel: "GNU Makefile Logo",
  },
  md: {
    iconClassName: styles.md_icon,
    iconify: "ph:markdown-logo",
    ariaLabel: "Markdown Logo",
  },
  none: {
    iconClassName: styles.none_icon,
    iconify: "ph:empty",
    ariaLabel: "None Logo",
  },
  pascal: {
    iconClassName: styles.pascal_icon,
    iconify: "file-icons:pascal",
    ariaLabel: "Pascal Logo",
  },
  php: {
    iconClassName: styles.php_icon,
    iconify: "bi:filetype-php",
    ariaLabel: "PHP Logo",
  },
  powershell: {
    iconClassName: styles.powershell_icon,
    iconify: "file-icons:powershell",
    ariaLabel: "Powershell Logo",
  },
  python: {
    iconClassName: styles.python_icon,
    iconify: "devicon:python",
    ariaLabel: "Python Logo",
  },
  sql: {
    iconClassName: styles.sql_icon,
    iconify: "ph:file-sql",
    ariaLabel: "SQL Logo",
  },
  svg: {
    iconClassName: styles.svg_icon,
    iconify: "ph:file-svg",
    ariaLabel: "SVG Logo",
  },
  toml: {
    iconClassName: styles.toml_icon,
    iconify: "tabler:toml",
    ariaLabel: "Toml Logo",
  },
  txt: {
    iconClassName: styles.txt,
    iconify: "ph:file-txt",
    ariaLabel: "Txt Logo",
  },
  vb: {
    iconClassName: styles.vb_icon,
    iconify: "fluent:document-vb-16-regular",
    ariaLabel: "VB Logo",
  },
  vbnet: {
    iconClassName: styles.vbnet_icon,
    iconify: "fluent:document-vb-16-regular",
    ariaLabel: "VbNet Logo",
  },
  xml: {
    iconClassName: styles.xml_icon,
    iconify: "hugeicons:xml-01",
    ariaLabel: "XML Logo",
  },
  yaml: {
    iconClassName: styles.yaml_icon,
    iconify: "devicon-plain:yaml",
    ariaLabel: "YAML Logo",
  },
};

export default function Snippet({
  filename,
  code,
  children,
  defaultOpen = false,
  variant,
  lang: pluginLang, // <-- Destructure the lang prop and rename it
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [open, code, children]);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);
  const contentId = useRef(
    `snippet-content-${Math.random().toString(36).slice(2, 11)}`
  ).current;

  // Memoize lang & variantKey so they don't recalc on every render
  // const lang = useMemo(() => getLanguageFromChildren(children), [children]);

  const lang = useMemo(() => {
    // 1. Check for the `lang` prop provided by your plugin
    if (pluginLang) return pluginLang;

    // 2. Fallback to the existing logic for `children`
    const languageFromChildren = getLanguageFromChildren(children);
    if (languageFromChildren) return languageFromChildren;

    // 3. Fallback to the filename extension if no other language is found
    if (typeof filename === "string") {
      const ext = filename.split(".").pop();
      return mapLangToVariant[ext] || "plaintext";
    }

    return "plaintext";
  }, [pluginLang, children, filename]);

  const codeBlock = code ? (
    <CodeBlock className={`language-${lang}`}>{code}</CodeBlock>
  ) : (
    children
  );

  // Small anonymous function to determine if the file is one of Docker or not
  // (here we don't look at the extension)
  const isDockerFile = useMemo(() => {
    if (typeof filename !== "string") return false;
    // Make sure to get the filename (like Dockerfile) and not any parent paths before
    const lower = filename.split("/").pop().toLowerCase();
    return (
      lower === "dockerfile" ||
      lower === "docker" ||
      lower.endsWith(".docker") ||
      lower.endsWith(".dockerfile") ||
      lower.endsWith(".dockerignore") ||
      lower.endsWith("compose.yaml") ||
      lower.endsWith("compose.yml") ||
      lower.endsWith("docker-compose.yaml")
    );
  }, [filename]);

  // Same for Docusaurus (even if it's a .js file), it's more fun to show the
  // Docusaurus icon and not the Javascript one.
  const isDocusaurus = useMemo(() => {
    if (typeof filename !== "string") return false;
    const lower = filename.split("/").pop().toLowerCase();
    return lower === "docusaurus.config.js";
  }, [filename]);

  const variantKey =
    variant ||
    (isDockerFile
      ? "docker"
      : isDocusaurus
      ? "docusaurus"
      : mapLangToVariant[lang]) ||
    "none";

  const variantClass = styles[`variant_${variantKey}`] || "";

  // Get icon info if available
  const IconInfo = variantIcons[variantKey];

  if (!IconInfo) {
    throw new Error(
      `Unknown variantKey in Snippet component: ${variantKey}; detected language was: ${lang}`
    );
  }

  const { iconClassName, iconify, ariaLabel } = IconInfo;

  return (
    <div
      className={`${styles.snippet_block} ${variantClass} alert alert--info`}
    >
      <button
        className={styles.snippet_summary}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className={styles.filename_wrapper}>
          {IconInfo && (
            <LogoIcon
              name={iconify}
              className={iconClassName}
              aria-label={ariaLabel}
              size="32"
            />
          )}{" "}
          {filename}
        </span>
        <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>
          &#9662;
        </span>
      </button>

      <div
        ref={contentRef}
        id={contentId}
        className={styles.snippet_content}
        style={{ maxHeight: height }}
      >
        <div className={styles.snippet_inner}>{codeBlock}</div>
      </div>
    </div>
  );
}

Snippet.propTypes = {
  filename: PropTypes.string.isRequired,
  code: PropTypes.string,
  lang: PropTypes.string,
  children: PropTypes.node,
  defaultOpen: PropTypes.bool,
  variant: PropTypes.string,
};
