# 🖥️ BrowserWindow Component

A lightweight React component that visually simulates a browser window. Ideal for showcasing UI previews, code output, or embedded content in a familiar framed layout. Originally inspired by Docusaurus's internal design components.

## 📦 Features

* Mimics a browser window with address bar and control buttons
* Customizable `url`, `minHeight`, and inline styles
* Accepts any JSX content as its body
* Styled using CSS Modules for easy theming

## 📦 Installation

Make sure your project uses React and Docusaurus 3.x. Then place the component in your desired location:

```bash
src/components/BrowserWindow/IframeWindow.tsx
src/components/BrowserWindow/index.tsx
src/components/GithubProjects/styles.module.css
```

## 🚀 Usage

In your Markdown document (should be a `.mdx` file), add something like:

```markdown
import BrowserWindow from './BrowserWindow';

<BrowserWindow url="https://example.com" minHeight={300}>
  <div style={{ padding: '1rem' }}>
    <h2>Hello from inside the browser!</h2>
    <p>This is a preview of your component or output.</p>
  </div>
</BrowserWindow>
```

## 🧾 Props

| Prop | Type | Required | Default | Description |
| --- |  --- | --- | --- | --- |
| `children` | JSX.Element | ✅ | — | Content to render inside the simulated browser window |
| `url` | string | ✅ | —  | URL to display in the address bar (visual only) |
| `minHeight` | number | ❌ | — | Minimum height of the window body |
| `style` | CSSProperties | ❌ | — | Inline styles for the outer container |
| `bodyStyle` | CSSProperties | ❌ | — | Inline styles for the body content area |

## 🎨 Styling

This component uses CSS Modules (`styles.module.css`) for scoped styling. You can customize:

* `.browserWindow`: outer container
* `.browserWindowHeader`: header bar with buttons and address
* `.browserWindowBody`: content area
* `.dot`: colored control buttons
* `.bar`: menu icon lines

## 🧠 Notes

* The `url` prop is purely decorative—it does not affect navigation or iframe behavior.
* This component is great for documentation, demos, or design previews.
* Inspired by Docusaurus’s internal theme components.
