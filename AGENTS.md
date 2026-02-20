# Gemini Code Assist - Governance Guidelines

This document outlines the governance guidelines to be followed for maintaining code quality and consistency across the project.

## Project Overview

* **Name:** cavo789/blog
* **Stack:** Docusaurus (Latest version), React, JavaScript (ES6+).
* **Goal:** Personal technical blog focused on high-quality, clean, and modular code.
* **Production URL:** https://www.avonture.be
* **Repository:** https://github.com/cavo789/blog
* **Development URL:** http://localhost:3000

## Coding Standards & Philosophy

* **Modular Design:** Follow the Single Responsibility Principle (SRP). Keep components and functions short and focused.
* **Strict Typing:** Always use ReactJS for React components. As much as possible prefer self-describing code. Add proper type annotations. Add prop-types.
* **Language:**
  * **Code & Comments:** Strictly **American English**. No French comments or documentation allowed within the codebase.
  * **Content:** The blog posts are written in **American English**. Always suggest correction if you see typos or better way to write things.
* **Styling:** Support both Dark and Light modes using Docusaurus/Infima CSS variables. Avoid hardcoded hex colors. Use CSS files instead of inline styles.

## React & Docusaurus Best Practices

* **Functional Components:** Use React functional components with Hooks. No Typescript at all.
* **Modular CSS:** Prefer CSS Modules or Docusaurus-native styling approaches.
* **Component Structure:** Store reusable components in `@site/src/components`.
* **Performance:** Optimize builds using multi-stage Docker builds (BuildKit).
* **Docusaurus version:** Always use the latest stable version of Docusaurus.

## Tooling & Quality Control

* **Linters:** Code and Markdown must be compatible with strict linting (ESLint, Prettier, Dockerlint, Markdownlint).
* **Docker:**
  * Always use `compose.yaml` (no version key; no obsolete fields/syntax).
  * Optimize layers and use host volume caching.
  * Containers must be read-only where possible with `tmpfs`.
  * Use `id_ed25519.pub` for SSH-related configurations.
* **DevContainer:** Use the provided `.devcontainer/devcontainer.json`. Ensure UID/GID are detected dynamically (don't use hardcoded UID/GID).

## AI Interaction Instructions

1. **Critical Coach:** Act as a critical coding partner. If a proposed solution is not "best-in-class," suggest a better alternative. Code quality is the key.
2. **Concise Responses:** Be direct and practical. Focus on code quality and technical accuracy.
3. **No Legacy:** Do not suggest obsolete Docker fields or old React patterns (no Class components).
4. **Validation:** Before providing code, ensure it passes theoretical strict typing and follows the modular architecture of the project.

## Docker-First Approach

A **Docker-first** methodology is mandatory. All development, testing, and deployment processes should be containerized to ensure a consistent and reproducible environment. Please refer to the existing `Dockerfile` and `compose.yaml` files as a baseline.

## Blog Content Guidelines

* **Language:** All blog posts must be written in clear, concise American English.
* **Structure:** Follow the established format for blog posts: `YYYY/MM/DD/slug/index.md'.
* **Relative Resources:** Use relative paths like `./files/` or `./images/` for files to include or images (Co-location pattern).
* **Import code snippets:** Use the `Snippet` component to import code snippets from external files for better maintainability. Don't use inline code blocks but create separate files in the `files/` sub-folder. For instace, instead of writing code directly in the blog post, create a file like `files/example.js` and import it using the `Snippet` component like this: <Snippet filename="example.js" source="./files/example.js" defaultOpen={false} />.
* **ProjectSetup:** Use the `ProjectSetup` component for setup instructions.
* **Unpublished Posts:** These are posts that are not yet ready for publication and should be excluded from the main blog feed. They are stored in the `.unpublished/` directory. Ensure that these posts are properly marked (i.e. with `Draft: true` in their frontmatter) and not linked from published content.
* **Homepage:** The homepage is located in `src/pages/index.mdx`. Any changes to the homepage layout or content should be made here.
* **Syntax:** Prefer Markdown to HTML for blog content. Use MDX only when necessary for embedding React components.

## Project Structure & Infrastructure

### Infrastructure

* **Docker:** The project uses a multi-stage `Dockerfile` (base, dependencies, development, build, production) and `compose.yaml` for orchestration.
* **Automation:** A `makefile` is used to simplify common commands (`make build`, `make up`, `make devcontainer`).
* **Development Environment:** VSCode DevContainers are supported for a consistent development experience.
* **Deployment:** GitHub Actions are used for CI/CD, deployment is coded in file .github/workflows/deploy.yml.

### Directory Structure

* **Blog Posts:** Located in `blog/`. Format: `YYYY/MM/DD/slug/index.md`.
* **Components:** Custom React components are located in `src/components/`.
* **Data:** Static data files (e.g., series definitions) are located in `src/data/`.
* **Plugins:** Custom local plugins are located in `plugins/`.
* **Static Assets:** Global images and static files are in `static/`. Blog-specific images are co-located in the blog post folder (e.g., `blog/YYYY/MM/DD/slug/images/`).

### Key Custom Components

* **Blog Enhancements:** `RelatedPosts`, `SeriesPosts`, `SeriesCards`, `PostCard`, `Updated`, `OldPostNotice`.
* **UI Elements:** `Card` (reusable), `Snippet` (code blocks), `LogoIcon`, `ScrollToTopButton`, `Image` (custom rendering), `Bluesky` (share/comments).

### Customization & Overrides

* **Swizzling:** The project overrides standard Docusaurus theme components, notably `BlogPostItem` and `BlogPostItem/Content`.
* **MDX Components:** Custom mappings are defined in `src/theme/MDXComponents.js` (e.g., for `Snippet`, `Image`, `Highlight`).
* **Plugins:** Several custom plugins are used for features like RSS feed customization, ASCII art injection, snippet loading, and term replacement.

## VSCode

* **Snippets:** Custom VSCode snippets are provided in `.vscode/markdown.code-snippets` for common patterns and components.
* **Settings:** Recommended settings are in `.vscode/settings.json` to ensure consistent formatting and linting.

## Instructions for Gemini/Jules

* Minimize confirmation prompts for routine code generation.
* When generating new React components for Docusaurus, apply changes directly.
* I prefer to review changes via Git diff rather than manual 'Accept' buttons.
