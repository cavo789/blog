/**
 * Page-scoped store for reader-adjustable values (TODO 0088).
 *
 * Why not React Context: `<Vars>` is declared once, inline, near the top of
 * the article body — a sibling of the `<Terminal>`/`<Snippet>` blocks that
 * need its values, not an ancestor. A Context.Provider can only reach its own
 * children, and MDX gives every top-level block the same flat sibling
 * position, so there is no component that could wrap "the rest of the
 * article" the way a provider normally would. A small external store that
 * every consumer subscribes to independently sidesteps that shape problem —
 * `useSyncExternalStore` is the React-blessed way to read it.
 *
 * SSR safety: `getServerSnapshot` always returns the same empty object, so
 * the server render (and the first client render, before hydration) never
 * see an override — every `%%name=default%%` marker resolves to its own
 * embedded default on first paint, matching the todo's "default = today's
 * text" requirement. A reader's saved value (if any) is applied afterwards,
 * from a mount-only effect in `<Vars>` — never during render — the same
 * "match SSR first, update after mount" shape Docusaurus's own dark/light
 * toggle uses, and the one TODO 0057 (Iconify) got wrong.
 */

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set();
const EMPTY = {};
let overrides = EMPTY;

export function getOverride(name) {
  return overrides[name];
}

export function setOverride(name, value) {
  overrides = { ...overrides, [name]: value };
  listeners.forEach((listener) => listener());
}

export function resetOverrides() {
  if (overrides === EMPTY) return;
  overrides = EMPTY;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return overrides;
}

export function getServerSnapshot() {
  return EMPTY;
}

/**
 * Consumed by `<Terminal>`/`<Snippet>`: returns a `resolve(name, default)`
 * function bound to the current overrides, re-created only when an override
 * actually changes (`useSyncExternalStore` guarantees `overrides` keeps a
 * stable reference between changes — see `setOverride`/`resetOverrides`).
 */
export function useVarResolver() {
  const overrides = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return useCallback(
    (name, defaultValue) => overrides[name] ?? defaultValue,
    [overrides],
  );
}
