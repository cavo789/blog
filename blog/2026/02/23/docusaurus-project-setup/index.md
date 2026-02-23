---
slug: docusaurus-project-setup
title: Introducing the ProjectSetup Component - A Standardized Way to Share Project Structures
description: Learn how to use the new ProjectSetup component to easily share project structures in your Docusaurus blog posts, complete with interactive file snippets and automated setup scripts.
authors: [christophe]
image: /img/v2/project_setup.webp
series: Creating Docusaurus components
mainTag: component
tags: [docusaurus]
date: 2026-02-23
ai_assisted: true
---
![Introducing the ProjectSetup Component - A Standardized Way to Share Project Structures](/img/v2/project_setup.webp)

<TLDR>
The `ProjectSetup` component is a new tool for Docusaurus that allows you to share project structures in a standardized and interactive way. It displays file structures with collapsible snippets, generates setup scripts, and offers ZIP downloads, making it easier for readers to replicate projects from your blog posts.
</TLDR>

In my blog, I often share components that I have created for Docusaurus. To enable readers to easily reproduce these projects, I was looking for an interactive and standardized way to share file trees. This led me to create the `ProjectSetup` component.

It allows you to display the structure of a project in a clear and interactive way, with code snippets for each file. But its real power, its "**killer feature**" is this: with a single click on the **“Generate install script”** button, you get a shell command. Copy it, paste it into your Linux terminal, run it, and... that's it. The entire project tree, including folders and files, is created for you.

For those who prefer, the component also offers the option to download the project as a ZIP file. In this article, I'll show you how it works and how you can integrate it to effectively share your own projects.

<!-- truncate -->

## What is ProjectSetup?

`ProjectSetup` is a React component that allows you to display a project's file structure in a clean, interactive, and standardized way. It not only shows the files and their content but also provides tools to scaffold the project with a single command or download it as a ZIP file.

This post illustrates how to use the `ProjectSetup` component to share project structures in your Docusaurus blog posts, making it easier for your readers to replicate and learn from your projects.

## Core Features

* **Interactive File Viewing**: It displays files in collapsible snippets, with syntax highlighting.
* **Shell Script Generation**: It automatically generates a bash script to create the entire folder and file structure.
* **ZIP Download**: It allows users to download the complete project as a ZIP archive.
* **Post-installation Guidelines**: You can add instructions to be displayed after the setup.

## Dependencies

The `ProjectSetup` component relies on two other components:

1.  **`LogoIcon`**: A simple component that renders an icon based on the file type, making the UI more intuitive. It uses the popular `@iconify/react` library. Logo Icon has been created by <img alt="Docux" src="/img/docux.webp" style={{border: "none", borderRadius: 0, height: "1.2em", verticalAlign: "middle", margin: "0 0.2em"}} /> <Link to="https://github.com/Juniors017">Docux</Link>, please check out his work: <Link to="https://docuxlab.com/blog/logoicon-component-docusaurus/">Component LogoIcon</Link>.
2.  **`Snippet`**: This component is responsible for displaying individual files. It's a collapsible container that shows the filename, a relevant icon, and the code within. Read my previous article on this subject: <Link to="/blog/docusaurus-snippets">A component for showing code snippets in a Docusaurus blog</Link>

## How to Use It

The best way to show you how to use `ProjectSetup` is to use the component itself. Here is how you can install the `LogoIcon`, `Snippet`, and `ProjectSetup` components in your own Docusaurus project.

### 1. Installing `LogoIcon`

First, you need to install `@iconify/react`. Then, create the `LogoIcon` component.

<ProjectSetup folderName="src/components/Blog/LogoIcon">
  <Guideline>
    Install the dependency: `npm install @iconify/react`
  </Guideline>
  <Snippet filename="src/components/Blog/LogoIcon/index.js" source="src/components/Blog/LogoIcon/index.js" defaultOpen={false} />
</ProjectSetup>

At this stage, you can think, oh damned, it can be tedious to write the HTML code behind this nice **📦 Project setup: src/components/Blog/LogoIcon** box here above. In fact, not at all. All the rendering is handled by the `ProjectSetup` component itself. Here below the Markdown code I've written in my Docusaurus article:

```markdown
<ProjectSetup folderName="src/components/Blog/LogoIcon">
  <Guideline>
    Install the dependency: `npm install @iconify/react`
  </Guideline>
  <Snippet filename="src/components/Blog/LogoIcon/index.js" source="src/components/Blog/LogoIcon/index.js" />
</ProjectSetup>
```

<AlertBox variant="tip" title="Always up-to-date">
And you know what? The `Snippet` component used here is smart enough to read the file structure and content of the `src/components/Blog/LogoIcon/index.js` file, and to render it in this nice interactive way. You just have to write the Markdown code above, and the component does the rest. Your documentation is always up-to-date with the actual file content, and you don't have to worry about formatting or styling. You just write the Markdown code, and the component takes care of the rest.
</AlertBox>

### 2. Installing `Snippet`

Now, let's set up the `Snippet` component. It has more dependencies.

<ProjectSetup folderName="src/components/Snippet">
  <Guideline>
    Install dependencies: `npm install prop-types clsx`
  </Guideline>
  <Snippet filename="src/components/Snippet/index.js" source="src/components/Snippet/index.js" defaultOpen={false} />
  <Snippet filename="src/components/Snippet/styles.module.css" source="src/components/Snippet/styles.module.css" defaultOpen={false} />
</ProjectSetup>

### 3. Installing `ProjectSetup`

Finally, here's how to install the `ProjectSetup` component itself.

<ProjectSetup folderName="src/components/ProjectSetup">
  <Guideline>
    Install dependencies: `npm install jszip`
  </Guideline>

  <Snippet filename="src/components/ProjectSetup/index.js" source="src/components/ProjectSetup/index.js" defaultOpen={false} />
  <Snippet filename="src/components/ProjectSetup/styles.module.css" source="src/components/ProjectSetup/styles.module.css" defaultOpen={false} />
</ProjectSetup>

### 4. The project_setup help page

In the ProjectSetup component, there is a help page that provides instructions on how to use the component. You can customize this page by editing the `src/pages/project_setup.mdx` file. Here is mine:

<Snippet filename="src/pages/project_setup.mdx" source="src/pages/project_setup.mdx" defaultOpen={false} />

## Conclusion

The `ProjectSetup` component is a powerful tool for sharing project structures in your Docusaurus blog posts. It provides an interactive way for readers to explore the file structure, generates setup scripts, and offers ZIP downloads, making it easier for them to replicate your projects. By using this component, you can enhance the learning experience for your readers and encourage them to engage more deeply with your content.
