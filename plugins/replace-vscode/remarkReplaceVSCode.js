const { visit } = require("unist-util-visit");

// Define replacements as [searchRegex, replacement]
const replacements = [
  [/\bdocusaurus\b/g, "Docusaurus"],
  [/\bgithub\b/g, "GitHub"],
  [/\bmarkdown\b/g, "Markdown"],
  [/\bvscode\b/g, "VSCode"],
];

function remarkReplaceWords() {
  return (tree, file) => {
    visit(tree, "text", (node, index, parent) => {
      if (typeof node.value !== "string") return;

      // Skip inside certain node types (URLs, code, etc.)
      const forbiddenParents = ["link", "image", "inlineCode", "code"];
      if (parent && forbiddenParents.includes(parent.type)) {
        return;
      }

      let original = node.value;

      for (const [regex, replacement] of replacements) {
        node.value = node.value.replace(regex, (match, offset, fullString) => {
          const before = fullString[offset - 1] || "";
          const after = fullString[offset + match.length] || "";

          // Skip compound words like "vscode-docker", "foo.markdown"
          if (
            ["-", ".", "/"].includes(before) ||
            ["-", ".", "/"].includes(after)
          ) {
            return match;
          }

          // console.log(
          //   `🔎 Replacing '${match}' with '${replacement}' in file: ${file.path}\nSentence: ${fullString}`
          // );
          return replacement;
        });
      }
    });
  };
}

module.exports = remarkReplaceWords;
