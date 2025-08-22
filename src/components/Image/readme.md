# 🖼️ Image Component

A simple and reusable React component for rendering images in Docusaurus with proper base URL resolution. This ensures that your image paths work correctly across different environments and deployment setups.

## 🚀 Features

* ✅ Resolves image paths using `useBaseUrl()`
* 🧩 Supports `alt` and `title` attributes
* 🎨 Scoped styling via CSS modules
* 💤 Lazy loading for performance

## Example

Out-of-the-box, here is how the component will looks like:

![Example](sample.png)

## 📦 Installation

Place the component in your Docusaurus project:

```bash
src/components/Image/Image.js
src/components/Image/styles.module.css
```

## 🧪 Usage

```jsx
import Image from "@site/src/components/Image";

<Image
  img="/img/logo.png"
  alt="Site Logo"
  title="Welcome to My Site"
/>
```

## 🧾 Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `img` | string | ✅ | — | Relative path to the image file |
| `alt` | string | ❌ | — | Alternative text for screen readers |
| `title` | string | ❌ | — | Tooltip text shown on hover |

## 🛠️ Notes

Images should be stored in the static/img directory for proper resolution.

The component uses lazy loading (`loading="lazy"`) to improve page performance.

Styling is applied via `styles.container` from `styles.module.css`.

## 📄 License

MIT — free to use, modify, and contribute.
