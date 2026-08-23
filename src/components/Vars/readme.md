# 🎛️ Vars Component

Lets a reader adapt a repeated value — a host port, a container name, a version — to their own
machine **once**, instead of mentally substituting it on every command down the article. See
TODO 0088 (`.todos/`) for the original brief.

## 📁 Location

This component lives at `src/components/Vars/index.js`.

## 🚀 Usage

Declare the variables once, near the top of the article (after the intro, before the first
`<Terminal>`/`<Snippet>` that uses one):

```jsx
<Vars port="80" name="static-site" />
```

Then mark every occurrence inside a `<Terminal>` or `<Snippet>` block with
`%%name=default%%` — the default **repeated inline**, not looked up elsewhere:

```jsx
<Terminal>
  $ docker run -d --name %%name=static-site%% -p %%port=80%%:80 httpd:2.4
</Terminal>
```

Without any reader interaction, this renders exactly as `docker run -d --name static-site -p
80:80 httpd:2.4` — the marker is invisible in the output, only the dotted underline (a
permanent "this value is yours" affordance) shows it's adjustable.

### Optional: friendlier field labels

```jsx
<Vars
  port="80"
  name="static-site"
  labels={{ port: "Host port", name: "Container name" }}
/>
```

Without `labels`, a field label is derived from the prop name (`port` → "Port",
`phpVersion` → "Php version").

## 🛠 Props

| Prop     | Type                 | Required     | Description                                                                                          |
| -------- | -------------------- | ------------ | ---------------------------------------------------------------------------------------------------- |
| `[name]` | string               | at least one | Any other prop is treated as a declared variable: its name is the marker key, its value the default. |
| `labels` | `{ [name]: string }` | ❌           | Friendlier input label per variable, keyed by variable name.                                         |

## Why `%%name=default%%`

Two syntaxes were rejected first:

- `{{name:default}}` — a `<Terminal>`/`<Snippet>` used with literal inline MDX children (no
  `source=` — the common case) has its content parsed as MDX, and a bare `{` there opens a JS
  expression rather than staying literal text: `{{port:80}}` would either fail to compile
  (`port:80` isn't a valid expression) or silently mean something else.
- `%%name:default%%` — closer, but the colon still trips `plugins/markdown-export-plugin/degrade.cjs`,
  which parses the raw article with `remark-directive` (for `:::tip` admonitions); that plugin's
  inline `:name` syntax false-positives on any `word:word` text, logging a spurious "unknown
  directive" warning for every marker. Confirmed empirically while building this component.

`%` carries no meaning in Markdown/MDX/YAML and `=` doesn't trigger remark-directive, so
`%%name=default%%` is safe both inline and loaded from a `source=` file, and silent in the
export tool. See `substitute.js` for the full contract, shared verbatim (as a second,
independent copy of the same regex) by `degrade.cjs` for the exported `.md`/`llms.txt`.

## How it works

- **`store.js`** — a small external store (`useSyncExternalStore`), not React Context: `<Vars>`
  sits as a sibling of the `<Terminal>`/`<Snippet>` blocks that need its values, not an
  ancestor, so there's no component that could wrap "the rest of the article" the way a
  Provider normally would. `getServerSnapshot` always returns "no override," so SSR and the
  first client render show the marker's own embedded default — a reader's saved value (if any)
  is applied afterwards, from a mount-only effect, never during render.
- **`substitute.js`** — parses `%%name=default%%`, shared by `Terminal` and `Snippet`.
- **`VarToken.js`** — renders one resolved marker as a `<span>` with the permanent dotted
  underline; deliberately takes its resolved value as `children` (not a custom `value` prop) so
  `Terminal`'s copy button — which recurses into `element.props.children` for any element it
  doesn't otherwise recognize — copies the live value for free.
- **Pinned trigger** — the inline bar is the only UI while it's on screen. Once it scrolls out
  of view (an `IntersectionObserver` on the bar itself), a compact button appears bottom-right
  (rendered through a portal into `document.body`, same rationale as `Snippet`'s ELI5 tooltip)
  and unfolds the same fields on click. A full-width `position: sticky` bar was considered and
  rejected: it would fight Docusaurus's own sticky navbar/table of contents and permanently eat
  reading height.
- **Persistence** — `localStorage`, keyed by the article's own path (`docusaurus:vars:<pathname>`),
  so a reader's values survive a reload of _that_ article but never leak into another one.

## Explicit scope (see AGENTS.md)

Only `<Terminal>` and `<Snippet>` resolve markers. A raw ` ``` ` fenced code block is not
scanned — use `<Snippet>` instead. An inline single-backtick code span in prose is never
auto-rewritten, even when the same value is marked elsewhere on the page — scanning free-form
prose for values that merely look like a marked one risks rewriting a sentence that wasn't about
that value at all. When a prose sentence genuinely states the value as a fact (not a passing
mention), use `<Var>` (below) instead of a code span.

### `<Var>` — the inline sibling, for prose

`Var.js` is a separate, small component for exactly one case: a sentence in plain prose states a
reader-adjustable value as a fact, e.g. _"the `kingsbridge` name won't be considered."_ A marker
can't help here — MDX text nodes are never routed through `substituteChildren`, so a
`%%name=default%%` typed directly into a paragraph would render as literal, unresolved text.
`<Var>` is a real component instead, reading from the same store:

```jsx
For now, the <Var name="name">kingsbridge</Var> name won't be considered.
```

Its child is the plain default string — the `=default` half of a marker, not a marker itself
(there is nothing to parse). Keep it identical to the value the sibling `<Vars>` declares for
that name. Reserve it for sentences that state the value as a fact the reader would expect to
update, not every passing mention — wrapping every word turns prose into a wall of dotted
underlines. A `<BrowserWindow url="...">` prop or an image caption can never use it either way:
JSX components don't work inside string props, so a screenshot's own URL/caption stays static
even after a reader edits the value — an inherent limit, not a bug.

`<Snippet>`'s `code` string path (`source=`/`code=`) resolves the same markers, but as a plain
text swap before the string reaches Prism — no dotted-underline token there, since injecting a
`<span>` into already-highlighted HTML risks splitting a token mid-character. Only `<Snippet>`
used with literal inline children gets the visual token, same as `<Terminal>`.

## 📄 License

MIT — free to use and modify.

## 💬 AI generated

This code has been generated by Christophe Avonture using Claude Code.
