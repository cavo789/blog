#!/bin/bash

BASHRC="/home/${OS_USERNAME:-node}/.bashrc"
MARKER="# DEV CONTAINER WELCOME MESSAGE"

if ! grep -qxF "$MARKER" "$BASHRC"; then
    cat <<EOF >> "$BASHRC"
$MARKER

BLOG_HOST_DIR='${BLOG_HOST_DIR}'

alias ls='ls -alh'
alias upgrade='yarn upgrade && yarn upgrade @docusaurus/core@latest @docusaurus/plugin-ideal-image@latest @docusaurus/plugin-sitemap@latest @docusaurus/preset-classic@latest @docusaurus/theme-search-algolia@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest'
alias version='npx docusaurus -V'

echo -e "🚀 Welcome to your Docusaurus Dev Container!"
echo -e ""
echo -e "📚 Quick Commands Reference:"
echo -e ""
echo -e "  📦 \e[33mversion\e[0m      Show current Docusaurus version."
echo -e "  ⬆️  \e[33mupgrade\e[0m      Upgrade Docusaurus core and plugins."
echo -e ""

EOF
fi
