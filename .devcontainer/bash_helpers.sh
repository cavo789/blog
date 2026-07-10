#!/bin/bash

BASHRC="/home/${OS_USERNAME:-node}/.bashrc"
MARKER="# DEV CONTAINER WELCOME MESSAGE"

# Local folder where the blog is stored on the host machine
BLOG_HOST_DIR="${HOST_PROJECT_DIR:-/opt/docusaurus}"

if ! grep -qxF "$MARKER" "$BASHRC"; then
    cat <<EOF >> "$BASHRC"
$MARKER

BLOG_HOST_DIR='${BLOG_HOST_DIR}'

alias ls='ls -alh --color=auto'
alias upgrade='yarn upgrade && yarn upgrade @docusaurus/core@latest @docusaurus/plugin-ideal-image@latest @docusaurus/plugin-sitemap@latest @docusaurus/preset-classic@latest @docusaurus/theme-search-algolia@latest @docusaurus/module-type-aliases@latest @docusaurus/types@latest'
alias version='npx docusaurus -V'
alias build='yarn docusaurus clear && yarn docusaurus build'
alias serve='yarn run serve --port 3001'
alias start='pkill -f "docusaurus start" 2>/dev/null; sleep 1; yarn docusaurus clear && HTTPS=true SSL_CRT_FILE=localhost.pem SSL_KEY_FILE=localhost-key.pem yarn docusaurus start --host 0.0.0.0 --port 3000'
alias lint='docker run --rm -it --user \$(id -u):\$(id -g) -v \${BLOG_HOST_DIR}:/md peterdavehello/markdownlint markdownlint --fix --config .config/.markdownlint.json --ignore-path .config/.markdownlint_ignore .'
alias spellcheck='docker run --rm -it --user \$(id -u):\$(id -g) -v \${BLOG_HOST_DIR}:/src -w /src ghcr.io/streetsidesoftware/cspell:latest lint . --unique --gitignore --quiet --no-progress --config .vscode/cspell.json'
alias tags='python3 .scripts/tags-manager.py'
alias check='pre-commit run --all-files --config .config/.pre-commit-config.yaml'
alias codelint='yarn lint'

eli5() {
    local dir="blog"
    local extra=()
    for arg in "\$@"; do
        case "\$arg" in
            --*) extra+=("\$arg") ;;
            *) dir="\$arg" ;;
        esac
    done
    node scripts/bulk-eli5.mjs --dir "\$dir" "\${extra[@]}"
}

printf "\n🚀 Welcome to your Docusaurus Dev Container!\n\n"
printf "📚 Quick Commands Reference:\n\n"
printf "  ▶️  \033[1;33mbuild\033[0m        Build as a static website (to check if everything is OK)\n"
printf "  ⬆️  \033[1;33mupgrade\033[0m      Upgrade Docusaurus core and plugins to the latest version.\n"
printf "  📦 \033[1;33mversion\033[0m      Show current Docusaurus version.\n"
printf "  🚀 \033[1;33mserve\033[0m        Serve as a static website (don't forget to run 'build' first)\n"
printf "  🟢 \033[1;33mstart\033[0m        Start / Restart Docusaurus.\n"
printf "\n"
printf "  🏷️  \033[1;33mtags\033[0m         Run tags tools.\n"
printf "\n"
printf "  🧹 \033[1;33mlint\033[0m         Lint Markdown files with markdownlint.\n"
printf "  🧑‍💻 \033[1;33mcodelint\033[0m     Lint JS/JSX and CSS with ESLint + stylelint.\n"
printf "  ✍️  \033[1;33mspellcheck\033[0m   Spell check content with cspell.\n"
printf "  🔍 \033[1;33mcheck\033[0m        Run all pre-commit hooks on every file.\n"
printf "\n"
printf "  💡 \033[1;33meli5\033[0m         Generate ELI5 tips (whole blog, or: eli5 blog/2026/07).\n"
printf "\n"


EOF
fi
