---
name: project-components
description: "Custom React components and plugins usable in blog posts — props, variants, usage"
metadata:
  node_type: memory
  type: project
  originSessionId: 771ca3a9-f666-4860-bab3-6091afb7179a
---

## Globally Registered MDX Components

Defined in `src/theme/MDXComponents.js`. Usable in any `.md`/`.mdx` file **without import**.

`AlertBox, BrowserWindow, Card, CardBody, CardFooter, CardHeader, CardImage, Column, Columns, Details, DownloadButton, EmptyFolder, File, Folder, Guideline, Hero, Highlight, Link, LogoIcon, ProjectSetup, Snippet, StepsCard, TabItem, Tabs, Terminal, TLDR, TOCInline, Trees`

Plus all default Docusaurus MDXComponents and a custom lazy-loading `img` handler.

---

## Component Reference

### `<TLDR>`
```jsx
<TLDR>Summary of the article in 2–4 sentences.</TLDR>
```
- Placed immediately after the banner image, before any prose
- Injects JSON-LD Schema.org `abstract` for SEO
- No props beyond `children`

---

### `<AlertBox>`
```jsx
<AlertBox variant="tip" title="Short title">
  Content here. 2–4 sentences max.
</AlertBox>
```
**Valid `variant` values** (urgency order):
`info` | `note` | `tip` | `caution` | `important` | `highlyImportant` | `coreConcept`

- `title` is optional; omit for a titleless box, or make it self-closing if title alone is enough
- Content supports Markdown
- Use bullets inside for multi-point content

---

### `<Terminal>`
```jsx
<Terminal title="user@machine: ~/project" wrap={true}>
$ docker compose up -d

[+] Running 3/3
 ✔ Container app   Started
</Terminal>
```
- `title`: optional string; default `"user@machine: ~/yourproject"`
- `wrap`: boolean, default `true` — enable word wrap for long lines
- Always include `$` prefix on commands; show real output below
- Has built-in copy-to-clipboard button

---

### `<Snippet>`
```jsx
<Snippet
  filename="api/reactions.php"
  source="api/reactions.php"
  defaultOpen={false}
/>
```
- `filename`: displayed label (path as shown to reader)
- `source`: actual file path relative to repo root (or `./files/filename`)
- `defaultOpen`: boolean, default `false`; set `true` for the most important example in a post
- Content is **always live** — reads the real file at build time

---

### `<ProjectSetup>`
```jsx
<ProjectSetup folderName="src/components/MyComponent" createFolder={true}>
  <Guideline>Run `npm install prop-types` first.</Guideline>
  <Snippet filename="src/components/MyComponent/index.js" source="..." defaultOpen={false} />
  <Snippet filename="src/components/MyComponent/styles.module.css" source="..." defaultOpen={false} />
</ProjectSetup>
```
- Renders a collapsible project structure box
- Generates a one-click "install script" button and a ZIP download
- `folderName`: displayed as the project root label
- `createFolder`: boolean, creates the folder in the install script

---

### `<StepsCard>`
```jsx
<StepsCard
  variant="remember"
  title="Key Takeaways"
  steps={[
    { content: "**Step one** — description", substeps: ["detail A", "detail B"] },
    { content: "**Step two** — description" },
    "Simple string step"
  ]}
/>
```
- `variant`: `"steps"` (numbered) | `"prerequisites"` | `"remember"` (💡 bullets)
- `title`: optional header
- `steps`: array of objects `{ content, substeps? }` or plain strings
- Content supports Markdown (bold, inline code, links)

---

### `<Columns>` / `<Column>`
```jsx
<Columns>
  <Column>Left content</Column>
  <Column>Right content</Column>
</Columns>
```

---

### `<Details>`
```jsx
<Details summary="Click to expand">
  Hidden content here.
</Details>
```

---

### `<BrowserWindow>`
```jsx
<BrowserWindow url="https://example.com">
  Screenshot or content here.
</BrowserWindow>
```

---

### `<Highlight>`
Inline text highlight: `<Highlight>key term</Highlight>`

---

### `<Link>`
Used instead of raw `<a>` for internal/external links with proper Docusaurus routing.

---

## Blog-Specific Theme Components (swizzled, not MDX-global)

| Component | Location | Role |
|---|---|---|
| `RelatedPosts` | `src/components/Blog/RelatedPosts/` | Auto-shown at bottom of posts |
| `Bluesky` | `src/components/Bluesky/` | Comments widget, keyed by `blueskyRecordKey` |
| `Reaction` | `src/components/Reaction/` | Helpful/not helpful vote widget |
| `ReadingProgress` | `src/components/ReadingProgress/` | Top progress bar |
| `ScrollToTopButton` | `src/components/ScrollToTopButton/` | Floating back-to-top button |
| `AIIcon` | `src/components/Blog/AIIcon/` | "AI Assisted" badge (triggered by `ai_assisted: true`) |
| `OldPostNotice` | `src/components/Blog/OldPostNotice/` | Banner for old posts |

## Custom Plugins (`plugins/`)

| Plugin | Role |
|---|---|
| `docusaurus-plugin-series-route` | `/series` route |
| `docusaurus-plugin-tag-route` | `/tags` route |
| `remark-replace-terms` | Auto-corrects casing (vscode → VSCode, etc.) |
| `remark-snippet-loader` | Resolves `<Snippet source="">` file content |
| `remark-tree-to-component` | Tree diagrams → React component |
| `blog-feed-plugin` | RSS/Atom feed (max 20 items) |
| `ascii-injector` | Injects ASCII art in HTML comments |

## Swizzled Theme Components

`src/theme/`: `BlogPostItem`, `BlogPostItem/Content`, `BlogPostItem/Header`, `BlogPostItem/Header/Info`, `BlogPostItem/Header/Authors`, `BlogPostPage`, `BlogListPage`, `BlogArchivePage`, `BlogTagsListPage`, `Blog/Components/Author`
