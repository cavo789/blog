---
name: project-components
description: Custom React components and plugins available in blog posts
metadata: 
  node_type: memory
  type: project
  originSessionId: 00c5ecbb-c9bf-4541-b607-05360c5e9363
---

## Key MDX Components (usable in blog posts)
All mapped in `src/theme/MDXComponents.js`.

| Component | Purpose |
|-----------|---------|
| `<Snippet filename="x.js" source="./files/x.js" defaultOpen={false} />` | Import code from `./files/` |
| `<ProjectSetup>` | Standardized setup instructions block |
| `<TLDR>` | Summary block right after banner image |
| `<Highlight>` | Inline text highlight |
| `<Details>` | Collapsible section |
| `<BrowserWindow>` | Browser frame wrapper |
| `<Terminal>` | Terminal output block |
| `<Bluesky recordKey="abc">` | Bluesky comments widget |
| `<Card>` | Reusable card UI |
| `<Columns>` / `<Column>` | Multi-column layout |
| `<StepsCard>` | Numbered steps layout |
| `<DownloadButton>` | File download link |
| `<InteractiveCode>` | Interactive code playground |

## Blog-specific Components (theme overrides)
- `RelatedPosts` — shown at bottom of posts
- `SeriesPosts` / `SeriesCards` — series navigation
- `PostCard` — post listing card
- `Updated` — displays update history
- `OldPostNotice` — banner for old posts

## Custom Plugins (`plugins/`)
| Plugin | Role |
|--------|------|
| `docusaurus-plugin-series-route` | Creates `/series` route |
| `docusaurus-plugin-tag-route` | Creates `/tags` route |
| `remark-replace-terms` | Auto-corrects casing (vscode → VSCode) |
| `remark-snippet-loader` | Loads `<Snippet>` file content |
| `remark-tree-to-component` | Tree diagrams → React component |
| `blog-feed-plugin` | RSS/Atom feed (max 20 items) |
| `ascii-injector` | Injects ASCII art in HTML comments |

## Swizzled Components
- `BlogPostItem` and `BlogPostItem/Content` — custom overrides in `src/theme/`

## Pages
- `src/pages/index.mdx` — homepage
- `src/pages/about.mdx` — about page
- `src/pages/repositories.mdx` — GitHub projects
- `src/pages/series.mdx` — series listing
