import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type JSX,
} from "react";
import Handlebars from "handlebars";
import clsx from "clsx";

// Generic utility helpers — not domain-specific.
Handlebars.registerHelper("lower", (str: unknown) =>
  typeof str === "string" ? str.toLowerCase() : "",
);

// globLookup value list patternKey valueKey fallback
// Scans `list` for the first entry whose `patternKey` field (a glob: * = any chars, ? = one char)
// matches `value`. Returns that entry's `valueKey` field, or `fallback` if nothing matches.
Handlebars.registerHelper(
  "globLookup",
  (
    value: unknown,
    list: unknown,
    patternKey: unknown,
    valueKey: unknown,
    fallback: unknown,
  ) => {
    const fb = typeof fallback === "string" ? fallback : "";
    if (typeof value !== "string" || !Array.isArray(list)) return fb;
    const pk = typeof patternKey === "string" ? patternKey : "pattern";
    const vk = typeof valueKey === "string" ? valueKey : "value";
    for (const entry of list) {
      if (typeof entry !== "object" || entry === null) continue;
      const row = entry as Record<string, string>;
      const pattern = row[pk];
      if (!pattern) continue;
      const re = new RegExp(
        "^" +
          pattern
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".*")
            .replace(/\?/g, ".") +
          "$",
        "i",
      );
      if (re.test(value)) return row[vk] ?? fb;
    }
    return fb;
  },
);
import IconCopy from "@theme/Icon/Copy";
import IconSuccess from "@theme/Icon/Success";
import Translate, { translate } from "@docusaurus/Translate";
import {
  setOverride,
  subscribe,
  getSnapshot,
  getServerSnapshot,
} from "@site/src/components/Vars/store";
import styles from "./styles.module.css";

// --- Public types ---

export type GlobalFieldDef = {
  name: string;
  label?: string;
  default: string;
  /** When set, renders a section divider heading before this field in the Common settings panel. */
  section?: string;
  /** When true, the value is lowercased before being written to the Vars store. */
  lowercase?: boolean;
};

export type SimpleField = {
  type: "string" | "select";
  name: string;
  label: string;
  default?: string;
  /** String values or label/value pairs when the display label differs from the stored value. */
  options?: (string | { value: string; label: string })[];
};

export type ListField = {
  type: "list";
  name: string;
  label: string;
  fields: SimpleField[];
  defaultRows?: Record<string, string>[];
  /** Wrap the list in a collapse/expand panel. */
  collapsible?: boolean;
  /** Initial collapsed state when collapsible is true. */
  defaultCollapsed?: boolean;
  /** When true, show the × button even on the last remaining row (allows emptying the list). */
  optional?: boolean;
  /**
   * When set, the value of this field in each row is used as a prefix to write
   * every other row field into the Vars store as `{prefix}_{fieldName}`.
   * This lets Terminal/Snippet blocks on the page use %%prefix_fieldName%% tokens
   * that update live when the user edits ConfigGenerator rows.
   * Example: keyField="environment" with row {environment:"test", appUser:"mass_upload"}
   * writes "test_appUser" → "mass_upload" into the Vars store.
   */
  keyField?: string;
};

export type FieldDef = SimpleField | ListField;

export interface ConfigGeneratorProps {
  /** Handlebars template string — inline or imported from a .js file. */
  template: string;
  /**
   * Page-scoped variables from the Vars store. Reading them from this component
   * avoids the reader having to scroll back to the <Vars> bar to change them.
   * Editing a global field here propagates to all %%key%% tokens on the page.
   */
  globalFields?: GlobalFieldDef[];
  /** Component-local fields (string, select, or repeatable list). */
  fields: FieldDef[];
  /** Label shown in the header. */
  title?: string;
  /**
   * When provided, local state is persisted to localStorage under the key `cfg:<storageKey>`.
   * The stored value survives a hard refresh (CTRL+F5); clearing site data resets it.
   */
  storageKey?: string;
}

// --- Internal helpers ---

function humanize(name: string): string {
  const s = name.replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function optionValue(opt: string | { value: string; label: string }): string {
  return typeof opt === "string" ? opt : opt.value;
}

function optionLabel(opt: string | { value: string; label: string }): string {
  return typeof opt === "string" ? opt : opt.label;
}

function buildLocalInitial(fields: FieldDef[]): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const f of fields) {
    if (f.type === "list") {
      out[f.name] = f.defaultRows?.map((r) => ({ ...r })) ?? [
        Object.fromEntries(f.fields.map((sf) => [sf.name, sf.default ?? ""])),
      ];
    } else {
      out[f.name] = f.default ?? "";
    }
  }
  return out;
}

// --- Copy hook (same pattern as Snippet/Eli5CodeBlock) ---

function useCopyToClipboard() {
  const [copied, setCopied] = useState(false);
  const ref = useRef<number | undefined>(undefined);
  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      window.clearTimeout(ref.current);
      setCopied(true);
      ref.current = window.setTimeout(() => setCopied(false), 1200);
    });
  }, []);
  useEffect(() => () => window.clearTimeout(ref.current), []);
  return { copied, copy };
}

// --- Sub-components ---

interface SimpleFieldInputProps {
  field: SimpleField;
  value: string;
  onChange: (v: string) => void;
}

function SimpleFieldInput({
  field,
  value,
  onChange,
}: SimpleFieldInputProps): JSX.Element {
  const uid = useId();
  const id = `cfg-${field.name}-${uid}`;
  if (field.type === "select" && field.options) {
    return (
      <div className={styles.fieldRow}>
        <label htmlFor={id} className={styles.fieldLabel}>
          {field.label || humanize(field.name)}
        </label>
        <select
          id={id}
          className={clsx(styles.fieldInput, styles.fieldSelect)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={optionValue(opt)} value={optionValue(opt)}>
              {optionLabel(opt)}
            </option>
          ))}
        </select>
      </div>
    );
  }
  return (
    <div className={styles.fieldRow}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {field.label || humanize(field.name)}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={id}
          type="text"
          className={clsx(styles.fieldInput, styles.mono)}
          value={value}
          title={value}
          onFocus={(e) => e.currentTarget.select()}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}

// --- Main component ---

export default function ConfigGenerator({
  template,
  globalFields = [],
  fields,
  title,
  storageKey,
}: ConfigGeneratorProps): JSX.Element {
  // Global vars — reads from and writes to the Vars store so changes propagate
  // to every %%key%% token on the page (Terminal, Snippet, Var inline).
  const varsStore = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const handleGlobalChange = useCallback((name: string, value: string) => {
    setOverride(name, value);
  }, []);

  // Local state for component-specific fields
  const [local, setLocal] = useState(() => buildLocalInitial(fields));

  // Load persisted state from localStorage on mount (runs after SSR hydration).
  // Stored format: { local: {...}, globals: { name: value, ... } }
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(`cfg:${storageKey}`);
      if (!raw) return;
      const parsed: {
        local?: Record<string, unknown>;
        globals?: Record<string, string>;
      } = JSON.parse(raw);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: initialising from stored config, runs once on mount
      if (parsed.local) setLocal((prev) => ({ ...prev, ...parsed.local }));
      if (parsed.globals) {
        for (const gf of globalFields) {
          const v = parsed.globals[gf.name];
          if (typeof v === "string") setOverride(gf.name, v);
        }
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps -- storageKey and globalFields are static JSX props
  }, [storageKey]);

  // Persist local state and globalFields on every change; skip the very first
  // render so the load effect above can read the stored value first.
  const isFirstSave = useRef(true);
  useEffect(() => {
    if (isFirstSave.current) {
      isFirstSave.current = false;
      return;
    }
    if (!storageKey) return;
    try {
      const globals: Record<string, string> = {};
      for (const gf of globalFields) {
        globals[gf.name] = varsStore[gf.name] ?? gf.default;
      }
      localStorage.setItem(`cfg:${storageKey}`, JSON.stringify({ local, globals }));
    } catch {}
  }, [storageKey, local, globalFields, varsStore]);

  // Collapse state for collapsible list fields
  const [collapsedLists, setCollapsedLists] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const f of fields) {
      if (f.type === "list" && f.collapsible) {
        init[f.name] = f.defaultCollapsed ?? false;
      }
    }
    return init;
  });

  const toggleList = useCallback((name: string) => {
    setCollapsedLists((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  // Mirror keyed list fields into the Vars store so %%prefix_fieldName%% tokens
  // in Terminal/Snippet blocks on the page update live with ConfigGenerator edits.
  useEffect(() => {
    for (const field of fields) {
      if (field.type === "list" && field.keyField) {
        const rows = local[field.name] as Record<string, string>[];
        for (const row of rows) {
          const prefix = row[field.keyField] ?? "";
          if (!prefix) continue;
          for (const [k, v] of Object.entries(row)) {
            if (k !== field.keyField) {
              setOverride(`${prefix}_${k}`, v);
            }
          }
        }
      }
    }
  }, [local, fields]);

  const setLocalField = useCallback((name: string, value: string) => {
    setLocal((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setListRow = useCallback(
    (listName: string, rowIdx: number, subName: string, value: string) => {
      setLocal((prev) => {
        const rows = (prev[listName] as Record<string, string>[]).map((r, i) =>
          i === rowIdx ? { ...r, [subName]: value } : r,
        );
        return { ...prev, [listName]: rows };
      });
    },
    [],
  );

  const addListRow = useCallback((listName: string, rowFields: SimpleField[]) => {
    setLocal((prev) => {
      const empty = Object.fromEntries(rowFields.map((f) => [f.name, f.default ?? ""]));
      return {
        ...prev,
        [listName]: [...(prev[listName] as Record<string, string>[]), empty],
      };
    });
  }, []);

  const removeListRow = useCallback((listName: string, idx: number) => {
    setLocal((prev) => ({
      ...prev,
      [listName]: (prev[listName] as Record<string, string>[]).filter(
        (_, i) => i !== idx,
      ),
    }));
  }, []);

  const handleClear = useCallback(() => {
    if (!storageKey) return;
    try {
      localStorage.removeItem(`cfg:${storageKey}`);
    } catch {}
    setLocal(buildLocalInitial(fields));
    for (const gf of globalFields) setOverride(gf.name, gf.default);
  }, [storageKey, fields, globalFields]);

  // Collapse state for the "Common settings" group (collapsed by default)
  const [commonOpen, setCommonOpen] = useState(false);

  // Compile template once — recompile only when template string changes.
  const compiled = useMemo(() => {
    try {
      return Handlebars.compile(template, { noEscape: true });
    } catch {
      return null;
    }
  }, [template]);

  // Build Handlebars context from both global and local values.
  const context = useMemo(() => {
    const ctx: Record<string, unknown> = {};
    for (const gf of globalFields) {
      ctx[gf.name] = varsStore[gf.name] ?? gf.default;
    }
    Object.assign(ctx, local);
    return ctx;
  }, [globalFields, varsStore, local]);

  const rendered = useMemo(() => {
    if (!compiled) return "— template syntax error —";
    try {
      return compiled(context);
    } catch (e) {
      return `— render error: ${e instanceof Error ? e.message : String(e)} —`;
    }
  }, [compiled, context]);

  const { copied, copy } = useCopyToClipboard();
  const [wrapLines, setWrapLines] = useState(true);

  return (
    <div className={styles.root}>
      {title && (
        <div className={styles.header}>
          <span className={styles.headerTitle}>{title}</span>
        </div>
      )}

      {/* Left column: common settings + all local fields */}
      <div className={styles.formColumn}>
        {/* Global fields — synced with the Vars store */}
        {globalFields.length > 0 && (
          <div className={styles.group}>
            <button
              type="button"
              className={styles.groupToggle}
              onClick={() => setCommonOpen((v) => !v)}
              aria-expanded={commonOpen}
            >
              <span>
                <Translate id="configgenerator.commonSettings">Common settings</Translate>
              </span>
              <span className={clsx(styles.chevron, commonOpen && styles.chevronOpen)}>
                ▾
              </span>
            </button>
            {commonOpen && (
              <div className={styles.groupFields}>
                {globalFields.map((gf) => (
                  <div key={gf.name} className={styles.globalFieldSlot}>
                    {gf.section && (
                      <span className={styles.sectionDivider}>{gf.section}</span>
                    )}
                    <SimpleFieldInput
                      field={{
                        type: "string",
                        name: gf.name,
                        label: gf.label ?? humanize(gf.name),
                      }}
                      value={varsStore[gf.name] ?? gf.default}
                      onChange={(v) =>
                        handleGlobalChange(gf.name, gf.lowercase ? v.toLowerCase() : v)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Local fields — all rendered inside the left column */}
        <div className={styles.localFields}>
          {fields.map((field) => {
            if (field.type === "list") {
              const rows = local[field.name] as Record<string, string>[];
              const isCollapsed = field.collapsible && collapsedLists[field.name];
              const showRemove = () => (field.optional ? true : rows.length > 1);

              const listContent = (
                <div className={styles.listFieldInner}>
                  {rows.map((row, rowIdx) => (
                    <div key={rowIdx} className={styles.listRow}>
                      <div className={styles.listRowFields}>
                        {field.fields.map((sf) => (
                          <SimpleFieldInput
                            key={sf.name}
                            field={sf}
                            value={row[sf.name] ?? sf.default ?? ""}
                            onChange={(v) => setListRow(field.name, rowIdx, sf.name, v)}
                          />
                        ))}
                      </div>
                      {showRemove() && (
                        <button
                          type="button"
                          className={styles.removeRow}
                          onClick={() => removeListRow(field.name, rowIdx)}
                          aria-label={translate(
                            {
                              id: "configgenerator.removeRow",
                              message: "Remove row {n}",
                            },
                            { n: rowIdx + 1 },
                          )}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    className={styles.addRow}
                    onClick={() => addListRow(field.name, field.fields)}
                  >
                    + <Translate id="configgenerator.addRow">Add</Translate>
                  </button>
                </div>
              );

              // All list fields use the .group container for visual consistency.
              // collapsible controls whether a toggle button is shown.
              return (
                <div key={field.name} className={styles.group}>
                  {field.collapsible ? (
                    <button
                      type="button"
                      className={styles.groupToggle}
                      onClick={() => toggleList(field.name)}
                      aria-expanded={!isCollapsed}
                    >
                      <span>{field.label}</span>
                      <span
                        className={clsx(
                          styles.chevron,
                          !isCollapsed && styles.chevronOpen,
                        )}
                      >
                        ▾
                      </span>
                    </button>
                  ) : (
                    <div className={styles.groupHeader}>
                      <span>{field.label}</span>
                    </div>
                  )}
                  {!isCollapsed && listContent}
                </div>
              );
            }
            return (
              <SimpleFieldInput
                key={field.name}
                field={field}
                value={local[field.name] as string}
                onChange={(v) => setLocalField(field.name, v)}
              />
            );
          })}
        </div>

        {storageKey && (
          <div className={styles.footer}>
            <span className={styles.footerNote}>
              <Translate id="configgenerator.storageNote">
                Saved in this browser only — never sent to any server.
              </Translate>
            </span>
            <button type="button" className={styles.clearBtn} onClick={handleClear}>
              <Translate id="configgenerator.clearStorage">Clear saved values</Translate>
            </button>
          </div>
        )}
      </div>
      {/* end formColumn */}

      {/* Right column: generated output */}
      <div className={styles.output}>
        <div className={styles.outputHeader}>
          <span className={styles.outputLabel}>
            <Translate id="configgenerator.output">Generated config</Translate>
          </span>
          <div className={styles.outputActions}>
            <button
              type="button"
              className={clsx(styles.actionBtn, wrapLines && styles.actionBtnActive)}
              onClick={() => setWrapLines((v) => !v)}
              aria-pressed={wrapLines}
              title={translate({
                id: "configgenerator.wrapLines",
                message: "Wrap lines",
              })}
            >
              ↵
            </button>
            <button
              type="button"
              className={styles.copyBtn}
              onClick={() => copy(rendered)}
              aria-label={
                copied
                  ? translate({ id: "common.copied", message: "Copied" })
                  : translate({
                      id: "common.copyCode",
                      message: "Copy code to clipboard",
                    })
              }
            >
              {copied ? (
                <IconSuccess className={styles.copyIcon} />
              ) : (
                <IconCopy className={styles.copyIcon} />
              )}
              <span>
                {copied ? (
                  <Translate id="common.copied">Copied</Translate>
                ) : (
                  <Translate id="common.copy">Copy</Translate>
                )}
              </span>
            </button>
          </div>
        </div>
        <pre className={clsx(styles.outputPre, wrapLines && styles.outputPreWrapped)}>
          <code>{rendered}</code>
        </pre>
      </div>
    </div>
  );
}
