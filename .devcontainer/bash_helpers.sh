#!/bin/bash

BASHRC="/home/${OS_USERNAME:-node}/.bashrc"
MARKER="# DEV CONTAINER WELCOME MESSAGE"

# Local folder where the blog is stored on the host machine
BLOG_HOST_DIR="/home/christophe/repositories/blog"

if ! grep -qxF "$MARKER" "$BASHRC"; then
    cat <<EOF >> "$BASHRC"
$MARKER

BLOG_HOST_DIR='${BLOG_HOST_DIR}'

alias ls='ls -alh'
alias upgrade='yarn upgrade && yarn upgrade @docusaurus/core@latest @docusaurus/plugin-ideal-image@latest @docusaurus/plugin-sitemap@latest @docusaurus/preset-classic@latest @docusaurus/theme-search-algolia@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest'
alias version='npx docusaurus -V'
alias start='yarn docusaurus clear && yarn docusaurus start'
alias lint='docker run --rm -it --user \$(id -u):\$(id -g) -v \${BLOG_HOST_DIR}:/md peterdavehello/markdownlint markdownlint --fix --config .config/.markdownlint.json --ignore-path .config/.markdownlint_ignore .'
alias spellcheck='docker run --rm -it --user \$(id -u):\$(id -g) -v \${BLOG_HOST_DIR}:/src -w /src ghcr.io/streetsidesoftware/cspell:latest lint . --unique --gitignore --quiet --no-progress --config .vscode/cspell.json'

echo -e "🚀 Welcome to your Docusaurus Dev Container!"
echo -e ""
echo -e "📚 Quick Commands Reference:"
echo -e ""
echo -e "  ▶️  \e[33mstart\e[0m        Start / Restart Docusaurus."
echo -e "  📦 \e[33mversion\e[0m      Show current Docusaurus version."
echo -e "  ⬆️  \e[33mupgrade\e[0m      Upgrade Docusaurus core and plugins."
echo -e ""
echo -e "  🧹 \e[33mlint\e[0m         Lint Markdown files with markdownlint."
echo -e "  📝 \e[33mspellcheck\e[0m   Spell check content with cspell."
echo -e ""

EOF
fi
