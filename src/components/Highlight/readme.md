# Highlight Component

A lightweight React component for emphasizing inline text with a customizable background color. Designed for use in Docusaurus blog posts or documentation pages.

## 📁 Location

Place the component in your Docusaurus project:

```bash
src/components/Highlight/index.js
```

## 🚀 Usage

Import and use the `Highlight` component in your Markdown or JSX content:

```markdown
import Highlight from '@site/src/components/Highlight';

This is an <Highlight color="#ff4081">important note</Highlight> you shouldn't miss.
```

## 🧩 Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `children` | node | ✅ | — | The content to be highlighted |
| `color` | string | ✅ | — | Background color for the highlight |

## 🎨 Styling

The component applies the following default styles:

* White text (`#fff`)
* Rounded corners (`2px`)
* Padding (`0.2rem`)
* Custom background color via color prop

## 🛠️ Development Notes

* This component is intended for inline use only.
* Avoid nesting block-level elements inside Highlight.

## 📄 License

This component is originally coming from [https://docusaurus.io/docs/markdown-features/react#exporting-components](https://docusaurus.io/docs/markdown-features/react#exporting-components).
