# 🔗 QuickJump Component

A compact strip of in-page anchor links, meant to sit right after the `<!-- truncate -->` line
so a reader can jump straight to the section they need instead of scrolling.

## 📁 Location

This component lives at `src/components/QuickJump/index.tsx`.

## 🚀 Usage

```jsx
<!-- truncate -->

<QuickJump
  links={[
    { label: "All Files at a Glance", to: "#all-files-at-a-glance" },
    { label: "See it in Action", to: "#result" },
  ]}
/>
```

The `to` value is whatever the `Link` component accepts — most often an in-page anchor matching
a `##` heading's auto-generated slug (visible in the URL bar on hover, or via `yarn build`'s
generated HTML), but a relative link to another article also works.

## 🛠 Props

| Prop    | Type                              | Required | Default      | Description                          |
| ------- | --------------------------------- | -------- | ------------ | ------------------------------------ |
| `links` | `{ label: string, to: string }[]` | ✅       | —            | Ordered list of links to render.     |
| `title` | `string`                          | ❌       | `Quick Jump` | Label prefix shown before the links. |

Renders nothing (`null`) when `links` is empty.

## When to use it

Best on longer articles with two or more "destinations" a reader might want without reading
linearly — most often an article built around `<ProjectSetup>`, where "give me the files" and
"show me it working" are two different intents. Not for every post: a short, single-thread
article doesn't need it, and it shouldn't compete with the `<TLDR>` for the reader's first
glance.

## 📄 License

MIT — free to use and modify.
