import PropTypes from "prop-types";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import styles from "./styles.module.css";

import ApacheConfLogo from './apacheconf-logo.svg';
import AsmLogo from './asm-logo.svg';
import BashLogo from './bash-logo.svg';
import LogLogo from './log-logo.svg';
import IgnoreLogo from './ignore-logo.svg';
import BatchLogo from './batch-logo.svg';
import JavaLogo from './java-logo.svg';
import CsvLogo from './csv-logo.svg';
import CSSLogo from './css-logo.svg';
import PascalLogo from './pascal-logo.svg';
import GherkinLogo from './gherkin-logo.svg';
import DockerLogo from './docker-logo.svg';
import DiffLogo from './diff-logo.svg';
import HTMLLogo from './html-logo.svg';
import IniLogo from './ini-logo.svg';
import JsLogo from './js-logo.svg';
import JsonLogo from './json-logo.svg';
import MakefileLogo from './makefile-logo.svg';
import MarkDownLogo from './markdown-logo.svg';
import PhpLogo from './php-logo.svg';
import PowershellLogo from './powershell-logo.svg';
import PythonLogo from './python-logo.svg';
import SQLLogo from './sql-logo.svg';
import SvgLogo from './svg-logo.svg';
import TomlLogo from './toml-logo.svg';
import NoneLogo from './none-logo.svg';
import VbNetLogo from './vbnet-logo.svg';
import VBLogo from './vb-logo.svg';
import XMLLogo from './xml-logo.svg';
import YamlLogo from './yaml-logo.svg';

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
  cmd: "cmd",
  css: "css",
  csv: "csv",
  diff: "diff",
  gherkin: "gherkin",
  html: "html",
  ignore: "ignore",
  ini: "ini",
  java: "java",
  javascript: "js",
  js: "js",
  json: "json",
  log: "log",
  makefile: "makefile",
  markdown: "md",
  markdownlint_ignore: "json",
  md: "md",
  none: "none",
  pascal: "pascal",
  php: "php",
  ps1: "powershell",
  powershell: "powershell",
  py: "python",
  python: "python",
  qmd: "md",
  sh: "bash",
  sql: "sql",
  svg: "svg",
  toml: "toml",
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
const variantIcons = {
  apacheconf: { Icon: ApacheConfLogo, className: styles.apacheconf_icon, ariaLabel: "ApacheConf Logo" },
  asm: { Icon: AsmLogo, className: styles.asm_icon, ariaLabel: "Asm Logo" },
  bash: { Icon: BashLogo, className: styles.bash_icon, ariaLabel: "Bash Logo" },
  batch: { Icon: BatchLogo, className: styles.batch_icon, ariaLabel: "Batch Logo" },
  css: { Icon: CSSLogo, className: styles.css_icon, ariaLabel: "CSS Logo" },
  csv: { Icon: CsvLogo, className: styles.csv_icon, ariaLabel: "CSV Logo" },
  diff: { Icon: DiffLogo, className: styles.diff_icon, ariaLabel: "Diff Logo" },
  docker: { Icon: DockerLogo, className: styles.docker_icon, ariaLabel: "Docker Logo" },
  gherkin: { Icon: GherkinLogo, className: styles.gherkin_icon, ariaLabel: "Gerkin Logo" },
  html: { Icon: HTMLLogo, className: styles.html_icon, ariaLabel: "HTML Logo" },
  ignore: { Icon: IgnoreLogo, className: styles.ignore_icon, ariaLabel: "Ignore Logo" },
  ini: { Icon: IniLogo, className: styles.ini_icon, ariaLabel: "INI Logo" },
  java: { Icon: JavaLogo, className: styles.java_icon, ariaLabel: "Java Logo" },
  js: { Icon: JsLogo, className: styles.js_icon, ariaLabel: "JS Logo" },
  json: { Icon: JsonLogo, className: styles.json_icon, ariaLabel: "JSON Logo" },
  log: { Icon: LogLogo, className: styles.log_icon, ariaLabel: "Log Logo" },
  makefile: { Icon: MakefileLogo, className: styles.makefile_icon, ariaLabel: "GNU Makefile Logo" },
  md: { Icon: MarkDownLogo, className: styles.md_icon, ariaLabel: "Markdown Logo" },
  none: { Icon: NoneLogo, className: styles.none_icon, ariaLabel: "None Logo" },
  pascal: { Icon: PascalLogo, className: styles.pascal_icon, ariaLabel: "Pascal Logo" },
  php: { Icon: PhpLogo, className: styles.php_icon, ariaLabel: "PHP Logo" },
  powershell: { Icon: PowershellLogo, className: styles.powershell_icon, ariaLabel: "Powershell Logo" },
  python: { Icon: PythonLogo, className: styles.python_icon, ariaLabel: "Python Logo" },
  sql: { Icon: SQLLogo, className: styles.sql_icon, ariaLabel: "SQL Logo" },
  svg: { Icon: SvgLogo, className: styles.svg_icon, ariaLabel: "SVG Logo" },
  toml: { Icon: TomlLogo, className: styles.toml_icon, ariaLabel: "Toml Logo" },
  vb: { Icon: VBLogo, className: styles.vb_icon, ariaLabel: "VB Logo" },
  vbnet: { Icon: VbNetLogo, className: styles.vbnet_icon, ariaLabel: "VbNet Logo" },
  xml: { Icon: XMLLogo, className: styles.xml_icon, ariaLabel: "XML Logo" },
  yaml: { Icon: YamlLogo, className: styles.yaml_icon, ariaLabel: "YAML Logo" },
};

export default function Snippet({
  filename,
  children,
  defaultOpen = false,
  variant,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef(null);
  const [height, setHeight] = useState("0px");

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [open, children]);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);

  const contentId = useRef(
    `snippet-content-${Math.random().toString(36).slice(2, 11)}`
  ).current;

  // Memoize lang & variantKey so they don't recalc on every render
  const lang = useMemo(() => getLanguageFromChildren(children), [children]);

  const isDockerFile = useMemo(() => {
    if (typeof filename !== "string") return false;
    const lower = filename.toLowerCase();
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

  const variantKey = variant || (isDockerFile ? "docker" : mapLangToVariant[lang]) || "default";
  const variantClass = styles[`variant_${variantKey}`] || "";

  // Get icon info if available
  const IconInfo = variantIcons[variantKey];

  return (
    <div className={`${styles.snippet_block} ${variantClass} alert alert--info`}>
      <button
        className={styles.snippet_summary}
        onClick={handleToggle}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span className={styles.filename_wrapper}>
          {IconInfo && <IconInfo.Icon className={IconInfo.className} aria-label={IconInfo.ariaLabel} />}
          {' '}
          {filename}
        </span>
        <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>&#9662;</span>
      </button>

      <div
        ref={contentRef}
        id={contentId}
        className={styles.snippet_content}
        style={{ maxHeight: height }}
      >
        <div className={styles.snippet_inner}>{children}</div>
      </div>
    </div>
  );
}

Snippet.propTypes = {
  filename: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  defaultOpen: PropTypes.bool,
  variant: PropTypes.string,
};
