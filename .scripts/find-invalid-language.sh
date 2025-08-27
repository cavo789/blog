#!/bin/bash

BLOG_DIR="./blog"
SNIPPET_DIR="./src/components/Snippet"

# Liste de langages supportés par PrismJS (vérifié pour Prism 1.29+ utilisé par Docusaurus 3.x)
# Tu peux l'étendre ou automatiser avec un appel à Prism directement.
# Liste à jour https://prismjs.com/#supported-languages
SUPPORTED_LANGS=(
  "abap" "abnf" "actionscript" "ada" "agda" "al" "antlr4" "apacheconf"
  "apex" "apl" "applescript" "aql" "arduino" "arff" "asciidoc" "asm"
  "aspnet" "autohotkey" "autoit" "bash" "basic" "batch" "bbcode" "bicep"
  "birb" "bison" "bnf" "brainfuck" "brightscript" "bro" "bsl" "c"
  "clike" "cmake" "coffeescript" "cobol" "concurnas" "cpp" "csharp"
  "csp" "css" "css-extras" "csv" "cue" "cypher" "d" "dart" "dataweave"
  "dax" "dhall" "diff" "django" "dns-zone-file" "docker" "dot"
  "ebnf" "editorconfig" "eiffel" "ejs" "elixir" "elm" "erb" "erlang"
  "etlua" "excel-formula" "factor" "false" "firestore-security-rules"
  "flow" "fortran" "fsharp" "ftl" "gap" "gcode" "gdscript" "gedcom"
  "gherkin" "git" "glsl" "gml" "go" "graphql" "groovy" "haml"
  "handlebars" "haskell" "haxe" "hcl" "hlsl" "hoon" "hpkp" "hsts"
  "html" "http" "ichigojam" "icon" "icu-message-format" "idris"
  "ignore" "inform7" "ini" "io" "j" "java" "javadoc" "javadoclike"
  "javastacktrace" "jexl" "jolie" "jq" "js" "jsdoc" "json" "json5"
  "jsonp" "jsstacktrace" "jsx" "julia" "kotlin" "kumir" "kusto"
  "latex" "latte" "less" "lilypond" "liquid" "lisp" "livescript"
  "llvm" "log" "lolcode" "lua" "makefile" "markdown" "markup"
  "markup-templating" "matlab" "maxscript" "mel" "mermaid" "mizar"
  "mongodb" "monkey" "moonscript" "n1ql" "n4js" "nand2tetris-hdl"
  "nasm" "neon" "nevod" "nginx" "nim" "nix" "none" "nsis"
  "objectivec" "ocaml" "opencl" "openqasm" "oz" "parigp" "parser"
  "pascal" "pascaligo" "pcaxis" "peoplecode" "perl" "php" "phpdoc"
  "plsql" "powerquery" "powershell" "processing" "prolog" "promql"
  "properties" "protobuf" "pug" "puppet" "pure" "python" "q"
  "qsharp" "qml" "r" "racket" "razor" "rego" "renpy" "rescript"
  "rest" "rip" "roboconf" "robotframework" "ruby" "rust" "sas"
  "sass" "scala" "scheme" "scss" "shell" "shell-session" "smali"
  "smalltalk" "smarty" "sml" "solidity" "solution-file" "soy"
  "sparql" "splunk-spl" "sqf" "sql" "squirrel" "stan" "stata"
  "stylus" "svg" "swift" "systemd" "t4-cs" "t4-templating" "t4-vb" "tap"
  "tcl" "textile" "toml" "turtle" "twig" "typescript" "typoscript"
  "unrealscript" "vala" "vbnet" "velocity" "verilog" "vhdl" "vim"
  "visual-basic" "warpscript" "wasm" "wiki" "wolfram" "xeora"
  "xml" "xml-doc" "xquery" "xojo" "xquery" "yaml" "yang" "zig"
)

# Table de correspondance des alias non supportés => Prism
declare -A ALIASES=(
  ["c#"]="csharp"
  ["c++"]="cpp"
  ["dockerfile"]="docker"
  ["dotenv"]="ini"
  ["dotnet"]="vbnet"
  ["env"]="ini"
  ["javascript"]="js"
  ["JavaScript"]="js"
  ["md"]="markdown"
  ["ps1"]="powershell"
  ["py"]="python"
  ["sh"]="bash"
  ["text"]="none"
  ["ts"]="typescript"
  ["txt"]="none"
  ["yml"]="yaml"
)

echo "🔍 Recherche des blocs de code dans $BLOG_DIR..."

LANGS_FOUND=$(grep -rhoP '```[a-zA-Z0-9+#-]+' "$BLOG_DIR" --include="*.md" --include="*.mdx" 2>/dev/null | sed 's/```//' | sort -u)

# echo "📦 Langages trouvés dans les fichiers Markdown :"
# echo "$LANGS_FOUND"
# echo ""

echo "📋 Vérification du support Prism et des logos SVG :"
while read -r lang; do
  [[ -z "$lang" ]] && continue

  lcase=$(echo "$lang" | tr '[:upper:]' '[:lower:]')

  # Vérifie support direct
  if printf '%s\n' "${SUPPORTED_LANGS[@]}" | grep -qx "$lcase"; then
    # Vérifie si le logo SVG existe
    logo_path="${SNIPPET_DIR}/${lcase}-logo.svg"
    if [[ -f "$logo_path" ]]; then
      echo "✅ $lang → supporté | 🖼️ logo : ✅"
    else
      echo "✅ $lang → supporté | 🖼️ logo : ❌ (manquant : ${lcase}-logo.svg)"
    fi

  elif [[ ${ALIASES[$lcase]+_} ]]; then
    echo "⚠️  $lang → non supporté → Suggestion : ${ALIASES[$lcase]}"
  else
    echo "❌ $lang → non supporté (aucune suggestion)"
  fi
done <<< "$LANGS_FOUND"