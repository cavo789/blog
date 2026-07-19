// Auto-inject ELI5 explanations if a <source>.eli5.json file exists
const eli5Path = absolutePath + ".eli5.json";
if (fs.existsSync(eli5Path)) {
  try {
    const eli5Raw = fs.readFileSync(eli5Path, "utf-8");
    const eli5Data = JSON.parse(eli5Raw);
    if (eli5Data.explanations && typeof eli5Data.explanations === "object") {
      node.attributes.push({
        type: "mdxJsxAttribute",
        name: "eli5json",
        value: JSON.stringify(eli5Data.explanations),
      });
    }
  } catch (e) {
    console.warn(`Snippet plugin: could not parse ELI5 file ${eli5Path}:`, e.message);
  }
}
