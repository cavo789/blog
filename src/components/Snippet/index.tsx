import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useId,
  type CSSProperties,
  type JSX,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Prism from "prismjs";
import { useTokenize } from "prism-react-renderer";
// Eli5CodeBlock (below) needs its own Prism grammars registered on this exact
// `prismjs` singleton — everything beyond markup/html/xml/css/clike/javascript
// (Prism's default bundle) only exists here as a side effect of requiring its
// component file. `prism-react-renderer` (peer-depends on "prismjs": "*", so
// it shares this same module instance) registers `additionalLanguages` the
// same way whenever a native `<CodeBlock>` renders — meaning `Prism.languages
// .bash` etc. was previously only defined here if some *other* CodeBlock had
// already rendered first in this process/session. Registering every grammar
// `Eli5CodeBlock` can receive (see remark-snippet-loader's `extensionToLang`
// map) unconditionally, here, makes that no longer order-dependent.
// markup/html/xml/css/javascript need no entry — already in Prism's default
// bundle (verified empirically).
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-markup-templating"; // prism-php's own dependency
import "prismjs/components/prism-php";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-docker";
import "prismjs/components/prism-ini";
import "prismjs/components/prism-sql";

import CodeBlock from "@theme/CodeBlock";
import IconCopy from "@theme/Icon/Copy";
import IconSuccess from "@theme/Icon/Success";
import LogoIcon from "@site/src/components/Blog/LogoIcon";
import clsx from "clsx";
import { useVarResolver } from "@site/src/components/Vars/store";
import {
  substitutePlainText,
  substituteChildren,
} from "@site/src/components/Vars/substitute";
import VarToken from "@site/src/components/Vars/VarToken";
import styles from "./styles.module.css";

// Extract language from <code className="language-xyz"> inside children
const getLanguageFromChildren = (children: ReactNode): string | null => {
  const findLang = (node: ReactNode): string | null => {
    if (React.isValidElement(node)) {
      const props = node.props as {
        className?: unknown;
        children?: ReactNode;
      };
      if (typeof props.className === "string") {
        const match = props.className.match(/language-(\w+)/);
        if (match) return match[1].toLowerCase();
      }
      if (props.children) {
        const nested = props.children;
        if (Array.isArray(nested)) {
          for (const child of nested) {
            const lang = findLang(child);
            if (lang) return lang;
          }
        } else {
          return findLang(nested);
        }
      }
    }
    return null;
  };
  return findLang(children);
};

// Maps code language to styling variant
const mapLangToVariant: Record<string, string> = {
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
  ts: "ts",
  tsx: "ts",
  txt: "txt",
  typescript: "ts",
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
interface VariantIcon {
  iconClassName: string;
  iconify: string;
  ariaLabel: string;
}

const variantIcons: Record<string, VariantIcon> = {
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
  ts: {
    iconClassName: styles.ts_icon,
    iconify: "logos:typescript-icon",
    ariaLabel: "TypeScript Logo",
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

// ELI5 line-by-line renderer — used when eli5json prop is present.
// Calls Prism.highlight() directly to get syntax-colored HTML per line,
// then overlays interactive ? badges for annotated lines.
// The tooltip is rendered via a React Portal into document.body so it
// escapes every overflow:hidden / stacking-context ancestor.
interface Eli5CodeBlockProps {
  code: string;
  lang: string;
  eli5: Record<string, string>;
}

// Eli5CodeBlock renders its own <pre>, bypassing Docusaurus's native
// <CodeBlock> (see below) and losing its built-in copy button in the
// process — reimplemented locally rather than pulling in
// `@docusaurus/theme-common/internal`'s CodeBlockContext, which TODO 0112
// already names as a suspect in an open React hydration bug.
function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | undefined>(undefined);

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      window.clearTimeout(timeoutRef.current);
      setCopied(true);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1000);
    });
  }, []);

  useEffect(() => () => window.clearTimeout(timeoutRef.current), []);

  return { copied, copy };
}

function Eli5CodeBlock({ code, lang, eli5 }: Eli5CodeBlockProps): JSX.Element {
  const [activeLine, setActiveLine] = useState<string | null>(null);
  const [tooltipStyle, setTooltipStyle] = useState<CSSProperties | null>(null);
  const { copied, copy } = useCopyToClipboard();
  // false until mounted client-side — gates the tooltip's document.body Portal,
  // which doesn't exist during SSR.
  const [mounted, setMounted] = useState(false);
  const badgeRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional mount flag, see comment on `mounted` above
    setMounted(true);
  }, []);

  // `Prism.highlight()` + `.split("\n")` (the previous approach) corrupts any
  // token that spans multiple lines — a `/** … */` JSDoc comment most
  // commonly — because the highlighted HTML gets cut across an unclosed
  // `<span>`. Browsers silently repair that malformed HTML while parsing the
  // page, but repair it *differently* than what React's virtual tree expects
  // once it hydrates, which is a genuine structural mismatch (React error
  // #418) on any snippet whose language has multi-line comments/strings —
  // confirmed via a server-vs-hydrated-DOM diff on `docusaurus-cards.mdx`
  // (see TODO 0112). `useTokenize` avoids the string-splitting step entirely:
  // it walks Prism's real token tree and only ever hands back whole tokens,
  // already split at line boundaries.
  const grammar = useMemo(
    () => Prism.languages[lang] || Prism.languages.plaintext || Prism.languages.clike,
    [lang],
  );
  const tokenizedLines = useTokenize({ prism: Prism, code, grammar, language: lang });
  // A trailing `\n` in `code` makes normalizeTokens() append one synthetic
  // last "line" holding a single `{ content: "\n", empty: true }` token —
  // drop it so line numbers keep matching `eli5`'s 1-based keys, exactly like
  // the previous `rawLines.pop()` did for a trailing blank line.
  const lines = useMemo(() => {
    const last = tokenizedLines[tokenizedLines.length - 1];
    if (last?.length === 1 && last[0].empty) {
      return tokenizedLines.slice(0, -1);
    }
    return tokenizedLines;
  }, [tokenizedLines]);

  // Compute position: tooltip appears above the badge, right-aligned.
  const positionTooltip = useCallback((lineNum: string) => {
    const el = badgeRefs.current[lineNum];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setTooltipStyle({
      top: rect.top, // translateY(-100%-gap) shifts it above
      right: window.innerWidth - rect.right, // right-align with the badge
    });
  }, []);

  const handleBadgeClick = useCallback(
    (lineNum: string) => setActiveLine((prev) => (prev === lineNum ? null : lineNum)),
    [],
  );

  // Keep the tooltip glued to its badge: position is computed once on
  // hover/focus, but `position: fixed` doesn't move with scrolling — without
  // this, scrolling the page (or the horizontally-scrollable code block)
  // while a tooltip is open leaves it stranded at its old screen position.
  useEffect(() => {
    if (!activeLine) return undefined;
    const reposition = () => positionTooltip(activeLine);
    window.addEventListener("scroll", reposition, { capture: true, passive: true });
    window.addEventListener("resize", reposition, { passive: true });
    return () => {
      window.removeEventListener("scroll", reposition, { capture: true });
      window.removeEventListener("resize", reposition);
    };
  }, [activeLine, positionTooltip]);

  const activeExplanation = activeLine ? eli5[activeLine] : null;

  return (
    <>
      <pre className={clsx(`language-${lang}`, styles.eli5_pre)}>
        <button
          type="button"
          className={styles.eli5_copy_button}
          onClick={() => copy(code)}
          aria-label={copied ? "Copied" : "Copy code to clipboard"}
          title="Copy"
        >
          {copied ? (
            <IconSuccess className={styles.eli5_copy_icon} />
          ) : (
            <IconCopy className={styles.eli5_copy_icon} />
          )}
        </button>
        <code className={`language-${lang}`}>
          {lines.map((lineTokens, i) => {
            const lineNum = String(i + 1);
            const explanation = eli5[lineNum];
            const isActive = activeLine === lineNum;

            return (
              <div key={i} className={styles.eli5_line}>
                <span className={styles.eli5_code}>
                  {lineTokens.map((token, tokenIdx) => (
                    <span key={tokenIdx} className={clsx("token", ...token.types)}>
                      {token.content}
                    </span>
                  ))}
                </span>
                {explanation ? (
                  <span className={styles.eli5_badge_wrapper}>
                    <button
                      type="button"
                      ref={(el) => {
                        badgeRefs.current[lineNum] = el;
                      }}
                      className={clsx(
                        styles.eli5_badge,
                        isActive && styles.eli5_badge_active,
                      )}
                      aria-label={`Explain line ${lineNum}`}
                      aria-expanded={isActive}
                      onClick={() => handleBadgeClick(lineNum)}
                      onMouseEnter={() => {
                        positionTooltip(lineNum);
                        setActiveLine(lineNum);
                      }}
                      onMouseLeave={() => setActiveLine(null)}
                      onFocus={() => {
                        positionTooltip(lineNum);
                        setActiveLine(lineNum);
                      }}
                      onBlur={() => setActiveLine(null)}
                    >
                      ?
                    </button>
                  </span>
                ) : (
                  <span className={styles.eli5_badge_placeholder} />
                )}
              </div>
            );
          })}
        </code>
      </pre>
      {mounted &&
        activeExplanation &&
        tooltipStyle &&
        createPortal(
          <span role="tooltip" className={styles.eli5_tooltip} style={tooltipStyle}>
            {activeExplanation}
          </span>,
          document.body,
        )}
    </>
  );
}

// ELI5 verbose summary — a Show/Hide disclosure rendered below the code block,
// giving a narrative explanation of the whole snippet (as opposed to
// Eli5CodeBlock's per-line tooltips). Kept as its own component, deliberately
// outside Eli5CodeBlock's render tree — see TODO 0112 (open React hydration
// bug on Eli5CodeBlock/<CodeBlock>): this feature must not add surface area
// there. Also kept as a sibling of the collapsible `snippet_content` div
// (not nested inside it): nesting would let this block's own open/close
// change the *inner* scrollHeight without the outer collapsible's height
// (computed once per its own toggle) ever re-measuring, clipping the summary
// whenever a reader opens it after the snippet was already expanded.
interface Eli5SummaryBlockProps {
  summary: string;
}

function Eli5SummaryBlock({ summary }: Eli5SummaryBlockProps): JSX.Element {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState("0px");
  const contentId = `eli5-summary-${useId()}`;

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [open, summary]);

  return (
    <div className={styles.eli5_summary_block}>
      <button
        type="button"
        className={styles.eli5_summary_toggle}
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={contentId}
      >
        <span>{open ? "Hide explanation" : "Explain this snippet"}</span>
        <span className={styles.eli5_summary_toggle_right}>
          <span className={styles.eli5_summary_badge}>Powered by AI</span>
          <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>
            &#9662;
          </span>
        </span>
      </button>
      <div
        ref={contentRef}
        id={contentId}
        className={styles.eli5_summary_content}
        style={{ maxHeight: height }}
      >
        <p className={styles.eli5_summary_text}>{summary}</p>
      </div>
    </div>
  );
}

interface Props {
  filename?: string;
  title?: string;
  code?: string;
  children?: ReactNode;
  defaultOpen?: boolean;
  variant?: string;
  lang?: string;
  eli5json?: string;
  eli5summary?: string;
}

export default function Snippet({
  filename,
  title,
  code,
  children,
  defaultOpen = false,
  variant,
  lang: pluginLang,
  eli5json,
  eli5summary,
}: Props): JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState("0px");

  // Parse eli5json string (injected by remark-snippet-loader) into an object
  const eli5 = useMemo((): Record<string, string> | null => {
    if (!eli5json || typeof eli5json !== "string") return null;
    try {
      return JSON.parse(eli5json);
    } catch {
      return null;
    }
  }, [eli5json]);

  // Verbose narrative explanation (injected by remark-snippet-loader from the
  // same .eli5.json sidecar). Absent on sidecar files generated before this
  // field existed — degrades to simply not rendering the Show/Hide block.
  const eli5Summary =
    typeof eli5summary === "string" && eli5summary.trim() ? eli5summary.trim() : null;

  useEffect(() => {
    if (contentRef.current) {
      setHeight(open ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [open, code, children]);

  const handleToggle = useCallback(() => setOpen((prev) => !prev), []);
  const contentId = `snippet-content-${useId()}`;

  const lang = useMemo(() => {
    // 1. Check for the `lang` prop provided by your plugin
    if (pluginLang) return pluginLang;

    // 2. Fallback to the existing logic for `children`
    const languageFromChildren = getLanguageFromChildren(children);
    if (languageFromChildren) return languageFromChildren;

    // 3. Fallback to the filename extension if no other language is found
    if (typeof filename === "string") {
      const ext = filename.split(".").pop();
      return mapLangToVariant[ext ?? ""] || "plaintext";
    }

    return "plaintext";
  }, [pluginLang, children, filename]);

  // Resolve `%%name=default%%` markers (TODO 0088) before rendering. `code`
  // (from `source=`/`code=`, including files loaded at build time) is plain
  // text feeding Prism, so substitution there is a string swap — no visible
  // "this is yours" underline, which the `children` path below gets for
  // free; an acceptable v1 trade-off, see Vars/readme.md.
  const resolve = useVarResolver();
  const resolvedCode = useMemo(
    () => (code ? substitutePlainText(code, resolve) : code),
    [code, resolve],
  );
  const resolvedChildren = useMemo(
    () =>
      substituteChildren(children, resolve, (name, value, key) => (
        <VarToken key={key}>{value}</VarToken>
      )),
    [children, resolve],
  );

  // Use line-by-line ELI5 renderer when annotations are available and code is a string.
  // Otherwise fall back to Docusaurus CodeBlock (or raw children).
  const codeBlock = useMemo(() => {
    if (resolvedCode && eli5 && Object.keys(eli5).length > 0) {
      return <Eli5CodeBlock code={resolvedCode} lang={lang} eli5={eli5} />;
    }
    if (resolvedCode) {
      return <CodeBlock className={`language-${lang}`}>{resolvedCode}</CodeBlock>;
    }
    return resolvedChildren;
  }, [resolvedCode, eli5, lang, resolvedChildren]);

  const baseName = useMemo(
    () =>
      typeof filename === "string"
        ? (filename.split("/").pop() ?? "").toLowerCase()
        : null,
    [filename],
  );

  const isDockerFile = useMemo(() => {
    if (!baseName) return false;
    return (
      baseName === "dockerfile" ||
      baseName === "docker" ||
      baseName.endsWith(".docker") ||
      baseName.endsWith(".dockerfile") ||
      baseName.endsWith(".dockerignore") ||
      baseName.endsWith("compose.yaml") ||
      baseName.endsWith("compose.yml") ||
      baseName.endsWith("docker-compose.yaml")
    );
  }, [baseName]);

  const isDocusaurus = useMemo(() => baseName === "docusaurus.config.js", [baseName]);

  const variantKey = useMemo(
    () =>
      variant ||
      (isDockerFile ? "docker" : isDocusaurus ? "docusaurus" : mapLangToVariant[lang]) ||
      "none",
    [variant, isDockerFile, isDocusaurus, lang],
  );

  const variantClass = styles[`variant_${variantKey}`] || "";

  // Get icon info if available
  const IconInfo = variantIcons[variantKey] || variantIcons.none;

  const { iconClassName, iconify, ariaLabel } = IconInfo;

  const displayTitle = title || filename || (lang ? lang.toUpperCase() : "Snippet");

  return (
    <div className={clsx(styles.snippet_block, variantClass, "alert alert--info")}>
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
          {displayTitle}
        </span>
        <span className={`${styles.chevron} ${open ? styles.rotate : ""}`}>&#9662;</span>
      </button>

      <div
        ref={contentRef}
        id={contentId}
        className={styles.snippet_content}
        style={{ maxHeight: height }}
      >
        <div className={styles.snippet_inner}>{codeBlock}</div>
      </div>

      {/* Gated on `open`, not just on having a summary: showing this toggle
          while the code itself is collapsed reads as a second, empty
          accordion header stacked directly under the real one. */}
      {open && eli5Summary && <Eli5SummaryBlock summary={eli5Summary} />}
    </div>
  );
}
