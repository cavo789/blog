#!/usr/bin/env node

/**
 * new_post.mjs
 *
 * Objective
 * ---------
 * This script creates a new Docusaurus blog post from a predefined Markdown
 * template and opens it automatically in VS Code.
 *
 * It is designed to be executed from a VS Code task (or manually via Node.js)
 * and enforces a consistent blog post structure across the project.
 *
 * Behavior
 * --------
 * - Prompts for a post title (passed as a CLI argument)
 * - Generates a URL-safe slug from the title
 * - Creates a dated blog post file: blog/YYYY-MM-DD-slug.md
 * - Replaces placeholders in `.tools/templates/new_post.md`
 * - Marks the post as a draft by default
 * - Opens the newly created file in the current VS Code window
 *
 * Usage
 * -----
 * From the command line:
 *
 *   node .tools/scripts/new_post.mjs "My Blog Post Title"
 *
 * From VS Code:
 * - Run the task "Docusaurus: New Post"
 * - Enter the post title when prompted
 *
 * Requirements
 * ------------
 * - Node.js >= 18
 * - A Docusaurus project with:
 *     - blog/ directory
 *     - .tools/templates/new_post.md template
 * - VS Code with the `code` CLI available (default in DevContainers)
 *
 * Notes
 * -----
 * - The script assumes it is executed from the workspace root.
 * - If the target file already exists, execution stops with an error.
 * - Failure to open the file in VS Code does not affect post creation.
 */

import fs from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Usage: new_post "Post title"');
  process.exit(1);
}

const title = args.join(" ");
const slug = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/(^-|-$)/g, "");

const date = new Date().toISOString().split("T")[0];

const root = process.cwd();
const blogDir = path.join(root, "blog");
const filePath = path.join(blogDir, `${date}-${slug}.md`);

if (fs.existsSync(filePath)) {
  console.error("File already exists:", filePath);
  process.exit(1);
}

const templatePath = path.join(root, ".tools/templates/new_post.md");
const template = fs.readFileSync(templatePath, "utf8");

const content = template
  .replaceAll("{{slug}}", slug)
  .replaceAll("{{title}}", `${title}`)
  .replaceAll("{{date}}", date)
  .replaceAll("{{description}}", '""')
  .replaceAll("{{maintag}}", "general")
  .replaceAll("{{tag1}}", "docs")
  .replaceAll("{{tag2}}", "blog");

fs.mkdirSync(blogDir, { recursive: true });
fs.writeFileSync(filePath, content, { encoding: "utf8" });

console.log("New blog post created:", filePath);

import { spawnSync } from "node:child_process";

// Once the .md file is created, open it in the current VS Code window
const result = spawnSync(
  "code",
  ["--reuse-window", "--goto", `${filePath}:1:1`],
  { stdio: "ignore" }
);

if (result.error) {
  console.warn("Post created, but could not open it automatically.");
}
